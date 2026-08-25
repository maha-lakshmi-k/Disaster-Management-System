import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, MapPin, Phone, AlertCircle, ShieldCheck } from 'lucide-react';
import { api, getGlobalRole } from '../../services/api';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

export const VictimsModule = ({ showToast }) => {
  const [victims, setVictims] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVictim, setSelectedVictim] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    age: '30',
    gender: 'Male',
    location_id: '1',
    disaster_id: '1',
    contact_number: '',
    medical_needs: 'Dehydration, minor abrasions',
    rescue_status: 'LOCATED',
    priority: 'HIGH',
  });

  const userRole = getGlobalRole();

  useEffect(() => {
    fetchVictims();
  }, [statusFilter, priorityFilter, searchQuery, userRole]);

  const fetchVictims = async () => {
    try {
      setLoading(true);
      const disData = await api.getDisasters();
      setDisasters(disData);
      const locData = await api.getLocations();
      setLocations(locData);

      const params = {
        rescue_status: statusFilter,
        priority: priorityFilter,
        search: searchQuery,
      };
      const data = await api.getVictims(params);
      setVictims(data);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to load victim records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createVictim(formData);
      if (showToast) showToast('Victim record reported successfully', 'success');
      setIsAddModalOpen(false);
      fetchVictims();
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedVictim) return;
    try {
      await api.updateVictim(selectedVictim.id, {
        name: selectedVictim.name,
        age: selectedVictim.age,
        gender: selectedVictim.gender,
        rescue_status: selectedVictim.rescue_status,
        priority: selectedVictim.priority,
        medical_needs: selectedVictim.medical_needs,
        contact_number: selectedVictim.contact_number,
      });
      if (showToast) showToast('Victim record updated', 'success');
      setSelectedVictim(null);
      fetchVictims();
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
            <Users className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-wide">Victim Registry & Triage</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Missing person search, medical priority triage, and evacuation logs</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Report Missing / Affected Person</span>
        </button>
      </div>

      {/* Role Protection Banner */}
      {userRole === 'PUBLIC' && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>Public Privacy Mode Enabled:</strong> Contact phone numbers are masked to protect survivor privacy. Log in as Response Team or Admin to access unmasked records.
          </span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search victim code, name, or medical needs..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Rescue Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="MISSING">MISSING</option>
            <option value="LOCATED">LOCATED</option>
            <option value="RESCUED">RESCUED</option>
            <option value="HOSPITALIZED">HOSPITALIZED</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">ALL PRIORITIES</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Victims Table View */}
      {loading ? (
        <Skeleton count={4} height="h-16" />
      ) : victims.length === 0 ? (
        <EmptyState title="No victim records found" message="Try searching for a different name or victim code." />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-800 glass-panel">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                <th className="p-4">Victim Code & Name</th>
                <th className="p-4">Age / Gender</th>
                <th className="p-4">Disaster Zone</th>
                <th className="p-4">Medical Needs</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Rescue Status</th>
                <th className="p-4">Contact</th>
                {(userRole === 'ADMIN' || userRole === 'RESPONSE_TEAM') && <th className="p-4">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {victims.map((v) => (
                <tr key={v.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-[11px] text-rose-400 font-bold block">{v.victim_code}</span>
                    <span className="font-bold text-white text-sm block">{v.name}</span>
                  </td>
                  <td className="p-4 text-slate-300">
                    {v.age} yrs • {v.gender}
                  </td>
                  <td className="p-4">
                    <span className="text-white font-semibold block">{v.disaster_name}</span>
                    <span className="text-[11px] text-slate-400">{v.city}, {v.state}</span>
                  </td>
                  <td className="p-4 text-slate-300 max-w-xs truncate" title={v.medical_needs}>
                    {v.medical_needs || 'None specified'}
                  </td>
                  <td className="p-4">
                    <Badge variant={v.priority}>{v.priority}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={v.rescue_status}>{v.rescue_status}</Badge>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-300">
                    {v.contact_number}
                  </td>
                  {(userRole === 'ADMIN' || userRole === 'RESPONSE_TEAM') && (
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedVictim(v)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold rounded-lg text-[11px]"
                      >
                        Update
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE VICTIM MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Report Missing / Affected Person">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Name of Person</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
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
            <label className="block text-slate-300 font-semibold mb-1">Medical Needs & Conditions</label>
            <textarea
              rows={2}
              value={formData.medical_needs}
              onChange={(e) => setFormData({ ...formData, medical_needs: e.target.value })}
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
              className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 shadow-md"
            >
              Report Victim
            </button>
          </div>
        </form>
      </Modal>

      {/* UPDATE VICTIM MODAL */}
      <Modal isOpen={!!selectedVictim} onClose={() => setSelectedVictim(null)} title="Update Victim Status">
        {selectedVictim && (
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Rescue Status</label>
                <select
                  value={selectedVictim.rescue_status}
                  onChange={(e) => setSelectedVictim({ ...selectedVictim, rescue_status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  <option value="MISSING">MISSING</option>
                  <option value="LOCATED">LOCATED</option>
                  <option value="RESCUED">RESCUED</option>
                  <option value="HOSPITALIZED">HOSPITALIZED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Priority Triage</label>
                <select
                  value={selectedVictim.priority}
                  onChange={(e) => setSelectedVictim({ ...selectedVictim, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Medical Needs Update</label>
              <textarea
                rows={2}
                value={selectedVictim.medical_needs}
                onChange={(e) => setSelectedVictim({ ...selectedVictim, medical_needs: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedVictim(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 shadow-md"
              >
                Save Record
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
