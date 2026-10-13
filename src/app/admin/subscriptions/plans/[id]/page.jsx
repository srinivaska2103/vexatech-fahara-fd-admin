'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { 
  Sparkles, ArrowLeft, Users, CheckCircle2, Clock, FileX, 
  TrendingUp, RefreshCw, AlertTriangle, ShieldCheck, Tag, Layers
} from 'lucide-react';
import { format } from 'date-fns';

export default function PlanDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const planId = params.id;

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlanDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/subscriptions/plans/${planId}`);
      setPlan(res.data?.data || null);
    } catch (err) {
      console.error('Fetch Plan Detail Error:', err);
      setError(err.response?.data?.message || 'Failed to fetch plan detail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanDetail();
  }, [planId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-stone-500 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#6F4E37]" />
        <p className="font-extrabold">Loading plan details...</p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-black text-[#2C1810]">Plan Not Found</h2>
        <p className="text-xs text-stone-500 font-medium">{error || 'Unable to locate subscription plan.'}</p>
        <Link href="/admin/subscriptions/plans" className="inline-block px-5 py-2.5 bg-[#6F4E37] text-white text-xs font-black rounded-2xl">
          Back to Plans List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DED5] pb-6">
        <div className="space-y-1">
          <Link href="/admin/subscriptions/plans" className="text-xs font-bold text-[#6F4E37] hover:underline flex items-center gap-1.5 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Subscription Plans
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#2C1810]">{plan.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
              plan.isActive ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-stone-100 text-stone-500 border-stone-300'
            }`}>
              {plan.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPlanDetail}
            className="p-2.5 rounded-2xl bg-white border border-[#E8DED5] text-stone-700 hover:text-[#2C1810] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 bg-white border border-[#E8DED5] rounded-3xl space-y-2">
          <span className="text-[10px] font-black uppercase text-stone-500">Total Subscribers</span>
          <div className="text-2xl font-black text-[#2C1810]">{plan.totalSubscribers}</div>
        </div>

        <div className="p-5 bg-emerald-50/40 border border-emerald-200 rounded-3xl space-y-2">
          <span className="text-[10px] font-black uppercase text-emerald-800">Active Subscribers</span>
          <div className="text-2xl font-black text-emerald-950">{plan.activeSubscribers}</div>
        </div>

        <div className="p-5 bg-amber-50/40 border border-amber-200 rounded-3xl space-y-2">
          <span className="text-[10px] font-black uppercase text-amber-800">Monthly Revenue</span>
          <div className="text-2xl font-black text-amber-950">₹{plan.monthlyRevenue}</div>
        </div>

        <div className="p-5 bg-white border border-[#E8DED5] rounded-3xl space-y-2">
          <span className="text-[10px] font-black uppercase text-stone-500">Expired</span>
          <div className="text-2xl font-black text-[#2C1810]">{plan.expiredSubscribers}</div>
        </div>

        <div className="p-5 bg-white border border-[#E8DED5] rounded-3xl space-y-2">
          <span className="text-[10px] font-black uppercase text-stone-500">Cancelled</span>
          <div className="text-2xl font-black text-[#2C1810]">{plan.cancelledSubscribers}</div>
        </div>
      </div>

      {/* Plan Details Strip */}
      <div className="bg-white border border-[#E8DED5] rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-black text-[#2C1810] border-b border-stone-100 pb-4">Plan Specifications</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-bold text-stone-700">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-black mb-1">Target Partner Type</span>
            <span className="text-sm font-black text-[#2C1810]">{plan.targetPartner}</span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-black mb-1">Price Rate</span>
            <span className="text-sm font-black text-[#6F4E37]">₹{plan.price} / {plan.billingCycle?.toLowerCase()}</span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-black mb-1">Currency</span>
            <span className="text-sm font-black text-[#2C1810]">{plan.currency}</span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-black mb-1">Razorpay Plan ID</span>
            <span className="text-xs font-mono font-extrabold text-stone-800">{plan.razorpayPlanId || 'N/A'}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 space-y-2">
          <span className="text-stone-400 block text-[10px] uppercase font-black">Plan Description</span>
          <p className="text-xs text-stone-700 font-medium leading-relaxed">{plan.description || 'No description provided.'}</p>
        </div>

        {Array.isArray(plan.features) && plan.features.length > 0 && (
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <span className="text-stone-400 block text-[10px] uppercase font-black">Included Plan Features</span>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {plan.features.map((feat, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-[#FFF8F0] border border-[#DDB892]/60 text-[#6F4E37] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {feat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subscribed Partners Table */}
      <div className="bg-white border border-[#E8DED5] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <h3 className="text-lg font-black text-[#2C1810]">Subscribed Partners ({plan.subscribersList?.length || 0})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF8F0] border-b border-[#E8DED5] text-[10px] font-black uppercase text-stone-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Partner / Business</th>
                <th className="py-3 px-4">Owner Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Razorpay Sub ID</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-semibold text-[#2C1810]">
              {!plan.subscribersList || plan.subscribersList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-stone-400">No partners subscribed to this plan yet.</td>
                </tr>
              ) : (
                plan.subscribersList.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#FFF8F0]/40">
                    <td className="py-3 px-4 font-black">{sub.partnerName}</td>
                    <td className="py-3 px-4">{sub.ownerName}</td>
                    <td className="py-3 px-4 text-stone-500">{sub.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        sub.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-stone-600">{sub.razorpaySubscriptionId || 'N/A'}</td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/admin/subscriptions/${sub.id}`} className="px-3 py-1 bg-[#6F4E37] text-white text-[10px] font-bold rounded-xl">
                        View Subscriber
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
