import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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
    if (body.certificationDate) {
      body.certificationDate = new Date(body.certificationDate);
    }
    if (body.certificationExpiration) {
      body.certificationExpiration = new Date(body.certificationExpiration);
    }

    const operator = await prisma.operator.update({
      where: { id },
      data: body,
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
