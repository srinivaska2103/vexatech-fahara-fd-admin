'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import {
  ArrowLeft,
  ShieldCheck,
  Building,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Ban,
  Activity,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subscriptionId = params?.id;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/subscriptions/${subscriptionId}`);
      const data = res.data;
      if (data.success) {
        setDetail(data.data);
      } else {
        toast.error(data.message || 'Failed to load subscription details');
      }
    } catch (err) {
      console.error('Fetch detail error:', err);
      toast.error(err.response?.data?.message || 'Network error loading subscription details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subscriptionId) {
      fetchDetail();
    }
  }, [subscriptionId]);

  const handleCancelSubscription = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation.');
      return;
    }

    try {
      setCancelling(true);
      const res = await api.patch(`/admin/subscriptions/${subscriptionId}/cancel`, {
        reason: cancelReason
      });

      const data = res.data;
      if (data.success) {
        toast.success('Subscription cancelled successfully.');
        setShowCancelModal(false);
        setCancelReason('');
        fetchDetail();
      } else {
        toast.error(data.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      toast.error(err.response?.data?.message || 'Failed to execute cancellation');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4" /> ACTIVE
          </span>
        );
      case 'PAST_DUE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-4 h-4" /> PAST DUE
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <Clock className="w-4 h-4" /> EXPIRED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-800 border border-gray-400">
            <XCircle className="w-4 h-4" /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#A67B5B]">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#6F4E37]" />
        Loading subscription record details...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-12 text-center">
        <h3 className="text-xl font-bold text-[#2C1810]">Subscription Not Found</h3>
        <p className="text-sm text-[#A67B5B] mt-1 mb-4">The requested subscription ID does not exist.</p>
        <Link
          href="/admin/subscriptions"
          className="px-4 py-2 bg-[#6F4E37] text-white rounded-xl text-sm font-semibold hover:bg-[#5a3e2b]"
        >
          Back to Overview
        </Link>
      </div>
    );
  }

  const { partnerInfo, subscription, razorpay, payment, timeline } = detail;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8DED5] shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-[#FFF8F0] border border-[#E8DED5] text-[#6F4E37] hover:bg-[#FCEFE3] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#2C1810]">{partnerInfo.businessName}</h1>
              {getStatusBadge(subscription.status)}
            </div>
            <p className="text-sm text-[#A67B5B]">
              Partner Type: <span className="font-semibold text-[#6F4E37]">{partnerInfo.partnerType}</span> • ID:{' '}
              <code className="text-xs font-mono">{subscription.id}</code>
            </p>
          </div>
        </div>

        {subscription.status === 'ACTIVE' && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors"
          >
            <Ban className="w-4 h-4" /> Cancel Subscription
          </button>
        )}
      </div>

      {/* Grid: Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Partner Info Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DED5] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A67B5B] border-b border-[#E8DED5] pb-2">
            <Building className="w-4 h-4 text-[#6F4E37]" /> Partner Info
          </div>
          <div>
            <div className="text-xs text-[#A67B5B]">Business Name</div>
            <div className="font-bold text-[#2C1810]">{partnerInfo.businessName}</div>
          </div>
          <div>
            <div className="text-xs text-[#A67B5B]">Owner / User</div>
            <div className="text-sm font-semibold text-[#2C1810] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#A67B5B]" /> {partnerInfo.ownerName}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#A67B5B]">Contact Email</div>
            <div className="text-xs font-medium text-[#2C1810] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#A67B5B]" /> {partnerInfo.email}
            </div>
          </div>
          {partnerInfo.phone && (
            <div>
              <div className="text-xs text-[#A67B5B]">Phone</div>
              <div className="text-xs font-medium text-[#2C1810] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#A67B5B]" /> {partnerInfo.phone}
              </div>
            </div>
          )}
        </div>

        {/* Subscription Plan Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DED5] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A67B5B] border-b border-[#E8DED5] pb-2">
            <ShieldCheck className="w-4 h-4 text-[#6F4E37]" /> Subscription Plan
          </div>
          <div>
            <div className="text-xs text-[#A67B5B]">Active Plan</div>
            <div className="font-bold text-[#2C1810]">{subscription.planName}</div>
          </div>
          <div>
            <div className="text-xs text-[#A67B5B]">Pricing & Cycle</div>
            <div className="text-sm font-bold text-[#6F4E37]">
              ₹{subscription.price} / {subscription.billingCycle.toLowerCase()}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#A67B5B]">Subscription Start Date</div>
            <div className="text-xs font-semibold text-[#2C1810]">
              {new Date(subscription.startDate).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#A67B5B]">Current Period End / Next Billing</div>
            <div className="text-xs font-semibold text-[#2C1810]">
              {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>

        {/* Razorpay Information Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DED5] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A67B5B] border-b border-[#E8DED5] pb-2">
            <CreditCard className="w-4 h-4 text-[#6F4E37]" /> Razorpay Details
          </div>
          <div>
            <div className="text-xs text-[#A67B5B]">Razorpay Subscription ID</div>
            <code className="px-2 py-1 bg-[#FFF8F0] border border-[#E8DED5] rounded text-xs font-mono text-[#6F4E37] block w-fit mt-1">
              {razorpay.razorpaySubscriptionId}
            </code>
          </div>
          <div>
            <div className="text-xs text-[#A67B5B]">Razorpay Customer ID</div>
            <code className="px-2 py-1 bg-[#FFF8F0] border border-[#E8DED5] rounded text-xs font-mono text-[#6F4E37] block w-fit mt-1">
              {razorpay.razorpayCustomerId}
            </code>
          </div>
          <div>
            <div className="text-xs text-[#A67B5B]">Razorpay Plan ID</div>
            <code className="px-2 py-1 bg-[#FFF8F0] border border-[#E8DED5] rounded text-xs font-mono text-[#6F4E37] block w-fit mt-1">
              {razorpay.razorpayPlanId}
            </code>
          </div>
        </div>

        {/* Payment Metrics Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DED5] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A67B5B] border-b border-[#E8DED5] pb-2">
            <DollarSign className="w-4 h-4 text-[#6F4E37]" /> Payment Summary
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-[#A67B5B]">Total Payments</div>
              <div className="text-lg font-bold text-[#2C1810]">{payment.totalPayments}</div>
            </div>
            <div>
              <div className="text-xs text-[#A67B5B]">Successful</div>
              <div className="text-lg font-bold text-emerald-600">{payment.successfulPayments}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-[#A67B5B]">Last Payment Amount</div>
            <div className="text-sm font-bold text-[#6F4E37]">₹{payment.lastPaymentAmount}</div>
          </div>
          <div>
            <div className="text-xs text-[#A67B5B]">Last Payment Date</div>
            <div className="text-xs font-semibold text-[#2C1810]">
              {payment.lastPaymentDate ? new Date(payment.lastPaymentDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8DED5] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[#2C1810]">
          <Activity className="w-5 h-5 text-[#6F4E37]" /> Subscription Timeline
        </div>

        {timeline.length === 0 ? (
          <div className="text-sm text-[#A67B5B]">No timeline events recorded yet.</div>
        ) : (
          <div className="relative border-l-2 border-[#E8DED5] ml-4 pl-6 space-y-6">
            {timeline.map((event, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#6F4E37] border-4 border-white shadow-xs" />
                <div className="text-xs font-bold text-[#6F4E37]">
                  {new Date(event.date).toLocaleString()}
                </div>
                <div className="text-sm font-bold text-[#2C1810] mt-0.5">{event.title}</div>
                <div className="text-xs text-[#A67B5B] mt-0.5">{event.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8DED5] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600 border-b border-[#E8DED5] pb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-[#2C1810]">Cancel Partner Subscription?</h3>
            </div>

            <p className="text-sm text-[#A67B5B]">
              This will update the status of <span className="font-bold text-[#2C1810]">{partnerInfo.businessName}</span>'s subscription to <span className="font-bold text-rose-600">CANCELLED</span> and prevent auto-renewals.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#6F4E37] uppercase mb-1">
                Reason for Cancellation <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter formal reason for audit logging..."
                className="w-full p-3 bg-[#FFF8F0] border border-[#E8DED5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-[#E8DED5] rounded-xl text-sm font-semibold text-[#6F4E37] hover:bg-[#FFF8F0]"
              >
                Back
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelSubscription}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2"
              >
                {cancelling && <RefreshCw className="w-4 h-4 animate-spin" />}
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
