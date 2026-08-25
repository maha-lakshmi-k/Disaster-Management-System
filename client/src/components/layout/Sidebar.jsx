import React from 'react';
import {
  LayoutDashboard,
  Flame,
  History,
  Home,
  Boxes,
  LifeBuoy,
  Users,
  Gift,
  Phone,
  BookOpen,
  BarChart3,
  Search,
  Database,
  ChevronRight,
  Shield,
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const menuCategories = [
    {
      title: 'COMMAND CENTER',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'disasters', label: 'Active Disasters', icon: Flame },
        { id: 'history', label: 'Disaster History', icon: History },
      ],
    },
    {
      title: 'RESPONSE & OPERATIONS',
      items: [
        { id: 'shelters', label: 'Shelters Finder', icon: Home },
        { id: 'resources', label: 'Resource Inventory', icon: Boxes },
        { id: 'rescue', label: 'Rescue Operations', icon: LifeBuoy },
        { id: 'victims', label: 'Victims Registry', icon: Users },
        { id: 'relief', label: 'Relief Distribution', icon: Gift },
      ],
    },
    {
      title: 'PUBLIC INFORMATION',
      items: [
        { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
        { id: 'guidelines', label: 'Safety Guidelines', icon: BookOpen },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
        { id: 'search', label: 'Global Search', icon: Search },
        { id: 'about', label: 'About DBMS System', icon: Database },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden animate-fadeIn"
        ></div>
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 glass-panel bg-slate-950/95 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-500">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wide block">DISASTER PORTAL</span>
              <span className="text-[10px] text-slate-400 font-semibold block">v1.0 • DBMS Relational</span>
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {menuCategories.map((cat, idx) => (
            <div key={idx} className="space-y-1">
              <h5 className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {cat.title}
              </h5>
              <div className="space-y-0.5 mt-2">
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                        isActive
                          ? 'bg-red-600/20 text-white border border-red-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-red-400' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-red-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Status Indicator */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <div>
              <span className="text-[11px] font-bold text-slate-200 block">DB ENGINE ONLINE</span>
              <span className="text-[10px] text-slate-400 block">SQLite / MySQL Relational</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
