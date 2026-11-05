'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Clock, 
  UtensilsCrossed, 
  Bike, 
  Building2, 
  RefreshCw,
  Eye,
  MapPin,
  ChevronRight,
  X,
  Phone,
  User,
  Calendar,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(num);
};

export default function AdminFoodOrdersPage() {
  const [mounted, setMounted] = React.useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: responseData, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['adminFoodOrders', page, statusFilter, typeFilter, searchQuery],
    queryFn: async () => {
      const res = await api.get('/admin/food/orders', {
        params: {
          page,
          limit: 15,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          orderType: typeFilter !== 'ALL' ? typeFilter : undefined,
          search: searchQuery || undefined
        }
      });
      return res.data;
    }
  });

  const orders = responseData?.data || [];
  const pagination = responseData?.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-rose-50 text-[#E50914] border border-rose-200 shadow-2xs">
              <ShoppingBag className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Food Orders Management
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Centralized monitoring of customer food orders across all platform cafes and restaurants
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-700 rounded-xl cursor-pointer transition-all shadow-xs disabled:opacity-50 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#E50914] ${isFetching ? 'animate-spin' : ''}`} /> 
          <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* ── SEARCH & FILTERS BAR ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Order ID, Customer Name, Phone, or Cafe Name..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none focus:border-[#E50914] shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
          {['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st 
                  ? 'bg-[#E50914] text-white shadow-xs' 
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── ORDERS TABLE ── */}
      <div className="bg-white border border-stone-200 rounded-3xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#E50914]" />
            <span className="text-xs font-bold">Loading food orders...</span>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-xs font-bold text-rose-600">
            Failed to load food orders. Please retry.
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-black text-stone-700">No Food Orders Found</h3>
            <p className="text-xs text-stone-400">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/75 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10.5px] font-black">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Cafe / Restaurant</th>
                  <th className="py-3.5 px-4">Ordered Items</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {orders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-stone-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#E50914]">
                      #{order.orderNumber}
                      <span className="block text-[9.5px] font-sans font-medium text-stone-400 capitalize">
                        {order.orderType?.toLowerCase().replace('_', ' ')}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-stone-900 block truncate max-w-[140px]">
                        {order.customerName}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {order.customerPhone}
                      </span>
                    </td>

                    {/* Cafe */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-stone-800 block truncate max-w-[150px]">
                        {order.cafeName}
                      </span>
                      <span className="text-[10.5px] text-stone-400 flex items-center gap-1">
                        <MapPin size={10} className="text-[#E50914]" />
                        {order.cafeCity || 'Location'}
                      </span>
                    </td>

                    {/* Ordered Items */}
                    <td className="py-3.5 px-4">
                      <div className="max-w-[200px]">
                        <span className="font-bold text-stone-800 line-clamp-1">
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'} total
                        </span>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-black text-stone-900 block">
                        ₹{Number(order.totalAmount).toFixed(2)}
                      </span>
                      <span className="text-[9.5px] text-stone-400">
                        Subtotal: ₹{Number(order.subtotal).toFixed(2)}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Order Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        ['COMPLETED', 'DELIVERED'].includes(order.orderStatus)
                          ? 'bg-emerald-100 text-emerald-800'
                          : ['CANCELLED', 'REJECTED'].includes(order.orderStatus)
                          ? 'bg-rose-100 text-rose-800'
                          : order.orderStatus === 'PREPARING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-stone-500 text-[11px] whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="p-1.5 bg-stone-100 hover:bg-[#E50914] hover:text-white text-stone-600 rounded-lg transition-colors cursor-pointer"
                        title="View Full Order"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PAGINATION BAR ── */}
        {!isLoading && orders.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-stone-200 text-xs font-bold text-stone-600 bg-stone-50/50">
            <span>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-2 font-mono">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── FULL ORDER DETAILS MODAL / DRAWER ── */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl border border-stone-200 p-6 sm:p-7 space-y-6"
            >
              {/* Top Modal Bar */}
              <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 text-[#E50914] border border-rose-200 uppercase">
                      {selectedOrder.orderType}
                    </span>
                    <span className="text-xs text-stone-400">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-stone-900 mt-1">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status and Customer Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Details */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Customer Information</span>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-stone-900">{selectedOrder.customerName}</p>
                    <p className="text-xs text-stone-600 flex items-center gap-1.5 font-mono">
                      <Phone size={11} className="text-[#E50914]" /> {selectedOrder.customerPhone}
                    </p>
                    {selectedOrder.customerEmail && (
                      <p className="text-xs text-stone-500">{selectedOrder.customerEmail}</p>
                    )}
                  </div>
                </div>

                {/* Restaurant Details */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Restaurant Details</span>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-stone-900">{selectedOrder.cafeName}</p>
                    <p className="text-xs text-stone-600 flex items-center gap-1.5">
                      <MapPin size={11} className="text-[#E50914]" /> {selectedOrder.cafeCity || 'Location available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="space-y-3">
                <span className="text-xs font-black text-stone-900 uppercase tracking-wider block">Ordered Food Items</span>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-rose-50 text-[#E50914] font-black flex items-center justify-center text-[11px] shrink-0">
                          {item.quantity}x
                        </span>
                        <div>
                          <p className="font-bold text-stone-900">{item.name}</p>
                          <p className="text-[10px] text-stone-400 font-mono">₹{item.unitPrice} each</p>
                        </div>
                      </div>
                      <span className="font-black text-stone-900 font-mono">₹{item.lineTotal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Commission Breakdown */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2.5 text-xs">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Fee & Settlement Breakdown</span>
                
                <div className="flex justify-between text-stone-600">
                  <span>Food Subtotal</span>
                  <span className="font-mono font-bold">₹{Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>

                {Number(selectedOrder.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span className="font-mono">-₹{Number(selectedOrder.discountAmount).toFixed(2)}</span>
                  </div>
                )}

                {Number(selectedOrder.deliveryCharge) > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Delivery Charge</span>
                    <span className="font-mono font-bold">₹{Number(selectedOrder.deliveryCharge).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Grab2Go Platform Fee (3%)</span>
                  <span className="font-mono font-bold text-stone-700">₹{Number(selectedOrder.platformFee || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Payment Gateway Fee (2%)</span>
                  <span className="font-mono">₹{Number(selectedOrder.transactionFee || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-amber-700 text-[11px] font-semibold bg-amber-50/50 px-2 py-1 rounded-lg">
                  <span>GST Amount (18% on txn fee)</span>
                  <span className="font-mono font-bold">₹{Number(selectedOrder.gstAmount || selectedOrder.taxAmount || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-[#E50914] text-[11px] font-bold">
                  <span>Grab2Go Total Revenue Retained</span>
                  <span className="font-mono">₹{Number(selectedOrder.platformRetainedAmount || ((selectedOrder.platformFee || 0) + (selectedOrder.transactionFee || 0) + (selectedOrder.gstAmount || selectedOrder.taxAmount || 0))).toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm font-black text-stone-900">
                  <span>Total Paid by Customer</span>
                  <span className="text-base font-black text-[#E50914] font-mono">₹{Number(selectedOrder.totalAmount).toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-dashed border-stone-200 flex justify-between items-center text-xs font-bold text-emerald-700 bg-emerald-50/60 p-2 rounded-xl">
                  <span>Payable to Cafe (Settlement)</span>
                  <span className="font-mono font-black text-emerald-800">₹{Number(selectedOrder.restaurantSettlementAmount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
