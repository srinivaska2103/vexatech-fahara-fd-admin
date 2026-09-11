'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Mail, Phone, Calendar, Briefcase, MapPin, Building, 
  CreditCard, Receipt, Clock, CheckCircle, XCircle, ShieldAlert, 
  Sparkles, Star, Globe, ExternalLink, ShieldCheck, Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DashboardErrorState } from '../../dashboard/components/DashboardEmptyStates';
import { toast } from 'react-hot-toast';

export default function EventManagerDetails() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: manager, isLoading, isError } = useQuery({
    queryKey: ['adminEventManager', id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}`);
      return response.data.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.put(`/event-profiles/${id}/status`, payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success(`Event manager status updated successfully`);
      setIsRejectModalOpen(false);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['adminEventManager', id] });
      queryClient.invalidateQueries({ queryKey: ['adminEventManagers'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  if (isLoading) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-fahara-primary" />
          <span className="text-xs text-fahara-secondary">Loading manager profile...</span>
        </div>
      </div>
    );
  }

  if (isError || !manager) {
    return (
      <div className="w-full py-12">
        <DashboardErrorState message="Event manager profile not found." />
      </div>
    );
  }

  const profile = manager.event_management_profiles || {};
  const services = manager.event_services || [];
  const hours = manager.event_business_hours || [];

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    updateStatusMutation.mutate({ verification_status: 'REJECTED', rejection_reason: rejectionReason });
  };

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
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Event Managers List
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fahara-border/60 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight flex items-center gap-2.5">
              <Sparkles className="h-6 w-6 text-fahara-primary" />
              Event Manager Profile
            </h1>
            <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
              Business profile verification, contact info, and listed event services.
            </p>
          </div>
        </div>
      </div>

      {/* Admin Action Control Bar */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-fahara-secondary uppercase tracking-wider block mb-1">Administrative Verification</span>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <p className="text-fahara-secondary font-medium">
              Profile Verification:{' '}
              <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                profile.verification_status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                profile.verification_status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {profile.verification_status || 'PENDING'}
              </span>
            </p>
            <p className="text-fahara-secondary font-medium">
              Account Status:{' '}
              <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                manager.status === 'ACTIVE' || !manager.status ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {manager.status || 'ACTIVE'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {(profile.verification_status === 'PENDING' || profile.verification_status === 'REJECTED') && (
            <button
              onClick={() => updateStatusMutation.mutate({ verification_status: 'VERIFIED' })}
              disabled={updateStatusMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <CheckCircle className="w-4 h-4" /> Approve Profile
            </button>
          )}
          
          {(profile.verification_status === 'PENDING' || profile.verification_status === 'VERIFIED') && (
            <button
              onClick={() => setIsRejectModalOpen(true)}
              disabled={updateStatusMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <XCircle className="w-4 h-4" /> Reject Profile
            </button>
          )}

          {manager.status === 'ACTIVE' && (
            <button
              onClick={() => updateStatusMutation.mutate({ status: 'SUSPENDED' })}
              disabled={updateStatusMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <ShieldAlert className="w-4 h-4" /> Suspend Account
            </button>
          )}

          {manager.status === 'SUSPENDED' && (
            <button
              onClick={() => updateStatusMutation.mutate({ status: 'ACTIVE' })}
              disabled={updateStatusMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <CheckCircle className="w-4 h-4" /> Activate Account
            </button>
          )}

          <button
            onClick={() => updateStatusMutation.mutate({ is_featured: !profile.is_featured })}
            disabled={updateStatusMutation.isPending}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all disabled:opacity-50 cursor-pointer shadow-2xs ${
              profile.is_featured 
                ? 'bg-fahara-background text-fahara-secondary border-fahara-border hover:bg-fahara-surface' 
                : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
            }`}
          >
            <Sparkles className="w-4 h-4" /> {profile.is_featured ? 'Unfeature' : 'Feature Manager'}
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-fahara-surface rounded-3xl shadow-xl border border-fahara-border w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-fahara-border">
              <h3 className="text-base font-bold text-fahara-text">Reject Event Manager Profile</h3>
              <p className="text-xs text-fahara-secondary mt-1">Please provide a reason for rejecting this profile. The manager will be notified.</p>
            </div>
            <div className="p-6">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3.5 border border-fahara-border rounded-xl bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-rose-500"
                rows="4"
                placeholder="Enter rejection reason..."
              />
            </div>
            <div className="p-4 border-t border-fahara-border bg-fahara-background/60 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-xs font-bold text-fahara-secondary hover:text-fahara-text transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={updateStatusMutation.isPending}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {updateStatusMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Company Cover Banner Card */}
      <div className="bg-fahara-surface border border-fahara-border rounded-3xl overflow-hidden shadow-xs">
        <div className="h-44 md:h-60 w-full bg-fahara-background relative">
          {profile.company_banner ? (
            <img src={profile.company_banner} alt="Banner" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-fahara-primary/20 via-fahara-secondary/15 to-fahara-accent/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-fahara-surface via-fahara-surface/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-fahara-surface border-4 border-fahara-surface overflow-hidden shadow-md flex-shrink-0">
              {profile.company_logo ? (
                <img src={profile.company_logo} alt={profile.company_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-fahara-primary bg-fahara-primary/10">
                  {profile.company_name?.charAt(0).toUpperCase() || manager.name?.charAt(0).toUpperCase() || 'E'}
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-3xl font-extrabold text-fahara-text tracking-tight">{profile.company_name || 'Individual Organizer'}</h2>
                {profile.is_featured && (
                  <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-fahara-secondary text-xs pt-1">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-fahara-primary" /> {profile.city || manager.city || 'Location not specified'}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-fahara-primary" /> {profile.experience_years || 0} Years Experience</span>
                <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {Number(profile.average_rating || 0).toFixed(1)} ({profile.total_reviews || 0} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Contact & Payout */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Contact Details Card */}
          <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-fahara-text mb-4">Contact Details</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-fahara-primary mt-0.5" />
                <div>
                  <p className="text-fahara-text font-bold">{profile.business_email || manager.email}</p>
                  <p className="text-[10px] text-fahara-secondary">Business Email</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-fahara-primary mt-0.5" />
                <div>
                  <p className="text-fahara-text font-bold">{profile.business_phone || manager.phone || 'No phone'}</p>
                  <p className="text-[10px] text-fahara-secondary">Primary Contact Phone</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-fahara-primary mt-0.5" />
                <div>
                  <p className="text-fahara-text font-semibold leading-relaxed">
                    {profile.address_line1 || manager.address || 'Address not provided'}<br/>
                    {[profile.address_line2, profile.city, profile.state, profile.postal_code].filter(Boolean).join(', ')}
                  </p>
                  <p className="text-[10px] text-fahara-secondary mt-1">Service Radius: {profile.service_radius_km || 25} km</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {(profile.website_url || profile.instagram_url || profile.facebook_url || profile.linkedin_url) && (
              <div className="mt-5 pt-4 border-t border-fahara-border flex gap-3">
                {profile.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer" className="text-fahara-secondary hover:text-fahara-primary transition-colors"><Globe className="w-4 h-4" /></a>}
                {profile.instagram_url && <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="text-fahara-secondary hover:text-fahara-primary transition-colors"><ExternalLink className="w-4 h-4" /></a>}
              </div>
            )}
          </div>

          {/* Payout Info Card */}
          <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-fahara-text mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-fahara-primary" /> Payout & Bank Info
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider mb-1">Bank Name</p>
                <p className="font-bold text-fahara-text">{manager.bank_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider mb-1">Account Holder</p>
                <p className="font-bold text-fahara-text">{manager.account_holder || manager.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider mb-1">Account Number</p>
                <p className="font-mono text-fahara-text font-bold">{manager.account_number || 'Not provided'}</p>
                {manager.account_number && <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-600" /> Securely encrypted</p>}
              </div>
              <div>
                <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider mb-1">IFSC Code</p>
                <p className="font-mono text-fahara-text font-bold">{manager.ifsc_code || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider mb-1">GST / Business Reg Number</p>
                <p className="font-semibold text-fahara-text">{profile.business_registration_number || manager.gst_number || 'Not registered for GST'}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: About & Listed Event Services */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-fahara-text mb-3">About the Company</h3>
            <p className="text-fahara-secondary text-xs leading-relaxed whitespace-pre-wrap">
              {profile.description || manager.description || 'No description provided.'}
            </p>
          </div>

          <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-fahara-text">Listed Event Services</h3>
              <span className="bg-fahara-background text-fahara-secondary text-xs font-bold px-3 py-1 rounded-full border border-fahara-border">
                {services.length} Services
              </span>
            </div>

            <div className="space-y-4">
              {services.length === 0 ? (
                <div className="text-center py-10 text-fahara-secondary text-xs">
                  No event services listed yet for this manager.
                </div>
              ) : (
                services.map(service => (
                  <div key={service.id} className="border border-fahara-border rounded-2xl p-5 bg-fahara-background/60 hover:bg-fahara-background transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-fahara-text text-sm">{service.service_name}</h4>
                        <span className="text-[10px] text-fahara-primary font-bold bg-fahara-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">{service.category || 'General'}</span>
                      </div>
                      <span className="font-extrabold text-fahara-primary text-sm">₹{Number(service.price || 0).toLocaleString('en-IN')}</span>
                    </div>
                    
                    <p className="text-xs text-fahara-secondary mb-3 mt-2 leading-relaxed">{service.description}</p>
                    
                    {service.inclusions && typeof service.inclusions === 'object' && Object.keys(service.inclusions).length > 0 && (
                      <div className="bg-fahara-surface rounded-xl p-3 border border-fahara-border">
                        <p className="text-[10px] text-fahara-secondary uppercase tracking-wider mb-2 font-bold">Package Inclusions</p>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(service.inclusions) ? (
                            service.inclusions.map((item, index) => {
                              const name = typeof item === 'string' ? item : (item?.name || item?.item_name || item?.title || item?.category || 'Inclusion');
                              return (
                                <span key={index} className="px-2.5 py-0.5 bg-fahara-background border border-fahara-border rounded-md text-[10px] font-semibold text-fahara-text capitalize">
                                  {name}
                                </span>
                              );
                            })
                          ) : (
                            Object.entries(service.inclusions).map(([key, value]) => {
                              if (value === true) return <span key={key} className="px-2.5 py-0.5 bg-fahara-background border border-fahara-border rounded-md text-[10px] font-semibold text-fahara-text capitalize">{key.replace(/_/g, ' ')}</span>;
                              if (typeof value === 'string' || typeof value === 'number') return <span key={key} className="px-2.5 py-0.5 bg-fahara-background border border-fahara-border rounded-md text-[10px] font-semibold text-fahara-text capitalize">{key.replace(/_/g, ' ')}: {value}</span>;
                              return null;
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
}
