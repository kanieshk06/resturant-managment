'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, PlusCircle, Store, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('DineDesk Fine Dining');

  useEffect(() => {
    // Format Indian date and time
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setCurrentTime(now.toLocaleString('en-IN', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Fetch restaurant name
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.name) {
          setRestaurantName(data.name);
        }
      })
      .catch(() => {});

    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="app-header no-print"
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-light)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Store size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', margin: 0, lineHeight: 1.2 }}>
            {title || restaurantName}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            {subtitle || 'Restaurant Management & Billing Dashboard'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Live Indian Time Display */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-body)',
          }}
        >
          <Clock size={15} color="#065f46" />
          <span className="tabular-nums">{currentTime || 'Loading time...'}</span>
        </div>

        {/* Database Live Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#065f46',
            backgroundColor: '#ecfdf5',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #a7f3d0',
          }}
        >
          <CheckCircle2 size={14} color="#10b981" />
          <span>DB Connected</span>
        </div>

        {/* New Bill Button */}
        <Link href="/billing" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          <PlusCircle size={16} />
          <span>New Bill</span>
        </Link>
      </div>
    </header>
  );
}
