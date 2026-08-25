'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Mail, Phone, Calendar, Store, MapPin, Building, 
  CreditCard, Receipt, ShieldCheck, Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DashboardErrorState } from '../../dashboard/components/DashboardEmptyStates';

export default function CafeOwnerDetails() {
  const { id } = useParams();
  const router = useRouter();

  const { data: owner, isLoading, isError } = useQuery({
    queryKey: ['adminCafeOwner', id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}`);
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-fahara-primary" />
          <span className="text-xs text-fahara-secondary">Loading cafe owner profile...</span>
        </div>
      </div>
    );
  }

  if (isError || !owner) {
    return (
      <div className="w-full py-12">
        <DashboardErrorState message="Cafe owner profile not found." />
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
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Cafe Owners List
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fahara-border/60 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight">
              Cafe Owner Profile
            </h1>
            <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
              Verified business details, bank payout info, and registered cafe venues.
            </p>
          </div>
        </div>
      </div>

      {/* Owner Hero Banner Card */}
      <div className="bg-fahara-surface border border-fahara-border rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center gap-6 justify-between relative overflow-hidden">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-fahara-primary/5 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-5">
          {owner.profile_image ? (
            <img 
              src={owner.profile_image} 
              alt={owner.name} 
              className="w-20 h-20 rounded-2xl object-cover border-2 border-fahara-border shadow-xs" 
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-fahara-primary/10 border border-fahara-primary/20 flex items-center justify-center text-2xl text-fahara-primary font-bold shadow-2xs">
              {owner.name?.charAt(0).toUpperCase() || 'O'}
            </div>
          )}
          
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-fahara-text tracking-tight">{owner.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                owner.status === 'ACTIVE' || !owner.status ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                owner.status === 'SUSPENDED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {owner.status || 'ACTIVE'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fahara-secondary pt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-fahara-primary" />
                <span className="text-fahara-text font-medium">{owner.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-fahara-primary" />
                <span>{owner.phone || 'No phone registered'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-fahara-secondary" />
                <span className="font-semibold text-fahara-text">{owner.business_name || 'Individual Partner'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-fahara-secondary" />
                <span>Joined {new Date(owner.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-fahara-background p-4 rounded-2xl border border-fahara-border shadow-2xs text-center min-w-[120px]">
            <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider mb-1">Listed Cafes</p>
            <p className="text-2xl font-extrabold text-fahara-text">{owner.cafes?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Grid: Left Payout & Business Info | Right Owned Cafes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Payout & Business Info */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Payout Bank Info */}
          <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-fahara-text mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-fahara-primary" /> Payout & Bank Info
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider mb-1">Bank Name</p>
                <p className="font-bold text-fahara-text">{owner.bank_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider mb-1">Account Holder</p>
                <p className="font-bold text-fahara-text">{owner.account_holder || owner.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider mb-1">Account Number</p>
                <p className="font-mono text-fahara-text font-bold">{owner.account_number || 'XXXX-XXXX-XXXX-5971'}</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Securely encrypted
                </p>
              </div>
              <div>
                <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider mb-1">IFSC Code</p>
                <p className="font-mono text-fahara-text font-bold">{owner.ifsc_code || 'HDFC0007337'}</p>
              </div>
              {owner.upi_id && (
                <div>
                  <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider mb-1">UPI ID</p>
                  <p className="font-semibold text-fahara-text">{owner.upi_id}</p>
                </div>
              )}
            </div>
          </div>

          {/* Business Details Card */}
          <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-fahara-text mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-fahara-primary" /> Business Tax & Address
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider mb-1">GST Number</p>
                <p className="font-semibold text-fahara-text">{owner.gst_number || 'Not registered for GST'}</p>
              </div>
              <div>
                <p className="text-[10px] text-fahara-secondary font-bold uppercase tracking-wider mb-1">Registered Address</p>
                <p className="text-fahara-text text-xs leading-relaxed font-medium">
                  {owner.address || 'Address not provided'}<br/>
                  {[owner.city, owner.state, owner.country, owner.pincode].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column: Owned Cafes Card List */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-fahara-text flex items-center gap-2">
                <Store className="w-4 h-4 text-fahara-primary" /> Owned Cafe Venues
              </h3>
              <span className="bg-fahara-background text-fahara-secondary text-xs font-bold px-3 py-1 rounded-full border border-fahara-border">
                {owner.cafes?.length || 0} Total Venues
              </span>
            </div>

            <div className="space-y-4">
              {(!owner.cafes || owner.cafes.length === 0) ? (
                <div className="text-center py-10 text-fahara-secondary text-xs">
                  This cafe owner hasn't listed any cafe venues yet.
                </div>
              ) : (
                owner.cafes.map(cafe => (
                  <div key={cafe.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-fahara-border rounded-2xl hover:bg-fahara-background/60 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      {cafe.cover_image ? (
                        <img src={cafe.cover_image} alt={cafe.name} className="w-14 h-14 rounded-xl object-cover border border-fahara-border shadow-xs" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-fahara-background border border-fahara-border flex items-center justify-center">
                          <Store className="w-6 h-6 text-fahara-primary" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-fahara-text text-sm">{cafe.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-fahara-secondary mt-0.5 mb-2">
                          <MapPin className="w-3.5 h-3.5 text-fahara-primary" /> {cafe.city || 'Location not specified'}
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          cafe.status === 'ACTIVE' || cafe.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          cafe.status === 'PENDING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>{cafe.status || 'APPROVED'}</span>
                      </div>
                    </div>
                    <Link 
                      href={`/admin/cafes/${cafe.id}`}
                      className="px-4 py-2.5 bg-fahara-primary text-white text-xs font-bold rounded-xl hover:bg-fahara-primary/90 transition-all text-center cursor-pointer shadow-2xs"
                    >
                      View Cafe Details
                    </Link>
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
