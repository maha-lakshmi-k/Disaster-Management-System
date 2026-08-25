import React from 'react';

export const ProgressBar = ({ value = 0, max = 100, label, showPercentage = true, color = 'blue', size = 'md' }) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100))) || 0;

  const colorMap = {
    red: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]',
    amber: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]',
    emerald: 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]',
    blue: 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]',
    purple: 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]',
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${heights[size]} border border-slate-700/50 p-0.5`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorMap[color] || colorMap.blue}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
