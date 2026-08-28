'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { KeyRound, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import Cookies from 'js-cookie';
import { useAdminAuthStore } from '@/store/adminAuthStore';

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

export default function VerifyOtp() {
  const router = useRouter();
  const setUser = useAdminAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [from, setFrom] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('adminAuthEmail');
    const storedFrom = localStorage.getItem('adminAuthFrom');
    if (!storedEmail) {
      toast.error('Session expired. Please login again.');
      router.push('/admin/login');
    } else {
      setEmail(storedEmail);
      if (storedFrom) setFrom(storedFrom);
    }
  }, [router]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' }
  });

  const verifyMutation = useMutation({
    mutationFn: async (data) => {
      const tempToken = Cookies.get('adminTempToken');
      const currentEmail = email || (typeof window !== 'undefined' ? localStorage.getItem('adminAuthEmail') : '');
      const payload = { email: currentEmail, otp: String(data.otp).trim() };
      if (tempToken) payload.tempToken = tempToken;

      const response = await api.post('/auth/admin/verify-login', payload);
      return response.data;
    },
    onSuccess: (data) => {
      const userRole = data.user?.role || data.role;
      if (userRole && userRole !== 'ADMIN') {
        toast.error('Unauthorized access. Admin privileges required.');
        Cookies.remove('adminTempToken');
        router.push('/admin/login');
        return;
      }

      if (data.accessToken) {
        Cookies.set('adminAccessToken', data.accessToken, { path: '/', expires: 7, sameSite: 'lax' });
      }
      if (data.refreshToken) {
        Cookies.set('adminRefreshToken', data.refreshToken, { path: '/', expires: 30, sameSite: 'lax' });
      }
      
      Cookies.remove('adminTempToken');
      localStorage.removeItem('adminAuthEmail');
      localStorage.removeItem('adminAuthFrom');

      if (data.user) {
        setUser(data.user);
      }
      toast.success('Successfully authenticated');
      router.push('/admin/dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    },
  });

  const onSubmit = (data) => {
    verifyMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-fahara-background p-4 relative overflow-hidden">
      {/* Background Decorative Blur Spheres */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-fahara-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-fahara-accent/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-fahara-surface rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-fahara-border/80 p-8 sm:p-10 relative z-10 text-center"
      >
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-2xl border-2 border-fahara-border bg-fahara-surface shadow-md p-0.5">
            <img 
              src="/Fahara Logo.jpeg" 
              alt="Fahara Logo" 
              className="h-full w-full object-cover rounded-xl"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight">Two-Factor Auth</h1>
          <p className="text-xs text-fahara-secondary mt-1.5 leading-relaxed">
            We've sent a 6-digit verification code to <br />
            <span className="font-semibold text-fahara-text">{email || 'your email'}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
          <div>
            <label className="block text-xs font-semibold text-fahara-text uppercase tracking-wider mb-2 text-center">
              Enter 6-Digit OTP
            </label>
            <input
              {...register('otp')}
              type="text"
              maxLength={6}
              disabled={verifyMutation.isPending}
              className={`block w-full text-center text-2xl font-bold tracking-[0.4em] py-3.5 border ${errors.otp ? 'border-red-500' : 'border-fahara-border'} rounded-xl bg-fahara-background focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all text-fahara-text placeholder:text-fahara-secondary/30`}
              placeholder="••••••"
            />
            {errors.otp && (
              <p className="mt-1.5 text-xs text-red-500 text-center">{errors.otp.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={verifyMutation.isPending}
            className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-white bg-fahara-primary hover:bg-fahara-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fahara-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed font-semibold text-sm cursor-pointer"
          >
            {verifyMutation.isPending ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : (
              <>
                Verify and Proceed
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 border-t border-fahara-border pt-4">
          <button 
            onClick={() => router.push('/admin/login')}
            className="text-xs font-medium text-fahara-secondary hover:text-fahara-primary transition-colors"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
