import React, { useState, useEffect } from 'react';
import { Search, Bell, ShieldAlert, PhoneCall, User, Menu, ChevronDown, Check } from 'lucide-react';
import { api, getGlobalRole, setGlobalRole } from '../../services/api';

export const Navbar = ({ activeTab, setActiveTab, onToggleSidebar, setSearchQuery }) => {
  const [currentRole, setCurrentRole] = useState(getGlobalRole());
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleRoleChange = (role) => {
    setGlobalRole(role);
    setCurrentRole(role);
    setIsRoleDropdownOpen(false);
    // Reload page or trigger state update
    window.location.reload();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchQuery(localSearch.trim());
      setActiveTab('search');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const roles = [
    { id: 'ADMIN', label: 'Admin (Full Access)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    { id: 'RESPONSE_TEAM', label: 'Response Team (Field Rescue)', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
    { id: 'PUBLIC', label: 'Public User (Read Only)', color: 'bg-slate-700/50 text-slate-300 border-slate-600' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel bg-slate-950/90 border-b border-slate-800/80 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & System Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors lg:hidden"
            title="Toggle Sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500 group-hover:scale-105 transition-transform pulse-emergency">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-none">
                DISASTER<span className="text-red-500">NET</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Emergency Command Portal
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Global Search (e.g. 'Chennai', 'Flood', 'Shelter', 'Medical')..."
              className="w-full pl-10 pr-24 py-2 bg-slate-900/90 border border-slate-700/70 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Emergency Helpline CTA */}
          <button
            onClick={() => setActiveTab('contacts')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-xl font-bold text-xs transition-all shadow-sm"
          >
            <PhoneCall className="w-4 h-4 text-red-400 animate-bounce" />
            <span>SOS 112 / 1078</span>
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-all shadow-sm"
            >
              <span className="text-slate-400">Role:</span>
              <span className="text-red-400 font-bold">{currentRole}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 glass-panel bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Switch System Role</p>
                  <p className="text-[11px] text-slate-400">Toggles permission levels for viva testing</p>
                </div>
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRoleChange(r.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-800 transition-colors text-left"
                  >
                    <span className="text-slate-200">{r.label}</span>
                    {currentRole === r.id && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Alert Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-slate-950 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live System Alerts</h4>
                  <span className="text-[11px] text-slate-400">{unreadCount} unread</span>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No active notifications</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          n.is_read
                            ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                            : 'bg-red-950/30 border-red-500/30 text-slate-200 hover:bg-red-950/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-red-400">{n.title}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
