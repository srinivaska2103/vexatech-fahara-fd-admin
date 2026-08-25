'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Lock, Loader2, CheckCircle2, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { Suspense, useState, useEffect } from 'react';

const resetPasswordSchema = z.object({
  otp: z.string().min(6, 'OTP must be at least 6 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('adminResetEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      toast.error('Email not found. Please start the password reset process again.');
      router.push('/admin/forgot-password');
    }
  }, [router]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: '', password: '', confirmPassword: '' }
  });

  const resetMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/auth/reset-password', {
        email,
        otp: data.otp,
        newPassword: data.password,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password successfully reset. You can now login.');
      router.push('/admin/login');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reset password. Link or OTP may be invalid.');
    },
  });

  const onSubmit = (data) => {
    if (!email) {
      toast.error('Invalid email.');
      return;
    }
    resetMutation.mutate(data);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md bg-fahara-surface rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-fahara-border/80 p-8 sm:p-10 relative z-10"
    >
      {/* Logo & Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-2xl border-2 border-fahara-border bg-fahara-surface shadow-md p-0.5">
          <img 
            src="/Fahara Logo.jpeg" 
            alt="Fahara Logo" 
            className="h-full w-full object-cover rounded-xl"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight">Create New Password</h1>
        <p className="text-xs text-fahara-secondary mt-1.5 leading-relaxed">
          Enter the OTP sent to your email and your new password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-fahara-text uppercase tracking-wider mb-2">Verification OTP</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <KeyRound className="h-4 w-4 text-fahara-secondary" />
            </div>
            <input
              {...register('otp')}
              type="text"
              disabled={resetMutation.isPending}
              className={`block w-full pl-10 pr-4 py-3 text-sm border ${errors.otp ? 'border-red-500' : 'border-fahara-border'} rounded-xl bg-fahara-background focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all text-fahara-text placeholder:text-fahara-secondary/50`}
              placeholder="••••••"
            />
          </div>
          {errors.otp && (
            <p className="mt-1.5 text-xs text-red-500">{errors.otp.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-fahara-text uppercase tracking-wider mb-2">New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-fahara-secondary" />
            </div>
            <input
              {...register('password')}
              type="password"
              disabled={resetMutation.isPending}
              className={`block w-full pl-10 pr-4 py-3 text-sm border ${errors.password ? 'border-red-500' : 'border-fahara-border'} rounded-xl bg-fahara-background focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all text-fahara-text placeholder:text-fahara-secondary/50`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-fahara-text uppercase tracking-wider mb-2">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <CheckCircle2 className="h-4 w-4 text-fahara-secondary" />
            </div>
            <input
              {...register('confirmPassword')}
              type="password"
              disabled={resetMutation.isPending}
              className={`block w-full pl-10 pr-4 py-3 text-sm border ${errors.confirmPassword ? 'border-red-500' : 'border-fahara-border'} rounded-xl bg-fahara-background focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all text-fahara-text placeholder:text-fahara-secondary/50`}
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={resetMutation.isPending}
          className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-white bg-fahara-primary hover:bg-fahara-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fahara-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed font-semibold text-sm cursor-pointer"
        >
          {resetMutation.isPending ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </motion.div>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-fahara-background p-4 relative overflow-hidden">
      {/* Background Decorative Blur Spheres */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-fahara-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-fahara-accent/20 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-fahara-primary" /></div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
