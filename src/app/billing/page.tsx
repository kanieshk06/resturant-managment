'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BillReceiptModal from '@/components/BillReceiptModal';
import { 
  Plus, 
  Trash2, 
  Receipt, 
  Printer, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  ShoppingBag,
  IndianRupee,
  Utensils
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ItemRow {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
}

interface QuickPreset {
  name: string;
  price: number;
  category: string;
}

const QUICK_PRESETS: QuickPreset[] = [
  { name: 'Masala Dosa', price: 120, category: 'South Indian' },
  { name: 'Plain Dosa', price: 90, category: 'South Indian' },
  { name: 'Idli Vada Combo', price: 100, category: 'South Indian' },
  { name: 'Paneer Butter Masala', price: 240, category: 'Main Course' },
  { name: 'Dal Makhani', price: 210, category: 'Main Course' },
  { name: 'Butter Naan', price: 50, category: 'Breads' },
  { name: 'Garlic Naan', price: 65, category: 'Breads' },
  { name: 'Tandoori Roti', price: 30, category: 'Breads' },
  { name: 'Veg Dum Biryani', price: 220, category: 'Rice & Biryani' },
  { name: 'Chicken Biryani', price: 280, category: 'Rice & Biryani' },
  { name: 'Cold Coffee', price: 90, category: 'Beverages' },
  { name: 'Fresh Lime Soda', price: 60, category: 'Beverages' },
  { name: 'Filter Coffee', price: 50, category: 'Beverages' },
  { name: 'Gulab Jamun (2 pcs)', price: 70, category: 'Desserts' },
];

export default function BillingPage() {
  const [nextBillNumber, setNextBillNumber] = useState<string>('Loading...');
  const [customerName, setCustomerName] = useState<string>('');
  const [items, setItems] = useState<ItemRow[]>([
    { id: '1', item_name: 'Masala Dosa', quantity: 1, unit_price: 120 },
  ]);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [applyGst, setApplyGst] = useState<boolean>(true);
  const [gstRate, setGstRate] = useState<number>(5);
  // Default payment method: "Not Specified" as strictly mandated
  const [paymentMethod, setPaymentMethod] = useState<string>('Not Specified');
  const [restaurantDetails, setRestaurantDetails] = useState<any>(null);

  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [createdBill, setCreatedBill] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Load initial restaurant settings & next bill number
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setRestaurantDetails(data);
          if (data.tax_rate !== undefined) {
            setGstRate(data.tax_rate);
          }
        }
      })
      .catch(() => {});

    fetch('/api/bills')
      .then((res) => res.json())
      .then((data) => {
        if (data?.nextBillNumber) {
          setNextBillNumber(data.nextBillNumber);
        }
      })
      .catch(() => {});
  }, []);

  // Add Item Row
  const handleAddItemRow = (preset?: { name: string; price: number }) => {
    const newItem: ItemRow = {
      id: Date.now().toString() + Math.random().toString(),
      item_name: preset ? preset.name : '',
      quantity: 1,
      unit_price: preset ? preset.price : 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Update item field
  const handleUpdateItem = (id: string, field: keyof ItemRow, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Remove item row
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      setItems([{ id: Date.now().toString(), item_name: '', quantity: 1, unit_price: 0 }]);
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset form
  const handleResetForm = () => {
    setCustomerName('');
    setItems([{ id: Date.now().toString(), item_name: '', quantity: 1, unit_price: 0 }]);
    setDiscountValue(0);
    setPaymentMethod('Not Specified');
    setStatusMessage(null);
  };

  // Recalculate totals
  const subtotal = items.reduce((sum, item) => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const price = Math.max(0, Number(item.unit_price) || 0);
    return sum + (qty * price);
  }, 0);

  const discountAmount = discountType === 'fixed'
    ? Math.min(subtotal, Math.max(0, Number(discountValue) || 0))
    : Math.min(subtotal, Math.round((subtotal * (Math.max(0, Number(discountValue) || 0) / 100)) * 100) / 100);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = applyGst ? Math.round((taxableAmount * (gstRate / 100)) * 100) / 100 : 0;
  const finalAmount = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;

  // Handle Save Bill
  const handleSubmitBill = async (andPrint: boolean = false) => {
    // Basic validation
    const validItems = items.filter((i) => i.item_name.trim().length > 0 && i.quantity > 0);
    if (validItems.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please add at least one valid item name with quantity.' });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const payload = {
        customer_name: customerName.trim() || undefined,
        items: validItems.map((i) => ({
          item_name: i.item_name.trim(),
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
        })),
        discount: discountAmount,
        tax_rate: applyGst ? gstRate : 0,
        payment_method: paymentMethod,
      };

      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save bill');
      }

      // Celebrate success
      try {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.7 },
        });
      } catch {}

      setStatusMessage({
        type: 'success',
        text: `Success! ${data.bill.bill_number} has been saved permanently to the database.`,
      });

      // Refresh next bill number for next transaction
      fetch('/api/bills')
        .then((r) => r.json())
        .then((d) => {
          if (d?.nextBillNumber) setNextBillNumber(d.nextBillNumber);
        });

      // Open receipt modal
      setCreatedBill(data.bill);

      if (andPrint) {
        setTimeout(() => {
          window.print();
        }, 500);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error saving bill' });
    } finally {
      setSaving(false);
    }
  };

  const categories = ['All', 'South Indian', 'Main Course', 'Breads', 'Rice & Biryani', 'Beverages', 'Desserts'];
  const filteredPresets = selectedCategory === 'All' 
    ? QUICK_PRESETS 
    : QUICK_PRESETS.filter((p) => p.category === selectedCategory);

  return (
    <div>
      <Header title="Restaurant Billing" subtitle="Create new customer invoice and print receipt" />

      <div className="page-content">
        {/* Status Toast / Alert Banner */}
        {statusMessage && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: statusMessage.type === 'success' ? '#ecfdf5' : '#fff1f2',
              color: statusMessage.type === 'success' ? '#065f46' : '#9f1239',
              border: `1px solid ${statusMessage.type === 'success' ? '#a7f3d0' : '#fecdd3'}`,
            }}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle size={18} color="#10b981" />
            ) : (
              <AlertCircle size={18} color="#e11d48" />
            )}
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{statusMessage.text}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.2fr)', gap: '28px' }}>
          {/* Left Column: Billing Form & Line Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Bill Header Info Card */}
            <div className="card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--border-light)',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Auto-Generated Bill Number
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#065f46', fontFamily: 'var(--font-mono)' }}>
                    {nextBillNumber}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Restaurant Info
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {restaurantDetails?.name || 'DineDesk Fine Dining'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {restaurantDetails?.address?.slice(0, 36) || 'Residency Road, Bengaluru'}...
                  </div>
                </div>
              </div>

              {/* Customer Name Field */}
              <div className="form-group">
                <label className="form-label">Customer Name (Optional)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar / Table 4 / Walk-in"
                  className="input-field"
                />
              </div>
            </div>

            {/* Quick Preset Item Chips */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Utensils size={17} color="#065f46" />
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>Quick Menu Item Presets</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click to add instantly</span>
              </div>

              {/* Category tabs */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: '1px solid',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      backgroundColor: selectedCategory === cat ? '#065f46' : '#ffffff',
                      color: selectedCategory === cat ? '#ffffff' : 'var(--text-body)',
                      borderColor: selectedCategory === cat ? '#065f46' : 'var(--border-light)',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Preset Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleAddItemRow(preset)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#0f172a',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ecfdf5';
                      e.currentTarget.style.borderColor = '#a7f3d0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <Plus size={13} color="#065f46" />
                    <span>{preset.name}</span>
                    <span style={{ color: '#065f46', fontWeight: 700 }} className="tabular-nums">
                      ₹{preset.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bill Line Items Table */}
            <div className="card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={18} color="#065f46" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                    Food Items ({items.length})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddItemRow()}
                  className="btn btn-outline-green btn-sm"
                >
                  <Plus size={14} />
                  <span>Add Custom Item</span>
                </button>
              </div>

              <div className="table-container" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>Food Item Name</th>
                      <th style={{ width: '18%', textAlign: 'center' }}>Quantity</th>
                      <th style={{ width: '20%', textAlign: 'right' }}>Price (₹)</th>
                      <th style={{ width: '17%', textAlign: 'right' }}>Total (₹)</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const lineTotal = Math.round((Number(item.quantity || 0) * Number(item.unit_price || 0)) * 100) / 100;
                      return (
                        <tr key={item.id}>
                          <td>
                            <input
                              type="text"
                              value={item.item_name}
                              onChange={(e) => handleUpdateItem(item.id, 'item_name', e.target.value)}
                              placeholder={`Item #${index + 1} name`}
                              className="input-field"
                              style={{ padding: '8px 10px', fontSize: '13px' }}
                              required
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(item.id, 'quantity', Math.max(1, Number(item.quantity) - 1))}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '4px',
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                }}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => handleUpdateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 1))}
                                className="input-field tabular-nums"
                                style={{ width: '54px', textAlign: 'center', padding: '6px 4px', fontSize: '13px' }}
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(item.id, 'quantity', Number(item.quantity) + 1)}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '4px',
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                }}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={item.unit_price}
                              onChange={(e) => handleUpdateItem(item.id, 'unit_price', Math.max(0, parseFloat(e.target.value) || 0))}
                              className="input-field tabular-nums"
                              style={{ width: '90px', textAlign: 'right', padding: '8px 10px', fontSize: '13px' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <strong style={{ color: '#064e3b' }} className="tabular-nums">
                              ₹{lineTotal.toFixed(2)}
                            </strong>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                              }}
                              title="Remove item"
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => handleAddItemRow()}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', borderStyle: 'dashed' }}
                >
                  <Plus size={14} />
                  <span>+ Add Another Line Item</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Billing Summary & Payment Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ position: 'sticky', top: '90px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                Bill Calculation & Payment
              </h3>

              {/* Subtotal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-body)' }}>Subtotal:</span>
                <strong className="tabular-nums">₹{subtotal.toFixed(2)}</strong>
              </div>

              {/* Discount Section */}
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Discount (Optional)</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setDiscountType('fixed')}
                      style={{
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid',
                        cursor: 'pointer',
                        backgroundColor: discountType === 'fixed' ? '#065f46' : '#ffffff',
                        color: discountType === 'fixed' ? '#ffffff' : 'var(--text-muted)',
                        borderColor: discountType === 'fixed' ? '#065f46' : '#cbd5e1',
                      }}
                    >
                      ₹ Flat
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percent')}
                      style={{
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid',
                        cursor: 'pointer',
                        backgroundColor: discountType === 'percent' ? '#065f46' : '#ffffff',
                        color: discountType === 'percent' ? '#ffffff' : 'var(--text-muted)',
                        borderColor: discountType === 'percent' ? '#065f46' : '#cbd5e1',
                      }}
                    >
                      % Percent
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min={0}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="input-field tabular-nums"
                    style={{ padding: '6px 10px', fontSize: '13px' }}
                  />
                  {discountAmount > 0 && (
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', whiteSpace: 'nowrap' }} className="tabular-nums">
                      - ₹{discountAmount.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Tax / GST Section */}
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={applyGst}
                      onChange={(e) => setApplyGst(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#065f46' }}
                    />
                    <span>Apply GST / Tax</span>
                  </label>
                  {applyGst && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        value={gstRate}
                        onChange={(e) => setGstRate(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="input-field tabular-nums"
                        style={{ width: '50px', padding: '4px 6px', fontSize: '12px', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>%</span>
                    </div>
                  )}
                </div>

                {applyGst && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-body)' }}>
                    <span>GST Amount ({gstRate}%):</span>
                    <strong className="tabular-nums">₹{taxAmount.toFixed(2)}</strong>
                  </div>
                )}
              </div>

              {/* Grand Total Highlight */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#ecfdf5',
                  border: '2px solid #a7f3d0',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#065f46', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Final Bill Amount Payable
                </div>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 800,
                    color: '#064e3b',
                    marginTop: '4px',
                    letterSpacing: '-0.02em',
                  }}
                  className="tabular-nums"
                >
                  ₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Payment Method Requirement:
                  Keep payment method neutral by default!
                  Display "Not Specified" until the owner chooses a method.
                  Do not force Cash, GPay, UPI, or Card.
              */}
              <div style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>
                  Payment Method (Neutral by default)
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { id: 'Not Specified', label: 'Not Specified (Default Neutral)' },
                    { id: 'Cash', label: 'Cash' },
                    { id: 'UPI / GPay', label: 'UPI / GPay / PhonePe' },
                    { id: 'Card', label: 'Credit / Debit Card' },
                    { id: 'Net Banking', label: 'Net Banking' },
                  ].map((method) => (
                    <label
                      key={method.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: paymentMethod === method.id ? '#065f46' : '#e2e8f0',
                        backgroundColor: paymentMethod === method.id ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: paymentMethod === method.id ? 600 : 500,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ accentColor: '#065f46' }}
                      />
                      <span>{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleSubmitBill(false)}
                  disabled={saving || subtotal <= 0}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', backgroundColor: '#065f46', borderColor: '#065f46' }}
                >
                  <Receipt size={18} />
                  <span>{saving ? 'Generating Bill...' : 'Generate & Save Bill'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmitBill(true)}
                  disabled={saving || subtotal <= 0}
                  className="btn btn-secondary"
                  style={{ width: '100%', borderColor: '#a7f3d0', color: '#065f46', backgroundColor: '#f0fdf4' }}
                >
                  <Printer size={16} />
                  <span>Save & Print Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetForm}
                  disabled={saving}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', color: 'var(--text-muted)' }}
                >
                  <RotateCcw size={14} />
                  <span>Reset Form</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Receipt Modal on Save */}
      {createdBill && (
        <BillReceiptModal
          bill={createdBill}
          restaurant={restaurantDetails}
          onClose={() => {
            setCreatedBill(null);
            handleResetForm();
          }}
        />
      )}
    </div>
  );
}
