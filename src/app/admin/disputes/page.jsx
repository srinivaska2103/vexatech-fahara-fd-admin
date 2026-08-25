'use client';

import { useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { AlertCircle, Loader2, ShieldCheck, CheckCircle2, LifeBuoy, MessageSquare, Ticket, FileText, Check } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function DisputesContent() {
  const searchParams = useSearchParams();
  const viewParam = searchParams?.get('view');
  const [activeTab, setActiveTab] = useState(viewParam === 'tickets' ? 'tickets' : 'disputes');

  const { data: disputes, isLoading } = useQuery({
    queryKey: ['adminDisputes'],
    queryFn: async () => {
      const res = await api.get('/payments/admin/disputes');
      return res.data?.data || [];
    }
  });

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
            <LifeBuoy className="h-6 w-6 text-fahara-primary" />
            {activeTab === 'tickets' ? 'Support Tickets & Helpdesk' : 'Disputes & Customer Chargebacks'}
          </h1>
          <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
            Arbitrate customer payment disputes, partner helpdesk tickets, and chargeback evidence.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-fahara-surface border border-fahara-border p-1 rounded-2xl shadow-2xs">
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'disputes' 
                ? 'bg-fahara-primary text-white shadow-2xs' 
                : 'text-fahara-secondary hover:text-fahara-text hover:bg-fahara-background'
            }`}
          >
            Disputes & Chargebacks
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tickets' 
                ? 'bg-fahara-primary text-white shadow-2xs' 
                : 'text-fahara-secondary hover:text-fahara-text hover:bg-fahara-background'
            }`}
          >
            Support Tickets
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">
              {activeTab === 'tickets' ? 'Open Support Tickets' : 'Open Disputes'}
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">{disputes?.length || 0}</div>
          <span className="text-[11px] text-fahara-secondary mt-1 block">Requiring Admin Intervention</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Resolved This Month</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">0</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">100% Resolution Rate</span>
        </div>

        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">Dispute Ratio</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-fahara-text mt-2">0.0%</div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Healthy Merchant Status</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-fahara-surface rounded-2xl border border-fahara-border shadow-xs overflow-hidden min-h-[380px] flex items-center justify-center p-8">
        {isLoading ? (
          <div className="text-center text-fahara-secondary flex items-center gap-2 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-fahara-primary" />
            <span>Loading records...</span>
          </div>
        ) : (!disputes || disputes.length === 0) ? (
          <div className="text-center p-8 max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-fahara-text">
              {activeTab === 'tickets' ? 'Zero Open Support Tickets' : 'Zero Active Disputes'}
            </h3>
            <p className="text-xs text-fahara-secondary leading-relaxed">
              Great news! There are currently no active customer chargebacks or unresolved partner helpdesk tickets.
            </p>
            <div className="pt-2">
              <Link 
                href="/admin/payments" 
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-fahara-primary text-white text-xs font-bold rounded-xl hover:bg-fahara-primary/90 transition-all cursor-pointer shadow-2xs"
              >
                Explore Payments Ledger
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {/* Table if disputes exist */}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AdminDisputesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-fahara-secondary">Loading support & disputes...</div>}>
      <DisputesContent />
    </Suspense>
  );
}
