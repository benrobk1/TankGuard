'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/hooks';
import Sidebar from '@/components/dashboard/sidebar';
import { PageLoading } from '@/components/ui/loading';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, customer, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) return <PageLoading />;
  if (!user) return null;

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
