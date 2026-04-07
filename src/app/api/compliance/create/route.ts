import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/**
 * POST /api/compliance/create
 * Create an ad-hoc compliance item for one-time/event-triggered rules
 * (e.g., tank closure, installation certification, owner change notification).
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const customerId = session.user.customer?.id;
    if (!customerId) {
      return NextResponse.json({ error: 'No customer profile' }, { status: 400 });
    }

    const { facilityId, tankId, ruleId, description, dueDate, itemType } = await request.json();

    if (!facilityId || !description || !dueDate || !itemType) {
      return NextResponse.json(
        { error: 'facilityId, description, dueDate, and itemType are required' },
        { status: 400 },
      );
    }

    const validTypes = ['INSPECTION', 'TEST', 'CERTIFICATION', 'TRAINING', 'DOCUMENTATION', 'REPORTING', 'FINANCIAL', 'CLOSURE'];
    if (!validTypes.includes(itemType)) {
      return NextResponse.json(
        { error: `Invalid itemType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 },
      );
    }

    // Verify facility belongs to customer
    const facility = await prisma.facility.findFirst({
      where: { id: facilityId, customerId },
    });
    if (!facility) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    // Verify tank belongs to facility (if provided)
    if (tankId) {
      const tank = await prisma.tank.findFirst({
        where: { id: tankId, facilityId },
      });
      if (!tank) {
        return NextResponse.json({ error: 'Tank not found in this facility' }, { status: 404 });
      }
    }

    const item = await prisma.complianceItem.create({
      data: {
        facilityId,
        tankId: tankId || null,
        ruleId: ruleId || null,
        itemType,
        description,
        dueDate: new Date(dueDate),
        status: 'UPCOMING',
      },
      include: {
        facility: { select: { id: true, name: true } },
        tank: { select: { id: true, tankNumber: true } },
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Compliance create error:', error);
    return NextResponse.json({ error: 'Failed to create compliance item' }, { status: 500 });
  }
}
