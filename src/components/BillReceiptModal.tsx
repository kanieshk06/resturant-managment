'use client';

import React, { useRef, useState } from 'react';
import { Printer, Download, X, Check, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

interface BillItem {
  id?: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface BillData {
  id?: number;
  bill_number: string;
  bill_date: string;
  subtotal: number;
  discount: number;
  tax: number;
  final_amount: number;
  payment_method: string;
  customer_name?: string | null;
  is_demo?: number;
  items?: BillItem[];
}

interface RestaurantInfo {
  name: string;
  address: string;
  contact_number?: string;
  gstin?: string;
  receipt_footer?: string;
}

interface BillReceiptModalProps {
  bill: BillData | null;
  restaurant?: RestaurantInfo;
  onClose: () => void;
}

export default function BillReceiptModal({ bill, restaurant, onClose }: BillReceiptModalProps) {
  const [paperFormat, setPaperFormat] = useState<'thermal' | 'a4'>('thermal');
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!bill) return null;

  const defaultRestaurant: RestaurantInfo = {
    name: restaurant?.name || 'DineDesk Fine Dining',
    address: restaurant?.address || '14, Residency Road, Bengaluru, Karnataka 560025',
    contact_number: restaurant?.contact_number || '+91 98450 12345',
    gstin: restaurant?.gstin || '29AABCU9603R1Z7',
    receipt_footer: restaurant?.receipt_footer || 'Thank you for dining with DineDesk! Please visit again.',
  };

  // Format Indian date and time
  const formattedDateTime = (() => {
    try {
      const d = new Date(bill.bill_date);
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
      return bill.bill_date;
    }
  })();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    try {
      setDownloading(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: paperFormat === 'thermal' ? [80, 200] : 'a4',
      });

      const isThermal = paperFormat === 'thermal';
      const margin = isThermal ? 5 : 15;
      let y = margin + 5;

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(isThermal ? 13 : 18);
      doc.text(defaultRestaurant.name, isThermal ? 40 : 105, y, { align: 'center' });
      y += isThermal ? 5 : 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(isThermal ? 8 : 10);
      const splitAddress = doc.splitTextToSize(defaultRestaurant.address, isThermal ? 70 : 170);
      doc.text(splitAddress, isThermal ? 40 : 105, y, { align: 'center' });
      y += (splitAddress.length * (isThermal ? 3.5 : 5)) + 2;

      if (defaultRestaurant.contact_number) {
        doc.text(`Tel: ${defaultRestaurant.contact_number}`, isThermal ? 40 : 105, y, { align: 'center' });
        y += isThermal ? 4 : 6;
      }

      if (defaultRestaurant.gstin) {
        doc.text(`GSTIN: ${defaultRestaurant.gstin}`, isThermal ? 40 : 105, y, { align: 'center' });
        y += isThermal ? 4 : 6;
      }

      // Divider
      doc.setLineDashPattern([1, 1], 0);
      doc.line(margin, y, isThermal ? 75 : 195, y);
      y += isThermal ? 4 : 6;

      // Bill Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(isThermal ? 9 : 11);
      doc.text(`TAX INVOICE / RECEIPT`, isThermal ? 40 : 105, y, { align: 'center' });
      y += isThermal ? 5 : 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(isThermal ? 8 : 10);
      doc.text(`Bill No: ${bill.bill_number}`, margin, y);
      doc.text(`Date: ${formattedDateTime}`, isThermal ? 75 : 195, y, { align: 'right' });
      y += isThermal ? 4 : 6;

      if (bill.customer_name) {
        doc.text(`Customer: ${bill.customer_name}`, margin, y);
        y += isThermal ? 4 : 6;
      }

      // Divider
      doc.line(margin, y, isThermal ? 75 : 195, y);
      y += isThermal ? 4 : 6;

      // Items Table Header
      doc.setFont('helvetica', 'bold');
      doc.text('Item', margin, y);
      doc.text('Qty', isThermal ? 42 : 120, y, { align: 'center' });
      doc.text('Rate', isThermal ? 56 : 155, y, { align: 'right' });
      doc.text('Amount (Rs)', isThermal ? 75 : 195, y, { align: 'right' });
      y += isThermal ? 3 : 5;
      doc.line(margin, y, isThermal ? 75 : 195, y);
      y += isThermal ? 4 : 6;

      // Item rows
      doc.setFont('helvetica', 'normal');
      const items = bill.items || [];
      for (const item of items) {
        doc.text(item.item_name.substring(0, isThermal ? 18 : 35), margin, y);
        doc.text(String(item.quantity), isThermal ? 42 : 120, y, { align: 'center' });
        doc.text(Number(item.unit_price).toFixed(2), isThermal ? 56 : 155, y, { align: 'right' });
        doc.text(Number(item.total_price).toFixed(2), isThermal ? 75 : 195, y, { align: 'right' });
        y += isThermal ? 4 : 5.5;
      }

      y += 2;
      doc.line(margin, y, isThermal ? 75 : 195, y);
      y += isThermal ? 4 : 6;

      // Totals
      doc.text(`Subtotal:`, isThermal ? 45 : 140, y);
      doc.text(`Rs. ${Number(bill.subtotal).toFixed(2)}`, isThermal ? 75 : 195, y, { align: 'right' });
      y += isThermal ? 4 : 5.5;

      if (bill.discount > 0) {
        doc.text(`Discount:`, isThermal ? 45 : 140, y);
        doc.text(`- Rs. ${Number(bill.discount).toFixed(2)}`, isThermal ? 75 : 195, y, { align: 'right' });
        y += isThermal ? 4 : 5.5;
      }

      if (bill.tax > 0) {
        doc.text(`Tax / GST:`, isThermal ? 45 : 140, y);
        doc.text(`Rs. ${Number(bill.tax).toFixed(2)}`, isThermal ? 75 : 195, y, { align: 'right' });
        y += isThermal ? 4 : 5.5;
      }

      // Grand Total
      doc.setLineDashPattern([], 0);
      doc.line(isThermal ? 35 : 130, y, isThermal ? 75 : 195, y);
      y += isThermal ? 5 : 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(isThermal ? 10 : 12);
      doc.text(`TOTAL PAYABLE:`, isThermal ? 35 : 130, y);
      doc.text(`Rs. ${Number(bill.final_amount).toFixed(2)}`, isThermal ? 75 : 195, y, { align: 'right' });
      y += isThermal ? 6 : 8;

      // Payment Method
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(isThermal ? 8 : 10);
      doc.text(`Payment Method: ${bill.payment_method || 'Not Specified'}`, margin, y);
      y += isThermal ? 6 : 10;

      // Footer
      doc.setLineDashPattern([1, 1], 0);
      doc.line(margin, y, isThermal ? 75 : 195, y);
      y += isThermal ? 5 : 8;
      doc.setFontSize(isThermal ? 7.5 : 9);
      doc.text(defaultRestaurant.receipt_footer || 'Thank you for dining with us!', isThermal ? 40 : 105, y, { align: 'center' });

      doc.save(`${bill.bill_number}-Receipt.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="modal-overlay print-active" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: paperFormat === 'thermal' ? '460px' : '720px',
          padding: '24px',
        }}
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '17px', margin: 0 }}>Receipt Preview: {bill.bill_number}</h3>
            {bill.is_demo === 1 && (
              <span className="badge badge-amber" style={{ fontSize: '11px' }}>
                Sample Demo
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Paper Format Switcher (No Print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '20px',
            backgroundColor: '#f1f5f9',
            padding: '6px',
            borderRadius: '8px',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setPaperFormat('thermal')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: paperFormat === 'thermal' ? '#ffffff' : 'transparent',
                color: paperFormat === 'thermal' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: paperFormat === 'thermal' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Thermal (80mm)
            </button>
            <button
              onClick={() => setPaperFormat('a4')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: paperFormat === 'a4' ? '#ffffff' : 'transparent',
                color: paperFormat === 'a4' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: paperFormat === 'a4' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Standard A4 Paper
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="btn btn-secondary btn-sm"
            >
              <Download size={14} />
              <span>{downloading ? 'Exporting...' : 'PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Printer size={14} />
              <span>Print Bill</span>
            </button>
          </div>
        </div>

        {/* The Printable Receipt Body */}
        <div
          ref={receiptRef}
          className={paperFormat === 'thermal' ? 'thermal-receipt print-only-receipt' : 'print-only-receipt'}
          style={
            paperFormat === 'a4'
              ? {
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '36px',
                  backgroundColor: '#ffffff',
                }
              : {}
          }
        >
          {/* Restaurant Header */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h2
              style={{
                fontSize: paperFormat === 'thermal' ? '18px' : '24px',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '4px',
              }}
            >
              {defaultRestaurant.name}
            </h2>
            <p style={{ fontSize: '12px', color: '#475569', marginBottom: '3px' }}>
              {defaultRestaurant.address}
            </p>
            {defaultRestaurant.contact_number && (
              <p style={{ fontSize: '12px', color: '#475569', marginBottom: '3px' }}>
                Phone: {defaultRestaurant.contact_number}
              </p>
            )}
            {defaultRestaurant.gstin && (
              <p style={{ fontSize: '11px', color: '#64748b' }}>
                GSTIN: {defaultRestaurant.gstin}
              </p>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '14px 0' }} />

          {/* Bill Meta */}
          <div style={{ fontSize: '12px', lineHeight: 1.6, marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Bill No: {bill.bill_number}</span>
              <span style={{ color: '#475569' }}>{formattedDateTime}</span>
            </div>
            {bill.customer_name && (
              <div style={{ marginTop: '2px', color: '#334155' }}>
                <span>Customer: </span>
                <span style={{ fontWeight: 600 }}>{bill.customer_name}</span>
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '12px 0' }} />

          {/* Line Items Table */}
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', marginBottom: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '6px 0', fontWeight: 600 }}>Item</th>
                <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 600 }}>Qty</th>
                <th style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}>Rate</th>
                <th style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(bill.items || []).map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px dotted #f1f5f9' }}>
                  <td style={{ padding: '6px 0', fontWeight: 500, color: '#0f172a' }}>{item.item_name}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right' }}>₹{Number(item.unit_price).toFixed(2)}</td>
                  <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{Number(item.total_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '12px 0' }} />

          {/* Financial Breakdown */}
          <div style={{ fontSize: '12px', lineHeight: 1.8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span className="tabular-nums">₹{Number(bill.subtotal).toFixed(2)}</span>
            </div>

            {bill.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
                <span>Discount:</span>
                <span className="tabular-nums">- ₹{Number(bill.discount).toFixed(2)}</span>
              </div>
            )}

            {bill.tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax / GST:</span>
                <span className="tabular-nums">₹{Number(bill.tax).toFixed(2)}</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: paperFormat === 'thermal' ? '15px' : '18px',
                fontWeight: 800,
                color: '#064e3b',
                paddingTop: '8px',
                marginTop: '6px',
                borderTop: '2px solid #0f172a',
              }}
            >
              <span>TOTAL PAYABLE:</span>
              <span className="tabular-nums">₹{Number(bill.final_amount).toFixed(2)}</span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '14px 0' }} />

          {/* Payment Method Requirement: displays "Not Specified" if left blank */}
          <div style={{ fontSize: '12px', textAlign: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#64748b' }}>Payment Method: </span>
            <span
              style={{
                fontWeight: 700,
                color: bill.payment_method === 'Not Specified' ? '#64748b' : '#065f46',
                backgroundColor: bill.payment_method === 'Not Specified' ? '#f1f5f9' : '#ecfdf5',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
              }}
            >
              {bill.payment_method || 'Not Specified'}
            </span>
          </div>

          {/* Receipt Footer */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '11px',
              color: '#64748b',
              marginTop: '16px',
              paddingTop: '8px',
              borderTop: '1px dotted #cbd5e1',
            }}
          >
            <p>{defaultRestaurant.receipt_footer}</p>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden when printing) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-light)',
          }}
        >
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button onClick={handleDownloadPdf} disabled={downloading} className="btn btn-secondary">
            <Download size={15} />
            <span>Download PDF</span>
          </button>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={15} />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
