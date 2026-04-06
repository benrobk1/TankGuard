import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateComplianceSchedule } from '@/lib/compliance/scheduling';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json({ error: 'facilityId is required' }, { status: 400 });
    }

    const customerId = session.user.customer?.id;

    // Verify facility belongs to customer
    const facility = await prisma.facility.findFirst({
      where: { id: facilityId, customerId },
    });
    if (!facility) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    const tanks = await prisma.tank.findMany({
      where: { facilityId },
      orderBy: { tankNumber: 'asc' },
    });

    return NextResponse.json({ tanks });
  } catch (error) {
    console.error('Tanks GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tanks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const customerId = session.user.customer?.id;
    const body = await request.json();
    const {
      facilityId,
      tankNumber,
      capacityGallons,
      productStored,
      material,
      installationDate,
      leakDetectionMethod,
      spillPreventionType,
      overfillPreventionType,
      corrosionProtectionType,
      hasSecondaryContainment,
      hasContainmentSumps,
    } = body;

    if (!facilityId || !tankNumber || !capacityGallons || !productStored || !material || !leakDetectionMethod) {
      return NextResponse.json(
        { error: 'facilityId, tankNumber, capacityGallons, productStored, material, and leakDetectionMethod are required' },
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

    const tank = await prisma.tank.create({
      data: {
        facilityId,
        tankNumber,
        capacityGallons,
        productStored,
        material,
        installationDate: installationDate ? new Date(installationDate) : null,
        leakDetectionMethod,
        spillPreventionType,
        overfillPreventionType,
        corrosionProtectionType,
        hasSecondaryContainment: hasSecondaryContainment ?? false,
        hasContainmentSumps: hasContainmentSumps ?? false,
      },
    });

    // Regenerate compliance schedule for the facility
    await generateComplianceSchedule(facilityId).catch((err: unknown) => {
      console.error('Failed to generate compliance schedule:', err);
    });

    return NextResponse.json({ tank }, { status: 201 });
  } catch (error) {
    console.error('Tanks POST error:', error);
    return NextResponse.json({ error: 'Failed to create tank' }, { status: 500 });
  }
}
