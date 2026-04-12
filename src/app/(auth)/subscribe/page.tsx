'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

function SubscribePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutResult = searchParams.get('checkout');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const [activating, setActivating] = useState(false);

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

  // Check auth status on mount
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

        // Already active — redirect appropriately
        if (customer.status === 'ACTIVE') {
          router.push(customer.onboardingComplete ? '/dashboard' : '/onboarding');
          return;
        }

        // Coming back from Stripe success — poll until webhook activates
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

  async function startCheckout() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
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

  // Post-payment activation screen
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
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-8 text-center text-white">
          <div className="flex justify-center mb-3">
            <Shield className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold">Activate TankGuard</h1>
          <p className="mt-2 text-blue-100">Subscribe to start tracking your UST compliance</p>
        </div>

        <div className="p-6 space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

          {checkoutResult === 'cancelled' && (
            <Alert variant="error">Checkout was cancelled. You can try again below.</Alert>
          )}

          {/* Pricing */}
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-gray-900">$99</span>
              <span className="text-gray-500">/month</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Cancel anytime &middot; No setup fee &middot; No contracts</p>
          </div>

          {/* Features */}
          <div className="bg-gray-50 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Everything included:</h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              {[
                'Unlimited facilities & tanks',
                'All 50 states + federal EPA rules',
                'Escalating email reminders',
                'Document vault with unlimited storage',
                'Audit-ready compliance reports',
                'Compliance calendar',
                'Weekly digest emails',
              ].map(f => (
                <li key={f} className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Guarantee */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            <strong>Our Guarantee:</strong> If TankGuard misses a compliance deadline that results in a fine, we refund 12 months of subscription fees.
          </div>

          {/* CTA */}
          <Button className="w-full" size="lg" onClick={startCheckout} loading={loading}>
            Subscribe Now &mdash; $99/month <ChevronRight className="h-4 w-4 ml-2" />
          </Button>

          <p className="text-xs text-gray-400 text-center">
            Secure payment powered by Stripe. You&apos;ll set up your facilities after subscribing.
          </p>
        </div>
      </div>
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
