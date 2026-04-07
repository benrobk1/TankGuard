import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { pickAllowedFields, facilityUpdateFields } from '@/lib/validations';

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

    const facility = await prisma.facility.findFirst({
      where: { id, customerId },
      include: {
        state: true,
        tanks: true,
        operators: true,
        complianceItems: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!facility) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    return NextResponse.json({ facility });
  } catch (error) {
    console.error('Facility GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch facility' }, { status: 500 });
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

    const existing = await prisma.facility.findFirst({
      where: { id, customerId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    const body = await request.json();
    const facility = await prisma.facility.update({
      where: { id },
      data: pickAllowedFields(body, facilityUpdateFields),
      include: { state: true },
    });

    return NextResponse.json({ facility });
  } catch (error) {
    console.error('Facility PUT error:', error);
    return NextResponse.json({ error: 'Failed to update facility' }, { status: 500 });
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

    const existing = await prisma.facility.findFirst({
      where: { id, customerId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    await prisma.facility.delete({ where: { id } });

    await prisma.customer.update({
      where: { id: customerId },
      data: { facilityCount: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Facility DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete facility' }, { status: 500 });
  }
}
