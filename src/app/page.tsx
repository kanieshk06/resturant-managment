'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BillReceiptModal from '@/components/BillReceiptModal';
import { 
  IndianRupee, 
  FileText, 
  TrendingUp, 
  Receipt, 
  ArrowUpRight, 
  Clock, 
  Printer, 
  AlertTriangle,
  Trash2,
  Calendar,
  Sparkles,
  ChevronRight,
  Eye
} from 'lucide-react';

interface DashboardData {
  todayIncome: number;
  todayBillsCount: number;
  avgBillAmount: number;
  latestBillNumber: string;
  nextBillNumber: string;
  hourlyChart: Array<{ time: string; amount: number }>;
  recentBills: Array<{
    id: number;
    bill_number: string;
    bill_date: string;
    final_amount: number;
    payment_method: string;
    customer_name: string | null;
    is_demo: number;
  }>;
  hasDemoData: boolean;
  demoBillsCount: number;
  liveBillsCount: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeReceiptBill, setActiveReceiptBill] = useState<any | null>(null);
  const [clearingDemo, setClearingDemo] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to load dashboard data');
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleClearDemoData = async () => {
    if (!confirm('Are you sure you want to remove the sample demo bills? Your real bills will remain intact.')) return;
    try {
      setClearingDemo(true);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_demo' }),
      });
      if (res.ok) {
        await fetchDashboard();
      }
    } catch (err) {
      alert('Failed to clear demo data');
    } finally {
      setClearingDemo(false);
    }
  };

  const handleOpenReceipt = async (billId: number) => {
    try {
      const res = await fetch(`/api/bills/${billId}`);
      if (res.ok) {
        const json = await res.json();
        setActiveReceiptBill(json.bill);
      }
    } catch {
      alert('Could not load bill details');
    }
  };

  const maxChartAmount = data ? Math.max(...data.hourlyChart.map((h) => h.amount), 500) : 500;

  return (
    <div>
      <Header title="Owner Dashboard" subtitle="Real-time daily income and restaurant overview" />

      <div className="page-content">
        {/* Demo Mode Notice Banner if demo data is present */}
        {data?.hasDemoData && (
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400e' }}>
                  Initial Demo Mode Active ({data.demoBillsCount} sample bills loaded)
                </div>
                <div style={{ fontSize: '13px', color: '#b45309' }}>
                  Sample bills are shown below for layout demonstration. Creating your own bill will track real business data.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleClearDemoData}
                disabled={clearingDemo}
                className="btn btn-secondary btn-sm"
                style={{ borderColor: '#fde68a', color: '#92400e', backgroundColor: '#ffffff' }}
              >
                <Trash2 size={14} />
                <span>{clearingDemo ? 'Clearing...' : 'Clear Demo Data'}</span>
              </button>
              <Link href="/billing" className="btn btn-primary btn-sm" style={{ backgroundColor: '#065f46' }}>
                <Receipt size={14} />
                <span>Create First Real Bill</span>
              </Link>
            </div>
          </div>
        )}

        {/* 4 Summary Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '28px',
          }}
        >
          {/* Card 1: Today's Total Income */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Today’s Total Income
                </span>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    marginTop: '8px',
                    letterSpacing: '-0.02em',
                  }}
                  className="tabular-nums"
                >
                  ₹{loading ? '...' : (data?.todayIncome ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--primary-border)',
                }}
              >
                <IndianRupee size={22} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <Calendar size={14} color="#065f46" />
              <span>Collected from today&apos;s bills</span>
            </div>
          </div>

          {/* Card 2: Total Bills Today */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Total Bills Today
                </span>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    marginTop: '8px',
                    letterSpacing: '-0.02em',
                  }}
                  className="tabular-nums"
                >
                  {loading ? '...' : data?.todayBillsCount ?? 0}
                </div>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #bbf7d0',
                }}
              >
                <FileText size={22} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <Clock size={14} color="#16a34a" />
              <span>Generated today</span>
            </div>
          </div>

          {/* Card 3: Average Bill Amount */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Average Bill Amount
                </span>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    marginTop: '8px',
                    letterSpacing: '-0.02em',
                  }}
                  className="tabular-nums"
                >
                  ₹{loading ? '...' : (data?.avgBillAmount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#f0f9ff',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #bae6fd',
                }}
              >
                <TrendingUp size={22} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>Per customer order today</span>
            </div>
          </div>

          {/* Card 4: Latest Bill Number */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Latest Bill Number
                </span>
                <div
                  style={{
                    fontSize: '26px',
                    fontWeight: 800,
                    color: '#065f46',
                    marginTop: '8px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {loading ? '...' : data?.latestBillNumber || 'None'}
                </div>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Receipt size={22} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>Next up: <strong style={{ color: '#065f46' }}>{data?.nextBillNumber || 'BILL-001'}</strong></span>
            </div>
          </div>
        </div>

        {/* Daily Income Progression Chart */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Daily Income Throughout The Day
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Hourly revenue collection for today (IST)
              </p>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#065f46', backgroundColor: '#ecfdf5', padding: '4px 12px', borderRadius: '6px' }}>
              Today: ₹{(data?.todayIncome ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Visual Bar Chart */}
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '10px 0 20px', borderBottom: '1px solid #f1f5f9' }}>
            {data?.hourlyChart.map((slot) => {
              const heightPct = maxChartAmount > 0 ? (slot.amount / maxChartAmount) * 100 : 0;
              const displayHeight = Math.max(8, heightPct);
              return (
                <div
                  key={slot.time}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    position: 'relative',
                  }}
                  title={`${slot.time}: ₹${slot.amount.toFixed(2)}`}
                >
                  {/* Amount label on hover or if > 0 */}
                  {slot.amount > 0 && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#065f46',
                        marginBottom: '6px',
                      }}
                      className="tabular-nums"
                    >
                      ₹{slot.amount}
                    </span>
                  )}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '48px',
                      height: `${displayHeight}%`,
                      backgroundColor: slot.amount > 0 ? '#065f46' : '#e2e8f0',
                      borderRadius: '6px 6px 2px 2px',
                      transition: 'height 0.3s ease, background-color 0.2s ease',
                      boxShadow: slot.amount > 0 ? '0 2px 6px rgba(6, 95, 70, 0.2)' : 'none',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginTop: '8px',
                      fontWeight: 500,
                    }}
                  >
                    {slot.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Bills Table */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Recent Bills</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Latest transactions recorded in DineDesk
              </p>
            </div>

            <Link href="/bills" className="btn btn-secondary btn-sm">
              <span>View All Bills</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill No.</th>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Bill Amount</th>
                  <th>Payment Method</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentBills && data.recentBills.length > 0 ? (
                  data.recentBills.map((b) => {
                    const formattedDate = (() => {
                      try {
                        const d = new Date(b.bill_date);
                        return d.toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        });
                      } catch {
                        return b.bill_date;
                      }
                    })();

                    return (
                      <tr key={b.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                              {b.bill_number}
                            </strong>
                            {b.is_demo === 1 && (
                              <span className="badge badge-amber" style={{ fontSize: '10px', padding: '1px 6px' }}>
                                Demo
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-body)' }}>{formattedDate}</td>
                        <td style={{ fontSize: '13px' }}>{b.customer_name || '—'}</td>
                        <td>
                          <strong style={{ color: '#064e3b', fontSize: '14px' }} className="tabular-nums">
                            ₹{Number(b.final_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </strong>
                        </td>
                        <td>
                          <span
                            className={b.payment_method === 'Not Specified' ? 'badge badge-neutral' : 'badge badge-green'}
                          >
                            {b.payment_method || 'Not Specified'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleOpenReceipt(b.id)}
                            className="btn btn-outline-green btn-sm"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            title="View & Print Bill Receipt"
                          >
                            <Eye size={13} />
                            <span>View Bill</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No bills generated yet. Click &quot;New Bill&quot; to create your first restaurant invoice!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bill Receipt Modal */}
      {activeReceiptBill && (
        <BillReceiptModal bill={activeReceiptBill} onClose={() => setActiveReceiptBill(null)} />
      )}
    </div>
  );
}
