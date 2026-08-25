'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, BarChart3, Activity, Users, UserCheck, CalendarDays, 
  ShieldCheck, Coffee, CheckCircle2, Star, Grid, Sparkles, Tags, 
  MessageSquare, Calendar, FileX, AlertTriangle, CreditCard, 
  Wallet, RotateCcw, Receipt, Building2, Landmark, Clock, History, 
  BadgeCheck, Bell, Mail, MessageCircle, Megaphone, TrendingUp, FileSpreadsheet, 
  Download, Settings, Percent, FileText, BellRing, Lock, Sliders, LifeBuoy, 
  ShieldAlert, Cpu, Shield, User, HelpCircle, LogOut, X, ChevronRight,
  ChevronsUpDown, Layers
} from 'lucide-react';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import api from '@/lib/axios';

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
            setUser({ ...user, ...res.data.data });
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
    <div className="flex h-full flex-col bg-fahara-surface border-r border-fahara-border shadow-xs select-none overflow-x-hidden">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-fahara-border px-5 py-4 flex-shrink-0">
        <Link 
          href="/admin/dashboard" 
          onClick={onCloseMobile}
          className="flex items-center gap-3 group"
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-fahara-border bg-fahara-background shadow-xs transition-transform group-hover:scale-105">
            <img 
              src="/Fahara Logo.jpeg" 
              alt="Fahara Logo" 
              className="h-full w-full object-cover" 
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-fahara-text">Fahara</span>
              <span className="rounded-full bg-fahara-primary/10 px-2 py-0.5 text-[9px] font-bold text-fahara-primary uppercase tracking-wider border border-fahara-primary/20">
                Admin
              </span>
            </div>
            <span className="text-[11px] font-medium text-fahara-secondary">Management Suite</span>
          </div>
        </Link>
        <button
          onClick={onCloseMobile}
          className="rounded-xl p-1.5 text-fahara-secondary hover:bg-fahara-background hover:text-fahara-text md:hidden transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-between px-4 py-2 bg-fahara-background/70 border-b border-fahara-border/60 text-[10px] font-semibold text-fahara-secondary">
        <span>MENU CATEGORIES</span>
        <button 
          onClick={toggleExpandAll}
          className="flex items-center gap-1 hover:text-fahara-primary transition-colors cursor-pointer"
          title="Toggle Expand All"
        >
          <ChevronsUpDown className="h-3 w-3" />
          <span>Toggle All</span>
        </button>
      </div>

      {/* Navigation Accordion Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-thin scrollbar-thumb-fahara-border">
        {navigationGroups.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = !!openSections[group.id];
          const hasActiveChild = group.id === activeInfo.groupId;

          return (
            <div key={group.id} className="rounded-xl transition-all">
              <button
                onClick={() => toggleSection(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all duration-150 cursor-pointer ${
                  hasActiveChild 
                    ? 'text-fahara-primary bg-fahara-primary/10 font-black' 
                    : 'text-fahara-secondary hover:text-fahara-text hover:bg-fahara-background'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GroupIcon className={`h-4 w-4 transition-colors ${hasActiveChild ? 'text-fahara-primary' : 'text-fahara-secondary'}`} />
                  <span className="truncate">{group.title}</span>
                  {group.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-amber-500 text-white rounded-full">
                      {group.badge}
                    </span>
                  )}
                </div>
                <ChevronRight 
                  className={`h-3.5 w-3.5 text-fahara-secondary/70 transition-transform duration-200 ${
                    isOpen ? 'rotate-90 text-fahara-primary' : ''
                  }`} 
                />
              </button>

              {isOpen && (
                <div className="mt-1 ml-3 border-l-2 border-fahara-border/70 pl-2.5 space-y-1">
                  {group.items.map((item) => {
                    const isActive = group.id === activeInfo.groupId && item.name === activeInfo.itemName;
                    const ItemIcon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={onCloseMobile}
                        className={`group relative flex items-center rounded-xl px-3 py-2 text-xs transition-all duration-150 ${
                          isActive
                            ? 'bg-fahara-primary text-white font-extrabold shadow-sm translate-x-0.5'
                            : 'text-fahara-text/75 font-medium hover:bg-fahara-background hover:text-fahara-text hover:translate-x-1'
                        }`}
                      >
                        <ItemIcon
                          className={`mr-2.5 h-3.5 w-3.5 flex-shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-fahara-secondary group-hover:text-fahara-text'
                          }`}
                        />
                        <span className="truncate flex-1">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
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
