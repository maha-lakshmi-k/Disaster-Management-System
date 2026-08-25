import React, { useState, useEffect } from 'react';
import { Search, Flame, Home, Boxes, LifeBuoy, Users, Phone, BookOpen, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

export const GlobalSearchModule = ({ searchQuery = '', setSearchQuery, setActiveTab }) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    if (searchQuery) {
      setLocalQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchQuery]);

  const performSearch = async (q) => {
    if (!q.trim()) return;
    try {
      setLoading(true);
      const res = await api.globalSearch(q);
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchQuery(localQuery.trim());
      performSearch(localQuery.trim());
    }
  };

  const categories = [
    { id: 'ALL', label: 'All Results' },
    { id: 'disasters', label: 'Disasters' },
    { id: 'shelters', label: 'Shelters' },
    { id: 'resources', label: 'Resources' },
    { id: 'rescue_operations', label: 'Rescue Ops' },
    { id: 'victims', label: 'Victims' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'guidelines', label: 'Safety Guides' },
  ];

  const suggestions = ['Chennai', 'Wayanad', 'Flood', 'Water', 'Medical', 'NDRF', 'Shelter', 'Landslide'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Search Header */}
      <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">System-Wide Global Search</h1>
          <p className="text-xs text-slate-400 mt-1">Cross-table query engine across disasters, locations, shelters, resources, rescue ops, victims, guidelines & hotlines</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search anything (e.g. 'Chennai', 'Flood', 'Medical', 'Salt Lake')..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-red-500 shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-red-600/30"
          >
            Search
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-semibold">Popular Queries:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setLocalQuery(s);
                setSearchQuery(s);
                performSearch(s);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      {results && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((c) => {
            const count = c.id === 'ALL' ? results.total_count : results.results[c.id]?.length || 0;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeCategory === c.id
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{c.label}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-[10px]">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results Content */}
      {loading ? (
        <Skeleton count={4} height="h-28" />
      ) : !results || results.total_count === 0 ? (
        <EmptyState title="No results found" message="Try searching for a different keyword like 'Chennai', 'Flood', or 'Water'." />
      ) : (
        <div className="space-y-6">
          {/* Disasters */}
          {(activeCategory === 'ALL' || activeCategory === 'disasters') && results.results.disasters?.length > 0 && (
            <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span>Disasters ({results.results.disasters.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.results.disasters.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setActiveTab('disasters')}
                    className="p-4 rounded-2xl glass-card cursor-pointer space-y-2 border border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant={d.severity}>{d.severity}</Badge>
                      <Badge variant={d.status}>{d.status}</Badge>
                    </div>
                    <h4 className="font-bold text-white text-sm">{d.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{d.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shelters */}
          {(activeCategory === 'ALL' || activeCategory === 'shelters') && results.results.shelters?.length > 0 && (
            <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>Shelters ({results.results.shelters.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.results.shelters.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setActiveTab('shelters')}
                    className="p-4 rounded-2xl glass-card cursor-pointer space-y-2 border border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{s.name}</span>
                      <Badge variant={s.status}>{s.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-400">{s.address}, {s.city}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {(activeCategory === 'ALL' || activeCategory === 'resources') && results.results.resources?.length > 0 && (
            <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-4 h-4" />
                <span>Resource Stock ({results.results.resources.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.results.resources.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl glass-card space-y-1 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{r.name}</span>
                      <span className="font-extrabold text-amber-400 text-xs">{r.quantity} {r.unit}</span>
                    </div>
                    <p className="text-xs text-slate-400">{r.category} • Depot: {r.city}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
