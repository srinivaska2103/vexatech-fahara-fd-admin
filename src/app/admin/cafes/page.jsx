'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Search, Filter, ChevronRight, MapPin, Star, Building, Coffee, CheckCircle2, Clock, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CafeList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: cafes, isLoading } = useQuery({
    queryKey: ['adminCafes'],
    queryFn: async () => {
      const response = await api.get('/cafes');
      return response.data.data;
    }
  });

  const filteredCafes = cafes?.filter(cafe => {
    const matchesSearch = 
      cafe.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cafe.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cafe.users?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && cafe.status === statusFilter.toUpperCase();
  });

  const totalActive = cafes?.filter(c => c.status === 'ACTIVE' || c.status === 'APPROVED').length || 0;
  const totalPending = cafes?.filter(c => c.status === 'PENDING').length || 0;
  const totalFeatured = cafes?.filter(c => c.is_featured).length || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 pb-12 overflow-x-hidden"
    >
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fahara-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight flex items-center gap-2.5">
            <Coffee className="h-6 w-6 text-fahara-primary" />
            Cafe Venues Directory
          </h1>
          <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
            Manage platform cafes, review pending listings, and feature top venues.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-fahara-secondary bg-fahara-surface border border-fahara-border px-3 py-1.5 rounded-xl">
          <span>Total Cafes:</span>
          <span className="font-bold text-fahara-text">{cafes?.length || 0}</span>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Total Venues</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Coffee className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{cafes?.length || 0}</div>
          <span className="text-[11px] text-fahara-secondary mt-1 block">Listed Across Cities</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Approved & Active</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{totalActive}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Live Bookable Venues</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Pending Review</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{totalPending}</div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Awaiting Verification</span>
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
            placeholder="Search by cafe name, city, or owner..."
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
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Cafes Table */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-fahara-background/80 border-b border-fahara-border text-fahara-secondary font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Cafe Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Rating</th>
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
                      <span>Loading cafes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCafes?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <Coffee className="w-10 h-10 text-fahara-secondary/40" />
                      <p className="text-base font-bold text-fahara-text">No cafes found</p>
                      <p className="text-xs text-fahara-secondary">No cafe listings match your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCafes?.map((cafe) => (
                  <tr key={cafe.id} className="hover:bg-fahara-background/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {cafe.cover_image ? (
                          <img src={cafe.cover_image} alt={cafe.name} className="w-10 h-10 rounded-xl object-cover border border-fahara-border" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-fahara-primary/10 border border-fahara-primary/20 flex items-center justify-center text-fahara-primary">
                            <Building className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-fahara-text">{cafe.name}</span>
                          {cafe.is_featured && (
                            <span className="text-[9px] font-extrabold text-purple-600 flex items-center gap-0.5 mt-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-fahara-text">
                        <MapPin className="w-3.5 h-3.5 text-fahara-primary" />
                        <span>{cafe.city || 'N/A'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {cafe.users ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-fahara-text">{cafe.users.name}</span>
                          <span className="text-[10px] text-fahara-secondary">{cafe.users.email}</span>
                        </div>
                      ) : (
                        <span className="text-fahara-secondary italic">Unknown</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-bold text-fahara-text">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{Number(cafe.average_rating || 0).toFixed(1)}</span>
                        <span className="text-[10px] text-fahara-secondary font-normal">({cafe.total_reviews || 0})</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        cafe.status === 'ACTIVE' || cafe.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        cafe.status === 'PENDING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {cafe.status || 'PENDING'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/cafes/${cafe.id}`}
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
