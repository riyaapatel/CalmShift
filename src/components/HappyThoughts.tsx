import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { GlassCard } from './GlassCard';

const THOUGHTS = [
  "Your potential is endless. Go out and reach for it.",
  "Every small win is a step toward a big dream.",
  "You are capable of amazing things, more than you know.",
  "Today is a beautiful day to start something new.",
  "Kindness is a superpower. Use it often.",
  "Your unique perspective is exactly what's needed.",
  "Progress over perfection, every single day.",
  "The world is brighter because you are in it.",
  "Take a deep breath. You're doing better than you think.",
  "Happiness is found in the simple moments of today."
];

export function HappyThoughts() {
  // Daily thought based on date seed
  const dailyThought = useMemo(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return THOUGHTS[seed % THOUGHTS.length];
  }, []);

  return (
    <GlassCard className="bg-gradient-to-br from-violet-100/40 via-blue-50/40 to-emerald-100/40 border-white/40 overflow-hidden relative min-h-[140px] flex items-center">
      <div className="relative z-10 p-8 w-full">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-violet-500" size={16} />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Daily Resonance</h3>
        </div>
        
        <p className="text-xl font-bold text-slate-800 leading-tight italic">
          "{dailyThought}"
        </p>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-200/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-200/20 blur-3xl rounded-full" />
    </GlassCard>
  );
}
