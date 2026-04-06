import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateNextOccurrence } from '@/lib/compliance/scheduling';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const customerId = session.user.customer?.id;
    const { complianceItemId, completedBy, notes, documentUrl } = await request.json();

    if (!complianceItemId) {
      return NextResponse.json({ error: 'complianceItemId is required' }, { status: 400 });
    }

    // Verify item belongs to customer
    const existing = await prisma.complianceItem.findFirst({
      where: {
        id: complianceItemId,
        facility: { customerId },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Compliance item not found' }, { status: 404 });
    }

    const item = await prisma.complianceItem.update({
      where: { id: complianceItemId },
      data: {
        status: 'COMPLETED',
        completedDate: new Date(),
        completedBy,
        notes,
        documentUrl,
      },
    });

    // Generate the next occurrence of this recurring item
    await generateNextOccurrence(complianceItemId).catch((err: unknown) => {
      console.error('Failed to generate next occurrence:', err);
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Compliance complete error:', error);
    return NextResponse.json({ error: 'Failed to complete compliance item' }, { status: 500 });
  }
}
