'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Search, Filter, CalendarDays, Eye, Loader2, Calendar, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CustomSelect } from '@/components/ui/CustomSelect';

export default function AdminBookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/admin/all');
      return res.data?.data;
    }
  });

  const filteredBookings = bookings?.filter(b => {
    const matchesSearch = b.booking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.cafeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.eventManagerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const totalActive = bookings?.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length || 0;
  const totalCompleted = bookings?.filter(b => b.status === 'COMPLETED').length || 0;
  const totalVolume = bookings?.reduce((acc, b) => acc + (Number(b.amount) || 0), 0) || 0;

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
            <Calendar className="h-6 w-6 text-fahara-primary" />
            Bookings & Reservations
          </h1>
          <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
            Manage and view customer reservations placed across cafes and events.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-fahara-secondary bg-fahara-surface border border-fahara-border px-3 py-1.5 rounded-xl">
          <span>Total Records:</span>
          <span className="font-bold text-fahara-text">{bookings?.length || 0}</span>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Total Bookings</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{bookings?.length || 0}</div>
          <span className="text-[11px] text-fahara-secondary mt-1 block">Customer Reservations</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Active & Pending</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{totalActive}</div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">Pending / Upcoming</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Completed</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{totalCompleted}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Successfully Fulfilled</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Gross Volume</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">₹{totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Total Booking Value</span>
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
            placeholder="Search by ID, Customer, Cafe, or Manager..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fahara-border bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all placeholder:text-fahara-secondary/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <CustomSelect
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'CONFIRMED', label: 'Confirmed' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
              { value: 'REJECTED', label: 'Rejected' },
            ]}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            icon={Filter}
            className="w-full md:w-auto min-w-[150px]"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-fahara-background/80 border-b border-fahara-border text-fahara-secondary font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Venue / Organizer</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fahara-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-fahara-primary" />
                      <span>Loading bookings list...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <CalendarDays className="w-10 h-10 text-fahara-secondary/40" />
                      <p className="text-base font-bold text-fahara-text">No bookings found</p>
                      <p className="text-xs text-fahara-secondary">No customer reservations match the specified filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-fahara-background/60 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-fahara-text font-mono">{b.booking_number}</span>
                      <div className="text-[10px] text-fahara-secondary mt-0.5 truncate max-w-[120px]">{b.package_name || 'Standard Booking'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-fahara-text">{b.customerName}</div>
                      <div className="text-[10px] text-fahara-secondary">{b.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-fahara-text">{b.cafeName || 'N/A'}</div>
                      <div className="text-[10px] text-fahara-secondary">{b.eventManagerName !== 'N/A' ? b.eventManagerName : ''}</div>
                    </td>
                    <td className="px-6 py-4 text-fahara-secondary">
                      <div>{b.date ? format(new Date(b.date), 'MMM dd, yyyy') : 'N/A'}</div>
                      <div className="text-[10px] text-fahara-secondary/70 mt-0.5">
                        {b.startTime && b.endTime ? 
                          `${format(new Date(b.startTime.replace('Z', '')), 'hh:mm a')} - ${format(new Date(b.endTime.replace('Z', '')), 'hh:mm a')}` : 
                          'Time N/A'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-fahara-text">
                      ₹{b.amount ? Number(b.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${
                          b.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          b.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          b.status === 'CANCELLED' || b.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {b.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider w-fit ${
                          b.paymentStatus === 'PAID' || b.paymentStatus === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' :
                          b.paymentStatus === 'REFUNDED' ? 'bg-amber-50 text-amber-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>
                          {b.paymentStatus || 'UNPAID'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/bookings/${b.id}`}
                        className="inline-flex items-center justify-center p-2 text-fahara-primary hover:bg-fahara-primary/10 rounded-xl transition-colors cursor-pointer"
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
