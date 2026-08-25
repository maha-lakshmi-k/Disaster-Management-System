import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200',
    error: 'border-red-500/40 bg-red-950/80 text-red-200',
    warning: 'border-amber-500/40 bg-amber-950/80 text-amber-200',
    info: 'border-blue-500/40 bg-blue-950/80 text-blue-200',
  };

  const type = toast.type || 'info';

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 border rounded-xl shadow-2xl backdrop-blur-md transition-all max-w-md ${borders[type]}`}>
      {icons[type]}
      <p className="text-sm font-medium pr-2">{toast.message}</p>
      <button onClick={onClose} className="p-1 hover:opacity-75 rounded-lg">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
