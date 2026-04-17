import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Trophy, Upload, CheckCircle2, Clock, Loader2, FileImage } from 'lucide-react';

export default function UserWinnings() {
  const { user } = useAuth();
  const [winnings, setWinnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchWinnings();
  }, [user]);

  const fetchWinnings = async () => {
    try {
      const { data, error } = await supabase
        .from('winners')
        .select(`*, draws(created_at)`)
        .eq('user_id', user?.id)
        .order('id', { ascending: false });

      if (error) throw error;
      setWinnings(data || []);
    } catch (error: any) {
      console.error('Error fetching winnings:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, recordId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingId(recordId);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}_${recordId}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('proofs').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('winners')
        .update({ proof_url: publicUrlData.publicUrl, payment_status: 'pending' })
        .eq('id', recordId);

      if (updateError) throw updateError;
      
      // Refresh local data
      fetchWinnings();

    } catch (err: any) {
      console.error('Failed to upload proof:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingId(null);
      // reset the file input
      e.target.value = '';
    }
  };

  if (loading) {
     return (
        <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-6 flex justify-center items-center backdrop-blur-md min-h-[200px]">
           <Loader2 className="animate-spin text-rose-500 w-8 h-8" />
        </div>
     );
  }

  if (winnings.length === 0) {
     return (
        <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/60 rounded-2xl p-10 flex flex-col justify-center items-center text-center opacity-70">
           <Trophy className="w-12 h-12 text-neutral-600 mb-3" />
           <p className="text-neutral-400 text-sm font-medium">You haven't hit any winning matches yet.</p>
           <p className="text-neutral-500 text-xs mt-1">Keep playing to earn rewards!</p>
        </div>
     );
  }

  return (
    <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Trophy size={160} />
      </div>

      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
          <Trophy className="h-5 w-5 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-neutral-100 tracking-tight">Your Action Rewards</h2>
      </div>

      <div className="space-y-4 relative z-10 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {winnings.map((w) => {
           const isPaid = w.payment_status === 'paid';
           const isPendingReview = w.payment_status === 'pending' && !!w.proof_url;
           const needsProof = (!w.payment_status || w.payment_status === 'pending') && !w.proof_url;
           
           return (
             <motion.div
               key={w.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-700/80 transition-colors"
             >
                <div className="flex flex-col">
                   <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-1">
                     Draw {w.draw_id} • {new Date(w.draws?.created_at || new Date()).toLocaleDateString()}
                   </span>
                   <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-black text-white">${Number(w.payout).toFixed(2)}</span>
                      <span className="text-sm font-semibold text-rose-400 border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 rounded">
                        {w.match_tier} Matches
                      </span>
                   </div>
                </div>

                <div className="flex items-center mt-2 md:mt-0">
                   {isPaid && (
                      <span className="inline-flex items-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-bold shadow-lg">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Reward Dispersed
                      </span>
                   )}

                   {isPendingReview && (
                      <span className="inline-flex items-center px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm font-bold shadow-lg">
                        <Clock className="w-4 h-4 mr-2" /> Proof Under Review
                      </span>
                   )}

                   {needsProof && (
                      <div className="relative">
                        <input
                           type="file"
                           accept="image/*"
                           onChange={(e) => handleUpload(e, w.id)}
                           disabled={uploadingId === w.id}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                           id={`proof-upload-${w.id}`}
                        />
                        <button 
                           disabled={uploadingId === w.id}
                           className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 border border-indigo-400/50 rounded-lg text-white text-sm font-bold shadow-lg transition-all disabled:opacity-50"
                        >
                           {uploadingId === w.id ? (
                             <>
                               <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                             </>
                           ) : (
                             <>
                               <Upload className="w-4 h-4 mr-2" /> Upload Screenshot
                               <FileImage className="w-3.5 h-3.5 ml-2 opacity-50" />
                             </>
                           )}
                        </button>
                      </div>
                   )}
                </div>
             </motion.div>
           );
        })}
      </div>
    </div>
  );
}
