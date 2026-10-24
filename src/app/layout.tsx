import type { Metadata } from 'next';
import '@/styles/globals.css';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'DineDesk | Restaurant Billing System & Owner Dashboard',
  description: 'Professional, modern, and easy-to-use restaurant billing and management dashboard. Generate bills, track daily income, and export receipts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
