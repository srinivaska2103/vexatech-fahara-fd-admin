'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Store, 
  ShoppingBag, 
  RefreshCw, 
  PieChart as PieIcon, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Percent,
  Star,
  MapPin,
  Loader2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { motion } from 'framer-motion';

const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(num);
};

export default function AdminFoodAnalyticsPage() {
  const [period, setPeriod] = useState('month'); // 'day', 'week', 'month', 'year'

  const { data: analytics, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['adminFoodAnalytics', period],
    queryFn: async () => {
      const res = await api.get('/admin/food/analytics', { params: { period } });
      return res.data?.data;
    }
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto"
    >
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
              <TrendingUp className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Food Revenue Analytics
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Financial performance, net commission earnings, top restaurants, and popular dishes
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl border border-stone-200">
          {[
            { id: 'day', label: 'Daily' },
            { id: 'week', label: 'Weekly' },
            { id: 'month', label: 'Monthly' },
            { id: 'year', label: 'Yearly' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === tab.id 
                  ? 'bg-white text-stone-900 shadow-xs font-black' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 bg-white text-stone-600 rounded-xl hover:bg-stone-50 transition-colors border border-stone-200 cursor-pointer ml-1"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#E50914] ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#E50914]" />
          <span className="text-xs font-bold">Aggregating database revenue statistics...</span>
        </div>
      ) : isError || !analytics ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold">
          Failed to load food analytics. Please check server connection.
        </div>
      ) : (
        <>
          {/* ── 5 PRIMARY FINANCIAL TILES ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Gross Food Sales */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Gross Sales</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-stone-900 tracking-tight font-mono">
                  {formatCurrency(analytics.totalSales)}
                </span>
                <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
                  {analytics.successfulPaymentsCount} paid orders
                </span>
              </div>
            </div>

            {/* 2. Platform Revenue (Grab2Go Revenue) */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Grab2Go Revenue</span>
                <span className="p-2 rounded-xl bg-rose-50 text-[#E50914] border border-rose-100">
                  <Percent className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-[#E50914] tracking-tight font-mono">
                  {formatCurrency(analytics.platformRevenue)}
                </span>
                <span className="text-[11px] text-stone-500 font-bold block mt-0.5">
                  Fee ₹{analytics.platformFeeOnly || 0} + Txn
                </span>
              </div>
            </div>

            {/* 3. Total GST Amount */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">GST Amount</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-amber-600 tracking-tight font-mono">
                  {formatCurrency(analytics.gstAmount)}
                </span>
                <span className="text-[11px] text-stone-400 font-medium block mt-0.5">
                  18% on transaction fee
                </span>
              </div>
            </div>

            {/* 4. Cafe Settlement */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Cafe Settlement</span>
                <span className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                  <Store className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-teal-700 tracking-tight font-mono">
                  {formatCurrency(analytics.cafeSettlement)}
                </span>
                <span className="text-[11px] text-stone-400 font-medium block mt-0.5">
                  Payable to cafes
                </span>
              </div>
            </div>

            {/* 5. Pending & Refunded */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Pending / Refunds</span>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xl font-black text-stone-800 tracking-tight font-mono">
                  {formatCurrency(analytics.pendingPaymentsAmount)}
                </span>
                <span className="text-[11px] text-rose-500 font-semibold block mt-0.5">
                  Refunded: {formatCurrency(analytics.refundedAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* ── TIME-SERIES CHARTS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Food Revenue Over Time */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-stone-900 tracking-tight">Food Revenue Over Time</h3>
                  <p className="text-[11px] text-stone-500">Gross revenue vs Fahara platform earnings</p>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  Verified Data
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.timeSeriesData}>
                    <defs>
                      <linearGradient id="foodRevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="platformFeeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E50914" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#E50914" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      formatter={(value, name) => [`₹${value}`, name === 'revenue' ? 'Gross Revenue' : 'Fahara Earnings']} 
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e5e5', fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#foodRevGrad)" />
                    <Area type="monotone" dataKey="platformEarnings" stroke="#E50914" strokeWidth={2} fillOpacity={1} fill="url(#platformFeeGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Food Orders Count Over Time */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-stone-900 tracking-tight">Food Orders Volume</h3>
                  <p className="text-[11px] text-stone-500">Customer checkout volume over selected period</p>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  Order Volume
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      formatter={(value) => [`${value} orders`, 'Orders Placed']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e5e5', fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="orders" fill="#E50914" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── TOP RESTAURANTS & MOST ORDERED DISHES ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Restaurants */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-black text-stone-900 tracking-tight flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#E50914]" /> Top-Performing Cafes & Restaurants
                </h3>
                <p className="text-xs text-stone-500">Ranked by verified food revenue volume</p>
              </div>

              {analytics.topPerformingCafes?.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">No cafe order sales recorded yet.</p>
              ) : (
                <div className="divide-y divide-stone-100">
                  {analytics.topPerformingCafes.map((cafe, idx) => (
                    <div key={cafe.cafeId} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-black flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-stone-900">{cafe.name}</p>
                          <p className="text-[10px] text-stone-400 flex items-center gap-1">
                            <MapPin size={10} className="text-[#E50914]" /> {cafe.city || 'Location'} • ⭐ {cafe.rating}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-stone-900 font-mono block">₹{cafe.totalRevenue}</span>
                        <span className="text-[10px] text-stone-400">{cafe.totalOrders} orders</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Most Ordered Food Items */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-black text-stone-900 tracking-tight flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" /> Most-Ordered Food Items
                </h3>
                <p className="text-xs text-stone-500">Most popular dishes and menu items by quantity</p>
              </div>

              {analytics.mostOrderedItems?.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">No food items ordered yet.</p>
              ) : (
                <div className="divide-y divide-stone-100">
                  {analytics.mostOrderedItems.map((item, idx) => (
                    <div key={item.itemName} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 font-black flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-stone-900">{item.itemName}</p>
                          <p className="text-[10px] text-stone-400">{item.orderCount} distinct orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-600 font-mono block">{item.totalOrdered} ordered</span>
                        <span className="text-[10px] text-stone-400 font-mono">₹{item.totalRevenue} sales</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

