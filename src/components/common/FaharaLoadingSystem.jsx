'use client';

import React from 'react';

/**
 * Fahara Skeleton Base with brand cream/amber tones
 */
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden bg-[#EADBCE]/50 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[#FFFDFB]/70 before:to-transparent rounded-xl ${className}`}
      {...props}
    />
  );
}

/**
 * Metric/Stat Card Skeleton (for Admin dashboard)
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#E8DED5] shadow-2xs flex flex-col justify-between h-32 select-none">
      <div className="flex justify-between items-start">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-6 w-32 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Dashboard Overview Skeleton
 */
export function DashboardOverviewSkeleton({ statCount = 4 }) {
  return (
    <div className="space-y-6 select-none" aria-busy="true">
      <div className="p-6 rounded-3xl bg-white border border-[#E8DED5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: statCount }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-[#E8DED5] space-y-4 min-h-[320px]">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
        <div className="p-6 rounded-3xl bg-white border border-[#E8DED5] space-y-4 min-h-[320px]">
          <Skeleton className="h-5 w-32 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-3 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="w-full bg-white rounded-3xl border border-[#E8DED5] overflow-hidden select-none" aria-busy="true">
      <div className="bg-[#FFF8F0] border-b border-[#E8DED5] px-6 py-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded" />
        ))}
      </div>
      <div className="divide-y divide-[#F2EAE1]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-6 py-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Reusable Form Submit Button with Spinner
 */
export function FormSubmitButton({
  isLoading = false,
  loadingText = 'Processing...',
  children,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`relative inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 ${className}`}
      {...props}
    >
      {isLoading && (
        <svg 
          className="w-4 h-4 animate-spin shrink-0 text-current" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
        >
          <circle cx="12" cy="12" r="10" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" className="opacity-75" />
        </svg>
      )}
      <span>{isLoading ? loadingText : children}</span>
    </button>
  );
}

export default {
  Skeleton,
  StatCardSkeleton,
  DashboardOverviewSkeleton,
  TableSkeleton,
  FormSubmitButton,
};
