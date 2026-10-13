'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { 
  Sparkles, Users, CheckCircle2, Clock, FileX, AlertTriangle, 
  TrendingUp, Coffee, Building2, CalendarDays, ArrowRight, RefreshCw, 
  Receipt, Plus, Layers, ShieldCheck, DollarSign
} from 'lucide-react';

export default function SubscriptionOverviewPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/subscriptions/overview');
      setMetrics(res.data?.data || null);
    } catch (err) {
      console.error('Fetch Overview Metrics Error:', err);
      setError(err.response?.data?.message || 'Failed to load subscription metrics from PostgreSQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FFF9F2] via-[#FAF0E6] to-[#F5E6D3] text-[#2C1810] p-6 sm:p-8 rounded-3xl border border-[#DDB892]/80 shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#6F4E37]/10 text-[#6F4E37] text-xs font-black uppercase tracking-wider border border-[#6F4E37]/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Real-time PostgreSQL Data
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#2C1810] tracking-tight">
              Subscription Executive Control Center
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-xl">
              Monitor real-time partner subscriptions, monthly recurring revenue (MRR), plan status, and partner breakdown across Cafe, Restaurant, and Event Managers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-stone-50 border border-[#E8DED5] text-[#2C1810] text-xs font-black shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6F4E37]' : ''}`} />
              <span>Refresh Metrics</span>
            </button>

            <Link
              href="/admin/subscriptions/plans"
              className="px-5 py-2.5 rounded-2xl bg-[#6F4E37] hover:bg-[#593E2B] text-white text-xs font-black shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Manage Plans</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Subscribers */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8DED5] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">Total Partners</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#2C1810]">{loading ? '...' : (metrics?.totalSubscribers || 0)}</div>
            <span className="text-[10px] text-stone-500 font-bold">Subscribed accounts</span>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="p-5 rounded-3xl bg-white border border-emerald-200/90 shadow-2xs space-y-3 bg-gradient-to-b from-emerald-50/30 to-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Active</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-950">{loading ? '...' : (metrics?.activeSubscriptions || 0)}</div>
            <span className="text-[10px] text-emerald-700 font-bold">Unlocked portals</span>
          </div>
        </div>

        {/* Monthly Recurring Revenue (MRR) */}
        <div className="p-5 rounded-3xl bg-white border border-amber-200/90 shadow-2xs space-y-3 bg-gradient-to-b from-amber-50/30 to-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">Monthly MRR</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-950">{loading ? '...' : formatPrice(metrics?.monthlyRecurringRevenue)}</div>
            <span className="text-[10px] text-amber-700 font-bold">Active recurring rate</span>
          </div>
        </div>

        {/* Past Due */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8DED5] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">Past Due</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#2C1810]">{loading ? '...' : (metrics?.pastDue || 0)}</div>
            <span className="text-[10px] text-stone-500 font-bold">Payment pending</span>
          </div>
        </div>

        {/* Expired */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8DED5] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">Expired</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileX className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#2C1810]">{loading ? '...' : (metrics?.expired || 0)}</div>
            <span className="text-[10px] text-stone-500 font-bold">Lapsed period</span>
          </div>
        </div>

        {/* Cancelled */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8DED5] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">Cancelled</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#2C1810]">{loading ? '...' : (metrics?.cancelled || 0)}</div>
            <span className="text-[10px] text-stone-500 font-bold">Cancelled renewals</span>
          </div>
        </div>
      </div>

      {/* Role Breakdown Cards & Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cafe Subscribers */}
        <Link
          href="/admin/subscriptions/cafes"
          className="p-6 rounded-3xl bg-white border border-[#E8DED5] hover:border-indigo-400 shadow-2xs hover:shadow-lg transition-all space-y-4 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200">
              <Coffee className="w-6 h-6" />
            </div>
            <span className="text-xs font-extrabold text-indigo-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              View Cafes <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Cafe Subscribers</span>
            <div className="text-3xl font-black text-[#2C1810] mt-1">{loading ? '...' : (metrics?.cafeSubscribers || 0)}</div>
            <p className="text-xs text-stone-500 font-medium mt-1">Active Revenue: {formatPrice(metrics?.cafeRevenue)}</p>
          </div>
        </Link>

        {/* Restaurant Subscribers */}
        <Link
          href="/admin/subscriptions/restaurants"
          className="p-6 rounded-3xl bg-white border border-[#E8DED5] hover:border-orange-400 shadow-2xs hover:shadow-lg transition-all space-y-4 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center border border-orange-200">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-extrabold text-orange-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              View Restaurants <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Restaurant Subscribers</span>
            <div className="text-3xl font-black text-[#2C1810] mt-1">{loading ? '...' : (metrics?.restaurantSubscribers || 0)}</div>
            <p className="text-xs text-stone-500 font-medium mt-1">Active Revenue: {formatPrice(metrics?.restaurantRevenue)}</p>
          </div>
        </Link>

        {/* Event Manager Subscribers */}
        <Link
          href="/admin/subscriptions/event-managers"
          className="p-6 rounded-3xl bg-white border border-[#E8DED5] hover:border-teal-400 shadow-2xs hover:shadow-lg transition-all space-y-4 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center border border-teal-200">
              <CalendarDays className="w-6 h-6" />
            </div>
            <span className="text-xs font-extrabold text-teal-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              View Event Managers <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Event Manager Subscribers</span>
            <div className="text-3xl font-black text-[#2C1810] mt-1">{loading ? '...' : (metrics?.eventManagerSubscribers || 0)}</div>
            <p className="text-xs text-stone-500 font-medium mt-1">Active Revenue: {formatPrice(metrics?.eventManagerRevenue)}</p>
          </div>
        </Link>
      </div>

      {/* Subscription Revenue Breakdown Banner */}
      <div className="bg-white border border-[#E8DED5] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-[#2C1810]">Partner Subscription Revenue Audit</h3>
            <p className="text-xs text-stone-500 font-medium">Calculated strictly from partner membership payments (separated from customer booking sales)</p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-[#FFF8F0] border border-[#DDB892]/60 text-right">
            <span className="text-xs text-stone-500 font-bold block">Total Verified Subscription Revenue</span>
            <span className="text-xl font-black text-[#6F4E37]">{loading ? '...' : formatPrice(metrics?.totalSubscriptionRevenue)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <span className="text-stone-600">Cafe Subscription Revenue</span>
            <span className="font-black text-[#2C1810]">{formatPrice(metrics?.cafeRevenue)}</span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <span className="text-stone-600">Restaurant Subscription Revenue</span>
            <span className="font-black text-[#2C1810]">{formatPrice(metrics?.restaurantRevenue)}</span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <span className="text-stone-600">Event Manager Subscription Revenue</span>
            <span className="font-black text-[#2C1810]">{formatPrice(metrics?.eventManagerRevenue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
