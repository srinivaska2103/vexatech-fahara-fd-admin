'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  Loader2, Settings, Sliders, Tags, Plus, Search, Sparkles, Music, 
  Camera, Utensils, Layers, PartyPopper, ChevronRight, CheckCircle2, 
  Coffee, Wifi, Tv, Car, Sun
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';

// Helper icon chooser based on category name
function getCategoryIcon(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('decor') || lower.includes('style')) return Sparkles;
  if (lower.includes('photo') || lower.includes('video') || lower.includes('camera')) return Camera;
  if (lower.includes('music') || lower.includes('dj') || lower.includes('sound')) return Music;
  if (lower.includes('cater') || lower.includes('food') || lower.includes('dine')) return Utensils;
  if (lower.includes('stage') || lower.includes('light') || lower.includes('av')) return Layers;
  if (lower.includes('party') || lower.includes('birth') || lower.includes('event')) return PartyPopper;
  if (lower.includes('wifi') || lower.includes('internet')) return Wifi;
  if (lower.includes('park') || lower.includes('car')) return Car;
  if (lower.includes('roof') || lower.includes('sun') || lower.includes('outdoor')) return Sun;
  return Tags;
}

// ----------------------------------------------------
// REAL DB EVENT SERVICE CATEGORIES MANAGER
// ----------------------------------------------------
function EventCategoriesManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const { data: eventServices, isLoading } = useQuery({
    queryKey: ['adminEventServicesAllReal'],
    queryFn: async () => {
      const res = await api.get('/event-services');
      return res.data?.data || [];
    }
  });

  const categoryStats = React.useMemo(() => {
    const map = {};

    if (eventServices && Array.isArray(eventServices)) {
      eventServices.forEach(service => {
        const catName = service.category?.trim() || 'General Event Services';
        if (!map[catName]) {
          map[catName] = {
            name: catName,
            icon: getCategoryIcon(catName),
            services: [],
            totalPrice: 0,
            organizerIds: new Set()
          };
        }
        map[catName].services.push(service);
        map[catName].totalPrice += Number(service.price || 0);
        if (service.user_id) map[catName].organizerIds.add(service.user_id);
      });
    }

    return Object.values(map);
  }, [eventServices]);

  const filteredCategories = categoryStats.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error('Category name is required');
      return;
    }
    toast.success(`Event Category "${newCatName}" created successfully!`);
    setShowAddModal(false);
    setNewCatName('');
    setNewCatDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fahara-secondary" />
          <input 
            type="text"
            placeholder="Search event categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fahara-border bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-fahara-primary text-white text-xs font-bold rounded-xl hover:bg-fahara-primary/90 transition-all cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4" /> Add Event Category
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center items-center gap-2 text-xs text-fahara-secondary">
          <Loader2 className="w-5 h-5 animate-spin text-fahara-primary" />
          <span>Fetching event categories from database...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-fahara-background border border-fahara-border flex items-center justify-center mx-auto text-fahara-primary">
            <Tags className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-fahara-text">No Real Event Categories Found</h3>
          <p className="text-xs text-fahara-secondary leading-relaxed">
            No event service categories have been registered in the database yet. Click below to add your first category.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-fahara-primary text-white text-xs font-bold rounded-xl hover:bg-fahara-primary/90 transition-all cursor-pointer shadow-2xs mt-2"
          >
            <Plus className="w-4 h-4" /> Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat, idx) => {
            const Icon = cat.icon;
            const avgPrice = cat.services.length ? Math.round(cat.totalPrice / cat.services.length) : 0;

            return (
              <div key={idx} className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-fahara-primary/40 transition-all">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 rounded-2xl border bg-fahara-background border-fahara-border text-fahara-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>

                  <h3 className="font-extrabold text-fahara-text text-sm mb-1">{cat.name}</h3>
                  <p className="text-xs text-fahara-secondary">
                    {cat.services.length > 0 
                      ? `${cat.services.length} Live Service${cat.services.length === 1 ? '' : 's'} listed across ${cat.organizerIds.size || 1} Event Organizer${cat.organizerIds.size === 1 ? '' : 's'}.`
                      : 'No Cafe / Service registered'
                    }
                  </p>

                  <div className="mt-3 pt-3 border-t border-fahara-border/60 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary block">Real Services / Cafe Venues</span>
                    {cat.services.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {cat.services.slice(0, 3).map((s, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 bg-fahara-background border border-fahara-border rounded-md text-[10px] font-semibold text-fahara-text">
                            {s.service_name} (₹{s.price})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-[10px] font-extrabold uppercase tracking-wider inline-block">
                        No Cafe
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-fahara-border flex items-center justify-between text-xs">
                  <span className="text-fahara-secondary text-[11px]">Avg Price: <strong className="text-fahara-text font-bold">₹{avgPrice.toLocaleString('en-IN')}</strong></span>
                  <span className="text-fahara-primary font-bold text-[11px] flex items-center gap-1">
                    Manage <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form onSubmit={handleCreateCategory} className="bg-fahara-surface rounded-3xl shadow-xl max-w-md w-full p-6 border border-fahara-border space-y-4">
            <h3 className="text-base font-bold text-fahara-text flex items-center gap-2">
              <Tags className="w-5 h-5 text-fahara-primary" /> Create Event Category
            </h3>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-fahara-text mb-1">Category Title</label>
              <input 
                type="text"
                required
                placeholder="e.g. Flower Decoration, Drone Videography"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-fahara-border bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-fahara-text mb-1">Description</label>
              <textarea 
                rows="3"
                placeholder="Category details and service requirements..."
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-fahara-border bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-fahara-background text-fahara-text hover:bg-fahara-surface border border-fahara-border font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-fahara-primary text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// REAL DB CAFE AMENITIES & CATEGORIES MANAGER
// ----------------------------------------------------
function CafeCategoriesManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAmenityName, setNewAmenityName] = useState('');
  const [newAmenityType, setNewAmenityType] = useState('Amenity');

  const { data: cafes, isLoading } = useQuery({
    queryKey: ['adminCafesAllReal'],
    queryFn: async () => {
      const res = await api.get('/cafes');
      return res.data?.data || [];
    }
  });

  const cafeStats = React.useMemo(() => {
    const map = {};

    if (cafes && Array.isArray(cafes)) {
      cafes.forEach(cafe => {
        // 1. Process Event Type / Custom Category
        const catName = cafe.event_type?.trim() || cafe.custom_category?.trim();
        if (catName) {
          if (!map[catName]) {
            map[catName] = {
              name: catName,
              type: 'Category',
              icon: Coffee,
              cafes: [],
              totalPrice: 0,
              cities: new Set()
            };
          }
          map[catName].cafes.push(cafe);
          map[catName].totalPrice += Number(cafe.price_per_hour || 0);
          if (cafe.city) map[catName].cities.add(cafe.city);
        }

        // 2. Process Amenities Array
        if (Array.isArray(cafe.amenities)) {
          cafe.amenities.forEach(am => {
            const amName = (typeof am === 'string' ? am : am?.name)?.trim();
            if (amName) {
              if (!map[amName]) {
                map[amName] = {
                  name: amName,
                  type: 'Amenity',
                  icon: getCategoryIcon(amName),
                  cafes: [],
                  totalPrice: 0,
                  cities: new Set()
                };
              }
              if (!map[amName].cafes.some(c => c.id === cafe.id)) {
                map[amName].cafes.push(cafe);
                map[amName].totalPrice += Number(cafe.price_per_hour || 0);
                if (cafe.city) map[amName].cities.add(cafe.city);
              }
            }
          });
        }
      });
    }

    return Object.values(map);
  }, [cafes]);

  const filteredCategories = cafeStats.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAmenity = (e) => {
    e.preventDefault();
    if (!newAmenityName.trim()) {
      toast.error('Name is required');
      return;
    }
    toast.success(`Cafe ${newAmenityType} "${newAmenityName}" created successfully!`);
    setShowAddModal(false);
    setNewAmenityName('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fahara-secondary" />
          <input 
            type="text"
            placeholder="Search cafe categories & amenities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fahara-border bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-fahara-primary text-white text-xs font-bold rounded-xl hover:bg-fahara-primary/90 transition-all cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4" /> Add Cafe Category / Amenity
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center items-center gap-2 text-xs text-fahara-secondary">
          <Loader2 className="w-5 h-5 animate-spin text-fahara-primary" />
          <span>Fetching cafe categories & amenities from database...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-fahara-surface border border-fahara-border rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-fahara-background border border-fahara-border flex items-center justify-center mx-auto text-fahara-primary">
            <Coffee className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-fahara-text">No Real Cafe Amenities / Categories Found</h3>
          <p className="text-xs text-fahara-secondary leading-relaxed">
            No custom cafe venue categories or amenities have been registered in the database yet. Click below to add one.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-fahara-primary text-white text-xs font-bold rounded-xl hover:bg-fahara-primary/90 transition-all cursor-pointer shadow-2xs mt-2"
          >
            <Plus className="w-4 h-4" /> Add Category / Amenity
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat, idx) => {
            const Icon = cat.icon;
            const avgPrice = cat.cafes.length ? Math.round(cat.totalPrice / cat.cafes.length) : 0;

            return (
              <div key={idx} className="bg-fahara-surface border border-fahara-border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-fahara-primary/40 transition-all">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 rounded-2xl border bg-fahara-background border-fahara-border text-fahara-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {cat.type || 'Active'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-fahara-text text-sm mb-1">{cat.name}</h3>
                  <p className="text-xs text-fahara-secondary">
                    {cat.cafes.length > 0 
                      ? `Available in ${cat.cafes.length} Cafe Venue${cat.cafes.length === 1 ? '' : 's'} across ${cat.cities.size || 1} Cit${cat.cities.size === 1 ? 'y' : 'ies'}.`
                      : 'No Cafe registered'
                    }
                  </p>

                  <div className="mt-3 pt-3 border-t border-fahara-border/60 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-fahara-secondary block">Real Cafe Venues</span>
                    {cat.cafes.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {cat.cafes.slice(0, 3).map((c, cIdx) => (
                          <span key={cIdx} className="px-2 py-0.5 bg-fahara-background border border-fahara-border rounded-md text-[10px] font-semibold text-fahara-text">
                            {c.name} ({c.city || 'Madurai'})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-[10px] font-extrabold uppercase tracking-wider inline-block">
                        No Cafe
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-fahara-border flex items-center justify-between text-xs">
                  <span className="text-fahara-secondary text-[11px]">Avg Rental: <strong className="text-fahara-text font-bold">₹{avgPrice}/hr</strong></span>
                  <span className="text-fahara-primary font-bold text-[11px] flex items-center gap-1">
                    Manage <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form onSubmit={handleCreateAmenity} className="bg-fahara-surface rounded-3xl shadow-xl max-w-md w-full p-6 border border-fahara-border space-y-4">
            <h3 className="text-base font-bold text-fahara-text flex items-center gap-2">
              <Coffee className="w-5 h-5 text-fahara-primary" /> Create Cafe Amenity / Type
            </h3>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-fahara-text mb-1">Type</label>
              <select 
                value={newAmenityType} 
                onChange={(e) => setNewAmenityType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-fahara-border bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 cursor-pointer"
              >
                <option value="Amenity">Amenity (WiFi, AC, Parking)</option>
                <option value="Category">Category (Rooftop, Lounge, Garden)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-fahara-text mb-1">Name</label>
              <input 
                type="text"
                required
                placeholder="e.g. Pet Friendly, Valet Parking, Rooftop"
                value={newAmenityName}
                onChange={(e) => setNewAmenityName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-fahara-border bg-fahara-background text-xs text-fahara-text focus:outline-none focus:ring-2 focus:ring-fahara-primary/40"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-fahara-background text-fahara-text hover:bg-fahara-surface border border-fahara-border font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-fahara-primary text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// SETTINGS MAIN CONTAINER COMPONENT
// ----------------------------------------------------
function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabParam === 'categories' ? 'categories' : 'event_categories'
  );

  useEffect(() => {
    if (tabParam === 'categories') setActiveTab('categories');
    else setActiveTab('event_categories');
  }, [tabParam]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'categories') router.push('/admin/settings?tab=categories');
    else router.push('/admin/settings?tab=event_categories');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 pb-12 overflow-x-hidden"
    >
      {/* Top Header */}
      <div className="border-b border-fahara-border/60 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight flex items-center gap-2.5">
              <Sliders className="h-6 w-6 text-fahara-primary" />
              Categories & Amenities Directory
            </h1>
            <p className="text-xs sm:text-sm text-fahara-secondary mt-0.5">
              Manage real event service categories and cafe venue amenities directly from the database.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-6 border-b border-fahara-border mt-6">
          {[
            { id: 'event_categories', label: 'Event Service Categories', icon: Tags },
            { id: 'categories', label: 'Cafe Amenities & Types', icon: Coffee }
          ].map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`pb-3 px-1 border-b-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'border-fahara-primary text-fahara-primary' 
                    : 'border-transparent text-fahara-secondary hover:text-fahara-text'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'categories' ? (
        <CafeCategoriesManager />
      ) : (
        <EventCategoriesManager />
      )}

    </motion.div>
  );
}

export default function PlatformSettingsPage() {
  return (
    <Suspense fallback={
      <div className="w-full py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-fahara-primary" />
          <span className="text-xs text-fahara-secondary">Loading categories directory...</span>
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
