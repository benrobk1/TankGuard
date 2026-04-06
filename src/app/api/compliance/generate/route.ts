import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateComplianceSchedule } from '@/lib/compliance/scheduling';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { facilityId } = await request.json();

    if (!facilityId) {
      return NextResponse.json({ error: 'facilityId is required' }, { status: 400 });
    }

    const customerId = session.user.customer?.id;

    const facility = await prisma.facility.findFirst({
      where: { id: facilityId, customerId },
    });
    if (!facility) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    await generateComplianceSchedule(facilityId);

    return NextResponse.json({ success: true, message: 'Compliance schedule generated' });
  } catch (error) {
    console.error('Compliance generate error:', error);
    return NextResponse.json({ error: 'Failed to generate compliance schedule' }, { status: 500 });
  }
}
