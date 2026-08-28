'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Search, Filter, Eye, Loader2, ArrowRightLeft, CheckCircle2, RotateCcw, Clock, DollarSign, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminRefundsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [syncingId, setSyncingId] = useState(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const queryClient = useQueryClient();

  const { data: refunds, isLoading, refetch } = useQuery({
    queryKey: ['adminRefunds'],
    queryFn: async () => {
      const res = await api.get('/payments/admin/refunds');
      const refundList = res.data?.data || [];
      // Trigger background status sync for pending/processing refunds
      const pendingRefunds = refundList.filter(r => r.status === 'Processing');
      if (pendingRefunds.length > 0) {
        Promise.all(pendingRefunds.map(r => api.post(`/payments/admin/refunds/${r.id}/sync`).catch(() => {})));
      }
      return refundList;
    }
  });

  const handleSyncStatus = async (refundId) => {
    try {
      setSyncingId(refundId);
      await api.post(`/payments/admin/refunds/${refundId}/sync`);
      await queryClient.invalidateQueries({ queryKey: ['adminRefunds'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to sync refund status from Razorpay backend');
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    try {
      setIsSyncingAll(true);
      if (refunds && refunds.length > 0) {
        await Promise.allSettled(refunds.map(r => api.post(`/payments/admin/refunds/${r.id}/sync`)));
      }
      await queryClient.invalidateQueries({ queryKey: ['adminRefunds'] });
      await refetch();
    } catch (err) {
      alert('Failed to refresh refund statuses');
    } finally {
      setIsSyncingAll(false);
    }
  };

  const filteredRefunds = refunds?.filter(r => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = r.id?.toLowerCase().includes(searchString) ||
                          r.booking?.toLowerCase().includes(searchString) ||
                          r.customer?.toLowerCase().includes(searchString);
    
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const totalRefunded = refunds?.filter(r => r.status === 'Completed').length || 0;
  const totalProcessing = refunds?.filter(r => r.status === 'Processing').length || 0;
  const totalVolume = refunds?.reduce((acc, r) => acc + (Number(r.amount) || 0), 0) || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 pb-12 overflow-x-hidden"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fahara-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight flex items-center gap-2.5">
            <RotateCcw className="h-6 w-6 text-fahara-primary" />
            Refunds & Cancellations Ledger
          </h1>
          <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
            Customer refunds with automated status fetched directly from <span className="font-bold text-fahara-primary">Razorpay Payments PG</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="flex items-center gap-1.5 text-xs font-bold bg-fahara-surface border border-fahara-border hover:bg-fahara-background text-fahara-text px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin text-fahara-primary' : 'text-fahara-secondary'}`} />
            <span>Fetch Razorpay Status</span>
          </button>
          <span className="text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl uppercase tracking-wider">
            Powered by Razorpay
          </span>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Total Refund Requests</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{refunds?.length || 0}</div>
          <span className="text-[11px] text-fahara-secondary mt-1 block">Customer Refund Files</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Completed Refunds</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{totalRefunded}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Settled to Source Account</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Processing Queue</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{totalProcessing}</div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">Awaiting Bank Transfer</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Total Refunded Value</span>
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">₹{totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 block">Gross Refunded Amount</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-fahara-secondary">
            <Search className="h-4 w-4" />
          </div>
          <input 
            type="text"
            placeholder="Search Refund ID, Booking, Customer..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fahara-border bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all placeholder:text-fahara-secondary/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-fahara-secondary" />
          <select 
            className="w-full md:w-auto bg-fahara-background border border-fahara-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Processing">Processing</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-fahara-background/80 border-b border-fahara-border text-fahara-secondary font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Refund ID</th>
                <th className="px-6 py-4">Booking / Customer</th>
                <th className="px-6 py-4">Requested Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Razorpay Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fahara-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-fahara-primary" />
                      <span>Loading customer refunds from Razorpay...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <ArrowRightLeft className="w-10 h-10 text-fahara-secondary/40" />
                      <p className="text-base font-bold text-fahara-text">No refunds found</p>
                      <p className="text-xs text-fahara-secondary">No customer refund requests match your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRefunds.map(r => (
                  <tr key={r.id} className="hover:bg-fahara-background/60 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-fahara-text font-mono">{r.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-fahara-primary font-mono">{r.booking}</div>
                      <div className="text-[11px] text-fahara-secondary">{r.customer}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-fahara-text">{r.requested_date ? format(new Date(r.requested_date), 'MMM dd, yyyy') : 'N/A'}</div>
                      <div className="text-[10px] text-fahara-secondary">{r.requested_date ? format(new Date(r.requested_date), 'hh:mm a') : ''}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-rose-600">
                      -₹{Number(r.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        r.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        r.status === 'Failed' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          r.status === 'Completed' ? 'bg-emerald-500' :
                          r.status === 'Failed' ? 'bg-rose-500' :
                          'bg-amber-500'
                        }`} />
                        {r.status || 'Processing'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSyncStatus(r.id)}
                          disabled={syncingId === r.id}
                          className="px-3 py-1.5 bg-fahara-surface hover:bg-fahara-background text-fahara-text border border-fahara-border text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title="Sync live status from Razorpay backend"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingId === r.id ? 'animate-spin text-fahara-primary' : 'text-fahara-secondary'}`} />
                          <span>Sync Status</span>
                        </button>
                        <Link 
                          href={`/admin/bookings/${r.payment_id || r.booking}`}
                          className="inline-flex items-center justify-center p-2 text-fahara-primary hover:bg-fahara-primary/10 rounded-xl transition-colors cursor-pointer"
                          title="View Booking"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
