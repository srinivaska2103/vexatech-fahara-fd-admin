'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, MapPin, Star, Building, Clock, CheckCircle, 
  XCircle, ShieldAlert, Sparkles, User, Coffee, Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DashboardErrorState } from '../../dashboard/components/DashboardEmptyStates';
import { toast } from 'react-hot-toast';

export default function CafeDetails() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: cafe, isLoading, isError } = useQuery({
    queryKey: ['adminCafe', id],
    queryFn: async () => {
      const response = await api.get(`/cafes/${id}`);
      return response.data.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, reason, is_featured }) => {
      const payload = { status };
      if (reason) payload.rejection_reason = reason;
      if (is_featured !== undefined) payload.is_featured = is_featured;
      payload.name = cafe.name;
      
      const response = await api.put(`/cafes/${id}`, payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success(`Cafe ${variables.status.toLowerCase()} successfully`);
      setIsRejectModalOpen(false);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['adminCafe', id] });
      queryClient.invalidateQueries({ queryKey: ['adminCafes'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update cafe status');
    }
  });

  if (isLoading) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-fahara-primary" />
          <span className="text-xs text-fahara-secondary">Loading venue details...</span>
        </div>
      </div>
    );
  }

  if (isError || !cafe) {
    return (
      <div className="w-full py-12">
        <DashboardErrorState message="Cafe venue not found." />
      </div>
    );
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    updateStatusMutation.mutate({ status: 'REJECTED', reason: rejectionReason });
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
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Cafe List
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fahara-border/60 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight flex items-center gap-2.5">
              <Coffee className="h-6 w-6 text-fahara-primary" />
              Cafe Venue Profile
            </h1>
            <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
              Administrative approval, pricing, packages, and opening hours.
            </p>
          </div>
        </div>
      </div>

      {/* Admin Action Control Bar */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-fahara-secondary uppercase tracking-wider block mb-1">Administrative Status</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-fahara-text">Current Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              cafe.status === 'ACTIVE' || cafe.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              cafe.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
              'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {cafe.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {(cafe.status === 'PENDING' || cafe.status === 'REJECTED' || cafe.status === 'SUSPENDED') && (
            <button
              onClick={() => updateStatusMutation.mutate({ status: 'APPROVED' })}
              disabled={updateStatusMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <CheckCircle className="w-4 h-4" /> Approve Venue
            </button>
          )}
          
          {(cafe.status === 'PENDING' || cafe.status === 'APPROVED' || cafe.status === 'ACTIVE') && (
            <button
              onClick={() => setIsRejectModalOpen(true)}
              disabled={updateStatusMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          )}

          {(cafe.status === 'APPROVED' || cafe.status === 'ACTIVE') && (
            <button
              onClick={() => updateStatusMutation.mutate({ status: 'SUSPENDED' })}
              disabled={updateStatusMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <ShieldAlert className="w-4 h-4" /> Suspend
            </button>
          )}

          {cafe.status === 'SUSPENDED' && (
            <button
              onClick={() => updateStatusMutation.mutate({ status: 'ACTIVE' })}
              disabled={updateStatusMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <CheckCircle className="w-4 h-4" /> Activate
            </button>
          )}

          <button
            onClick={() => updateStatusMutation.mutate({ status: cafe.status, is_featured: !cafe.is_featured })}
            disabled={updateStatusMutation.isPending}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all disabled:opacity-50 cursor-pointer shadow-2xs ${
              cafe.is_featured 
                ? 'bg-fahara-background text-fahara-secondary border-fahara-border hover:bg-fahara-surface' 
                : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
            }`}
          >
            <Sparkles className="w-4 h-4" /> {cafe.is_featured ? 'Unfeature' : 'Feature Venue'}
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-fahara-surface rounded-3xl shadow-xl border border-fahara-border w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-fahara-border">
              <h3 className="text-base font-bold text-fahara-text">Reject Cafe Venue</h3>
              <p className="text-xs text-fahara-secondary mt-1">Please specify the reason for rejecting this cafe listing.</p>
            </div>
            <div className="p-6">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3.5 border border-fahara-border rounded-xl bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-rose-500"
                rows="4"
                placeholder="Enter rejection explanation..."
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

      {/* Hero Cover Card */}
      <div className="bg-fahara-surface border border-fahara-border rounded-3xl overflow-hidden shadow-xs">
        <div className="h-56 md:h-72 w-full bg-fahara-background relative">
          {cafe.cover_image ? (
            <img src={cafe.cover_image} alt={cafe.name} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-fahara-secondary">
              <Building className="w-16 h-16 opacity-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{cafe.name}</h1>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  cafe.status === 'ACTIVE' || cafe.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  cafe.status === 'PENDING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {cafe.status}
                </span>
                {cafe.is_featured && (
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-xs">
                <MapPin className="w-4 h-4 text-fahara-accent" />
                <span>{cafe.address}, {cafe.city}</span>
              </div>
            </div>

            {/* Ratings Cards */}
            <div className="flex items-center gap-3">
              <div className="text-center bg-black/50 backdrop-blur-md border border-white/20 rounded-2xl p-3 min-w-[95px]">
                <p className="text-[10px] text-gray-300 uppercase font-bold tracking-wider mb-0.5">Google Rating</p>
                <div className="flex items-center justify-center gap-1 text-white">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-extrabold text-base">{Number(cafe.google_rating || 0).toFixed(1)}</span>
                </div>
              </div>
              <div className="text-center bg-black/50 backdrop-blur-md border border-white/20 rounded-2xl p-3 min-w-[95px]">
                <p className="text-[10px] text-gray-300 uppercase font-bold tracking-wider mb-0.5">Fahara Rating</p>
                <div className="flex items-center justify-center gap-1 text-white">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-extrabold text-base">{Number(cafe.average_rating || 0).toFixed(1)}</span>
                  <span className="text-[10px] text-gray-400">({cafe.total_reviews || 0})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Owner Bar */}
        <div className="p-4 bg-fahara-surface border-t border-fahara-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-fahara-secondary font-medium">Owner: </span>
            {cafe.users ? (
              <Link href={`/admin/cafe-owners/${cafe.owner_id}`} className="font-bold text-fahara-text hover:text-fahara-primary transition-colors">
                {cafe.users.name} ({cafe.users.email})
              </Link>
            ) : (
              <span className="font-bold text-fahara-text">Unknown</span>
            )}
          </div>
          <div className="font-semibold text-fahara-text">
            <span className="text-fahara-secondary font-normal">Pricing: </span>
            <span className="font-extrabold text-fahara-primary">₹{cafe.price_per_hour}/hr</span>
          </div>
        </div>
      </div>

      {/* Detail Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-fahara-text mb-3">About the Cafe</h3>
            <p className="text-fahara-secondary text-xs leading-relaxed whitespace-pre-wrap">
              {cafe.description || 'No description provided.'}
            </p>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="bg-fahara-background border border-fahara-border rounded-xl px-4 py-3 flex-1 min-w-[140px]">
                <p className="text-[10px] text-fahara-secondary uppercase font-bold tracking-wider mb-1">Guest Capacity</p>
                <p className="font-extrabold text-fahara-text text-sm">{cafe.minimum_persons || 0} - {cafe.maximum_persons || 0} persons</p>
              </div>
              <div className="bg-fahara-background border border-fahara-border rounded-xl px-4 py-3 flex-1 min-w-[140px]">
                <p className="text-[10px] text-fahara-secondary uppercase font-bold tracking-wider mb-1">Provides Event Services</p>
                <p className="font-extrabold text-fahara-text text-sm">{cafe.provides_event_services ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Packages */}
          <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-fahara-text">Cafe Packages</h3>
              <span className="bg-fahara-background text-fahara-secondary text-xs font-bold px-3 py-1 rounded-full border border-fahara-border">
                {cafe.cafe_packages?.length || 0} Packages
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(!cafe.cafe_packages || cafe.cafe_packages.length === 0) ? (
                <p className="text-fahara-secondary text-xs col-span-full">No custom packages created for this cafe yet.</p>
              ) : (
                cafe.cafe_packages.map(pkg => (
                  <div key={pkg.id} className="border border-fahara-border rounded-2xl p-4 bg-fahara-background/60 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-fahara-text text-xs">{pkg.package_name}</h4>
                        <span className="font-extrabold text-fahara-primary text-xs">₹{pkg.price}</span>
                      </div>
                      <p className="text-[11px] text-fahara-secondary mb-3 line-clamp-2 leading-relaxed">{pkg.description}</p>
                      
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {pkg.food && <span className="px-2 py-0.5 bg-fahara-surface border border-fahara-border rounded-md text-[9px] uppercase font-extrabold text-fahara-text">Food</span>}
                        {pkg.cake && <span className="px-2 py-0.5 bg-fahara-surface border border-fahara-border rounded-md text-[9px] uppercase font-extrabold text-fahara-text">Cake</span>}
                        {pkg.decoration && <span className="px-2 py-0.5 bg-fahara-surface border border-fahara-border rounded-md text-[9px] uppercase font-extrabold text-fahara-text">Decoration</span>}
                        {pkg.music && <span className="px-2 py-0.5 bg-fahara-surface border border-fahara-border rounded-md text-[9px] uppercase font-extrabold text-fahara-text">Music</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Business Hours & Amenities */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Business Hours */}
          <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-fahara-text mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-fahara-primary" /> Business Operating Hours
            </h3>
            <div className="space-y-2.5">
              {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => {
                const dayHours = cafe.cafe_business_hours?.find(h => h.day_of_week === day);
                return (
                  <div key={day} className="flex items-center justify-between text-xs border-b border-fahara-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="font-semibold text-fahara-secondary capitalize">{day.toLowerCase()}</span>
                    {dayHours ? (
                      dayHours.is_closed ? (
                        <span className="text-rose-600 font-bold text-[10px] uppercase tracking-wider">Closed</span>
                      ) : (
                        <span className="text-fahara-text font-bold">
                          {dayHours.open_time ? new Date(dayHours.open_time).toLocaleTimeString([], {timeZone: 'UTC', hour: '2-digit', minute:'2-digit'}) : '09:00'} - 
                          {' '}{dayHours.close_time ? new Date(dayHours.close_time).toLocaleTimeString([], {timeZone: 'UTC', hour: '2-digit', minute:'2-digit'}) : '21:00'}
                        </span>
                      )
                    ) : (
                      <span className="text-fahara-secondary/70 italic text-[10px]">09:00 - 21:00</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-fahara-text mb-4">Venue Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {(!cafe.amenities || cafe.amenities.length === 0) ? (
                <p className="text-fahara-secondary text-xs">No amenities listed.</p>
              ) : (
                cafe.amenities.map((amenity, idx) => (
                  <span key={idx} className="bg-fahara-background border border-fahara-border px-3 py-1.5 rounded-xl text-xs font-semibold text-fahara-text">
                    {typeof amenity === 'string' ? amenity : amenity.name || 'Amenity'}
                  </span>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
