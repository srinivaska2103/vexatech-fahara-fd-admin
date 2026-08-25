'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, Search, ShieldCheck, User, Zap, Megaphone, CheckCircle2, 
  Wallet, TrendingUp, ShieldAlert, ChevronDown, Sparkles 
} from 'lucide-react';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminHeader() {
  const user = useAdminAuthStore((state) => state.user);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsQuickActionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-fahara-border bg-fahara-surface/90 px-3 sm:px-6 backdrop-blur-md transition-all shadow-xs">
      {/* Left side: Mobile Brand Logo & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Mobile Header Logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-2 md:hidden shrink-0">
          <div className="relative h-8 w-8 overflow-hidden rounded-xl border border-fahara-border shadow-xs">
            <img
              src="/Fahara Logo.jpeg"
              alt="Fahara Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold tracking-tight text-fahara-text leading-tight">Fahara</span>
            <span className="text-[8px] font-bold tracking-wider text-fahara-secondary uppercase leading-none">Admin</span>
          </div>
        </Link>

        {/* Quick Actions Popover Button (Mobile & Desktop) */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-fahara-primary text-white text-xs font-bold rounded-xl hover:bg-fahara-primary/90 transition-all cursor-pointer shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300 shrink-0" />
            <span className="inline-block">Actions</span>
            <ChevronDown className={`w-3 h-3 transition-transform shrink-0 ${isQuickActionsOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isQuickActionsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 sm:left-0 top-full mt-2 w-56 max-w-[calc(100vw-1.5rem)] bg-fahara-surface border border-fahara-border rounded-2xl shadow-xl z-50 overflow-hidden p-1.5 space-y-1"
              >
                <div className="px-3 py-2 border-b border-fahara-border bg-fahara-background/80 rounded-xl">
                  <span className="text-[10px] font-extrabold text-fahara-secondary uppercase tracking-wider block">
                    Fast Administrative Shortcuts
                  </span>
                </div>

                <Link
                  href="/admin/notifications/create?channel=email"
                  onClick={() => setIsQuickActionsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-fahara-text hover:bg-fahara-background hover:text-fahara-primary transition-colors cursor-pointer"
                >
                  <Megaphone className="w-4 h-4 text-fahara-primary shrink-0" />
                  <span className="truncate">New Broadcast Campaign</span>
                </Link>

                <Link
                  href="/admin/verifications?tab=cafes"
                  onClick={() => setIsQuickActionsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-fahara-text hover:bg-fahara-background hover:text-fahara-primary transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Verify Cafe Request</span>
                </Link>

                <Link
                  href="/admin/payouts"
                  onClick={() => setIsQuickActionsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-fahara-text hover:bg-fahara-background hover:text-fahara-primary transition-colors cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="truncate">Process Partner Payouts</span>
                </Link>

                <Link
                  href="/admin/revenue"
                  onClick={() => setIsQuickActionsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-fahara-text hover:bg-fahara-background hover:text-fahara-primary transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">Revenue Analytics</span>
                </Link>

                <Link
                  href="/admin/audit-logs"
                  onClick={() => setIsQuickActionsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-fahara-text hover:bg-fahara-background hover:text-fahara-primary transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="truncate">View System Audit Logs</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden items-center md:flex ml-2">
          <div className="relative w-64 lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fahara-secondary" />
            <input
              type="text"
              placeholder="Search cafes, bookings, users..."
              className="h-9 w-full rounded-xl border border-fahara-border bg-fahara-background pl-9 pr-4 text-xs text-fahara-text placeholder-fahara-secondary/60 focus:border-fahara-primary focus:bg-fahara-surface focus:outline-none focus:ring-2 focus:ring-fahara-accent/40 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Right Side Controls & Admin Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Notifications */}
        <Link
          href="/admin/notifications"
          className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-fahara-border bg-fahara-background text-fahara-text hover:bg-fahara-accent/20 hover:text-fahara-primary transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
          </span>
        </Link>

        {/* System Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live System</span>
        </div>

        {/* Admin Profile */}
        <div className="flex items-center gap-2 border-l border-fahara-border pl-2 sm:pl-3">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-fahara-primary/10 border border-fahara-primary/20 text-fahara-primary font-bold text-xs sm:text-sm shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4 text-fahara-primary" />}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-fahara-text truncate max-w-[120px]">
              {user?.name || user?.email?.split('@')[0] || 'Admin User'}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-fahara-primary">
              <ShieldCheck className="h-3 w-3" />
              <span>Admin</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
