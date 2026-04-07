import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { pickAllowedFields, complianceUpdateFields } from '@/lib/validations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const customerId = session.user.customer?.id;

    const item = await prisma.complianceItem.findFirst({
      where: {
        id,
        facility: { customerId },
      },
      include: {
        facility: { select: { id: true, name: true } },
        tank: { select: { id: true, tankNumber: true } },
        rule: true,
        documents: { orderBy: { uploadDate: 'desc' } },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Compliance item not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Compliance item GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch compliance item' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const customerId = session.user.customer?.id;

    const existing = await prisma.complianceItem.findFirst({
      where: { id, facility: { customerId } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Compliance item not found' }, { status: 404 });
    }

    const body = await request.json();
    const data = pickAllowedFields(body, complianceUpdateFields);
    if (data.dueDate) {
      const parsed = new Date(data.dueDate as string);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json({ error: 'Invalid dueDate' }, { status: 400 });
      }
      data.dueDate = parsed;
    }
    if (data.completedDate) {
      const parsed = new Date(data.completedDate as string);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json({ error: 'Invalid completedDate' }, { status: 400 });
      }
      data.completedDate = parsed;
    }

    const item = await prisma.complianceItem.update({
      where: { id },
      data,
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Compliance item PUT error:', error);
    return NextResponse.json({ error: 'Failed to update compliance item' }, { status: 500 });
  }
}
