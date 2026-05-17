'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { TIERS, TIER_ORDER, type PricingTier } from '@/lib/stripe';

function SubscribePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutResult = searchParams.get('checkout');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const [activating, setActivating] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier>('growth');

  const pollForActive = useCallback(() => {
    setActivating(true);
    let attempts = 0;
    const maxAttempts = 15; // ~30 seconds

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.customer?.status === 'ACTIVE') {
            clearInterval(interval);
            router.push('/onboarding');
            return;
          }
        }
      } catch { /* keep polling */ }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setActivating(false);
        setError('Payment is being processed. Please refresh the page in a moment.');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        const customer = data.customer;
        if (!customer) {
          router.push('/login');
          return;
        }

        if (customer.status === 'ACTIVE') {
          router.push(customer.onboardingComplete ? '/dashboard' : '/onboarding');
          return;
        }

        if (checkoutResult === 'success' && customer.status === 'PENDING') {
          setChecking(false);
          pollForActive();
          return;
        }
      } catch {
        router.push('/login');
      } finally {
        setChecking(false);
      }
    }
    checkStatus();
  }, [router, checkoutResult, pollForActive]);

  async function startCheckout(tier: PricingTier) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Unable to start checkout. Please try again.');
      }
    } catch {
      setError('Unable to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (activating) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Confirmed!</h1>
          <p className="text-gray-500">Activating your account&hellip;</p>
          <div className="flex justify-center">
            <div className="animate-spin h-6 w-6 border-3 border-blue-600 border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <Shield className="h-10 w-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Choose your plan</h1>
        <p className="mt-2 text-gray-500">
          Pick a tier that fits your site count. You can upgrade or downgrade any time.
        </p>
      </div>

      {error && <div className="mb-6"><Alert variant="error">{error}</Alert></div>}
      {checkoutResult === 'cancelled' && (
        <div className="mb-6"><Alert variant="error">Checkout was cancelled. You can try again below.</Alert></div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {TIER_ORDER.map((tierKey) => {
          const tier = TIERS[tierKey];
          const isRecommended = tier.id === 'growth';
          const isSelected = selectedTier === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => setSelectedTier(tier.id)}
              className={`relative text-left rounded-xl border-2 bg-white p-6 transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isSelected ? 'border-blue-600 shadow-md' : 'border-gray-200'
              }`}
              aria-pressed={isSelected}
            >
              {isRecommended && (
                <span className="absolute -top-3 left-6 text-xs font-semibold uppercase tracking-wide rounded-full bg-blue-600 px-3 py-1 text-white">
                  Most Popular
                </span>
              )}
              <h2 className="text-lg font-semibold text-gray-900">{tier.displayName}</h2>
              <p className="mt-2">
                <span className="text-4xl font-bold text-gray-900">
                  ${tier.monthlyPriceUSD.toLocaleString()}
                </span>
                <span className="text-gray-500">/month</span>
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Up to {tier.maxSites} {tier.maxSites === 1 ? 'site' : 'sites'} &middot; {tier.supportLevel}
              </p>
              <ul className="mt-5 space-y-2 text-sm text-gray-600">
                {tier.highlights.map((h) => (
                  <li key={h} className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Button size="lg" onClick={() => startCheckout(selectedTier)} loading={loading}>
          Subscribe to {TIERS[selectedTier].displayName} &mdash; ${TIERS[selectedTier].monthlyPriceUSD.toLocaleString()}/mo
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <p className="mt-6 text-xs text-gray-500 text-center max-w-2xl mx-auto">
        Secure payment powered by Stripe. If TankGuard fails to surface a properly-configured
        compliance deadline at least 30 days in advance, we&rsquo;ll credit up to three months of
        subscription fees as product credit. See the <a href="/terms" className="underline">Terms of Service</a> for
        the full guarantee language and carve-outs.
      </p>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <SubscribePageContent />
    </Suspense>
  );
}
