import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeClient = new Stripe(key, {
      apiVersion: '2025-03-31.basil',
    });
  }
  return stripeClient;
}

// Backwards-compatible proxy so `import { stripe }` still works without
// instantiating the SDK at module load (which breaks Next.js page-data
// collection during build when env vars aren't present).
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: string | symbol) {
    const client = getStripe() as unknown as Record<string | symbol, unknown>;
    return client[prop];
  },
});

export function getPriceId(): string {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    throw new Error('STRIPE_PRICE_ID is not set');
  }
  return priceId;
}

export async function createCheckoutSession(
  customerId: string,
  customerEmail: string,
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return getStripe().checkout.sessions.create({
    customer_email: customerEmail,
    mode: 'subscription',
    allow_promotion_codes: true,
    line_items: [
      {
        price: getPriceId(),
        quantity: 1,
      },
    ],
    metadata: {
      customerId,
    },
    success_url: `${appUrl}/subscribe?checkout=success`,
    cancel_url: `${appUrl}/subscribe?checkout=cancelled`,
  });
}

export async function createPortalSession(stripeCustomerId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${appUrl}/dashboard/settings`,
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return getStripe().subscriptions.cancel(subscriptionId);
}
