import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
// Crucial Fix: Removed deprecated 'CheckCircle2' which throws undefined React runtime errors in recent lucide versions
import { ArrowRight, Activity, Dices, Globe, Heart, Shield, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-rose-500/30 overflow-hidden">
      
      {/* Decorative Global Backgrounds */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-rose-600/10 rounded-full mix-blend-screen filter blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-neutral-950/60 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
               <span className="font-bold text-white tracking-widest text-xl">D</span>
             </div>
             <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
               Digital Heroes
             </span>
          </div>
          <div>
            {session ? (
               <Link 
                 to="/dashboard"
                 className="flex items-center px-6 py-2.5 bg-neutral-100 hover:bg-white text-neutral-900 font-bold rounded-lg transition-all shadow-lg hover:shadow-white/20"
               >
                 Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
               </Link>
            ) : (
               <div className="flex items-center space-x-6">
                 <Link to="/auth" className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors hidden sm:block">
                   Sign In
                 </Link>
                 <Link 
                   to="/auth"
                   className="flex items-center px-6 py-2.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                 >
                   Get Started <ArrowRight className="w-4 h-4 ml-2" />
                 </Link>
               </div>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
           <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 text-sm font-medium text-neutral-300 mb-8 backdrop-blur"
              >
                 <Shield className="w-4 h-4 text-emerald-400" />
                 <span>The New Standard in Social Performance</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-8"
              >
                 Play. Win.<br />
                 <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-indigo-400 to-teal-400">
                   Give Back.
                 </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-12 font-medium"
              >
                 Unlock global leaderboards, track your performance, and turn every achievement into real-world charitable impact automatically.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              >
                 <Link 
                   to={session ? "/dashboard" : "/auth"}
                   className="inline-flex items-center px-8 py-4 text-lg bg-neutral-100 hover:bg-white text-neutral-950 font-black rounded-xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-105"
                 >
                   Join the Movement <ArrowRight className="w-5 h-5 ml-2" />
                 </Link>
                 <p className="mt-6 text-sm text-neutral-500 font-medium">
                   No commitment required. Cancel anytime.
                 </p>
              </motion.div>
           </div>
        </section>

        {/* Dynamic Image Break */}
        <section className="relative w-full max-w-6xl mx-auto px-6 py-12">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1 }}
             className="relative rounded-3xl overflow-hidden aspect-[21/9] shadow-2xl border border-neutral-800/80"
           >
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2850&q=80" 
                alt="Community Lifestyle" 
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/20 to-transparent" />
           </motion.div>
        </section>

        {/* How it Works */}
        <section className="py-24 px-6 relative z-10 border-t border-neutral-900 bg-neutral-950/50 backdrop-blur-sm">
           <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                 <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">How It Works</h2>
                 <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                   A frictionless pipeline connecting your steady performance with massive communal payouts.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
                 <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neutral-800 to-transparent hidden md:block -z-10" />
                 
                 {/* Step 1 */}
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-xl flex flex-col items-center text-center relative"
                 >
                    <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex justify-center items-center mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                       <Activity className="w-8 h-8 text-indigo-400" />
                    </div>
                    <span className="absolute -top-4 -right-4 text-7xl font-black text-neutral-800/30 select-none">1</span>
                    <h3 className="text-xl font-bold text-white mb-3">Track Steady Effort</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                       Record your most recent 5 Stableford equivalents. Your persistence builds the historical database required for drawing algorithms.
                    </p>
                 </motion.div>

                 {/* Step 2 */}
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.15 }}
                   className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-xl flex flex-col items-center text-center relative"
                 >
                    <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex justify-center items-center mb-6 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                       <Dices className="w-8 h-8 text-rose-400" />
                    </div>
                    <span className="absolute -top-4 -right-4 text-7xl font-black text-neutral-800/30 select-none">2</span>
                    <h3 className="text-xl font-bold text-white mb-3">The Monthly Engine</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                       Our algorithmic engine cross-references your stored sequences against the globally broadcast numerical draw logic.
                    </p>
                 </motion.div>

                 {/* Step 3 */}
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.3 }}
                   className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-xl flex flex-col items-center text-center relative"
                 >
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex justify-center items-center mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                       <Globe className="w-8 h-8 text-emerald-400" />
                    </div>
                    <span className="absolute -top-4 -right-4 text-7xl font-black text-neutral-800/30 select-none">3</span>
                    <h3 className="text-xl font-bold text-white mb-3">Claim & Distribute</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                       Win the massive unified jackpot if algorithms align, while seamlessly filtering pre-set proportions natively to charity organizations.
                    </p>
                 </motion.div>
              </div>
           </div>
        </section>

        {/* Charity Spotlight */}
        <section className="py-24 px-6 relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
           <div className="max-w-5xl mx-auto bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 shadow-2xl relative z-10">
              <div className="md:w-1/2 relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-amber-500 blur-2xl opacity-20 rounded-full" />
                 <Heart className="w-full h-auto text-rose-500/90 relative z-10 drop-shadow-2xl max-w-[250px] mx-auto md:mx-0" />
              </div>
              <div className="md:w-1/2 text-center md:text-left">
                 <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Hardcoded Empathy.</h2>
                 <p className="text-neutral-300 text-lg mb-8 leading-relaxed">
                   We believe success means nothing in a vacuum. The Digital Heroes protocol enforces a strict <strong className="text-white">minimum 10% commitment</strong> taken from all participation metrics, injected directly into the user-determined global partner.
                 </p>
                 <ul className="space-y-4 mb-8 text-sm font-semibold text-neutral-400">
                   <li className="flex items-center justify-center md:justify-start">
                      <CheckCircle className="w-5 h-5 text-amber-500 mr-3 shrink-0" /> Direct-to-partner funneling
                   </li>
                   <li className="flex items-center justify-center md:justify-start">
                      <CheckCircle className="w-5 h-5 text-amber-500 mr-3 shrink-0" /> Transparent analytical dashboards
                   </li>
                   <li className="flex items-center justify-center md:justify-start">
                      <CheckCircle className="w-5 h-5 text-amber-500 mr-3 shrink-0" /> You choose who receives your ratio
                   </li>
                 </ul>
                 <Link 
                   to={session ? "/dashboard" : "/auth"}
                   className="inline-flex py-3 px-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-colors border border-neutral-700"
                 >
                   Select Your Cause
                 </Link>
              </div>
           </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-12 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
               <div className="h-6 w-6 rounded bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center">
                 <span className="font-bold text-white text-xs">D</span>
               </div>
               <span className="text-sm font-bold text-neutral-300">Digital Heroes</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm font-medium text-neutral-500">
               <a href="#" className="hover:text-neutral-300 transition-colors">Privacy</a>
               <a href="#" className="hover:text-neutral-300 transition-colors">Terms</a>
               <a href="#" className="hover:text-neutral-300 transition-colors">Documentation</a>
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-8 text-center md:text-left text-xs text-neutral-700 font-semibold">
            &copy; {new Date().getFullYear()} Digital Heroes Protocol. All rights reserved. Not affiliated with any traditional sports or golf associations.
         </div>
      </footer>
    </div>
  );
}
