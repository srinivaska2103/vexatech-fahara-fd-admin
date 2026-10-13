'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubscriptionPaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const fetchPayments = async (page = 1, searchQuery = search, status = statusFilter) => {
    try {
      setLoading(true);
      const params = {
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchQuery,
        status: status
      };

      const res = await api.get('/admin/subscriptions/payments', { params });
      const data = res.data;
      if (data.success) {
        setPayments(data.data || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        toast.error(data.message || 'Failed to fetch payment history');
      }
    } catch (err) {
      console.error('Fetch Payment History Error:', err);
      toast.error(err.response?.data?.message || 'Network error loading subscription payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1, search, statusFilter);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPayments(1, search, statusFilter);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Success
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Failed
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <RotateCcw className="w-3.5 h-3.5" /> Refunded
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8DED5] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FFF8F0] border border-[#E8DED5] flex items-center justify-center text-[#6F4E37]">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2C1810]">Subscription Payment History</h1>
            <p className="text-sm text-[#A67B5B]">
              Isolated partner subscription billing transactions strictly separated from customer booking revenue
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchPayments(pagination.page, search, statusFilter)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFF8F0] text-[#6F4E37] border border-[#E8DED5] rounded-xl text-sm font-semibold hover:bg-[#FCEFE3] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E8DED5] shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A67B5B]" />
          <input
            type="text"
            placeholder="Search payment ID, partner, plan or Razorpay payment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FFF8F0] border border-[#E8DED5] rounded-xl text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
          />
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#6F4E37] font-medium">
            <Filter className="w-4 h-4" /> Filter Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#FFF8F0] border border-[#E8DED5] rounded-xl text-sm font-semibold text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success / Paid</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-2xl border border-[#E8DED5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#A67B5B]">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#6F4E37]" />
            Loading Payment History...
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-[#DDB892] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#2C1810]">No payment transactions found.</h3>
            <p className="text-sm text-[#A67B5B] max-w-sm mx-auto mt-1">
              There are no partner subscription payment records matching your search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FFF8F0] text-[#6F4E37] border-b border-[#E8DED5] font-semibold">
                <tr>
                  <th className="px-6 py-4">Payment ID</th>
                  <th className="px-6 py-4">Partner</th>
                  <th className="px-6 py-4">Partner Type</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Payment Date</th>
                  <th className="px-6 py-4">Razorpay Payment ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DED5]">
                {payments.map((pmt) => (
                  <tr key={pmt.id} className="hover:bg-[#FFF8F0]/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[#6F4E37]">
                      {pmt.paymentId}
                    </td>

                    <td className="px-6 py-4 font-medium text-[#2C1810]">
                      {pmt.partnerName}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#FFF8F0] border border-[#E8DED5] text-[#6F4E37]">
                        {pmt.partnerType}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-[#2C1810] font-semibold">
                      {pmt.planName}
                    </td>

                    <td className="px-6 py-4 font-bold text-[#2C1810]">
                      ₹{pmt.amount} {pmt.currency}
                    </td>

                    <td className="px-6 py-4">{getStatusBadge(pmt.status)}</td>

                    <td className="px-6 py-4 text-xs text-[#2C1810]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#A67B5B]" />
                        {new Date(pmt.paymentDate).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-[#FFF8F0] border border-[#E8DED5] rounded text-xs font-mono text-[#6F4E37]">
                        {pmt.razorpayPaymentId}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#E8DED5] bg-[#FFF8F0] flex items-center justify-between">
            <span className="text-xs text-[#A67B5B]">
              Showing Page <span className="font-bold text-[#2C1810]">{pagination.page}</span> of{' '}
              <span className="font-bold text-[#2C1810]">{pagination.totalPages}</span> ({pagination.total} total)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchPayments(pagination.page - 1, search, statusFilter)}
                className="p-1.5 rounded-lg border border-[#E8DED5] bg-white text-[#6F4E37] disabled:opacity-40 hover:bg-[#FCEFE3] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchPayments(pagination.page + 1, search, statusFilter)}
                className="p-1.5 rounded-lg border border-[#E8DED5] bg-white text-[#6F4E37] disabled:opacity-40 hover:bg-[#FCEFE3] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
