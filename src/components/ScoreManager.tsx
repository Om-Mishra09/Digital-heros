import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Trophy, Plus, AlertCircle, Loader2, Calendar, Hash, XCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Score {
  id: string;
  date: string;
  score: number;
}

export default function ScoreManager() {
  const { user } = useAuth();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [scoreVal, setScoreVal] = useState<number | ''>('');

  useEffect(() => {
    if (user) {
      fetchScores();
    }
  }, [user]);

  const fetchScores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setScores(data || []);
    } catch (err: any) {
      console.error('Error fetching scores:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const enforceScoreLimit = async (currentScores: Score[]) => {
    if (currentScores.length > 5) {
      // Find the oldest scores beyond the 5 most recent
      const oldestScores = currentScores.slice(5);
      const idsToDelete = oldestScores.map((s) => s.id);

      const { error } = await supabase
        .from('scores')
        .delete()
        .in('id', idsToDelete);

      if (error) {
        console.error('Error deleting oldest scores:', error.message);
      } else {
        // Update local state by removing the deleted ones
        setScores((prev) => prev.filter((s) => !idsToDelete.includes(s.id)));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (scoreVal === '' || scoreVal < 1 || scoreVal > 45) {
      setError('Score must be between 1 and 45.');
      return;
    }

    if (!date) {
      setError('Please select a date.');
      return;
    }

    try {
      setSubmitting(true);
      
      const newScoreData = {
        user_id: user?.id,
        date: date,
        score: Number(scoreVal),
      };

      const { data, error: insertError } = await supabase
        .from('scores')
        .insert([newScoreData])
        .select()
        .single();

      if (insertError) {
        // Checking if it's a unique constraint violation on the date
        if (insertError.code === '23505') {
          throw new Error('A score for this date already exists.');
        }
        throw insertError;
      }

      // Locally add the new score, sort descending by date manually
      const updatedScores = [data, ...scores].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setScores(updatedScores);
      setScoreVal('');
      setDate(new Date().toISOString().split('T')[0]);

      // Impose rolling logic of keeping only max 5
      await enforceScoreLimit(updatedScores);

    } catch (err: any) {
      setError(err.message || 'Error occurred recording the score.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setScores((prev) => prev.filter((s) => s.id !== id));
      await supabase.from('scores').delete().eq('id', id);
    } catch (err: any) {
      console.error("Failed to delete score: ", err.message);
    }
  };

  return (
    <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Trophy size={120} />
      </div>
      
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
          <Trophy className="h-5 w-5 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-neutral-100 tracking-tight">Performance tracker</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-start space-x-2"
            >
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="date"
                required
                value={date}
                max={new Date().toISOString().split('T')[0]} // Prevents future dates
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 bg-neutral-950/50 border border-neutral-800 rounded-lg py-2.5 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Score (1-45)
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="number"
                required
                min="1"
                max="45"
                value={scoreVal}
                onChange={(e) => setScoreVal(e.target.value ? Number(e.target.value) : '')}
                className="w-full pl-10 bg-neutral-950/50 border border-neutral-800 rounded-lg py-2.5 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-neutral-900 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-indigo-600/20"
        >
          {submitting ? (
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
          ) : (
            <Plus className="h-5 w-5 mr-2" />
          )}
          Record Score
        </button>
      </form>

      <div className="flex-1 flex flex-col">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
          Recent History (Max 5)
        </h3>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin h-6 w-6 text-indigo-500" />
          </div>
        ) : scores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-neutral-500 bg-neutral-900/30 rounded-xl border border-neutral-800/50 border-dashed">
            <Hash className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No scores submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {scores.map((s) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/80 hover:border-indigo-500/50 transition-colors group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="font-mono text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-rose-400 min-w-[2ch]">
                      {s.score}
                    </div>
                    <div className="text-sm text-neutral-400 font-medium flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                      {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(s.date))}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 text-neutral-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Score"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
