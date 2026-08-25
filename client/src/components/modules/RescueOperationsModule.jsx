import React, { useState, useEffect } from 'react';
import { LifeBuoy, Search, Plus, MapPin, Users, CheckCircle2, Clock } from 'lucide-react';
import { api, getGlobalRole } from '../../services/api';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Modal } from '../common/Modal';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

export const RescueOperationsModule = ({ showToast }) => {
  const [operations, setOperations] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOp, setSelectedOp] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    disaster_id: '1',
    location_id: '1',
    rescue_team: 'NDRF 4th Battalion Command',
    resources_used: '12 Motorboats, 50 Life Jackets, 2 Choppers',
    progress: '25',
    status: 'ONGOING',
  });

  const userRole = getGlobalRole();

  useEffect(() => {
    fetchOps();
  }, [statusFilter, searchQuery]);

  const fetchOps = async () => {
    try {
      setLoading(true);
      const disData = await api.getDisasters();
      setDisasters(disData);
      const locData = await api.getLocations();
      setLocations(locData);

      const params = { status: statusFilter, search: searchQuery };
      const data = await api.getRescueOps(params);
      setOperations(data);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to load rescue operations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createRescueOp(formData);
      if (showToast) showToast('Rescue operation launched successfully', 'success');
      setIsAddModalOpen(false);
      fetchOps();
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!selectedOp) return;
    try {
      await api.updateRescueOp(selectedOp.id, {
        name: selectedOp.name,
        rescue_team: selectedOp.rescue_team,
        people_rescued: selectedOp.people_rescued,
        resources_used: selectedOp.resources_used,
        status: selectedOp.status,
        progress: selectedOp.progress,
      });
      if (showToast) showToast('Operation progress updated', 'success');
      setSelectedOp(null);
      fetchOps();
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-wide">Rescue Operation Tracking</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Live field missions, NDRF battalion dispatch, and survivor headcount</p>
        </div>

        {(userRole === 'ADMIN' || userRole === 'RESPONSE_TEAM') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Rescue Mission</span>
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mission code, team, or city..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="ONGOING">ONGOING</option>
            <option value="PLANNED">PLANNED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Operations Grid */}
      {loading ? (
        <Skeleton count={3} height="h-48" />
      ) : operations.length === 0 ? (
        <EmptyState title="No rescue operations found" message="Try searching for another operation code or disaster." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {operations.map((op) => (
            <div key={op.id} className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-cyan-400 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40">
                  {op.operation_code}
                </span>
                <Badge variant={op.status}>{op.status}</Badge>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{op.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Disaster: <span className="text-slate-200 font-semibold">{op.disaster_name}</span></p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{op.city}, {op.state}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <ProgressBar
                  label={`Mission Progress (${op.progress}%)`}
                  value={op.progress}
                  max={100}
                  color={op.status === 'COMPLETED' ? 'emerald' : 'cyan'}
                  size="md"
                />
              </div>

              {/* Details & Rescued Headcount */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 font-semibold block text-[10px]">RESCUE TEAM</span>
                  <span className="font-bold text-white block truncate">{op.rescue_team}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 font-semibold block text-[10px]">PEOPLE RESCUED</span>
                  <span className="font-extrabold text-emerald-400 block text-sm">{op.people_rescued} Survivors</span>
                </div>
              </div>

              {op.resources_used && (
                <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-300">Fleet & Equipment: </span>
                  {op.resources_used}
                </p>
              )}

              {(userRole === 'ADMIN' || userRole === 'RESPONSE_TEAM') && (
                <button
                  onClick={() => setSelectedOp(op)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs rounded-xl transition-colors"
                >
                  Update Progress & Survivor Count
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE OPERATION MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Launch Rescue Operation">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Operation Title</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Operation Jal Suraksha (Velachery)"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Disaster</label>
              <select
                value={formData.disaster_id}
                onChange={(e) => setFormData({ ...formData, disaster_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                {disasters.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Location</label>
              <select
                value={formData.location_id}
                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.city}, {l.state}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Assigned Rescue Team / Battalion</label>
            <input
              type="text"
              required
              value={formData.rescue_team}
              onChange={(e) => setFormData({ ...formData, rescue_team: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Deployed Fleet & Equipment</label>
            <input
              type="text"
              value={formData.resources_used}
              onChange={(e) => setFormData({ ...formData, resources_used: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 shadow-md"
            >
              Launch Operation
            </button>
          </div>
        </form>
      </Modal>

      {/* UPDATE PROGRESS MODAL */}
      <Modal isOpen={!!selectedOp} onClose={() => setSelectedOp(null)} title="Update Mission Telemetry">
        {selectedOp && (
          <form onSubmit={handleUpdateProgress} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Status</label>
              <select
                value={selectedOp.status}
                onChange={(e) => setSelectedOp({ ...selectedOp, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                <option value="ONGOING">ONGOING</option>
                <option value="PLANNED">PLANNED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Progress Percentage ({selectedOp.progress}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedOp.progress}
                onChange={(e) => setSelectedOp({ ...selectedOp, progress: e.target.value })}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Total Survivors Rescued</label>
              <input
                type="number"
                value={selectedOp.people_rescued}
                onChange={(e) => setSelectedOp({ ...selectedOp, people_rescued: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedOp(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 shadow-md"
              >
                Save Progress Update
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
