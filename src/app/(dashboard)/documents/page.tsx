'use client';

import { useState, useRef } from 'react';
import { useFetch } from '@/lib/hooks';
import { LoadingSpinner } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Upload, FileText, Download } from 'lucide-react';

interface Doc {
  id: string;
  fileName: string;
  documentType: string;
  fileUrl: string;
  uploadDate: string;
  expirationDate: string | null;
  facility: { name: string };
  tank: { tankNumber: string } | null;
}

interface Facility {
  id: string;
  name: string;
}

const docTypeLabels: Record<string, string> = {
  INSPECTION_REPORT: 'Inspection Report', CERTIFICATE: 'Certificate',
  TRAINING_RECORD: 'Training Record', FINANCIAL_RESPONSIBILITY: 'Financial Responsibility',
  RELEASE_DETECTION: 'Release Detection', CLOSURE_REPORT: 'Closure Report',
  PERMIT: 'Permit', REGISTRATION: 'Registration', CORRESPONDENCE: 'Correspondence',
  PHOTO: 'Photo', OTHER: 'Other',
};

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DocumentsPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ facilityId: '', documentType: 'INSPECTION_REPORT', notes: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  const params = new URLSearchParams();
  if (typeFilter) params.set('documentType', typeFilter);
  params.set('limit', '50');

  const { data: docs, loading, error, mutate } = useFetch<{ documents: Doc[] }>(`/api/documents?${params}`);
  const { data: facilities } = useFetch<Facility[]>('/api/facilities');

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !uploadForm.facilityId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('facilityId', uploadForm.facilityId);
      formData.append('documentType', uploadForm.documentType);
      if (uploadForm.notes) formData.append('notes', uploadForm.notes);

      const res = await fetch('/api/documents/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      setShowUpload(false);
      setUploadForm({ facilityId: '', documentType: 'INSPECTION_REPORT', notes: '' });
      mutate();
    } catch { alert('Upload failed'); }
    finally { setUploading(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Vault</h1>
          <p className="text-gray-500 mt-1">Store and manage your compliance documents</p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload className="h-4 w-4 mr-2" />Upload Document
        </Button>
      </div>

      <div className="flex gap-4">
        <Select label="" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {Object.entries(docTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : error ? (
        <div className="text-red-600 text-center py-10">{error}</div>
      ) : !docs?.documents?.length ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
          <p className="text-gray-500 mt-1">Upload inspection reports, certificates, and training records.</p>
          <Button className="mt-4" onClick={() => setShowUpload(true)}>Upload Document</Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">File Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Facility</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Uploaded</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Expires</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {docs.documents.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{doc.fileName}</td>
                  <td className="px-4 py-3"><Badge variant="neutral">{docTypeLabels[doc.documentType] || doc.documentType}</Badge></td>
                  <td className="px-4 py-3">{doc.facility.name}</td>
                  <td className="px-4 py-3">{formatDate(doc.uploadDate)}</td>
                  <td className="px-4 py-3">{formatDate(doc.expirationDate)}</td>
                  <td className="px-4 py-3">
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Document">
        <form onSubmit={handleUpload} className="space-y-4">
          <Select label="Facility *" required value={uploadForm.facilityId} onChange={e => setUploadForm({ ...uploadForm, facilityId: e.target.value })}>
            <option value="">Select facility...</option>
            {facilities?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </Select>
          <Select label="Document Type *" value={uploadForm.documentType} onChange={e => setUploadForm({ ...uploadForm, documentType: e.target.value })}>
            {Object.entries(docTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
            <input ref={fileRef} type="file" required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={3} value={uploadForm.notes} onChange={e => setUploadForm({ ...uploadForm, notes: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button>
            <Button type="submit" loading={uploading}>Upload</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
