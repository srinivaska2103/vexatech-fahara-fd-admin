'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CustomSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select option...', 
  className = '',
  icon: Icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const getOptionLabel = (opt) => {
    if (typeof opt === 'object' && opt !== null) return opt.label;
    return opt;
  };

  const getOptionValue = (opt) => {
    if (typeof opt === 'object' && opt !== null) return opt.value;
    return opt;
  };

  const selectedOption = options.find(opt => getOptionValue(opt) === value);
  const displayLabel = selectedOption ? getOptionLabel(selectedOption) : (value || placeholder);

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 px-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between text-xs font-extrabold cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-fahara-primary ring-2 ring-fahara-primary/20 bg-[#FFF5F5] text-[#252525]'
            : value 
              ? 'border-fahara-primary/60 bg-amber-50/60 hover:bg-[#FFF5F5] text-[#E50914]' 
              : 'border-[#EF5350]/80 bg-[#FFF5F5] hover:bg-[#FFF5F5] text-[#252525] hover:border-fahara-primary'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon className="w-3.5 h-3.5 text-[#E50914] shrink-0" />}
          <span className="truncate">{displayLabel}</span>
        </div>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-[#E50914] transition-transform duration-200 shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Modern Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-2xl bg-white border border-[#EF5350] shadow-2xl p-1.5 custom-scrollbar text-[#252525]"
          >
            {options.map((opt) => {
              const optValue = getOptionValue(opt);
              const optLabel = getOptionLabel(opt);
              const isSelected = optValue === value;

              return (
                <button
                  key={String(optValue)}
                  type="button"
                  onClick={() => handleSelect(optValue)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#E50914] to-[#757575] text-white shadow-xs'
                      : 'text-[#252525] hover:bg-[#FFF5F5] hover:text-[#E50914]'
                  }`}
                >
                  <span className="truncate">{optLabel}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
