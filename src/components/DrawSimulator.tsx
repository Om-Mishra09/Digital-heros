import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Dices, PlayCircle, Trophy, Users, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface WinnerRecord {
  user_id: string;
  matches: number;
  payout: number;
}

export default function DrawSimulator() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [drawMode, setDrawMode] = useState<'random' | 'algorithmic'>('random');
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const CONTRIBUTION_MOCK = 2.50;
  const prizePool = activeUsers * CONTRIBUTION_MOCK;

  useEffect(() => {
    fetchActiveUsers();
  }, []);

  const fetchActiveUsers = async () => {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active');
        
      if (error) throw error;
      setActiveUsers(count || 0);
    } catch (error) {
      console.error('Error fetching active subscribers:', error);
    }
  };

  const generateNumbers = () => {
    const nums: number[] = [];
    while (nums.length < 5) {
      // Mock algorithmic logic: slightly favors numbers 1-20
      let rand = Math.floor(Math.random() * 45) + 1;
      if (drawMode === 'algorithmic' && Math.random() > 0.7) {
        rand = Math.floor(Math.random() * 20) + 1;
      }
      if (!nums.includes(rand)) {
        nums.push(rand);
      }
    }
    return nums.sort((a, b) => a - b);
  };

  const executeSimulation = async () => {
    setIsSimulating(true);
    setWinners([]);
    setMessage(null);
    try {
      // 1. Generate 5 winning numbers
      const drawnNumbers = generateNumbers();
      setWinningNumbers(drawnNumbers);

      // 2. Fetch all scores descending
      const { data: scores, error } = await supabase
        .from('scores')
        .select('user_id, score, date')
        .order('date', { ascending: false });

      if (error) throw error;

      // Group scores by user and take only their top 5 latest
      const userLatestScores: Record<string, number[]> = {};
      if (scores) {
         scores.forEach(s => {
           if (!userLatestScores[s.user_id]) userLatestScores[s.user_id] = [];
           if (userLatestScores[s.user_id].length < 5) {
             userLatestScores[s.user_id].push(s.score);
           }
         });
      }

      // 3. Find Matches
      const match5: string[] = [];
      const match4: string[] = [];
      const match3: string[] = [];

      Object.entries(userLatestScores).forEach(([userId, uScores]) => {
         const matchesCount = uScores.filter(scoreVal => drawnNumbers.includes(scoreVal)).length;
         if (matchesCount === 5) match5.push(userId);
         else if (matchesCount === 4) match4.push(userId);
         else if (matchesCount === 3) match3.push(userId);
      });

      // 4. Calculate Payouts
      const payout5 = match5.length > 0 ? (prizePool * 0.40) / match5.length : 0;
      const payout4 = match4.length > 0 ? (prizePool * 0.35) / match4.length : 0;
      const payout3 = match3.length > 0 ? (prizePool * 0.25) / match3.length : 0;

      const results: WinnerRecord[] = [];
      match5.forEach(id => results.push({ user_id: id, matches: 5, payout: payout5 }));
      match4.forEach(id => results.push({ user_id: id, matches: 4, payout: payout4 }));
      match3.forEach(id => results.push({ user_id: id, matches: 3, payout: payout3 }));

      setWinners(results.sort((a, b) => b.matches - a.matches));

    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: 'Simulation failed: ' + error.message });
    } finally {
      setIsSimulating(false);
    }
  };

  const publishDraw = async () => {
    if (winningNumbers.length === 0) return;
    setIsPublishing(true);
    setMessage(null);
    try {
      // 1. Insert Draw
      const { data: drawRecord, error: drawError } = await supabase
        .from('draws')
        .insert([{ 
          winning_numbers: winningNumbers, 
          prize_pool: prizePool,
          draw_mode: drawMode 
        }])
        .select()
        .single();
        
      if (drawError) throw drawError;

      // 2. Insert Winners if any
      if (winners.length > 0) {
        const winnerInserts = winners.map(w => ({
          draw_id: drawRecord.id,
          user_id: w.user_id,
          match_tier: w.matches,
          payout: w.payout
        }));
        
        const { error: winnersError } = await supabase.from('winners').insert(winnerInserts);
        if (winnersError) throw winnersError;
      }

      setMessage({ type: 'success', text: 'Draw successfully published and winners logged!' });
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to publish draw: ' + error.message });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-lg backdrop-blur-sm flex items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Users size={80} />
           </div>
           <div className="p-3 bg-indigo-500/10 rounded-xl mr-4 border border-indigo-500/20">
             <Users className="w-6 h-6 text-indigo-400" />
           </div>
           <div>
             <p className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Active Users</p>
             <h3 className="text-3xl font-extrabold text-white">{activeUsers}</h3>
           </div>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-lg backdrop-blur-sm flex items-center col-span-1 md:col-span-2 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Calculator size={80} />
           </div>
           <div className="p-3 bg-emerald-500/10 rounded-xl mr-4 border border-emerald-500/20">
             <Calculator className="w-6 h-6 text-emerald-400" />
           </div>
           <div>
             <p className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Estimated Prize Pool</p>
             <h3 className="text-3xl font-extrabold text-white">
               ${prizePool.toFixed(2)}
             </h3>
             <p className="text-xs text-neutral-500 mt-1">Based on {activeUsers} subscribers x ${CONTRIBUTION_MOCK.toFixed(2)}</p>
           </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 border-b border-neutral-800/80 pb-8">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-indigo-400">
              Draw Engine Simulation
            </h2>
            <p className="text-neutral-400 mt-1 text-sm">Configure logic and execute the drawing sequence.</p>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="bg-neutral-950 p-1.5 rounded-lg flex border border-neutral-800">
               <button
                 onClick={() => setDrawMode('random')}
                 className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                   drawMode === 'random' ? 'bg-indigo-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                 }`}
               >
                 Pure Random
               </button>
               <button
                 onClick={() => setDrawMode('algorithmic')}
                 className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                   drawMode === 'algorithmic' ? 'bg-rose-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                 }`}
               >
                 Algorithmic
               </button>
             </div>

             <button
                onClick={executeSimulation}
                disabled={isSimulating}
                className="flex items-center px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-lg shadow-lg transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50"
             >
                {isSimulating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <PlayCircle className="w-5 h-5 mr-2" />}
                Run Draw
             </button>
          </div>
        </div>

        {/* Results Area */}
        <AnimatePresence>
          {winningNumbers.length > 0 && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="space-y-8"
            >
              
              <div className="text-center">
                <p className="text-sm font-bold text-neutral-500 mb-4 tracking-[0.2em] uppercase">Winning Numbers</p>
                <div className="flex justify-center flex-wrap gap-4">
                  {winningNumbers.map((num, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.1, type: 'spring' }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-rose-500/20 border-2 border-white/10"
                    >
                      {num}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-950/50 rounded-xl overflow-hidden border border-neutral-800">
                <div className="px-6 py-4 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
                  <h3 className="font-semibold text-neutral-200">Simulation Payouts</h3>
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 py-1 px-3 rounded-full border border-indigo-500/20">
                    {winners.length} winners found
                  </span>
                </div>
                
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {winners.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500">
                      <Trophy className="w-8 h-8 opacity-20 mx-auto mb-2" />
                      <p>No matches found in this draw.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm text-neutral-400">
                      <thead className="text-xs text-neutral-500 uppercase bg-neutral-900/50 border-b border-neutral-800 sticky top-0">
                          <tr>
                              <th className="px-6 py-3 font-semibold">User ID</th>
                              <th className="px-6 py-3 font-semibold text-center">Matches</th>
                              <th className="px-6 py-3 font-semibold text-right">Calculated Payout</th>
                          </tr>
                      </thead>
                      <tbody>
                          {winners.map((w, i) => (
                            <tr key={i} className="border-b border-neutral-800/50 hover:bg-neutral-900/30 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs">{w.user_id}</td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`inline-flex py-1 px-2.5 rounded-full text-xs font-bold
                                    ${w.matches === 5 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                                      w.matches === 4 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                                      'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'}`}>
                                    {w.matches}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-white">
                                  ${w.payout.toFixed(2)}
                                </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-xl flex items-start space-x-3 border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <p className="text-sm font-medium pt-0.5">{message.text}</p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-neutral-800">
                <button
                   onClick={publishDraw}
                   disabled={isPublishing}
                   className="flex items-center px-6 py-3 bg-neutral-100 hover:bg-white text-neutral-950 font-extrabold rounded-lg shadow-xl shadow-white/5 transition-all focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50"
                >
                   {isPublishing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                   Publish Official Draw
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
