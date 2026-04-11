'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/lib/hooks';
import Sidebar from '@/components/dashboard/sidebar';
import { PageLoading } from '@/components/ui/loading';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, customer, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Not authenticated → login
    if (!user) {
      router.push('/login');
      return;
    }

    // PENDING (haven't paid) → subscribe page
    if (customer?.status === 'PENDING') {
      router.push('/subscribe');
      return;
    }

    // ACTIVE but hasn't completed onboarding → onboarding
    if (customer && customer.status === 'ACTIVE' && !customer.onboardingComplete && pathname !== '/onboarding') {
      router.push('/onboarding');
      return;
    }
  }, [loading, user, customer, router, pathname]);

  if (loading) return <PageLoading />;
  if (!user) return null;

  // Block rendering while redirecting
  if (customer?.status === 'PENDING') return null;
  if (customer && customer.status === 'ACTIVE' && !customer.onboardingComplete && pathname !== '/onboarding') return null;

  // Onboarding page — render without sidebar
  if (pathname === '/onboarding') {
    return (
      <div className="min-h-screen bg-gray-50">
        <main>
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar companyName={customer?.companyName} userEmail={user.email} />
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
