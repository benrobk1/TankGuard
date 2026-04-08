/**
 * System health monitoring for TankGuard.
 * Tracks customer engagement, compliance status, and system health.
 */

import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

/**
 * Check for customers who signed up but didn't complete onboarding within 7 days.
 * Sends a help email to nudge them to complete setup.
 */
export async function checkOnboardingCompletion(): Promise<{ flagged: number; emailed: number }> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const incompleteCustomers = await prisma.customer.findMany({
    where: {
      onboardingComplete: false,
      createdAt: { lte: sevenDaysAgo },
    },
    include: { user: true },
  });

  let emailed = 0;
  for (const customer of incompleteCustomers) {
    try {
      await sendEmail(
        customer.email,
        'Need help setting up TankGuard?',
        `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${customer.user.name || 'there'},</h2>
          <p>We noticed you signed up for TankGuard but haven't finished setting up your facility yet.</p>
          <p>Setting up takes just 5 minutes:</p>
          <ol>
            <li>Add your facility address</li>
            <li>Enter your tank details (we have smart defaults for most gas stations)</li>
            <li>TankGuard generates your complete compliance schedule</li>
          </ol>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">Complete Setup</a></p>
          <p>Need help? Just reply to this email.</p>
          <p>— The TankGuard Team</p>
        </div>
        `
      );
      emailed++;
    } catch (error) {
      console.error(`Failed to send onboarding email to ${customer.email}:`, error);
    }
  }

  await prisma.systemEvent.create({
    data: {
      eventType: 'ONBOARDING_CHECK',
      severity: 'INFO',
      message: `Onboarding check: ${incompleteCustomers.length} incomplete, ${emailed} emailed`,
      metadata: { flagged: incompleteCustomers.length, emailed },
    },
  });

  return { flagged: incompleteCustomers.length, emailed };
}

/**
 * Check for documents approaching their expiration date.
 * Creates new compliance items for expiring documents.
 */
export async function checkDocumentExpirations(): Promise<{ expiring: number; created: number }> {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringDocs = await prisma.document.findMany({
    where: {
      expirationDate: {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      },
    },
    include: { facility: true },
  });

  let created = 0;
  for (const doc of expiringDocs) {
    // Check if a compliance item already exists for this document expiration
    const existing = await prisma.complianceItem.findFirst({
      where: {
        facilityId: doc.facilityId,
        description: { contains: doc.fileName },
        status: { not: 'COMPLETED' },
      },
    });

    if (!existing) {
      // Find a generic documentation rule to link to
      const rule = await prisma.complianceRule.findFirst({
        where: { category: 'DOCUMENTATION', isActive: true },
      });

      if (rule) {
        await prisma.complianceItem.create({
          data: {
            facilityId: doc.facilityId,
            tankId: doc.tankId,
            ruleId: rule.id,
            itemType: 'DOCUMENTATION',
            description: `Document expiring: ${doc.fileName} (${doc.documentType.replace(/_/g, ' ')})`,
            dueDate: doc.expirationDate!,
            status: 'DUE_SOON',
          },
        });
        created++;
      }
    }
  }

  return { expiring: expiringDocs.length, created };
}

/**
 * Check for inactive customers (no login or document upload in 60 days).
 */
export async function checkCustomerInactivity(): Promise<{ inactive: number }> {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const inactiveCustomers = await prisma.customer.findMany({
    where: {
      status: 'ACTIVE',
      updatedAt: { lte: sixtyDaysAgo },
    },
    include: { user: true },
  });

  for (const customer of inactiveCustomers) {
    await prisma.systemEvent.create({
      data: {
        eventType: 'CUSTOMER_INACTIVE',
        severity: 'WARNING',
        message: `Customer ${customer.companyName} (${customer.email}) inactive for 60+ days`,
        metadata: {
          customerId: customer.id,
          lastActivity: customer.updatedAt.toISOString(),
        },
      },
    });
  }

  return { inactive: inactiveCustomers.length };
}

/**
 * Get full system health report.
 */
export async function getSystemHealth() {
  const [
    totalCustomers,
    activeSubscriptions,
    pendingCustomers,
    totalFacilities,
    totalTanks,
    overdueItems,
    dueSoonItems,
    incompleteOnboarding,
    recentEvents,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { status: 'ACTIVE' } }),
    prisma.customer.count({ where: { status: 'PENDING' } }),
    prisma.facility.count(),
    prisma.tank.count(),
    prisma.complianceItem.count({ where: { status: 'OVERDUE' } }),
    prisma.complianceItem.count({ where: { status: 'DUE_SOON' } }),
    prisma.customer.count({ where: { onboardingComplete: false } }),
    prisma.systemEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return {
    customers: {
      total: totalCustomers,
      active: activeSubscriptions,
      pending: pendingCustomers,
      incompleteOnboarding,
    },
    facilities: {
      total: totalFacilities,
      totalTanks,
    },
    compliance: {
      overdue: overdueItems,
      dueSoon: dueSoonItems,
    },
    recentEvents,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Run all monitoring checks. Designed to be called by a cron job.
 */
export async function runAllMonitoringChecks() {
  const results = {
    onboarding: await checkOnboardingCompletion(),
    documentExpirations: await checkDocumentExpirations(),
    inactivity: await checkCustomerInactivity(),
    timestamp: new Date().toISOString(),
  };

  await prisma.systemEvent.create({
    data: {
      eventType: 'MONITORING_RUN',
      severity: 'INFO',
      message: 'Completed all monitoring checks',
      metadata: results as any,
    },
  });

  return results;
}
