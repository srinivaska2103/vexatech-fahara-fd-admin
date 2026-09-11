'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  RefreshCw, Calendar, Sparkles, Filter, Sun, Sunset, Moon, 
  PlusCircle, Megaphone, ShieldAlert, ArrowUpRight, TrendingUp, 
  Zap, Clock
} from 'lucide-react';
import api from '@/lib/axios';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { KPICards } from './components/KPICards';
import { CustomSelect } from '@/components/ui/CustomSelect';
import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('./components/DashboardCharts').then(mod => mod.DashboardCharts), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] w-full bg-fahara-surface border border-fahara-border rounded-2xl animate-pulse mt-8 flex items-center justify-center text-fahara-secondary text-sm">
      Loading analytical charts...
    </div>
  )
});

import { DashboardSections } from './components/DashboardSections';
import { DashboardSkeleton } from './components/DashboardSkeletons';
import { DashboardErrorState } from './components/DashboardEmptyStates';

export default function AdminDashboard() {
  const user = useAdminAuthStore((state) => state.user);
  const [period, setPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'bookings', 'finance', 'analytics'
  const [currentTime, setCurrentTime] = useState('');

  // Ticking time effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { text: 'Good morning', icon: Sun, color: 'text-amber-500' };
    } else if (hour >= 12 && hour < 17) {
      return { text: 'Good afternoon', icon: Sunset, color: 'text-amber-600' };
    } else {
      return { text: 'Good evening', icon: Moon, color: 'text-indigo-400' };
    }
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const adminName = user?.name || user?.email?.split('@')[0] || 'Admin';

  const { data: summary, isLoading: isLoadingSummary, isError: isErrorSummary, refetch: refetchSummary, isFetching } = useQuery({
    queryKey: ['adminSummary', period],
    queryFn: async () => {
      const response = await api.get(`/dashboard/summary?period=${period}`);
      return response.data.data;
    }
  });

  const { data: recentBookings, refetch: refetchBookings } = useQuery({
    queryKey: ['adminRecentBookings'],
    queryFn: async () => {
      const response = await api.get('/dashboard/recent-bookings');
      return response.data;
    }
  });

  const { data: upcomingBookings } = useQuery({
    queryKey: ['adminUpcomingBookings'],
    queryFn: async () => {
      const response = await api.get('/dashboard/upcoming-bookings');
      return response.data;
    }
  });

  const { data: recentReviews } = useQuery({
    queryKey: ['adminRecentReviews'],
    queryFn: async () => {
      const response = await api.get('/dashboard/recent-reviews');
      return response.data;
    }
  });

  const { data: activity, refetch: refetchActivity } = useQuery({
    queryKey: ['adminActivity'],
    queryFn: async () => {
      const response = await api.get('/dashboard/activity');
      return response.data;
    }
  });

  const handleRefreshAll = () => {
    refetchSummary();
    refetchBookings();
    refetchActivity();
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  if (isLoadingSummary) {
    return (
      <div className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="h-8 bg-fahara-border/60 rounded-xl w-64 animate-pulse" />
          <div className="h-10 bg-fahara-border/60 rounded-xl w-40 animate-pulse" />
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (isErrorSummary) {
    return (
      <div className="w-full py-12">
        <DashboardErrorState />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 pb-12"
    >
      {/* Dynamic Greeting Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-fahara-border bg-gradient-to-br from-fahara-surface via-fahara-background to-fahara-surface p-6 sm:p-8 shadow-xs">
        {/* Background Ambient Spheres */}
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-fahara-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-fahara-accent/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Greeting Info */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-fahara-primary">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-fahara-primary/10 border border-fahara-primary/20 px-3 py-1 text-fahara-primary font-bold">
                <GreetingIcon className={`h-3.5 w-3.5 ${greeting.color}`} />
                <span>{greeting.text}, {adminName}! 👋</span>
              </span>
              <span className="text-fahara-secondary">•</span>
              <span className="text-fahara-secondary font-normal flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-fahara-secondary" />
                {currentDateStr}
              </span>
              {currentTime && (
                <>
                  <span className="text-fahara-secondary">•</span>
                  <span className="text-fahara-secondary font-mono text-[11px] flex items-center gap-1 bg-fahara-surface px-2 py-0.5 rounded-md border border-fahara-border">
                    <Clock className="h-3 w-3 text-emerald-600 animate-pulse" />
                    {currentTime} IST
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-fahara-text tracking-tight">
              Platform Executive Control Center
            </h1>
            <p className="text-xs sm:text-sm text-fahara-secondary max-w-2xl leading-relaxed">
              Here is your live real-time platform report. You have{' '}
              <strong className="text-fahara-text font-bold">{summary?.pending_verifications || 0} pending verifications</strong>{' '}
              and <strong className="text-fahara-text font-bold">{summary?.todays_bookings || 0} bookings scheduled for today</strong>.
            </p>
          </div>

          {/* Interactive Quick Action Buttons Header */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <Link
              href="/admin/notifications/create"
              className="inline-flex items-center gap-2 rounded-xl bg-fahara-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-fahara-primary/90 transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95"
            >
              <Megaphone className="h-3.5 w-3.5" />
              <span>Broadcast</span>
            </Link>

            <Link
              href="/admin/cafes"
              className="inline-flex items-center gap-2 rounded-xl border border-fahara-border bg-fahara-surface px-4 py-2.5 text-xs font-bold text-fahara-text hover:bg-fahara-background hover:text-fahara-primary transition-all shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
            >
              <PlusCircle className="h-3.5 w-3.5 text-fahara-primary" />
              <span>Add Cafe</span>
            </Link>

            <button
              onClick={handleRefreshAll}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-xl border border-fahara-border bg-fahara-surface px-3.5 py-2.5 text-xs font-bold text-fahara-text hover:bg-fahara-background hover:text-fahara-primary transition-all shadow-2xs disabled:opacity-50 cursor-pointer hover:scale-105 active:scale-95"
              title="Refresh Live DB Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-fahara-primary' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Interactive Filter Bar inside Banner */}
        <div className="mt-6 pt-5 border-t border-fahara-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Section Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-fahara-primary text-white shadow-2xs'
                  : 'bg-fahara-surface text-fahara-secondary hover:text-fahara-text border border-fahara-border'
              }`}
            >
              All Metrics
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-fahara-primary text-white shadow-2xs'
                  : 'bg-fahara-surface text-fahara-secondary hover:text-fahara-text border border-fahara-border'
              }`}
            >
              Bookings ({summary?.total_bookings || 0})
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'finance'
                  ? 'bg-fahara-primary text-white shadow-2xs'
                  : 'bg-fahara-surface text-fahara-secondary hover:text-fahara-text border border-fahara-border'
              }`}
            >
              Revenue (₹{(summary?.total_revenue || 0).toLocaleString('en-IN')})
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <span className="text-fahara-secondary font-semibold">Time Horizon:</span>
            <CustomSelect
              options={[
                { value: 'today', label: 'Today' },
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
                { value: 'this_month', label: 'This Month' },
                { value: 'this_year', label: 'This Year' },
              ]}
              value={period}
              onChange={(val) => setPeriod(val)}
              className="min-w-[140px]"
            />
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <KPICards summary={summary} />
      
      {/* Interactive Analytics & Growth Charts */}
      {activeTab !== 'bookings' && <DashboardCharts summary={summary} />}
      
      {/* Tables & Activity Timeline */}
      {activeTab !== 'finance' && (
        <DashboardSections 
          recentBookings={recentBookings}
          upcomingBookings={upcomingBookings}
          recentReviews={recentReviews}
          activity={activity}
          summary={summary}
        />
      )}
    </motion.div>
  );
}
