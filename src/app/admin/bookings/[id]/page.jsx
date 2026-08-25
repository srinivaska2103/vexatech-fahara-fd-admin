'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, CalendarDays, Clock, Users, MapPin, 
  CreditCard, CheckCircle2, ShieldCheck, Activity, XCircle, RefreshCcw, 
  Loader2, Coffee, Sparkles, User, Mail, Phone, FileText, AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminBookingDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['adminBookingDetail', id],
    queryFn: async () => {
      const res = await api.get(`/bookings/${id}`);
      return res.data?.data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-fahara-primary" />
          <span className="text-xs text-fahara-secondary">Loading reservation details...</span>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-extrabold text-fahara-text">Booking Record Not Found</h2>
        <p className="text-xs text-fahara-secondary">The requested booking reservation does not exist or has been removed.</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-fahara-primary text-white text-xs font-bold rounded-xl hover:bg-fahara-primary/90 transition-all cursor-pointer">
          Return to Bookings List
        </button>
      </div>
    );
  }

  const isCancelled = booking.booking_status === 'CANCELLED' || booking.booking_status === 'REJECTED';
  const isCompleted = booking.booking_status === 'COMPLETED';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 pb-12 overflow-x-hidden max-w-5xl mx-auto"
    >
      {/* Header Banner */}
      <div className="flex items-center gap-4 border-b border-fahara-border/60 pb-6">
        <Link 
          href="/admin/bookings" 
          className="p-2.5 bg-fahara-surface border border-fahara-border rounded-2xl hover:bg-fahara-background transition-colors text-fahara-text cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight font-mono">
              Booking #{booking.booking_number}
            </h1>
            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
              isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              isCancelled ? 'bg-rose-50 text-rose-700 border-rose-200' :
              booking.booking_status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {booking.booking_status}
            </span>
          </div>
          <p className="text-xs text-fahara-secondary mt-1">
            Placed on {booking.created_at ? format(new Date(booking.created_at), 'MMMM dd, yyyy') : 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Main Reservation Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Reservation Metrics Grid */}
          <div className="bg-fahara-surface rounded-2xl border border-fahara-border p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-fahara-text border-b border-fahara-border pb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-fahara-primary" /> Reservation Parameters
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 bg-fahara-background border border-fahara-border rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary flex items-center gap-1 mb-1">
                  <CalendarDays className="w-3.5 h-3.5 text-fahara-primary" /> Date
                </p>
                <p className="font-extrabold text-xs text-fahara-text">
                  {booking.booking_date ? format(new Date(booking.booking_date), 'MMM dd, yyyy') : 'N/A'}
                </p>
              </div>

              <div className="p-3.5 bg-fahara-background border border-fahara-border rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-fahara-primary" /> Time Slot
                </p>
                <p className="font-extrabold text-xs text-fahara-text">
                  {booking.start_time && booking.end_time ? 
                    `${format(new Date(booking.start_time.replace('Z', '')), 'hh:mm a')} - ${format(new Date(booking.end_time.replace('Z', '')), 'hh:mm a')}` : 
                    'N/A'
                  }
                </p>
              </div>

              <div className="p-3.5 bg-fahara-background border border-fahara-border rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary flex items-center gap-1 mb-1">
                  <Users className="w-3.5 h-3.5 text-fahara-primary" /> Guests
                </p>
                <p className="font-extrabold text-xs text-fahara-text">{booking.total_persons || 1} People</p>
              </div>

              <div className="p-3.5 bg-fahara-background border border-fahara-border rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary flex items-center gap-1 mb-1">
                  <Activity className="w-3.5 h-3.5 text-fahara-primary" /> Duration
                </p>
                <p className="font-extrabold text-xs text-fahara-text">{booking.hours || 1} Hours</p>
              </div>
            </div>
          </div>

          {/* Services Rendered Details */}
          <div className="bg-fahara-surface rounded-2xl border border-fahara-border p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-fahara-text border-b border-fahara-border pb-3 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-fahara-primary" /> Included Services & Packages
            </h2>
            
            <div className="space-y-3">
              {booking.cafes && (
                <div className="flex justify-between items-center p-4 bg-fahara-background rounded-xl border border-fahara-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-fahara-primary" />
                      <p className="font-extrabold text-xs text-fahara-text">{booking.cafes.name}</p>
                    </div>
                    <p className="text-[10px] text-fahara-secondary mt-0.5">Cafe Venue Rental</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-xs text-fahara-text">₹{Number(booking.cafe_amount || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}
              
              {booking.packages && (
                <div className="flex justify-between items-center p-4 bg-fahara-background rounded-xl border border-fahara-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <p className="font-extrabold text-xs text-fahara-text">{booking.packages.package_name || booking.packages.title}</p>
                    </div>
                    <p className="text-[10px] text-fahara-secondary mt-0.5">Selected Package</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-xs text-fahara-text">₹{Number(booking.packages.price || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}

              {booking.event_services && (
                <div className="flex justify-between items-center p-4 bg-purple-50/60 rounded-xl border border-purple-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <p className="font-extrabold text-xs text-purple-950">{booking.event_services.service_name || booking.event_services.title}</p>
                    </div>
                    <p className="text-[10px] text-purple-700 mt-0.5">Event Manager Service</p>
                    <p className="text-[10px] text-purple-600 font-semibold mt-1">Organizer: {booking.event_services.users?.name || 'Event Manager'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-xs text-purple-950">₹{Number(booking.event_service_amount || booking.event_services.price || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}
              
              {(Number(booking.food_amount) > 0 || Number(booking.decoration_amount) > 0) && (
                <div className="flex justify-between items-center p-4 bg-fahara-background rounded-xl border border-fahara-border">
                  <div>
                    <p className="font-extrabold text-xs text-fahara-text">Custom Add-ons</p>
                    <p className="text-[10px] text-fahara-secondary">Food & Decoration Enhancements</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-xs text-fahara-text">₹{(Number(booking.food_amount || 0) + Number(booking.decoration_amount || 0)).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Side Details */}
        <div className="space-y-6">
          
          {/* Customer Info */}
          <div className="bg-fahara-surface rounded-2xl border border-fahara-border p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-fahara-text border-b border-fahara-border pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-fahara-primary" /> Customer Profile
            </h2>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary block">Full Name</span>
                <p className="font-bold text-fahara-text mt-0.5">{booking.users?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary block">Email Address</span>
                <p className="font-bold text-fahara-text mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-fahara-secondary" />
                  {booking.users?.email || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary block">Phone Number</span>
                <p className="font-bold text-fahara-text mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-fahara-secondary" />
                  {booking.users?.phone || 'N/A'}
                </p>
              </div>
              {booking.special_request && (
                <div className="pt-2 border-t border-fahara-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Special Request Note</span>
                  <p className="text-xs p-2.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl mt-1 leading-relaxed">
                    {booking.special_request}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-fahara-surface rounded-2xl border border-fahara-border p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-fahara-text border-b border-fahara-border pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-fahara-primary" /> Payment Breakdown
            </h2>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-fahara-secondary font-medium">Services Subtotal</span>
                <span className="font-bold text-fahara-text">₹{Number(booking.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fahara-secondary font-medium">Platform Fee & Taxes</span>
                <span className="font-bold text-fahara-text">₹{Number(booking.fahara_service_charge || 0).toLocaleString('en-IN')}</span>
              </div>
              {Number(booking.discount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="font-medium">Applied Promo Discount</span>
                  <span className="font-bold">-₹{Number(booking.discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-3 border-t border-fahara-border flex justify-between font-extrabold text-sm">
                <span>Grand Total</span>
                <span className="text-fahara-primary">₹{Number(booking.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-fahara-border flex items-center justify-between">
              <span className="text-xs font-bold text-fahara-text">Payment Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                booking.payment_status === 'PAID' || booking.payment_status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                booking.payment_status === 'REFUNDED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {booking.payment_status || 'UNPAID'}
              </span>
            </div>
          </div>
          
          {/* Timeline */}
          <div className="bg-fahara-surface rounded-2xl border border-fahara-border p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-fahara-text border-b border-fahara-border pb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-fahara-primary" /> Booking Timeline
            </h2>
            
            <div className="relative border-l-2 border-fahara-border ml-3 space-y-5">
              
              <div className="relative">
                <div className="absolute -left-[19px] bg-fahara-surface p-0.5 rounded-full">
                  <div className="w-2.5 h-2.5 bg-fahara-primary rounded-full"></div>
                </div>
                <div className="pl-4">
                  <p className="text-xs font-bold text-fahara-text">Booking Created</p>
                  <p className="text-[10px] text-fahara-secondary">{booking.created_at ? format(new Date(booking.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}</p>
                </div>
              </div>

              {(booking.payment_status === 'PAID' || booking.payment_status === 'SUCCESS') && (
                <div className="relative">
                  <div className="absolute -left-[19px] bg-fahara-surface p-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="pl-4">
                    <p className="text-xs font-bold text-fahara-text">Payment Confirmed</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">Amount: ₹{Number(booking.total || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}

              {(booking.booking_status === 'CONFIRMED' || isCompleted) && (
                <div className="relative">
                  <div className="absolute -left-[19px] bg-fahara-surface p-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="pl-4">
                    <p className="text-xs font-bold text-fahara-text">Reservation Accepted</p>
                  </div>
                </div>
              )}

              {isCompleted && (
                <div className="relative">
                  <div className="absolute -left-[19px] bg-fahara-surface p-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="pl-4">
                    <p className="text-xs font-bold text-fahara-text">Event & Booking Completed</p>
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="relative">
                  <div className="absolute -left-[19px] bg-fahara-surface p-0.5 rounded-full">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <div className="pl-4">
                    <p className="text-xs font-bold text-rose-600">Booking {booking.booking_status}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
}
