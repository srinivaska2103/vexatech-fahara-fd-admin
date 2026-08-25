'use client';

import { useState, Suspense, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Megaphone, ArrowLeft, Send, Users, User, Building, Briefcase, Mail, Smartphone, Bell, Loader2, Sparkles, Check, ChevronDown, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to map role IDs to human readable names
const getRoleLabel = (user) => {
  if (user.roles?.name) return user.roles.name;
  if (user.role) return user.role;
  const rid = (user.role_id || '').toLowerCase();
  if (rid.includes('cafe')) return 'Cafe Owner';
  if (rid.includes('event')) return 'Event Manager';
  if (rid.includes('admin')) return 'Admin';
  return 'Customer';
};

// Custom User Combobox Component
function UserCombobox({ users, selectedUserId, onSelectUser, isLoading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const containerRef = useRef(null);

  const selectedUser = users?.find(u => u.id === selectedUserId);

  const filteredUsers = users?.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  ) || [];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-fahara-secondary p-3 bg-fahara-surface border border-fahara-border rounded-xl">
        <Loader2 className="w-4 h-4 animate-spin text-fahara-primary" />
        <span>Loading registered platform users...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-fahara-surface border border-fahara-border rounded-xl text-left hover:border-fahara-primary/50 transition-all cursor-pointer shadow-xs"
      >
        {selectedUser ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-fahara-primary text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
              {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="font-extrabold text-xs text-fahara-text flex items-center gap-2">
                <span>{selectedUser.name}</span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-fahara-primary/10 text-fahara-primary border border-fahara-primary/20">
                  {getRoleLabel(selectedUser)}
                </span>
              </div>
              <div className="text-[10px] text-fahara-secondary">{selectedUser.email}</div>
            </div>
          </div>
        ) : (
          <span className="text-xs text-fahara-secondary/70 font-medium">-- Select a registered user --</span>
        )}
        <ChevronDown className={`w-4 h-4 text-fahara-secondary transition-transform ${isOpen ? 'rotate-180 text-fahara-primary' : ''}`} />
      </button>

      {/* Floating Dropdown List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-fahara-surface border border-fahara-border rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {/* Search Input inside Dropdown */}
            <div className="p-3 border-b border-fahara-border bg-fahara-background/80">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-fahara-secondary" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 bg-fahara-surface border border-fahara-border rounded-xl text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 placeholder:text-fahara-secondary/60"
                  placeholder="Search user by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Scrollable Users Items */}
            <div className="max-h-60 overflow-y-auto divide-y divide-fahara-border/50 p-1">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-xs text-fahara-secondary font-medium">
                  No matching registered users found.
                </div>
              ) : (
                filteredUsers.map(user => {
                  const isSelected = user.id === selectedUserId;
                  const roleLabel = getRoleLabel(user);

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        onSelectUser(user.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer text-left ${
                        isSelected 
                          ? 'bg-fahara-primary/10 text-fahara-primary' 
                          : 'hover:bg-fahara-background text-fahara-text'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected ? 'bg-fahara-primary text-white' : 'bg-fahara-background text-fahara-text border border-fahara-border'
                        }`}>
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs flex items-center gap-2">
                            <span>{user.name}</span>
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-fahara-background border border-fahara-border text-fahara-secondary">
                              {roleLabel}
                            </span>
                          </div>
                          <div className="text-[10px] text-fahara-secondary">{user.email}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-fahara-primary" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BroadcastFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelParam = searchParams?.get('channel');
  
  let defaultChannels = ['IN_APP', 'EMAIL'];
  if (channelParam === 'email') defaultChannels = ['EMAIL'];
  if (channelParam === 'whatsapp' || channelParam === 'push') defaultChannels = ['PUSH'];

  const [formData, setFormData] = useState({
    targetAudience: 'ALL_CUSTOMERS', // ALL_CUSTOMERS, CAFE_OWNERS, EVENT_MANAGERS, SPECIFIC_USER
    specificUserId: '',
    subject: '',
    message: '',
    channels: defaultChannels
  });
  
  const [showPreview, setShowPreview] = useState(false);

  // Fetch users from live database if specific user is selected
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['allUsersForBroadcast'],
    queryFn: async () => {
      const res = await api.get('/users?limit=1000');
      return res.data?.data || [];
    },
    enabled: formData.targetAudience === 'SPECIFIC_USER'
  });

  const broadcastMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/notifications/admin/broadcast', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Broadcast sent successfully');
      router.push('/admin/notifications');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send broadcast');
      setShowPreview(false);
    }
  });

  const handleChannelToggle = (channel) => {
    setFormData(prev => {
      const newChannels = prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel];
      
      if (newChannels.length === 0) return prev;
      return { ...prev, channels: newChannels };
    });
  };

  const handlePreviewSubmit = (e) => {
    e.preventDefault();
    
    if (formData.targetAudience === 'SPECIFIC_USER' && !formData.specificUserId) {
      toast.error('Please select a target user');
      return;
    }
    
    setShowPreview(true);
  };

  const confirmSend = () => {
    broadcastMutation.mutate(formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 pb-12 overflow-x-hidden max-w-5xl mx-auto"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fahara-border/60 pb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/notifications" 
            className="p-2.5 bg-fahara-surface border border-fahara-border rounded-2xl hover:bg-fahara-background transition-colors text-fahara-text cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight flex items-center gap-2.5">
              <Megaphone className="h-6 w-6 text-fahara-primary" />
              New Broadcast Campaign
            </h1>
            <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
              Compose system alerts, email blasts, and mobile push notifications for platform users.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Composer Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handlePreviewSubmit} className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs space-y-6">
            
            {/* Target Audience Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-fahara-secondary mb-3">
                1. Select Target Audience
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, targetAudience: 'ALL_CUSTOMERS'})}
                  className={`flex flex-col items-center justify-center p-4 border rounded-2xl transition-all cursor-pointer ${
                    formData.targetAudience === 'ALL_CUSTOMERS' 
                    ? 'border-fahara-primary bg-fahara-primary/10 text-fahara-primary font-extrabold shadow-2xs' 
                    : 'border-fahara-border bg-fahara-background text-fahara-secondary hover:border-fahara-primary/40'
                  }`}
                >
                  <Users className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-bold">All Customers</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({...formData, targetAudience: 'CAFE_OWNERS'})}
                  className={`flex flex-col items-center justify-center p-4 border rounded-2xl transition-all cursor-pointer ${
                    formData.targetAudience === 'CAFE_OWNERS' 
                    ? 'border-fahara-primary bg-fahara-primary/10 text-fahara-primary font-extrabold shadow-2xs' 
                    : 'border-fahara-border bg-fahara-background text-fahara-secondary hover:border-fahara-primary/40'
                  }`}
                >
                  <Building className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-bold">Cafe Owners</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({...formData, targetAudience: 'EVENT_MANAGERS'})}
                  className={`flex flex-col items-center justify-center p-4 border rounded-2xl transition-all cursor-pointer ${
                    formData.targetAudience === 'EVENT_MANAGERS' 
                    ? 'border-fahara-primary bg-fahara-primary/10 text-fahara-primary font-extrabold shadow-2xs' 
                    : 'border-fahara-border bg-fahara-background text-fahara-secondary hover:border-fahara-primary/40'
                  }`}
                >
                  <Briefcase className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-bold">Event Managers</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({...formData, targetAudience: 'SPECIFIC_USER'})}
                  className={`flex flex-col items-center justify-center p-4 border rounded-2xl transition-all cursor-pointer ${
                    formData.targetAudience === 'SPECIFIC_USER' 
                    ? 'border-fahara-primary bg-fahara-primary/10 text-fahara-primary font-extrabold shadow-2xs' 
                    : 'border-fahara-border bg-fahara-background text-fahara-secondary hover:border-fahara-primary/40'
                  }`}
                >
                  <User className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-bold">Specific User</span>
                </button>
              </div>
            </div>

            {/* Custom User Combobox Selector */}
            {formData.targetAudience === 'SPECIFIC_USER' && (
              <div className="p-4 bg-fahara-background border border-fahara-border rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-fahara-text">Select Recipient</label>
                <UserCombobox 
                  users={users}
                  selectedUserId={formData.specificUserId}
                  onSelectUser={(userId) => setFormData({...formData, specificUserId: userId})}
                  isLoading={isLoadingUsers}
                />
              </div>
            )}

            {/* Subject Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-fahara-secondary mb-2">
                2. Subject / Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-fahara-border rounded-xl bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all placeholder:text-fahara-secondary/60"
                placeholder="e.g. Platform Maintenance Notice"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                required
              />
            </div>

            {/* Message Body Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-fahara-secondary mb-2">
                3. Message Content
              </label>
              <textarea
                className="w-full px-4 py-3 border border-fahara-border rounded-xl bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all min-h-[140px] resize-y placeholder:text-fahara-secondary/60"
                placeholder="Write your broadcast message here..."
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-fahara-border">
              <button
                type="submit"
                className="px-6 py-2.5 bg-fahara-primary text-white text-xs font-bold rounded-xl hover:bg-fahara-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <span>Continue to Preview</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Sidebar: Delivery Channels */}
        <div className="lg:col-span-1">
          <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs space-y-4 sticky top-6">
            <h3 className="text-sm font-bold text-fahara-text border-b border-fahara-border pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-fahara-primary" /> Delivery Channels
            </h3>
            <p className="text-xs text-fahara-secondary">Select how this broadcast message should be dispatched.</p>
            
            <div className="space-y-3">
              <label className={`flex items-start p-3.5 border rounded-2xl cursor-pointer transition-all ${
                formData.channels.includes('IN_APP') ? 'border-fahara-primary bg-fahara-primary/5' : 'border-fahara-border bg-fahara-background hover:border-fahara-primary/40'
              }`}>
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 text-fahara-primary border-fahara-border rounded focus:ring-fahara-primary"
                  checked={formData.channels.includes('IN_APP')}
                  onChange={() => handleChannelToggle('IN_APP')}
                />
                <div className="ml-3 text-xs">
                  <span className="font-bold text-fahara-text flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-fahara-primary" /> In-App Notification
                  </span>
                  <p className="text-[10px] text-fahara-secondary mt-0.5">Shows up in user's notification bell.</p>
                </div>
              </label>

              <label className={`flex items-start p-3.5 border rounded-2xl cursor-pointer transition-all ${
                formData.channels.includes('EMAIL') ? 'border-fahara-primary bg-fahara-primary/5' : 'border-fahara-border bg-fahara-background hover:border-fahara-primary/40'
              }`}>
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 text-fahara-primary border-fahara-border rounded focus:ring-fahara-primary"
                  checked={formData.channels.includes('EMAIL')}
                  onChange={() => handleChannelToggle('EMAIL')}
                />
                <div className="ml-3 text-xs">
                  <span className="font-bold text-fahara-text flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-fahara-primary" /> Email Blast
                  </span>
                  <p className="text-[10px] text-fahara-secondary mt-0.5">Sends to user's registered email address.</p>
                </div>
              </label>

              <label className={`flex items-start p-3.5 border rounded-2xl cursor-pointer transition-all ${
                formData.channels.includes('PUSH') ? 'border-fahara-primary bg-fahara-primary/5' : 'border-fahara-border bg-fahara-background hover:border-fahara-primary/40'
              }`}>
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 text-fahara-primary border-fahara-border rounded focus:ring-fahara-primary"
                  checked={formData.channels.includes('PUSH')}
                  onChange={() => handleChannelToggle('PUSH')}
                />
                <div className="ml-3 text-xs">
                  <span className="font-bold text-fahara-text flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-fahara-primary" /> Push Notification
                  </span>
                  <p className="text-[10px] text-fahara-secondary mt-0.5">Pushes to user's mobile device via Firebase.</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-fahara-surface rounded-3xl max-w-lg w-full overflow-hidden shadow-xl border border-fahara-border space-y-4 p-6">
            <div className="border-b border-fahara-border pb-3">
              <h2 className="text-base font-bold text-fahara-text flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-fahara-primary" /> Confirm Broadcast Campaign
              </h2>
              <p className="text-xs text-fahara-secondary mt-0.5">Please review target audience and channels before dispatching.</p>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-fahara-border">
                <span className="text-fahara-secondary font-medium">Target Audience</span>
                <span className="font-extrabold text-fahara-text bg-fahara-background px-3 py-1 rounded-full border border-fahara-border">
                  {formData.targetAudience.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b border-fahara-border">
                <span className="text-fahara-secondary font-medium">Delivery Channels</span>
                <div className="flex gap-1.5">
                  {formData.channels.map(c => (
                    <span key={c} className="text-[10px] font-extrabold bg-fahara-primary/10 text-fahara-primary px-2.5 py-0.5 rounded-full border border-fahara-primary/20">
                      {c.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-fahara-secondary font-medium block mb-1">Subject</span>
                <p className="font-extrabold text-fahara-text">{formData.subject}</p>
              </div>
              
              <div className="bg-fahara-background rounded-2xl p-4 border border-fahara-border text-xs text-fahara-text leading-relaxed whitespace-pre-wrap">
                {formData.message}
              </div>
            </div>
            
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-fahara-border">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 font-bold text-fahara-secondary hover:text-fahara-text transition-colors text-xs cursor-pointer"
                disabled={broadcastMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmSend}
                disabled={broadcastMutation.isPending}
                className="px-5 py-2.5 bg-fahara-primary text-white text-xs font-bold rounded-xl hover:bg-fahara-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {broadcastMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Dispatching...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Now</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function BroadcastPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-fahara-secondary">Loading broadcast composer...</div>}>
      <BroadcastFormContent />
    </Suspense>
  );
}
