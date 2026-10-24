'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, PlusCircle, Store, CheckCircle2, Menu } from 'lucide-react';
import { useNav } from '@/context/NavContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('DineDesk Fine Dining');
  const { toggleMobileMenu } = useNav();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      setCurrentTime(now.toLocaleString('en-IN', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

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
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          onClick={toggleMobileMenu}
          className="mobile-hamburger-btn"
          aria-label="Toggle Navigation Menu"
          style={{
            display: 'none',
            background: 'none',
            border: '1px solid var(--border-light)',
            padding: '7px',
            borderRadius: '8px',
            cursor: 'pointer',
            color: 'var(--text-main)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Menu size={20} />
        </button>

        <div
          className="header-store-icon"
          style={{
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Store size={18} />
        </div>
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-main)',
              margin: 0,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title || restaurantName}
          </h1>
          <p
            className="header-subtitle"
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle || 'Restaurant Management & Billing Dashboard'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Live Indian Time Display */}
        <div
          className="header-clock"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-body)',
          }}
        >
          <Clock size={14} color="#065f46" />
          <span className="tabular-nums">{currentTime || 'Loading...'}</span>
        </div>

        {/* Database Live Status Badge */}
        <div
          className="header-db-badge"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#065f46',
            backgroundColor: '#ecfdf5',
            padding: '5px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #a7f3d0',
          }}
        >
          <CheckCircle2 size={13} color="#10b981" />
          <span>Active</span>
        </div>

        {/* New Bill Button (Desktop header) */}
        <Link
          href="/billing"
          className="btn btn-primary header-new-bill-btn"
          style={{ padding: '6px 14px', fontSize: '13px' }}
        >
          <PlusCircle size={15} />
          <span>New Bill</span>
        </Link>
      </div>
    </header>
  );
}
