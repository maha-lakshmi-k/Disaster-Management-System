import React, { useState, useEffect } from 'react';
import { PhoneCall, Search, MapPin, Clock, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

export const EmergencyContactsModule = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchContacts();
  }, [categoryFilter, searchQuery]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = { category: categoryFilter, search: searchQuery };
      const data = await api.getEmergencyContacts(params);
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['ALL', 'POLICE', 'FIRE', 'AMBULANCE', 'DISASTER_RESPONSE', 'HOSPITALS', 'LOCAL_SERVICES'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-red-500/40 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950">
        <div>
          <div className="flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-red-500 animate-bounce" />
            <h1 className="text-2xl font-extrabold text-white tracking-wide">Emergency Contacts & Hotlines</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">24x7 Direct hotline connection for police, fire, ambulance, and disaster response forces</p>
        </div>

        <div className="flex items-center gap-2 bg-red-600/20 border border-red-500/40 px-4 py-2 rounded-2xl text-red-400 font-extrabold text-sm">
          <span>SOS HELPLINE: 112</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              categoryFilter === cat
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Contacts Grid */}
      {loading ? (
        <Skeleton count={3} height="h-32" />
      ) : contacts.length === 0 ? (
        <EmptyState title="No contacts found" message="Try searching for a different service name or city." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((c) => (
            <div key={c.id} className="p-6 rounded-3xl glass-card border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-extrabold text-[10px] uppercase tracking-wider">
                    {c.category.replace('_', ' ')}
                  </span>
                  {c.is_24x7 ? (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      24x7 Active
                    </span>
                  ) : null}
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">{c.service_name}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{c.address || `${c.city}, ${c.state}`}</span>
                </div>
              </div>

              {/* Prominent Call Action Box */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Toll-Free Hotline:</span>
                  <span className="text-2xl font-extrabold text-red-400 tracking-tight">{c.phone_number}</span>
                </div>
                {c.alternate_phone && (
                  <p className="text-[11px] text-slate-400">Alt: <span className="text-slate-300 font-bold">{c.alternate_phone}</span></p>
                )}
                <a
                  href={`tel:${c.phone_number}`}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md mt-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Emergency Line</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
