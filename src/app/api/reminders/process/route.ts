import { NextResponse } from 'next/server';
import { processReminders, sendWeeklyDigests, retryFailedReminders } from '@/lib/compliance/reminders';

export async function POST(request: Request) {
  try {
    const apiSecret = request.headers.get('x-api-secret');

    if (!process.env.API_SECRET || !apiSecret || apiSecret !== process.env.API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'process';

    switch (action) {
      case 'process': {
        const result = await processReminders();
        return NextResponse.json({ success: true, ...result });
      }
      case 'digest': {
        const result = await sendWeeklyDigests();
        return NextResponse.json({ success: true, ...result });
      }
      case 'retry': {
        const retried = await retryFailedReminders();
        return NextResponse.json({ success: true, retried });
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Process reminders error:', error);
    return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 });
  }
}
