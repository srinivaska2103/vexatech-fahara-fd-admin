'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Search, Filter, MessageSquare, Loader2, Star, AlertTriangle, CheckCircle, Trash2, Eye, EyeOff, ShieldCheck, Sparkles, Coffee } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';

function ReviewsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const typeParam = searchParams.get('type');
  const [activeTab, setActiveTab] = useState(typeParam === 'events' ? 'events' : typeParam === 'cafes' ? 'cafes' : 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionConfirm, setActionConfirm] = useState(null);

  useEffect(() => {
    if (typeParam === 'events') setActiveTab('events');
    else if (typeParam === 'cafes') setActiveTab('cafes');
    else setActiveTab('all');
  }, [typeParam]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'all') router.push('/admin/reviews');
    else router.push(`/admin/reviews?type=${tabId}`);
  };

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['adminReviews'],
    queryFn: async () => {
      const res = await api.get('/reviews/admin/all');
      return res.data?.data || [];
    }
  });

  const moderateMutation = useMutation({
    mutationFn: async ({ id, action }) => {
      const res = await api.put(`/reviews/admin/${id}/moderate`, { action });
      return res.data;
    },
    onSuccess: (data, variables) => {
      if (variables.action === 'remove') {
        queryClient.setQueryData(['adminReviews'], old => old.filter(r => r.id !== variables.id));
      } else if (variables.action === 'hide') {
        queryClient.setQueryData(['adminReviews'], old => old.map(r => r.id === variables.id ? { ...r, moderation_status: 'HIDDEN' } : r));
      } else if (variables.action === 'restore') {
        queryClient.setQueryData(['adminReviews'], old => old.map(r => r.id === variables.id ? { ...r, moderation_status: 'APPROVED' } : r));
      } else if (variables.action === 'investigate') {
        queryClient.setQueryData(['adminReviews'], old => old.map(r => r.id === variables.id ? { ...r, moderation_status: 'UNDER_INVESTIGATION' } : r));
      }
      setActionConfirm(null);
    }
  });

  const filteredReviews = reviews?.filter(r => {
    // 1. Type Filter (Cafes vs Events)
    if (activeTab === 'events') {
      const isEvent = r.business?.type === 'EVENT' || r.event_service_id || r.type === 'EVENT';
      if (!isEvent) return false;
    } else if (activeTab === 'cafes') {
      const isCafe = r.business?.type === 'CAFE' || r.cafe_id || r.type === 'CAFE';
      if (!isCafe) return false;
    }

    // 2. Search Term Filter
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = r.customer?.name?.toLowerCase().includes(searchString) ||
                          r.business?.name?.toLowerCase().includes(searchString) ||
                          r.review?.toLowerCase().includes(searchString);
    
    // 3. Status Filter
    const matchesStatus = statusFilter === 'All' || r.moderation_status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const handleActionClick = (id, action) => {
    const titles = {
      'remove': 'Delete Review',
      'hide': 'Hide Review',
      'restore': 'Restore Review',
      'investigate': 'Investigate Report'
    };
    
    const messages = {
      'remove': 'Are you sure you want to permanently delete this review? This action cannot be undone.',
      'hide': 'Are you sure you want to hide this review from public view?',
      'restore': 'Are you sure you want to restore this review to public view?',
      'investigate': 'Mark this review as under investigation?'
    };

    setActionConfirm({ id, action, title: titles[action], message: messages[action] });
  };

  const confirmAction = () => {
    if (actionConfirm) {
      moderateMutation.mutate({ id: actionConfirm.id, action: actionConfirm.action });
    }
  };

  const currentTabReviews = reviews?.filter(r => {
    if (activeTab === 'events') return r.business?.type === 'EVENT' || r.event_service_id || r.type === 'EVENT';
    if (activeTab === 'cafes') return r.business?.type === 'CAFE' || r.cafe_id || r.type === 'CAFE';
    return true;
  }) || [];

  const approvedCount = currentTabReviews.filter(r => r.moderation_status === 'APPROVED').length;
  const reportedCount = currentTabReviews.filter(r => r.report_count > 0 || r.moderation_status === 'UNDER_INVESTIGATION').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 pb-12 overflow-x-hidden"
    >
      {/* Top Header */}
      <div className="border-b border-fahara-border/60 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight flex items-center gap-2.5">
              <MessageSquare className="h-6 w-6 text-fahara-primary" />
              Content Moderation & Reviews
            </h1>
            <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
              Manage customer feedback, audit user reviews, and moderate reported content.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-fahara-secondary bg-fahara-surface border border-fahara-border px-3 py-1.5 rounded-xl">
            <span>Total Reviews:</span>
            <span className="font-bold text-fahara-text">{currentTabReviews.length}</span>
          </div>
        </div>

        {/* Tab Switcher: All, Cafe Reviews, Event Service Reviews */}
        <div className="flex gap-6 border-b border-fahara-border mt-6">
          {[
            { id: 'all', label: 'All Reviews', icon: MessageSquare },
            { id: 'cafes', label: 'Cafe Reviews', icon: Coffee },
            { id: 'events', label: 'Event Service Reviews', icon: Sparkles }
          ].map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`pb-3 px-1 border-b-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'border-fahara-primary text-fahara-primary' 
                    : 'border-transparent text-fahara-secondary hover:text-fahara-text'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Total Submissions</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{currentTabReviews.length}</div>
          <span className="text-[11px] text-fahara-secondary mt-1 block">
            {activeTab === 'events' ? 'Event Services Ratings' : activeTab === 'cafes' ? 'Cafe Ratings' : 'All Customer Ratings'}
          </span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Public & Approved</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{approvedCount}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Visible Reviews</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Reported / Flagged</span>
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{reportedCount}</div>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 block">Requires Moderation</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-fahara-secondary">
            <Search className="h-4 w-4" />
          </div>
          <input 
            type="text"
            placeholder="Search by customer, business, or review text..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fahara-border bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all placeholder:text-fahara-secondary/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-fahara-secondary" />
          <select 
            className="w-full md:w-auto bg-fahara-background border border-fahara-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="HIDDEN">Hidden</option>
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-fahara-background/80 border-b border-fahara-border text-fahara-secondary font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Business Venue</th>
                <th className="px-6 py-4">Review Text</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Status & Reports</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fahara-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-fahara-primary" />
                      <span>Loading reviews...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <MessageSquare className="w-10 h-10 text-fahara-secondary/40" />
                      <p className="text-base font-bold text-fahara-text">No reviews found</p>
                      <p className="text-xs text-fahara-secondary">
                        {activeTab === 'events' ? 'No customer reviews submitted for event services yet.' :
                         activeTab === 'cafes' ? 'No customer reviews submitted for cafes yet.' :
                         'No customer reviews match your search filters.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReviews.map(r => (
                  <tr key={r.id} className="hover:bg-fahara-background/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-fahara-text">{r.customer?.name || 'Customer'}</div>
                      <div className="text-[10px] text-fahara-secondary">{r.date ? format(new Date(r.date), 'MMM dd, yyyy') : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-fahara-primary">{r.business?.name || 'Service Venue'}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                        r.business?.type === 'EVENT' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {r.business?.type || 'CAFE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="truncate text-fahara-text font-medium" title={r.review}>{r.review || 'No written review text'}</p>
                      {r.images?.length > 0 && (
                        <div className="text-[10px] text-fahara-secondary mt-0.5">{r.images.length} Image(s) attached</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-bold text-fahara-text">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{r.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${
                          r.moderation_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          r.moderation_status === 'HIDDEN' ? 'bg-gray-50 text-gray-700 border border-gray-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {r.moderation_status}
                        </span>
                        {r.report_count > 0 && (
                          <span className="inline-flex items-center text-[10px] text-rose-600 font-bold gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            {r.report_count} Reports
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.moderation_status === 'APPROVED' ? (
                          <button 
                            onClick={() => handleActionClick(r.id, 'hide')}
                            className="p-2 text-fahara-secondary hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                            title="Hide Review"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleActionClick(r.id, 'restore')}
                            className="p-2 text-fahara-secondary hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                            title="Restore Review"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleActionClick(r.id, 'investigate')}
                          className="p-2 text-fahara-secondary hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                          title="Flag for Investigation"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleActionClick(r.id, 'remove')}
                          className="p-2 text-fahara-secondary hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Remove Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {actionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-fahara-surface rounded-3xl shadow-xl max-w-sm w-full p-6 border border-fahara-border">
            <h3 className="text-base font-bold text-fahara-text mb-2 flex items-center gap-2">
              {actionConfirm.action === 'remove' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
              {actionConfirm.title}
            </h3>
            <p className="text-fahara-secondary mb-6 text-xs leading-relaxed">
              {actionConfirm.message}
            </p>
            <div className="flex justify-end gap-2.5">
              <button 
                onClick={() => setActionConfirm(null)}
                className="px-4 py-2 bg-fahara-background text-fahara-text hover:bg-fahara-surface border border-fahara-border font-bold rounded-xl transition-colors text-xs cursor-pointer"
                disabled={moderateMutation.isPending}
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction}
                className={`px-4 py-2 text-white font-bold rounded-xl transition-colors text-xs flex items-center cursor-pointer shadow-xs ${
                  actionConfirm.action === 'remove' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-fahara-primary hover:bg-fahara-primary/90'
                }`}
                disabled={moderateMutation.isPending}
              >
                {moderateMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={
      <div className="w-full py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-fahara-primary" />
          <span className="text-xs text-fahara-secondary">Loading reviews moderation center...</span>
        </div>
      </div>
    }>
      <ReviewsContent />
    </Suspense>
  );
}
