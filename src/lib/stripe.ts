import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export const PRICE_ID = process.env.STRIPE_PRICE_ID!;

export async function createCheckoutSession(
  customerId: string,
  customerEmail: string,
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return stripe.checkout.sessions.create({
    customer_email: customerEmail,
    mode: 'subscription',
    allow_promotion_codes: true,
    line_items: [
      {
        price: PRICE_ID,
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

  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${appUrl}/dashboard/settings`,
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId);
}
