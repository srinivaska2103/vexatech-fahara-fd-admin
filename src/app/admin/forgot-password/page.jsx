'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Mail, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPassword() {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const forgotMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/auth/forgot-password', data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success('If an account exists, a reset OTP has been sent.');
      const identifier = data?.userId || data?.user?.id || variables.email;
      localStorage.setItem('adminResetEmail', identifier);
      router.push('/admin/reset-password');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to process request. Please try again.');
    },
  });

  const onSubmit = (data) => {
    forgotMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-fahara-background p-4 relative overflow-hidden">
      {/* Background Decorative Blur Spheres */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-fahara-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-fahara-accent/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-fahara-surface rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-fahara-border/80 p-8 sm:p-10 relative z-10"
      >
        <button 
          onClick={() => router.push('/admin/login')}
          className="inline-flex items-center text-xs font-medium text-fahara-secondary hover:text-fahara-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Login
        </button>

        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-2xl border-2 border-fahara-border bg-fahara-surface shadow-md p-0.5">
            <img 
              src="/Fahara Logo.jpeg" 
              alt="Fahara Logo" 
              className="h-full w-full object-cover rounded-xl"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-fahara-text tracking-tight">Forgot Password?</h1>
          <p className="text-xs text-fahara-secondary mt-1.5 leading-relaxed">
            Enter your registered admin email address and we will send you an OTP to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-fahara-text uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-fahara-secondary" />
              </div>
              <input
                {...register('email')}
                type="email"
                disabled={forgotMutation.isPending}
                className={`block w-full pl-10 pr-4 py-3 text-sm border ${errors.email ? 'border-red-500' : 'border-fahara-border'} rounded-xl bg-fahara-background focus:outline-none focus:ring-2 focus:ring-fahara-primary/40 focus:border-fahara-primary transition-all text-fahara-text placeholder:text-fahara-secondary/50`}
                placeholder="admin@fahara.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={forgotMutation.isPending}
            className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-white bg-fahara-primary hover:bg-fahara-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fahara-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed font-semibold text-sm cursor-pointer"
          >
            {forgotMutation.isPending ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              'Send Reset OTP'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
