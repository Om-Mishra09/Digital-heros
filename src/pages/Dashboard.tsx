import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, User as UserIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ScoreManager from '../components/ScoreManager';
import CharitySelector from '../components/CharitySelector';
import SubscriptionManager from '../components/SubscriptionManager';
import UserWinnings from '../components/UserWinnings';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const hasActiveSubscription = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing';

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center text-indigo-500">
        <Loader2 className="animate-spin h-10 w-10 mb-4" />
        <p className="text-neutral-400 font-medium animate-pulse">Loading dashboard elements...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30">
      {/* Decorative ambient blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-white tracking-wider text-xl">D</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 to-neutral-400">
              Digital Heroes
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center text-sm font-medium text-neutral-400 bg-neutral-900/50 py-1.5 px-3 rounded-full border border-neutral-800/80">
              <UserIcon className="h-4 w-4 mr-2 text-indigo-400" />
              {user?.email}
            </div>
            {hasActiveSubscription && (
              <div className="hidden lg:flex items-center text-xs font-bold uppercase tracking-wider text-green-400 bg-green-500/10 py-1 px-3 rounded-full border border-green-500/20">
                Pro Subscriber
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={signOut}
              className="flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors border border-rose-500/20"
            >
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
          >
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-200">{user?.email?.split('@')[0]}</span>
          </motion.h2>
          <p className="mt-2 text-neutral-400 text-lg">
            {hasActiveSubscription 
              ? "Manage your performance track record and social impact below." 
              : "Upgrade your account to unlock full access to the digital heroes platform."}
          </p>
        </div>

        {/* Conditional Paywall Logic */}
        {!hasActiveSubscription ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <SubscriptionManager />
          </motion.div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - ScoreManager */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col min-h-[500px]"
              >
                <ScoreManager />
              </motion.div>

              {/* Right Column - CharitySelector */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col min-h-[500px]"
              >
                <CharitySelector />
              </motion.div>
            </div>
            
            {/* Full Width Footer Grid Block - User Winnings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
               <UserWinnings />
            </motion.div>
          </div>
        )}
        
      </main>
    </div>
  );
}
