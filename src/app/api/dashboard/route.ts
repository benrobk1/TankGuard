import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const customerId = session.user.customer?.id;
    if (!customerId) {
      return NextResponse.json({ error: 'No customer profile' }, { status: 400 });
    }

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get all facilities with compliance data
    const facilities = await prisma.facility.findMany({
      where: { customerId },
      include: {
        state: true,
        _count: { select: { tanks: true } },
        complianceItems: {
          select: { status: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Compliance summary across all facilities
    const allComplianceItems = await prisma.complianceItem.findMany({
      where: { facility: { customerId } },
      select: { status: true },
    });

    const complianceSummary = {
      total: allComplianceItems.length,
      upcoming: allComplianceItems.filter((i) => i.status === 'UPCOMING').length,
      dueSoon: allComplianceItems.filter((i) => i.status === 'DUE_SOON').length,
      overdue: allComplianceItems.filter((i) => i.status === 'OVERDUE').length,
      completed: allComplianceItems.filter((i) => i.status === 'COMPLETED').length,
    };

    // Upcoming items (next 7 days)
    const upcomingItems = await prisma.complianceItem.findMany({
      where: {
        facility: { customerId },
        status: { in: ['UPCOMING', 'DUE_SOON'] },
        dueDate: { gte: now, lte: sevenDaysFromNow },
      },
      include: {
        facility: { select: { id: true, name: true } },
        tank: { select: { id: true, tankNumber: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    // Overdue items
    const overdueItems = await prisma.complianceItem.findMany({
      where: {
        facility: { customerId },
        status: 'OVERDUE',
      },
      include: {
        facility: { select: { id: true, name: true } },
        tank: { select: { id: true, tankNumber: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    // Recent completions
    const recentCompletions = await prisma.complianceItem.findMany({
      where: {
        facility: { customerId },
        status: 'COMPLETED',
        completedDate: { not: null },
      },
      include: {
        facility: { select: { id: true, name: true } },
        tank: { select: { id: true, tankNumber: true } },
      },
      orderBy: { completedDate: 'desc' },
      take: 10,
    });

    // Format facility list with statuses
    const facilityList = facilities.map((facility) => {
      const summary = {
        total: facility.complianceItems.length,
        upcoming: facility.complianceItems.filter((i) => i.status === 'UPCOMING').length,
        dueSoon: facility.complianceItems.filter((i) => i.status === 'DUE_SOON').length,
        overdue: facility.complianceItems.filter((i) => i.status === 'OVERDUE').length,
        completed: facility.complianceItems.filter((i) => i.status === 'COMPLETED').length,
      };
      const { complianceItems, ...rest } = facility;
      return {
        ...rest,
        tankCount: facility._count.tanks,
        complianceSummary: summary,
      };
    });

    const totalItems = allComplianceItems.length || 1;
    const completedCount = complianceSummary.completed;
    const complianceScore = Math.round((completedCount / totalItems) * 100);

    return NextResponse.json({
      summary: {
        totalFacilities: facilities.length,
        totalTanks: facilities.reduce((sum, f) => sum + f._count.tanks, 0),
        totalItems: allComplianceItems.length,
        ...complianceSummary,
        complianceScore,
      },
      upcomingItems,
      overdueItems,
      recentCompletions,
      facilities: facilityList,
    });
  } catch (error) {
    console.error('Dashboard GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
