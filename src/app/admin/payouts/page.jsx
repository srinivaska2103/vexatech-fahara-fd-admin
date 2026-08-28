'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Search, Filter, ChevronRight, Receipt, CalendarDays, Loader2, Wallet, CheckCircle2, Clock, DollarSign, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function PayoutsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [syncingId, setSyncingId] = useState(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const queryClient = useQueryClient();

  const { data: payoutsResp, isLoading, refetch } = useQuery({
    queryKey: ['adminPayouts'],
    queryFn: async () => {
      const response = await api.get('/payments/admin/payouts');
      const payoutList = response.data?.data || [];
      // Trigger background status sync with Razorpay for pending/processing payouts
      const pendingPayouts = payoutList.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING');
      if (pendingPayouts.length > 0) {
        Promise.all(pendingPayouts.map(p => api.post(`/payments/admin/payouts/${p.id}/sync`).catch(() => {})));
      }
      return payoutList;
    }
  });

  const payouts = payoutsResp || [];

  const handleSyncStatus = async (payoutId) => {
    try {
      setSyncingId(payoutId);
      await api.post(`/payments/admin/payouts/${payoutId}/sync`);
      await queryClient.invalidateQueries({ queryKey: ['adminPayouts'] });
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to sync status from Razorpay backend');
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    try {
      setIsSyncingAll(true);
      if (payouts.length > 0) {
        await Promise.allSettled(payouts.map(p => api.post(`/payments/admin/payouts/${p.id}/sync`)));
      }
      await queryClient.invalidateQueries({ queryKey: ['adminPayouts'] });
      await refetch();
    } catch (e) {
      alert('Failed to refresh payout statuses');
    } finally {
      setIsSyncingAll(false);
    }
  };

  const filteredPayouts = payouts.filter(payout => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = payout.reference_number?.toLowerCase().includes(searchString) ||
                          payout.partner_name?.toLowerCase().includes(searchString);

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && payout.status !== statusFilter) return false;
    if (partnerFilter !== 'all' && payout.partner_type !== partnerFilter) return false;
    return true;
  });

  const totalCompleted = payouts.filter(p => p.status === 'COMPLETED').length;
  const totalPending = payouts.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING').length;
  const totalVolume = payouts.reduce((acc, p) => acc + (Number(p.gross_amount) || 0), 0);

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
            <Wallet className="h-6 w-6 text-fahara-primary" />
            Partner Payouts & Settlements
          </h1>
          <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
            Track vendor payouts with automated status fetched directly from Razorpay backend.
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
            Auto Razorpay Sync
          </span>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Total Settlements</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{payouts.length}</div>
          <span className="text-[11px] text-fahara-secondary mt-1 block">Vendor Disbursement Files</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Completed Settlements</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{totalCompleted}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Disbursed to Partner Bank</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Pending Queue</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{totalPending}</div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">Scheduled for Transfer</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Net Payable Volume</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">₹{totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Gross Partner Earnings</span>
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
            placeholder="Search Reference Number or Partner Name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fahara-border bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all placeholder:text-fahara-secondary/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-fahara-secondary" />
            <select 
              className="w-full sm:w-auto bg-fahara-background border border-fahara-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              className="w-full sm:w-auto bg-fahara-background border border-fahara-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 cursor-pointer"
              value={partnerFilter}
              onChange={(e) => setPartnerFilter(e.target.value)}
            >
              <option value="all">All Partners</option>
              <option value="CAFE_OWNER">Cafe Owners</option>
              <option value="EVENT_MANAGER">Event Managers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-fahara-background/80 border-b border-fahara-border text-fahara-secondary font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Reference & Date</th>
                <th className="px-6 py-4">Partner Entity</th>
                <th className="px-6 py-4 text-right">Gross Amount</th>
                <th className="px-6 py-4 text-right text-fahara-primary">Net Payable</th>
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
                      <span>Loading vendor payouts from Razorpay...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <Wallet className="w-10 h-10 text-fahara-secondary/40" />
                      <p className="text-base font-bold text-fahara-text">No payouts found</p>
                      <p className="text-xs text-fahara-secondary">No settlement records match your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-fahara-background/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-fahara-text font-mono flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-fahara-primary" />
                        <span>{payout.reference_number}</span>
                      </div>
                      <div className="text-[10px] text-fahara-secondary mt-0.5 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        <span>{payout.transfer_date ? format(new Date(payout.transfer_date), 'MMM dd, yyyy') : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-fahara-text">{payout.partner_name}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                        payout.partner_type === 'CAFE_OWNER' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {payout.partner_type ? payout.partner_type.replace('_', ' ') : 'PARTNER'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-fahara-text">
                      ₹{Number(payout.gross_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-fahara-primary">
                      ₹{Number(payout.gross_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        payout.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        payout.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        payout.status === 'FAILED' || payout.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          payout.status === 'COMPLETED' ? 'bg-emerald-500' :
                          payout.status === 'PROCESSING' ? 'bg-blue-500' :
                          payout.status === 'FAILED' || payout.status === 'CANCELLED' ? 'bg-rose-500' :
                          'bg-amber-500'
                        }`} />
                        {payout.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSyncStatus(payout.id)}
                          disabled={syncingId === payout.id}
                          className="px-3 py-1.5 bg-fahara-surface hover:bg-fahara-background text-fahara-text border border-fahara-border text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title="Sync live status from Razorpay backend"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingId === payout.id ? 'animate-spin text-fahara-primary' : 'text-fahara-secondary'}`} />
                          <span>Sync Status</span>
                        </button>
                        <Link 
                          href={`/admin/payouts/${payout.id}`}
                          className="inline-flex items-center justify-center p-2 text-fahara-primary hover:bg-fahara-primary/10 rounded-xl transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <ChevronRight className="w-4 h-4" />
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
