'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { 
  Sparkles, Plus, Eye, Edit3, Power, RefreshCw, AlertTriangle, 
  CheckCircle2, X, ChevronRight, Check
} from 'lucide-react';
import { format } from 'date-fns';

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    targetPartner: 'CAFE',
    price: 1,
    billingCycle: 'MONTHLY',
    description: '',
    features: ['Manage Business Profile', 'Receive Bookings & Requests']
  });

  const [featureInput, setFeatureInput] = useState('');

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/subscriptions/plans');
      setPlans(res.data?.data || []);
    } catch (err) {
      console.error('Fetch Plans Error:', err);
      setError(err.response?.data?.message || 'Failed to fetch subscription plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      await api.post('/admin/subscriptions/plans', formData);
      setMsg({ type: 'success', fontText: 'Subscription plan created successfully!' });
      setShowCreateModal(false);
      fetchPlans();
    } catch (err) {
      setMsg({ type: 'error', fontText: err.response?.data?.message || 'Failed to create plan.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPlan = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setSubmitting(true);
    setMsg(null);
    try {
      await api.patch(`/admin/subscriptions/plans/${selectedPlan.id}`, {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        features: formData.features
      });
      setMsg({ type: 'success', fontText: 'Plan updated successfully!' });
      setShowEditModal(false);
      fetchPlans();
    } catch (err) {
      setMsg({ type: 'error', fontText: err.response?.data?.message || 'Failed to update plan.' });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmToggleStatus = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    setMsg(null);
    const nextStatus = !selectedPlan.isActive;
    try {
      await api.patch(`/admin/subscriptions/plans/${selectedPlan.id}/status`, { isActive: nextStatus });
      setMsg({ 
        type: 'success', 
        fontText: `Plan ${nextStatus ? 'activated' : 'deactivated'} successfully!` 
      });
      setShowToggleModal(false);
      fetchPlans();
    } catch (err) {
      setMsg({ type: 'error', fontText: err.response?.data?.message || 'Failed to update plan status.' });
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      name: 'Fahara Partner',
      targetPartner: 'CAFE',
      price: 1,
      billingCycle: 'MONTHLY',
      description: 'Standard monthly subscription plan for partners.',
      features: ['Manage business profile', 'Manage services & packages', 'Receive bookings', 'Access analytics']
    });
    setShowCreateModal(true);
  };

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      targetPartner: plan.targetPartner,
      price: plan.price,
      billingCycle: plan.billingCycle,
      description: plan.description,
      features: Array.isArray(plan.features) ? plan.features : []
    });
    setShowEditModal(true);
  };

  const openToggleModal = (plan) => {
    setSelectedPlan(plan);
    setShowToggleModal(true);
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, featureInput.trim()]
    }));
    setFeatureInput('');
  };

  const removeFeature = (idx) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DED5] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#6F4E37] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-600" /> Subscription Plans Configuration
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2C1810]">Subscription Plans</h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">Manage pricing tiers, target partner models, and Razorpay subscription plans.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPlans}
            className="p-2.5 rounded-2xl bg-white border border-[#E8DED5] text-stone-700 hover:text-[#2C1810] transition-colors cursor-pointer"
            title="Refresh Plans"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6F4E37]' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-2xl bg-[#6F4E37] hover:bg-[#593E2B] text-white text-xs font-black shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 shadow-xs ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{msg.fontText}</span>
          </div>
          <button onClick={() => setMsg(null)} className="text-stone-400 hover:text-stone-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Plans Professional Table */}
      <div className="bg-white rounded-3xl border border-[#E8DED5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF8F0] border-b border-[#E8DED5] text-[10px] font-black uppercase text-stone-500 tracking-wider">
              <tr>
                <th className="py-4 px-5">Plan Name</th>
                <th className="py-4 px-5">Target Partner</th>
                <th className="py-4 px-5">Price</th>
                <th className="py-4 px-5">Billing Cycle</th>
                <th className="py-4 px-5">Subscribers</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Created Date</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-semibold text-[#2C1810]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-stone-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#6F4E37]" />
                    <span>Loading subscription plans...</span>
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-stone-400">
                    <p className="font-extrabold text-stone-600 mb-1">No subscription plans configured.</p>
                    <button onClick={openCreateModal} className="mt-2 px-4 py-2 bg-[#6F4E37] text-white text-xs font-bold rounded-xl">
                      Create First Plan
                    </button>
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-[#FFF8F0]/50 transition-colors">
                    <td className="py-4 px-5 font-black text-[#2C1810]">
                      <Link href={`/admin/subscriptions/plans/${plan.id}`} className="hover:text-[#6F4E37] transition-colors">
                        {plan.name}
                      </Link>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[10px] font-extrabold uppercase border border-stone-200">
                        {plan.targetPartner}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-black text-[#6F4E37]">
                      ₹{plan.price} <span className="text-[10px] font-bold text-stone-400">/ mo</span>
                    </td>
                    <td className="py-4 px-5 font-bold text-stone-600">{plan.billingCycle}</td>
                    <td className="py-4 px-5 font-bold">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {plan.subscribers} subscribers
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                        plan.isActive ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-stone-100 text-stone-500 border-stone-300'
                      }`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-stone-500 font-medium">
                      {plan.createdAt ? format(new Date(plan.createdAt), 'dd MMM yyyy') : 'N/A'}
                    </td>
                    <td className="py-4 px-5 text-right space-x-2">
                      <Link
                        href={`/admin/subscriptions/plans/${plan.id}`}
                        className="p-1.5 rounded-xl bg-stone-100 hover:bg-[#FFF8F0] text-stone-700 hover:text-[#6F4E37] inline-block transition-colors"
                        title="View Plan Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => openEditModal(plan)}
                        className="p-1.5 rounded-xl bg-stone-100 hover:bg-amber-50 text-stone-700 hover:text-amber-800 inline-block transition-colors cursor-pointer"
                        title="Edit Plan"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openToggleModal(plan)}
                        className={`p-1.5 rounded-xl inline-block transition-colors cursor-pointer ${
                          plan.isActive ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={plan.isActive ? 'Deactivate Plan' : 'Activate Plan'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PLAN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl border border-[#E8DED5]">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="text-lg font-black text-[#2C1810]">Create Subscription Plan</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs font-bold text-[#2C1810]">
              <div>
                <label className="block mb-1 text-stone-600">Plan Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[#E8DED5] focus:outline-none focus:border-[#6F4E37]"
                  placeholder="e.g. Fahara Partner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-stone-600">Target Partner</label>
                  <select
                    value={formData.targetPartner}
                    onChange={(e) => setFormData({ ...formData, targetPartner: e.target.value })}
                    className="w-full p-3 rounded-2xl border border-[#E8DED5] focus:outline-none focus:border-[#6F4E37] bg-white"
                  >
                    <option value="CAFE">Cafe Owner</option>
                    <option value="RESTAURANT">Restaurant Owner</option>
                    <option value="EVENT_MANAGER">Event Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-stone-600">Price (INR)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-3 rounded-2xl border border-[#E8DED5] focus:outline-none focus:border-[#6F4E37]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-stone-600">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[#E8DED5] focus:outline-none focus:border-[#6F4E37]"
                  placeholder="Brief description of partner plan..."
                />
              </div>

              <div>
                <label className="block mb-1 text-stone-600">Included Features</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-[#E8DED5]"
                    placeholder="Add feature item..."
                  />
                  <button type="button" onClick={addFeature} className="px-4 py-2.5 rounded-xl bg-[#6F4E37] text-white font-bold">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {formData.features.map((feat, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[10px] flex items-center gap-1 border border-stone-200">
                      {feat}
                      <button type="button" onClick={() => removeFeature(i)} className="text-rose-500 font-bold ml-1">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#6F4E37] hover:bg-[#593E2B] text-white font-black shadow-md"
                >
                  {submitting ? 'Creating Plan...' : 'Create & Sync Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      {showEditModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl border border-[#E8DED5]">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="text-lg font-black text-[#2C1810]">Edit Subscription Plan</h3>
              <button onClick={() => setShowEditModal(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditPlan} className="space-y-4 text-xs font-bold text-[#2C1810]">
              <div>
                <label className="block mb-1 text-stone-600">Plan Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[#E8DED5] focus:outline-none focus:border-[#6F4E37]"
                />
              </div>

              <div>
                <label className="block mb-1 text-stone-600">Price (INR)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[#E8DED5] focus:outline-none focus:border-[#6F4E37]"
                />
              </div>

              <div>
                <label className="block mb-1 text-stone-600">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[#E8DED5] focus:outline-none focus:border-[#6F4E37]"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#6F4E37] hover:bg-[#593E2B] text-white font-black shadow-md"
                >
                  {submitting ? 'Updating...' : 'Save Plan Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOGGLE / DEACTIVATE CONFIRMATION MODAL */}
      {showToggleModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-[#E8DED5]">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                selectedPlan.isActive ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-emerald-100 text-emerald-700 border-emerald-300'
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#2C1810]">
                  {selectedPlan.isActive ? 'Deactivate this subscription plan?' : 'Activate this subscription plan?'}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  {selectedPlan.isActive 
                    ? 'This will prevent new partners from subscribing to this plan. Existing active subscriptions will not be automatically cancelled.'
                    : 'This will allow new partners to subscribe to this plan immediately.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowToggleModal(false)}
                className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmToggleStatus}
                disabled={submitting}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-black shadow-md ${
                  selectedPlan.isActive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {submitting ? 'Updating...' : (selectedPlan.isActive ? 'Deactivate Plan' : 'Activate Plan')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
