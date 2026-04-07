'use client';

import { useFetch } from '@/lib/hooks';
import { LoadingSpinner } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { ComplianceTrendChart } from '@/components/compliance/trend-chart';

interface DashboardData {
  summary: {
    totalFacilities: number;
    totalTanks: number;
    totalItems: number;
    upcoming: number;
    dueSoon: number;
    overdue: number;
    completed: number;
    complianceScore: number;
  };
  upcomingItems: Array<{
    id: string;
    description: string;
    dueDate: string;
    status: string;
    facility: { name: string };
    tank?: { tankNumber: string } | null;
  }>;
  overdueItems: Array<{
    id: string;
    description: string;
    dueDate: string;
    status: string;
    facility: { name: string };
    tank?: { tankNumber: string } | null;
  }>;
  recentCompletions: Array<{
    id: string;
    description: string;
    completedDate: string;
    facility: { name: string };
  }>;
  facilities: Array<{
    id: string;
    name: string;
    city: string;
    _count: { tanks: number; complianceItems: number };
  }>;
}

function getStatusColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getStatusLabel(score: number): string {
  if (score >= 80) return 'Compliant';
  if (score >= 50) return 'Needs Attention';
  return 'At Risk';
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function downloadAuditPdf(facilityId: string) {
  try {
    const res = await fetch('/api/reports/audit/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facilityId }),
    });
    if (!res.ok) throw new Error('Failed to generate PDF');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = res.headers.get('Content-Disposition')?.split('filename="')[1]?.replace('"', '') || 'audit-report.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('PDF download error:', err);
  }
}

function daysUntil(d: string) {
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function DashboardPage() {
  const { data, loading, error } = useFetch<DashboardData>('/api/dashboard');

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  if (error) return <div className="text-red-600 py-10 text-center">Error loading dashboard: {error}</div>;
  if (!data) return null;

  const { summary } = data;
  const score = summary.complianceScore;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Your compliance overview at a glance</p>
      </div>

      {/* Traffic Light Status */}
      <div className={`rounded-xl p-6 text-white ${getStatusColor(score)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-medium opacity-90">Overall Compliance Status</p>
            <p className="text-3xl font-bold mt-1">{getStatusLabel(score)}</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold">{Math.round(score)}%</p>
            <p className="text-sm opacity-90">Compliance Score</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Facilities', value: summary.totalFacilities, color: 'text-blue-600' },
          { label: 'Total Tanks', value: summary.totalTanks, color: 'text-blue-600' },
          { label: 'Due This Month', value: summary.dueSoon, color: 'text-yellow-600' },
          { label: 'Overdue', value: summary.overdue, color: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Compliance Trend Chart */}
      <ComplianceTrendChart />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Overdue Items */}
        {data.overdueItems.length > 0 && (
          <div className="bg-white rounded-lg border border-red-200 lg:col-span-2">
            <div className="px-4 py-3 border-b border-red-200 bg-red-50">
              <h2 className="text-lg font-semibold text-red-800">Overdue Items ({data.overdueItems.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {data.overdueItems.slice(0, 10).map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-500">{item.facility.name}{item.tank ? ` - Tank ${item.tank.tankNumber}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="danger">{Math.abs(daysUntil(item.dueDate))} days overdue</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {data.upcomingItems.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500 text-center">No upcoming items</p>
            ) : (
              data.upcomingItems.slice(0, 7).map((item) => {
                const days = daysUntil(item.dueDate);
                return (
                  <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.description}</p>
                      <p className="text-xs text-gray-500">{item.facility.name}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm text-gray-700">{formatDate(item.dueDate)}</p>
                      <Badge variant={days <= 7 ? 'danger' : days <= 30 ? 'warning' : 'info'}>
                        {days} days
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Completions */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Completions</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {data.recentCompletions.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500 text-center">No recent completions</p>
            ) : (
              data.recentCompletions.slice(0, 7).map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-500">{item.facility.name}</p>
                  </div>
                  <Badge variant="success">Completed {formatDate(item.completedDate)}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Facilities Overview */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Facilities</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {data.facilities.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-500 text-center">No facilities added yet</p>
          ) : (
            data.facilities.map((f) => (
              <div key={f.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <a href={`/facilities/${f.id}`} className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{f.name}</p>
                  <p className="text-xs text-gray-500">{f.city}</p>
                </a>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {f._count.tanks} tanks &middot; {f._count.complianceItems} items
                  </span>
                  <button
                    onClick={() => downloadAuditPdf(f.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    title="Download audit report PDF"
                  >
                    PDF
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
