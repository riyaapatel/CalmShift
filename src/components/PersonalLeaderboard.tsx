import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { useAuth } from './FirebaseProvider';
import { Trophy, TrendingUp, History, Flame, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface ScoreEntry {
  id: string;
  gameId: string;
  score: number;
  level: number;
  timestamp: any;
}

export function PersonalLeaderboard() {
  const { user, profile } = useAuth();
  const [history, setHistory] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'scores'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as ScoreEntry[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scores');
    });
    return unsubscribe;
  }, [user]);

  const bestScore = history.length > 0 ? Math.max(...history.map(h => h.score)) : 0;
  const streak = profile?.streakCount || 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassCard className="flex flex-col items-center justify-center p-10 bg-white/40 border-white shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150" />
          <Trophy className="text-amber-500 mb-4" size={40} />
          <span className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">Total Resonance Point</span>
          <span className="text-4xl font-black text-emerald-950 mt-2">{profile?.totalPoints || 0}</span>
        </GlassCard>

        <GlassCard className="flex flex-col items-center justify-center p-10 bg-white/90 border-white shadow-xl relative overflow-hidden group scale-105 z-10">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4" />
          <Flame className="text-rose-500 mb-4 animate-pulse" size={48} fill="currentColor" fillOpacity={0.2} />
          <span className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">Current Streak</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-black text-emerald-950">{streak}</span>
            <span className="text-xl font-bold text-slate-300">/ 7</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden max-w-[120px]">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${(streak / 7) * 100}%` }}
               className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
             />
          </div>
          {streak >= 7 && (
             <span className="mt-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
               <Star size={10} fill="currentColor" /> Mastery Achieved
             </span>
          )}
        </GlassCard>

        <GlassCard className="flex flex-col items-center justify-center p-10 bg-white/40 border-white shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150" />
          <TrendingUp className="text-emerald-600 mb-4" size={40} />
          <span className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">Peak Cognitive Flow</span>
          <span className="text-4xl font-black text-emerald-950 mt-2">{bestScore}</span>
        </GlassCard>
      </div>

      <GlassCard className="p-0 overflow-hidden bg-white/90 border-white shadow-2xl">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
               <History size={20} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 tracking-tight">Neuro-Assessment History</h3>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 10 Cycles</span>
        </div>
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-left">
            <thead className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em]">
              <tr>
                <th className="px-6 py-6">Calibration Mode</th>
                <th className="px-6 py-6 text-center">XP Record</th>
                <th className="px-6 py-6 text-right">Synchronization Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map((h, i) => (
                <motion.tr 
                  key={h.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl ${h.gameId === 'colors' ? 'bg-orange-50' : h.gameId === 'shapes' ? 'bg-emerald-50' : 'bg-indigo-50'} flex items-center justify-center font-bold text-[10px] text-slate-400 border border-black/5`}>
                        {h.gameId[0].toUpperCase()}
                      </div>
                      <span className="text-slate-900 font-bold tracking-tight">{h.gameId.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="text-2xl font-black text-emerald-600 font-mono tracking-tighter">{h.score}</span>
                  </td>
                  <td className="px-6 py-6 text-slate-400 text-xs italic font-medium text-right">
                    {h.timestamp?.toDate ? h.timestamp.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Processing...'}
                  </td>
                </motion.tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-24 text-center">
                    <div className="max-w-xs mx-auto">
                       <History size={48} className="mx-auto text-slate-100 mb-6" />
                       <p className="text-slate-300 italic text-sm">No neural logs detected. Complete a session to begin tracking your cognitive evolution.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
