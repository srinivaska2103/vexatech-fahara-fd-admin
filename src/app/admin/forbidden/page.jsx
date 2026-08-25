import Link from 'next/link';
import { ShieldX } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 m-6">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <ShieldX className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h2>
      <p className="text-gray-500 mb-8 max-w-md text-center text-lg">
        You don't have the necessary permissions to access this page. Please contact your administrator if you believe this is a mistake.
      </p>
      
      <Link
        href="/admin/dashboard"
        className="flex items-center justify-center px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
