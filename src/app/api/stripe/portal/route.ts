import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createPortalSession } from '@/lib/stripe';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const customer = session.user.customer;
    if (!customer) {
      return NextResponse.json({ error: 'No customer profile' }, { status: 400 });
    }

    if (!customer.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 },
      );
    }

    const portalSession = await createPortalSession(customer.stripeCustomerId);

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}
