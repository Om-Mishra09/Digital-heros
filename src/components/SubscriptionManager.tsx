import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Check, Sparkles, Loader2, CreditCard } from 'lucide-react';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly Pro',
    price: '$9.99',
    interval: '/ month',
    description: 'Perfect for tracking your steady journey.',
    features: ['Unlimited Score Tracking', 'Charity Insights Dashboard', 'Priority Support'],
    highlight: false,
  },
  {
    id: 'yearly',
    name: 'Yearly Pro',
    price: '$89.99',
    interval: '/ year',
    discount: 'Save 25%',
    description: 'Deep commit to your personal and social growth.',
    features: ['Unlimited Score Tracking', 'Charity Insights Dashboard', 'Priority Support', 'Early Access to New Features'],
    highlight: true,
  }
];

export default function SubscriptionManager() {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const MONTHLY_PRICE_ID = "prod_UM0WChS5Hp0YXY";
  const YEARLY_PRICE_ID = "prod_UM0XOXoGnrolRk";

  const handleSubscribe = async (planId: string) => {
    if (!user) return;
    
    const priceId = planId === 'monthly' ? MONTHLY_PRICE_ID : YEARLY_PRICE_ID;

    try {
      setLoadingPlan(planId);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.id
        })
      });
      
      const session = await response.json();
      if (session?.url) {
        window.location.href = session.url; // Trigger Stripe redirect
      } else {
        throw new Error(session.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Error starting checkout:', error);
      alert('Could not initiate checkout. Please try again later.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-12 px-4 shadow-2xl bg-neutral-900/40 backdrop-blur-md border border-neutral-800/60 rounded-3xl relative overflow-hidden">
      
      {/* Visual background layers strictly inside the component scale */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-rose-600/10 rounded-full mix-blend-screen filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-1/2 h-1/2 bg-indigo-600/10 rounded-full mix-blend-screen filter blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 to-neutral-400 mb-4">
          Unlock the Complete Experience
        </h2>
        <p className="text-lg text-neutral-400">
          Activating an active subscription grants seamless access to your performance hub, leaderboards, and our charity impact tools.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {PLANS.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative flex flex-col p-8 rounded-2xl border ${
              plan.highlight 
                ? 'bg-neutral-900/80 border-rose-500/50 shadow-[0_0_50px_-12px_rgba(244,63,94,0.25)]' 
                : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700/80'
            } transition-all duration-300`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 inset-x-0 flex justify-center">
                <span className="bg-gradient-to-r from-rose-600 to-rose-400 text-white text-xs font-bold uppercase tracking-widest py-1 px-4 rounded-full flex items-center shadow-lg">
                  <Sparkles className="w-3 h-3 mr-1.5" /> Best Value
                </span>
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-xl font-bold text-neutral-200">{plan.name}</h3>
              <p className="text-sm text-neutral-500 mt-2 min-h-[40px]">{plan.description}</p>
              <div className="mt-6 flex items-baseline text-5xl font-extrabold text-white">
                {plan.price}
                <span className="ml-2 text-lg font-medium text-neutral-400">{plan.interval}</span>
              </div>
              {plan.discount && (
                <div className="mt-2 text-sm font-semibold text-rose-400">
                  {plan.discount}
                </div>
              )}
            </div>

            <ul className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check className={`h-5 w-5 shrink-0 mr-3 ${plan.highlight ? 'text-rose-400' : 'text-indigo-400'}`} />
                  <span className="text-neutral-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loadingPlan !== null}
              className={`w-full flex items-center justify-center py-4 px-6 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 ${
                plan.highlight
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-lg shadow-rose-600/25'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-rose-500 disabled:opacity-50`}
            >
              {loadingPlan === plan.id ? (
                <Loader2 className="animate-spin h-5 w-5 mr-0" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2 opacity-80" />
                  Subscribe Now
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
