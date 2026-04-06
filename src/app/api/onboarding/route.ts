import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const customer = session.user.customer;
    if (!customer) {
      return NextResponse.json({ error: 'No customer profile' }, { status: 400 });
    }

    // Determine what's been completed based on current step
    const completedSteps: Record<number, string> = {
      1: 'Account created',
      2: 'Company profile set up',
      3: 'First facility added',
      4: 'Tanks configured',
      5: 'Operators assigned',
      6: 'Compliance schedule reviewed',
    };

    const completed: string[] = [];
    for (let i = 1; i < customer.onboardingStep; i++) {
      if (completedSteps[i]) {
        completed.push(completedSteps[i]);
      }
    }

    return NextResponse.json({
      currentStep: customer.onboardingStep,
      onboardingComplete: customer.onboardingComplete,
      completed,
      totalSteps: 6,
    });
  } catch (error) {
    console.error('Onboarding GET error:', error);
    return NextResponse.json({ error: 'Failed to get onboarding state' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const customer = session.user.customer;
    if (!customer) {
      return NextResponse.json({ error: 'No customer profile' }, { status: 400 });
    }

    const { step } = await request.json();

    if (typeof step !== 'number' || step < 1) {
      return NextResponse.json({ error: 'Valid step number is required' }, { status: 400 });
    }

    const onboardingComplete = step > 6;

    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        onboardingStep: step,
        onboardingComplete,
      },
    });

    return NextResponse.json({
      currentStep: updated.onboardingStep,
      onboardingComplete: updated.onboardingComplete,
    });
  } catch (error) {
    console.error('Onboarding PUT error:', error);
    return NextResponse.json({ error: 'Failed to update onboarding step' }, { status: 500 });
  }
}
