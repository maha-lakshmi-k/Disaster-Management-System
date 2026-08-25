import React from 'react';
import {
  ShieldAlert,
  Search,
  Home,
  PhoneCall,
  LifeBuoy,
  Boxes,
  Activity,
  ChevronRight,
  BookOpen,
  Users,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const LandingPage = ({ setActiveTab, setSearchQuery }) => {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-20 pb-12">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden rounded-3xl p-8 lg:p-14 glass-panel border border-red-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/40">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider pulse-emergency">
            <ShieldAlert className="w-4 h-4" />
            <span>National Emergency Response & Command Portal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Disaster Management & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-red-400">Emergency Response System</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
            A centralized, real-time emergency response platform connecting active disaster tracking, emergency resource allocation, shelter availability, rescue operation coordination, and public hotline services in one unified portal.
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('contacts')}
              className="flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-red-600/30 hover:scale-105"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Emergency Help (SOS 112)</span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition-all hover:scale-105"
            >
              <Search className="w-4 h-4 text-red-400" />
              <span>Search Information</span>
            </button>

            <button
              onClick={() => setActiveTab('shelters')}
              className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-sm rounded-xl border border-emerald-500/40 transition-all hover:scale-105"
            >
              <Home className="w-4 h-4" />
              <span>Find Shelter</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold text-sm rounded-xl border border-slate-700 transition-all"
            >
              <span>Explore System</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Key Quick Stats Pills */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80">
            <div>
              <span className="text-2xl font-extrabold text-white block">6 Active</span>
              <span className="text-xs text-slate-400 font-semibold uppercase">Disasters Tracked</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-emerald-400 block">4,000+</span>
              <span className="text-xs text-slate-400 font-semibold uppercase">Shelter Capacity</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-amber-400 block">1,995+</span>
              <span className="text-xs text-slate-400 font-semibold uppercase">People Rescued</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-cyan-400 block">24x7</span>
              <span className="text-xs text-slate-400 font-semibold uppercase">Helpline Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 1. WHAT IS THIS SYSTEM? ================= */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">1. What is this System?</h2>
            <p className="text-xs text-slate-400">Enterprise emergency command architecture & disaster DBMS</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Real-Time Disaster Intel</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitors flash floods, earthquakes, cyclones, wildfires, landslides, and heatwaves with live severity triage (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Rescue & Resource Logistics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tracks NDRF rescue operation progress, personnel assignments, watercraft/vehicle fleets, medical supplies, and relief distribution logs.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Home className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Shelter & Victim Management</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides live shelter occupancy meters, facility directories, missing persons registry, and medical triage classification.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 2. CURRENT ACTIVE DISASTERS ================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">2. Current Active Disasters</h2>
              <p className="text-xs text-slate-400">Live high-priority alerts across regions</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('disasters')}
            className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
          >
            <span>View All Disasters</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-card border border-red-500/40 bg-red-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="CRITICAL">CRITICAL</Badge>
              <Badge variant="ACTIVE">FLOOD</Badge>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Chennai Metro Inundation</h3>
              <p className="text-xs text-slate-400 mt-1">Chennai, Tamil Nadu</p>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2">
              Unprecedented monsoon rainfall causing acute urban flooding across Velachery and Adyar basin. NDRF rescue underway.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
              <span>Affected: 450,000</span>
              <button onClick={() => setActiveTab('disasters')} className="text-red-400 font-bold hover:underline">
                Details →
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-amber-500/40 bg-amber-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="HIGH">HIGH</Badge>
              <Badge variant="ACTIVE">LANDSLIDE</Badge>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Wayanad Slope Failure</h3>
              <p className="text-xs text-slate-400 mt-1">Meppadi, Kerala</p>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2">
              Torrential downpours triggering major mudslides along Western Ghats roads. Debris clearance active.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
              <span>Affected: 28,000</span>
              <button onClick={() => setActiveTab('disasters')} className="text-amber-400 font-bold hover:underline">
                Details →
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-amber-500/40 bg-amber-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="HIGH">HIGH</Badge>
              <Badge variant="ACTIVE">HEATWAVE</Badge>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Vizag Thermal Surge</h3>
              <p className="text-xs text-slate-400 mt-1">Visakhapatnam, Andhra Pradesh</p>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2">
              Extreme heatwave (44°C) combined with localized ammonia gas tank thermal warning near coastal harbor.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
              <span>Affected: 85,000</span>
              <button onClick={() => setActiveTab('disasters')} className="text-amber-400 font-bold hover:underline">
                Details →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. SEARCH INFORMATION ================= */}
      <section className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">3. Multi-Entity Global Search</h2>
            <p className="text-xs text-slate-400">Search across disasters, shelters, resources, rescue ops, victims, and guidelines</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Type a location or topic (e.g. 'Chennai', 'Flood', 'Water', 'Medical')..."
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                setSearchQuery(e.target.value.trim());
                setActiveTab('search');
              }
            }}
          />
          <button
            onClick={() => setActiveTab('search')}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition-all shadow-md"
          >
            Launch Search
          </button>
        </div>
      </section>

      {/* ================= 4. EMERGENCY SERVICES & SHELTER FINDER ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Services */}
        <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">4. Emergency Services</h2>
              <p className="text-xs text-slate-400">Integrated response hotline directory</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-semibold block">NATIONAL SOS</span>
              <span className="text-2xl font-extrabold text-red-400 block">112</span>
              <span className="text-[10px] text-slate-500">Police, Fire, Medical Unified</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-semibold block">NDRF HOTLINE</span>
              <span className="text-2xl font-extrabold text-amber-400 block">1078</span>
              <span className="text-[10px] text-slate-500">Disaster Rescue Force</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-semibold block">AMBULANCE</span>
              <span className="text-2xl font-extrabold text-emerald-400 block">108</span>
              <span className="text-[10px] text-slate-500">Emergency Healthcare</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-semibold block">FIRE CONTROL</span>
              <span className="text-2xl font-extrabold text-cyan-400 block">101</span>
              <span className="text-[10px] text-slate-500">Fire & Rescue Command</span>
            </div>
          </div>
        </div>

        {/* Shelter Finder Preview */}
        <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">5. Shelter Finder</h2>
              <p className="text-xs text-slate-400">Live refuge capacity & facility status</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl glass-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">St. Bede Relief Centre</span>
                <Badge variant="AVAILABLE">280 Seats Available</Badge>
              </div>
              <p className="text-xs text-slate-400">San Thome, Mylapore, Chennai • Cap: 800 | Occ: 520</p>
            </div>

            <div className="p-4 rounded-2xl glass-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Salt Lake Stadium Refuge</span>
                <Badge variant="LIMITED">20 Seats Available</Badge>
              </div>
              <p className="text-xs text-slate-400">Salt Lake, Kolkata • Cap: 1500 | Occ: 1480</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('shelters')}
            className="w-full py-2.5 bg-slate-900 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
          >
            Explore All Shelters →
          </button>
        </div>
      </section>

      {/* ================= 6, 7, 8: RESOURCES, RESCUE, SAFETY ================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <Boxes className="w-8 h-8 text-amber-400" />
          <h3 className="text-lg font-bold text-white">6. Resource Logistics</h3>
          <p className="text-xs text-slate-400">
            Real-time supply depot tracking for food kits, clean water, medical packs, rescue boats, and oxygen cylinders.
          </p>
          <button onClick={() => setActiveTab('resources')} className="text-xs font-bold text-amber-400 hover:underline">
            View Inventory →
          </button>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <LifeBuoy className="w-8 h-8 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">7. Rescue Operations</h3>
          <p className="text-xs text-slate-400">
            Live progress tracking for NDRF, Navy, Fire Force, and Army engineering task force missions.
          </p>
          <button onClick={() => setActiveTab('rescue')} className="text-xs font-bold text-cyan-400 hover:underline">
            Track Operations →
          </button>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <BookOpen className="w-8 h-8 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">8. Safety Guidelines</h3>
          <p className="text-xs text-slate-400">
            Comprehensive 3-phase survival protocols (Before, During, After) for floods, earthquakes, cyclones, and fires.
          </p>
          <button onClick={() => setActiveTab('guidelines')} className="text-xs font-bold text-emerald-400 hover:underline">
            Read Instructions →
          </button>
        </div>
      </section>

      {/* ================= 9, 10, 11: STATS & HOW IT WORKS ================= */}
      <section className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-wide">9. How the System Works</h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-bold text-sm flex items-center justify-center mx-auto">
              1
            </span>
            <h4 className="font-bold text-white text-sm">Disaster Alert</h4>
            <p className="text-[11px] text-slate-400">Disasters reported with severity, location & status</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold text-sm flex items-center justify-center mx-auto">
              2
            </span>
            <h4 className="font-bold text-white text-sm">Rescue Launch</h4>
            <p className="text-[11px] text-slate-400">Rescue teams deployed & progress monitored</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-sm flex items-center justify-center mx-auto">
              3
            </span>
            <h4 className="font-bold text-white text-sm">Shelter & Aid</h4>
            <p className="text-[11px] text-slate-400">Evacuees assigned to shelters & aid distributed</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold text-sm flex items-center justify-center mx-auto">
              4
            </span>
            <h4 className="font-bold text-white text-sm">Recovery Audit</h4>
            <p className="text-[11px] text-slate-400">Victim status updated & analytics logged</p>
          </div>
        </div>
      </section>
    </div>
  );
};
