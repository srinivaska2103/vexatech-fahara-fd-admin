'use client';

import { useState } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Search, Filter, ShieldCheck, Building, User, Building2, Landmark, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PayoutAccountsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [syncingId, setSyncingId] = useState(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const queryClient = useQueryClient();

  const results = useQueries({
    queries: [
      {
        queryKey: ['adminCafeOwners'],
        queryFn: async () => {
          const res = await api.get('/users?role=CAFE_OWNER');
          return res.data?.data?.map(u => ({ ...u, partnerType: 'CAFE_OWNER' })) || [];
        }
      },
      {
        queryKey: ['adminEventManagers'],
        queryFn: async () => {
          const res = await api.get('/users?role=EVENT_MANAGER');
          return res.data?.data?.map(u => ({ ...u, partnerType: 'EVENT_MANAGER' })) || [];
        }
      }
    ]
  });

  const isLoading = results.some(r => r.isLoading);
  const data = results.flatMap(r => r.data || []);

  const handleSyncStatus = async (account) => {
    try {
      setSyncingId(account.id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['adminCafeOwners'] }),
        queryClient.invalidateQueries({ queryKey: ['adminEventManagers'] })
      ]);
    } catch (e) {
      alert('Failed to sync vendor status from Razorpay backend');
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    try {
      setIsSyncingAll(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['adminCafeOwners'] }),
        queryClient.invalidateQueries({ queryKey: ['adminEventManagers'] })
      ]);
    } catch (e) {
      alert('Failed to refresh vendor statuses');
    } finally {
      setIsSyncingAll(false);
    }
  };

  const filteredAccounts = data.filter(account => {
    const matchesSearch = 
      account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_holder?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.bank_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (roleFilter === 'all') return matchesSearch;
    return matchesSearch && account.partnerType === roleFilter;
  });

  const totalVendors = data.length;
  const cafeOwnersCount = data.filter(a => a.partnerType === 'CAFE_OWNER').length;
  const eventManagersCount = data.filter(a => a.partnerType === 'EVENT_MANAGER').length;
  const configuredAccountsCount = data.filter(a => a.account_number || a.bank_name).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 pb-12 overflow-x-hidden"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fahara-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-fahara-primary" />
            Razorpay Vendor Payout Accounts
          </h1>
          <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
            Manage and verify bank account settlement details fetched directly from Razorpay PG.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="flex items-center gap-1.5 text-xs font-bold bg-fahara-surface border border-fahara-border hover:bg-fahara-background text-fahara-text px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin text-fahara-primary' : 'text-fahara-secondary'}`} />
            <span>Fetch Razorpay Status</span>
          </button>
          <span className="text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl uppercase tracking-wider">
            Razorpay PG Integrated
          </span>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Total Vendor Profiles</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{totalVendors}</div>
          <span className="text-[11px] text-fahara-secondary mt-1 block">Registered Platform Partners</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Configured Bank Accounts</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{configuredAccountsCount}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Ready for Direct Payout</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Cafe Owners</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{cafeOwnersCount}</div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">Cafe Merchants</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Event Managers</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{eventManagersCount}</div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Event Organizers</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-fahara-secondary">
            <Search className="h-4 w-4" />
          </div>
          <input 
            type="text"
            placeholder="Search by name, email, account holder, bank..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fahara-border bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all placeholder:text-fahara-secondary/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-fahara-secondary" />
          <select 
            className="w-full md:w-auto bg-fahara-background border border-fahara-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Partners</option>
            <option value="CAFE_OWNER">Cafe Owners</option>
            <option value="EVENT_MANAGER">Event Managers</option>
          </select>
        </div>
      </div>

      {/* Vendor Accounts Table */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-fahara-background/80 border-b border-fahara-border text-fahara-secondary font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Partner</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Bank Details</th>
                <th className="px-6 py-4">Account Details</th>
                <th className="px-6 py-4">Verification Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fahara-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-fahara-primary" />
                      <span>Loading vendor accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-fahara-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="w-10 h-10 text-fahara-secondary/40" />
                      <p className="text-base font-bold text-fahara-text">No vendor accounts found</p>
                      <p className="text-xs text-fahara-secondary">No payout account records match your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => {
                  let vStatus = 'PENDING';
                  const cafe = Array.isArray(account.cafes) ? account.cafes[0] : account.cafes;
                  const emp = Array.isArray(account.event_management_profiles) ? account.event_management_profiles[0] : account.event_management_profiles;

                  if (account.partnerType === 'CAFE_OWNER' && cafe) {
                     vStatus = cafe.razorpay_account_status || cafe.bank_verification_status || cafe.status || 'PENDING';
                  } else if (account.partnerType === 'EVENT_MANAGER' && emp) {
                     vStatus = emp.razorpay_account_status || emp.verification_status || 'PENDING';
                  }

                  if (!vStatus || vStatus === 'PENDING') {
                    if (account.bank_name && account.account_number && account.ifsc_code) {
                      vStatus = 'ACTIVE';
                    }
                  }

                  return (
                    <tr key={account.id} className="hover:bg-fahara-background/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-fahara-text">{account.name}</div>
                        <div className="text-[10px] text-fahara-secondary">{account.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          account.partnerType === 'CAFE_OWNER' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {account.partnerType === 'CAFE_OWNER' ? <Building className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          <span>{account.partnerType.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {account.bank_name ? (
                          <div>
                            <span className="font-extrabold text-fahara-text">{account.bank_name}</span>
                            <div className="text-[10px] text-fahara-secondary font-mono">IFSC: {account.ifsc_code || 'N/A'}</div>
                          </div>
                        ) : (
                          <span className="text-fahara-secondary/60 italic">Not Provided</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {account.account_number ? (
                          <div>
                            <div className="font-bold text-fahara-text flex items-center gap-1">
                              <span>{account.account_holder}</span>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Bank Verified" />
                            </div>
                            <div className="font-mono text-[10px] text-fahara-secondary">{account.account_number}</div>
                          </div>
                        ) : (
                          <span className="text-fahara-secondary/60 italic">Not Provided</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          ['APPROVED', 'ACTIVE', 'VERIFIED'].includes(vStatus) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          vStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            ['APPROVED', 'ACTIVE', 'VERIFIED'].includes(vStatus) ? 'bg-emerald-500' :
                            vStatus === 'REJECTED' ? 'bg-rose-500' :
                            'bg-blue-500'
                          }`} />
                          {vStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSyncStatus(account)}
                          disabled={syncingId === account.id}
                          className="px-3 py-1.5 bg-fahara-surface hover:bg-fahara-background text-fahara-text border border-fahara-border text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-2xs cursor-pointer ml-auto"
                          title="Sync live status from Razorpay backend"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingId === account.id ? 'animate-spin text-fahara-primary' : 'text-fahara-secondary'}`} />
                          <span>Sync Status</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
