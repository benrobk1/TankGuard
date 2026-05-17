import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createCheckoutSession, isPricingTier } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const customer = session.user.customer;
    if (!customer) {
      return NextResponse.json({ error: 'No customer profile' }, { status: 400 });
    }

    let tier: 'starter' | 'growth' | 'scale' = 'starter';
    try {
      const body = await request.json().catch(() => ({}));
      if (isPricingTier(body?.tier)) {
        tier = body.tier;
      }
    } catch {
      // Body is optional; fall back to starter.
    }

    const checkoutSession = await createCheckoutSession(
      customer.id,
      customer.email,
      tier,
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
