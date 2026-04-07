import { NextResponse } from 'next/server';
import { recordComplianceSnapshots } from '@/lib/compliance/snapshots';

export async function POST(request: Request) {
  try {
    const apiSecret = request.headers.get('x-api-secret');

    if (!apiSecret || apiSecret !== process.env.API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const count = await recordComplianceSnapshots();

    return NextResponse.json({ success: true, snapshotsRecorded: count });
  } catch (error) {
    console.error('Snapshot recording error:', error);
    return NextResponse.json({ error: 'Failed to record snapshots' }, { status: 500 });
  }
}
