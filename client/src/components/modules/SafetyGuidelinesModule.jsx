import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, ShieldAlert, AlertTriangle, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { Skeleton } from '../common/Skeleton';

export const SafetyGuidelinesModule = () => {
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('FLOOD');
  const [activePhase, setActivePhase] = useState('DURING');

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const fetchGuidelines = async () => {
    try {
      setLoading(true);
      const data = await api.getSafetyGuidelines();
      setGuidelines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const types = ['FLOOD', 'EARTHQUAKE', 'CYCLONE', 'FIRE', 'LANDSLIDE', 'TSUNAMI', 'HEATWAVE'];
  const currentGuideline = guidelines.find((g) => g.disaster_type === activeType) || guidelines[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-wide">Public Safety & Survival Protocols</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Official emergency procedures structured across Before, During, and After disaster phases</p>
        </div>
      </div>

      {/* Disaster Type Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs tracking-wider transition-all whitespace-nowrap ${
              activeType === type
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {loading || !currentGuideline ? (
        <Skeleton count={2} height="h-48" />
      ) : (
        <div className="space-y-6">
          {/* Active Protocol Card */}
          <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs">
                {currentGuideline.disaster_type} PROTOCOL
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-3">{currentGuideline.title}</h2>
              <p className="text-xs text-slate-300 mt-1">{currentGuideline.summary}</p>
            </div>

            {/* 3-Phase Selector */}
            <div className="grid grid-cols-3 gap-3 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setActivePhase('BEFORE')}
                className={`py-3 rounded-xl font-bold text-xs transition-all ${
                  activePhase === 'BEFORE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. BEFORE DISASTER (PREPARE)
              </button>

              <button
                onClick={() => setActivePhase('DURING')}
                className={`py-3 rounded-xl font-bold text-xs transition-all ${
                  activePhase === 'DURING' ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. DURING DISASTER (SURVIVE)
              </button>

              <button
                onClick={() => setActivePhase('AFTER')}
                className={`py-3 rounded-xl font-bold text-xs transition-all ${
                  activePhase === 'AFTER' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3. AFTER DISASTER (RECOVER)
              </button>
            </div>

            {/* Phase Content Instructions */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="font-extrabold text-white text-base tracking-wide flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Actions Required ({activePhase} DISASTER)</span>
              </h4>

              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-medium space-y-2">
                {activePhase === 'BEFORE' && currentGuideline.before_instructions}
                {activePhase === 'DURING' && currentGuideline.during_instructions}
                {activePhase === 'AFTER' && currentGuideline.after_instructions}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
