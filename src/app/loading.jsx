'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Coffee, Sparkles, CheckCircle2 } from 'lucide-react';

const LOADING_STEPS = [
  'Initializing Fahara Admin Suite...',
  'Connecting to Backend API...',
  'Loading Live Merchant Analytics...',
  'Verifying Razorpay PG Integration...',
  'Securing Admin Session...'
];

export default function LoadingPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 250);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-fahara-background text-fahara-text select-none overflow-hidden p-6">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-fahara-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Loading Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative max-w-sm w-full bg-fahara-surface/90 border border-fahara-border rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-6"
      >
        {/* Pulsing Logo Badge */}
        <div className="relative">
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-fahara-primary/30 to-amber-500/30 blur-md animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-fahara-primary bg-fahara-surface shadow-md flex items-center justify-center">
            <img 
              src="/Fahara Logo.jpeg" 
              alt="Fahara Brand Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Brand Title */}
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-fahara-text flex items-center justify-center gap-2">
            Fahara Admin Suite
            <Sparkles className="w-4 h-4 text-fahara-primary" />
          </h2>
          <p className="text-xs text-fahara-secondary font-medium">Enterprise Cafe & Event Management</p>
        </div>

        {/* Interactive Progress Meter */}
        <div className="w-full space-y-2.5">
          <div className="flex justify-between items-center text-xs font-bold px-1">
            <span className="text-fahara-primary text-[11px] font-mono flex items-center gap-1.5 truncate max-w-[210px]">
              <Coffee className="w-3.5 h-3.5 animate-bounce shrink-0" />
              <span className="truncate">{LOADING_STEPS[currentStepIndex]}</span>
            </span>
            <span className="text-fahara-text font-extrabold font-mono">{progress}%</span>
          </div>

          {/* Progress Track Bar */}
          <div className="w-full h-2.5 bg-fahara-background rounded-full border border-fahara-border overflow-hidden p-0.5">
            <motion.div 
              className="h-full bg-gradient-to-r from-fahara-primary to-amber-600 rounded-full"
              initial={{ width: '15%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.3 }}
            />
          </div>
        </div>

        {/* Live System Indicators */}
        <div className="pt-2 border-t border-fahara-border/60 w-full flex items-center justify-center gap-3 text-[10px] font-bold text-fahara-secondary">
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> API Connected
          </span>
          <span className="flex items-center gap-1 bg-fahara-primary/10 text-fahara-primary border border-fahara-primary/20 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3 h-3 text-fahara-primary" /> SSL Encrypted
          </span>
        </div>
      </motion.div>
    </div>
  );
}
