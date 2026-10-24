'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { 
  Building2, 
  Shield, 
  Database, 
  Save, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  FileCheck
} from 'lucide-react';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_number: '',
    gstin: '',
    tax_rate: 5.0,
    receipt_footer: '',
    owner_pin: '',
    owner_username: '',
    owner_password: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to load settings');
      }
      const data = await res.json();
      setFormData({
        name: data.name || '',
        address: data.address || '',
        contact_number: data.contact_number || '',
        gstin: data.gstin || '',
        tax_rate: data.tax_rate ?? 5.0,
        receipt_footer: data.receipt_footer || '',
        owner_pin: data.owner_pin || '',
        owner_username: data.owner_username || 'owner',
        owner_password: '',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error loading settings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      setMessage({ type: 'success', text: 'Restaurant settings and preferences updated successfully!' });
      setFormData((prev) => ({ ...prev, owner_password: '' }));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleDemoAction = async (action: 'clear_demo' | 'reload_demo' | 'reset_all') => {
    const confirmPrompt =
      action === 'clear_demo'
        ? 'Remove sample demo bills? Only real bills will remain.'
        : action === 'reload_demo'
        ? 'Reload sample demo bills for testing?'
        : 'WARNING: Delete ALL saved bills from database? This cannot be undone.';

    if (!confirm(confirmPrompt)) return;

    try {
      setActionLoading(action);
      setMessage(null);

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      setMessage({ type: 'success', text: data.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Action failed' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <Header title="Restaurant Settings" subtitle="Configure restaurant profile, receipt branding, and security" />

      <div className="page-content" style={{ maxWidth: '960px' }}>
        {/* Status Message */}
        {message && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fff1f2',
              color: message.type === 'success' ? '#065f46' : '#9f1239',
              border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecdd3'}`,
            }}
          >
            {message.type === 'success' ? (
              <CheckCircle2 size={18} color="#10b981" />
            ) : (
              <AlertCircle size={18} color="#e11d48" />
            )}
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings}>
          {/* Section 1: Restaurant Profile & Receipts */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
              <Building2 size={20} color="#065f46" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Restaurant Profile & Printable Bill Details
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Restaurant Business Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. DineDesk Fine Dining"
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Full Address (Printed on bill headers)</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, Area, City, State, PIN code"
                  className="textarea-field"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact / Phone Number</label>
                <input
                  type="text"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  placeholder="+91 98450 12345"
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">GSTIN / Tax ID (Optional)</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="29AABCU9603R1Z7"
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Default GST / Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                  className="input-field tabular-nums"
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Receipt Footer Note</label>
                <input
                  type="text"
                  value={formData.receipt_footer}
                  onChange={(e) => setFormData({ ...formData, receipt_footer: e.target.value })}
                  placeholder="Thank you for dining with DineDesk! Please visit again."
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Owner Security & Authentication */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
              <Shield size={20} color="#065f46" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Owner Security & Login PIN
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              <div className="form-group">
                <label className="form-label">Owner 4-Digit Quick PIN</label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.owner_pin}
                  onChange={(e) => setFormData({ ...formData, owner_pin: e.target.value })}
                  placeholder="1234"
                  className="input-field tabular-nums"
                  required
                />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Used for fast PIN logins on restaurant tablets or checkout terminals.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Owner Username</label>
                <input
                  type="text"
                  value={formData.owner_username}
                  onChange={(e) => setFormData({ ...formData, owner_username: e.target.value })}
                  placeholder="owner"
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Change Password (Leave blank to keep current)</label>
                <input
                  type="password"
                  value={formData.owner_password}
                  onChange={(e) => setFormData({ ...formData, owner_password: e.target.value })}
                  placeholder="Enter new owner password"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-lg"
              style={{ minWidth: '200px' }}
            >
              <Save size={18} />
              <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>

        {/* Section 3: Database & Sample Demo Data Controls */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
            <Database size={20} color="#065f46" />
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
              Persistent Database & Sample Demo Data
            </h2>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-body)', marginBottom: '18px', lineHeight: 1.6 }}>
            DineDesk uses an active relational SQLite database (<code>dinedesk.db</code>).
            All generated customer bills and line items are stored permanently on your system. Refreshing the browser or restarting the computer will never delete saved bills.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              onClick={() => handleDemoAction('clear_demo')}
              disabled={actionLoading !== null}
              className="btn btn-secondary btn-sm"
              style={{ color: '#b45309', borderColor: '#fde68a', backgroundColor: '#fffbeb' }}
            >
              <Trash2 size={14} />
              <span>{actionLoading === 'clear_demo' ? 'Clearing...' : 'Clear Sample Demo Bills'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoAction('reload_demo')}
              disabled={actionLoading !== null}
              className="btn btn-secondary btn-sm"
            >
              <RotateCcw size={14} />
              <span>{actionLoading === 'reload_demo' ? 'Reloading...' : 'Reload Demo Bills'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoAction('reset_all')}
              disabled={actionLoading !== null}
              className="btn btn-danger btn-sm"
              style={{ marginLeft: 'auto' }}
            >
              <Trash2 size={14} />
              <span>{actionLoading === 'reset_all' ? 'Resetting...' : 'Reset All Bills Database'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
