'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import {
  Coffee,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CafeSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const fetchCafeSubscriptions = async (page = 1, searchQuery = search, status = statusFilter) => {
    try {
      setLoading(true);
      const params = {
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchQuery,
        status: status
      };

      const res = await api.get('/admin/subscriptions/cafes', { params });
      const data = res.data;
      if (data.success) {
        setSubscriptions(data.data || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        toast.error(data.message || 'Failed to fetch Cafe subscriptions');
      }
    } catch (err) {
      console.error('Fetch Cafe Subscriptions Error:', err);
      toast.error(err.response?.data?.message || 'Network error loading Cafe subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCafeSubscriptions(1, search, statusFilter);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCafeSubscriptions(1, search, statusFilter);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active
          </span>
        );
      case 'PAST_DUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Past Due
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <Clock className="w-3.5 h-3.5" /> Expired
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#FEE2E2] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FFF5F5] border border-[#FEE2E2] flex items-center justify-center text-[#E50914]">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#252525]">Cafe Subscriptions</h1>
            <p className="text-sm text-[#B71C1C]">
              Manage all Cafe Partner subscriptions and Razorpay billing contracts
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchCafeSubscriptions(pagination.page, search, statusFilter)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFF5F5] text-[#E50914] border border-[#FEE2E2] rounded-xl text-sm font-semibold hover:bg-[#FCEFE3] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#FEE2E2] shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B71C1C]" />
          <input
            type="text"
            placeholder="Search cafe name, owner, email, phone or Razorpay ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FFF5F5] border border-[#FEE2E2] rounded-xl text-sm text-[#252525] focus:outline-none focus:ring-2 focus:ring-[#E50914]"
          />
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#E50914] font-medium">
            <Filter className="w-4 h-4" /> Filter Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#FFF5F5] border border-[#FEE2E2] rounded-xl text-sm font-semibold text-[#252525] focus:outline-none focus:ring-2 focus:ring-[#E50914]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-[#FEE2E2] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#B71C1C]">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#E50914]" />
            Loading Cafe Subscriptions...
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-12 text-center">
            <Coffee className="w-12 h-12 text-[#EF5350] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#252525]">No Cafe subscriptions yet.</h3>
            <p className="text-sm text-[#B71C1C] max-w-sm mx-auto mt-1">
              There are currently no cafe subscriptions matching your search parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FFF5F5] text-[#E50914] border-b border-[#FEE2E2] font-semibold">
                <tr>
                  <th className="px-6 py-4">Cafe / Business</th>
                  <th className="px-6 py-4">Owner Info</th>
                  <th className="px-6 py-4">Plan & Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Next Billing</th>
                  <th className="px-6 py-4">Razorpay Sub ID</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FEE2E2]">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#FFF5F5]/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#252525]">{sub.businessName}</div>
                      <div className="text-xs text-[#B71C1C]">Created {new Date(sub.createdAt).toLocaleDateString()}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-[#252525] flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#B71C1C]" /> {sub.ownerName}
                      </div>
                      <div className="text-xs text-[#B71C1C] flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {sub.email}
                      </div>
                      {sub.phone && (
                        <div className="text-xs text-[#B71C1C] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {sub.phone}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-[#252525]">{sub.planName}</div>
                      <div className="text-xs font-semibold text-[#E50914]">₹{sub.price} / month</div>
                    </td>

                    <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>

                    <td className="px-6 py-4 text-xs text-[#252525]">
                      {sub.nextBillingDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#B71C1C]" />
                          {new Date(sub.nextBillingDate).toLocaleDateString()}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-[#FFF5F5] border border-[#FEE2E2] rounded text-xs font-mono text-[#E50914]">
                        {sub.razorpaySubscriptionId || 'N/A'}
                      </code>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/subscriptions/${sub.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF5F5] border border-[#FEE2E2] text-[#E50914] rounded-lg text-xs font-bold hover:bg-[#E50914] hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#FEE2E2] bg-[#FFF5F5] flex items-center justify-between">
            <span className="text-xs text-[#B71C1C]">
              Showing Page <span className="font-bold text-[#252525]">{pagination.page}</span> of{' '}
              <span className="font-bold text-[#252525]">{pagination.totalPages}</span> ({pagination.total} total)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchCafeSubscriptions(pagination.page - 1, search, statusFilter)}
                className="p-1.5 rounded-lg border border-[#FEE2E2] bg-white text-[#E50914] disabled:opacity-40 hover:bg-[#FCEFE3] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchCafeSubscriptions(pagination.page + 1, search, statusFilter)}
                className="p-1.5 rounded-lg border border-[#FEE2E2] bg-white text-[#E50914] disabled:opacity-40 hover:bg-[#FCEFE3] transition-colors"
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
