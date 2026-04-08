'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/hooks';
import { LoadingSpinner } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';

export default function SettingsPage() {
  const { user, customer, loading } = useSession();
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState('');

  const [billingLoading, setBillingLoading] = useState(false);

  const [emailReminders, setEmailReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [overdueAlerts, setOverdueAlerts] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');

  // Initialize form values once loaded
  useEffect(() => {
    if (customer) {
      setCompanyName(customer.companyName || '');
    }
  }, [customer]);

  async function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/settings/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Company information updated successfully.');
      } else {
        setMessage(data.error || 'Failed to update company information.');
      }
    } catch {
      setMessage('Failed to update company information.');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwMessage('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPwMessage('Password must be at least 8 characters.');
      return;
    }
    setPwSaving(true);
    setPwMessage('');
    try {
      const res = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMessage('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwMessage(data.error || 'Failed to change password.');
      }
    } catch {
      setPwMessage('Failed to change password.');
    } finally {
      setPwSaving(false);
    }
  }

  async function handleSaveNotifications() {
    setNotifSaving(true);
    setNotifMessage('');
    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailReminders, weeklyDigest, overdueAlerts }),
      });
      if (res.ok) {
        setNotifMessage('Notification preferences saved.');
      } else {
        setNotifMessage('Failed to save notification preferences.');
      }
    } catch {
      setNotifMessage('Failed to save notification preferences.');
    } finally {
      setNotifSaving(false);
    }
  }

  async function openBillingPortal() {
    setBillingLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Could not open billing portal. Please ensure your subscription is active.');
      }
    } catch {
      alert('Failed to open billing portal.');
    } finally {
      setBillingLoading(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
        <form onSubmit={handleSaveCompany} className="space-y-4">
          <Input label="Company Name" value={companyName || customer?.companyName || ''} onChange={e => setCompanyName(e.target.value)} />
          <Input label="Email" value={user?.email || ''} disabled />
          <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" />
          {message && <Alert variant={message.includes('success') ? 'success' : 'error'}>{message}</Alert>}
          <Button type="submit" loading={saving}>Save Changes</Button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={emailReminders} onChange={e => setEmailReminders(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Email Reminders</p>
              <p className="text-xs text-gray-500">Receive email reminders for upcoming compliance deadlines</p>
            </div>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={weeklyDigest} onChange={e => setWeeklyDigest(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Weekly Digest</p>
              <p className="text-xs text-gray-500">Weekly summary of compliance status across all facilities</p>
            </div>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={overdueAlerts} onChange={e => setOverdueAlerts(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Overdue Alerts</p>
              <p className="text-xs text-gray-500">Daily alerts for overdue compliance items</p>
            </div>
          </label>
          {notifMessage && <Alert variant={notifMessage.includes('saved') ? 'success' : 'error'}>{notifMessage}</Alert>}
          <Button onClick={handleSaveNotifications} loading={notifSaving}>Save Preferences</Button>
        </div>
      </div>

      {/* Billing */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Plan</span>
            <span className="font-medium">TankGuard — $99/month</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className="font-medium text-green-600">{customer?.subscriptionStatus || 'Pending'}</span>
          </div>
        </div>
        <Button variant="secondary" className="mt-4" onClick={openBillingPortal} loading={billingLoading}>
          Manage Billing
        </Button>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input label="Current Password" type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          <Input label="New Password" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <Input label="Confirm New Password" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          {pwMessage && <Alert variant={pwMessage.includes('success') ? 'success' : 'error'}>{pwMessage}</Alert>}
          <Button type="submit" loading={pwSaving}>Change Password</Button>
        </form>
      </div>
    </div>
  );
}
