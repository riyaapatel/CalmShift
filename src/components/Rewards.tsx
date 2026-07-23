import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { useAuth } from './FirebaseProvider';
import { Gift, Lock, CheckCircle2, Copy, ExternalLink, Sparkles, Utensils, Dumbbell, Flower2, Coffee, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Reward {
  id: string;
  partner: string;
  description: string;
  discount: string;
  requiredXp: number;
  category: 'food' | 'fitness' | 'wellness' | 'recreation';
  code: string;
  icon: any;
  color: string;
}

const REWARDS: Reward[] = [
  {
    id: '1',
    partner: 'Zen Yoga Studio',
    description: 'Complimentary mindful flow session for new practitioners.',
    discount: 'FREE INTRO SESSION',
    requiredXp: 250,
    category: 'wellness',
    code: 'OMFLOW250',
    icon: Flower2,
    color: 'bg-indigo-50 text-indigo-600'
  },
  {
    id: '2',
    partner: 'Green Leaf Salads',
    description: 'Premium organic bowls and cold-pressed juices.',
    discount: '20% OFF TOTAL BILL',
    requiredXp: 500,
    category: 'food',
    code: 'FRESH500',
    icon: Utensils,
    color: 'bg-emerald-50 text-emerald-600'
  },
  {
    id: '3',
    partner: 'Vitality Nutri-Bar',
    description: 'Post-shift recovery smoothies and health bars.',
    discount: 'BUY 1 GET 1 FREE',
    requiredXp: 1000,
    category: 'food',
    code: 'VITALITY1K',
    icon: Coffee,
    color: 'bg-amber-50 text-amber-600'
  },
  {
    id: '4',
    partner: 'Titan Fitness BG',
    description: 'Full access to state-of-the-art strength facility.',
    discount: '1 MONTH FREE MEMBERSHIP',
    requiredXp: 2000,
    category: 'fitness',
    code: 'TITAN2000',
    icon: Dumbbell,
    color: 'bg-rose-50 text-rose-600'
  },
  {
    id: '5',
    partner: 'Bowling Green Rec Center',
    description: 'Inclusive community wellness and pool access.',
    discount: '50% OFF ANNUAL PASS',
    requiredXp: 5000,
    category: 'recreation',
    code: 'BGWELL5K',
    icon: Ticket,
    color: 'bg-blue-50 text-blue-600'
  }
];

export function Rewards() {
  const { profile } = useAuth();
  const currentXp = profile?.totalPoints || 0;
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealingId, setRevealingId] = useState<string | null>(null);

  const nextReward = REWARDS.find(r => r.requiredXp > currentXp);
  const progressToNext = nextReward 
    ? ((currentXp / nextReward.requiredXp) * 100) 
    : 100;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-10">
      {/* XP Headway */}
      <GlassCard className="p-8 bg-slate-900 text-white border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Cognitive Standing</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">{currentXp}</span>
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total REXP</span>
              </div>
            </div>
            {nextReward && (
              <div className="text-right md:max-w-xs">
                <p className="text-xs text-slate-400 italic mb-1">Next Unlock: {nextReward.partner}</p>
                <p className="text-xs font-bold text-emerald-400">
                  {nextReward.requiredXp - currentXp} more XP required
                </p>
              </div>
            )}
          </div>

          <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressToNext}%` }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300"
            />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]" />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
      </GlassCard>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REWARDS.map((reward, i) => {
          const isUnlocked = currentXp >= reward.requiredXp;
          const Icon = reward.icon;

          return (
            <GlassCard 
              key={reward.id} 
              delay={i * 0.05}
              className={`p-0 overflow-hidden border-white shadow-lg transition-all group ${
                isUnlocked ? 'bg-white/90 scale-100' : 'bg-white/40 grayscale scale-95 opacity-80'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl ${reward.color} flex items-center justify-center border border-white shadow-sm`}>
                    <Icon size={24} />
                  </div>
                  {!isUnlocked && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white rounded-full">
                      <Lock size={10} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{reward.requiredXp} XP</span>
                    </div>
                  )}
                  {isUnlocked && (
                    <div className="flex items-center gap-1 p-1 bg-emerald-100 text-emerald-600 rounded-full">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">{reward.partner}</h3>
                  <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-3">{reward.discount}</p>
                  <p className="text-slate-500 text-xs italic leading-relaxed">{reward.description}</p>
                </div>

                <div className="relative mt-auto">
                  {isUnlocked ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-3 flex items-center justify-center">
                          <span className="text-xs font-mono font-black tracking-[0.2em] text-slate-900">
                            {revealingId === reward.id ? reward.code : '••••••••'}
                          </span>
                        </div>
                        <button 
                          onClick={() => setRevealingId(revealingId === reward.id ? null : reward.id)}
                          className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition-colors"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleCopy(reward.code, reward.id)}
                        className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
                      >
                        {copiedId === reward.id ? (
                          <>
                            <CheckCircle2 size={14} />
                            Code Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy Coupon Code
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="py-4 text-center border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        Locked Until {reward.requiredXp} XP
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress Bar for Locked */}
              {!isUnlocked && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
                   <div 
                     className="h-full bg-slate-300" 
                     style={{ width: `${(currentXp / reward.requiredXp) * 100}%` }}
                   />
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          0% { background-position: 0 0; }
          100% { background-position: 1rem 0; }
        }
      `}} />
    </div>
  );
}
