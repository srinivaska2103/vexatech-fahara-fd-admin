'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Store, CalendarCheck, CreditCard, Layers, X, Sparkles, Users, 
  BadgeCheck, Bell, TrendingUp, Shield, ChevronRight, ArrowRight,
  UserCheck, CalendarDays, ShieldCheck, CheckCircle2, Tags, MessageSquare,
  FileX, AlertTriangle, RotateCcw, Receipt, Building2, Landmark,
  Clock, History, Mail, LifeBuoy, ShieldAlert, Compass, LogOut, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuthStore } from '@/store/adminAuthStore';

const COLORFUL_CATEGORIES = [
  {
    id: 'overview',
    title: 'Overview',
    bg: 'from-amber-500/15 to-orange-500/10 border-amber-500/30 text-amber-900',
    icon: LayoutDashboard,
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Analytics', href: '/admin/reports?view=analytics', icon: TrendingUp },
      { name: 'Activity Logs', href: '/admin/audit-logs', icon: History }
    ]
  },
  {
    id: 'users',
    title: 'Users & Staff',
    bg: 'from-blue-500/15 to-indigo-500/10 border-blue-500/30 text-blue-900',
    icon: Users,
    items: [
      { name: 'Customers', href: '/admin/customers', icon: Users },
      { name: 'Cafe Owners', href: '/admin/cafe-owners', icon: UserCheck },
      { name: 'Event Managers', href: '/admin/event-managers?tab=organizers', icon: CalendarDays },
      { name: 'Admin Users', href: '/admin/security?tab=admins', icon: ShieldCheck }
    ]
  },
  {
    id: 'cafes',
    title: 'Cafes & Outlets',
    bg: 'from-amber-700/15 to-yellow-600/10 border-amber-700/30 text-amber-950',
    icon: Store,
    items: [
      { name: 'All Cafes', href: '/admin/cafes', icon: Store },
      { name: 'Cafe Verifications', href: '/admin/verifications?tab=cafes', icon: CheckCircle2 },
      { name: 'Cafe Reviews', href: '/admin/reviews?type=cafes', icon: MessageSquare }
    ]
  },
  {
    id: 'events',
    title: 'Events & Experiences',
    bg: 'from-purple-500/15 to-pink-500/10 border-purple-500/30 text-purple-950',
    icon: Sparkles,
    items: [
      { name: 'All Events', href: '/admin/event-managers?tab=packages', icon: Sparkles },
      { name: 'Event Organizers', href: '/admin/event-managers', icon: Users },
      { name: 'Event Categories', href: '/admin/settings?tab=event_categories', icon: Tags }
    ]
  },
  {
    id: 'bookings',
    title: 'Bookings & Refunds',
    bg: 'from-emerald-500/15 to-teal-500/10 border-emerald-500/30 text-emerald-950',
    icon: CalendarCheck,
    items: [
      { name: 'All Bookings', href: '/admin/bookings', icon: CalendarCheck },
      { name: 'Cancellations', href: '/admin/refunds?type=cancellations', icon: FileX },
      { name: 'Disputes', href: '/admin/disputes', icon: AlertTriangle }
    ]
  },
  {
    id: 'finance',
    title: 'Finance & Payouts',
    bg: 'from-emerald-600/15 to-green-500/10 border-emerald-600/30 text-emerald-950',
    icon: CreditCard,
    items: [
      { name: 'Payments', href: '/admin/payments', icon: CreditCard },
      { name: 'Settlements', href: '/admin/payouts', icon: Receipt },
      { name: 'Refunds', href: '/admin/refunds', icon: RotateCcw },
      { name: 'Razorpay Accounts', href: '/admin/payout-accounts', icon: Building2 }
    ]
  },
  {
    id: 'communication',
    title: 'Communication',
    bg: 'from-sky-500/15 to-cyan-500/10 border-sky-500/30 text-sky-950',
    icon: Bell,
    items: [
      { name: 'Notifications', href: '/admin/notifications', icon: Bell },
      { name: 'Email Messages', href: '/admin/notifications/create?channel=email', icon: Mail }
    ]
  },
  {
    id: 'system',
    title: 'System & Security',
    bg: 'from-rose-500/15 to-red-500/10 border-rose-500/30 text-rose-950',
    icon: Shield,
    items: [
      { name: 'Support & Tickets', href: '/admin/disputes?view=tickets', icon: LifeBuoy },
      { name: 'Audit Logs', href: '/admin/audit-logs?view=system', icon: ShieldAlert },
      { name: 'Security & Roles', href: '/admin/security', icon: ShieldCheck }
    ]
  }
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const user = useAdminAuthStore((state) => state.user);
  const logout = useAdminAuthStore((state) => state.logout);

  return (
    <>
      {/* Fixed Bottom Navigation Bar in Mobile */}
      <nav suppressHydrationWarning className="fixed bottom-0 inset-x-0 z-40 bg-fahara-surface/95 backdrop-blur-md border-t border-fahara-border md:hidden shadow-lg">
        <div suppressHydrationWarning className="grid grid-cols-5 h-16 items-center">
          <Link
            href="/admin/dashboard"
            onClick={() => setIsDrawerOpen(false)}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              pathname === '/admin/dashboard'
                ? 'text-fahara-primary font-extrabold scale-105'
                : 'text-fahara-secondary hover:text-fahara-text'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </Link>

          <Link
            href="/admin/cafes"
            onClick={() => setIsDrawerOpen(false)}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              pathname.startsWith('/admin/cafes')
                ? 'text-fahara-primary font-extrabold scale-105'
                : 'text-fahara-secondary hover:text-fahara-text'
            }`}
          >
            <Store className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Cafes</span>
          </Link>

          <Link
            href="/admin/bookings"
            onClick={() => setIsDrawerOpen(false)}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              pathname.startsWith('/admin/bookings')
                ? 'text-fahara-primary font-extrabold scale-105'
                : 'text-fahara-secondary hover:text-fahara-text'
            }`}
          >
            <CalendarCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Bookings</span>
          </Link>

          <Link
            href="/admin/payments"
            onClick={() => setIsDrawerOpen(false)}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              pathname.startsWith('/admin/payments') || pathname.startsWith('/admin/payouts')
                ? 'text-fahara-primary font-extrabold scale-105'
                : 'text-fahara-secondary hover:text-fahara-text'
            }`}
          >
            <CreditCard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Finance</span>
          </Link>

          {/* Menu Drawer Toggle Button */}
          <button
            suppressHydrationWarning
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
              isDrawerOpen
                ? 'text-fahara-primary font-extrabold scale-105'
                : 'text-fahara-secondary hover:text-fahara-text'
            }`}
          >
            <div className="relative">
              <Layers className="w-5 h-5 mb-0.5" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-fahara-primary"></span>
              </span>
            </div>
            <span className="text-[10px] font-medium">Modules</span>
          </button>
        </div>
      </nav>

      {/* Colorful Slide-Up Bottom Sheet Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div suppressHydrationWarning className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Slide-Up Sheet Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative z-10 bg-fahara-surface border-t border-fahara-border rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden"
            >
              {/* Drag Handle Bar */}
              <div className="w-12 h-1.5 bg-fahara-border/80 rounded-full mx-auto my-3 shrink-0" />

              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-3 border-b border-fahara-border/60">
                <div>
                  <h3 className="text-base font-extrabold text-fahara-text tracking-tight flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-fahara-primary" /> Admin Modules & Shortcuts
                  </h3>
                  <p className="text-xs text-fahara-secondary mt-0.5">Explore all platform management features</p>
                </div>
                <button
                  suppressHydrationWarning
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 bg-fahara-background border border-fahara-border rounded-2xl text-fahara-secondary hover:text-fahara-text transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Colorful Category Cards Grid */}
              <div className="overflow-y-auto p-5 space-y-4 pb-28 scrollbar-thin">
                {COLORFUL_CATEGORIES.map(category => {
                  const CategoryIcon = category.icon;
                  return (
                    <div 
                      key={category.id} 
                      className={`bg-gradient-to-br ${category.bg} border rounded-2xl p-4 shadow-2xs space-y-2`}
                    >
                      <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                        <CategoryIcon className="w-4 h-4 font-bold" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider">{category.title}</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {category.items.map(item => {
                          const ItemIcon = item.icon;
                          const isActive = pathname === item.href;
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setIsDrawerOpen(false)}
                              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
                                isActive 
                                  ? 'bg-fahara-primary text-white shadow-2xs' 
                                  : 'bg-fahara-surface/80 hover:bg-fahara-surface text-fahara-text border border-fahara-border/50 shadow-2xs'
                              }`}
                            >
                              <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Account & Logout Container */}
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 space-y-3 pt-3">
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-xl bg-fahara-primary text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-extrabold text-fahara-text truncate">
                          {user?.name || 'Admin User'}
                        </span>
                        <span className="text-[10px] text-fahara-secondary truncate">
                          {user?.email || 'admin@fahara.com'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase bg-fahara-primary/10 text-fahara-primary px-2 py-0.5 rounded-full border border-fahara-primary/20">
                      SUPER ADMIN
                    </span>
                  </div>

                  <button
                    suppressHydrationWarning
                    onClick={() => {
                      setIsDrawerOpen(false);
                      logout();
                    }}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout Administrator Account</span>
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
