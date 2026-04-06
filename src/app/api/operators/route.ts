import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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

    const facility = await prisma.facility.findFirst({
      where: { id: facilityId, customerId },
    });
    if (!facility) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    const operators = await prisma.operator.findMany({
      where: { facilityId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ operators });
  } catch (error) {
    console.error('Operators GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch operators' }, { status: 500 });
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
      name,
      operatorClass,
      certificationDate,
      certificationExpiration,
      trainingProvider,
      certificateUrl,
      email,
      phone,
    } = body;

    if (!facilityId || !name || !operatorClass) {
      return NextResponse.json(
        { error: 'facilityId, name, and operatorClass are required' },
        { status: 400 },
      );
    }

    const facility = await prisma.facility.findFirst({
      where: { id: facilityId, customerId },
    });
    if (!facility) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    const operator = await prisma.operator.create({
      data: {
        facilityId,
        name,
        operatorClass,
        certificationDate: certificationDate ? new Date(certificationDate) : null,
        certificationExpiration: certificationExpiration ? new Date(certificationExpiration) : null,
        trainingProvider,
        certificateUrl,
        email,
        phone,
      },
    });

    return NextResponse.json({ operator }, { status: 201 });
  } catch (error) {
    console.error('Operators POST error:', error);
    return NextResponse.json({ error: 'Failed to create operator' }, { status: 500 });
  }
}
