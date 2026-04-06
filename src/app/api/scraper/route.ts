import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiSecret = request.headers.get('x-api-secret');

    if (!apiSecret || apiSecret !== process.env.API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { state } = await request.json();

    if (!state) {
      return NextResponse.json({ error: 'state is required' }, { status: 400 });
    }

    // Placeholder for state database scraper
    // Actual scraping logic lives in lib/scraper
    return NextResponse.json({
      success: true,
      message: `Scraper initiated for state: ${state.toUpperCase()}. Actual scraping logic is implemented in lib/scraper.`,
      state: state.toUpperCase(),
    });
  } catch (error) {
    console.error('Scraper error:', error);
    return NextResponse.json({ error: 'Failed to initiate scraper' }, { status: 500 });
  }
}
