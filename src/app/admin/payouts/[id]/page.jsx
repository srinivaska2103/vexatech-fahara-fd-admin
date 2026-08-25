'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Receipt, Clock, CheckCircle, ShieldCheck, Download, CalendarDays, Building, User, Loader2, RefreshCw } from 'lucide-react';
import { DashboardErrorState } from '../../dashboard/components/DashboardEmptyStates';
import { format } from 'date-fns';

export default function PayoutDetails() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: payout, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminPayout', id],
    queryFn: async () => {
      const response = await api.get(`/payments/admin/payouts/${id}`);
      return response.data.data;
    }
  });

  const handleSyncStatus = async () => {
    try {
      setIsSyncing(true);
      await api.post(`/payments/admin/payouts/${id}/sync`);
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ['adminPayouts'] });
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to sync payout status from Razorpay backend');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 max-w-7xl mx-auto animate-pulse text-fahara-secondary">Loading payout details...</div>;
  }

  if (isError || !payout) {
    return <div className="p-6 max-w-7xl mx-auto"><DashboardErrorState message="Payout not found." /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto pb-12">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-sm font-medium text-fahara-secondary hover:text-fahara-primary transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Payouts
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fahara-text flex items-center gap-2">
            Payout {payout.reference_number}
          </h1>
          <p className="text-fahara-secondary mt-1 flex items-center gap-1 text-sm">
            <CalendarDays className="w-4 h-4" /> Processed Date: {payout.transfer_date ? format(new Date(payout.transfer_date), 'MMMM dd, yyyy') : 'N/A'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-fahara-secondary uppercase">Razorpay Status:</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
            payout.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            payout.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 border-blue-200' :
            payout.status === 'FAILED' || payout.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
            'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              payout.status === 'COMPLETED' ? 'bg-emerald-500' :
              payout.status === 'PROCESSING' ? 'bg-blue-500' :
              payout.status === 'FAILED' || payout.status === 'CANCELLED' ? 'bg-rose-500' :
              'bg-amber-500'
            }`} />
            {payout.status || 'PENDING'}
          </span>
          <button
            onClick={handleSyncStatus}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-fahara-surface hover:bg-fahara-background text-fahara-text border border-fahara-border rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-fahara-primary' : 'text-fahara-secondary'}`} />
            <span>Sync Razorpay</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Calculation Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-fahara-surface border border-fahara-border rounded-xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-fahara-text mb-6 flex items-center gap-2 border-b border-fahara-border pb-4">
              <Receipt className="w-5 h-5 text-fahara-primary" /> Payout Breakdown
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-fahara-secondary">Gross Amount (from Booking)</span>
                <span className="font-medium text-fahara-text">₹{payout.gross_amount}</span>
              </div>
              
              <div className="border-t border-fahara-border pt-4 mt-4 flex justify-between items-center">
                <span className="font-bold text-fahara-text text-lg">Net Payable Amount</span>
                <span className="font-bold text-fahara-primary text-2xl">₹{payout.gross_amount}</span>
              </div>
            </div>
          </div>

          <div className="bg-fahara-surface border border-fahara-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-fahara-text mb-4">Transaction Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-fahara-secondary mb-1">Transaction Ref</p>
                <p className="font-medium text-fahara-text break-all">{payout.reference_number}</p>
              </div>
              <div>
                <p className="text-fahara-secondary mb-1">Original Payment ID</p>
                <p className="font-medium text-fahara-text break-all">{payout.transaction_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-fahara-secondary mb-1">Booking Number</p>
                <p className="font-medium text-fahara-text">{payout.booking_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-fahara-secondary mb-1">Booking Date</p>
                <p className="font-medium text-fahara-text">{payout.booking_date ? format(new Date(payout.booking_date), 'MMM dd, yyyy') : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bank Details */}
        <div className="lg:col-span-1 space-y-8">
          
          <div className="bg-gradient-to-br from-fahara-surface to-fahara-background border border-fahara-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-fahara-text mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-fahara-primary" /> Receiving Account
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3 bg-fahara-background rounded-lg border border-fahara-border">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  {payout.partner_type === 'CAFE_OWNER' ? <Building className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs text-fahara-secondary uppercase tracking-wider">Partner</p>
                  <p className="font-bold text-fahara-text">{payout.partner_name}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-fahara-secondary uppercase tracking-wider mb-1">Bank Name</p>
                <p className="font-medium text-fahara-text">{payout.bank_name}</p>
              </div>
              <div>
                <p className="text-xs text-fahara-secondary uppercase tracking-wider mb-1">Account Holder</p>
                <p className="font-medium text-fahara-text">{payout.account_holder}</p>
              </div>
              <div>
                <p className="text-xs text-fahara-secondary uppercase tracking-wider mb-1">Account Number</p>
                <p className="font-mono text-fahara-text font-medium flex items-center gap-2">
                  {payout.account_number} <ShieldCheck className="w-4 h-4 text-green-500" title="Verified" />
                </p>
              </div>
              <div>
                <p className="text-xs text-fahara-secondary uppercase tracking-wider mb-1">IFSC Code</p>
                <p className="font-mono text-fahara-text">{payout.ifsc_code}</p>
              </div>
              
              {payout.status === 'COMPLETED' && (
                <div className="mt-6 pt-6 border-t border-fahara-border">
                  <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-fahara-background border border-fahara-border hover:bg-fahara-surface text-fahara-text font-medium rounded-lg transition-colors">
                    <Download className="w-4 h-4" /> Download Receipt
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
