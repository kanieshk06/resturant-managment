'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  History, 
  BarChart3, 
  Settings, 
  LogOut, 
  UtensilsCrossed,
  ShieldCheck,
  X
} from 'lucide-react';
import { useNav } from '@/context/NavContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileMenuOpen, closeMobileMenu } = useNav();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'New Bill', href: '/billing', icon: Receipt },
    { label: 'Bills History', href: '/bills', icon: History },
    { label: 'Daily Reports', href: '/reports', icon: BarChart3 },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      closeMobileMenu();
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-sidebar-backdrop no-print"
          onClick={closeMobileMenu}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 90,
          }}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`sidebar no-print ${isMobileMenuOpen ? 'mobile-sidebar-open' : ''}`}
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-sidebar)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          minHeight: '100vh',
          zIndex: 100,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '20px 18px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#065f46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(6, 95, 70, 0.5)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
              }}
            >
              <UtensilsCrossed size={20} color="#34d399" />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                Dine<span style={{ color: '#34d399' }}>Desk</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                Restaurant Billing
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={closeMobileMenu}
            className="mobile-close-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#64748b',
              padding: '6px 12px',
              fontWeight: 700,
            }}
          >
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  backgroundColor: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '14px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  borderLeft: isActive ? '3px solid #34d399' : '3px solid transparent',
                }}
              >
                <Icon size={19} color={isActive ? '#34d399' : '#94a3b8'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Action Button */}
        <div style={{ padding: '0 16px 16px' }}>
          <Link
            href="/billing"
            onClick={closeMobileMenu}
            className="btn btn-primary"
            style={{
              width: '100%',
              backgroundColor: '#10b981',
              borderColor: '#10b981',
              color: '#064e3b',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Receipt size={17} />
            <span>+ Quick New Bill</span>
          </Link>
        </div>

        {/* Owner Profile & Logout Footer */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#065f46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #10b981',
              }}
            >
              <ShieldCheck size={18} color="#34d399" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                Owner Portal
              </div>
              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 500 }}>
                Authorized Active
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out of owner dashboard"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
