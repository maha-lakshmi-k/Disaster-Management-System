import React, { useState, useEffect } from 'react';
import { BarChart3, Printer, Download, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { Skeleton } from '../common/Skeleton';

export const ReportsModule = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.getReports();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Skeleton count={4} height="h-32" />;
  if (!reports) return null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-wide">DBMS Analytical Summary & Reports</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Exportable summary analytics, victim triage metrics, and resource audits</p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
        >
          <Printer className="w-4 h-4 text-purple-400" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Printable Report Document Container */}
      <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-8 print:bg-white print:text-black">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white">National Disaster Management Audit Report</h2>
            <p className="text-xs text-slate-400">Generated: {new Date(reports.generated_at).toLocaleString()}</p>
          </div>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 font-bold text-xs rounded-lg">
            OFFICIAL REPORT
          </span>
        </div>

        {/* Section 1: Disaster Summary */}
        <div className="space-y-3">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider text-purple-400">1. Disaster Occurrence Summary</h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Hazard Type</th>
                  <th className="p-3">Event Count</th>
                  <th className="p-3">Total Population Affected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reports.disaster_summary?.map((d, i) => (
                  <tr key={i}>
                    <td className="p-3 font-bold text-white">{d.type}</td>
                    <td className="p-3 font-semibold text-slate-300">{d.total_events}</td>
                    <td className="p-3 font-extrabold text-amber-400">{d.total_affected?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Victim Status Summary */}
        <div className="space-y-3">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider text-rose-400">2. Victim Triage & Evacuation Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {reports.victim_summary?.map((v, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{v.rescue_status}</span>
                <span className="text-2xl font-extrabold text-white mt-1 block">{v.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Shelter Capacity Breakdown */}
        <div className="space-y-3">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider text-emerald-400">3. Shelter Capacity Audits</h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Status</th>
                  <th className="p-3">Facility Count</th>
                  <th className="p-3">Total Capacity</th>
                  <th className="p-3">Occupied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reports.shelter_summary?.map((s, i) => (
                  <tr key={i}>
                    <td className="p-3 font-bold text-white">{s.status}</td>
                    <td className="p-3 text-slate-300">{s.count} Shelters</td>
                    <td className="p-3 text-slate-300">{s.total_cap?.toLocaleString()}</td>
                    <td className="p-3 text-emerald-400 font-bold">{s.total_occ?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
