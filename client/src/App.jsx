import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Toast } from './components/common/Toast';

import { LandingPage } from './components/modules/LandingPage';
import { DashboardModule } from './components/modules/DashboardModule';
import { DisastersModule } from './components/modules/DisastersModule';
import { SheltersModule } from './components/modules/SheltersModule';
import { ResourcesModule } from './components/modules/ResourcesModule';
import { RescueOperationsModule } from './components/modules/RescueOperationsModule';
import { VictimsModule } from './components/modules/VictimsModule';
import { ReliefDistributionModule } from './components/modules/ReliefDistributionModule';
import { EmergencyContactsModule } from './components/modules/EmergencyContactsModule';
import { SafetyGuidelinesModule } from './components/modules/SafetyGuidelinesModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { GlobalSearchModule } from './components/modules/GlobalSearchModule';
import { AboutSystemModule } from './components/modules/AboutSystemModule';

export function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const renderModule = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage setActiveTab={setActiveTab} setSearchQuery={setSearchQuery} />;
      case 'dashboard':
        return <DashboardModule setActiveTab={setActiveTab} />;
      case 'disasters':
        return <DisastersModule isHistoryView={false} showToast={showToast} />;
      case 'history':
        return <DisastersModule isHistoryView={true} showToast={showToast} />;
      case 'shelters':
        return <SheltersModule showToast={showToast} />;
      case 'resources':
        return <ResourcesModule showToast={showToast} />;
      case 'rescue':
        return <RescueOperationsModule showToast={showToast} />;
      case 'victims':
        return <VictimsModule showToast={showToast} />;
      case 'relief':
        return <ReliefDistributionModule showToast={showToast} />;
      case 'contacts':
        return <EmergencyContactsModule />;
      case 'guidelines':
        return <SafetyGuidelinesModule />;
      case 'reports':
        return <ReportsModule />;
      case 'search':
        return <GlobalSearchModule searchQuery={searchQuery} setSearchQuery={setSearchQuery} setActiveTab={setActiveTab} />;
      case 'about':
        return <AboutSystemModule />;
      default:
        return <LandingPage setActiveTab={setActiveTab} setSearchQuery={setSearchQuery} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area (with left margin on desktop for sidebar) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          setSearchQuery={setSearchQuery}
        />

        {/* Dynamic Module Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderModule()}
        </main>

        {/* System Footer */}
        <Footer setActiveTab={setActiveTab} />
      </div>

      {/* Global Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
