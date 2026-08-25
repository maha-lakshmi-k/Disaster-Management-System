import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-semibold rounded-full tracking-wide transition-all';
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const variants = {
    // Severity
    CRITICAL: 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse',
    HIGH: 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
    MEDIUM: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    LOW: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',

    // Statuses
    ACTIVE: 'bg-red-500/20 text-red-400 border border-red-500/40',
    WARNING: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    RESOLVED: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',

    // Shelters / Resources
    AVAILABLE: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    LIMITED: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    FULL: 'bg-red-500/20 text-red-400 border border-red-500/40',
    OUT_OF_STOCK: 'bg-red-500/20 text-red-400 border border-red-500/40',

    // Operations
    PLANNED: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    ONGOING: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    COMPLETED: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    CANCELLED: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',

    // Victims
    MISSING: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
    LOCATED: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    RESCUED: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    HOSPITALIZED: 'bg-red-500/20 text-red-400 border border-red-500/40',

    // Roles
    ADMIN: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
    RESPONSE_TEAM: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    PUBLIC: 'bg-slate-700/50 text-slate-300 border border-slate-600',

    default: 'bg-slate-800 text-slate-300 border border-slate-700',
  };

  const styleKey = variant.toUpperCase();
  const selectedVariant = variants[styleKey] || variants.default;

  return (
    <span class={`${baseStyles} ${sizeStyles[size]} ${selectedVariant} ${className}`}>
      <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
      {children || variant}
    </span>
  );
};
