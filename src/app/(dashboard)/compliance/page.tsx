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
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

const statusBadge: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  UPCOMING: 'info', DUE_SOON: 'warning', OVERDUE: 'danger', COMPLETED: 'success', WAIVED: 'neutral',
};

const typeLabels: Record<string, string> = {
  INSPECTION: 'Inspection', TEST: 'Test', CERTIFICATION: 'Certification', TRAINING: 'Training',
  DOCUMENTATION: 'Documentation', REPORTING: 'Reporting', FINANCIAL: 'Financial', CLOSURE: 'Closure',
};

const typeBadgeColor: Record<string, string> = {
  INSPECTION: 'bg-blue-100 text-blue-800',
  TEST: 'bg-blue-100 text-blue-800',
  CERTIFICATION: 'bg-purple-100 text-purple-800',
  TRAINING: 'bg-green-100 text-green-800',
  DOCUMENTATION: 'bg-gray-100 text-gray-800',
  REPORTING: 'bg-red-100 text-red-800',
  FINANCIAL: 'bg-red-100 text-red-800',
  CLOSURE: 'bg-yellow-100 text-yellow-800',
};

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface FacilitySummary {
  id: string;
  name: string;
  tanks: Array<{ id: string; tankNumber: string }>;
}

export default function CompliancePage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ facilityId: '', tankId: '', description: '', dueDate: '', itemType: 'CLOSURE' });
  const [creating, setCreating] = useState(false);

  const { data: facilitiesData } = useFetch<{ facilities: FacilitySummary[] }>('/api/facilities?includeTanks=true');

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

  async function handleCreate() {
    if (!createForm.facilityId || !createForm.description || !createForm.dueDate) return;
    setCreating(true);
    try {
      const res = await fetch('/api/compliance/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: createForm.facilityId,
          tankId: createForm.tankId || undefined,
          description: createForm.description,
          dueDate: createForm.dueDate,
          itemType: createForm.itemType,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }
      setShowCreate(false);
      setCreateForm({ facilityId: '', tankId: '', description: '', dueDate: '', itemType: 'CLOSURE' });
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create item');
    } finally {
      setCreating(false);
    }
  }

  const selectedFacility = facilitiesData?.facilities?.find((f) => f.id === createForm.facilityId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Items</h1>
          <p className="text-gray-500 mt-1">Track all compliance deadlines across your facilities</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Create Item</Button>
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
          <option value="REPORTING">Reporting</option>
          <option value="FINANCIAL">Financial</option>
          <option value="CLOSURE">Closure</option>
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
                    <td className="px-4 py-3">
                      {item.tank ? (
                        <span>Tank {item.tank.tankNumber}</span>
                      ) : (
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Facility-wide</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${typeBadgeColor[item.itemType] || 'bg-gray-100 text-gray-800'}`}>
                        {typeLabels[item.itemType] || item.itemType}
                      </span>
                    </td>
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
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(data.pagination.page - 1) * 20 + 1}–{Math.min(data.pagination.page * 20, data.pagination.total)} of {data.pagination.total}
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="secondary" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
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

      {/* Create Ad-Hoc Compliance Item Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Compliance Item">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Create a one-time compliance item for events like tank closures, installations, owner changes, or other non-recurring obligations.
          </p>

          <Select label="Facility" value={createForm.facilityId} onChange={(e) => setCreateForm({ ...createForm, facilityId: e.target.value, tankId: '' })}>
            <option value="">Select facility...</option>
            {facilitiesData?.facilities?.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </Select>

          {selectedFacility && selectedFacility.tanks.length > 0 && (
            <Select label="Tank (optional — leave blank for facility-wide)" value={createForm.tankId} onChange={(e) => setCreateForm({ ...createForm, tankId: e.target.value })}>
              <option value="">Facility-wide</option>
              {selectedFacility.tanks.map((t) => (
                <option key={t.id} value={t.id}>Tank {t.tankNumber}</option>
              ))}
            </Select>
          )}

          <Select label="Item Type" value={createForm.itemType} onChange={(e) => setCreateForm({ ...createForm, itemType: e.target.value })}>
            <option value="CLOSURE">Closure</option>
            <option value="CERTIFICATION">Certification</option>
            <option value="INSPECTION">Inspection</option>
            <option value="TEST">Test</option>
            <option value="TRAINING">Training</option>
            <option value="DOCUMENTATION">Documentation</option>
            <option value="REPORTING">Reporting</option>
            <option value="FINANCIAL">Financial</option>
          </Select>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="e.g., Tank #3 permanent closure — notify DEQ 30 days in advance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={createForm.dueDate}
              onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              loading={creating}
              disabled={!createForm.facilityId || !createForm.description || !createForm.dueDate}
            >
              Create Item
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
