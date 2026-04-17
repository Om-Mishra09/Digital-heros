import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, ShieldAlert, Dices, ImagePlus, BarChart3, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import DrawSimulator from '../components/DrawSimulator';
import AdminVerification from '../components/AdminVerification';
import AdminAnalytics from '../components/AdminAnalytics';
import AdminManagement from '../components/AdminManagement';

type AdminTab = 'analytics' | 'management' | 'draws' | 'verifications';

export default function AdminDashboard() {
  const { userRole, signOut, loading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        <p className="text-neutral-500 mt-4 font-mono text-sm uppercase tracking-widest">Verifying clearance...</p>
      </div>
    );
  }

  // Protection layer
  if (!user || userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const TABS = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'management', label: 'Management', icon: Settings2 },
    { id: 'draws', label: 'Engine', icon: Dices },
    { id: 'verifications', label: 'Verification', icon: ImagePlus },
  ] as const;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-rose-500/30">
      {/* Admin specific top navigation */}
      <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-rose-900/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-md bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(244,63,94,0.5)]">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                Admin <span className="hidden sm:inline font-light text-rose-500">Center</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
               onClick={() => window.location.href = '/dashboard'}
               className="hidden md:flex items-center hover:bg-neutral-900 py-2 px-3 rounded-md text-sm text-neutral-400 transition-colors"
            >
               <LayoutDashboard className="w-4 h-4 mr-2" /> User View
            </button>
            <button
              onClick={signOut}
              className="flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors border border-neutral-800"
            >
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 overflow-hidden">
        
        {/* Navigation Wrapper */}
        <div className="mb-8 overflow-x-auto custom-scrollbar border-b border-neutral-800 pb-2">
           <div className="flex space-x-2 min-w-max">
             {TABS.map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center px-5 py-2.5 rounded-lg font-semibold text-sm transition-all relative ${
                    activeTab === tab.id ? 'text-white' : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50'
                  }`}
               >
                  <tab.icon className="w-4 h-4 mr-2 relative z-10" /> 
                  <span className="relative z-10">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div 
                       layoutId="admin-active-tab"
                       className="absolute inset-0 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg"
                       transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
               </button>
             ))}
           </div>
        </div>

        {/* Dynamic Views Pipeline */}
        <div className="relative">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
             >
               {activeTab === 'analytics' && <AdminAnalytics />}
               {activeTab === 'management' && <AdminManagement />}
               {activeTab === 'draws' && <DrawSimulator />}
               {activeTab === 'verifications' && <AdminVerification />}
             </motion.div>
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
