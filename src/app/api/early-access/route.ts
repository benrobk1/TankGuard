import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, name, tankCount, state } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if already signed up
    const existing = await prisma.earlyAccessSignup.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json({ success: true, message: 'Already registered for early access' });
    }

    await prisma.earlyAccessSignup.create({
      data: {
        email,
        name: name || null,
        tankCount: tankCount ? parseInt(tankCount, 10) : null,
        state: state || null,
      },
    });

    return NextResponse.json({ success: true, message: 'Successfully registered for early access' });
  } catch (error) {
    console.error('Early access signup error:', error);
    return NextResponse.json({ error: 'Failed to register for early access' }, { status: 500 });
  }
}
