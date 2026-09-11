'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
  Search, Filter, ChevronRight, Briefcase, Star, Sparkles, UserCheck, 
  ShieldCheck, Clock, Loader2, Users, Package, Tags, CheckCircle2, DollarSign 
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';

function EventManagersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'packages' ? 'packages' : 'organizers');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (tabParam === 'packages') setActiveTab('packages');
    else setActiveTab('organizers');
  }, [tabParam]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'packages') router.push('/admin/event-managers?tab=packages');
    else router.push('/admin/event-managers');
  };

  // 1. Fetch Real Event Managers
  const { data: managers, isLoading: isManagersLoading } = useQuery({
    queryKey: ['adminEventManagers'],
    queryFn: async () => {
      const response = await api.get('/users?role=EVENT_MANAGER');
      return response.data.data || [];
    }
  });

  // 2. Fetch Real Event Services / Packages from DB
  const { data: eventPackages, isLoading: isPackagesLoading } = useQuery({
    queryKey: ['adminEventServicesPackagesReal'],
    queryFn: async () => {
      const response = await api.get('/event-services');
      return response.data.data || [];
    }
  });

  const filteredManagers = managers?.filter(manager => {
    const profile = manager.event_management_profiles || {};
    const matchesSearch = 
      manager.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') return matchesSearch && manager.status === 'ACTIVE';
    if (statusFilter === 'suspended') return matchesSearch && manager.status === 'SUSPENDED';
    if (statusFilter === 'pending') return matchesSearch && profile.verification_status === 'PENDING';
    return matchesSearch;
  });

  const filteredPackages = eventPackages?.filter(pkg => {
    const matchesSearch = 
      pkg.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.users?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const totalVerified = managers?.filter(m => m.event_management_profiles?.verification_status === 'VERIFIED').length || 0;
  const totalPending = managers?.filter(m => m.event_management_profiles?.verification_status === 'PENDING' || !m.event_management_profiles?.verification_status).length || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 pb-12 overflow-x-hidden"
    >
      {/* Top Page Header */}
      <div className="border-b border-fahara-border/60 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight flex items-center gap-2.5">
              <Sparkles className="h-6 w-6 text-fahara-primary" />
              Event Management Directory
            </h1>
            <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
              Manage event organizers, company profiles, and real service packages.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-fahara-secondary bg-fahara-surface border border-fahara-border px-3 py-1.5 rounded-xl">
            <span>Total Organizers:</span>
            <span className="font-bold text-fahara-text">{managers?.length || 0}</span>
          </div>
        </div>

        {/* Tab Switcher: Event Organizers vs Event Packages */}
        <div className="flex gap-6 border-b border-fahara-border mt-6">
          <button
            onClick={() => handleTabChange('organizers')}
            className={`pb-3 px-1 border-b-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'organizers' 
                ? 'border-fahara-primary text-fahara-primary' 
                : 'border-transparent text-fahara-secondary hover:text-fahara-text'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Event Organizers ({managers?.length || 0})</span>
          </button>

          <button
            onClick={() => handleTabChange('packages')}
            className={`pb-3 px-1 border-b-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'packages' 
                ? 'border-fahara-primary text-fahara-primary' 
                : 'border-transparent text-fahara-secondary hover:text-fahara-text'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Event Packages & Services ({eventPackages?.length || 0})</span>
          </button>
        </div>
      </div>

      {activeTab === 'organizers' ? (
        <>
          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Total Event Managers</span>
                <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-fahara-text mt-2">{managers?.length || 0}</div>
              <span className="text-[11px] text-fahara-secondary mt-1 block">Event Organizers & Agencies</span>
            </div>

            <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Verified Profiles</span>
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-fahara-text mt-2">{totalVerified}</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Approved & Verified</span>
            </div>

            <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Pending Verifications</span>
                <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-fahara-text mt-2">{totalPending}</div>
              <span className="text-[11px] text-amber-600 font-semibold mt-1 block">Requires Review</span>
            </div>
          </div>

          {/* Filters and Search Bar */}
          <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fahara-secondary" />
              <input 
                type="text"
                placeholder="Search by manager name, email, or company..."
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
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending Verification</option>
              </select>
            </div>
          </div>

          {/* Managers Table Container */}
          <div className="bg-fahara-surface border border-fahara-border rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-fahara-background/80 border-b border-fahara-border text-fahara-secondary font-semibold uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-4">Company & Manager</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Experience</th>
                    <th className="px-6 py-4">Verification</th>
                    <th className="px-6 py-4">Account Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fahara-border/60">
                  {isManagersLoading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-fahara-secondary">
                        <div className="flex justify-center items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-fahara-primary" />
                          <span>Loading event managers...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredManagers?.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-fahara-secondary">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="w-10 h-10 text-fahara-secondary/40" />
                          <p className="text-base font-bold text-fahara-text">No event managers found</p>
                          <p className="text-xs text-fahara-secondary">Try adjusting your search criteria.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredManagers?.map(manager => {
                      const profile = manager.event_management_profiles || {};
                      const isVerified = profile.verification_status === 'VERIFIED';
                      const isPending = profile.verification_status === 'PENDING' || !profile.verification_status;
                      
                      return (
                        <tr key={manager.id} className="hover:bg-fahara-background/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                                {profile.company_name ? profile.company_name.charAt(0).toUpperCase() : manager.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-fahara-text">{profile.company_name || 'Individual Organizer'}</div>
                                <div className="text-[11px] text-fahara-secondary">{manager.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-fahara-text font-medium">{manager.email}</div>
                            <div className="text-[10px] text-fahara-secondary">{manager.phone || 'No phone'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-fahara-text font-medium">
                              <Briefcase className="w-3.5 h-3.5 text-fahara-secondary" />
                              <span>{profile.experience_years || 0} Years Exp</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              isPending ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {profile.verification_status || 'PENDING'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              manager.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {manager.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link 
                              href={`/admin/event-managers/${manager.id}`}
                              className="inline-flex items-center gap-1 text-fahara-primary hover:text-fahara-primary/80 font-bold transition-colors"
                            >
                              <span>View Profile</span>
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* REAL DB EVENT PACKAGES VIEW */
        <div className="space-y-6">
          <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fahara-secondary" />
              <input 
                type="text"
                placeholder="Search event packages by title, category, or manager..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fahara-border bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all placeholder:text-fahara-secondary/60"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isPackagesLoading ? (
            <div className="py-16 flex justify-center items-center gap-2 text-xs text-fahara-secondary">
              <Loader2 className="w-5 h-5 animate-spin text-fahara-primary" />
              <span>Fetching real event packages from database...</span>
            </div>
          ) : filteredPackages?.length === 0 ? (
            <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-fahara-background border border-fahara-border flex items-center justify-center mx-auto text-fahara-primary">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-fahara-text">No Event Packages Found</h3>
              <p className="text-xs text-fahara-secondary leading-relaxed">
                No event packages match your search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages?.map((pkg) => {
                const galleryImg = pkg.gallery && pkg.gallery[0] ? pkg.gallery[0] : null;
                const managerName = pkg.users?.event_management_profiles?.company_name || pkg.users?.name || 'Event Organizer';

                return (
                  <div key={pkg.id} className="bg-fahara-surface border border-fahara-border rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:border-fahara-primary/40 transition-all">
                    <div>
                      {/* Package Image Header */}
                      <div className="h-40 w-full bg-fahara-background border-b border-fahara-border relative overflow-hidden">
                        {galleryImg ? (
                          <img src={galleryImg} alt={pkg.service_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-fahara-secondary/60">
                            <Sparkles className="w-8 h-8 mb-1 text-fahara-primary/40" />
                            <span className="text-[10px] uppercase font-bold">No Preview Image</span>
                          </div>
                        )}
                        <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 backdrop-blur-xs">
                          {pkg.category || 'Event Service'}
                        </span>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-extrabold text-fahara-text text-sm">{pkg.service_name}</h3>
                            <p className="text-[11px] text-fahara-secondary mt-0.5">By {managerName}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-extrabold text-fahara-primary">₹{Number(pkg.price || 0).toLocaleString('en-IN')}</div>
                            <span className="text-[9px] uppercase font-bold text-fahara-secondary">Package Price</span>
                          </div>
                        </div>

                        {pkg.description && (
                          <p className="text-xs text-fahara-text/80 line-clamp-2 leading-relaxed">
                            {pkg.description}
                          </p>
                        )}

                        {/* Inclusions List */}
                        {Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0 && (
                          <div className="pt-3 border-t border-fahara-border/60 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary block">Inclusions</span>
                            <div className="flex flex-wrap gap-1.5">
                              {pkg.inclusions.slice(0, 4).map((inc, iIdx) => {
                                const name = typeof inc === 'string' ? inc : (inc?.name || inc?.item_name || inc?.title || inc?.category || 'Feature');
                                return (
                                  <span key={iIdx} className="px-2 py-0.5 bg-fahara-background border border-fahara-border rounded-md text-[10px] font-semibold text-fahara-text">
                                    {name}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-fahara-background/40 border-t border-fahara-border flex items-center justify-between text-xs">
                      <span className="text-[10px] text-fahara-secondary">ID: {pkg.id.slice(0, 8)}...</span>
                      <span className="text-fahara-primary font-bold text-[11px] flex items-center gap-1">
                        Active Package <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </motion.div>
  );
}

export default function EventManagersList() {
  return (
    <Suspense fallback={
      <div className="w-full py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-fahara-primary" />
          <span className="text-xs text-fahara-secondary">Loading event management...</span>
        </div>
      </div>
    }>
      <EventManagersContent />
    </Suspense>
  );
}
