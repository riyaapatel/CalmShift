import React from 'react';
import { GlassCard } from './GlassCard';
import { 
  Rocket, 
  MessageSquare, 
  Stethoscope, 
  Calendar, 
  Trophy, 
  Users, 
  BookOpen, 
  Brain, 
  ShieldAlert, 
  Gamepad2,
  Cpu,
  Zap,
  Target
} from 'lucide-react';
import { motion } from 'motion/react';

export function About() {
  const challengeFeatures = [
    { name: '5-Min "Muuv"', detail: 'Daily micro-performance program', icon: Zap },
    { name: 'Coach Messaging', detail: 'Real-time specialist contact', icon: MessageSquare },
    { name: 'Telehealth', detail: 'Immediate medical visits', icon: Stethoscope },
    { name: 'Scheduling', detail: 'Seamless appt management', icon: Calendar },
    { name: 'Challenges', detail: 'Wellness & grit competitions', icon: Trophy },
    { name: 'Social Feed', detail: 'Activity & community kudos', icon: Users },
    { name: 'Leaderboards', detail: 'Recognition & rankings', icon: Target },
    { name: 'Resources', detail: 'Wellness program library', icon: BookOpen },
    { name: 'AI Coaching', detail: 'Personalized recommendations', icon: Brain },
    { name: 'Safety Tools', detail: 'Injury prevention alerts', icon: ShieldAlert },
    { name: 'Gamification', detail: 'Long-term dopamine loops', icon: Gamepad2 }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-24">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 border border-emerald-100"
        >
          <Cpu size={12} className="animate-pulse" />
          The Future of Workforce Performance
        </motion.div>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight">
          MuuvWell <span className="text-emerald-500">Hackathon</span> Challenge
        </h1>
        
        <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
          Building the future of workforce performance through technology that employees 
          <span className="text-slate-900 font-bold italic"> actually want to use</span> every day.
        </p>
      </section>

      {/* Core Concept */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassCard className="p-8 md:col-span-2 border-white shadow-2xl bg-white/80 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Rocket className="text-emerald-500" />
              The Mission
            </h3>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                MuuvWell is looking for innovative ideas to improve employee wellness, injury prevention, engagement, and workforce performance through technology.
              </p>
              <p className="font-bold text-slate-800">
                Key Insight: Most wellness apps lose engagement after 8–12 weeks. We are building for long-term habit formation.
              </p>
              <div className="pt-4 grid grid-cols-2 gap-4 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Simple User Experience
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Mobile-First Design
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Real-World Practicality
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Fun & Addictive Design
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 blur-[50px] rounded-full -mr-16 -mt-16" />
        </GlassCard>

        <div className="space-y-8">
          <GlassCard className="p-8 bg-slate-900 text-white border-white/10 shadow-xl overflow-hidden relative">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4">Target Users</h4>
             <ul className="space-y-3 text-sm font-bold">
               {['Manufacturing', 'Healthcare', 'Transportation', 'Shift Workers', 'Corporate'].map(user => (
                 <li key={user} className="flex justify-between items-center group">
                   <span className="text-slate-300 group-hover:text-white transition-colors">{user}</span>
                   <div className="w-1 h-1 rounded-full bg-emerald-500" />
                 </li>
               ))}
             </ul>
          </GlassCard>
        </div>
      </div>

      {/* Feature Matrix */}
      <section className="space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
           <h3 className="text-3xl font-black text-slate-900">Prototype Stack</h3>
           <p className="text-slate-500 text-sm">Every feature built to drive measurable performance.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {challengeFeatures.map((feature, i) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="p-5 h-full hover:border-emerald-200 transition-all group">
                <feature.icon size={20} className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-black text-slate-900 mb-1">{feature.name}</h4>
                <p className="text-[10px] text-slate-500 leading-tight">{feature.detail}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vision */}
      <section className="text-center py-16 bg-gradient-to-b from-transparent via-emerald-50/30 to-transparent">
        <h3 className="text-2xl font-black text-slate-900 mb-6">"The future is bigger than corporate wellness."</h3>
        <p className="text-emerald-900 font-black text-5xl md:text-7xl uppercase tracking-tighter opacity-10 pointer-events-none select-none">
          Workforce Performance
        </p>
      </section>
    </div>
  );
}
