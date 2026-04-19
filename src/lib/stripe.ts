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

/**
 * Pricing tiers introduced by the Saastudio pricing rebuild. Keys map 1:1
 * to Stripe Price IDs set in env (STRIPE_PRICE_ID_TIER_STARTER,
 * STRIPE_PRICE_ID_TIER_GROWTH, STRIPE_PRICE_ID_TIER_SCALE). The legacy
 * STRIPE_PRICE_ID is kept for grandfathered single-plan subscribers —
 * the checkout API won't select it for new subs, but existing Stripe
 * subscriptions keep billing against it until the customer upgrades.
 */
export type PricingTier = 'starter' | 'growth' | 'scale';

export interface TierDefinition {
  id: PricingTier;
  displayName: string;
  monthlyPriceUSD: number;
  maxSites: number;
  supportLevel: string;
  highlights: string[];
}

export const TIERS: Record<PricingTier, TierDefinition> = {
  starter: {
    id: 'starter',
    displayName: 'Starter',
    monthlyPriceUSD: 99,
    maxSites: 1,
    supportLevel: 'Email support',
    highlights: [
      '1 facility',
      'All 50 states + federal EPA rules',
      'Escalating email reminders',
      'Document vault',
      'Audit-ready reports',
    ],
  },
  growth: {
    id: 'growth',
    displayName: 'Growth',
    monthlyPriceUSD: 499,
    maxSites: 10,
    supportLevel: 'Priority email support',
    highlights: [
      'Up to 10 facilities',
      'Everything in Starter',
      'Priority email support',
      'Multi-site compliance dashboard',
      'Bulk document upload',
    ],
  },
  scale: {
    id: 'scale',
    displayName: 'Scale',
    monthlyPriceUSD: 1499,
    maxSites: 50,
    supportLevel: 'Priority support + dedicated onboarding',
    highlights: [
      'Up to 50 facilities',
      'Everything in Growth',
      'Dedicated onboarding specialist',
      'Quarterly compliance review calls',
      'SSO + custom user roles',
    ],
  },
};

export const TIER_ORDER: PricingTier[] = ['starter', 'growth', 'scale'];

export function isPricingTier(value: unknown): value is PricingTier {
  return value === 'starter' || value === 'growth' || value === 'scale';
}

function tierEnvVar(tier: PricingTier): string {
  return `STRIPE_PRICE_ID_TIER_${tier.toUpperCase()}`;
}

export function getTierPriceId(tier: PricingTier): string {
  const envName = tierEnvVar(tier);
  const priceId = process.env[envName];
  if (!priceId) {
    throw new Error(
      `${envName} is not set. Create a Stripe Price for the ${tier} tier and add the ID to env.`,
    );
  }
  return priceId;
}

/**
 * Legacy single-plan price ID. Still honored on the webhook side so
 * grandfathered subscribers continue to bill correctly, but the checkout
 * flow will not select it for new customers.
 */
export function getLegacyPriceId(): string | null {
  return process.env.STRIPE_PRICE_ID ?? null;
}

export function isLegacyPriceId(priceId: string | null | undefined): boolean {
  if (!priceId) return false;
  return priceId === getLegacyPriceId();
}

/**
 * Legacy alias retained for callers not yet migrated to getTierPriceId().
 * New code should pass an explicit PricingTier.
 * @deprecated — use getTierPriceId(tier)
 */
export function getPriceId(): string {
  return getTierPriceId('starter');
}

export async function createCheckoutSession(
  customerId: string,
  customerEmail: string,
  tier: PricingTier = 'starter',
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return getStripe().checkout.sessions.create({
    customer_email: customerEmail,
    mode: 'subscription',
    allow_promotion_codes: true,
    line_items: [
      {
        price: getTierPriceId(tier),
        quantity: 1,
      },
    ],
    metadata: {
      customerId,
      tier,
    },
    success_url: `${appUrl}/subscribe?checkout=success`,
    cancel_url: `${appUrl}/subscribe?checkout=cancelled`,
  });
}

/**
 * Direct checkout against the legacy $99 price. Not linked from the public
 * pricing page — reserved for grandfathered customers re-subscribing after
 * a lapse. Call from a signed support link, never as an unauthenticated POST.
 */
export async function createLegacyCheckoutSession(
  customerId: string,
  customerEmail: string,
) {
  const legacy = getLegacyPriceId();
  if (!legacy) {
    throw new Error(
      'STRIPE_PRICE_ID (legacy) is not set; cannot resubscribe grandfathered customer.',
    );
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return getStripe().checkout.sessions.create({
    customer_email: customerEmail,
    mode: 'subscription',
    allow_promotion_codes: true,
    line_items: [{ price: legacy, quantity: 1 }],
    metadata: { customerId, tier: 'legacy' },
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
