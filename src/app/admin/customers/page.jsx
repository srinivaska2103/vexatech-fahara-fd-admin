'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
  Search, Filter, UserCheck, ShieldOff, ChevronRight, Users, 
  UserX, Loader2, DollarSign, Calendar, Mail, Phone, Eye, ShieldAlert 
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function CustomerList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['adminCustomers'],
    queryFn: async () => {
      const response = await api.get('/customers/owner');
      return response.data.data;
    }
  });

  const blockMutation = useMutation({
    mutationFn: async ({ id, action }) => {
      await api.post(`/customers/owner/${id}/${action}`);
    },
    onSuccess: () => {
      toast.success('Customer status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['adminCustomers'] });
    },
    onError: () => {
      toast.error('Failed to update customer status');
    }
  });

  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && customer.status === statusFilter.toUpperCase();
  });

  const totalActive = customers?.filter(c => c.status === 'ACTIVE' || !c.status).length || 0;
  const totalBlocked = customers?.filter(c => c.status === 'BLOCKED' || c.status === 'SUSPENDED').length || 0;
  const totalSpendAll = customers?.reduce((sum, c) => sum + Number(c.total_spend || 0), 0) || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 pb-12 overflow-x-hidden"
    >
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fahara-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-fahara-primary" />
            Customer Management
          </h1>
          <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
            Comprehensive customer list, spend analytics, and account controls.
          </p>
        </div>
      </div>

      {/* Customer Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Total Customers</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{customers?.length || 0}</div>
          <span className="text-[11px] text-fahara-secondary mt-1 block">Registered Users</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Active Users</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{totalActive}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Healthy Accounts</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Blocked / Suspended</span>
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <UserX className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{totalBlocked}</div>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 block">Restricted Access</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Customer Lifetime Value</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">₹{totalSpendAll.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-fahara-secondary mt-1 block">Total Revenue Generated</span>
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
            className="block w-full pl-10 pr-4 py-2.5 border border-fahara-border rounded-xl bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all placeholder:text-fahara-secondary/60"
            placeholder="Search by name, email, or phone number..."
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
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Responsive Customer List Table */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-fahara-background/80 border-b border-fahara-border text-fahara-secondary font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Registration</th>
                <th className="px-6 py-4">Bookings</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fahara-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-fahara-primary" />
                      <span>Loading customers list...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-10 h-10 text-fahara-secondary/40" />
                      <p className="text-base font-bold text-fahara-text">No customers found</p>
                      <p className="text-xs text-fahara-secondary">No customer profiles match your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers?.map((customer) => (
                  <tr key={customer.id} className="hover:bg-fahara-background/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {customer.profile_image ? (
                          <img src={customer.profile_image} alt={customer.name} className="w-9 h-9 rounded-xl object-cover border border-fahara-border" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-fahara-primary/10 border border-fahara-primary/20 flex items-center justify-center text-fahara-primary font-bold text-xs shadow-2xs">
                            {customer.name?.charAt(0).toUpperCase() || 'C'}
                          </div>
                        )}
                        <span className="font-bold text-fahara-text">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-fahara-text">{customer.email}</span>
                        <span className="text-[10px] text-fahara-secondary">{customer.phone || 'No Phone Registered'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-fahara-secondary">
                      {new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-fahara-text">{customer.total_bookings || 0}</td>
                    <td className="px-6 py-4 font-extrabold text-fahara-text">
                      ₹{customer.total_spend ? Number(customer.total_spend).toLocaleString('en-IN') : 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        customer.status === 'ACTIVE' || !customer.status ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        customer.status === 'SUSPENDED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {customer.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link 
                          href={`/admin/customers/${customer.id}`}
                          className="p-2 text-fahara-primary hover:bg-fahara-primary/10 rounded-xl transition-colors"
                          title="View Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                        {customer.status === 'BLOCKED' ? (
                          <button 
                            onClick={() => blockMutation.mutate({ id: customer.id, action: 'unblock' })}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                            title="Unblock Customer"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => blockMutation.mutate({ id: customer.id, action: 'block' })}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Block Customer"
                          >
                            <ShieldOff className="w-4 h-4" />
                          </button>
                        )}
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
