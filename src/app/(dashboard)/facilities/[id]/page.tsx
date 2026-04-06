'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useFetch } from '@/lib/hooks';
import { LoadingSpinner } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { ArrowLeft, Plus, CheckCircle, Upload } from 'lucide-react';
import Link from 'next/link';

interface FacilityDetail {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  facilityType: string;
  registrationNumber: string | null;
  contactName: string | null;
  contactPhone: string | null;
  state: { id: string; abbreviation: string; name: string; regulatoryAgency: string | null };
  tanks: Tank[];
  operators: Operator[];
  complianceItems: ComplianceItemData[];
  documents: DocData[];
}

interface Tank {
  id: string;
  tankNumber: string;
  capacityGallons: number;
  productStored: string;
  material: string;
  installationDate: string | null;
  leakDetectionMethod: string;
  status: string;
}

interface Operator {
  id: string;
  name: string;
  operatorClass: string;
  certificationDate: string | null;
  certificationExpiration: string | null;
  trainingProvider: string | null;
}

interface ComplianceItemData {
  id: string;
  description: string;
  dueDate: string;
  status: string;
  itemType: string;
  completedDate: string | null;
  tank: { tankNumber: string } | null;
}

interface DocData {
  id: string;
  fileName: string;
  documentType: string;
  uploadDate: string;
  fileUrl: string;
}

const productLabels: Record<string, string> = {
  REGULAR_GASOLINE: 'Regular Gasoline', PREMIUM_GASOLINE: 'Premium Gasoline',
  MIDGRADE_GASOLINE: 'Midgrade Gasoline', DIESEL: 'Diesel', KEROSENE: 'Kerosene',
  HEATING_OIL: 'Heating Oil', USED_OIL: 'Used Oil', AVIATION_FUEL: 'Aviation Fuel',
  E85: 'E85', DEF: 'DEF', OTHER: 'Other',
};

const materialLabels: Record<string, string> = {
  FIBERGLASS: 'Fiberglass', STEEL: 'Steel', STEEL_WITH_FRP: 'Steel w/ FRP',
  COMPOSITE: 'Composite', DOUBLE_WALL_FIBERGLASS: 'Double-Wall Fiberglass',
  DOUBLE_WALL_STEEL: 'Double-Wall Steel', OTHER: 'Other',
};

const statusBadge: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  UPCOMING: 'info', DUE_SOON: 'warning', OVERDUE: 'danger', COMPLETED: 'success', WAIVED: 'neutral',
};

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function FacilityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: facility, loading, error, mutate } = useFetch<FacilityDetail>(`/api/facilities/${id}`);
  const [activeTab, setActiveTab] = useState<'tanks' | 'operators' | 'compliance' | 'documents'>('tanks');
  const [showTankModal, setShowTankModal] = useState(false);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [tankForm, setTankForm] = useState({
    tankNumber: '', capacityGallons: '10000', productStored: 'REGULAR_GASOLINE',
    material: 'FIBERGLASS', leakDetectionMethod: 'ATG', installationDate: '',
    spillPreventionType: 'Spill bucket', overfillPreventionType: 'Ball float valve',
    corrosionProtectionType: 'FIBERGLASS_NO_CP_NEEDED',
  });

  const [opForm, setOpForm] = useState({
    name: '', operatorClass: 'CLASS_A', certificationDate: '', trainingProvider: '',
  });

  async function handleAddTank(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/tanks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: id,
          tankNumber: tankForm.tankNumber,
          capacityGallons: parseInt(tankForm.capacityGallons),
          productStored: tankForm.productStored,
          material: tankForm.material,
          leakDetectionMethod: tankForm.leakDetectionMethod,
          installationDate: tankForm.installationDate || undefined,
          spillPreventionType: tankForm.spillPreventionType,
          overfillPreventionType: tankForm.overfillPreventionType,
          corrosionProtectionType: tankForm.corrosionProtectionType,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setShowTankModal(false);
      mutate();
    } catch { alert('Failed to add tank'); }
    finally { setSaving(false); }
  }

  async function handleAddOperator(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: id,
          name: opForm.name,
          operatorClass: opForm.operatorClass,
          certificationDate: opForm.certificationDate || undefined,
          trainingProvider: opForm.trainingProvider || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setShowOperatorModal(false);
      mutate();
    } catch { alert('Failed to add operator'); }
    finally { setSaving(false); }
  }

  async function handleComplete(itemId: string) {
    setSaving(true);
    try {
      const res = await fetch('/api/compliance/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complianceItemId: itemId }),
      });
      if (!res.ok) throw new Error('Failed');
      setShowCompleteModal(null);
      mutate();
    } catch { alert('Failed to complete item'); }
    finally { setSaving(false); }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch('/api/compliance/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId: id }),
      });
      if (!res.ok) throw new Error('Failed');
      mutate();
    } catch { alert('Failed to generate schedule'); }
    finally { setGenerating(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  if (error) return <div className="text-red-600 py-10 text-center">{error}</div>;
  if (!facility) return null;

  const tabs = [
    { key: 'tanks' as const, label: `Tanks (${facility.tanks.length})` },
    { key: 'operators' as const, label: `Operators (${facility.operators.length})` },
    { key: 'compliance' as const, label: `Compliance (${facility.complianceItems.length})` },
    { key: 'documents' as const, label: `Documents (${facility.documents.length})` },
  ];

  return (
    <div className="space-y-6">
      <Link href="/facilities" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Facilities
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{facility.name}</h1>
            <p className="text-gray-500 mt-1">{facility.address}, {facility.city}, {facility.state.abbreviation} {facility.zip}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              {facility.registrationNumber && <span>Reg #: {facility.registrationNumber}</span>}
              <span>{facility.state.regulatoryAgency || facility.state.name}</span>
            </div>
          </div>
          <Button onClick={handleGenerate} loading={generating} variant="secondary">
            Generate Compliance Schedule
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'tanks' && (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowTankModal(true)}><Plus className="h-4 w-4 mr-2" />Add Tank</Button>
          </div>
          {facility.tanks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No tanks added yet.</p>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Tank #</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Product</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Material</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Capacity</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Installed</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {facility.tanks.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{t.tankNumber}</td>
                      <td className="px-4 py-3">{productLabels[t.productStored] || t.productStored}</td>
                      <td className="px-4 py-3">{materialLabels[t.material] || t.material}</td>
                      <td className="px-4 py-3">{t.capacityGallons.toLocaleString()} gal</td>
                      <td className="px-4 py-3">{formatDate(t.installationDate)}</td>
                      <td className="px-4 py-3"><Badge variant={t.status === 'ACTIVE' ? 'success' : 'neutral'}>{t.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'operators' && (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowOperatorModal(true)}><Plus className="h-4 w-4 mr-2" />Add Operator</Button>
          </div>
          {facility.operators.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No operators added yet.</p>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Class</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Certified</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Expires</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Provider</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {facility.operators.map(op => (
                    <tr key={op.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{op.name}</td>
                      <td className="px-4 py-3">{op.operatorClass.replace('CLASS_', 'Class ')}</td>
                      <td className="px-4 py-3">{formatDate(op.certificationDate)}</td>
                      <td className="px-4 py-3">{formatDate(op.certificationExpiration)}</td>
                      <td className="px-4 py-3">{op.trainingProvider || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'compliance' && (
        <div>
          {facility.complianceItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No compliance items yet.</p>
              <Button className="mt-3" onClick={handleGenerate} loading={generating}>Generate Schedule</Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Description</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Tank</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Due Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {facility.complianceItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{item.description}</td>
                      <td className="px-4 py-3">{item.tank?.tankNumber || 'Facility'}</td>
                      <td className="px-4 py-3">{formatDate(item.dueDate)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadge[item.status] || 'neutral'}>{item.status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {item.status !== 'COMPLETED' && item.status !== 'WAIVED' && (
                          <button onClick={() => setShowCompleteModal(item.id)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            <CheckCircle className="h-4 w-4 inline mr-1" />Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div>
          {facility.documents.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No documents uploaded yet.</p>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">File Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Uploaded</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {facility.documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{doc.fileName}</td>
                      <td className="px-4 py-3">{doc.documentType.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3">{formatDate(doc.uploadDate)}</td>
                      <td className="px-4 py-3">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium">Download</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Tank Modal */}
      <Modal isOpen={showTankModal} onClose={() => setShowTankModal(false)} title="Add Tank">
        <form onSubmit={handleAddTank} className="space-y-4">
          <Input label="Tank Number *" required value={tankForm.tankNumber} onChange={e => setTankForm({ ...tankForm, tankNumber: e.target.value })} placeholder="e.g. T-1" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Capacity (gallons) *" type="number" required value={tankForm.capacityGallons} onChange={e => setTankForm({ ...tankForm, capacityGallons: e.target.value })} />
            <Select label="Product Stored *" value={tankForm.productStored} onChange={e => setTankForm({ ...tankForm, productStored: e.target.value })}>
              {Object.entries(productLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tank Material *" value={tankForm.material} onChange={e => setTankForm({ ...tankForm, material: e.target.value })}>
              {Object.entries(materialLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
            <Select label="Leak Detection *" value={tankForm.leakDetectionMethod} onChange={e => setTankForm({ ...tankForm, leakDetectionMethod: e.target.value })}>
              <option value="ATG">Automatic Tank Gauge (ATG)</option>
              <option value="SIR">Statistical Inventory Reconciliation</option>
              <option value="MANUAL_GAUGING">Manual Gauging</option>
              <option value="INTERSTITIAL_MONITORING">Interstitial Monitoring</option>
              <option value="GROUNDWATER_MONITORING">Groundwater Monitoring</option>
              <option value="VAPOR_MONITORING">Vapor Monitoring</option>
            </Select>
          </div>
          <Input label="Installation Date" type="date" value={tankForm.installationDate} onChange={e => setTankForm({ ...tankForm, installationDate: e.target.value })} />
          <Select label="Corrosion Protection" value={tankForm.corrosionProtectionType} onChange={e => setTankForm({ ...tankForm, corrosionProtectionType: e.target.value })}>
            <option value="FIBERGLASS_NO_CP_NEEDED">Fiberglass (No CP Needed)</option>
            <option value="CATHODIC_PROTECTION">Cathodic Protection</option>
            <option value="INTERNAL_LINING">Internal Lining</option>
            <option value="COMPOSITE">Composite</option>
            <option value="NONE">None</option>
          </Select>
          <p className="text-xs text-gray-500">Default values are set for typical gas station tanks. Adjust if needed.</p>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowTankModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Add Tank</Button>
          </div>
        </form>
      </Modal>

      {/* Add Operator Modal */}
      <Modal isOpen={showOperatorModal} onClose={() => setShowOperatorModal(false)} title="Add Operator">
        <form onSubmit={handleAddOperator} className="space-y-4">
          <Input label="Operator Name *" required value={opForm.name} onChange={e => setOpForm({ ...opForm, name: e.target.value })} />
          <Select label="Operator Class *" value={opForm.operatorClass} onChange={e => setOpForm({ ...opForm, operatorClass: e.target.value })}>
            <option value="CLASS_A">Class A - Owner/Financial Control</option>
            <option value="CLASS_B">Class B - Day-to-Day Operations</option>
            <option value="CLASS_C">Class C - Front-Line Employee</option>
          </Select>
          <Input label="Last Certification Date" type="date" value={opForm.certificationDate} onChange={e => setOpForm({ ...opForm, certificationDate: e.target.value })} />
          <Input label="Training Provider" value={opForm.trainingProvider} onChange={e => setOpForm({ ...opForm, trainingProvider: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowOperatorModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Add Operator</Button>
          </div>
        </form>
      </Modal>

      {/* Complete Item Modal */}
      <Modal isOpen={!!showCompleteModal} onClose={() => setShowCompleteModal(null)} title="Mark as Complete">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Mark this compliance item as completed? This will generate the next occurrence based on the inspection frequency.</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowCompleteModal(null)}>Cancel</Button>
            <Button onClick={() => showCompleteModal && handleComplete(showCompleteModal)} loading={saving}>Confirm Completion</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
