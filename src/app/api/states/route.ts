import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const states = await prisma.state.findMany({
      select: { id: true, abbreviation: true, name: true, regulatoryAgency: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(states);
  } catch (error) {
    console.error('Failed to fetch states:', error);
    return NextResponse.json({ error: 'Failed to fetch states' }, { status: 500 });
  }
}
