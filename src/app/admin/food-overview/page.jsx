'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  UtensilsCrossed, 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  TrendingUp, 
  RefreshCw, 
  Loader2, 
  ChevronRight,
  Receipt,
  Sparkles
} from 'lucide-react';
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

export default function AdminFoodOverviewPage() {
  const { data: stats, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['adminFoodStats'],
    queryFn: async () => {
      const res = await api.get('/admin/food/stats');
      return res.data?.data;
    }
  });

  const { data: recentOrdersData } = useQuery({
    queryKey: ['adminFoodRecentOrders'],
    queryFn: async () => {
      const res = await api.get('/admin/food/orders?limit=6');
      return res.data?.data || [];
    }
  });

  const recentOrders = recentOrdersData || [];

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
            <span className="p-2.5 rounded-2xl bg-rose-50 text-[#E50914] border border-rose-200 shadow-2xs">
              <ShoppingBag className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Food Management Overview
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Centralized platform-wide monitoring of customer food ordering, revenue, and active cafes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-700 rounded-xl cursor-pointer transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#E50914] ${isFetching ? 'animate-spin' : ''}`} /> 
            <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <Link
            href="/admin/food-orders"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#E50914] hover:bg-[#b71c1c] text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-sm"
          >
            <span>Manage Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── 8 STATISTICAL CARDS ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-stone-100 rounded-2xl animate-pulse border border-stone-200" />
          ))}
        </div>
      ) : isError || !stats ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold">
          Failed to load food statistics. Please ensure the backend server is reachable.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
          {/* 1. Total Food Orders */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:border-[#E50914]/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Food Orders</span>
              <span className="p-2 rounded-xl bg-rose-50 text-[#E50914] border border-rose-100">
                <ShoppingBag className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {stats.totalFoodOrders || 0}
              </span>
              <span className="text-[11px] text-stone-400 font-medium block mt-0.5">All customer orders</span>
            </div>
          </div>

          {/* 2. Total Food Revenue */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:border-[#E50914]/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Food Revenue</span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                {formatCurrency(stats.totalFoodRevenue)}
              </span>
              <span className="text-[11px] text-stone-400 font-medium block mt-0.5">Successful paid orders only</span>
            </div>
          </div>

          {/* 3. Total Food Customers */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:border-[#E50914]/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Food Customers</span>
              <span className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {stats.totalFoodCustomers || 0}
              </span>
              <span className="text-[11px] text-stone-400 font-medium block mt-0.5">Unique food buyers</span>
            </div>
          </div>

          {/* 4. Total Food Items */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:border-[#E50914]/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Food Items</span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <UtensilsCrossed className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {stats.totalFoodItems || 0}
              </span>
              <span className="text-[11px] text-stone-400 font-medium block mt-0.5">Published dishes & drinks</span>
            </div>
          </div>

          {/* 5. Total Active Food Cafes */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:border-[#E50914]/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Active Food Cafes</span>
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Building2 className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {stats.totalActiveFoodCafes || 0}
              </span>
              <span className="text-[11px] text-stone-400 font-medium block mt-0.5">Cafes with published menus</span>
            </div>
          </div>

          {/* 6. Pending Food Orders */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:border-[#E50914]/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Pending Orders</span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
                {stats.pendingFoodOrders || 0}
              </span>
              <span className="text-[11px] text-stone-400 font-medium block mt-0.5">In prep or awaiting pickup</span>
            </div>
          </div>

          {/* 7. Completed Food Orders */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:border-[#E50914]/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Completed Orders</span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {stats.completedFoodOrders || 0}
              </span>
              <span className="text-[11px] text-stone-400 font-medium block mt-0.5">Delivered or picked up</span>
            </div>
          </div>

          {/* 8. Cancelled Food Orders */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:border-[#E50914]/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Cancelled Orders</span>
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <XCircle className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                {stats.cancelledFoodOrders || 0}
              </span>
              <span className="text-[11px] text-stone-400 font-medium block mt-0.5">Rejected or voided</span>
            </div>
          </div>
        </div>
      )}

      {/* ── COMMISSION & REVENUE SPLIT HIGHLIGHT ── */}
      {stats && (
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-700 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-lg">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E50914]/20 border border-[#E50914]/40 text-[#EF5350] text-[10px] font-black uppercase tracking-wider">
                <Sparkles size={11} />
                Grab2Go Revenue Distribution
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Commission, GST & Cafe Settlement
              </h2>
              <p className="text-xs text-stone-300">
                Calculated strictly according to platform rules: 3% Grab2Go Platform Fee + 2% Transaction Fee + 18% GST (on transaction fee).
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[140px]">
                <span className="text-[11px] font-bold text-stone-300 block">Grab2Go Revenue</span>
                <span className="text-xl sm:text-2xl font-black text-[#EF5350] tracking-tight mt-1 block font-mono">
                  {formatCurrency(stats.totalPlatformRevenue)}
                </span>
                <span className="text-[10px] text-stone-400">Total retained</span>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[140px]">
                <span className="text-[11px] font-bold text-stone-300 block">3% Platform Fee</span>
                <span className="text-xl sm:text-2xl font-black text-rose-300 tracking-tight mt-1 block font-mono">
                  {formatCurrency(stats.totalPlatformFeeOnly)}
                </span>
                <span className="text-[10px] text-stone-400">Net platform fee</span>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[140px]">
                <span className="text-[11px] font-bold text-stone-300 block">18% GST Amount</span>
                <span className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight mt-1 block font-mono">
                  {formatCurrency(stats.totalGstAmount)}
                </span>
                <span className="text-[10px] text-stone-400">GST on txn fee</span>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[140px]">
                <span className="text-[11px] font-bold text-stone-300 block">Cafe Settlement Pool</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight mt-1 block font-mono">
                  {formatCurrency(stats.totalCafeRevenue)}
                </span>
                <span className="text-[10px] text-stone-400">Payable to cafes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RECENT FOOD ORDERS FEED ── */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-base font-black text-stone-900 tracking-tight">Recent Food Orders</h2>
            <p className="text-xs text-stone-500">Live stream of customer orders placed across restaurants</p>
          </div>

          <Link
            href="/admin/food-orders"
            className="text-xs font-bold text-[#E50914] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-stone-400 text-center py-8 font-medium">No food orders recorded yet.</p>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200/70 text-stone-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="pb-3 px-3">Order Number</th>
                  <th className="pb-3 px-3">Customer</th>
                  <th className="pb-3 px-3">Restaurant</th>
                  <th className="pb-3 px-3">Items</th>
                  <th className="pb-3 px-3">Total</th>
                  <th className="pb-3 px-3">Payment</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#252525]">
                      #{order.orderNumber}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-stone-900 block">{order.customerName}</span>
                      <span className="text-[10px] text-stone-400">{order.customerPhone}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-700">
                      {order.cafeName}
                    </td>
                    <td className="py-3 px-3 text-stone-500">
                      {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                    </td>
                    <td className="py-3 px-3 font-black text-stone-900">
                      ₹{order.totalAmount}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase ${
                        ['COMPLETED', 'DELIVERED'].includes(order.orderStatus)
                          ? 'bg-emerald-50 text-emerald-700'
                          : ['CANCELLED', 'REJECTED'].includes(order.orderStatus)
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-stone-400 text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

