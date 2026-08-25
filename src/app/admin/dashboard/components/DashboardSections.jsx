'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CalendarClock, ArrowRight, ShieldAlert, BadgeCheck, CheckCircle2, 
  Clock, User, Coffee, Star, ChevronRight, AlertCircle, ArrowUpRight 
} from 'lucide-react';
import { EmptyState } from './DashboardEmptyStates';

export const DashboardSections = ({ recentBookings, upcomingBookings, recentReviews, activity, summary }) => {
  return (
    <div className="space-y-8 mt-8">
      {/* 1. Recent Bookings Table & System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Bookings List (Spans 2 columns on lg) */}
        <div className="lg:col-span-2 bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-fahara-text">Recent Reservations</h3>
              <p className="text-xs text-fahara-secondary mt-0.5">Latest bookings placed across cafes</p>
            </div>
            <Link 
              href="/admin/bookings" 
              className="inline-flex items-center text-xs font-semibold text-fahara-primary hover:text-fahara-secondary transition-colors"
            >
              View All Bookings <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          
          {(!recentBookings || recentBookings.length === 0) ? (
            <EmptyState icon={CalendarClock} title="No recent bookings" description="No customer reservations found in database." />
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-fahara-border text-fahara-secondary font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pr-4">Customer</th>
                    <th className="pb-3 px-4">Cafe Venue</th>
                    <th className="pb-3 px-4">Date & Time</th>
                    <th className="pb-3 px-4">Amount</th>
                    <th className="pb-3 pl-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fahara-border/60">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-fahara-background/60 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fahara-primary/10 text-fahara-primary font-bold text-xs">
                            {booking.customerName ? booking.customerName.charAt(0).toUpperCase() : 'G'}
                          </div>
                          <div>
                            <p className="font-semibold text-fahara-text truncate max-w-[120px]">{booking.customerName}</p>
                            <p className="text-[10px] text-fahara-secondary truncate max-w-[120px]">{booking.customerEmail || 'Guest'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-fahara-text">
                        <div className="flex items-center gap-1.5">
                          <Coffee className="h-3.5 w-3.5 text-fahara-secondary" />
                          <span>{booking.cafeName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-fahara-secondary">
                        {booking.date ? new Date(booking.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A'}
                        {booking.time && <span className="ml-1 text-[10px]">({booking.time})</span>}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-fahara-text">
                        ₹{booking.amount ? booking.amount.toLocaleString('en-IN') : 0}
                      </td>

                      <td className="py-3.5 pl-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          booking.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          booking.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          booking.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          booking.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Activity Timeline (Spans 1 col on lg) */}
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-fahara-text">System Alerts</h3>
              <p className="text-xs text-fahara-secondary mt-0.5">Live platform activity stream</p>
            </div>
          </div>
          
          {(!activity || activity.length === 0) ? (
            <EmptyState icon={ShieldAlert} title="No recent activity" description="Activity logs will appear as actions occur." />
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto pr-1 max-h-[340px]">
              {activity.map((act, index) => (
                <div key={act.id || index} className="flex gap-3 text-xs">
                  <div className="mt-0.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-fahara-primary/10 border border-fahara-primary/20 text-fahara-primary">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="flex-1 border-b border-fahara-border/60 pb-3">
                    <p className="font-semibold text-fahara-text">{act.title}</p>
                    <p className="text-fahara-secondary mt-0.5">{act.description}</p>
                    <p className="text-[10px] text-fahara-secondary/70 mt-1 font-mono">
                      {new Date(act.time).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 2. Actionable Modules: Pending Approvals & Payouts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pending Approvals Widget */}
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Action Required
              </span>
              <BadgeCheck className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-fahara-text">Pending Verifications</h3>
            <p className="text-xs text-fahara-secondary mt-1">
              {(summary?.pending_verifications || 0) > 0 
                ? `${summary.pending_verifications} new cafe & event manager profiles are awaiting review and verification.`
                : 'All cafe and event manager verification requests have been processed.'
              }
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-fahara-border pt-4">
            <span className="text-2xl font-extrabold text-fahara-text">
              {summary?.pending_verifications || 0}
            </span>
            <Link 
              href="/admin/verifications"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition-colors shadow-xs"
            >
              Review Pending <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Pending Payouts Widget */}
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Financial Settlement
              </span>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-fahara-text">Pending Payout Escrow</h3>
            <p className="text-xs text-fahara-secondary mt-1">
              {(summary?.pending_payouts || 0) > 0 
                ? `₹${Number(summary.pending_payouts).toLocaleString('en-IN')} in booking payments awaiting partner distribution.`
                : 'All partner payouts and earnings settlements are up to date.'
              }
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-fahara-border pt-4">
            <span className="text-2xl font-extrabold text-fahara-text">
              ₹{(summary?.pending_payouts || 0).toLocaleString('en-IN')}
            </span>
            <Link 
              href="/admin/payouts"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Manage Payouts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
