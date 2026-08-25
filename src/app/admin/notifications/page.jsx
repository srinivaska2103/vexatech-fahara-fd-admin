'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Bell, CheckCircle, Search, Filter, Megaphone, Mail, CreditCard, ShieldAlert, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, unread
  const [typeFilter, setTypeFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['adminNotifications', statusFilter, typeFilter],
    queryFn: async () => {
      const response = await api.get(`/notifications/admin/all`, {
        params: { status: statusFilter, type: typeFilter }
      });
      return response.data?.data || [];
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/admin/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminNotifications']);
    }
  });

  const getIconForType = (type) => {
    switch(type) {
      case 'BOOKING_CREATED':
      case 'BOOKING_CANCELLED':
        return <Bell className="w-4 h-4 text-blue-600" />;
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_FAILED':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'BROADCAST':
        return <Megaphone className="w-4 h-4 text-purple-600" />;
      case 'REPORT':
      case 'DISPUTE':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <Mail className="w-4 h-4 text-fahara-primary" />;
    }
  };

  const notifications = data || [];

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = 
      n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      n.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const broadcastCount = notifications.filter(n => n.type === 'BROADCAST').length;
  const bookingAlertsCount = notifications.filter(n => n.type?.includes('BOOKING')).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 pb-12 overflow-x-hidden max-w-5xl mx-auto"
    >
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fahara-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-fahara-primary" />
            Notifications & Broadcast Center
          </h1>
          <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
            Manage real-time customer alerts, system notifications, and admin broadcast campaigns.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/notifications/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-fahara-primary text-white text-xs font-bold rounded-xl hover:bg-fahara-primary/90 transition-all cursor-pointer shadow-2xs"
          >
            <Megaphone className="w-4 h-4" /> Send Broadcast
          </Link>
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending || unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-fahara-surface border border-fahara-border text-fahara-text text-xs font-bold rounded-xl hover:bg-fahara-background transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Mark All Read
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Total System Alerts</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Bell className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{notifications.length}</div>
          <span className="text-[11px] text-fahara-secondary mt-1 block">Live Audit Activity Logs</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Unread Alerts</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{unreadCount}</div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">Pending Review</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Broadcast Campaigns</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Megaphone className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{broadcastCount}</div>
          <span className="text-[11px] text-purple-600 font-semibold mt-1 block">Sent Announcements</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Booking Events</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{bookingAlertsCount}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Customer Reservations</span>
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fahara-border bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all placeholder:text-fahara-secondary/60"
            placeholder="Search notification titles, content, or user emails..."
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
              <option value="all">All Status</option>
              <option value="unread">Unread Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              className="w-full sm:w-auto bg-fahara-background border border-fahara-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 cursor-pointer"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="BROADCAST">Broadcasts</option>
              <option value="BOOKING_CREATED">Bookings</option>
              <option value="PAYMENT_RECEIVED">Payments</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications Feed */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-16 text-center text-fahara-secondary flex justify-center items-center gap-2 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-fahara-primary" />
            <span>Loading notifications feed...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-16 text-center text-fahara-secondary flex flex-col items-center gap-2">
            <Bell className="w-10 h-10 text-fahara-secondary/40" />
            <p className="text-base font-bold text-fahara-text">No notifications found</p>
            <p className="text-xs text-fahara-secondary">No system alerts match your current filter criteria.</p>
          </div>
        ) : (
          <ul className="divide-y divide-fahara-border/60">
            {filteredNotifications.map((n) => (
              <li 
                key={n.id} 
                className={`p-5 hover:bg-fahara-background/60 transition-colors flex items-start gap-4 ${!n.is_read ? 'bg-fahara-primary/5' : ''}`}
              >
                <div className={`mt-0.5 p-2 rounded-xl border flex-shrink-0 ${
                  !n.is_read 
                    ? 'bg-fahara-primary/10 border-fahara-primary/20 shadow-2xs' 
                    : 'bg-fahara-background border-fahara-border'
                }`}>
                  {getIconForType(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs ${!n.is_read ? 'font-extrabold text-fahara-text' : 'font-bold text-fahara-text/80'}`}>
                        {n.title}
                      </h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-fahara-primary inline-block"></span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-fahara-secondary whitespace-nowrap">
                      {n.created_at ? format(new Date(n.created_at), 'MMM d, yyyy h:mm a') : ''}
                    </span>
                  </div>
                  <p className="text-xs text-fahara-text/90 leading-relaxed">
                    {n.message}
                  </p>
                  {n.user && (
                    <div className="mt-2 text-[10px] font-semibold text-fahara-secondary bg-fahara-background border border-fahara-border/70 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5">
                      <span className="font-bold text-fahara-text">Target User:</span> {n.user.name} ({n.user.email})
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
