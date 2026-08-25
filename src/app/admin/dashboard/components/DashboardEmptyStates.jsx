import { AlertCircle, Inbox } from 'lucide-react';

export const DashboardErrorState = ({ message = "Failed to load dashboard data. Please try again later." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50/50 border border-red-100 rounded-xl p-8 text-center">
      <div className="bg-red-100 p-4 rounded-full mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
      <p className="text-red-700 max-w-md">{message}</p>
    </div>
  );
};

export const EmptyState = ({ icon: Icon = Inbox, title = "No data available", description = "There is no data to display for this section." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-fahara-background p-4 rounded-full mb-4">
        <Icon className="w-8 h-8 text-fahara-secondary" />
      </div>
      <h4 className="text-base font-semibold text-fahara-text mb-1">{title}</h4>
      <p className="text-sm text-fahara-secondary">{description}</p>
    </div>
  );
};
