'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, BarChart3, Activity, Users, UserCheck, CalendarDays, 
  ShieldCheck, Coffee, CheckCircle2, Star, Grid, Sparkles, Tags, 
  MessageSquare, Calendar, FileX, AlertTriangle, CreditCard, 
  Wallet, RotateCcw, Receipt, Building2, Landmark, Clock, History, 
  BadgeCheck, Bell, Mail, MessageCircle, Megaphone, TrendingUp, FileSpreadsheet, 
  Download, Settings, Percent, FileText, BellRing, Lock, Sliders, LifeBuoy, 
  ShieldAlert, Cpu, Shield, User, HelpCircle, LogOut, X, ChevronRight, ChevronDown,
  ChevronsUpDown, Layers, CornerDownRight
} from 'lucide-react';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import api from '@/lib/axios';

const getItemIconColors = (href, name) => {
  if (href.includes('dashboard')) return 'bg-amber-100/90 text-amber-700 border-amber-200/70';
  if (href.includes('analytics') || href.includes('reports?view=analytics')) return 'bg-purple-100/90 text-purple-700 border-purple-200/70';
  if (href.includes('audit-logs')) return 'bg-slate-100/90 text-slate-700 border-slate-200/70';
  
  if (href.includes('customers')) return 'bg-sky-100/90 text-sky-700 border-sky-200/70';
  if (href.includes('cafe-owners')) return 'bg-blue-100/90 text-blue-700 border-blue-200/70';
  if (href.includes('event-managers')) return 'bg-teal-100/90 text-teal-700 border-teal-200/70';
  if (name.includes('Admin')) return 'bg-rose-100/90 text-rose-700 border-rose-200/70';
  
  if (href.includes('cafes') || href.includes('cafe')) return 'bg-indigo-100/90 text-indigo-700 border-indigo-200/70';
  if (href.includes('events') || href.includes('event')) return 'bg-cyan-100/90 text-cyan-700 border-cyan-200/70';
  if (href.includes('reviews')) return 'bg-amber-100/90 text-amber-600 border-amber-200/70';
  if (href.includes('categories')) return 'bg-violet-100/90 text-violet-700 border-violet-200/70';
  
  if (href.includes('bookings')) return 'bg-emerald-100/90 text-emerald-700 border-emerald-200/70';
  if (href.includes('refunds')) return 'bg-rose-100/90 text-rose-700 border-rose-200/70';
  if (href.includes('disputes')) return 'bg-orange-100/90 text-orange-700 border-orange-200/70';
  
  if (href.includes('payments')) return 'bg-emerald-100/90 text-emerald-800 border-emerald-200/70';
  if (href.includes('payouts')) return 'bg-emerald-100/90 text-emerald-800 border-emerald-200/70';
  if (href.includes('transactions')) return 'bg-blue-100/90 text-blue-700 border-blue-200/70';
  if (href.includes('payout-accounts')) return 'bg-amber-100/90 text-amber-800 border-amber-200/70';
  
  if (href.includes('verifications')) return 'bg-amber-100/90 text-amber-700 border-amber-200/70';
  if (href.includes('notifications')) return 'bg-rose-100/90 text-rose-700 border-rose-200/70';
  if (href.includes('revenue')) return 'bg-emerald-100/90 text-emerald-700 border-emerald-200/70';
  
  return 'bg-stone-100 text-stone-700 border-stone-200/70';
};

const navigationGroups = [
  {
    id: 'overview',
    title: 'OVERVIEW',
    icon: LayoutDashboard,
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Analytics', href: '/admin/reports?view=analytics', icon: BarChart3 },
      { name: 'Activity Logs', href: '/admin/audit-logs', icon: Activity },
    ]
  },
  {
    id: 'users',
    title: 'USER MANAGEMENT',
    icon: Users,
    items: [
      { name: 'Customers', href: '/admin/customers', icon: Users },
      { name: 'Cafe Owners', href: '/admin/cafe-owners', icon: UserCheck },
      { name: 'Event Managers', href: '/admin/event-managers?tab=organizers', icon: CalendarDays },
      { name: 'Admin Users', href: '/admin/security?tab=admins', icon: ShieldCheck },
    ]
  },
  {
    id: 'cafes',
    title: 'CAFE MANAGEMENT',
    icon: Coffee,
    items: [
      { name: 'All Cafes', href: '/admin/cafes', icon: Coffee },
      { name: 'Cafe Verification', href: '/admin/verifications?tab=cafes', icon: CheckCircle2 },
      { name: 'Cafe Reviews', href: '/admin/reviews?type=cafes', icon: Star },
      { name: 'Categories & Amenities', href: '/admin/settings?tab=categories', icon: Grid },
    ]
  },
  {
    id: 'events',
    title: 'EVENT MANAGEMENT',
    icon: Sparkles,
    items: [
      { name: 'All Events', href: '/admin/event-managers?tab=packages', icon: Sparkles },
      { name: 'Event Organizers', href: '/admin/event-managers', icon: Users },
      { name: 'Event Categories', href: '/admin/settings?tab=event_categories', icon: Tags },
      { name: 'Event Reviews', href: '/admin/reviews?type=events', icon: MessageSquare },
    ]
  },
  {
    id: 'bookings',
    title: 'BOOKINGS',
    icon: Calendar,
    items: [
      { name: 'All Bookings', href: '/admin/bookings', icon: Calendar },
      { name: 'Cancellations', href: '/admin/refunds?type=cancellations', icon: FileX },
      { name: 'Disputes', href: '/admin/disputes', icon: AlertTriangle },
    ]
  },
  {
    id: 'finance',
    title: 'FINANCE',
    icon: Wallet,
    items: [
      { name: 'Payments', href: '/admin/payments', icon: CreditCard },
      { name: 'Settlements', href: '/admin/payouts', icon: Wallet },
      { name: 'Refunds', href: '/admin/refunds', icon: RotateCcw },
      { name: 'Transactions', href: '/admin/transactions', icon: Receipt },
      { name: 'Razorpay Vendors', href: '/admin/payout-accounts', icon: Building2 },
    ]
  },
  {
    id: 'verification',
    title: 'VERIFICATION',
    icon: BadgeCheck,
    badge: 'NEW',
    items: [
      { name: 'Cafe Bank Verification', href: '/admin/payout-accounts?tab=bank', icon: Landmark },
      { name: 'Event Manager Verification', href: '/admin/verifications', icon: UserCheck },
      { name: 'Pending Approvals', href: '/admin/verifications?status=PENDING', icon: Clock },
      { name: 'Verification History', href: '/admin/audit-logs?filter=verifications', icon: History },
    ]
  },
  {
    id: 'communication',
    title: 'COMMUNICATION',
    icon: Bell,
    items: [
      { name: 'Notifications', href: '/admin/notifications', icon: Bell },
      { name: 'Email Messages', href: '/admin/notifications/create?channel=email', icon: Mail },
    ]
  },
  {
    id: 'reports',
    title: 'REPORTS',
    icon: TrendingUp,
    items: [
      { name: 'Revenue Reports', href: '/admin/revenue', icon: TrendingUp },
      { name: 'Booking Reports', href: '/admin/reports', icon: FileSpreadsheet },
    ]
  },
  {
    id: 'system',
    title: 'SYSTEM',
    icon: Shield,
    items: [
      { name: 'Support & Tickets', href: '/admin/disputes?view=tickets', icon: LifeBuoy },
      { name: 'Audit Logs', href: '/admin/audit-logs?view=system', icon: ShieldAlert },
      { name: 'Security & Roles', href: '/admin/security', icon: ShieldCheck },
    ]
  }
];

function SidebarContent({ isMobileOpen, onCloseMobile }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const logout = useAdminAuthStore((state) => state.logout);
  const user = useAdminAuthStore((state) => state.user);
  const setUser = useAdminAuthStore((state) => state.setUser);

  // Fetch real logged in admin profile if user state is missing details
  useEffect(() => {
    async function loadAdminProfile() {
      if (!user?.name || !user?.email) {
        try {
          const res = await api.get('/users/profile');
          if (res.data?.data) {
            const profile = res.data.data;
            setUser({ ...user, ...profile, role: profile.roles?.name || profile.role || 'ADMIN' });
          }
        } catch (err) {
          // Silent fallback
        }
      }
    }
    loadAdminProfile();
  }, [user]);

  const queryStr = searchParams?.toString();
  const fullPath = pathname + (queryStr ? `?${queryStr}` : '');

  const getActiveItem = () => {
    for (const group of navigationGroups) {
      for (const item of group.items) {
        if (fullPath === item.href) {
          return { groupId: group.id, itemName: item.name };
        }
      }
    }
    for (const group of navigationGroups) {
      for (const item of group.items) {
        if (pathname === item.href) {
          return { groupId: group.id, itemName: item.name };
        }
      }
    }
    for (const group of navigationGroups) {
      for (const item of group.items) {
        const cleanHref = item.href.split('?')[0];
        if (cleanHref !== '/admin/dashboard' && pathname.startsWith(cleanHref)) {
          return { groupId: group.id, itemName: item.name };
        }
      }
    }
    return { groupId: 'overview', itemName: 'Dashboard' };
  };

  const activeInfo = getActiveItem();

  const [openSections, setOpenSections] = useState({});

  useEffect(() => {
    if (activeInfo.groupId) {
      setOpenSections((prev) => ({
        ...prev,
        [activeInfo.groupId]: true,
        overview: prev.overview !== undefined ? prev.overview : true
      }));
    }
  }, [fullPath]);

  const toggleSection = (groupId) => {
    setOpenSections((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const toggleExpandAll = () => {
    const allOpen = Object.values(openSections).every(Boolean);
    const newState = {};
    navigationGroups.forEach((g) => {
      newState[g.id] = !allOpen;
    });
    setOpenSections(newState);
  };

  return (
    <div className="flex h-full flex-col bg-white border-r border-[#E8DED5] shadow-xs select-none overflow-x-hidden">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-[#E8DED5] px-5 py-4 flex-shrink-0 bg-[#FFF8F0]/50">
        <Link 
          href="/admin/dashboard" 
          onClick={onCloseMobile}
          className="flex items-center gap-3 group"
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-[#DDB892]/60 bg-white shadow-xs transition-transform group-hover:scale-105">
            <img 
              src="/Fahara Logo.jpeg" 
              alt="Fahara Logo" 
              className="h-full w-full object-cover" 
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-[#2C1810]">Fahara</span>
              <span className="rounded-full bg-[#6F4E37]/10 px-2 py-0.5 text-[9px] font-extrabold text-[#6F4E37] uppercase tracking-wider border border-[#6F4E37]/20">
                Admin
              </span>
            </div>
            <span className="text-[11px] font-bold text-stone-500">Management Suite</span>
          </div>
        </Link>
        <button
          onClick={onCloseMobile}
          className="rounded-xl p-1.5 text-stone-500 hover:bg-[#FFF8F0] hover:text-[#2C1810] md:hidden transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-between px-4 py-2 bg-[#FFF8F0]/70 border-b border-[#E8DED5] text-[10px] font-extrabold text-[#6F4E37]">
        <span>MENU CATEGORIES</span>
        <button 
          onClick={toggleExpandAll}
          className="flex items-center gap-1 hover:text-[#2C1810] transition-colors cursor-pointer"
          title="Toggle Expand All"
        >
          <ChevronsUpDown className="h-3 w-3" />
          <span>Toggle All</span>
        </button>
      </div>

      {/* Navigation Accordion Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 custom-scrollbar">
        {navigationGroups.map((group) => {
          const isOpen = !!openSections[group.id];
          const hasActiveChild = group.id === activeInfo.groupId;

          return (
            <div key={group.id} className="rounded-2xl transition-all">
              {/* Simple, clean flat category header */}
              <button
                onClick={() => toggleSection(group.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider rounded-xl transition-all duration-150 cursor-pointer ${
                  hasActiveChild 
                    ? 'text-[#6F4E37] font-black bg-[#FFF8F0]' 
                    : 'text-stone-500 hover:text-[#2C1810] hover:bg-[#FFF8F0]/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="truncate">{group.title}</span>
                  {group.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-amber-500 text-white rounded-full">
                      {group.badge}
                    </span>
                  )}
                </div>
                <ChevronRight className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-90 text-[#6F4E37]' : ''}`} />
              </button>

              {/* Sublinks with smooth motion height expansion */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1.5 ml-4 border-l border-[#E8DED5] pl-2.5 space-y-1 my-1.5">
                      {group.items.map((item) => {
                        const isActive = group.id === activeInfo.groupId && item.name === activeInfo.itemName;
                        const ItemIcon = item.icon;
                        const iconStyle = getItemIconColors(item.href, item.name);

                        return (
                          <motion.div key={item.name} whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}>
                            <Link
                              href={item.href}
                              onClick={onCloseMobile}
                              className={`group relative flex items-center rounded-2xl px-2.5 py-1.5 transition-all duration-200 cursor-pointer ${
                                isActive
                                  ? 'bg-[#FFF5EA] text-[#4A2C11] font-black border border-[#DDB892]/60 shadow-2xs translate-x-0.5'
                                  : 'text-[#2C1810]/85 font-extrabold hover:bg-[#FFF8F0]/80 hover:text-[#4A2C11] hover:translate-x-0.5'
                              }`}
                            >
                              {/* Branch Guide Arrow ↳ */}
                              <CornerDownRight className="w-3 h-3 text-stone-300 stroke-[2] shrink-0 mr-1.5 group-hover:text-[#6F4E37] transition-colors" />

                              {/* Signature Colored Icon Badge */}
                              <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mr-2 border shadow-2xs transition-transform group-hover:scale-110 ${iconStyle}`}>
                                <ItemIcon className="w-3.5 h-3.5" />
                              </div>

                              <span className="truncate flex-1 text-[11px] font-extrabold">{item.name}</span>

                              <ChevronRight className="w-3 h-3 text-[#6F4E37] opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom Profile Footer */}
      <div className="border-t border-fahara-border p-3 bg-fahara-surface flex-shrink-0 space-y-2">
        <div className="flex items-center justify-between px-2 py-1 text-xs">
          <Link 
            href="/admin/settings"
            onClick={onCloseMobile}
            className="flex items-center gap-1.5 text-fahara-secondary hover:text-fahara-primary font-medium transition-colors cursor-pointer"
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile</span>
          </Link>

          <Link 
            href="/admin/disputes"
            onClick={onCloseMobile}
            className="flex items-center gap-1.5 text-fahara-secondary hover:text-fahara-primary font-medium transition-colors cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Help & Support</span>
          </Link>
        </div>

        {/* Interactive User Profile Card */}
        <div className="flex items-center justify-between rounded-2xl bg-fahara-background p-2.5 border border-fahara-border hover:border-fahara-primary/40 transition-all shadow-2xs group">
          <Link 
            href="/admin/settings" 
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 overflow-hidden flex-1 cursor-pointer"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-fahara-primary text-white font-extrabold text-sm shadow-2xs group-hover:scale-105 transition-transform">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-extrabold text-fahara-text truncate group-hover:text-fahara-primary transition-colors">
                {user?.name || 'Admin User'}
              </span>
              <span className="text-[10px] text-fahara-secondary truncate">
                {user?.email || 'admin@fahara.com'}
              </span>
            </div>
          </Link>

          <button
            onClick={logout}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer shrink-0 ml-1"
            title="Logout Admin"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar({ isMobileOpen = false, onCloseMobile = () => {} }) {
  return (
    <>
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-20 md:flex md:w-64 md:flex-col">
        <Suspense fallback={<div className="w-64 h-full bg-fahara-surface border-r border-fahara-border" />}>
          <SidebarContent isMobileOpen={isMobileOpen} onCloseMobile={onCloseMobile} />
        </Suspense>
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col z-10">
            <Suspense fallback={<div className="w-full h-full bg-fahara-surface border-r border-fahara-border" />}>
              <SidebarContent isMobileOpen={isMobileOpen} onCloseMobile={onCloseMobile} />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
}
