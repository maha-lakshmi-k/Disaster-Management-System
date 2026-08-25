import React, { useState, useEffect } from 'react';
import { Home, Search, Plus, MapPin, Phone, Users, CheckCircle2 } from 'lucide-react';
import { api, getGlobalRole } from '../../services/api';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Modal } from '../common/Modal';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

export const SheltersModule = ({ showToast }) => {
  const [shelters, setShelters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    location_id: '1',
    address: '',
    capacity: '500',
    occupied_capacity: '100',
    contact_number: '',
    facilities: 'Medical Clinic, Food Kitchen, Clean Water, Power Backup',
  });

  const userRole = getGlobalRole();

  useEffect(() => {
    fetchShelters();
  }, [statusFilter, searchQuery]);

  const fetchShelters = async () => {
    try {
      setLoading(true);
      const locs = await api.getLocations();
      setLocations(locs);

      const params = {
        status: statusFilter,
        search: searchQuery,
      };
      const data = await api.getShelters(params);
      setShelters(data);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to load shelters', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createShelter(formData);
      if (showToast) showToast('Shelter added successfully', 'success');
      setIsAddModalOpen(false);
      fetchShelters();
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
            <Home className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-wide">Emergency Shelter Finder</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Live capacity tracking, contact hotlines, and shelter amenities</p>
        </div>

        {(userRole === 'ADMIN' || userRole === 'RESPONSE_TEAM') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Shelter</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by shelter name, address, or facilities..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="LIMITED">LIMITED</option>
            <option value="FULL">FULL</option>
          </select>
        </div>
      </div>

      {/* Shelter Grid */}
      {loading ? (
        <Skeleton count={3} height="h-44" />
      ) : shelters.length === 0 ? (
        <EmptyState title="No shelters match your criteria" message="Try searching for another city or clearing filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shelters.map((s) => {
            const avail = s.available_capacity;
            const occPercentage = Math.round((s.occupied_capacity / s.capacity) * 100);

            return (
              <div key={s.id} className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={s.status}>{s.status}</Badge>
                  <span className="text-xs font-bold text-emerald-400">{avail} Available</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{s.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{s.address}, {s.city}</span>
                  </div>
                </div>

                {/* Capacity Visual Meter */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                  <div className="flex justify-between font-medium text-slate-300">
                    <span>Occupancy ({s.occupied_capacity} / {s.capacity})</span>
                    <span className="font-bold text-white">{occPercentage}%</span>
                  </div>
                  <ProgressBar
                    value={s.occupied_capacity}
                    max={s.capacity}
                    showPercentage={false}
                    color={s.status === 'FULL' ? 'red' : s.status === 'LIMITED' ? 'amber' : 'emerald'}
                    size="sm"
                  />
                </div>

                {/* Facilities List */}
                {s.facilities && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {s.facilities.split(',').map((f, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-medium">
                        ✓ {f.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Phone Hotline */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{s.contact_number}</span>
                  </div>
                  <a
                    href={`tel:${s.contact_number}`}
                    className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold"
                  >
                    Call Shelter
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD SHELTER MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register Emergency Shelter">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Shelter Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">City Location</label>
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

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
              <input
                type="text"
                required
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Total Capacity</label>
              <input
                type="number"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Current Occupied</label>
              <input
                type="number"
                value={formData.occupied_capacity}
                onChange={(e) => setFormData({ ...formData, occupied_capacity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Street Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Facilities (Comma Separated)</label>
            <input
              type="text"
              value={formData.facilities}
              onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
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
              className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-md"
            >
              Register Shelter
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
