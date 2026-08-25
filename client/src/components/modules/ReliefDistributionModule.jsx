import React, { useState, useEffect } from 'react';
import { Gift, Plus, Search, Calendar, Users, PackageCheck } from 'lucide-react';
import { api, getGlobalRole } from '../../services/api';
import { StatCard } from '../common/StatCard';
import { Modal } from '../common/Modal';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

export const ReliefDistributionModule = ({ showToast }) => {
  const [data, setData] = useState({ distributions: [], stats: {} });
  const [disasters, setDisasters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    disaster_id: '1',
    location_id: '1',
    resource_id: '1',
    quantity: '500',
    recipient_info: '500 Flood Evacuees at Mylapore Relief Center',
  });

  const userRole = getGlobalRole();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const disData = await api.getDisasters();
      setDisasters(disData);
      const locData = await api.getLocations();
      setLocations(locData);
      const resData = await api.getResources();
      setResources(resData);

      const res = await api.getReliefDistributions();
      setData(res);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to load relief distributions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createReliefDistribution(formData);
      if (showToast) showToast('Relief aid distribution logged & inventory updated', 'success');
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  const { distributions = [], stats = {} } = data;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-wide">Relief Aid Distribution Log</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Audit log of food, water, medical kit, and blanket dispatches to disaster victims</p>
        </div>

        {(userRole === 'ADMIN' || userRole === 'RESPONSE_TEAM') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Log Aid Distribution</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Total Aid Distributions"
          value={stats.total_distributions || 0}
          subtitle="Field dispatches completed"
          icon={Gift}
          color="blue"
        />
        <StatCard
          title="Total Supplies Delivered"
          value={stats.total_items_distributed || 0}
          subtitle="Units of food, water & medicine"
          icon={PackageCheck}
          color="emerald"
        />
        <StatCard
          title="Beneficiary Coverage"
          value="15,400+"
          subtitle="Estimated citizens reached"
          icon={Users}
          color="purple"
        />
      </div>

      {/* Distribution Log Table */}
      {loading ? (
        <Skeleton count={4} height="h-16" />
      ) : distributions.length === 0 ? (
        <EmptyState title="No relief aid distributions logged yet" message="Use the button above to log a new distribution." />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-800 glass-panel">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                <th className="p-4">Dispatch Code</th>
                <th className="p-4">Disaster & City</th>
                <th className="p-4">Distributed Resource</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Recipient Info</th>
                <th className="p-4">Distributed By</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {distributions.map((d) => (
                <tr key={d.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-400">{d.distribution_code}</td>
                  <td className="p-4">
                    <span className="font-bold text-white block">{d.disaster_name}</span>
                    <span className="text-[11px] text-slate-400">{d.city}</span>
                  </td>
                  <td className="p-4 font-semibold text-slate-200">{d.resource_name}</td>
                  <td className="p-4 font-extrabold text-emerald-400 text-sm">
                    {d.quantity.toLocaleString()} {d.unit}
                  </td>
                  <td className="p-4 text-slate-300 max-w-xs truncate" title={d.recipient_info}>
                    {d.recipient_info}
                  </td>
                  <td className="p-4 text-slate-300 font-semibold">{d.distributed_by_name}</td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {new Date(d.distribution_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE DISTRIBUTION MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Log Field Aid Distribution">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Resource Item to Distribute</label>
              <select
                value={formData.resource_id}
                onChange={(e) => setFormData({ ...formData, resource_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.quantity} {r.unit} left)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Dispatched Quantity</label>
              <input
                type="number"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Recipient Target & Ward Details</label>
            <input
              type="text"
              required
              value={formData.recipient_info}
              onChange={(e) => setFormData({ ...formData, recipient_info: e.target.value })}
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
              className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-md"
            >
              Log Aid Dispatch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
