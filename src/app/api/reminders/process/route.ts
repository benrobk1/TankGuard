import { NextResponse } from 'next/server';
import { processReminders } from '@/lib/compliance/reminders';

export async function POST(request: Request) {
  try {
    const apiSecret = request.headers.get('x-api-secret');

    if (!apiSecret || apiSecret !== process.env.API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await processReminders();

    return NextResponse.json({
      success: true,
      count: result,
    });
  } catch (error) {
    console.error('Process reminders error:', error);
    return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 });
  }
}
