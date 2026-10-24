'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import { NavProvider } from '@/context/NavContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <main className="login-wrapper">{children}</main>;
  }

  return (
    <NavProvider>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          {children}
        </div>
        <MobileBottomNav />
      </div>
    </NavProvider>
  );
}
