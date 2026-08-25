import { motion } from 'framer-motion';

export const KPICardSkeleton = () => (
  <div className="bg-fahara-surface border border-fahara-border rounded-xl p-5 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="h-4 bg-fahara-border rounded w-1/2"></div>
      <div className="w-10 h-10 rounded-lg bg-fahara-border"></div>
    </div>
    <div className="h-8 bg-fahara-border rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-fahara-border rounded w-1/4"></div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-fahara-surface border border-fahara-border rounded-xl p-6 h-[400px] flex flex-col animate-pulse">
    <div className="h-5 bg-fahara-border rounded w-1/4 mb-6"></div>
    <div className="flex-1 bg-fahara-border rounded-lg w-full"></div>
  </div>
);

export const SectionSkeleton = () => (
  <div className="bg-fahara-surface border border-fahara-border rounded-xl p-6 animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <div className="h-5 bg-fahara-border rounded w-1/4"></div>
      <div className="h-8 bg-fahara-border rounded w-24"></div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex justify-between items-center pb-4 border-b border-fahara-border last:border-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-fahara-border"></div>
            <div>
              <div className="h-4 bg-fahara-border rounded w-32 mb-2"></div>
              <div className="h-3 bg-fahara-border rounded w-24"></div>
            </div>
          </div>
          <div className="h-6 bg-fahara-border rounded w-20"></div>
        </div>
      ))}
    </div>
  </div>
);

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionSkeleton />
        <SectionSkeleton />
      </div>
    </div>
  );
};
