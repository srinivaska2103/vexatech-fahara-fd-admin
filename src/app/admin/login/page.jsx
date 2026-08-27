'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Mail, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .transform((val) => val.trim().toLowerCase())
    .pipe(z.string().email('Please enter a valid email address')),
  rememberMe: z.boolean().optional(),
});

export default function AdminLogin() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      rememberMe: false,
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      try {
        const { data } = await api.post('/auth/admin/send-otp', {
          email: credentials.email,
          expectedRole: 'ADMIN'
        });
        return data;
      } catch (err) {
        // Fallback fetch call if axios interceptor or credentials fail
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/auth/admin/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: credentials.email, expectedRole: 'ADMIN' })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to send OTP. Please check your admin email address.');
        }
        return data;
      }
    },
    onSuccess: (data, variables) => {
      toast.success(data.message || 'OTP sent to your admin email address.');
      localStorage.setItem('adminAuthEmail', data.email || variables.email);
      localStorage.setItem('adminAuthFrom', 'login');
      setIsRedirecting(true);
      router.push('/admin/verify-otp');
    },
    onError: (error) => {
      console.error('Admin send-otp error:', error);
      toast.error(error.response?.data?.message || error?.message || 'Failed to send OTP. Please check your admin email address.');
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate({
      email: data.email ? data.email.trim().toLowerCase() : '',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-fahara-background p-4 relative overflow-hidden">
      {/* Background Decorative Blur Spheres */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-fahara-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-fahara-accent/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-fahara-surface rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-fahara-border/80 p-8 sm:p-10 relative z-10"
      >
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-2xl border-2 border-fahara-border bg-fahara-surface shadow-md p-0.5">
            <img
              src="/Fahara Logo.jpeg"
              alt="Fahara Logo"
              className="h-full w-full object-cover rounded-xl"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fahara-primary/10 border border-fahara-primary/20 text-fahara-primary text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Management</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight">Fahara Admin</h1>
          <p className="text-sm text-fahara-secondary mt-1">Enter your email to receive an OTP</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" suppressHydrationWarning>
          <div>
            <label className="block text-xs font-semibold text-fahara-text uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-fahara-secondary" />
              </div>
              <input
                {...register('email')}
                type="email"
                suppressHydrationWarning
                disabled={loginMutation.isPending || isRedirecting}
                className={`block w-full pl-10 pr-4 py-3 text-sm border ${errors.email ? 'border-red-500' : 'border-fahara-border'} rounded-xl bg-fahara-background focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all text-fahara-text placeholder:text-fahara-secondary/50`}
                placeholder="admin@fahara.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              {...register('rememberMe')}
              id="rememberMe"
              type="checkbox"
              className="h-4 w-4 text-fahara-primary focus:ring-fahara-primary border-fahara-border rounded bg-fahara-background accent-fahara-primary cursor-pointer"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-xs text-fahara-text cursor-pointer">
              Remember me on this device
            </label>
          </div>

          <button
            type="submit"
            suppressHydrationWarning
            disabled={loginMutation.isPending || isRedirecting}
            className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-white bg-fahara-primary hover:bg-fahara-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fahara-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed font-semibold text-sm cursor-pointer"
          >
            {loginMutation.isPending || isRedirecting ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : (
              <>
                Send Verification OTP
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
