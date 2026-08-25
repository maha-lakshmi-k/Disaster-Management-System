import React from 'react';
import { Shield, PhoneCall, Globe, Heart } from 'lucide-react';

export const Footer = ({ setActiveTab }) => {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 text-slate-400 text-xs py-8 px-6 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Shield className="w-5 h-5 text-red-500" />
            <span>Disaster Management Portal</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Centralized Emergency Command & Disaster Management System built with a normalized relational database architecture.
          </p>
        </div>

        {/* Col 2 */}
        <div>
          <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Quick Navigation</h5>
          <ul className="space-y-2">
            <li><button onClick={() => setActiveTab('disasters')} className="hover:text-white transition-colors">Active Disasters</button></li>
            <li><button onClick={() => setActiveTab('shelters')} className="hover:text-white transition-colors">Shelters Finder</button></li>
            <li><button onClick={() => setActiveTab('resources')} className="hover:text-white transition-colors">Resource Inventory</button></li>
            <li><button onClick={() => setActiveTab('rescue')} className="hover:text-white transition-colors">Rescue Operations</button></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Emergency Hotlines</h5>
          <ul className="space-y-2">
            <li className="flex items-center gap-2"><PhoneCall className="w-3.5 h-3.5 text-red-400" /> <span className="text-slate-200 font-bold">112</span> (National Emergency)</li>
            <li className="flex items-center gap-2"><PhoneCall className="w-3.5 h-3.5 text-red-400" /> <span className="text-slate-200 font-bold">1078</span> (NDRF Central)</li>
            <li className="flex items-center gap-2"><PhoneCall className="w-3.5 h-3.5 text-red-400" /> <span className="text-slate-200 font-bold">108</span> (Ambulance Corps)</li>
            <li className="flex items-center gap-2"><PhoneCall className="w-3.5 h-3.5 text-red-400" /> <span className="text-slate-200 font-bold">101</span> (Fire & Rescue)</li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">DBMS Architecture</h5>
          <p className="text-slate-400 leading-relaxed mb-3">
            Full-stack DBMS project featuring normalized tables, FK constraints, role access control, and live search.
          </p>
          <button
            onClick={() => setActiveTab('about')}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 rounded-lg font-semibold text-xs transition-colors"
          >
            View ER Schema
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <p>© 2026 Disaster Management & Emergency Response System. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Designed for College DBMS Viva & Real-world Emergency Management
        </p>
      </div>
    </footer>
  );
};
