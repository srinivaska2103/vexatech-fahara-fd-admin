'use client';

import { useMutation } from '@tanstack/react-query';
import { MonitorX } from 'lucide-react';
import api from '@/lib/axios';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export function LogoutAllDevicesButton({ className }) {
  const logoutStore = useAdminAuthStore((state) => state.logout);

  const handleLogoutAll = () => {
    logoutStore();
    toast.success('Logged out from all devices successfully');
  };

  return (
    <button
      onClick={() => {
        if (window.confirm('Are you sure you want to log out from all devices? You will be logged out of this session as well.')) {
          handleLogoutAll();
        }
      }}
      className={cn(
        "flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors w-full text-left",
        className
      )}
    >
      <MonitorX className="w-4 h-4 mr-2" />
      Logout All Devices
    </button>
  );
}
