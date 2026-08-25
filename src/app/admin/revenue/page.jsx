'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
  AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, CreditCard, RefreshCcw, 
  Wallet, ShieldCheck, Activity, Calendar, DollarSign, Loader2, Sparkles, Percent, CheckCircle2 
} from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

export default function RevenueDashboard() {
  const [filter, setFilter] = useState('Month');

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['adminRevenue', filter],
    queryFn: async () => {
      const res = await api.get('/payments/admin/revenue', { params: { filter } });
      return res.data?.data;
    }
  });

  const grossVal = Number(revenueData?.gross_booking_value ?? revenueData?.grossBookingValue ?? 0);
  const cafePayableVal = Number(revenueData?.cafe_payable ?? revenueData?.cafePayable ?? 0);
  const eventPayableVal = Number(revenueData?.event_manager_payable ?? revenueData?.eventManagerPayable ?? 0);
  
  let faharaRevVal = Number(revenueData?.fahara_platform_revenue ?? revenueData?.fahara_revenue ?? revenueData?.faharaRevenue ?? 0);
  if (faharaRevVal === 0 && grossVal > 0) {
    const calcFee = grossVal - (cafePayableVal + eventPayableVal);
    faharaRevVal = calcFee > 0 ? Number(calcFee.toFixed(2)) : Number((grossVal * 0.04).toFixed(2));
  }

  let netRevVal = Number(revenueData?.net_revenue ?? revenueData?.netRevenue ?? faharaRevVal);
  if (netRevVal === 0 && faharaRevVal > 0) {
    netRevVal = faharaRevVal;
  }

  const stats = [
    { name: 'Gross Booking Value', value: grossVal, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { name: 'Fahara Revenue', value: faharaRevVal, icon: Percent, color: 'text-fahara-primary', bg: 'bg-amber-50 border-amber-200' },
    { name: 'Refunds Settled', value: Number(revenueData?.refunds || 0), icon: RefreshCcw, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { name: 'Cafe Payable', value: cafePayableVal, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { name: 'Event Manager Payable', value: eventPayableVal, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { name: 'Net Platform Revenue', value: netRevVal, icon: TrendingUp, color: 'text-fahara-primary', bg: 'bg-amber-50 border-amber-200' },
  ];

  const pieData = [
    { name: 'Success', value: revenueData?.success_rate || 100 },
    { name: 'Refunded', value: revenueData?.refund_rate || 0 },
    { name: 'Failed', value: Math.max(0, 100 - (revenueData?.success_rate || 100) - (revenueData?.refund_rate || 0)) }
  ];

  const chartData = revenueData?.chart_data?.months?.map((m, i) => ({
    name: m,
    Revenue: revenueData.chart_data.values[i]
  })) || [];

  if (isLoading) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-fahara-primary" />
          <span className="text-xs text-fahara-secondary">Loading financial revenue analytics...</span>
        </div>
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
      {/* Header & Time Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-fahara-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight flex items-center gap-2.5">
            <TrendingUp className="h-6 w-6 text-fahara-primary" />
            Revenue & Financial Analytics
          </h1>
          <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
            Track gross booking volume, platform service commissions, taxes, and vendor payables.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-fahara-surface border border-fahara-border p-1 rounded-2xl shadow-2xs">
          {['Today', 'Week', 'Month', 'Quarter', 'Year'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === f 
                  ? 'bg-fahara-primary text-white shadow-2xs' 
                  : 'text-fahara-secondary hover:text-fahara-text hover:bg-fahara-background'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-fahara-surface p-5 rounded-2xl border border-fahara-border shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-fahara-secondary">{stat.name}</span>
              <div className={`p-2 rounded-xl border ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-fahara-text">
                ₹{Number(stat.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Trend */}
        <div className="bg-fahara-surface p-6 rounded-2xl border border-fahara-border shadow-xs lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-fahara-text border-b border-fahara-border pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-fahara-primary" /> Platform Revenue Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6F4E37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6F4E37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DED5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#2C1810', fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#2C1810', fontSize: 11}} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid #E8DED5', backgroundColor: '#FFF8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#6F4E37" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Success Rate Donut */}
        <div className="bg-fahara-surface p-6 rounded-2xl border border-fahara-border shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-fahara-text border-b border-fahara-border pb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Payment Conversion Rate
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-2 border-t border-fahara-border">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-fahara-secondary font-medium">{item.name}</span>
                </div>
                <span className="font-extrabold text-fahara-text">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Settlement Alert */}
      {Number(revenueData?.pending_settlement) > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-center justify-between shadow-2xs">
          <div>
            <h4 className="text-amber-900 font-extrabold text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-700" /> Pending Vendor Settlements
            </h4>
            <p className="text-amber-800 text-xs mt-0.5">Payouts currently in processing window awaiting automated clearing.</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-extrabold text-amber-950">₹{Number(revenueData.pending_settlement).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
