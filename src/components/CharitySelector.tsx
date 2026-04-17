import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Heart, Loader2, CheckCircle2, ChevronDown, HandCoins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Charity {
  id: string;
  name: string;
  description: string | null;
}

interface Profile {
  id: string;
  charity_id: string | null;
  charity_contribution_pct: number;
}

export default function CharitySelector() {
  const { user } = useAuth();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [percentage, setPercentage] = useState<number>(10);
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch available charities
      const { data: charityData, error: charityError } = await supabase
        .from('charities')
        .select('*')
        .order('name');
        
      if (charityError) throw charityError;
      setCharities(charityData || []);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      
      if (profileData) {
        setProfile(profileData);
        if (profileData.charity_id) setSelectedCharity(profileData.charity_id);
        if (profileData.charity_contribution_pct) setPercentage(profileData.charity_contribution_pct);
      }
    } catch (err: any) {
      console.error('Error fetching charities data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    // Enforce 10% minimum contribution
    const validPct = Math.max(10, Math.min(100, percentage));
    
    try {
      setSaving(true);
      const payload = {
        id: user.id, // Ensure uuid matches auth
        charity_id: selectedCharity,
        charity_contribution_pct: validPct,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      setPercentage(validPct); // visually update if was < 10
    } catch (err: any) {
      console.error("Failed to save profile selections:", err.message);
      alert('Failed to save your selections. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // If user changes % let's ensure minimum is auto-enforced on local state blur or save
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPercentage(Number(e.target.value));
  };
  
  const enforcePercentageLimits = () => {
    if (percentage < 10) setPercentage(10);
    if (percentage > 100) setPercentage(100);
  };

  return (
    <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Heart size={120} />
      </div>

      <div className="flex flex-col mb-6 space-y-1">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-rose-500/20 rounded-lg border border-rose-500/30">
            <Heart className="h-5 w-5 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-neutral-100 tracking-tight">Impact</h2>
        </div>
        <p className="text-sm text-neutral-400">Choose a cause to support with your participation.</p>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-rose-500" />
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between">
          
          <div className="space-y-4 mb-8">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Select Charity
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              {charities.map((charity) => {
                const isSelected = selectedCharity === charity.id;
                return (
                  <motion.div
                    key={charity.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCharity(charity.id)}
                    className={`cursor-pointer border rounded-xl p-4 transition-all duration-200 ${
                      isSelected 
                        ? 'bg-rose-500/10 border-rose-500/50 shadow-inner' 
                        : 'bg-neutral-950/40 border-neutral-800/50 hover:border-rose-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className={`font-semibold ${isSelected ? 'text-rose-400' : 'text-neutral-200'}`}>
                        {charity.name}
                      </h4>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-rose-500 shrink-0" />
                      )}
                    </div>
                    {charity.description && (
                      <p className="text-xs text-neutral-500 mt-2 line-clamp-2">
                        {charity.description}
                      </p>
                    )}
                  </motion.div>
                );
              })}
              
              {charities.length === 0 && (
                <div className="col-span-full py-6 text-center text-neutral-500 text-sm italic">
                  No charities available at the moment.
                </div>
              )}
            </div>
          </div>

          <div className="bg-neutral-950/60 p-5 rounded-xl border border-neutral-800/80 mt-auto">
            <div className="flex justify-between items-center mb-4">
              <label className="flex items-center text-sm font-semibold text-neutral-300">
                <HandCoins className="h-4 w-4 mr-2 text-rose-400" />
                Contribution Match
              </label>
              <div className="bg-neutral-900 border border-neutral-700 rounded px-3 py-1 flex items-center">
                <input 
                  type="number" 
                  value={percentage}
                  onChange={handlePercentageChange}
                  onBlur={enforcePercentageLimits}
                  className="bg-transparent border-none w-12 text-center text-white focus:outline-none font-mono font-bold"
                />
                <span className="text-neutral-400 font-mono">%</span>
              </div>
            </div>
            
            <div className="mb-6 relative">
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={percentage}
                onChange={handlePercentageChange}
                className="w-full accent-rose-500 bg-neutral-800 h-2 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] uppercase font-bold text-neutral-500 mt-2 tracking-wider">
                <span>10% min</span>
                <span>100% max</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || percentage < 10 || !selectedCharity}
              className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 focus:ring-offset-neutral-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-600/20"
            >
              {saving ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <CheckCircle2 className="h-5 w-5 mr-2" />
              )}
              Save Preferences
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
}
