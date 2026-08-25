import React, { useState, useEffect } from 'react';
import { Flame, Filter, Search, Plus, MapPin, Calendar, Users, Info, ShieldAlert, X } from 'lucide-react';
import { api, getGlobalRole } from '../../services/api';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

export const DisastersModule = ({ isHistoryView = false, showToast }) => {
  const [disasters, setDisasters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [disasterDetails, setDisasterDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter States
  const [filterType, setFilterType] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = isHistoryView ? useState('RESOLVED') : useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'FLOOD',
    location_id: '1',
    severity: 'HIGH',
    status: 'ACTIVE',
    affected_population: '10000',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
  });

  const userRole = getGlobalRole();

  useEffect(() => {
    fetchData();
  }, [filterType, filterSeverity, filterStatus, searchQuery, isHistoryView]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const locs = await api.getLocations();
      setLocations(locs);

      const params = {
        type: filterType,
        severity: filterSeverity,
        status: isHistoryView ? 'RESOLVED' : filterStatus,
        search: searchQuery,
      };

      const data = await api.getDisasters(params);
      setDisasters(data);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to load disasters list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (disaster) => {
    setSelectedDisaster(disaster);
    setLoadingDetails(true);
    try {
      const details = await api.getDisasterById(disaster.id);
      setDisasterDetails(details);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createDisaster(formData);
      if (showToast) showToast('Disaster created successfully & alerts dispatched', 'success');
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  const disasterTypes = ['ALL', 'FLOOD', 'EARTHQUAKE', 'CYCLONE', 'FIRE', 'LANDSLIDE', 'TSUNAMI', 'HEATWAVE'];
  const severities = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl font-extrabold text-white tracking-wide">
              {isHistoryView ? 'Disaster History Records' : 'Active Disasters Management'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isHistoryView ? 'Archived resolved disaster occurrences and historical statistics' : 'Live disaster tracking, severity classification, and resource linking'}
          </p>
        </div>

        {userRole === 'ADMIN' && !isHistoryView && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Report New Disaster</span>
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by name or city..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Type Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
          >
            {disasterTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Severity Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
          >
            {severities.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Status Select (if not history) */}
        {!isHistoryView && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="ALL">ALL</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="WARNING">WARNING</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        )}
      </div>

      {/* Disaster Grid */}
      {loading ? (
        <Skeleton count={3} height="h-48" />
      ) : disasters.length === 0 ? (
        <EmptyState title="No disasters match your query" message="Try relaxing your filters or search terms." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disasters.map((d) => (
            <div
              key={d.id}
              onClick={() => handleOpenDetail(d)}
              className={`p-6 rounded-3xl glass-card cursor-pointer border flex flex-col justify-between space-y-4 transition-all ${
                d.severity === 'CRITICAL'
                  ? 'border-red-500/50 bg-red-950/20 hover:border-red-400'
                  : 'border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={d.severity}>{d.severity}</Badge>
                  <Badge variant={d.status}>{d.status}</Badge>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">{d.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>{d.city}, {d.state}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{d.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>{d.affected_population.toLocaleString()} affected</span>
                </div>
                <div className="flex items-center gap-1 text-red-400 font-bold hover:underline">
                  <span>Details</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DISASTER DETAIL MODAL */}
      <Modal
        isOpen={!!selectedDisaster}
        onClose={() => {
          setSelectedDisaster(null);
          setDisasterDetails(null);
        }}
        title={selectedDisaster?.name || 'Disaster Information'}
        maxWidth="max-w-4xl"
      >
        {loadingDetails || !disasterDetails ? (
          <Skeleton count={2} height="h-32" />
        ) : (
          <div className="space-y-6 text-sm">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <Badge variant={disasterDetails.severity}>{disasterDetails.severity} SEVERITY</Badge>
                <Badge variant={disasterDetails.status}>{disasterDetails.status}</Badge>
                <Badge variant="default">{disasterDetails.type}</Badge>
              </div>
              <span className="text-xs text-slate-400">Start Date: {disasterDetails.start_date}</span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-base">Full Description & Situation Report</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-4 rounded-2xl border border-slate-800">
                {disasterDetails.description}
              </p>
            </div>

            {/* Grid 1: Nearby Shelters & Resources */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">Nearby Relief Shelters</h5>
                {disasterDetails.shelters?.length === 0 ? (
                  <p className="text-xs text-slate-500">No shelters registered in this district</p>
                ) : (
                  <div className="space-y-2">
                    {disasterDetails.shelters?.map((s) => (
                      <div key={s.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between">
                        <div>
                          <span className="font-bold text-white block">{s.name}</span>
                          <span className="text-[10px] text-slate-400">{s.contact_number}</span>
                        </div>
                        <Badge variant={s.status}>{s.capacity - s.occupied_capacity} Left</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">Available Logistics Supplies</h5>
                {disasterDetails.resources?.length === 0 ? (
                  <p className="text-xs text-slate-500">No resources logged</p>
                ) : (
                  <div className="space-y-2">
                    {disasterDetails.resources?.map((r) => (
                      <div key={r.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between">
                        <div>
                          <span className="font-bold text-white block">{r.name}</span>
                          <span className="text-[10px] text-slate-400">{r.category}</span>
                        </div>
                        <span className="font-bold text-amber-400">{r.quantity} {r.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Grid 2: Active Rescue Ops & Guidelines */}
            {disasterDetails.safety_guideline && (
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-2">
                <h5 className="font-bold text-red-400 text-xs uppercase tracking-wider">Immediate Safety Protocol</h5>
                <p className="text-xs text-slate-300 font-semibold">{disasterDetails.safety_guideline.title}</p>
                <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed">
                  {disasterDetails.safety_guideline.during_instructions}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* CREATE DISASTER MODAL (ADMIN ONLY) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Report & Register New Disaster"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Disaster Name / Headline</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Chennai Heavy Monsoon Inundation"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Disaster Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                {['FLOOD', 'EARTHQUAKE', 'CYCLONE', 'FIRE', 'LANDSLIDE', 'TSUNAMI', 'HEATWAVE'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Location City</label>
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
              <label className="block text-slate-300 font-semibold mb-1">Severity Triage</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Affected Headcount</label>
              <input
                type="number"
                value={formData.affected_population}
                onChange={(e) => setFormData({ ...formData, affected_population: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Detailed Description & Field Situation</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              className="px-5 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 shadow-md"
            >
              Publish Disaster & Dispatch Alert
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
