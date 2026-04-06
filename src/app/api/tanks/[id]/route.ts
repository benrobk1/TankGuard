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

    const tank = await prisma.tank.findFirst({
      where: {
        id,
        facility: { customerId },
      },
      include: {
        facility: { select: { id: true, name: true } },
        complianceItems: { orderBy: { dueDate: 'asc' } },
        documents: { orderBy: { uploadDate: 'desc' } },
      },
    });

    if (!tank) {
      return NextResponse.json({ error: 'Tank not found' }, { status: 404 });
    }

    return NextResponse.json({ tank });
  } catch (error) {
    console.error('Tank GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tank' }, { status: 500 });
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

    const existing = await prisma.tank.findFirst({
      where: { id, facility: { customerId } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Tank not found' }, { status: 404 });
    }

    const body = await request.json();
    if (body.installationDate) {
      body.installationDate = new Date(body.installationDate);
    }

    const tank = await prisma.tank.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ tank });
  } catch (error) {
    console.error('Tank PUT error:', error);
    return NextResponse.json({ error: 'Failed to update tank' }, { status: 500 });
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

    const existing = await prisma.tank.findFirst({
      where: { id, facility: { customerId } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Tank not found' }, { status: 404 });
    }

    await prisma.tank.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tank DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete tank' }, { status: 500 });
  }
}
