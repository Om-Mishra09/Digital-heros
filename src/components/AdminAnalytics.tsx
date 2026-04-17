import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Activity, DollarSign, HeartHandshake, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeSubscribers: 0,
    totalPrizePool: 0,
    charityContributions: 0,
  });

  useEffect(() => {
    fetchMetrics();
    
    // Quick polling or rely on single fetch
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch active subscribers + their logic
      const { data: activeProfiles } = await supabase
        .from('profiles')
        .select('charity_contribution_pct')
        .eq('subscription_status', 'active');

      const activeSubscribers = activeProfiles?.length || 0;
      
      // Calculate total charity generation based on a $10 sub rate
      const charitySum = activeProfiles?.reduce((acc, profile) => {
        const pct = profile.charity_contribution_pct || 10; // minimum clamp
        return acc + (10 * (pct / 100));
      }, 0) || 0;

      // Fetch total draws distributed
      const { data: draws } = await supabase
        .from('draws')
        .select('prize_pool');
      
      const prizeSum = draws?.reduce((acc, draw) => acc + (Number(draw.prize_pool) || 0), 0) || 0;

      setMetrics({
        totalUsers: totalUsers || 0,
        activeSubscribers,
        totalPrizePool: prizeSum,
        charityContributions: charitySum,
      });

    } catch (error) {
       console.error("Error fetching analytics payload:", error);
    } finally {
       setLoading(false);
    }
  };

  if (loading) {
     return (
        <div className="flex justify-center items-center py-20">
           <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        </div>
     );
  }

  const CARDS = [
    {
       title: 'Total Network Users',
       value: metrics.totalUsers,
       icon: Users,
       color: 'text-indigo-400',
       bg: 'bg-indigo-500/10',
       borderColor: 'border-indigo-500/20'
    },
    {
       title: 'Active Subscriber Base',
       value: metrics.activeSubscribers,
       icon: Activity,
       color: 'text-emerald-400',
       bg: 'bg-emerald-500/10',
       borderColor: 'border-emerald-500/20'
    },
    {
       title: 'Historical Prize Pool',
       value: `$${metrics.totalPrizePool.toFixed(2)}`,
       icon: DollarSign,
       color: 'text-rose-400',
       bg: 'bg-rose-500/10',
       borderColor: 'border-rose-500/20'
    },
    {
       title: 'Charity Allocation (Est M/R)',
       value: `$${metrics.charityContributions.toFixed(2)}`,
       icon: HeartHandshake,
       color: 'text-amber-400',
       bg: 'bg-amber-500/10',
       borderColor: 'border-amber-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8 border-b border-neutral-800/80 pb-6">
         <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
           Platform Intelligence
         </h2>
         <p className="text-neutral-400 mt-1 text-sm">Real-time telemetry measuring fiscal aggregates and user metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {CARDS.map((card, i) => (
           <motion.div
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden"
           >
             <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 ${card.bg}`} />
             
             <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl border ${card.bg} ${card.borderColor}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
             </div>
             
             <div>
                <h3 className="text-3xl font-black text-white tracking-tight">{card.value}</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mt-1">{card.title}</p>
             </div>
           </motion.div>
         ))}
      </div>
    </div>
  );
}
