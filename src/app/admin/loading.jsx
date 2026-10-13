'use client';

import React from 'react';
import { DashboardOverviewSkeleton } from '@/components/common/FaharaLoadingSystem';

export default function AdminLoadingPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <DashboardOverviewSkeleton statCount={4} />
    </div>
  );
}
