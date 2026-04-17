import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart, Trash2, Shield, UserX, UserCheck, PlusCircle, Loader2 } from 'lucide-react';

export default function AdminManagement() {
  const [activeSegment, setActiveSegment] = useState<'users' | 'charities'>('users');
  
  // States
  const [profiles, setProfiles] = useState<any[]>([]);
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charity Form States
  const [cName, setCName] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cImageUrl, setCImageUrl] = useState('');
  const [cSaving, setCSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profRes, charRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('charities').select('*').order('name')
      ]);

      if (profRes.error) throw profRes.error;
      if (charRes.error) throw charRes.error;

      setProfiles(profRes.data || []);
      setCharities(charRes.data || []);
    } catch (error) {
      console.error('Management Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscription = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await supabase
         .from('profiles')
         .update({ subscription_status: newStatus })
         .eq('id', userId);
         
      if (error) throw error;
      
      // Update local state smoothly
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, subscription_status: newStatus } : p));
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const addCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName) return;
    setCSaving(true);
    try {
      const { error } = await supabase.from('charities').insert([{
         name: cName,
         description: cDesc,
         image_url: cImageUrl || null
      }]);
      
      if (error) throw error;
      
      setCName('');
      setCDesc('');
      setCImageUrl('');
      fetchData(); // reload charities list
    } catch (err: any) {
      console.error('Add charity error:', err);
      alert('Could not add charity: ' + err.message);
    } finally {
      setCSaving(false);
    }
  };

  const deleteCharity = async (id: string) => {
    if (!window.confirm("Delete this charity from the database? Users supporting it will lose their mapping.")) return;
    try {
       const { error } = await supabase.from('charities').delete().eq('id', id);
       if (error) throw error;
       setCharities(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
       console.error('Delete charity error:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex border-b border-neutral-800">
         <button
           onClick={() => setActiveSegment('users')}
           className={`pb-4 px-6 font-semibold flex items-center transition-colors border-b-2 ${
             activeSegment === 'users' ? 'border-rose-500 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
           }`}
         >
           <Users className="w-4 h-4 mr-2" /> Application Network
         </button>
         <button
           onClick={() => setActiveSegment('charities')}
           className={`pb-4 px-6 font-semibold flex items-center transition-colors border-b-2 ${
             activeSegment === 'charities' ? 'border-amber-500 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
           }`}
         >
           <Heart className="w-4 h-4 mr-2" /> Global Partners
         </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
           <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeSegment === 'users' ? (
             <motion.div
               key="users"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl"
             >
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm text-neutral-400">
                      <thead className="text-xs text-neutral-500 uppercase bg-neutral-950/50 border-b border-neutral-800">
                          <tr>
                              <th className="px-6 py-4 font-semibold">User Hash / Identity</th>
                              <th className="px-6 py-4 font-semibold">Privileges</th>
                              <th className="px-6 py-4 font-semibold">Stripe State</th>
                              <th className="px-6 py-4 font-semibold text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                          {profiles.map((p) => (
                             <tr key={p.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-neutral-300">
                                   {/* If relying strictly on Profiles and not exposing Auth, we display ID */}
                                   <span className="bg-neutral-950 px-2 py-1 rounded border border-neutral-800" title={p.id}>
                                     {p.id.substring(0, 12)}...{p.id.slice(-4)}
                                   </span>
                                </td>
                                <td className="px-6 py-4">
                                   {p.role === 'admin' ? (
                                     <span className="flex items-center text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full w-fit font-bold">
                                       <Shield className="w-3 h-3 mr-1" /> System Admin
                                     </span>
                                   ) : (
                                     <span className="text-xs text-neutral-400">Standard</span>
                                   )}
                                </td>
                                <td className="px-6 py-4">
                                   {p.subscription_status === 'active' ? (
                                      <span className="text-emerald-400 font-bold">Active</span>
                                   ) : (
                                      <span className="text-neutral-500 font-medium">Inactive</span>
                                   )}
                                </td>
                                <td className="px-6 py-4 flex justify-end">
                                   <button 
                                      onClick={() => toggleSubscription(p.id, p.subscription_status)}
                                      className="flex items-center text-xs font-bold px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                                   >
                                      {p.subscription_status === 'active' ? (
                                         <><UserX className="w-3.5 h-3.5 mr-1" /> Demote</>
                                      ) : (
                                         <><UserCheck className="w-3.5 h-3.5 mr-1" /> Upgrade</>
                                      )}
                                   </button>
                                </td>
                             </tr>
                          ))}
                      </tbody>
                   </table>
                </div>
             </motion.div>
          ) : (
             <motion.div
               key="charities"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="grid grid-cols-1 lg:grid-cols-3 gap-6"
             >
                {/* Charity List */}
                <div className="lg:col-span-2 space-y-4">
                   {charities.map(c => (
                      <div key={c.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl flex items-center justify-between group shadow-lg">
                         <div className="flex items-center space-x-4">
                            {c.image_url ? (
                              <img src={c.image_url} alt={c.name} className="w-12 h-12 object-cover rounded-md border border-neutral-700" />
                            ) : (
                              <div className="w-12 h-12 bg-neutral-800 rounded-md border border-neutral-700 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-neutral-500" />
                              </div>
                            )}
                            <div>
                               <h4 className="font-bold text-neutral-200">{c.name}</h4>
                               <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{c.description || 'No description assigned.'}</p>
                            </div>
                         </div>
                         <button
                           onClick={() => deleteCharity(c.id)} 
                           className="p-2 text-neutral-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                   ))}
                   
                   {charities.length === 0 && (
                      <div className="p-10 border border-neutral-800 border-dashed rounded-xl text-center text-neutral-500 font-medium">
                         Your global partner directory is currently empty.
                      </div>
                   )}
                </div>

                {/* Create Charity Form */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl h-fit">
                   <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                     <PlusCircle className="w-5 h-5 mr-2 text-amber-500" /> Add Record
                   </h3>
                   <form onSubmit={addCharity} className="space-y-4">
                      <div>
                         <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Partner Name</label>
                         <input 
                           required 
                           type="text" 
                           value={cName}
                           onChange={e => setCName(e.target.value)}
                           className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-amber-500/50" 
                         />
                      </div>
                      <div>
                         <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Statement & Goal</label>
                         <textarea 
                           rows={3}
                           value={cDesc}
                           onChange={e => setCDesc(e.target.value)}
                           className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-amber-500/50 custom-scrollbar resize-none" 
                         />
                      </div>
                      <div>
                         <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Identity Banner (URL)</label>
                         <input 
                           type="url" 
                           value={cImageUrl}
                           onChange={e => setCImageUrl(e.target.value)}
                           placeholder="https://..."
                           className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-amber-500/50" 
                         />
                      </div>
                      <button 
                         disabled={cSaving}
                         type="submit" 
                         className="w-full mt-4 flex justify-center items-center py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                      >
                         {cSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Append to Database'}
                      </button>
                   </form>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
