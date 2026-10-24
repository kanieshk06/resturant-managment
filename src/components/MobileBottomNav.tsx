'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  History, 
  BarChart3, 
  Settings,
  Plus
} from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Bills', href: '/bills', icon: History },
    { label: 'New Bill', href: '/billing', icon: Plus, isPrimary: true },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav
      className="mobile-bottom-nav no-print"
      aria-label="Mobile Navigation"
      style={{
        display: 'none', // Controlled by CSS @media (max-width: 768px)
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '6px 12px 10px',
        zIndex: 50,
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        if (item.isPrimary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textDecoration: 'none',
                marginTop: '-22px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#065f46',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(6, 95, 70, 0.4)',
                  border: '3px solid #ffffff',
                }}
              >
                <Plus size={24} strokeWidth={2.5} />
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isActive ? '#065f46' : '#475569',
                  marginTop: '2px',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              padding: '4px 8px',
              minWidth: '54px',
              color: isActive ? '#065f46' : '#64748b',
              transition: 'color 0.15s ease',
            }}
          >
            <Icon size={20} color={isActive ? '#065f46' : '#94a3b8'} strokeWidth={isActive ? 2.5 : 2} />
            <span
              style={{
                fontSize: '10px',
                fontWeight: isActive ? 700 : 500,
                marginTop: '3px',
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
