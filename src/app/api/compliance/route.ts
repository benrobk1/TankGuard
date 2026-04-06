import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Prisma } from '@/generated/prisma';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const customerId = session.user.customer?.id;
    if (!customerId) {
      return NextResponse.json({ error: 'No customer profile' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const status = searchParams.get('status');
    const itemType = searchParams.get('itemType');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ComplianceItemWhereInput = {
      facility: { customerId },
    };

    if (facilityId) where.facilityId = facilityId;
    if (status) where.status = status as Prisma.EnumComplianceStatusFilter['equals'];
    if (itemType) where.itemType = itemType as Prisma.EnumComplianceItemTypeFilter['equals'];

    const [items, total] = await Promise.all([
      prisma.complianceItem.findMany({
        where,
        include: {
          facility: { select: { id: true, name: true } },
          tank: { select: { id: true, tankNumber: true } },
          rule: { select: { id: true, citation: true, inspectionType: true } },
        },
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.complianceItem.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Compliance GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch compliance items' }, { status: 500 });
  }
}
