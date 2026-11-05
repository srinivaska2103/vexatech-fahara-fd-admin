'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';

/**
 * Grab2GO Premium Animated Food Loading Screen
 * Exactly matches the reference design:
 * - Pure white background with subtle warm peach curved background shapes
 * - Animated red chef hat with gentle bounce
 * - Metallic serving cloche lifting & lowering smoothly
 * - Delicious food platter revealed: burger, golden fries, red drink with straw
 * - Rising steam animations
 * - Sparks / accent marks floating outward
 * - Official Grab2GO logo with chef hat mark
 * - "Loading your food experience..." typography
 * - Smooth striped red animated indeterminate progress bar
 * - Graceful timeout error handling with Retry CTA
 */
export default function FoodLoadingScreen({
  message = "Loading your food experience...",
  fullScreen = true,
  timeoutMs = 15000,
  onRetry = null,
  showRetryAfterMs = 10000,
  className = ""
}) {
  const [showRetry, setShowRetry] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    const retryTimer = setTimeout(() => {
      setShowRetry(true);
    }, showRetryAfterMs);

    const timeoutTimer = setTimeout(() => {
      setHasTimedOut(true);
    }, timeoutMs);

    return () => {
      clearTimeout(retryTimer);
      clearTimeout(timeoutTimer);
    };
  }, [showRetryAfterMs, timeoutMs]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div
      className={`relative overflow-hidden font-sans select-none flex flex-col items-center justify-center bg-white text-[#252525] ${
        fullScreen ? 'fixed inset-0 z-[9999] min-h-screen w-screen' : 'w-full py-16 min-h-[460px] rounded-3xl'
      } ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {/* ── SUBTLE PEACH DECORATIVE CURVES (Matches Reference Corners) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-Left Peach Ribbon Wave */}
        <svg
          className="absolute -top-12 -left-12 w-72 sm:w-96 h-72 sm:h-96 opacity-60 text-[#FEE9E4]"
          viewBox="0 0 350 350"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M -20,160 C 60,180 110,130 150,90 C 200,40 260,30 350,-20 L -20,-20 Z"
            fill="currentColor"
          />
          <path
            d="M -20,220 C 80,240 140,170 190,120 C 250,60 310,40 370,-10"
            stroke="#FEDCD4"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>

        {/* Bottom-Right Peach Ribbon Wave */}
        <svg
          className="absolute -bottom-16 -right-16 w-80 sm:w-[420px] h-80 sm:h-[420px] opacity-60 text-[#FEE9E4]"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 420,180 C 320,200 270,260 220,310 C 160,370 100,380 -20,420 L 420,420 Z"
            fill="currentColor"
          />
          <path
            d="M 420,130 C 300,160 240,240 180,310 C 120,380 60,390 -30,420"
            stroke="#FEDCD4"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.45"
          />
        </svg>

        {/* Subtle radial center glow behind illustration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#FFF5F5] via-[#FEE8E2]/40 to-transparent blur-3xl pointer-events-none" />
      </div>

      {/* ── MAIN ANIMATED FOOD ILLUSTRATION CONTAINER ── */}
      <div className="relative z-10 flex flex-col items-center max-w-sm sm:max-w-md px-6 text-center">
        
        {/* Illustration Canvas (320px x 240px) */}
        <div className="relative w-64 h-56 sm:w-72 sm:h-60 flex items-center justify-center">
          
          {/* Circular soft peach ambient badge behind food (Matches reference) */}
          <div className="absolute w-48 h-48 sm:w-52 sm:h-52 rounded-full bg-[#FCECE8]/60 -z-10" />

          {/* Accent Sparks / Bursts around cloche (left and right) */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Left sparks */}
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-2 top-28 flex flex-col items-start gap-1.5 text-[#E50914]"
            >
              <div className="w-4 h-1 rounded-full bg-[#E50914] -rotate-30 origin-right" />
              <div className="w-5 h-1 rounded-full bg-[#E50914] rotate-0" />
              <div className="w-3.5 h-1 rounded-full bg-[#E50914] rotate-30 origin-right" />
            </motion.div>

            {/* Right sparks */}
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              className="absolute right-2 top-28 flex flex-col items-end gap-1.5 text-[#E50914]"
            >
              <div className="w-4 h-1 rounded-full bg-[#E50914] rotate-30 origin-left" />
              <div className="w-5 h-1 rounded-full bg-[#E50914] rotate-0" />
              <div className="w-3.5 h-1 rounded-full bg-[#E50914] -rotate-30 origin-left" />
            </motion.div>
          </div>

          {/* SVG Illustration Assembly */}
          <svg
            viewBox="0 0 300 260"
            className="w-full h-full drop-shadow-md overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Metallic Cloche Dome Gradient */}
              <linearGradient id="clocheMetal" x1="60" y1="50" x2="240" y2="160" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="25%" stopColor="#E2E8F0" />
                <stop offset="50%" stopColor="#CBD5E1" />
                <stop offset="75%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>

              {/* Cloche Inner Rim Shadow */}
              <linearGradient id="clocheInner" x1="150" y1="120" x2="150" y2="155" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1E293B" />
              </linearGradient>

              {/* Serving Platter Ceramic Gradient */}
              <linearGradient id="plateGrad" x1="150" y1="180" x2="150" y2="215" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>

              {/* Burger Bun Golden Gradient */}
              <linearGradient id="burgerBun" x1="150" y1="140" x2="150" y2="165" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>

              {/* Burger Patty Gradient */}
              <linearGradient id="pattyGrad" x1="150" y1="168" x2="150" y2="178" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#78350F" />
                <stop offset="100%" stopColor="#451A03" />
              </linearGradient>

              {/* Red Drink Cup Gradient */}
              <linearGradient id="drinkGrad" x1="210" y1="150" x2="230" y2="190" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="70%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#B91C1C" />
              </linearGradient>

              {/* Golden Fries Packet */}
              <linearGradient id="friesPouch" x1="85" y1="155" x2="105" y2="190" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#B91C1C" />
              </linearGradient>
            </defs>

            {/* ── BASE: SERVING PLATTER TRAY ── */}
            <g id="platter">
              {/* Platter Shadow */}
              <ellipse cx="150" cy="202" rx="88" ry="10" fill="#E2E8F0" opacity="0.8" />
              {/* Platter Body */}
              <ellipse cx="150" cy="198" rx="84" ry="9" fill="url(#plateGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
              <ellipse cx="150" cy="196" rx="72" ry="6.5" fill="#FFFFFF" />
            </g>

            {/* ── FOOD ITEMS (REVEALED ON PLATTER) ── */}
            <g id="foodPlatter">
              {/* 1. GOLDEN CRISPY FRIES (Left) */}
              <g id="fries">
                {/* Fries Sticks */}
                <rect x="80" y="142" width="4.5" height="22" rx="2" fill="#FBBF24" transform="rotate(-12 80 142)" />
                <rect x="88" y="137" width="5" height="26" rx="2" fill="#F59E0B" transform="rotate(-4 88 137)" />
                <rect x="96" y="136" width="5" height="27" rx="2" fill="#FBBF24" transform="rotate(3 96 136)" />
                <rect x="103" y="140" width="4.5" height="23" rx="2" fill="#F59E0B" transform="rotate(10 103 140)" />
                <rect x="91" y="140" width="4.5" height="24" rx="2" fill="#FDE68A" />
                {/* Red Fries Pouch */}
                <path
                  d="M 76,160 L 112,160 L 108,194 L 80,194 Z"
                  fill="url(#friesPouch)"
                  stroke="#991B1B"
                  strokeWidth="1"
                />
                {/* Fries Pouch Arch */}
                <path d="M 83,160 Q 94,166 105,160" stroke="#FBBF24" strokeWidth="2" fill="none" />
              </g>

              {/* 2. JUICY BURGER (Center) */}
              <g id="burger">
                {/* Bottom Bun */}
                <path d="M 124,188 C 124,184 128,182 150,182 C 172,182 176,184 176,188 L 124,188 Z" fill="#D97706" />
                {/* Patty */}
                <rect x="122" y="176" width="56" height="7" rx="3.5" fill="url(#pattyGrad)" />
                {/* Melted Cheese (with little drips) */}
                <path
                  d="M 121,174 L 179,174 L 175,178 L 163,181 L 157,177 L 145,182 L 138,177 L 125,179 Z"
                  fill="#FBBF24"
                />
                {/* Fresh Lettuce Frills */}
                <path
                  d="M 120,172 C 124,169 130,174 135,171 C 140,174 148,169 155,172 C 162,169 168,174 174,171 C 177,173 180,171 180,172"
                  stroke="#22C55E"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Top Bun Dome */}
                <path
                  d="M 123,168 C 123,150 135,143 150,143 C 165,143 177,150 177,168 Z"
                  fill="url(#burgerBun)"
                />
                {/* White Sesame Seeds on Top Bun */}
                <ellipse cx="140" cy="151" rx="1.2" ry="0.6" fill="#FEF3C7" transform="rotate(-15 140 151)" />
                <ellipse cx="150" cy="148" rx="1.2" ry="0.6" fill="#FEF3C7" />
                <ellipse cx="160" cy="152" rx="1.2" ry="0.6" fill="#FEF3C7" transform="rotate(20 160 152)" />
                <ellipse cx="145" cy="157" rx="1.2" ry="0.6" fill="#FEF3C7" transform="rotate(10 145 157)" />
                <ellipse cx="155" cy="158" rx="1.2" ry="0.6" fill="#FEF3C7" transform="rotate(-10 155 158)" />
              </g>

              {/* 3. REFRESHING RED DRINK WITH STRAW (Right) */}
              <g id="drink">
                {/* Red Cup */}
                <path
                  d="M 188,155 L 214,155 L 209,193 L 193,193 Z"
                  fill="url(#drinkGrad)"
                  stroke="#991B1B"
                  strokeWidth="1"
                />
                {/* White Lid */}
                <ellipse cx="201" cy="155" rx="14" ry="3.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                {/* Slanted Straw */}
                <path
                  d="M 203,153 L 208,136 L 220,132"
                  stroke="#E50914"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </g>
            </g>

            {/* ── STEAM RISING NATURALLY (Animated Loop) ── */}
            <g id="steam">
              <motion.path
                d="M 142,138 C 139,128 145,120 141,110 C 138,102 143,94 140,84"
                stroke="#E2E8F0"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                animate={{
                  y: [0, -12, 0],
                  opacity: [0.2, 0.7, 0.2]
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.path
                d="M 152,136 C 156,126 150,118 155,108 C 158,100 153,92 156,82"
                stroke="#E2E8F0"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
                animate={{
                  y: [-3, -16, -3],
                  opacity: [0.3, 0.85, 0.3]
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4
                }}
              />
              <motion.path
                d="M 160,140 C 163,130 159,122 163,112 C 166,104 161,96 164,88"
                stroke="#E2E8F0"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.15, 0.6, 0.15]
                }}
                transition={{
                  duration: 2.0,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8
                }}
              />
            </g>

            {/* ── LIFTING CLOCHE DOME & RED CHEF HAT (Main Animation) ── */}
            <motion.g
              id="clocheAssembly"
              animate={{
                y: [0, -42, -42, 0],
                rotate: [0, -4, -4, 0]
              }}
              transition={{
                duration: 3.4,
                repeat: Infinity,
                repeatDelay: 0.4,
                ease: [0.4, 0, 0.2, 1],
                times: [0, 0.35, 0.7, 1]
              }}
              style={{ originX: '150px', originY: '175px' }}
            >
              {/* 1. Cloche Silver Dome */}
              {/* Cloche Hollow Inner Base Shadow */}
              <ellipse cx="150" cy="164" rx="60" ry="12" fill="url(#clocheInner)" />
              
              {/* Cloche Main Metal Shell */}
              <path
                d="M 90,162 C 90,105 116,84 150,84 C 184,84 210,105 210,162 Z"
                fill="url(#clocheMetal)"
                stroke="#94A3B8"
                strokeWidth="1.5"
              />

              {/* Metal Cloche High-Gloss Highlight Reflection */}
              <path
                d="M 104,152 C 105,115 122,96 142,92 C 130,96 116,115 116,152 Z"
                fill="#FFFFFF"
                opacity="0.65"
              />

              {/* Cloche Lower Outer Lip */}
              <ellipse cx="150" cy="162" rx="60" ry="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />

              {/* Cloche Top Handle Finial Knob */}
              <ellipse cx="150" cy="80" rx="9" ry="4.5" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
              <rect x="147" y="78" width="6" height="8" rx="2" fill="#94A3B8" />

              {/* 2. RED CHEF HAT (Perched right above Cloche Finial Knob) */}
              <g id="chefHat" transform="translate(0, -6)">
                {/* Chef Hat Puffy Outline / Fill (Matches Grab2GO logo mark) */}
                <path
                  d="M 132,66 C 124,66 119,57 122,48 C 117,40 123,28 132,27 C 136,18 149,15 156,22 C 163,16 177,18 180,28 C 188,30 192,41 187,49 C 190,58 184,66 176,66 Z"
                  fill="#FFFFFF"
                  stroke="#E50914"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                {/* Hat Headband Base */}
                <path
                  d="M 130,66 C 138,69 170,69 178,66"
                  stroke="#E50914"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Hat Interior Soft Shadow Crease */}
                <path
                  d="M 144,48 C 146,55 160,55 162,48"
                  stroke="#E50914"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.4"
                />
              </g>
            </motion.g>
          </svg>
        </div>

        {/* ── GRAB2GO OFFICIAL LOGO WITH RED CHEF HAT ── */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-2 flex items-center justify-center gap-1.5"
        >
          <span className="text-3xl sm:text-4xl font-black text-[#252525] tracking-tight">
            Grab2G
          </span>
          {/* Logo 'O' with cute red chef hat */}
          <div className="relative inline-flex items-center justify-center">
            <span className="text-3xl sm:text-4xl font-black text-[#E50914] tracking-tight">
              O
            </span>
            <div className="absolute -top-3.5 -right-2 text-[#E50914]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E50914" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                <line x1="6" y1="17" x2="18" y2="17" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* ── LOADING SUBTITLE TYPOGRAPHY ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-1.5 text-xs sm:text-sm font-semibold text-stone-500 tracking-normal"
        >
          {message}
        </motion.p>

        {/* ── RED ANIMATED PROGRESS BAR (Matches Reference Indicator) ── */}
        <div className="mt-5 w-60 sm:w-72 h-3 sm:h-3.5 bg-[#FDE9E4] rounded-full overflow-hidden p-0.5 shadow-inner relative">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#E50914] via-[#EF4444] to-[#B71C1C] relative overflow-hidden"
            animate={{
              width: ["25%", "68%", "92%", "45%", "85%"],
              x: ["0%", "8%", "0%", "4%", "0%"]
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Animated Diagonal Candystripe Overlay */}
            <div
              className="absolute inset-0 opacity-25 w-full h-full"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #FFF, #FFF 6px, transparent 6px, transparent 12px)',
                backgroundSize: '24px 24px',
              }}
            />
          </motion.div>
        </div>

        {/* ── TIMEOUT / RETRY CONTROLS (If page loading stalls) ── */}
        <AnimatePresence>
          {(showRetry || hasTimedOut) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-400">
                <AlertCircle size={13} className="text-amber-500 shrink-0" />
                <span>Taking longer than expected?</span>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="px-4 py-2 rounded-full bg-white hover:bg-[#FFF5F5] text-[#E50914] border border-[#FEE2E2] hover:border-[#E50914] text-xs font-black shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <RefreshCw size={13} className="shrink-0" />
                <span>Refresh &amp; Try Again</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
