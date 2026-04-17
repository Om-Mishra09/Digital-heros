import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2, Search, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function AdminVerification() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      // We look for anything that has proof_url to verify,
      // and isn't strictly 'paid' (e.g. standard 'pending' or missing status)
      const { data, error } = await supabase
        .from('winners')
        .select(`*, draws(created_at)`)
        // Usually you can pull profiles(email) if a foreign key is properly established in Supabase
        // Example: .select(`*, draws(created_at), profiles(email)`)
        .not('proof_url', 'is', null)
        .neq('payment_status', 'paid')
        .order('id', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (e: any) {
      console.error('Fetch pending verifications error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (recordId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingId(recordId);
      
      const updates = action === 'approve' 
        ? { payment_status: 'paid' } 
        : { proof_url: null, payment_status: 'pending' };

      const { error } = await supabase.from('winners').update(updates).eq('id', recordId);
      if (error) throw error;

      // Optimistically remove from view rather than full refetch
      setRecords(prev => prev.filter(r => r.id !== recordId));
    } catch (e: any) {
      console.error('Failed to act on record:', e);
      alert(`Action failed: ${e.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
     return (
        <div className="flex justify-center items-center py-20">
           <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
        </div>
     );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-6 mb-8">
           <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400">
                Verification Queue
              </h2>
              <p className="text-neutral-400 mt-1 text-sm">Approve uploaded score proofs to dispatch payouts.</p>
           </div>
           <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-500/20">
             {records.length} Pending
           </div>
        </div>

        {records.length === 0 ? (
           <div className="text-center py-16 text-neutral-500 bg-neutral-950/40 rounded-xl border border-neutral-800 border-dashed">
             <Search className="w-12 h-12 mx-auto opacity-30 mb-4" />
             <p className="font-medium text-lg text-neutral-400">Queue is Clear</p>
             <p className="text-sm">No pending proofs are waiting for administrator review.</p>
           </div>
        ) : (
           <div className="space-y-6">
             <AnimatePresence>
                {records.map(record => (
                   <motion.div
                     key={record.id}
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95, height: 0 }}
                     className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-lg"
                   >
                      {/* Image Preview Block */}
                      <div className="md:w-1/3 bg-neutral-900 border-r border-neutral-800 relative group overflow-hidden flex justify-center items-center min-h-[200px]">
                         <img 
                           src={record.proof_url} 
                           alt="Proof Screenshot" 
                           className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" 
                         />
                         <a 
                           href={record.proof_url} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           title="View Full Resolution"
                           className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                            <ExternalLink className="w-8 h-8 text-white drop-shadow-md" />
                         </a>
                      </div>

                      {/* Detail Block */}
                      <div className="md:w-2/3 p-6 flex flex-col justify-between">
                         <div>
                            <div className="flex justify-between items-start mb-4">
                               <div>
                                 <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
                                   Match Payout Request
                                 </span>
                                 <h3 className="text-3xl font-black text-emerald-400">
                                   ${Number(record.payout).toFixed(2)}
                                 </h3>
                               </div>
                               <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded">
                                 {record.match_tier} Matches
                               </div>
                            </div>

                            <div className="space-y-1 mt-6 text-sm text-neutral-400">
                               <p><strong className="text-neutral-200">User ID:</strong> <span className="font-mono text-xs">{record.user_id}</span></p>
                               <p><strong className="text-neutral-200">Draw Reference:</strong> Draw {record.draw_id} on {new Date(record.draws?.created_at || Date.now()).toLocaleDateString()}</p>
                            </div>
                         </div>

                         {/* Actions */}
                         <div className="flex grid grid-cols-2 gap-4 mt-6">
                            <button
                               onClick={() => handleAction(record.id, 'reject')}
                               disabled={processingId === record.id}
                               className="flex justify-center items-center py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-rose-500/50 text-neutral-300 hover:text-rose-400 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                            >
                               {processingId === record.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-2" /> Reject & Destroy</>}
                            </button>
                            <button
                               onClick={() => handleAction(record.id, 'approve')}
                               disabled={processingId === record.id}
                               className="flex justify-center items-center py-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                            >
                               {processingId === record.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Verify Authenticity</>}
                            </button>
                         </div>
                      </div>
                   </motion.div>
                ))}
             </AnimatePresence>
           </div>
        )}
      </div>

    </div>
  );
}
