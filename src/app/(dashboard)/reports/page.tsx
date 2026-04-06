'use client';

import { useState } from 'react';
import { useFetch } from '@/lib/hooks';
import { LoadingSpinner } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { FileText, Printer, Download } from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  address: string;
  city: string;
  state: { abbreviation: string; name: string; regulatoryAgency: string | null };
}

interface AuditReport {
  facility: {
    name: string;
    address: string;
    city: string;
    zip: string;
    registrationNumber: string | null;
    facilityType: string;
    state: { name: string; abbreviation: string; regulatoryAgency: string | null };
  };
  tanks: Array<{
    tankNumber: string;
    capacityGallons: number;
    productStored: string;
    material: string;
    installationDate: string | null;
    status: string;
    leakDetectionMethod: string;
  }>;
  complianceItems: Array<{
    description: string;
    dueDate: string;
    status: string;
    completedDate: string | null;
    itemType: string;
  }>;
  operators: Array<{
    name: string;
    operatorClass: string;
    certificationDate: string | null;
    certificationExpiration: string | null;
    trainingProvider: string | null;
  }>;
  documents: Array<{
    fileName: string;
    documentType: string;
    uploadDate: string;
    expirationDate: string | null;
  }>;
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusBadge: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  UPCOMING: 'info', DUE_SOON: 'warning', OVERDUE: 'danger', COMPLETED: 'success', WAIVED: 'neutral',
};

export default function ReportsPage() {
  const { data: facilities } = useFetch<Facility[]>('/api/facilities');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateReport() {
    if (!selectedFacility) return;
    setLoading(true);
    try {
      const res = await fetch('/api/reports/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId: selectedFacility }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setReport(data);
    } catch { alert('Failed to generate report'); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Reports</h1>
        <p className="text-gray-500 mt-1">Generate compliance packets for state inspectors</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Generate Audit Report</h2>
        <p className="text-sm text-gray-500 mb-4">Inspector coming? Generate a complete compliance packet for your facility.</p>
        <div className="flex gap-4 items-end">
          <div className="flex-1 max-w-md">
            <Select label="Select Facility" value={selectedFacility} onChange={e => setSelectedFacility(e.target.value)}>
              <option value="">Choose a facility...</option>
              {facilities?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </Select>
          </div>
          <Button onClick={generateReport} loading={loading} disabled={!selectedFacility}>
            <FileText className="h-4 w-4 mr-2" />Generate Report
          </Button>
        </div>
      </div>

      {report && (
        <div id="audit-report" className="bg-white rounded-lg border border-gray-200 p-6 print:border-0 print:p-0">
          <div className="flex items-center justify-between mb-6 print:hidden">
            <h2 className="text-xl font-bold text-gray-900">Compliance Audit Report</h2>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />Print Report
            </Button>
          </div>

          {/* Facility Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-3">Facility Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium">{report.facility.name}</span></div>
              <div><span className="text-gray-500">Address:</span> <span className="font-medium">{report.facility.address}, {report.facility.city}, {report.facility.state.abbreviation}</span></div>
              <div><span className="text-gray-500">Registration #:</span> <span className="font-medium">{report.facility.registrationNumber || 'N/A'}</span></div>
              <div><span className="text-gray-500">Regulatory Agency:</span> <span className="font-medium">{report.facility.state.regulatoryAgency || 'N/A'}</span></div>
              <div><span className="text-gray-500">Report Generated:</span> <span className="font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
            </div>
          </div>

          {/* Tank Inventory */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-3">Tank Inventory ({report.tanks.length} tanks)</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-gray-500">Tank #</th>
                  <th className="text-left py-2 font-medium text-gray-500">Product</th>
                  <th className="text-left py-2 font-medium text-gray-500">Material</th>
                  <th className="text-left py-2 font-medium text-gray-500">Capacity</th>
                  <th className="text-left py-2 font-medium text-gray-500">Installed</th>
                  <th className="text-left py-2 font-medium text-gray-500">Leak Detection</th>
                </tr>
              </thead>
              <tbody>
                {report.tanks.map((t, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2">{t.tankNumber}</td>
                    <td className="py-2">{t.productStored.replace(/_/g, ' ')}</td>
                    <td className="py-2">{t.material.replace(/_/g, ' ')}</td>
                    <td className="py-2">{t.capacityGallons.toLocaleString()} gal</td>
                    <td className="py-2">{formatDate(t.installationDate)}</td>
                    <td className="py-2">{t.leakDetectionMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Operator Certifications */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-3">Operator Certifications</h3>
            {report.operators.length === 0 ? (
              <p className="text-sm text-gray-500">No operators on record.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-gray-500">Name</th>
                    <th className="text-left py-2 font-medium text-gray-500">Class</th>
                    <th className="text-left py-2 font-medium text-gray-500">Certified</th>
                    <th className="text-left py-2 font-medium text-gray-500">Expires</th>
                    <th className="text-left py-2 font-medium text-gray-500">Provider</th>
                  </tr>
                </thead>
                <tbody>
                  {report.operators.map((op, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2">{op.name}</td>
                      <td className="py-2">{op.operatorClass.replace('CLASS_', 'Class ')}</td>
                      <td className="py-2">{formatDate(op.certificationDate)}</td>
                      <td className="py-2">{formatDate(op.certificationExpiration)}</td>
                      <td className="py-2">{op.trainingProvider || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Compliance History */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-3">Compliance Items ({report.complianceItems.length})</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-gray-500">Description</th>
                  <th className="text-left py-2 font-medium text-gray-500">Type</th>
                  <th className="text-left py-2 font-medium text-gray-500">Due Date</th>
                  <th className="text-left py-2 font-medium text-gray-500">Status</th>
                  <th className="text-left py-2 font-medium text-gray-500">Completed</th>
                </tr>
              </thead>
              <tbody>
                {report.complianceItems.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 max-w-xs truncate">{item.description}</td>
                    <td className="py-2">{item.itemType}</td>
                    <td className="py-2">{formatDate(item.dueDate)}</td>
                    <td className="py-2"><Badge variant={statusBadge[item.status] || 'neutral'}>{item.status}</Badge></td>
                    <td className="py-2">{formatDate(item.completedDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Documents on File */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-3">Documents on File ({report.documents.length})</h3>
            {report.documents.length === 0 ? (
              <p className="text-sm text-gray-500">No documents on file.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-gray-500">File Name</th>
                    <th className="text-left py-2 font-medium text-gray-500">Type</th>
                    <th className="text-left py-2 font-medium text-gray-500">Uploaded</th>
                    <th className="text-left py-2 font-medium text-gray-500">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {report.documents.map((doc, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2">{doc.fileName}</td>
                      <td className="py-2">{doc.documentType.replace(/_/g, ' ')}</td>
                      <td className="py-2">{formatDate(doc.uploadDate)}</td>
                      <td className="py-2">{formatDate(doc.expirationDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
            Generated by TankGuard &mdash; UST Compliance Tracking &mdash; tankguard.saastudio.org
          </div>
        </div>
      )}
    </div>
  );
}
