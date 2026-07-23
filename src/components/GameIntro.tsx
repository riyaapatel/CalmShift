import React from 'react';
import { motion } from 'motion/react';
import { Play, Info, ShieldCheck, Zap } from 'lucide-react';

interface GameIntroProps {
  title: string;
  description: string;
  instructions: string[];
  benefits: string[];
  onStart: () => void;
  icon: React.ElementType;
  accentColor: string;
  children?: React.ReactNode;
}

export function GameIntro({ 
  title, 
  description, 
  instructions, 
  benefits, 
  onStart, 
  icon: Icon,
  accentColor,
  children
}: GameIntroProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-left"
    >
      <div className="flex items-center gap-6 mb-8">
        <div className={`w-20 h-20 rounded-[30px] ${accentColor} flex items-center justify-center shadow-lg border border-white/50`}>
          <Icon size={40} className="text-white" />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-slate-900 mb-2">{title}</h2>
          <p className="text-slate-500 italic">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Info size={14} />
            How to Practice
          </h3>
          <ul className="space-y-3">
            {instructions.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600 bg-white/40 p-3 rounded-xl border border-white/50">
                <span className="font-bold text-emerald-600">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <ShieldCheck size={14} />
            Cognitive Benefits
          </h3>
          <div className="flex flex-wrap gap-2">
            {benefits.map((benefit, i) => (
              <span 
                key={i} 
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-100 flex items-center gap-1.5"
              >
                <Zap size={10} className="text-amber-500" />
                {benefit}
              </span>
            ))}
          </div>
        </div>
      </div>

      {children ? children : (
        <button 
          onClick={onStart}
          className="group relative w-full py-5 bg-slate-900 text-white rounded-[24px] font-bold uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-3 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <Play size={16} fill="white" />
          Begin Neurological Session
        </button>
      )}

      <p className="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-widest font-medium">
        Session duration: ~2 minutes • Focus required: High
      </p>
    </motion.div>
  );
}
