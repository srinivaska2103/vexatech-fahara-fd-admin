'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { EmptyState } from './DashboardEmptyStates';
import { BarChart3, TrendingUp, Users, PieChart as PieChartIcon, Activity } from 'lucide-react';

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const formatCurrency = (val) => {
  const num = Number(val || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(num);
};

export const DashboardCharts = ({ summary }) => {
  if (!summary) return null;

  // 1. Revenue Trend
  const revenueData = summary.revenue_chart?.labels?.map((label, i) => ({
    name: label,
    revenue: summary.revenue_chart.data[i] || 0
  })) || [];

  // 2. Booking Trend
  const bookingTrend = summary.booking_chart?.labels?.map((label, i) => ({
    name: label,
    bookings: summary.booking_chart.data[i] || 0
  })) || [];

  // 3. Platform Growth
  const growthData = summary.growth_chart || [];

  // 4. Payment Distribution
  const paymentDistribution = summary.payment_distribution || [];

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold tracking-tight text-fahara-text flex items-center gap-2">
          <Activity className="h-4 w-4 text-fahara-primary" />
          Analytics & Growth Charts
        </h2>
        <span className="text-xs text-fahara-secondary">Live DB Data Insights</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Growth Trend Area Chart */}
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-fahara-text flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Revenue Trend (Last 7 Days)
              </h3>
              <p className="text-xs text-fahara-secondary mt-0.5">Gross daily booking revenue</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Live DB
            </span>
          </div>

          {revenueData.length === 0 ? (
            <EmptyState icon={BarChart3} title="No Revenue Data" />
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6F4E37" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#6F4E37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DED5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#A67B5B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#A67B5B' }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E8DED5', backgroundColor: '#FFF8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6F4E37" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Booking Volume Bar Chart */}
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-fahara-text flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                Booking Volume (Last 7 Days)
              </h3>
              <p className="text-xs text-fahara-secondary mt-0.5">Daily reservation count</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Total: {summary.total_bookings || 0}
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DED5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#A67B5B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#A67B5B' }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#FFF8F0' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E8DED5', backgroundColor: '#FFFFFF' }}
                  formatter={(value) => [`${value} Bookings`, 'Volume']}
                />
                <Bar dataKey="bookings" fill="#A67B5B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform User Growth Line Chart */}
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-fahara-text flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Platform Monthly Growth
              </h3>
              <p className="text-xs text-fahara-secondary mt-0.5">Cumulative accounts over time</p>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DED5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#A67B5B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#A67B5B' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E8DED5' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                <Line type="monotone" dataKey="customers" name="Customers" stroke="#6F4E37" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="cafes" name="Cafes" stroke="#A67B5B" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="managers" name="Event Managers" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking & Payment Status Donut Chart */}
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-fahara-text flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-amber-600" />
                Booking Status Breakdown
              </h3>
              <p className="text-xs text-fahara-secondary mt-0.5">Ratio of completed vs pending bookings</p>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {paymentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E8DED5' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
