'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Search, Filter, CreditCard, Eye, Loader2, IndianRupee, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: payments, isLoading } = useQuery({
    queryKey: ['adminPayments'],
    queryFn: async () => {
      const res = await api.get('/payments/admin/payments');
      return res.data?.data || [];
    }
  });

  const filteredPayments = payments?.filter(p => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = p.booking_id?.toLowerCase().includes(searchString) ||
                          p.transaction_id?.toLowerCase().includes(searchString) ||
                          p.customer?.toLowerCase().includes(searchString) ||
                          p.gateway_order_id?.toLowerCase().includes(searchString);
    
    const matchesStatus = statusFilter === 'All' || p.internal_status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const totalVolume = payments?.reduce((sum, p) => sum + (p.internal_status === 'SUCCESS' || p.internal_status === 'PAID' ? Number(p.amount || 0) : 0), 0) || 0;
  const successfulPayments = payments?.filter(p => p.internal_status === 'SUCCESS' || p.internal_status === 'PAID').length || 0;

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
            <CreditCard className="h-6 w-6 text-fahara-primary" />
            Financial Payments Ledger
          </h1>
          <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
            Real-time transaction history, payment gateway statuses, and settlement tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-fahara-secondary bg-fahara-surface border border-fahara-border px-3 py-1.5 rounded-xl">
          <span>Total Transactions:</span>
          <span className="font-bold text-fahara-text">{payments?.length || 0}</span>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Total Processed Volume</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">₹{totalVolume.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Successfully Cleared Payments</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Successful Payments</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{successfulPayments}</div>
          <span className="text-[11px] text-fahara-secondary mt-1 block">Completed Gateway Charges</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Success Rate</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">
            {payments?.length ? `${Math.round((successfulPayments / payments.length) * 100)}%` : '100%'}
          </div>
          <span className="text-[11px] text-purple-600 font-semibold mt-1 block">Platform Conversion</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-fahara-secondary">
            <Search className="h-4 w-4" />
          </div>
          <input 
            type="text"
            placeholder="Search Booking ID, Transaction ID, or Customer..."
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
            <option value="SUCCESS">Success</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-fahara-background/80 border-b border-fahara-border text-fahara-secondary font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Transaction / Gateway Order</th>
                <th className="px-6 py-4">Booking / Customer</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Amount / Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fahara-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-fahara-primary" />
                      <span>Loading payments ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard className="w-10 h-10 text-fahara-secondary/40" />
                      <p className="text-base font-bold text-fahara-text">No payment records found</p>
                      <p className="text-xs text-fahara-secondary">No transactions match your specified filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-fahara-background/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-fahara-text font-mono truncate max-w-[180px]" title={p.transaction_id}>{p.transaction_id}</div>
                      <div className="text-[10px] text-fahara-secondary mt-0.5 truncate max-w-[180px]">Order: {p.gateway_order_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-fahara-primary">{p.booking_id}</div>
                      <div className="text-[10px] text-fahara-secondary font-medium">{p.customer}</div>
                    </td>
                    <td className="px-6 py-4 text-fahara-secondary">
                      <div>{format(new Date(p.payment_date), 'MMM dd, yyyy')}</div>
                      <div className="text-[10px] text-fahara-secondary/70 mt-0.5">{format(new Date(p.payment_date), 'hh:mm a')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-fahara-text text-sm">₹{Number(p.amount || 0).toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-fahara-secondary">{p.payment_method || 'UPI / Razorpay'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.internal_status === 'SUCCESS' || p.internal_status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        p.internal_status === 'REFUNDED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        p.internal_status === 'FAILED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {p.internal_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/payments/${p.id}`}
                        className="inline-flex items-center justify-center p-2 text-fahara-primary hover:bg-fahara-primary/10 rounded-xl transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
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
