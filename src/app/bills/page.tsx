'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BillReceiptModal from '@/components/BillReceiptModal';
import { 
  Search, 
  Calendar, 
  Filter, 
  Receipt, 
  Printer, 
  Download, 
  Eye, 
  RotateCcw,
  Plus,
  ArrowUpDown
} from 'lucide-react';
import Link from 'next/link';

interface BillItem {
  id?: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Bill {
  id: number;
  bill_number: string;
  bill_date: string;
  subtotal: number;
  discount: number;
  tax: number;
  final_amount: number;
  payment_method: string;
  customer_name: string | null;
  is_demo: number;
  created_at: string;
  items?: BillItem[];
}

export default function BillsHistoryPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [activeReceiptBill, setActiveReceiptBill] = useState<Bill | null>(null);
  const [restaurantSettings, setRestaurantSettings] = useState<any>(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedDate.trim()) params.append('date', selectedDate.trim());
      if (paymentFilter !== 'ALL') params.append('paymentMethod', paymentFilter);

      const res = await fetch(`/api/bills?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch bills');
      }
      const data = await res.json();
      setBills(data.bills || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setRestaurantSettings(data))
      .catch(() => {});
  }, [searchTerm, selectedDate, paymentFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDate('');
    setPaymentFilter('ALL');
  };

  const handleSetQuickDate = (type: 'today' | 'yesterday' | 'all') => {
    if (type === 'all') {
      setSelectedDate('');
      return;
    }
    const d = new Date();
    if (type === 'yesterday') {
      d.setDate(d.getDate() - 1);
    }
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const totalFilteredAmount = bills.reduce((sum, b) => sum + (Number(b.final_amount) || 0), 0);

  return (
    <div>
      <Header title="Bills History" subtitle="Search, filter, inspect and print generated bills" />

      <div className="page-content">
        {/* Top Metric Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Total Bills Listed
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)' }}>
              {loading ? '...' : bills.length}
            </div>
          </div>

          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Total Filtered Amount
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#065f46' }} className="tabular-nums">
              ₹{loading ? '...' : totalFilteredAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                New Transaction
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-body)', marginTop: '4px' }}>
                Need to bill a guest?
              </div>
            </div>
            <Link href="/billing" className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>Create Bill</span>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="card" style={{ marginBottom: '24px', padding: '18px 20px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              alignItems: 'flex-end',
            }}
          >
            {/* Search Input */}
            <div className="form-group">
              <label className="form-label">Search Bill # or Customer</label>
              <div style={{ position: 'relative' }}>
                <Search
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. BILL-001 or Customer name"
                  className="input-field"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            {/* Date Picker */}
            <div className="form-group">
              <label className="form-label">Filter by Date</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Payment Method Filter */}
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="select-field"
              >
                <option value="ALL">All Methods</option>
                <option value="Not Specified">Not Specified (Neutral)</option>
                <option value="Cash">Cash</option>
                <option value="UPI / GPay">UPI / GPay</option>
                <option value="Card">Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            {/* Quick Date Shortcuts & Reset */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleSetQuickDate('today')}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickDate('yesterday')}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                Yesterday
              </button>
              {(searchTerm || selectedDate || paymentFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-secondary btn-sm"
                  title="Clear all filters"
                  style={{ color: '#e11d48' }}
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bills Table */}
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill Number</th>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th style={{ textAlign: 'center' }}>Items</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                  <th style={{ textAlign: 'right' }}>Tax / Discount</th>
                  <th style={{ textAlign: 'right' }}>Total Amount</th>
                  <th>Payment Method</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.length > 0 ? (
                  bills.map((b) => {
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontSize: '14px' }}>
                              {b.bill_number}
                            </strong>
                            {b.is_demo === 1 && (
                              <span className="badge badge-amber" style={{ fontSize: '10px', padding: '1px 5px' }}>
                                Demo
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ fontSize: '13px' }}>{formattedDate}</td>
                        <td style={{ fontSize: '13px' }}>{b.customer_name || 'Walk-in'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {b.items?.length || 0}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }} className="tabular-nums">
                          ₹{Number(b.subtotal).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', fontSize: '12px' }} className="tabular-nums">
                          {b.tax > 0 && <span style={{ color: '#065f46' }}>+₹{Number(b.tax).toFixed(2)} </span>}
                          {b.discount > 0 && <span style={{ color: '#dc2626' }}>-₹{Number(b.discount).toFixed(2)}</span>}
                          {b.tax === 0 && b.discount === 0 && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <strong style={{ color: '#064e3b', fontSize: '15px' }} className="tabular-nums">
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
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => setActiveReceiptBill(b)}
                              className="btn btn-outline-green btn-sm"
                              style={{ padding: '5px 10px', fontSize: '12px' }}
                              title="Inspect Bill & Print Receipt"
                            >
                              <Eye size={13} />
                              <span>View Receipt</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      {loading ? (
                        'Loading bills from database...'
                      ) : (
                        <div>
                          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                            No bills found matching your filter criteria
                          </p>
                          <p style={{ fontSize: '13px', marginBottom: '14px' }}>
                            Try adjusting your search query, clearing date filter, or create a new bill.
                          </p>
                          <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">
                            Reset All Filters
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bill Receipt Viewer & Print Modal */}
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
