import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { pickAllowedFields, operatorUpdateFields } from '@/lib/validations';

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

    const operator = await prisma.operator.findFirst({
      where: { id, facility: { customerId } },
      include: {
        facility: { select: { id: true, name: true } },
      },
    });

    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
    }

    return NextResponse.json({ operator });
  } catch (error) {
    console.error('Operator GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch operator' }, { status: 500 });
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

    const existing = await prisma.operator.findFirst({
      where: { id, facility: { customerId } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
    }

    const body = await request.json();
    const data = pickAllowedFields(body, operatorUpdateFields);
    if (data.certificationDate) {
      const parsed = new Date(data.certificationDate as string);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json({ error: 'Invalid certificationDate' }, { status: 400 });
      }
      data.certificationDate = parsed;
    }
    if (data.certificationExpiration) {
      const parsed = new Date(data.certificationExpiration as string);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json({ error: 'Invalid certificationExpiration' }, { status: 400 });
      }
      data.certificationExpiration = parsed;
    }

    const operator = await prisma.operator.update({
      where: { id },
      data,
    });

    return NextResponse.json({ operator });
  } catch (error) {
    console.error('Operator PUT error:', error);
    return NextResponse.json({ error: 'Failed to update operator' }, { status: 500 });
  }
}

export async function DELETE(
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

    const existing = await prisma.operator.findFirst({
      where: { id, facility: { customerId } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
    }

    await prisma.operator.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Operator DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete operator' }, { status: 500 });
  }
}
