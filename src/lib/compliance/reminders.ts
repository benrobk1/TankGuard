import { prisma } from '@/lib/prisma';
import { sendComplianceReminder, sendOverdueAlert, sendWeeklyDigest as sendWeeklyDigestEmail } from '@/lib/email';

/**
 * Process reminders for compliance items that are due soon or overdue.
 * Creates reminder records and sends emails via nodemailer.
 */
export async function processReminders(): Promise<{ created: number; emailed: number }> {
  const now = new Date();
  const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  let created = 0;
  let emailed = 0;

  // Get items due within various windows that haven't had reminders sent recently
  const items = await prisma.complianceItem.findMany({
    where: {
      status: { in: ['UPCOMING', 'DUE_SOON', 'OVERDUE'] },
      dueDate: { lte: ninetyDays },
    },
    include: {
      facility: {
        include: { customer: { include: { user: true } } },
      },
    },
  });

  // Group items by customer + facility for batched email sending
  const grouped = new Map<string, typeof items>();
  for (const item of items) {
    const key = `${item.facility.customerId}:${item.facilityId}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  for (const [, facilityItems] of grouped) {
    const newReminders: typeof items = [];

    for (const item of facilityItems) {
      const daysUntilDue = Math.ceil((item.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let reminderType: 'NINETY_DAY' | 'SIXTY_DAY' | 'THIRTY_DAY' | 'SEVEN_DAY' | 'OVERDUE';

      if (daysUntilDue < 0) {
        reminderType = 'OVERDUE';
      } else if (daysUntilDue <= 7) {
        reminderType = 'SEVEN_DAY';
      } else if (daysUntilDue <= 30) {
        reminderType = 'THIRTY_DAY';
      } else if (daysUntilDue <= 60) {
        reminderType = 'SIXTY_DAY';
      } else {
        reminderType = 'NINETY_DAY';
      }

      // Check if we already sent this type of reminder
      const existingReminder = await prisma.reminder.findFirst({
        where: {
          complianceItemId: item.id,
          reminderType,
          status: 'SENT',
        },
      });

      if (!existingReminder) {
        await prisma.reminder.create({
          data: {
            complianceItemId: item.id,
            facilityId: item.facilityId,
            customerId: item.facility.customerId,
            reminderType,
            sentDate: now,
            channel: 'BOTH',
            status: 'PENDING',
          },
        });

        await prisma.complianceItem.update({
          where: { id: item.id },
          data: {
            reminderSentCount: { increment: 1 },
            lastReminderSent: now,
          },
        });

        newReminders.push(item);
        created++;
      }
    }

    // Send batched email for this facility's new reminders
    if (newReminders.length > 0) {
      const first = newReminders[0];
      const email = first.facility.customer.user.email;
      const facilityName = first.facility.name;
      const overdueItems = newReminders.filter(
        (i) => i.dueDate.getTime() < now.getTime(),
      );
      const upcomingItems = newReminders.filter(
        (i) => i.dueDate.getTime() >= now.getTime(),
      );

      try {
        // Send overdue alerts individually (they're urgent)
        for (const item of overdueItems) {
          const daysOverdue = Math.ceil(
            (now.getTime() - item.dueDate.getTime()) / (1000 * 60 * 60 * 24),
          );
          await sendOverdueAlert(
            email,
            facilityName,
            item.description,
            item.dueDate.toLocaleDateString('en-US'),
            daysOverdue,
            item.itemType,
          );
          emailed++;
        }

        // Send upcoming items as a batched reminder
        if (upcomingItems.length > 0) {
          await sendComplianceReminder(
            email,
            facilityName,
            upcomingItems.map((i) => ({
              description: i.description,
              dueDate: i.dueDate.toLocaleDateString('en-US'),
              itemType: i.itemType,
            })),
          );
          emailed++;
        }

        // Mark reminders as SENT after successful email
        await prisma.reminder.updateMany({
          where: {
            complianceItemId: { in: newReminders.map((i) => i.id) },
            status: 'PENDING',
          },
          data: { status: 'SENT' },
        });
      } catch (emailError) {
        console.error(`Failed to send email to ${email}:`, emailError);
        // Mark as FAILED so retry logic can pick them up
        await prisma.reminder.updateMany({
          where: {
            complianceItemId: { in: newReminders.map((i) => i.id) },
            status: 'PENDING',
          },
          data: { status: 'FAILED' },
        });
      }
    }
  }

  return { created, emailed };
}

/**
 * Send weekly digest emails to all active customers
 * summarizing their compliance status.
 */
export async function sendWeeklyDigests(): Promise<{ sent: number; failed: number }> {
  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const customers = await prisma.customer.findMany({
    where: {
      status: { in: ['ACTIVE', 'TRIAL'] },
    },
    include: {
      user: true,
      facilities: {
        include: {
          complianceItems: true,
        },
      },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const customer of customers) {
    const allItems = customer.facilities.flatMap((f) => f.complianceItems);

    const dueThisWeek = allItems.filter(
      (i) => i.status !== 'COMPLETED' && i.status !== 'WAIVED' && i.dueDate <= sevenDays && i.dueDate >= now,
    ).length;
    const dueNext30Days = allItems.filter(
      (i) => i.status !== 'COMPLETED' && i.status !== 'WAIVED' && i.dueDate <= thirtyDays && i.dueDate >= now,
    ).length;
    const overdue = allItems.filter((i) => i.status === 'OVERDUE').length;
    const completedThisMonth = allItems.filter(
      (i) => i.status === 'COMPLETED' && i.completedDate && i.completedDate >= startOfMonth,
    ).length;

    if (dueThisWeek === 0 && overdue === 0 && dueNext30Days === 0) continue;

    const total = allItems.length || 1;
    const completed = allItems.filter((i) => i.status === 'COMPLETED').length;
    const complianceScore = Math.round((completed / total) * 100);

    const firstItem = allItems.find(
      (i) => i.status === 'OVERDUE' || i.status === 'DUE_SOON',
    );
    if (!firstItem) continue;

    try {
      await sendWeeklyDigestEmail(
        customer.user.email,
        customer.user.name || customer.companyName,
        { dueThisWeek, dueNext30Days, overdue, completedThisMonth, complianceScore },
      );

      await prisma.reminder.create({
        data: {
          complianceItemId: firstItem.id,
          facilityId: firstItem.facilityId,
          customerId: customer.id,
          reminderType: 'WEEKLY_DIGEST',
          sentDate: now,
          channel: 'EMAIL',
          status: 'SENT',
        },
      });
      sent++;
    } catch (error) {
      console.error(`Weekly digest failed for ${customer.user.email}:`, error);
      await prisma.reminder.create({
        data: {
          complianceItemId: firstItem.id,
          facilityId: firstItem.facilityId,
          customerId: customer.id,
          reminderType: 'WEEKLY_DIGEST',
          sentDate: now,
          channel: 'EMAIL',
          status: 'FAILED',
        },
      });
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Retry failed reminders (called periodically).
 */
export async function retryFailedReminders(): Promise<number> {
  const failedReminders = await prisma.reminder.findMany({
    where: { status: 'FAILED' },
    include: {
      complianceItem: true,
      facility: true,
      customer: { include: { user: true } },
    },
    take: 50,
  });

  let retried = 0;

  for (const reminder of failedReminders) {
    try {
      if (reminder.reminderType === 'OVERDUE') {
        const daysOverdue = Math.ceil(
          (Date.now() - reminder.complianceItem.dueDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        await sendOverdueAlert(
          reminder.customer.user.email,
          reminder.facility.name,
          reminder.complianceItem.description,
          reminder.complianceItem.dueDate.toLocaleDateString('en-US'),
          daysOverdue,
        );
      } else {
        await sendComplianceReminder(
          reminder.customer.user.email,
          reminder.facility.name,
          [{
            description: reminder.complianceItem.description,
            dueDate: reminder.complianceItem.dueDate.toLocaleDateString('en-US'),
          }],
        );
      }

      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { status: 'SENT', sentDate: new Date() },
      });
      retried++;
    } catch {
      // Still failing — leave as FAILED for next retry cycle
    }
  }

  return retried;
}
