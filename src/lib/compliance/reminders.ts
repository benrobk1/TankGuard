import { prisma } from '@/lib/prisma';

/**
 * Process reminders for compliance items that are due soon or overdue.
 * Creates reminder records and returns the count of reminders processed.
 */
export async function processReminders(): Promise<number> {
  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  let count = 0;

  // Get items due within various windows that haven't had reminders sent recently
  const items = await prisma.complianceItem.findMany({
    where: {
      status: { in: ['UPCOMING', 'DUE_SOON', 'OVERDUE'] },
      dueDate: { lte: ninetyDays },
    },
    include: {
      facility: {
        include: { customer: true },
      },
    },
  });

  for (const item of items) {
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
          status: 'SENT',
        },
      });

      // Update reminder count on the compliance item
      await prisma.complianceItem.update({
        where: { id: item.id },
        data: {
          reminderSentCount: { increment: 1 },
          lastReminderSent: now,
        },
      });

      count++;
    }
  }

  return count;
}

/**
 * Send weekly digest emails to all active customers
 * summarizing their compliance status.
 */
export async function sendWeeklyDigests(): Promise<number> {
  const customers = await prisma.customer.findMany({
    where: {
      status: { in: ['ACTIVE', 'TRIAL'] },
    },
    include: {
      user: true,
      facilities: {
        include: {
          complianceItems: {
            where: {
              status: { in: ['DUE_SOON', 'OVERDUE'] },
            },
          },
        },
      },
    },
  });

  let count = 0;

  for (const customer of customers) {
    const totalDueSoon = customer.facilities.reduce(
      (sum, f) => sum + f.complianceItems.filter((i) => i.status === 'DUE_SOON').length,
      0,
    );
    const totalOverdue = customer.facilities.reduce(
      (sum, f) => sum + f.complianceItems.filter((i) => i.status === 'OVERDUE').length,
      0,
    );

    if (totalDueSoon > 0 || totalOverdue > 0) {
      // In production, this would send an actual email via the email service.
      // For now, we create reminder records for tracking.
      const firstItem = customer.facilities
        .flatMap((f) => f.complianceItems)
        .find((i) => i.status === 'OVERDUE' || i.status === 'DUE_SOON');

      if (firstItem) {
        await prisma.reminder.create({
          data: {
            complianceItemId: firstItem.id,
            facilityId: firstItem.facilityId,
            customerId: customer.id,
            reminderType: 'WEEKLY_DIGEST',
            sentDate: new Date(),
            channel: 'EMAIL',
            status: 'SENT',
          },
        });
      }
      count++;
    }
  }

  return count;
}
