import React from 'react';
import { motion } from 'motion/react';
import { Trophy, ArrowRight, Zap, Target, Activity } from 'lucide-react';

interface ResultScreenProps {
  score: number;
  onFinish: () => void;
  title: string;
  accentColor: string;
}

export function ResultScreen({ score, onFinish, title, accentColor }: ResultScreenProps) {
  const getStressLevel = (s: number) => {
    if (s <= 30) return { label: 'High Load Detected', desc: 'Neural pathways require immediate sanctuary reset.', color: 'text-rose-500' };
    if (s <= 70) return { label: 'Active Resonance', desc: 'Cognitive state is stabilizing. Continued focus recommended.', color: 'text-amber-500' };
    return { label: 'Optimal Coherence', desc: 'Maximum neuronal efficiency achieved. You are in deep flow.', color: 'text-emerald-500' };
  };

  const status = getStressLevel(score);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto text-center"
    >
      <div className={`w-24 h-24 rounded-[40px] ${accentColor} flex items-center justify-center mx-auto mb-8 shadow-2xl relative`}>
        <Trophy size={48} className="text-white" />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-[40px] bg-white"
        />
      </div>

      <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Session Complete</h2>
      <h3 className="text-3xl font-bold text-slate-900 mb-8">{title}</h3>

      <div className="grid grid-cols-2 gap-4 mb-12">
        <div className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
          <Zap size={20} className="text-amber-500 mx-auto mb-2" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">XP Gained</span>
          <span className="text-3xl font-black text-slate-900">{score}</span>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
          <Target size={20} className="text-emerald-500 mx-auto mb-2" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Accuracy</span>
          <span className="text-3xl font-black text-slate-900">{Math.min(100, Math.floor((score / 150) * 100))}%</span>
        </div>
      </div>

      <div className="bg-slate-50/50 p-8 rounded-[40px] border border-slate-100 mb-12 text-left">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className={`text-xs font-black uppercase tracking-widest ${status.color}`}>
            {status.label}
          </h4>
        </div>
        <p className="text-slate-500 text-sm italic font-medium leading-relaxed">
          "{status.desc}"
        </p>
      </div>

      <button 
        onClick={onFinish}
        className="group relative w-full py-5 bg-slate-900 text-white rounded-[24px] font-bold uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-3"
      >
        Synchronize Data & Exit
        <ArrowRight size={16} />
      </button>
    </motion.div>
  );
}
