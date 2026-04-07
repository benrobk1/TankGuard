import { prisma } from '@/lib/prisma';

/**
 * Record a compliance score snapshot for all active customers.
 * Called daily by a cron job to build trend history.
 */
export async function recordComplianceSnapshots(): Promise<number> {
  const now = new Date();
  // Set to start of day for consistent daily snapshots
  const snapshotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const customers = await prisma.customer.findMany({
    where: { status: { in: ['ACTIVE', 'TRIAL'] } },
    include: {
      facilities: {
        include: {
          complianceItems: {
            select: { status: true },
          },
        },
      },
    },
  });

  let count = 0;

  for (const customer of customers) {
    // Customer-level aggregate snapshot
    const allItems = customer.facilities.flatMap((f) => f.complianceItems);
    const total = allItems.length;
    const completed = allItems.filter((i) => i.status === 'COMPLETED').length;
    const overdue = allItems.filter((i) => i.status === 'OVERDUE').length;
    const dueSoon = allItems.filter((i) => i.status === 'DUE_SOON').length;
    const upcoming = allItems.filter((i) => i.status === 'UPCOMING').length;
    const score = total > 0 ? Math.round((completed / total) * 100) : 100;

    // Skip if we already have a snapshot for today
    const existing = await prisma.complianceSnapshot.findFirst({
      where: {
        customerId: customer.id,
        facilityId: null,
        snapshotDate,
      },
    });

    if (!existing) {
      await prisma.complianceSnapshot.create({
        data: {
          customerId: customer.id,
          facilityId: null,
          snapshotDate,
          complianceScore: score,
          totalItems: total,
          completedItems: completed,
          overdueItems: overdue,
          dueSoonItems: dueSoon,
          upcomingItems: upcoming,
        },
      });
      count++;
    }

    // Per-facility snapshots
    for (const facility of customer.facilities) {
      const fItems = facility.complianceItems;
      const fTotal = fItems.length;
      const fCompleted = fItems.filter((i) => i.status === 'COMPLETED').length;
      const fOverdue = fItems.filter((i) => i.status === 'OVERDUE').length;
      const fDueSoon = fItems.filter((i) => i.status === 'DUE_SOON').length;
      const fUpcoming = fItems.filter((i) => i.status === 'UPCOMING').length;
      const fScore = fTotal > 0 ? Math.round((fCompleted / fTotal) * 100) : 100;

      const existingFacility = await prisma.complianceSnapshot.findFirst({
        where: {
          customerId: customer.id,
          facilityId: facility.id,
          snapshotDate,
        },
      });

      if (!existingFacility) {
        await prisma.complianceSnapshot.create({
          data: {
            customerId: customer.id,
            facilityId: facility.id,
            snapshotDate,
            complianceScore: fScore,
            totalItems: fTotal,
            completedItems: fCompleted,
            overdueItems: fOverdue,
            dueSoonItems: fDueSoon,
            upcomingItems: fUpcoming,
          },
        });
        count++;
      }
    }
  }

  return count;
}

/**
 * Get compliance trend data for a customer over a date range.
 */
export async function getComplianceTrend(
  customerId: string,
  facilityId?: string | null,
  days: number = 90,
) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const snapshots = await prisma.complianceSnapshot.findMany({
    where: {
      customerId,
      facilityId: facilityId || null,
      snapshotDate: { gte: since },
    },
    orderBy: { snapshotDate: 'asc' },
    select: {
      snapshotDate: true,
      complianceScore: true,
      totalItems: true,
      completedItems: true,
      overdueItems: true,
      dueSoonItems: true,
      upcomingItems: true,
    },
  });

  return snapshots.map((s) => ({
    date: s.snapshotDate.toISOString().split('T')[0],
    score: s.complianceScore,
    total: s.totalItems,
    completed: s.completedItems,
    overdue: s.overdueItems,
    dueSoon: s.dueSoonItems,
    upcoming: s.upcomingItems,
  }));
}
