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
    const tankId = searchParams.get('tankId');
    const documentType = searchParams.get('documentType');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {
      facility: { customerId },
    };

    if (facilityId) where.facilityId = facilityId;
    if (tankId) where.tankId = tankId;
    if (documentType) where.documentType = documentType as Prisma.EnumDocumentTypeFilter['equals'];

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          facility: { select: { id: true, name: true } },
          tank: { select: { id: true, tankNumber: true } },
          complianceItem: { select: { id: true, description: true } },
        },
        orderBy: { uploadDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.document.count({ where }),
    ]);

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Documents GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}
