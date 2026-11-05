'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Search, Filter, Eye, Loader2, ArrowRightLeft, CheckCircle2, RotateCcw, Clock, DollarSign, RefreshCw, AlertTriangle, AlertCircle, RefreshCwOff } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminRefundsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [retryingId, setRetryingId] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const queryClient = useQueryClient();

  const { data: responseData, isLoading, refetch } = useQuery({
    queryKey: ['adminRefunds'],
    queryFn: async () => {
      const res = await api.get('/payments/admin/refunds');
      return res.data || { data: [], stats: {} };
    }
  });

  const refunds = responseData?.data || [];
  const stats = responseData?.stats || {
    totalRefundRequests: refunds.length,
    totalRefundAmount: refunds.reduce((acc, r) => acc + (Number(r.amount) || 0), 0),
    pendingRefunds: refunds.filter(r => ['PENDING', 'REQUESTED', 'Processing'].includes(r.status)).length,
    processingRefunds: refunds.filter(r => ['PROCESSING', 'Processing'].includes(r.status)).length,
    successfullyRefunded: refunds.filter(r => ['PROCESSED', 'Completed', 'SUCCESS'].includes(r.status)).length,
    failedRefunds: refunds.filter(r => ['FAILED', 'Failed'].includes(r.status)).length,
  };

  const handleRetryRefund = async (refundId) => {
    if (!confirm('Are you sure you want to retry this failed refund with Razorpay?')) return;
    try {
      setRetryingId(refundId);
      const res = await api.post(`/payments/admin/refunds/${refundId}/retry`);
      if (res.data?.success) {
        alert(res.data.message || 'Refund re-initiated successfully.');
        await queryClient.invalidateQueries({ queryKey: ['adminRefunds'] });
        await refetch();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to retry refund');
    } finally {
      setRetryingId(null);
    }
  };

  const handleSyncStatus = async (refundId) => {
    try {
      setSyncingId(refundId);
      await api.post(`/payments/admin/refunds/${refundId}/sync`);
      await queryClient.invalidateQueries({ queryKey: ['adminRefunds'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to sync refund status');
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    try {
      setIsSyncingAll(true);
      if (refunds && refunds.length > 0) {
        await Promise.allSettled(refunds.map(r => api.post(`/payments/admin/refunds/${r.id}/sync`).catch(() => {})));
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
                          r.customer?.toLowerCase().includes(searchString) ||
                          r.gateway_refund_id?.toLowerCase().includes(searchString);
    
    if (statusFilter === 'All') return matchesSearch;
    if (statusFilter === 'Pending') return matchesSearch && ['Pending', 'REQUESTED', 'PENDING'].includes(r.status);
    if (statusFilter === 'Processing') return matchesSearch && ['Processing', 'PROCESSING'].includes(r.status);
    if (statusFilter === 'Processed') return matchesSearch && ['Completed', 'PROCESSED', 'SUCCESS'].includes(r.status);
    if (statusFilter === 'Failed') return matchesSearch && ['Failed', 'FAILED'].includes(r.status);
    if (statusFilter === 'Partially Refunded') return matchesSearch && ['PARTIALLY_REFUNDED'].includes(r.status);

    return matchesSearch && r.status === statusFilter;
  }) || [];

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
            Refund Management & Automated Gateway
          </h1>
          <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
            Real-time automated refunds for food delivery and cafe bookings via <span className="font-bold text-fahara-primary">Razorpay Route</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="flex items-center gap-1.5 text-xs font-bold bg-fahara-surface border border-fahara-border hover:bg-fahara-background text-fahara-text px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin text-fahara-primary' : 'text-fahara-secondary'}`} />
            <span>Re-sync Gateway</span>
          </button>
          <span className="text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl uppercase tracking-wider">
            Razorpay Automated
          </span>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-fahara-secondary block">Total Requests</span>
          <div className="text-xl font-extrabold text-fahara-text mt-1">{stats.totalRefundRequests || 0}</div>
          <span className="text-[10px] text-fahara-secondary mt-0.5 block">Food & Venues</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 block">Total Amount</span>
          <div className="text-xl font-extrabold text-rose-600 mt-1">₹{Number(stats.totalRefundAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">Refund Capital</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 block">Pending</span>
          <div className="text-xl font-extrabold text-amber-600 mt-1">{stats.pendingRefunds || 0}</div>
          <span className="text-[10px] text-amber-500 font-semibold mt-0.5 block">Under Approval</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 block">Processing</span>
          <div className="text-xl font-extrabold text-blue-600 mt-1">{stats.processingRefunds || 0}</div>
          <span className="text-[10px] text-blue-500 font-semibold mt-0.5 block">Bank Transfer</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 block">Successfully Refunded</span>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">{stats.successfullyRefunded || 0}</div>
          <span className="text-[10px] text-emerald-500 font-semibold mt-0.5 block">Completed</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-red-600 block">Failed</span>
          <div className="text-xl font-extrabold text-red-600 mt-1">{stats.failedRefunds || 0}</div>
          <span className="text-[10px] text-red-500 font-semibold mt-0.5 block">Retry Available</span>
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
            placeholder="Search Refund ID, Order, Booking, Gateway Ref..."
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
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Processed">Processed</option>
            <option value="Failed">Failed</option>
            <option value="Partially Refunded">Partially Refunded</option>
          </select>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-fahara-background/80 border-b border-fahara-border text-fahara-secondary font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Refund ID / Reference</th>
                <th className="px-6 py-4">Type & Reference</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Requested Date</th>
                <th className="px-6 py-4">Refund Amount</th>
                <th className="px-6 py-4">Gateway Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fahara-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-fahara-primary" />
                      <span>Loading customer refunds ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <ArrowRightLeft className="w-10 h-10 text-fahara-secondary/40" />
                      <p className="text-base font-bold text-fahara-text">No refunds found</p>
                      <p className="text-xs text-fahara-secondary">No customer refund records match your search filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRefunds.map(r => {
                  const isSuccess = ['Completed', 'PROCESSED', 'SUCCESS'].includes(r.status);
                  const isFailed = ['Failed', 'FAILED'].includes(r.status);
                  const isProcessing = ['Processing', 'PROCESSING'].includes(r.status);
                  const isOrder = Boolean(r.order_id);

                  return (
                    <tr key={r.id} className="hover:bg-fahara-background/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-fahara-text font-mono">{r.id?.substring(0, 18)}...</div>
                        {r.gateway_refund_id && (
                          <div className="text-[10px] text-fahara-secondary font-mono">GW: {r.gateway_refund_id}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 ${
                          isOrder ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {isOrder ? 'FOOD ORDER' : 'VENUE BOOKING'}
                        </span>
                        <div className="font-extrabold text-fahara-primary font-mono">{r.booking || r.order_number || 'N/A'}</div>
                        <div className="text-[10px] text-fahara-secondary">{r.restaurant || r.cafe || 'Grab2GO'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-fahara-text">{r.customer}</div>
                        <div className="text-[10px] text-fahara-secondary">{r.customer_email || ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-fahara-text">{r.requested_date ? format(new Date(r.requested_date), 'MMM dd, yyyy') : 'N/A'}</div>
                        <div className="text-[10px] text-fahara-secondary">{r.requested_date ? format(new Date(r.requested_date), 'hh:mm a') : ''}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-rose-600">
                        ₹{Number(r.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        {r.original_amount && (
                          <div className="text-[10px] text-stone-400 font-normal">of ₹{Number(r.original_amount).toFixed(2)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          isSuccess ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          isFailed ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isSuccess ? 'bg-emerald-500' :
                            isFailed ? 'bg-rose-500' :
                            'bg-amber-500'
                          }`} />
                          {r.status || 'Processing'}
                        </span>
                        {r.failure_reason && (
                          <div className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={r.failure_reason}>
                            {r.failure_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isFailed && (
                            <button
                              onClick={() => handleRetryRefund(r.id)}
                              disabled={retryingId === r.id}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="Retry failed refund via Razorpay"
                            >
                              <RotateCcw className={`w-3.5 h-3.5 ${retryingId === r.id ? 'animate-spin' : ''}`} />
                              <span>{retryingId === r.id ? 'Retrying...' : 'Retry'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleSyncStatus(r.id)}
                            disabled={syncingId === r.id}
                            className="px-2.5 py-1.5 bg-fahara-surface hover:bg-fahara-background text-fahara-text border border-fahara-border text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Sync live status from Razorpay"
                          >
                            <RefreshCw className={`w-3 h-3 ${syncingId === r.id ? 'animate-spin text-fahara-primary' : 'text-fahara-secondary'}`} />
                            <span>Sync</span>
                          </button>
                          <Link 
                            href={isOrder ? `/admin/orders` : `/admin/bookings/${r.payment_id || r.booking}`}
                            className="inline-flex items-center justify-center p-2 text-fahara-primary hover:bg-fahara-primary/10 rounded-xl transition-colors cursor-pointer"
                            title="View Reference"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
