'use client';

import { useMutation } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import api from '@/lib/axios';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export function LogoutButton({ className }) {
  const logoutStore = useAdminAuthStore((state) => state.logout);

  const handleLogout = () => {
    logoutStore();
    toast.success('Logged out successfully');
  };

  return (
    <button
      onClick={handleLogout}
      className={cn(
        "flex items-center px-4 py-2 text-sm font-medium text-fahara-text hover:bg-fahara-border/50 hover:text-fahara-primary rounded-lg transition-colors w-full text-left",
        className
      )}
    >
      <LogOut className="w-4 h-4 mr-2 text-fahara-secondary" />
      Logout
    </button>
  );
}
