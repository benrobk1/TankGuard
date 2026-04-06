'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFetch } from '@/lib/hooks';
import { LoadingSpinner } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Building2, Plus, MapPin } from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  facilityType: string;
  registrationNumber: string | null;
  state: { abbreviation: string; name: string };
  _count: { tanks: number; complianceItems: number };
  complianceStatus?: string;
}

const facilityTypes = [
  { value: 'GAS_STATION', label: 'Gas Station' },
  { value: 'FLEET_FUELING', label: 'Fleet Fueling' },
  { value: 'HEATING_OIL', label: 'Heating Oil' },
  { value: 'MARINA', label: 'Marina' },
  { value: 'AIRPORT', label: 'Airport' },
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'OTHER', label: 'Other' },
];

export default function FacilitiesPage() {
  const { data: facilities, loading, error, mutate } = useFetch<Facility[]>('/api/facilities');
  const { data: states } = useFetch<Array<{ id: string; abbreviation: string; name: string }>>('/api/states');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', address: '', city: '', stateId: '', zip: '',
    registrationNumber: '', facilityType: 'GAS_STATION',
    contactName: '', contactPhone: '', contactEmail: '',
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to create facility');
      setShowModal(false);
      setForm({ name: '', address: '', city: '', stateId: '', zip: '', registrationNumber: '', facilityType: 'GAS_STATION', contactName: '', contactPhone: '', contactEmail: '' });
      mutate();
    } catch {
      alert('Failed to create facility');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  if (error) return <div className="text-red-600 py-10 text-center">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
          <p className="text-gray-500 mt-1">{facilities?.length || 0} registered facilities</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />Add Facility
        </Button>
      </div>

      {facilities && facilities.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No facilities yet</h3>
          <p className="text-gray-500 mt-1">Add your first facility to start tracking compliance.</p>
          <Button className="mt-4" onClick={() => setShowModal(true)}>Add Facility</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilities?.map((f) => (
            <Link key={f.id} href={`/facilities/${f.id}`}>
              <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{f.name}</h3>
                  <Badge variant={f._count.complianceItems > 0 ? 'info' : 'neutral'}>
                    {f._count.complianceItems} items
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {f.address}, {f.city}, {f.state.abbreviation} {f.zip}
                  </div>
                  <p>{f._count.tanks} tank{f._count.tanks !== 1 ? 's' : ''} &middot; {facilityTypes.find(t => t.value === f.facilityType)?.label || f.facilityType}</p>
                  {f.registrationNumber && <p>Reg #: {f.registrationNumber}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Facility">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Facility Name *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Main Street Gas Station" />
          <Input label="Address *" required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City *" required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <Input label="ZIP Code *" required value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} />
          </div>
          <Select label="State *" required value={form.stateId} onChange={e => setForm({ ...form, stateId: e.target.value })}>
            <option value="">Select state...</option>
            {states?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Select label="Facility Type" value={form.facilityType} onChange={e => setForm({ ...form, facilityType: e.target.value })}>
            {facilityTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <Input label="Registration Number" value={form.registrationNumber} onChange={e => setForm({ ...form, registrationNumber: e.target.value })} placeholder="State registration #" />
          <Input label="Contact Name" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact Phone" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} />
            <Input label="Contact Email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Add Facility</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
