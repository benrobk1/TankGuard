/**
 * Grandfathered $99 checkout.
 *
 * The public pricing page does NOT link to this route. It exists so that a
 * customer who was on the legacy single-plan pre-tier-rebuild and who has
 * since lapsed can be sent a direct link by support and re-subscribe at the
 * original price without creating a new Stripe Product.
 *
 * Access control is the session cookie: the customer must be authenticated.
 * Support staff mint the link by logging in as the customer (impersonation
 * flow owned by the admin dashboard, out of scope here).
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createLegacyCheckoutSession, getLegacyPriceId } from '@/lib/stripe';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!getLegacyPriceId()) {
      return NextResponse.json(
        { error: 'Legacy plan not configured' },
        { status: 404 },
      );
    }

    const customer = session.user.customer;
    if (!customer) {
      return NextResponse.json({ error: 'No customer profile' }, { status: 400 });
    }

    const checkoutSession = await createLegacyCheckoutSession(
      customer.id,
      customer.email,
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe legacy checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
