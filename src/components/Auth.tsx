import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2, Mail, Lock } from 'lucide-react';

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignIn) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setError('Check your email for the confirmation link. If already confirmed, please sign in.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-rose-600/30 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-violet-600/30 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse animation-delay-4000"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center flex-col items-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 to-neutral-400">
            {isSignIn ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-400 max-w">
            {isSignIn ? "Enter your details to access your dashboard" : "Join us and discover what's possible."}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/50 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4">
                <p className="text-sm text-rose-400 text-center">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-neutral-300">
                Email address
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 bg-neutral-950/50 border border-neutral-800 rounded-lg py-2.5 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300">
                Password
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 bg-neutral-950/50 border border-neutral-800 rounded-lg py-2.5 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-neutral-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center">
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  ) : null}
                  {isSignIn ? 'Sign in' : 'Sign up'}
                  {!loading && (
                     <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  )}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-neutral-900/60 text-neutral-500">
                  {isSignIn ? "New to the platform?" : "Already have an account?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  setIsSignIn(!isSignIn);
                  setError(null);
                }}
                className="w-full flex justify-center py-2.5 px-4 border border-neutral-800 rounded-lg text-sm font-medium text-neutral-300 bg-neutral-950/50 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 focus:ring-offset-neutral-900 transition-all duration-200"
              >
                {isSignIn ? 'Create an account' : 'Sign in to existing account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
