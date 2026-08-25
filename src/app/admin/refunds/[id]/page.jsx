'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, ArrowRightLeft, Building, Receipt, Phone, Mail, 
  CheckCircle2, XCircle, Clock, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function AdminRefundDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: refund, isLoading, error, refetch } = useQuery({
    queryKey: ['adminRefundDetail', id],
    queryFn: async () => {
      const res = await api.get(`/payments/admin/refunds/${id}`);
      return res.data?.data;
    },
    enabled: !!id
  });

  const handleProcessRefund = async () => {
    try {
      setIsProcessing(true);
      await api.post(`/payments/admin/refunds/${id}/process`);
      await refetch();
      setShowConfirmModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center animate-pulse text-fahara-secondary">Loading refund details...</div>;
  }

  if (error || !refund) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Refund not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-fahara-primary hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const isCompleted = refund.status === 'Completed';
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/refunds" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-fahara-border transition-colors">
            <ArrowLeft className="w-5 h-5 text-fahara-text" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-fahara-text flex items-center space-x-3">
              <span>{refund.id}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                isCompleted ? 'bg-green-50 text-green-700 border-green-200' :
                'bg-orange-50 text-orange-700 border-orange-200'
              }`}>
                {refund.status}
              </span>
            </h1>
            <p className="text-fahara-secondary text-sm mt-1">
              Requested on {format(new Date(refund.requested_date), 'MMMM dd, yyyy HH:mm:ss')}
            </p>
          </div>
        </div>

        {!isCompleted && (
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <ArrowRightLeft className="w-4 h-4" /> Execute Razorpay Refund
          </button>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-fahara-border">
            <h3 className="text-xl font-bold text-fahara-text mb-2">Execute Razorpay Refund</h3>
            <p className="text-fahara-secondary text-sm mb-6">
              Are you sure you want to trigger live refund for <span className="font-bold text-fahara-text">{refund.id}</span> ({refund.customer}) via <span className="font-bold text-fahara-primary">Razorpay Payments PG</span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-100 text-fahara-text hover:bg-gray-200 text-xs font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleProcessRefund}
                disabled={isProcessing}
                className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 text-xs font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center cursor-pointer shadow-xs"
              >
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Initiate Razorpay Refund
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gateway Details */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-fahara-border p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-fahara-text">Refund Details</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-fahara-secondary">Original Payment ID</p>
              <Link href={`/admin/payments/${refund.payment_id}`} className="font-mono font-medium text-sm break-all text-fahara-primary hover:underline">
                {refund.payment_id}
              </Link>
            </div>
            {refund.gateway_refund_id && (
              <div>
                <p className="text-sm text-fahara-secondary">Gateway Refund ID</p>
                <p className="font-mono font-medium text-sm break-all">{refund.gateway_refund_id}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-fahara-secondary">Reason</p>
              <p className="font-medium">{refund.reason}</p>
            </div>
            <div>
              <p className="text-sm text-fahara-secondary">Processed Date</p>
              <p className="font-medium">
                {refund.processed_date ? format(new Date(refund.processed_date), 'MMM dd, yyyy HH:mm a') : 'Pending processing...'}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-fahara-border p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-fahara-primary/10 text-fahara-primary rounded-xl">
              <Building className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-fahara-text">Customer Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-fahara-secondary">Booking Number</p>
              <Link href={`/admin/bookings?search=${refund.booking}`} className="font-bold text-fahara-primary hover:underline">
                {refund.booking}
              </Link>
            </div>
            <div>
              <p className="text-sm text-fahara-secondary">Customer Name</p>
              <p className="font-medium">{refund.customer}</p>
            </div>
            <div>
              <p className="text-sm text-fahara-secondary flex items-center"><Mail className="w-3.5 h-3.5 mr-1" /> Email</p>
              <p className="font-medium text-sm">{refund.customer_email}</p>
            </div>
            <div>
              <p className="text-sm text-fahara-secondary flex items-center"><Phone className="w-3.5 h-3.5 mr-1" /> Phone</p>
              <p className="font-medium text-sm">{refund.customer_phone}</p>
            </div>
          </div>
        </div>

      </div>
      
      {/* Financial Summary */}
      <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
        <ArrowRightLeft className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 rotate-12" />
        <h2 className="text-lg font-medium text-red-100 mb-6">Refund Amount</h2>
        <div className="flex items-end space-x-6">
          <div>
            <p className="text-red-200 text-sm mb-1">Total Amount Refunded to Customer</p>
            <p className="text-4xl font-bold">₹{refund.amount}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
