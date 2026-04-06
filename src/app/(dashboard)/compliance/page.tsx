'use client';

import { useState } from 'react';
import { useFetch } from '@/lib/hooks';
import { LoadingSpinner } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';

interface ComplianceItem {
  id: string;
  description: string;
  dueDate: string;
  status: string;
  itemType: string;
  completedDate: string | null;
  facility: { id: string; name: string };
  tank: { tankNumber: string } | null;
  rule: { citation: string | null };
}

interface ComplianceResponse {
  items: ComplianceItem[];
  total: number;
  page: number;
  totalPages: number;
}

const statusBadge: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  UPCOMING: 'info', DUE_SOON: 'warning', OVERDUE: 'danger', COMPLETED: 'success', WAIVED: 'neutral',
};

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CompliancePage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const params = new URLSearchParams();
  if (statusFilter) params.set('status', statusFilter);
  if (typeFilter) params.set('itemType', typeFilter);
  params.set('page', String(page));
  params.set('limit', '20');

  const { data, loading, error, mutate } = useFetch<ComplianceResponse>(`/api/compliance?${params.toString()}`);

  async function handleComplete(itemId: string) {
    setSaving(true);
    try {
      const res = await fetch('/api/compliance/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complianceItemId: itemId }),
      });
      if (!res.ok) throw new Error('Failed');
      setCompleteId(null);
      mutate();
    } catch { alert('Failed to complete item'); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance Items</h1>
        <p className="text-gray-500 mt-1">Track all compliance deadlines across your facilities</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Select label="" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="OVERDUE">Overdue</option>
          <option value="DUE_SOON">Due Soon</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="COMPLETED">Completed</option>
          <option value="WAIVED">Waived</option>
        </Select>
        <Select label="" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="INSPECTION">Inspection</option>
          <option value="TEST">Test</option>
          <option value="CERTIFICATION">Certification</option>
          <option value="TRAINING">Training</option>
          <option value="DOCUMENTATION">Documentation</option>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : error ? (
        <div className="text-red-600 py-10 text-center">{error}</div>
      ) : !data || data.items.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No compliance items found.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Description</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Facility</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Tank</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Due Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 max-w-xs truncate">{item.description}</td>
                    <td className="px-4 py-3">{item.facility.name}</td>
                    <td className="px-4 py-3">{item.tank?.tankNumber || '—'}</td>
                    <td className="px-4 py-3">{item.itemType}</td>
                    <td className="px-4 py-3">{formatDate(item.dueDate)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadge[item.status] || 'neutral'}>{item.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {item.status !== 'COMPLETED' && item.status !== 'WAIVED' && (
                        <button onClick={() => setCompleteId(item.id)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(data.page - 1) * 20 + 1}–{Math.min(data.page * 20, data.total)} of {data.total}
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={!!completeId} onClose={() => setCompleteId(null)} title="Mark as Complete">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Mark this compliance item as completed?</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setCompleteId(null)}>Cancel</Button>
            <Button onClick={() => completeId && handleComplete(completeId)} loading={saving}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
