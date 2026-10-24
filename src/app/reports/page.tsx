'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BillReceiptModal from '@/components/BillReceiptModal';
import { 
  Calendar, 
  IndianRupee, 
  TrendingUp, 
  FileText, 
  CreditCard, 
  Clock, 
  Eye, 
  CalendarDays,
  Info,
  CheckCircle2
} from 'lucide-react';

interface ReportData {
  todayIncome: number;
  todayCount: number;
  yesterdayIncome: number;
  yesterdayCount: number;
  monthIncome: number;
  monthCount: number;
  totalBillsCount: number;
  allTimeIncome: number;
  dailyHistory: Array<{ date: string; total_income: number; bills_count: number }>;
  selectedDate: string;
  selectedDateIncome: number;
  selectedDateBillsCount: number;
  selectedDateAvg: number;
  selectedDateBills: Array<any>;
  specifiedPaymentStats: Array<{ payment_method: string; count: number; total_amount: number }>;
  notSpecifiedCount: number;
  notSpecifiedAmount: number;
  hasSpecifiedPayments: boolean;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [activeReceiptBill, setActiveReceiptBill] = useState<any | null>(null);
  const [restaurantSettings, setRestaurantSettings] = useState<any>(null);

  const fetchReports = async (dateStr?: string) => {
    try {
      setLoading(true);
      const queryDate = dateStr || selectedDate;
      const res = await fetch(`/api/reports?date=${queryDate}`);
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to load reports');
      }
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(selectedDate);
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setRestaurantSettings(d))
      .catch(() => {});
  }, [selectedDate]);

  const handleSelectDate = (d: string) => {
    setSelectedDate(d);
  };

  return (
    <div>
      <Header title="Daily Reports & Financial Analytics" subtitle="Comprehensive income tracking computed from real saved bills" />

      <div className="page-content">
        {/* 4 Core Financial Summary Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '20px',
            marginBottom: '28px',
          }}
        >
          {/* 1. Today's Total Income */}
          <div className="card">
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Today’s Total Income
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#065f46', marginTop: '6px' }} className="tabular-nums">
              ₹{loading ? '...' : (reportData?.todayIncome ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              {reportData?.todayCount ?? 0} bills generated today
            </div>
          </div>

          {/* 2. Yesterday's Total Income */}
          <div className="card">
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Yesterday’s Total Income
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }} className="tabular-nums">
              ₹{loading ? '...' : (reportData?.yesterdayIncome ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              {reportData?.yesterdayCount ?? 0} bills from yesterday
            </div>
          </div>

          {/* 3. Current Month's Total Income */}
          <div className="card">
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Current Month Income
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0284c7', marginTop: '6px' }} className="tabular-nums">
              ₹{loading ? '...' : (reportData?.monthIncome ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              {reportData?.monthCount ?? 0} bills this calendar month
            </div>
          </div>

          {/* 4. Total Number of Bills Overall */}
          <div className="card">
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Total Number of Bills
            </span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }} className="tabular-nums">
              {loading ? '...' : (reportData?.totalBillsCount ?? 0)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Cumulative database records
            </div>
          </div>
        </div>

        {/* Date Selector & Selected Date Report Section */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-light)',
              marginBottom: '20px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Date-Specific Income & Bills Lookup
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Select any date to inspect full bills and income calculated for that day
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-body)' }}>
                Select Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field"
                style={{ width: 'auto', padding: '6px 12px' }}
              />
            </div>
          </div>

          {/* Selected Date Summary Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #e2e8f0',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Selected Date Total Income
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#065f46', marginTop: '4px' }} className="tabular-nums">
                ₹{(reportData?.selectedDateIncome ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Bills Generated On {selectedDate}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                {reportData?.selectedDateBillsCount ?? 0} Bills
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Average Bill Amount
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }} className="tabular-nums">
                ₹{(reportData?.selectedDateAvg ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Selected Date Bills Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill Number</th>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.selectedDateBills && reportData.selectedDateBills.length > 0 ? (
                  reportData.selectedDateBills.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>{b.bill_number}</strong>
                        {b.is_demo === 1 && (
                          <span className="badge badge-amber" style={{ marginLeft: '6px', fontSize: '10px' }}>
                            Demo
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        {new Date(b.bill_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </td>
                      <td style={{ fontSize: '13px' }}>{b.customer_name || 'Walk-in'}</td>
                      <td>
                        <strong style={{ color: '#064e3b' }} className="tabular-nums">
                          ₹{Number(b.final_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </strong>
                      </td>
                      <td>
                        <span className={b.payment_method === 'Not Specified' ? 'badge badge-neutral' : 'badge badge-green'}>
                          {b.payment_method || 'Not Specified'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setActiveReceiptBill(b)}
                          className="btn btn-outline-green btn-sm"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                        >
                          <Eye size={13} />
                          <span>View Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                      No bills recorded for date: <strong>{selectedDate}</strong>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2 Columns: Date-wise Bill History & Payment Method Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {/* Daily Income Report / Date-wise Bill History */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CalendarDays size={18} color="#065f46" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                Daily Income History (Last 30 Active Days)
              </h3>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th style={{ textAlign: 'center' }}>Total Bills</th>
                    <th style={{ textAlign: 'right' }}>Day&apos;s Income</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.dailyHistory && reportData.dailyHistory.length > 0 ? (
                    reportData.dailyHistory.map((d) => (
                      <tr key={d.date} style={{ backgroundColor: selectedDate === d.date ? '#ecfdf5' : 'transparent' }}>
                        <td style={{ fontWeight: 600 }}>{d.date}</td>
                        <td style={{ textAlign: 'center' }}>{d.bills_count}</td>
                        <td style={{ textAlign: 'right' }}>
                          <strong style={{ color: '#064e3b' }} className="tabular-nums">
                            ₹{Number(d.total_income).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </strong>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleSelectDate(d.date)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                          >
                            Inspect Day
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        No history available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Method Summary (Strict requirement: ONLY when payment methods are specified!) */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CreditCard size={18} color="#065f46" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                Payment Method Summary
              </h3>
            </div>

            {reportData?.hasSpecifiedPayments ? (
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Summary of bills where payment method was chosen:
                </p>

                <div className="table-container" style={{ marginBottom: '16px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Method</th>
                        <th style={{ textAlign: 'center' }}>Count</th>
                        <th style={{ textAlign: 'right' }}>Total Collected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.specifiedPaymentStats.map((item) => (
                        <tr key={item.payment_method}>
                          <td>
                            <strong style={{ color: '#064e3b' }}>{item.payment_method}</strong>
                          </td>
                          <td style={{ textAlign: 'center' }}>{item.count}</td>
                          <td style={{ textAlign: 'right' }}>
                            <strong className="tabular-nums">
                              ₹{Number(item.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {reportData.notSpecifiedCount > 0 && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      backgroundColor: '#f8fafc',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    Note: <strong>{reportData.notSpecifiedCount}</strong> bill(s) have payment method set as &ldquo;Not Specified&rdquo; (₹{reportData.notSpecifiedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}).
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  padding: '24px',
                  backgroundColor: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed #cbd5e1',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    color: '#64748b',
                  }}
                >
                  <Info size={20} />
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  No Payment Methods Specified Yet
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  Per policy, DineDesk keeps payment methods neutral by default (&ldquo;Not Specified&rdquo;).
                  Once you select Cash, UPI, or Card on bills, detailed breakdown analytics will appear here.
                </p>
                {reportData?.notSpecifiedCount ? (
                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#065f46', fontWeight: 600 }}>
                    {reportData.notSpecifiedCount} bill(s) currently recorded as &ldquo;Not Specified&rdquo;.
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bill Receipt Modal */}
      {activeReceiptBill && (
        <BillReceiptModal
          bill={activeReceiptBill}
          restaurant={restaurantSettings}
          onClose={() => setActiveReceiptBill(null)}
        />
      )}
    </div>
  );
}
