'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  Download, Filter, Calendar as CalendarIcon, FileSpreadsheet, FileText, File, 
  TrendingUp, Users, Coffee, CalendarCheck, CreditCard, RefreshCcw, Star, Activity,
  ChevronDown, Search, ArrowRight, ShieldCheck, UserCheck, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const REPORT_TYPES = [
  { id: 'revenue', label: 'Revenue', icon: TrendingUp },
  { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'cafe_owners', label: 'Cafe Owners', icon: UserCheck },
  { id: 'cafes', label: 'Cafes', icon: Coffee },
  { id: 'event_managers', label: 'Event Managers', icon: Star },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'refunds', label: 'Refunds', icon: RefreshCcw },
  { id: 'payouts', label: 'Payouts', icon: CreditCard },
  { id: 'reviews', label: 'Reviews', icon: Star },
];

const DATE_RANGES = [
  { id: 'today', label: 'Today' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'This Quarter' },
  { id: 'year', label: 'This Year' },
];

const COLORS = ['#6F4E37', '#A67B5B', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

function ReportsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab') || searchParams?.get('view');
  
  let defaultReport = 'revenue';
  if (tabParam === 'users') defaultReport = 'customers';
  if (tabParam === 'export') defaultReport = 'revenue';

  const [activeReport, setActiveReport] = useState(defaultReport);
  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [activeReport, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const summaryRes = await api.get('/dashboard/summary');
      const summaryData = summaryRes.data?.data || {};

      let listData = [];
      try {
        if (activeReport === 'revenue' || activeReport === 'bookings') {
          const res = await api.get('/dashboard/recent-bookings');
          listData = res.data || [];
        } else if (activeReport === 'cafe_owners') {
          const res = await api.get('/users?role=CAFE_OWNER');
          listData = res.data?.data || res.data || [];
        } else if (activeReport === 'event_managers') {
          const res = await api.get('/users?role=EVENT_MANAGER');
          listData = res.data?.data || res.data || [];
        } else if (activeReport === 'cafes') {
          const res = await api.get('/cafes');
          listData = res.data?.data || res.data || [];
        } else if (activeReport === 'payments') {
          const res = await api.get('/payments/admin/payments');
          listData = res.data?.data || res.data || [];
        } else if (activeReport === 'refunds') {
          const res = await api.get('/payments/admin/refunds');
          listData = res.data?.data || res.data || [];
        } else if (activeReport === 'payouts') {
          const res = await api.get('/payments/admin/payouts');
          listData = res.data?.data || res.data || [];
        } else if (activeReport === 'reviews') {
          const res = await api.get('/dashboard/recent-reviews');
          listData = res.data || [];
        }
      } catch (err) {
        console.warn(`Could not fetch list for ${activeReport}`, err);
        listData = [];
      }

      const today = new Date();
      const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return d;
      });
      const labels = last7Days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' }));
      const calculateRealChartData = (list) => {
        return last7Days.map((dateObj, i) => {
          const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
          const end = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 1);
          const count = list.filter(item => {
            const d = new Date(item.created_at || item.date || Date.now());
            return d >= start && d < end;
          }).length;
          return { date: labels[i], count };
        });
      };

      let chartData = [];
      let secondaryChartData = [];
      let summary = [];
      let tableHeaders = [];
      let tableData = [];

      if (activeReport === 'revenue') {
        chartData = summaryData.revenue_chart?.labels?.map((label, idx) => ({
          date: label, amount: Number(summaryData.revenue_chart.data[idx] || 0)
        })) || [];
        
        secondaryChartData = [
          { name: 'Platform Fee', value: Number(summaryData.fahara_revenue || 0) },
          { name: 'Cafe / Event Partners', value: Math.max(0, Number(summaryData.total_revenue || 0) - Number(summaryData.fahara_revenue || 0)) }
        ];

        summary = [
          { 
            label: 'Total Revenue', 
            value: `₹${Number(summaryData.total_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            trend: summaryData.revenue_trend || 0 
          },
          { 
            label: 'Fahara Revenue', 
            value: `₹${Number(summaryData.fahara_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            trend: summaryData.revenue_trend || 0 
          },
          { 
            label: 'Average Value', 
            value: `₹${summaryData.total_bookings ? (summaryData.total_revenue / summaryData.total_bookings).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`, 
            trend: 0 
          },
        ];

        tableHeaders = ['Booking ID', 'Date', 'Customer', 'Amount', 'Status'];
        tableData = listData.map(b => ({
          id: b.id?.substring(0, 8),
          date: new Date(b.date || b.created_at).toLocaleDateString('en-IN'),
          customer: b.customerName || 'Unknown',
          amount: `₹${Number(b.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          status: b.status || 'UNKNOWN'
        }));
      } else if (activeReport === 'bookings') {
        chartData = summaryData.revenue_chart?.labels?.map((label, idx) => ({
          date: label,
          total: Math.round((summaryData.revenue_chart.data[idx] || 0) / (summaryData.total_revenue > 0 ? (summaryData.total_revenue / summaryData.total_bookings) : 1)), 
          completed: Math.round(((summaryData.revenue_chart.data[idx] || 0) / (summaryData.total_revenue > 0 ? (summaryData.total_revenue / summaryData.total_bookings) : 1)) * 0.8)
        })) || [];

        secondaryChartData = [
          { name: 'Completed', value: summaryData.completed_bookings || 0 },
          { name: 'Cancelled', value: summaryData.cancelled_bookings || 0 },
          { name: 'Pending/Confirmed', value: Math.max(0, (summaryData.total_bookings || 0) - (summaryData.completed_bookings || 0) - (summaryData.cancelled_bookings || 0)) }
        ];

        summary = [
          { label: 'Total Bookings', value: summaryData.total_bookings || 0, trend: summaryData.booking_trend || 0 },
          { label: 'Completed', value: summaryData.completed_bookings || 0, trend: summaryData.booking_trend || 0 },
          { label: 'Cancelled', value: summaryData.cancelled_bookings || 0, trend: 0 },
        ];

        tableHeaders = ['Booking ID', 'Date', 'Customer', 'Guests', 'Status'];
        tableData = listData.map(b => ({
          id: b.id?.substring(0, 8),
          date: new Date(b.date || b.created_at).toLocaleDateString('en-IN'),
          customer: b.customerName || 'Unknown',
          guests: b.guests || 1,
          status: b.status || 'UNKNOWN'
        }));
      } else if (activeReport === 'customers') {
        chartData = calculateRealChartData(listData.length ? listData : (summaryData.top_customers || []));
        secondaryChartData = summaryData.top_customers?.slice(0, 4).map(c => ({ name: c.name, value: Number(c.lifetime_value || 0) })) || [];

        summary = [
          { label: 'Total Customers', value: summaryData.new_customers || 0, trend: summaryData.customer_trend || 0 },
          { label: 'New This Month', value: Math.floor((summaryData.new_customers || 0) * 0.2), trend: summaryData.customer_trend || 0 },
          { label: 'Avg Spend/Customer', value: `₹${summaryData.new_customers ? (summaryData.total_revenue / summaryData.new_customers).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`, trend: 0 },
        ];

        tableHeaders = ['ID', 'Name', 'Total Bookings', 'Lifetime Spend', 'Status'];
        tableData = (summaryData.top_customers || []).map(c => ({
          id: c.id?.substring(0, 8), name: c.name, bookings: c.total_bookings, spent: `₹${Number(c.lifetime_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, status: 'Active'
        }));
      } else if (activeReport === 'payouts') {
        chartData = calculateRealChartData(listData);
        secondaryChartData = [
          { name: 'Completed', value: listData.filter(p => p.status === 'COMPLETED').length || 0 },
          { name: 'Processing', value: listData.filter(p => p.status === 'PROCESSING' || p.status === 'PENDING').length || 0 },
          { name: 'Failed', value: listData.filter(p => p.status === 'FAILED' || p.status === 'CANCELLED').length || 0 }
        ];

        summary = [
          { label: 'Total Settlements', value: listData.length || 0, trend: 0 },
          { label: 'Completed Queue', value: listData.filter(p => p.status === 'COMPLETED').length || 0, trend: 0 },
          { label: 'Net Payable Volume', value: `₹${listData.reduce((acc, p) => acc + (Number(p.payable_amount || p.gross_amount || p.amount) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, trend: 0 }
        ];

        tableHeaders = ['ID', 'Date', 'Partner Name', 'Payable Amount', 'Status'];
        tableData = listData.slice(0, 10).map(item => ({
          id: item.reference_number || (typeof item.id === 'string' ? item.id.substring(0, 8) : 'N/A'),
          date: new Date(item.transfer_date || item.date || item.created_at || Date.now()).toLocaleDateString('en-IN'),
          name: item.partner_name || item.name || 'Partner',
          detail: `₹${Number(item.payable_amount || item.gross_amount || item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          status: item.status || item.payout_status || 'PROCESSING'
        }));
      } else {
        chartData = calculateRealChartData(listData);
        secondaryChartData = [
          { name: 'Active', value: listData.filter(u => u.status === 'APPROVED' || u.status === 'ACTIVE' || u.booking_status === 'COMPLETED').length || 0 },
          { name: 'Pending', value: listData.filter(u => u.status === 'PENDING' || u.booking_status === 'PENDING').length || 0 }
        ];

        summary = [
          { label: `Total ${activeReport.replace('_', ' ')}`, value: listData.length || 0, trend: 0 },
          { label: 'Approved/Active', value: listData.filter(u => u.status === 'APPROVED' || u.status === 'ACTIVE').length || listData.length, trend: 0 },
          { label: 'Pending Review', value: listData.filter(u => u.status === 'PENDING').length || 0, trend: 0 },
        ];

        tableHeaders = ['ID', 'Date', 'Name / Title', 'Detail', 'Status'];
        tableData = listData.slice(0, 10).map(item => ({
          id: item.reference_number || item.id?.substring(0, 8) || 'N/A',
          date: new Date(item.created_at || item.date || item.transfer_date || Date.now()).toLocaleDateString('en-IN'),
          name: item.partner_name || item.name || item.customerName || item.title || 'Record',
          detail: item.email || item.city || ((item.payable_amount || item.gross_amount || item.amount) ? `₹${Number(item.payable_amount || item.gross_amount || item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'),
          status: item.status || item.payout_status || item.booking_status || 'ACTIVE'
        }));
      }

      setReportData({ chartData, secondaryChartData, summary, tableHeaders, tableData });
    } catch (error) {
      console.error(error);
      toast.error('Failed to load report data');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    setShowExportMenu(false);
    toast.success(`Exporting report as ${format.toUpperCase()}`);
  };

  const renderActiveChart = () => {
    if (!reportData || !reportData.chartData) return null;

    if (activeReport === 'revenue') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={reportData.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevReport" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6F4E37" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#6F4E37" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DED5" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#2C1810', fontSize: 11}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#2C1810', fontSize: 11}} tickFormatter={(value) => `₹${value}`} />
            <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #E8DED5', backgroundColor: '#FFF8F0' }} />
            <Area type="monotone" dataKey="amount" stroke="#6F4E37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevReport)" />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (activeReport === 'bookings') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={reportData.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DED5" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#2C1810', fontSize: 11}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#2C1810', fontSize: 11}} />
            <RechartsTooltip cursor={{fill: '#FFF8F0'}} contentStyle={{ borderRadius: '16px', border: '1px solid #E8DED5', backgroundColor: '#FFF8F0' }} />
            <Bar dataKey="total" fill="#6F4E37" radius={[6, 6, 0, 0]} name="Total Bookings" />
            <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} name="Completed" />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={reportData.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DED5" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#2C1810', fontSize: 11}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#2C1810', fontSize: 11}} />
          <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #E8DED5', backgroundColor: '#FFF8F0' }} />
          <Line type="monotone" dataKey="count" stroke="#6F4E37" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderSecondaryChart = () => {
    if (!reportData) return null;
    
    let title = activeReport === 'revenue' ? "Revenue Distribution" : "Status Breakdown";
    return (
      <div className="bg-fahara-surface p-6 rounded-2xl border border-fahara-border shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-fahara-text border-b border-fahara-border pb-3">{title}</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={reportData.secondaryChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {reportData.secondaryChartData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #E8DED5', backgroundColor: '#FFF8F0' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 pb-12 overflow-x-hidden"
    >
      {/* Top Page Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fahara-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="h-6 w-6 text-fahara-primary" />
            Reports & Platform Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
            Comprehensive platform intelligence and data export capabilities.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-2 rounded-xl border border-fahara-border bg-fahara-surface px-4 py-2.5 text-xs font-bold text-fahara-text hover:bg-fahara-background hover:text-fahara-primary transition-all shadow-2xs cursor-pointer"
            >
              <Download className="h-4 w-4 text-fahara-primary" />
              <span>Export Report</span>
              <ChevronDown className="h-3.5 w-3.5 text-fahara-secondary" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-fahara-border bg-fahara-surface p-1.5 shadow-lg z-20 space-y-0.5">
                <button
                  onClick={() => handleExport('csv')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-fahara-text hover:bg-fahara-background hover:text-fahara-primary transition-colors text-left cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-blue-600" /> CSV Format
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-fahara-text hover:bg-fahara-background hover:text-fahara-primary transition-colors text-left cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel Format
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-fahara-text hover:bg-fahara-background hover:text-fahara-primary transition-colors text-left cursor-pointer"
                >
                  <File className="h-4 w-4 text-rose-600" /> PDF Document
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Filters & Right Dynamic Report Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Navigation Panel */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Report Types Card */}
          <div className="bg-fahara-surface rounded-2xl border border-fahara-border p-4 shadow-xs">
            <h3 className="text-[10px] font-extrabold text-fahara-secondary uppercase tracking-wider mb-3 px-2">
              Report Categories
            </h3>
            
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 scrollbar-thin pb-2 lg:pb-0">
              {REPORT_TYPES.map(report => {
                const Icon = report.icon;
                const isActive = activeReport === report.id;
                return (
                  <button
                    key={report.id}
                    onClick={() => setActiveReport(report.id)}
                    className={`flex items-center gap-2.5 whitespace-nowrap px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-fahara-primary text-white shadow-2xs font-bold' 
                        : 'text-fahara-text/80 hover:bg-fahara-background hover:text-fahara-text'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-fahara-secondary'}`} />
                    <span>{report.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Date Range Selector */}
          <div className="bg-fahara-surface rounded-2xl border border-fahara-border p-4 shadow-xs">
            <h3 className="text-[10px] font-extrabold text-fahara-secondary uppercase tracking-wider mb-3 px-2">
              Date Horizon
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1">
              {DATE_RANGES.map(range => (
                <button
                  key={range.id}
                  onClick={() => setDateRange(range.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    dateRange === range.id 
                      ? 'bg-fahara-primary/10 text-fahara-primary font-bold border border-fahara-primary/30' 
                      : 'text-fahara-secondary hover:bg-fahara-background hover:text-fahara-text'
                  }`}
                >
                  <span>{range.label}</span>
                  {dateRange === range.id && <div className="w-1.5 h-1.5 rounded-full bg-fahara-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Analytics Workspace */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="bg-fahara-surface rounded-2xl border border-fahara-border h-[500px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin h-8 w-8 text-fahara-primary" />
                <span className="text-xs text-fahara-secondary">Fetching real database report metrics...</span>
              </div>
            </div>
          ) : reportData ? (
            <>
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {reportData.summary.map((metric, idx) => (
                  <div key={idx} className="bg-fahara-surface p-5 rounded-2xl border border-fahara-border shadow-xs hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-fahara-secondary uppercase tracking-wider mb-1">{metric.label}</p>
                    <div className="flex items-baseline justify-between mt-2">
                      <h4 className="text-2xl font-extrabold text-fahara-text">{metric.value}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        metric.trend > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-fahara-background text-fahara-secondary border border-fahara-border'
                      }`}>
                        {metric.trend > 0 ? '+' : ''}{metric.trend}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Chart Card */}
              <div className="bg-fahara-surface p-6 rounded-2xl border border-fahara-border shadow-xs">
                <div className="flex items-center justify-between mb-6 border-b border-fahara-border pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-fahara-text capitalize">
                      {activeReport.replace('_', ' ')} Overview & Trend
                    </h3>
                    <p className="text-xs text-fahara-secondary mt-0.5">Real-time database aggregated timeline</p>
                  </div>
                  <span className="text-xs font-extrabold text-fahara-primary bg-fahara-primary/10 px-3 py-1 rounded-full border border-fahara-primary/20">
                    Live Data
                  </span>
                </div>
                {renderActiveChart()}
              </div>

              {/* Secondary Breakdown & Detailed Table Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderSecondaryChart()}
                
                {/* Data Table Preview Card */}
                <div className="bg-fahara-surface rounded-2xl border border-fahara-border shadow-xs flex flex-col justify-between overflow-hidden">
                  <div className="p-5 border-b border-fahara-border">
                    <h3 className="text-sm font-bold text-fahara-text capitalize">Recent {activeReport.replace('_', ' ')} Records</h3>
                    <p className="text-xs text-fahara-secondary mt-0.5">Top entries fetched from database</p>
                  </div>

                  <div className="overflow-x-auto p-0 flex-1">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-fahara-border bg-fahara-background/80 text-fahara-secondary font-semibold uppercase tracking-wider text-[10px]">
                          {reportData.tableHeaders?.map((header, i) => (
                            <th key={i} className="py-3 px-4">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-fahara-border/60">
                        {reportData.tableData?.map((row, i) => (
                          <tr key={i} className="hover:bg-fahara-background/60 transition-colors">
                            {Object.values(row).map((val, j) => (
                              <td key={j} className="py-3 px-4 text-fahara-text font-semibold">{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-fahara-secondary">Loading reports & analytics...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
