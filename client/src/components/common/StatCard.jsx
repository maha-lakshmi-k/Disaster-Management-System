import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend, onClick }) => {
  const colorMap = {
    red: 'from-red-500/20 to-red-950/40 border-red-500/30 text-red-400',
    amber: 'from-amber-500/20 to-amber-950/40 border-amber-500/30 text-amber-400',
    emerald: 'from-emerald-500/20 to-emerald-950/40 border-emerald-500/30 text-emerald-400',
    blue: 'from-blue-500/20 to-blue-950/40 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-950/40 border-purple-500/30 text-purple-400',
    cyan: 'from-cyan-500/20 to-cyan-950/40 border-cyan-500/30 text-cyan-400',
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 border bg-gradient-to-br glass-card cursor-pointer transition-all hover:scale-[1.02] ${selectedColor}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold tracking-tight text-white mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 shadow-inner">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <span className="text-emerald-400">↑ {trend}</span>
          <span className="text-slate-500">vs last week</span>
        </div>
      )}
    </div>
  );
};
