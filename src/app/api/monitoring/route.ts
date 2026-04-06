import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const apiSecret = request.headers.get('x-api-secret');

    if (!apiSecret || apiSecret !== process.env.API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalCustomers,
      activeSubscriptions,
      overdueItemsCount,
      onboardingIncompleteCount,
      inactiveCustomers,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({
        where: { status: 'ACTIVE' },
      }),
      prisma.complianceItem.count({
        where: { status: 'OVERDUE' },
      }),
      prisma.customer.count({
        where: { onboardingComplete: false },
      }),
      prisma.customer.count({
        where: {
          updatedAt: { lt: sixtyDaysAgo },
        },
      }),
    ]);

    return NextResponse.json({
      health: 'ok',
      timestamp: new Date().toISOString(),
      metrics: {
        totalCustomers,
        activeSubscriptions,
        overdueItemsCount,
        onboardingIncompleteCount,
        inactiveCustomers,
      },
    });
  } catch (error) {
    console.error('Monitoring error:', error);
    return NextResponse.json({ error: 'Failed to fetch monitoring data' }, { status: 500 });
  }
}
