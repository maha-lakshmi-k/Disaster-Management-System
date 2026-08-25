import React from 'react';
import { SearchX } from 'lucide-react';

export const EmptyState = ({ title = 'No results found', message = 'Try adjusting your search query or filters to find what you are looking for.', icon: Icon = SearchX }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-2xl border border-slate-800 my-4">
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 mb-4 shadow-inner">
        <Icon className="w-10 h-10 stroke-[1.5]" />
      </div>
      <h4 className="text-lg font-bold text-white tracking-wide">{title}</h4>
      <p className="text-sm text-slate-400 max-w-md mt-1">{message}</p>
    </div>
  );
};
