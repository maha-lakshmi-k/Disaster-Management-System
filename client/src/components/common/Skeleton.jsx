import React from 'react';

export const Skeleton = ({ count = 3, height = 'h-24', className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`w-full rounded-2xl skeleton-shimmer border border-slate-800 ${height}`}
        ></div>
      ))}
    </div>
  );
};
