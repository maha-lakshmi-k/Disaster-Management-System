import React, { useState, useEffect } from 'react';
import { Boxes, Search, Plus, AlertTriangle, MapPin, Clock } from 'lucide-react';
import { api, getGlobalRole } from '../../services/api';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

export const ResourcesModule = ({ showToast }) => {
  const [resources, setResources] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'FOOD',
    quantity: '1000',
    unit: 'Kits',
    location_id: '1',
  });

  const userRole = getGlobalRole();

  useEffect(() => {
    fetchResources();
  }, [categoryFilter, statusFilter, searchQuery]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const locs = await api.getLocations();
      setLocations(locs);

      const params = {
        category: categoryFilter,
        status: statusFilter,
        search: searchQuery,
      };
      const data = await api.getResources(params);
      setResources(data);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to load resources', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createResource(formData);
      if (showToast) showToast('Resource stock logged successfully', 'success');
      setIsAddModalOpen(false);
      fetchResources();
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  const categories = ['ALL', 'FOOD', 'WATER', 'MEDICAL', 'CLOTHES', 'EQUIPMENT', 'MEDICINE', 'VEHICLE'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-wide">Emergency Resource Inventory</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Live supply logistics, depot quantities, and stock alerts</p>
        </div>

        {(userRole === 'ADMIN' || userRole === 'RESPONSE_TEAM') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
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
            placeholder="Search resource name or city..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Stock Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">ALL</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="LIMITED">LIMITED</option>
            <option value="OUT_OF_STOCK">OUT OF STOCK</option>
          </select>
        </div>
      </div>

      {/* Resources Table View */}
      {loading ? (
        <Skeleton count={4} height="h-16" />
      ) : resources.length === 0 ? (
        <EmptyState title="No resources found" message="Try searching for a different category or item name." />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-800 glass-panel">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                <th className="p-4">Item Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stock Quantity</th>
                <th className="p-4">Location Depot</th>
                <th className="p-4">Availability</th>
                <th className="p-4">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {resources.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-4 font-bold text-white text-sm">{r.name}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                      {r.category}
                    </span>
                  </td>
                  <td className="p-4 font-extrabold text-white text-sm">
                    {r.quantity.toLocaleString()} <span className="text-xs font-normal text-slate-400">{r.unit}</span>
                  </td>
                  <td className="p-4 text-slate-300">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{r.city}, {r.state}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={r.status}>{r.status}</Badge>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {new Date(r.last_updated).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD RESOURCE MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Log Resource Supply Item">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Resource Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Purified Water Cans (20L)"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                {['FOOD', 'WATER', 'MEDICAL', 'CLOTHES', 'EQUIPMENT', 'MEDICINE', 'VEHICLE'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Depot City</label>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Quantity</label>
              <input
                type="number"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Unit (e.g. Kits, Cans, Boxes)</label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
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
              className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 shadow-md"
            >
              Save Resource Stock
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
