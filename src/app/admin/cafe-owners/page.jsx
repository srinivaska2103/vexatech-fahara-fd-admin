'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Search, Filter, ChevronRight, Store, UserCheck, ShieldAlert, ShieldCheck, Loader2, Users } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CafeOwnerList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: owners, isLoading } = useQuery({
    queryKey: ['adminCafeOwners'],
    queryFn: async () => {
      const response = await api.get('/users?role=CAFE_OWNER');
      return response.data.data;
    }
  });

  const filteredOwners = owners?.filter(owner => {
    const matchesSearch = 
      owner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && owner.status === statusFilter.toUpperCase();
  });

  const totalActive = owners?.filter(o => o.status === 'ACTIVE' || !o.status).length || 0;
  const totalPending = owners?.filter(o => o.status === 'PENDING').length || 0;
  const totalCafes = owners?.reduce((sum, o) => sum + (o.cafes?.length || 0), 0) || 0;

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
            <UserCheck className="h-6 w-6 text-fahara-primary" />
            Cafe Owners Management
          </h1>
          <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
            Manage partner cafe owners, business verifications, and active venues.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-fahara-secondary bg-fahara-surface border border-fahara-border px-3 py-1.5 rounded-xl">
          <span>Total Registered:</span>
          <span className="font-bold text-fahara-text">{owners?.length || 0}</span>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Total Cafe Owners</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{owners?.length || 0}</div>
          <span className="text-[11px] text-fahara-secondary mt-1 block">Registered Business Partners</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Verified & Active</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{totalActive}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Active Partners</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Listed Cafes Total</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{totalCafes}</div>
          <span className="text-[11px] text-fahara-secondary mt-1 block">Venues Across Platform</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-fahara-secondary">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 border border-fahara-border rounded-xl bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all placeholder:text-fahara-secondary/60"
            placeholder="Search by owner name, email, or business..."
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
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Owners Table */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-fahara-background/80 border-b border-fahara-border text-fahara-secondary font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Owner Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Business Name</th>
                <th className="px-6 py-4">Owned Cafes</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fahara-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-fahara-primary" />
                      <span>Loading cafe owners list...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOwners?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <UserCheck className="w-10 h-10 text-fahara-secondary/40" />
                      <p className="text-base font-bold text-fahara-text">No cafe owners found</p>
                      <p className="text-xs text-fahara-secondary">No cafe owner accounts match your search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOwners?.map((owner) => (
                  <tr key={owner.id} className="hover:bg-fahara-background/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {owner.profile_image ? (
                          <img src={owner.profile_image} alt={owner.name} className="w-9 h-9 rounded-xl object-cover border border-fahara-border" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-fahara-primary/10 border border-fahara-primary/20 flex items-center justify-center text-fahara-primary font-bold text-xs shadow-2xs">
                            {owner.name?.charAt(0).toUpperCase() || 'O'}
                          </div>
                        )}
                        <span className="font-bold text-fahara-text">{owner.name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-fahara-text">{owner.email}</span>
                        <span className="text-[10px] text-fahara-secondary">{owner.phone || 'No phone'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-fahara-text">
                      {owner.business_name || 'Individual Partner'}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-fahara-text">
                        <Store className="w-3.5 h-3.5 text-fahara-primary" />
                        <span>{owner.cafes?.length || 0} Venues</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        owner.status === 'ACTIVE' || !owner.status ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        owner.status === 'SUSPENDED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {owner.status || 'ACTIVE'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/cafe-owners/${owner.id}`}
                        className="inline-flex p-2 text-fahara-primary hover:bg-fahara-primary/10 rounded-xl transition-colors"
                        title="View Details"
                      >
                        <ChevronRight className="w-4 h-4" />
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
