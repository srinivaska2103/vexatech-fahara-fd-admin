'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Mail, Phone, Calendar, Star, MapPin, Coffee, 
  ArrowRightLeft, User, ShieldCheck, CreditCard, Clock, Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DashboardErrorState } from '../../dashboard/components/DashboardEmptyStates';

export default function CustomerDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('bookings');

  const { data: customer, isLoading, isError } = useQuery({
    queryKey: ['adminCustomer', id],
    queryFn: async () => {
      const response = await api.get(`/customers/owner/${id}`);
      return response.data.data;
    }
  });

  const { data: bookings } = useQuery({
    queryKey: ['adminCustomerBookings', id],
    queryFn: async () => {
      const response = await api.get(`/customers/owner/${id}/bookings`);
      return response.data.data;
    }
  });

  const { data: payments } = useQuery({
    queryKey: ['adminCustomerPayments', id],
    queryFn: async () => {
      const response = await api.get(`/customers/owner/${id}/payments`);
      return response.data.data;
    }
  });

  const { data: reviews } = useQuery({
    queryKey: ['adminCustomerReviews', id],
    queryFn: async () => {
      const response = await api.get(`/customers/owner/${id}/reviews`);
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-fahara-primary" />
          <span className="text-xs text-fahara-secondary">Loading customer profile...</span>
        </div>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="w-full py-12">
        <DashboardErrorState message="Customer profile not found." />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 pb-12 overflow-x-hidden"
    >
      {/* Back Button & Header */}
      <div>
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center text-xs font-bold text-fahara-secondary hover:text-fahara-primary transition-colors cursor-pointer mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Customers List
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fahara-border/60 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight">
              Customer Profile
            </h1>
            <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
              Detailed account overview, booking history, and transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Customer Hero Card */}
      <div className="bg-fahara-surface border border-fahara-border rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center gap-6 justify-between relative overflow-hidden">
        {/* Decorative Ambient Sphere */}
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-fahara-primary/5 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-5">
          {customer.profile_image ? (
            <img 
              src={customer.profile_image} 
              alt={customer.name} 
              className="w-20 h-20 rounded-2xl object-cover border-2 border-fahara-border shadow-xs" 
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-fahara-primary/10 border border-fahara-primary/20 flex items-center justify-center text-2xl text-fahara-primary font-bold shadow-2xs">
              {customer.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-fahara-text tracking-tight">{customer.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                customer.status === 'ACTIVE' || !customer.status ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                customer.status === 'SUSPENDED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {customer.status || 'ACTIVE'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fahara-secondary pt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-fahara-primary" />
                <span className="text-fahara-text font-medium">{customer.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-fahara-primary" />
                <span>{customer.phone || 'No phone registered'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-fahara-secondary" />
                <span>Joined {new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Metric Badges */}
        <div className="grid grid-cols-2 gap-3 text-center w-full md:w-auto">
          <div className="bg-fahara-background p-4 rounded-2xl border border-fahara-border shadow-2xs min-w-[110px]">
            <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider mb-1">Bookings</p>
            <p className="text-2xl font-extrabold text-fahara-text">{customer.total_bookings || bookings?.length || 0}</p>
          </div>
          <div className="bg-fahara-background p-4 rounded-2xl border border-fahara-border shadow-2xs min-w-[120px]">
            <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider mb-1">Total Spent</p>
            <p className="text-2xl font-extrabold text-fahara-text">₹{(customer.total_spend || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-fahara-border">
        <nav className="-mb-px flex space-x-6">
          {[
            { id: 'bookings', label: 'Bookings History', count: bookings?.length },
            { id: 'payments', label: 'Payments', count: payments?.length },
            { id: 'reviews', label: 'Reviews', count: reviews?.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-fahara-primary text-fahara-primary font-bold'
                  : 'border-transparent text-fahara-secondary hover:text-fahara-text'
              } whitespace-nowrap py-3 px-1 border-b-2 text-xs transition-all cursor-pointer flex items-center gap-2`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-fahara-primary/10 text-fahara-primary font-extrabold' : 'bg-fahara-background text-fahara-secondary'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl overflow-hidden shadow-xs">
        
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-fahara-background/80 border-b border-fahara-border text-fahara-secondary font-semibold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">Cafe / Event Venue</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Guests</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fahara-border/60">
                {(!bookings || bookings.length === 0) ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-fahara-secondary">
                      No booking history found for this customer.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-fahara-background/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Coffee className="h-4 w-4 text-fahara-secondary" />
                          <span className="font-bold text-fahara-text">{booking.cafes?.name || 'Event Service'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-fahara-secondary">
                        {new Date(booking.booking_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {booking.start_time && (
                          <span className="ml-1 text-[10px]">
                            at {booking.start_time.substring(0, 5)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-fahara-text">{booking.total_persons} Persons</td>
                      <td className="px-6 py-4 font-extrabold text-fahara-text">₹{booking.total_price ? Number(booking.total_price).toLocaleString('en-IN') : 0}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          booking.booking_status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          booking.booking_status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          booking.booking_status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {booking.booking_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-fahara-background/80 border-b border-fahara-border text-fahara-secondary font-semibold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Booking Ref</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fahara-border/60">
                {(!payments || payments.length === 0) ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-fahara-secondary">
                      No payment history found for this customer.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-fahara-background/60 transition-colors">
                      <td className="px-6 py-4 font-mono text-fahara-text font-bold">{payment.transaction_id || payment.id.substring(0,8)}</td>
                      <td className="px-6 py-4 font-medium text-fahara-secondary">{payment.bookings?.booking_number || 'N/A'}</td>
                      <td className="px-6 py-4 font-extrabold text-fahara-text">₹{payment.amount ? Number(payment.amount).toLocaleString('en-IN') : 0}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-fahara-background border border-fahara-border rounded-md text-[10px] font-semibold">
                          {payment.payment_method || 'Online'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-fahara-secondary">
                        {new Date(payment.paid_at || payment.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="p-6 space-y-4">
            {(!reviews || reviews.length === 0) ? (
              <div className="text-center py-8 text-fahara-secondary text-xs">
                No customer reviews submitted yet.
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-fahara-border/60 pb-5 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-fahara-text text-sm">{review.cafes?.name || 'Cafe Review'}</h4>
                    <span className="text-[10px] text-fahara-secondary">
                      {new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-fahara-text leading-relaxed">{review.review}</p>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </motion.div>
  );
}
