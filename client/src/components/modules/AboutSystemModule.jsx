import React from 'react';
import { Database, ShieldCheck, Cpu, Code2, Server, Key, Table } from 'lucide-react';

export const AboutSystemModule = () => {
  const tables = [
    { name: 'locations', pk: 'id', fk: 'None', desc: 'Normalized geographical cities, states, coordinates & area codes' },
    { name: 'users', pk: 'id', fk: 'None', desc: 'System authentication & role authorization (ADMIN, RESPONSE_TEAM, PUBLIC)' },
    { name: 'disasters', pk: 'id', fk: 'location_id', desc: 'Hazard incidents with severity classification & status tracking' },
    { name: 'shelters', pk: 'id', fk: 'location_id', desc: 'Evacuee refuge centers with capacity counters & amenities' },
    { name: 'resources', pk: 'id', fk: 'location_id', desc: 'Supply inventory (food, water, medicine, vehicles) & stock status' },
    { name: 'rescue_operations', pk: 'id', fk: 'disaster_id, location_id', desc: 'Field missions, NDRF battalion assignments & survivor count' },
    { name: 'victims', pk: 'id', fk: 'location_id, disaster_id, user_id', desc: 'Survivor registry with priority triage & missing person status' },
    { name: 'relief_distributions', pk: 'id', fk: 'disaster_id, location_id, resource_id', desc: 'Audit log of aid dispatched to evacuees' },
    { name: 'emergency_contacts', pk: 'id', fk: 'location_id', desc: 'Categorized 24x7 emergency helpline directory' },
    { name: 'safety_guidelines', pk: 'id', fk: 'None', desc: '3-phase survival protocols (Before, During, After)' },
    { name: 'notifications', pk: 'id', fk: 'disaster_id', desc: 'System alert notifications & broadcast feeds' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-wide">DBMS Project Architecture & ER Overview</h1>
            <p className="text-xs text-slate-400">Technical documentation for College DBMS Viva & Project Demonstration</p>
          </div>
        </div>
      </div>

      {/* Tech Stack Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-2">
          <Code2 className="w-6 h-6 text-red-400" />
          <h3 className="text-sm font-bold text-white uppercase">Frontend Layer</h3>
          <p className="text-xs text-slate-400">Vite + React 18, Tailwind CSS, Lucide Icons, Glassmorphism design tokens.</p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-2">
          <Server className="w-6 h-6 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase">Backend Layer</h3>
          <p className="text-xs text-slate-400">Node.js Express REST API, JWT Authentication, Role-based Access Middleware.</p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-2">
          <Database className="w-6 h-6 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase">Relational Database</h3>
          <p className="text-xs text-slate-400">11 Normalized tables, Primary & Foreign Keys, ON DELETE CASCADE rules, Indexes.</p>
        </div>
      </div>

      {/* Database Schema Normalization Table */}
      <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-wide">Relational Database Tables (3NF Schema)</h2>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30">
            11 TABLES OPERATIONAL
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-bold uppercase">
              <tr>
                <th className="p-3">Table Name</th>
                <th className="p-3">Primary Key</th>
                <th className="p-3">Foreign Keys</th>
                <th className="p-3">Functional Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {tables.map((t, i) => (
                <tr key={i} className="hover:bg-slate-900/50">
                  <td className="p-3 font-mono font-bold text-red-400">{t.name}</td>
                  <td className="p-3 font-mono text-emerald-400">{t.pk}</td>
                  <td className="p-3 font-mono text-amber-400">{t.fk}</td>
                  <td className="p-3 text-slate-300">{t.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
