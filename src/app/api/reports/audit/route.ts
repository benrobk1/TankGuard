import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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

    const { facilityId } = await request.json();

    if (!facilityId) {
      return NextResponse.json({ error: 'facilityId is required' }, { status: 400 });
    }

    // Verify facility belongs to customer
    const facility = await prisma.facility.findFirst({
      where: { id: facilityId, customerId },
      include: {
        state: true,
      },
    });
    if (!facility) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    // Get tank inventory
    const tanks = await prisma.tank.findMany({
      where: { facilityId },
      orderBy: { tankNumber: 'asc' },
    });

    // Get all compliance items with history
    const complianceItems = await prisma.complianceItem.findMany({
      where: { facilityId },
      include: {
        tank: { select: { id: true, tankNumber: true } },
        rule: { select: { id: true, citation: true, inspectionType: true, description: true } },
        documents: { orderBy: { uploadDate: 'desc' } },
      },
      orderBy: { dueDate: 'asc' },
    });

    // Get operator certifications
    const operators = await prisma.operator.findMany({
      where: { facilityId },
      orderBy: { name: 'asc' },
    });

    // Get all documents
    const documents = await prisma.document.findMany({
      where: { facilityId },
      include: {
        tank: { select: { id: true, tankNumber: true } },
      },
      orderBy: { uploadDate: 'desc' },
    });

    // Compliance summary
    const complianceSummary = {
      total: complianceItems.length,
      upcoming: complianceItems.filter((i) => i.status === 'UPCOMING').length,
      dueSoon: complianceItems.filter((i) => i.status === 'DUE_SOON').length,
      overdue: complianceItems.filter((i) => i.status === 'OVERDUE').length,
      completed: complianceItems.filter((i) => i.status === 'COMPLETED').length,
      waived: complianceItems.filter((i) => i.status === 'WAIVED').length,
    };

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      facility,
      tanks,
      complianceSummary,
      complianceItems,
      operators,
      documents,
    });
  } catch (error) {
    console.error('Audit report error:', error);
    return NextResponse.json({ error: 'Failed to generate audit report' }, { status: 500 });
  }
}
