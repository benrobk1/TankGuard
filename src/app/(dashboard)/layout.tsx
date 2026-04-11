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
    if (!loading && !user) {
      router.push('/login');
    }
    // Redirect PENDING customers to onboarding (unless already there)
    if (!loading && user && customer && customer.status === 'PENDING' && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [loading, user, customer, router, pathname]);

  if (loading) return <PageLoading />;
  if (!user) return null;

  // While redirecting PENDING users, don't render the dashboard chrome
  if (customer?.status === 'PENDING' && pathname !== '/onboarding') return null;

  // On the onboarding page, render without sidebar
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
