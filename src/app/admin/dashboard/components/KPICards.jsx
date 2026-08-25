'use client';

import React from 'react';
import { 
  Users, Store, Tent, Calendar, CheckCircle2, XCircle, 
  DollarSign, Wallet, ArrowRightLeft, ShieldAlert, Coffee, 
  TrendingUp, TrendingDown, Clock, ShieldCheck
} from 'lucide-react';

const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num || 0);
};

const KPICard = ({ title, value, icon: Icon, type = 'number', trend, subtitle, colorScheme = 'primary' }) => {
  const colorStyles = {
    primary: {
      iconBg: 'bg-fahara-primary/10 text-fahara-primary border-fahara-primary/20',
      bar: 'bg-fahara-primary',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      bar: 'bg-emerald-500',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      bar: 'bg-amber-500',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
      bar: 'bg-blue-500',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
      bar: 'bg-purple-500',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
      bar: 'bg-rose-500',
    }
  };

  const currentScheme = colorStyles[colorScheme] || colorStyles.primary;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-fahara-border bg-fahara-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Top Bar Indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${currentScheme.bar} opacity-0 transition-opacity group-hover:opacity-100`} />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fahara-text">
              {type === 'currency' ? formatCurrency(value) : formatNumber(value)}
            </span>
          </div>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${currentScheme.iconBg} shadow-xs transition-transform group-hover:scale-110`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-fahara-border/60 pt-3 text-xs">
        {trend !== undefined ? (
          <div className="flex items-center gap-1 font-medium">
            {trend > 0 ? (
              <span className="inline-flex items-center text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <TrendingUp className="mr-1 h-3 w-3" /> +{trend}%
              </span>
            ) : trend < 0 ? (
              <span className="inline-flex items-center text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                <TrendingDown className="mr-1 h-3 w-3" /> {trend}%
              </span>
            ) : (
              <span className="inline-flex items-center text-fahara-secondary bg-fahara-background px-2 py-0.5 rounded-full border border-fahara-border">
                0%
              </span>
            )}
            <span className="text-fahara-secondary text-[11px]">vs last period</span>
          </div>
        ) : (
          <span className="text-[11px] font-medium text-fahara-secondary truncate">
            {subtitle || 'Real-time database metric'}
          </span>
        )}
      </div>
    </div>
  );
};

export const KPICards = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="space-y-8">
      {/* 1. Platform Users & Entities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold tracking-tight text-fahara-text flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-fahara-primary" />
            Platform & User Metrics
          </h2>
          <span className="text-xs text-fahara-secondary">Live Database Totals</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <KPICard 
            title="Total Customers" 
            value={summary.new_customers || 0} 
            icon={Users} 
            trend={summary.customer_trend} 
            colorScheme="blue"
          />
          <KPICard 
            title="Total Cafe Owners" 
            value={summary.total_cafe_owners || 0} 
            icon={Store} 
            colorScheme="amber"
            subtitle="Registered Business Owners"
          />
          <KPICard 
            title="Total Cafes" 
            value={summary.total_cafes || 0} 
            icon={Coffee} 
            colorScheme="primary"
            subtitle="Active Listed Venues"
          />
          <KPICard 
            title="Event Managers" 
            value={summary.total_event_managers || 0} 
            icon={Tent} 
            colorScheme="purple"
            subtitle="Verified Organizers"
          />
          <KPICard 
            title="Pending Verifications" 
            value={summary.pending_verifications || 0} 
            icon={ShieldAlert} 
            colorScheme="rose"
            subtitle="Requires Admin Action"
          />
        </div>
      </div>

      {/* 2. Bookings Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold tracking-tight text-fahara-text flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Booking & Reservation Metrics
          </h2>
          <span className="text-xs text-fahara-secondary">All Time Activity</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            title="Total Bookings" 
            value={summary.total_bookings || 0} 
            icon={Calendar} 
            trend={summary.booking_trend} 
            colorScheme="primary"
          />
          <KPICard 
            title="Today's Bookings" 
            value={summary.todays_bookings || 0} 
            icon={Clock} 
            colorScheme="emerald"
            subtitle="Scheduled For Today"
          />
          <KPICard 
            title="Completed Bookings" 
            value={summary.completed_bookings || 0} 
            icon={CheckCircle2} 
            colorScheme="blue"
            subtitle="Successfully Fulfilled"
          />
          <KPICard 
            title="Cancelled Bookings" 
            value={summary.cancelled_bookings || 0} 
            icon={XCircle} 
            colorScheme="rose"
            subtitle="Refunded / Voided"
          />
        </div>
      </div>

      {/* 3. Revenue & Financial Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold tracking-tight text-fahara-text flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Financial & Revenue Summary
          </h2>
          <span className="text-xs text-fahara-secondary">Gross & Platform Charges</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            title="Gross Booking Volume" 
            value={summary.total_revenue || 0} 
            icon={DollarSign} 
            type="currency" 
            trend={summary.revenue_trend} 
            colorScheme="emerald"
          />
          <KPICard 
            title="Fahara Platform Revenue" 
            value={summary.fahara_revenue || 0} 
            icon={Wallet} 
            type="currency" 
            colorScheme="amber"
            subtitle="Net Platform Earnings"
          />
          <KPICard 
            title="Pending Payouts" 
            value={summary.pending_payouts || 0} 
            icon={ArrowRightLeft} 
            type="currency" 
            colorScheme="blue"
            subtitle="Partner Escrow Funds"
          />
          <KPICard 
            title="Refund Amount" 
            value={summary.refund_amount || 0} 
            icon={ArrowRightLeft} 
            type="currency" 
            colorScheme="purple"
            subtitle="Customer Reimbursements"
          />
        </div>
      </div>
    </div>
  );
};
