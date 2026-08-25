'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import MobileBottomNav from '@/components/MobileBottomNav';
import SessionExpiredModal from '@/components/admin/auth/SessionExpiredModal';
import OfflineIndicator from '@/components/admin/layout/OfflineIndicator';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  // Do not show sidebar or layout frame on auth pages
  const isAuthPage = [
    '/admin/login',
    '/admin/signup',
    '/admin/forgot-password',
    '/admin/reset-password',
    '/admin/verify-otp'
  ].some(route => pathname.startsWith(route));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div suppressHydrationWarning className="min-h-screen bg-fahara-background text-fahara-text font-sans antialiased pb-16 md:pb-0">
      {/* Desktop Sidebar navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div suppressHydrationWarning className="flex flex-col md:pl-64 transition-all duration-200 min-h-screen overflow-x-hidden min-w-0">
        {/* Top Header */}
        <AdminHeader />

        {/* Dynamic Page Content */}
        <main suppressHydrationWarning className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Fixed Bottom Bar & Colorful Menu Drawer */}
      <MobileBottomNav />

      <SessionExpiredModal />
      <OfflineIndicator />
    </div>
  );
}
