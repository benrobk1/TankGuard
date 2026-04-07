import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getComplianceTrend } from '@/lib/compliance/snapshots';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const customerId = session.user.customer?.id;
    if (!customerId) {
      return NextResponse.json({ error: 'No customer profile' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId') || undefined;
    const days = parseInt(searchParams.get('days') || '90', 10);

    const trend = await getComplianceTrend(customerId, facilityId, days);

    return NextResponse.json({ trend });
  } catch (error) {
    console.error('Compliance trend error:', error);
    return NextResponse.json({ error: 'Failed to fetch trend data' }, { status: 500 });
  }
}
