import React, { useState, useEffect } from 'react';
import {
  Flame,
  Users,
  Home,
  LifeBuoy,
  Boxes,
  Gift,
  Activity,
  BarChart2,
  TrendingUp,
  MapPin,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api';
import { StatCard } from '../common/StatCard';
import { ProgressBar } from '../common/ProgressBar';
import { Skeleton } from '../common/Skeleton';
import { Badge } from '../common/Badge';

export const DashboardModule = ({ setActiveTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Skeleton count={4} height="h-32" />;
  if (error) return <div className="p-6 text-center text-red-400">Failed to load stats: {error}</div>;

  const { kpis, charts, recent_activities } = data;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-red-950/30">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500 animate-pulse" />
            <h1 className="text-2xl font-extrabold text-white tracking-wide">Emergency Command Dashboard</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Real-time situational awareness and database telemetry</p>
        </div>

        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 rounded-xl font-semibold text-xs transition-all flex items-center gap-2"
        >
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Live Sync</span>
        </button>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Active Disasters"
          value={kpis.active_disasters}
          subtitle="Monitored in system"
          icon={Flame}
          color="red"
          onClick={() => setActiveTab('disasters')}
        />

        <StatCard
          title="Affected Population"
          value={kpis.affected_people}
          subtitle="Across active zones"
          icon={Users}
          color="amber"
          onClick={() => setActiveTab('disasters')}
        />

        <StatCard
          title="Active Shelters"
          value={kpis.active_shelters}
          subtitle={`${kpis.shelter_occupied.toLocaleString()} / ${kpis.shelter_capacity.toLocaleString()} occupied`}
          icon={Home}
          color="emerald"
          onClick={() => setActiveTab('shelters')}
        />

        <StatCard
          title="Ongoing Rescues"
          value={kpis.ongoing_rescues}
          subtitle={`${kpis.total_rescued.toLocaleString()} rescued to date`}
          icon={LifeBuoy}
          color="cyan"
          onClick={() => setActiveTab('rescue')}
        />

        <StatCard
          title="Available Resources"
          value={kpis.available_resources}
          subtitle="Supply categories ready"
          icon={Boxes}
          color="purple"
          onClick={() => setActiveTab('resources')}
        />

        <StatCard
          title="Relief Distributions"
          value={kpis.total_relief_distributions}
          subtitle="Field aid logs completed"
          icon={Gift}
          color="blue"
          onClick={() => setActiveTab('relief')}
        />
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Disaster Severity Breakdown */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Disaster Severity Distribution</h3>
              <p className="text-xs text-slate-400">Classified by hazard risk level</p>
            </div>
            <BarChart2 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-4 pt-2">
            {charts.severity.map((item, idx) => {
              const maxVal = Math.max(...charts.severity.map((s) => s.count), 1);
              const colorMap = { CRITICAL: 'red', HIGH: 'amber', MEDIUM: 'purple', LOW: 'emerald' };
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200">{item.severity}</span>
                    <span className="text-slate-400">{item.count} Disasters</span>
                  </div>
                  <ProgressBar
                    value={item.count}
                    max={maxVal}
                    showPercentage={false}
                    color={colorMap[item.severity] || 'blue'}
                    size="md"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Affected Population by City */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Affected Population by Location</h3>
              <p className="text-xs text-slate-400">Impact headcount per region</p>
            </div>
            <MapPin className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-4 pt-2">
            {charts.population_by_city.map((item, idx) => {
              const maxVal = Math.max(...charts.population_by_city.map((p) => p.total_affected), 1);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200">{item.city}</span>
                    <span className="text-slate-400">{item.total_affected.toLocaleString()} people</span>
                  </div>
                  <ProgressBar
                    value={item.total_affected}
                    max={maxVal}
                    showPercentage={false}
                    color="amber"
                    size="md"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Rescue Operation Progress */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Active Rescue Mission Progress</h3>
              <p className="text-xs text-slate-400">Percentage completion & rescued counts</p>
            </div>
            <LifeBuoy className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="space-y-4 pt-2">
            {charts.rescue_progress.map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white truncate max-w-[200px]">{item.name}</span>
                  <span className="text-cyan-400 font-bold">{item.people_rescued} Rescued</span>
                </div>
                <ProgressBar
                  value={item.progress}
                  max={100}
                  color={item.status === 'COMPLETED' ? 'emerald' : 'blue'}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Live Activity & Telemetry Feed</h3>
              <p className="text-xs text-slate-400">Recent database inserts and field updates</p>
            </div>
            <Activity className="w-5 h-5 text-red-400" />
          </div>

          <div className="space-y-3 pt-2">
            {recent_activities.map((act, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div>
                    <span className="font-bold text-white block">{act.title}</span>
                    <span className="text-[10px] text-slate-400">{act.tag}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(act.activity_date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
