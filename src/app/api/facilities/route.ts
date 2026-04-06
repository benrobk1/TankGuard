import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateComplianceSchedule } from '@/lib/compliance/scheduling';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const customerId = session.user.customer?.id;
    if (!customerId) {
      return NextResponse.json({ error: 'No customer profile' }, { status: 400 });
    }

    const facilities = await prisma.facility.findMany({
      where: { customerId },
      include: {
        state: true,
        _count: {
          select: { tanks: true },
        },
        complianceItems: {
          select: {
            status: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result = facilities.map((facility) => {
      const complianceSummary = {
        total: facility.complianceItems.length,
        upcoming: facility.complianceItems.filter((i) => i.status === 'UPCOMING').length,
        dueSoon: facility.complianceItems.filter((i) => i.status === 'DUE_SOON').length,
        overdue: facility.complianceItems.filter((i) => i.status === 'OVERDUE').length,
        completed: facility.complianceItems.filter((i) => i.status === 'COMPLETED').length,
      };
      const { complianceItems, ...rest } = facility;
      return { ...rest, tankCount: facility._count.tanks, complianceSummary };
    });

    return NextResponse.json({ facilities: result });
  } catch (error) {
    console.error('Facilities GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 500 });
  }
}

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

    const body = await request.json();
    const {
      name,
      address,
      city,
      stateId,
      zip,
      registrationNumber,
      facilityType,
      contactName,
      contactPhone,
      contactEmail,
    } = body;

    if (!name || !address || !city || !stateId || !zip) {
      return NextResponse.json(
        { error: 'Name, address, city, state, and zip are required' },
        { status: 400 },
      );
    }

    const facility = await prisma.facility.create({
      data: {
        customerId,
        name,
        address,
        city,
        stateId,
        zip,
        registrationNumber,
        facilityType,
        contactName,
        contactPhone,
        contactEmail,
      },
      include: { state: true },
    });

    // Update facility count on customer
    await prisma.customer.update({
      where: { id: customerId },
      data: { facilityCount: { increment: 1 } },
    });

    // Generate compliance schedule for the new facility
    await generateComplianceSchedule(facility.id).catch((err: unknown) => {
      console.error('Failed to generate compliance schedule:', err);
    });

    return NextResponse.json({ facility }, { status: 201 });
  } catch (error) {
    console.error('Facilities POST error:', error);
    return NextResponse.json({ error: 'Failed to create facility' }, { status: 500 });
  }
}
