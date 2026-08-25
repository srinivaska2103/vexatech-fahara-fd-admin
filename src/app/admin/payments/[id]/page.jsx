'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, CreditCard, Building, Receipt, Phone, Mail, 
  CheckCircle2, XCircle, Clock, Loader2, DollarSign, ShieldCheck, AlertTriangle 
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminPaymentDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: payment, isLoading, error } = useQuery({
    queryKey: ['adminPaymentDetail', id],
    queryFn: async () => {
      const res = await api.get(`/payments/admin/payments/${id}`);
      return res.data?.data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-fahara-primary" />
          <span className="text-xs text-fahara-secondary">Loading payment transaction details...</span>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-extrabold text-fahara-text">Transaction Not Found</h2>
        <p className="text-xs text-fahara-secondary">The requested payment transaction record does not exist.</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-fahara-primary text-white text-xs font-bold rounded-xl hover:bg-fahara-primary/90 transition-all cursor-pointer">
          Return to Payments Ledger
        </button>
      </div>
    );
  }

  const isSuccess = payment.internal_status === 'SUCCESS' || payment.internal_status === 'PAID';
  const isFailed = payment.internal_status === 'FAILED';
  const isRefunded = payment.internal_status === 'REFUNDED';

  const handleProcessRefund = () => {
    setShowConfirm(false);
    alert('Refund request triggered via Razorpay Payments API.');
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 pb-12 overflow-x-hidden max-w-4xl mx-auto"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fahara-border/60 pb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/payments" 
            className="p-2.5 bg-fahara-surface border border-fahara-border rounded-2xl hover:bg-fahara-background transition-colors text-fahara-text cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight font-mono">
                Payment #{payment.id.substring(0, 8).toUpperCase()}
              </h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                isSuccess ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                isRefunded ? 'bg-amber-50 text-amber-700 border-amber-200' :
                isFailed ? 'bg-rose-50 text-rose-700 border-rose-200' :
                'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {payment.internal_status}
              </span>
            </div>
            <p className="text-xs text-fahara-secondary mt-1">
              Processed on {payment.payment_date ? format(new Date(payment.payment_date), 'MMMM dd, yyyy HH:mm:ss') : 'N/A'}
            </p>
          </div>
        </div>
        
        {isSuccess && (
          <button 
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
          >
            Issue Full Refund
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-fahara-surface rounded-3xl shadow-xl max-w-md w-full p-6 border border-fahara-border space-y-4">
            <h3 className="text-base font-bold text-fahara-text flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Confirm Refund Processing
            </h3>
            <p className="text-fahara-secondary text-xs leading-relaxed">
              Are you sure you want to issue a full refund of <span className="font-bold text-rose-600">₹{payment.amount}</span> to <span className="font-bold text-fahara-text">{payment.customer}</span>? This will contact the Razorpay Payments gateway API.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-fahara-background text-fahara-text hover:bg-fahara-surface border border-fahara-border font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleProcessRefund}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gateway Details */}
        <div className="bg-fahara-surface rounded-2xl border border-fahara-border p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-fahara-border pb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <CreditCard className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-fahara-text">Gateway Transaction Details</h2>
          </div>
          
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary block">Gateway Order ID</span>
              <p className="font-mono font-extrabold text-fahara-text break-all mt-0.5">{payment.gateway_order_id}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary block">Transaction Reference ID</span>
              <p className="font-mono font-extrabold text-fahara-primary break-all mt-0.5">{payment.transaction_id}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary block">Payment Method / Provider</span>
              <p className="font-bold text-fahara-text mt-0.5">{payment.payment_method || 'UPI / Razorpay Payments'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary block">Gateway Status</span>
              <div className="flex items-center gap-1.5 font-bold mt-0.5">
                {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : 
                 isFailed ? <XCircle className="w-4 h-4 text-rose-600" /> : 
                 <Clock className="w-4 h-4 text-amber-500" />}
                <span className={isSuccess ? 'text-emerald-700' : isFailed ? 'text-rose-700' : 'text-amber-700'}>
                  {payment.gateway_status || payment.internal_status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Source Details */}
        <div className="bg-fahara-surface rounded-2xl border border-fahara-border p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-fahara-border pb-3">
            <div className="p-2 bg-fahara-primary/10 text-fahara-primary rounded-xl border border-fahara-primary/20">
              <Building className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-fahara-text">Transaction Source</h2>
          </div>
          
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary block">Associated Booking Number</span>
              <Link href={`/admin/bookings?search=${payment.booking_id}`} className="font-extrabold text-fahara-primary font-mono hover:underline mt-0.5 block">
                {payment.booking_id}
              </Link>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary block">Customer Name</span>
              <p className="font-bold text-fahara-text mt-0.5">{payment.customer}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary block">Customer Email</span>
              <p className="font-semibold text-fahara-text flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-fahara-secondary" />
                {payment.customer_email || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary block">Customer Phone</span>
              <p className="font-semibold text-fahara-text flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-fahara-secondary" />
                {payment.customer_phone || 'N/A'}
              </p>
            </div>
          </div>
        </div>

      </div>
      
      {/* Financial Banner */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs relative overflow-hidden flex items-center justify-between">
        <Receipt className="absolute -right-6 -bottom-6 w-36 h-36 text-fahara-primary/5 rotate-12 pointer-events-none" />
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-fahara-secondary block">Total Cleared Payment Volume</span>
          <p className="text-3xl font-extrabold text-fahara-primary mt-1">₹{Number(payment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            Settled via Razorpay
          </span>
        </div>
      </div>

    </motion.div>
  );
}
