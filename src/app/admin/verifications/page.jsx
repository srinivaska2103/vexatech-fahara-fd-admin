'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { 
  Building2, User, MapPin, Phone, Mail, FileText, CreditCard, 
  Calendar, CheckCircle, XCircle, AlertCircle, Clock, Eye, 
  MessageSquare, ChevronRight, BadgeCheck, Loader2, ShieldCheck, Filter 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const TABS = [
  { id: 'cafes', label: 'Cafes Directory' },
  { id: 'event_managers', label: 'Event Managers' },
  { id: 'cafe_owners', label: 'Cafe Owners' }
];

const STATUSES = [
  { id: 'ALL', label: 'All Requests' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'UNDER_REVIEW', label: 'Under Review' },
  { id: 'VERIFIED', label: 'Verified / Active' },
  { id: 'REJECTED', label: 'Rejected' }
];

function VerificationsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') || 'cafes';
  const initialStatus = searchParams?.get('status') || 'ALL';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeStatus, setActiveStatus] = useState(initialStatus);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, [activeTab, activeStatus]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      let data = [];
      if (activeTab === 'cafe_owners') {
        const res = await api.get('/users?role=CAFE_OWNER');
        const users = res.data?.data || [];
        data = users.map(user => ({
          id: user.id,
          type: 'cafe_owners',
          status: user.status || 'PENDING',
          businessName: user.business_name || user.name,
          ownerName: user.name,
          email: user.email,
          phone: user.phone || 'N/A',
          address: user.address || 'N/A',
          submittedDate: user.created_at || new Date().toISOString(),
          bankDetails: {
            bankName: user.bank_name || 'N/A',
            accountLast4: user.account_number ? user.account_number.slice(-4) : 'N/A',
            verified: user.status === 'ACTIVE'
          },
          documents: [{ name: 'Identity & Business Document', type: 'Owner Verification' }],
          history: []
        }));
      } else if (activeTab === 'cafes') {
        const res = await api.get('/cafes');
        const cafes = res.data?.data || [];
        data = cafes.map(cafe => ({
          id: cafe.id,
          type: 'cafes',
          status: cafe.status || 'ACTIVE',
          businessName: cafe.name,
          ownerName: cafe.users?.name || 'Cafe Owner',
          email: cafe.users?.email || 'N/A',
          phone: cafe.users?.phone || 'N/A',
          address: cafe.address || cafe.city || 'N/A',
          submittedDate: cafe.created_at || new Date().toISOString(),
          bankDetails: { bankName: 'Razorpay Vendor Verified', accountLast4: 'XXXX', verified: true },
          documents: [],
          history: []
        }));
      } else if (activeTab === 'event_managers') {
        const res = await api.get('/users?role=EVENT_MANAGER');
        const users = res.data?.data || [];
        data = users.map(user => {
          const profile = user.event_management_profiles;
          return {
            id: profile?.id || user.id,
            userId: user.id,
            type: 'event_managers',
            status: profile?.verification_status || user.status || 'VERIFIED',
            businessName: profile?.company_name || user.name,
            ownerName: user.name,
            email: profile?.business_email || user.email,
            phone: profile?.business_phone || user.phone || 'N/A',
            address: profile?.address_line1 || 'N/A',
            submittedDate: profile?.created_at || user.created_at || new Date().toISOString(),
            bankDetails: {
              bankName: user.bank_name || 'Razorpay Vendor Verified',
              accountLast4: user.account_number ? user.account_number.slice(-4) : 'XXXX',
              verified: true
            },
            documents: [],
            history: []
          };
        });
      }

      // Normalize statuses for clean UI mapping
      const normalizedStatusData = data.map(item => {
        let normStatus = (item.status || 'PENDING').toUpperCase();
        if (normStatus === 'ACTIVE' || normStatus === 'APPROVED') normStatus = 'VERIFIED';
        return { ...item, status: normStatus };
      });

      const filtered = activeStatus === 'ALL' 
        ? normalizedStatusData 
        : normalizedStatusData.filter(item => item.status === activeStatus);

      setItems(filtered);
      setSelectedItem(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch verification requests');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, reason = '') => {
    if (!selectedItem) return;
    if (action === 'REJECT' && !reason) {
      toast.error('Rejection reason is required');
      return;
    }

    setActionLoading(true);
    try {
      let apiEndpoint = '';
      let payload = {};

      if (selectedItem.type === 'cafe_owners') {
        apiEndpoint = `/users/${selectedItem.id}/status`;
        payload = { 
          status: action === 'APPROVE' ? 'ACTIVE' : action === 'REJECT' ? 'REJECTED' : 'PENDING',
          rejection_reason: reason 
        };
      } else if (selectedItem.type === 'cafes') {
        apiEndpoint = `/cafes/${selectedItem.id}`;
        payload = { status: action === 'APPROVE' ? 'ACTIVE' : action === 'REJECT' ? 'REJECTED' : 'PENDING' }; 
      } else if (selectedItem.type === 'event_managers') {
        apiEndpoint = `/event-profiles/${selectedItem.userId}/status`;
        payload = { 
          verification_status: action === 'APPROVE' ? 'VERIFIED' : action === 'REJECT' ? 'REJECTED' : 'PENDING',
          rejection_reason: reason
        };
      }

      if (action !== 'START_REVIEW' && action !== 'REQUEST_INFO') {
        await api.put(apiEndpoint, payload).catch(err => {
          if (apiEndpoint.startsWith('/users')) return api.patch(apiEndpoint, payload);
          throw err;
        });
      }

      toast.success(`Verification ${action.toLowerCase()} successfully`);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedItem(null);
      fetchVerifications();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to process action: ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'UNDER_REVIEW': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'VERIFIED': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'REJECTED': return 'bg-rose-50 text-rose-700 border border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-6 pb-12 overflow-x-hidden"
    >
      {/* Top Header */}
      <div className="border-b border-fahara-border/60 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight flex items-center gap-2.5">
          <BadgeCheck className="h-6 w-6 text-fahara-primary" />
          Business Verification & Approval Center
        </h1>
        <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
          Review business registration requests, verify identity documents, and approve partner accounts.
        </p>

        {/* Category Tabs */}
        <div className="flex gap-6 border-b border-fahara-border mt-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 border-b-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-fahara-primary text-fahara-primary font-extrabold' 
                  : 'border-transparent text-fahara-secondary hover:text-fahara-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {STATUSES.map(status => (
            <button
              key={status.id}
              onClick={() => setActiveStatus(status.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeStatus === status.id
                  ? 'bg-fahara-primary text-white shadow-2xs'
                  : 'bg-fahara-surface border border-fahara-border text-fahara-secondary hover:text-fahara-text hover:bg-fahara-background'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[520px]">
        
        {/* Left Master List */}
        <div className={`flex flex-col bg-fahara-surface rounded-2xl border border-fahara-border overflow-hidden shadow-xs ${selectedItem ? 'lg:w-1/3' : 'w-full'}`}>
          <div className="p-4 border-b border-fahara-border bg-fahara-background/60 flex justify-between items-center text-xs">
            <span className="font-bold text-fahara-text">{items.length} Verification Records</span>
            <button onClick={fetchVerifications} className="text-fahara-secondary hover:text-fahara-primary transition-colors cursor-pointer" title="Refresh Requests">
              <Clock className="w-4 h-4" />
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1 p-3 space-y-2 max-h-[600px]">
            {loading ? (
              <div className="flex justify-center items-center py-16 gap-2 text-xs text-fahara-secondary">
                <Loader2 className="w-5 h-5 animate-spin text-fahara-primary" />
                <span>Fetching verification records...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 text-fahara-secondary flex flex-col items-center gap-2">
                <ShieldCheck className="w-10 h-10 text-fahara-secondary/30" />
                <p className="font-bold text-fahara-text text-sm">No Verification Records Found</p>
                <p className="text-xs text-fahara-secondary">No records match the specified filters.</p>
              </div>
            ) : (
              items.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedItem?.id === item.id 
                      ? 'border-fahara-primary bg-fahara-primary/5 ring-1 ring-fahara-primary/30' 
                      : 'border-fahara-border hover:border-fahara-primary/40 hover:bg-fahara-background/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-fahara-text text-xs truncate pr-2">{item.businessName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-fahara-secondary">
                    <p className="flex items-center gap-1.5"><User className="w-3 h-3 text-fahara-primary" /> {item.ownerName}</p>
                    <p className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(item.submittedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Detail Inspector View */}
        {selectedItem && (
          <div className="flex-1 bg-fahara-surface rounded-2xl border border-fahara-border overflow-hidden flex flex-col min-w-0 shadow-xs">
            <div className="p-6 border-b border-fahara-border flex justify-between items-start bg-fahara-background/60">
              <div>
                <h2 className="text-xl font-extrabold text-fahara-text tracking-tight mb-1">{selectedItem.businessName}</h2>
                <p className="text-xs text-fahara-secondary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-fahara-primary" /> {selectedItem.address}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${getStatusBadge(selectedItem.status)}`}>
                {selectedItem.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Owner Info */}
                <div className="space-y-3 bg-fahara-background p-4 rounded-xl border border-fahara-border">
                  <h3 className="text-xs font-bold text-fahara-text uppercase tracking-wider border-b border-fahara-border pb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-fahara-primary" /> Owner Information
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider">Full Name</p>
                      <p className="font-bold text-fahara-text">{selectedItem.ownerName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider">Email Address</p>
                      <p className="font-medium text-fahara-text flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-fahara-primary" /> {selectedItem.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider">Phone Number</p>
                      <p className="font-medium text-fahara-text flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-fahara-primary" /> {selectedItem.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-3 bg-fahara-background p-4 rounded-xl border border-fahara-border">
                  <h3 className="text-xs font-bold text-fahara-text uppercase tracking-wider border-b border-fahara-border pb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-fahara-primary" /> Payout Bank Details
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider">Bank Name</p>
                      <p className="font-bold text-fahara-text">{selectedItem.bankDetails.bankName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider">Account Number</p>
                      <p className="font-mono font-bold text-fahara-text">XXXX-XXXX-{selectedItem.bankDetails.accountLast4}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider">Verification Status</p>
                      <div className="mt-1">
                        {selectedItem.bankDetails.verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> Verified Bank Account
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 text-[10px] font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertCircle className="w-3 h-3" /> Pending Verification
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Submitted Documents */}
              <div>
                <h3 className="text-xs font-bold text-fahara-text uppercase tracking-wider border-b border-fahara-border pb-2 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-fahara-primary" /> Submitted Business Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedItem.documents.length === 0 ? (
                    <p className="text-xs text-fahara-secondary">No digital documents attached.</p>
                  ) : (
                    selectedItem.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-fahara-border rounded-xl bg-fahara-background/60">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-fahara-primary" />
                          <div>
                            <p className="font-bold text-xs text-fahara-text">{doc.name}</p>
                            <p className="text-[10px] text-fahara-secondary">{doc.type}</p>
                          </div>
                        </div>
                        <button className="text-fahara-primary hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-fahara-border bg-fahara-background/60 flex justify-end gap-3">
              {selectedItem.status === 'PENDING' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction('START_REVIEW')}
                  className="px-5 py-2 bg-fahara-primary text-white rounded-xl text-xs font-bold hover:bg-fahara-primary/90 transition-all cursor-pointer shadow-2xs flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Start Review Process
                </button>
              )}
              
              {(selectedItem.status === 'UNDER_REVIEW' || selectedItem.status === 'PENDING' || selectedItem.status === 'VERIFIED') && (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 border border-rose-200 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <XCircle className="w-4 h-4" /> Reject Request
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleAction('APPROVE')}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve Business
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-fahara-surface rounded-3xl p-6 w-full max-w-md shadow-xl border border-fahara-border">
            <h3 className="text-base font-bold mb-2 text-fahara-text flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" /> Reject Business Verification
            </h3>
            <p className="text-xs text-fahara-secondary mb-4">
              Please specify a clear reason for rejecting <span className="font-bold text-fahara-text">{selectedItem?.businessName}</span>.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border border-fahara-border rounded-xl p-3 text-xs bg-fahara-background text-fahara-text min-h-[100px] mb-4 focus:ring-2 focus:ring-rose-500 outline-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-xs font-bold text-fahara-secondary hover:text-fahara-text transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleAction('REJECT', rejectReason)}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {actionLoading ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function VerificationsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-fahara-secondary">Loading business verifications...</div>}>
      <VerificationsContent />
    </Suspense>
  );
}
