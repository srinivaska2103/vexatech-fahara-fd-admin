'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Search, Filter, Receipt, Loader2, IndianRupee, CheckCircle2, TrendingUp, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const { data: txData, isLoading } = useQuery({
    queryKey: ['adminTransactions', filter],
    queryFn: async () => {
      const res = await api.get('/payments/admin/transactions', { params: { filter } });
      return res.data?.data;
    }
  });

  const filteredTx = txData?.filter(tx => 
    tx.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.booking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.partner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalGross = txData?.reduce((sum, tx) => sum + (Number(tx.gross_amount) || 0), 0) || 0;
  const totalFees = txData?.reduce((sum, tx) => sum + (Number(tx.platform_fee) || 0), 0) || 0;
  const totalNet = txData?.reduce((sum, tx) => sum + (Number(tx.net_payable) || 0), 0) || 0;

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
            <Receipt className="h-6 w-6 text-fahara-primary" />
            Historical Financial Transactions
          </h1>
          <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
            Customer payments, refunds, and vendor commission fee splits processed via <span className="font-bold text-fahara-primary">Razorpay Payments PG</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl uppercase tracking-wider">
            100% Razorpay Automated
          </span>
          <div className="flex items-center gap-2 text-xs text-fahara-secondary bg-fahara-surface border border-fahara-border px-3 py-1.5 rounded-xl">
            <span>Total Records:</span>
            <span className="font-bold text-fahara-text">{txData?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Total Transactions</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{txData?.length || 0}</div>
          <span className="text-[11px] text-fahara-secondary mt-1 block">Historical Audit Records</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Gross Volume</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">₹{totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Captured Customer Charges</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Platform Revenue</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">₹{totalFees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">Fahara Service Commission</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Net Partner Payable</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">₹{totalNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Vendor Disbursement Net</span>
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
            placeholder="Search by ID, Booking, or Partner..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fahara-border bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all placeholder:text-fahara-secondary/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-fahara-secondary" />
          <select 
            className="w-full md:w-auto bg-fahara-background border border-fahara-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="Week">This Week</option>
            <option value="Month">This Month</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-fahara-background/80 border-b border-fahara-border text-fahara-secondary font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Partner Entity</th>
                <th className="px-6 py-4 text-right">Gross Booking</th>
                <th className="px-6 py-4 text-right text-fahara-primary">Platform Fee</th>
                <th className="px-6 py-4 text-right text-emerald-600">Net Payable</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fahara-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-fahara-primary" />
                      <span>Loading transaction logs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTx.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <Receipt className="w-10 h-10 text-fahara-secondary/40" />
                      <p className="text-base font-bold text-fahara-text">No transactions found</p>
                      <p className="text-xs text-fahara-secondary">No financial transactions match your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTx.map(tx => {
                  const gross = Number(tx.gross_amount || 0);
                  const fee = Number(tx.platform_fee || 0);
                  const net = Number(tx.net_payable || 0);

                  return (
                    <tr key={tx.id} className="hover:bg-fahara-background/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-fahara-text font-mono truncate max-w-[180px]" title={tx.transaction_id}>{tx.transaction_id}</div>
                        <div className="text-[10px] font-bold text-fahara-primary font-mono mt-0.5">Booking: {tx.booking_number}</div>
                        <div className="text-[10px] text-fahara-secondary mt-0.5">
                          {tx.date ? format(new Date(tx.date), 'MMM dd, yyyy HH:mm') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-fahara-text">{tx.partner_name}</span>
                          {tx.is_split && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                              SPLIT
                            </span>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider mt-1 ${
                          tx.partner_type === 'CAFE_OWNER' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {tx.partner_type === 'CAFE_OWNER' ? 'Cafe Owner' : 'Event Manager'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-fahara-text">
                        ₹{gross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-fahara-primary">
                        ₹{fee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-emerald-600">
                        ₹{net.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          tx.status === 'SUCCESS' || tx.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          tx.status === 'REFUNDED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {tx.status}
                        </span>
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
