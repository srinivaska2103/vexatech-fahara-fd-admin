'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAdminAuthStore } from '@/store/adminAuthStore';

export default function SessionExpiredModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const logout = useAdminAuthStore(state => state.logout);

  useEffect(() => {
    const handleSessionExpiry = () => {
      setIsOpen(true);
    };

    window.addEventListener('sessionExpired', handleSessionExpiry);
    return () => window.removeEventListener('sessionExpired', handleSessionExpiry);
  }, []);

  const handleLogin = () => {
    setIsOpen(false);
    logout();
    router.push('/admin/login');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8 text-amber-600" aria-hidden="true" />
          </div>
          <h3 id="modal-title" className="text-xl font-bold text-gray-900 mb-2">Session Expired</h3>
          <p className="text-gray-500 mb-6">
            For your security, you have been logged out due to inactivity or an expired session. Please log in again to continue.
          </p>
          <button
            onClick={handleLogin}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Log In Again
          </button>
        </div>
      </div>
    </div>
  );
}
