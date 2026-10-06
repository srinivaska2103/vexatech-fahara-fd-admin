'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
  Search, Filter, ChevronRight, MapPin, Star, Building2, CheckCircle2, 
  Clock, Sparkles, Loader2, XCircle, ShieldCheck, Phone, Mail, User, Eye, 
  Check, AlertTriangle, Calendar, Layers, UtensilsCrossed, X
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function RestaurantList() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionRestaurantId, setActionRestaurantId] = useState(null);

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['adminRestaurants'],
    queryFn: async () => {
      const response = await api.get('/cafes?admin=true');
      const allCafes = response.data?.data || response.data || [];
      // If venues with RESTAURANT_OWNER role or Restaurant category exist, prioritize them, else show all venue cards
      const restOnly = allCafes.filter(c => {
        const cat = (c.category || '').toLowerCase();
        const role = (c.users?.roles?.name || c.users?.user_type || '').toUpperCase();
        return role === 'RESTAURANT_OWNER' || cat.includes('restaurant') || cat.includes('bistro') || cat.includes('dining');
      });
      return restOnly.length > 0 ? restOnly : allCafes;
    }
  });

  // Approve restaurant mutation
  const approveMutation = useMutation({
    mutationFn: async (id) => {
      return await api.put(`/cafes/${id}`, { status: 'APPROVED', bank_verification_status: 'VERIFIED' });
    },
    onSuccess: () => {
      toast.success('Restaurant verified & approved successfully!');
      queryClient.invalidateQueries(['adminRestaurants']);
      setSelectedRestaurant(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to approve restaurant');
    }
  });

  // Reject / Disable restaurant mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      return await api.put(`/cafes/${id}`, { status: 'REJECTED', rejection_reason: reason });
    },
    onSuccess: () => {
      toast.success('Restaurant application updated to Rejected.');
      queryClient.invalidateQueries(['adminRestaurants']);
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRestaurant(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update restaurant status');
    }
  });

  const filteredRestaurants = restaurants?.filter(r => {
    const matchesSearch = 
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.users?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && (r.status || 'PENDING').toUpperCase() === statusFilter.toUpperCase();
  });

  const totalActive = restaurants?.filter(r => r.status === 'ACTIVE' || r.status === 'APPROVED').length || 0;
  const totalPending = restaurants?.filter(r => r.status === 'PENDING' || !r.status).length || 0;
  const totalRejected = restaurants?.filter(r => r.status === 'REJECTED').length || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 pb-12 overflow-x-hidden"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DED5] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810] tracking-tight flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-orange-600" />
            Restaurant Partner Directory
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Manage partner restaurants, review verification submissions, and oversee active restaurant profiles.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-600 bg-[#FFF8F0] border border-[#E8DED5] px-3.5 py-1.5 rounded-xl font-bold">
          <span>Total Partner Restaurants:</span>
          <span className="font-black text-[#2C1810]">{restaurants?.length || 0}</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E8DED5] rounded-2xl p-5 shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-wider text-stone-500">Total Restaurants</span>
            <div className="h-9 w-9 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2C1810] mt-2">{restaurants?.length || 0}</div>
          <span className="text-[11px] text-stone-500 mt-1 block">Registered Partners</span>
        </div>

        <div className="bg-white border border-[#E8DED5] rounded-2xl p-5 shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-wider text-stone-500">Verified & Active</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2C1810] mt-2">{totalActive}</div>
          <span className="text-[11px] text-emerald-600 font-extrabold mt-1 block">Customer Visible Partners</span>
        </div>

        <div className="bg-white border border-[#E8DED5] rounded-2xl p-5 shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-wider text-stone-500">Pending Verification</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2C1810] mt-2">{totalPending}</div>
          <span className="text-[11px] text-amber-600 font-extrabold mt-1 block">Awaiting Admin Approval</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E8DED5] rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            suppressHydrationWarning
            className="block w-full pl-10 pr-4 py-2.5 border border-[#E8DED5] rounded-xl bg-[#FFF8F0]/30 text-xs text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#6F4E37]/30 focus:border-[#6F4E37] font-semibold transition-all placeholder:text-stone-400"
            placeholder="Search by restaurant name, city, owner name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-stone-500" />
          <select 
            suppressHydrationWarning
            className="w-full md:w-auto bg-[#FFF8F0]/40 border border-[#E8DED5] rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#6F4E37]/30 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Restaurants Data Table */}
      <div className="bg-white border border-[#E8DED5] rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FFF8F0]/80 border-b border-[#E8DED5] text-stone-500 font-black uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DED5]">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-stone-500">
                    <div className="flex justify-center items-center gap-2 font-bold">
                      <Loader2 className="h-5 w-5 animate-spin text-[#6F4E37]" />
                      <span>Loading partner restaurants...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRestaurants?.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Building2 className="h-8 w-8 text-stone-300" />
                      <p className="font-extrabold text-[#2C1810]">No restaurants found matching filters.</p>
                      <p className="text-xs text-stone-400">Try adjusting your search criteria or status filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRestaurants?.map((restaurant) => {
                  const status = (restaurant.status || 'PENDING').toUpperCase();
                  const isVerified = status === 'APPROVED' || status === 'ACTIVE';

                  return (
                    <tr key={restaurant.id} className="hover:bg-[#FFF8F0]/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-orange-100/70 border border-orange-200 overflow-hidden flex items-center justify-center shrink-0">
                            {restaurant.cover_image ? (
                              <img src={restaurant.cover_image} alt={restaurant.name} className="h-full w-full object-cover" />
                            ) : (
                              <Building2 className="h-5 w-5 text-orange-700" />
                            )}
                          </div>
                          <div>
                            <span className="font-black text-[#2C1810] text-sm block group-hover:text-[#6F4E37] transition-colors">
                              {restaurant.name}
                            </span>
                            <span className="text-[10px] text-stone-400 font-semibold">
                              ID: {restaurant.id.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#2C1810]">
                            {restaurant.users?.name || restaurant.owner?.name || 'Partner Owner'}
                          </span>
                          <span className="text-[11px] text-stone-500">
                            {restaurant.users?.email || restaurant.owner?.email || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-stone-600">
                        {restaurant.users?.phone || restaurant.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 font-semibold text-stone-700">
                          <MapPin size={13} className="text-[#6F4E37] shrink-0" />
                          <span>{restaurant.city || restaurant.address || 'India'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-orange-50 text-orange-800 border border-orange-200/80">
                          {restaurant.category || 'Restaurant'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isVerified 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                            : status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}>
                          {isVerified ? <CheckCircle2 size={11} /> : status === 'REJECTED' ? <XCircle size={11} /> : <Clock size={11} />}
                          <span>{status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center font-black text-[#2C1810] gap-1">
                          <Star size={13} className="fill-amber-400 text-amber-400 stroke-[1.5]" />
                          <span>{restaurant.average_rating || restaurant.google_rating || '4.5'}</span>
                          <span className="text-stone-400 text-[10px] font-semibold">({restaurant.total_reviews || 0})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedRestaurant(restaurant)}
                            className="px-3 py-1.5 rounded-xl bg-[#FFF8F0] hover:bg-[#6F4E37] text-[#6F4E37] hover:text-white border border-[#DDB892] text-xs font-black transition-all cursor-pointer shadow-2xs"
                          >
                            View Details
                          </button>
                          {status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => approveMutation.mutate(restaurant.id)}
                                disabled={approveMutation.isPending}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all cursor-pointer shadow-2xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setActionRestaurantId(restaurant.id);
                                  setShowRejectModal(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all cursor-pointer shadow-2xs"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESTAURANT DETAILS DRAWER / MODAL */}
      <AnimatePresence>
        {selectedRestaurant && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#E8DED5] bg-[#FFF8F0] flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-orange-100 border border-orange-200 overflow-hidden flex items-center justify-center shrink-0">
                    {selectedRestaurant.cover_image ? (
                      <img src={selectedRestaurant.cover_image} alt={selectedRestaurant.name} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-6 w-6 text-orange-700" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[#2C1810] leading-tight">{selectedRestaurant.name}</h2>
                    <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">{selectedRestaurant.category || 'Restaurant Partner'}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRestaurant(null)}
                  className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-500 hover:text-[#2C1810] border border-stone-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-6 space-y-6 flex-1">
                {/* Status Badge & Actions */}
                <div className="p-4 rounded-2xl bg-[#FFF8F0]/60 border border-[#E8DED5] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-stone-500">Verification Status:</span>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-900 border border-orange-300">
                      {selectedRestaurant.status || 'PENDING'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveMutation.mutate(selectedRestaurant.id)}
                      disabled={approveMutation.isPending}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
                    >
                      Approve & Verify
                    </button>
                    <button
                      onClick={() => {
                        setActionRestaurantId(selectedRestaurant.id);
                        setShowRejectModal(true);
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-[#6F4E37] uppercase tracking-wider border-b border-stone-100 pb-1.5 flex items-center gap-2">
                    <User size={15} /> Owner Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-stone-400 font-bold block">Owner Name</span>
                      <span className="font-extrabold text-[#2C1810]">{selectedRestaurant.users?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 font-bold block">Email</span>
                      <span className="font-extrabold text-[#2C1810]">{selectedRestaurant.users?.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 font-bold block">Phone Number</span>
                      <span className="font-extrabold text-[#2C1810]">{selectedRestaurant.users?.phone || selectedRestaurant.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 font-bold block">Registered Role</span>
                      <span className="font-extrabold text-orange-700 uppercase">{selectedRestaurant.users?.roles?.name || 'RESTAURANT_OWNER'}</span>
                    </div>
                  </div>
                </div>

                {/* Location & Address */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-[#6F4E37] uppercase tracking-wider border-b border-stone-100 pb-1.5 flex items-center gap-2">
                    <MapPin size={15} /> Location Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-stone-400 font-bold block">City / Area</span>
                      <span className="font-extrabold text-[#2C1810]">{selectedRestaurant.city || 'Madurai'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 font-bold block">State / Country</span>
                      <span className="font-extrabold text-[#2C1810]">{selectedRestaurant.state || 'Tamil Nadu'}, {selectedRestaurant.country || 'India'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-stone-400 font-bold block">Full Address</span>
                      <span className="font-extrabold text-[#2C1810]">{selectedRestaurant.address || 'Address not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Business Information & Capabilities */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-[#6F4E37] uppercase tracking-wider border-b border-stone-100 pb-1.5 flex items-center gap-2">
                    <UtensilsCrossed size={15} /> Business Capabilities
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-stone-400 font-bold block">Seating Capacity</span>
                      <span className="font-extrabold text-[#2C1810]">{selectedRestaurant.maximum_persons || 50} Persons</span>
                    </div>
                    <div>
                      <span className="text-stone-400 font-bold block">Event Services</span>
                      <span className="font-extrabold text-[#2C1810]">{selectedRestaurant.provides_event_services ? 'Yes (Supported)' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 font-bold block">3rd Party Decoration</span>
                      <span className="font-extrabold text-[#2C1810]">{selectedRestaurant.allow_third_party_decoration ? 'Allowed' : 'Not Allowed'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 font-bold block">Walk-In Dining</span>
                      <span className="font-extrabold text-emerald-700">Supported</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REJECTION REASON MODAL */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-[#E8DED5] p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-black text-[#2C1810]">Reject Restaurant Listing</h3>
              <p className="text-xs text-stone-500">Please provide a reason for rejecting this restaurant listing. This reason will be logged and communicated to the partner.</p>
              <textarea
                rows={3}
                className="w-full p-3 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                placeholder="Enter rejection reason (e.g. Incomplete business documents, invalid address...)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => rejectMutation.mutate({ id: actionRestaurantId, reason: rejectionReason })}
                  disabled={!rejectionReason.trim() || rejectMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black disabled:opacity-50 cursor-pointer"
                >
                  Submit Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
