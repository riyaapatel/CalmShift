import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/FirebaseProvider';
import { ZenColors } from './components/games/ZenColors';
import { ShapeSorter } from './components/games/ShapeSorter';
import { PatternSeeker } from './components/games/PatternSeeker';
import { StoryScrolls } from './components/games/StoryScrolls';
import { HappyThoughts } from './components/HappyThoughts';
import { DoctorDirectory } from './components/DoctorDirectory';
import { ShiftCalendar } from './components/ShiftCalendar';
import { ActivityCalendar } from './components/ActivityCalendar';
import { PersonalLeaderboard } from './components/PersonalLeaderboard';
import { Rewards } from './components/Rewards';
import { About } from './components/About';
import { GlassCard } from './components/GlassCard';
import { db } from './lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Calendar as CalendarIcon, 
  Stethoscope, 
  BarChart3, 
  LogOut, 
  Moon, 
  Sun,
  Activity,
  Wind,
  Zap,
  Flame,
  CheckCircle2,
  X,
  Gift,
  Info,
  Play
} from 'lucide-react';

function CheckInPrompt({ onCheckIn }: { onCheckIn: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm"
    >
      <GlassCard className="max-w-md w-full p-8 text-center bg-white border-white shadow-2xl">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-emerald-950 mb-2">Daily Alignment</h3>
        <p className="text-slate-500 mb-8 italic">Check in to maintain your cognitive streak and earn daily resonance points.</p>
        <button 
          onClick={onCheckIn}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
        >
          Check In Now
        </button>
      </GlassCard>
    </motion.div>
  );
}

function Dashboard() {
  const { user, profile, logout, performCheckIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'games' | 'calendar' | 'specialists' | 'stats' | 'rewards' | 'about'>('games');
  const [activeGame, setActiveGame] = useState<'colors' | 'shapes' | 'patterns' | 'reels' | null>(null);
  const [suggestedActivities, setSuggestedActivities] = useState<any[]>([]);
  const [lastGameResult, setLastGameResult] = useState<{ score: number; stressLevel: string } | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);

  useEffect(() => {
    if (profile && profile.lastCheckInDate !== new Date().toISOString().split('T')[0]) {
      setShowCheckIn(true);
    }
  }, [profile]);

  const handleCheckIn = async () => {
    await performCheckIn();
    setShowCheckIn(false);
  };

  const handleGameComplete = async (score: number) => {
    if (!user) return;
    
    let stressStatus = 'normal';
    if (score <= 30) stressStatus = 'too_stressed';
    else if (score <= 70) stressStatus = 'stressed';

    setLastGameResult({ score, stressLevel: stressStatus });

    try {
      await addDoc(collection(db, 'scores'), {
        userId: user.uid,
        gameId: activeGame,
        score,
        level: 1,
        timestamp: serverTimestamp(),
        stressResult: stressStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'scores');
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        stressLevel: stressStatus,
        lastAssessmentDate: new Date().toISOString(),
        totalPoints: increment(score)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, stressLevel: stressStatus })
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setSuggestedActivities(data);
      } else {
        setSuggestedActivities([]);
      }
    } catch (e) {
      console.error(e);
      setSuggestedActivities([]);
    }

    setActiveGame(null);
  };

  const getStatusColor = () => {
    switch(profile?.stressLevel) {
      case 'too_stressed': return 'bg-red-500';
      case 'stressed': return 'bg-yellow-500';
      default: return 'bg-emerald-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F5] text-slate-800 overflow-x-hidden font-sans">
      <AnimatePresence>
        {showCheckIn && <CheckInPrompt onCheckIn={handleCheckIn} />}
      </AnimatePresence>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-50 rounded-full blur-[120px]" />
      </div>

      <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center border border-white shadow-sm">
            <Activity className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-900">CalmShift</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 shadow-sm">
            <Flame size={16} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-700">{profile?.streakCount || 0} DAY STREAK</span>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/40 px-4 py-2 rounded-2xl border border-white/60 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {profile?.stressLevel === 'too_stressed' ? 'Rest Mode' : profile?.stressLevel === 'stressed' ? 'Balanced' : 'Deep Zen'}
            </span>
          </div>
          <button onClick={logout} className="p-2 hover:bg-black/5 rounded-xl transition-colors">
            <LogOut size={20} className="text-slate-400" />
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        {!activeGame && (
          <header className="py-12">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl md:text-6xl font-light mb-4 text-emerald-950"
            >
              Hello, <span className="font-bold">{profile?.displayName ? profile.displayName.split(' ')[0] : 'User'}</span>
            </motion.h2>
            <p className="text-lg text-slate-500 max-w-xl italic">
              Synchronize your mind and schedule for optimal resilience.
            </p>
          </header>
        )}

        {!activeGame && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <HappyThoughts />
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeGame ? (
            <motion.div
              key="game-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlassCard className="max-w-4xl mx-auto relative overflow-hidden bg-white/90 border-white shadow-2xl p-0 md:p-8">
                <button 
                  onClick={() => setActiveGame(null)}
                  className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors z-30"
                >
                  <X />
                </button>
                <div className="relative z-10 min-h-[500px] flex items-center justify-center">
                  {activeGame === 'colors' && <ZenColors onComplete={handleGameComplete} />}
                  {activeGame === 'shapes' && <ShapeSorter onComplete={handleGameComplete} />}
                  {activeGame === 'patterns' && <PatternSeeker onComplete={handleGameComplete} />}
                  {activeGame === 'reels' && <StoryScrolls onComplete={handleGameComplete} />}
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div key="tabs-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
                {[
                  { id: 'games', icon: Gamepad2, label: 'Neuro Games' },
                  { id: 'calendar', icon: CalendarIcon, label: 'Workflow' },
                  { id: 'rewards', icon: Gift, label: 'Rewards' },
                  { id: 'specialists', icon: Stethoscope, label: 'Specialists' },
                  { id: 'stats', icon: BarChart3, label: 'Resilience' },
                  { id: 'about', icon: Info, label: 'About' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all whitespace-nowrap",
                      activeTab === tab.id 
                        ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                        : "bg-white/60 text-slate-500 border-white shadow-sm hover:bg-white"
                    )}
                  >
                    <tab.icon size={18} />
                    <span className="font-semibold text-sm">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="min-h-[500px]">
                {activeTab === 'games' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { id: 'colors', name: 'Zen Colors', desc: 'Resonate with falling tones', icon: Sun, color: 'bg-orange-100', accent: 'text-orange-500' },
                      { id: 'shapes', name: 'Shape Harmony', desc: 'Cognitive shape alignment', icon: Activity, color: 'bg-emerald-100', accent: 'text-emerald-500' },
                      { id: 'reels', name: 'Story Scrolls', desc: 'Vertical Bowling Green lore', icon: Play, color: 'bg-rose-100', accent: 'text-rose-500' },
                      { id: 'patterns', name: 'Pattern Flow', desc: 'Rhythmic pattern sequence', icon: Moon, color: 'bg-indigo-100', accent: 'text-indigo-500' }
                    ].map((game, i) => (
                      <GlassCard key={game.id} delay={i * 0.1} className="group bg-white/80 border-white shadow-lg flex flex-col">
                        <div className={`w-16 h-16 rounded-3xl ${game.color} flex items-center justify-center mb-6 shadow-sm border border-white/50 group-hover:scale-110 transition-transform`}>
                          <game.icon size={32} className={game.accent} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-emerald-950">{game.name}</h3>
                        <p className="text-slate-500 text-sm mb-8 italic flex-1">{game.desc}</p>
                        <button 
                          onClick={() => setActiveGame(game.id as any)}
                          className="w-full py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold uppercase tracking-widest text-[10px]"
                        >
                          Calibrate Now
                        </button>
                      </GlassCard>
                    ))}

                    <AnimatePresence>
                      {lastGameResult && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="md:col-span-3"
                        >
                          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[40px] p-10 text-white relative shadow-2xl overflow-hidden border border-white/10">
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                              <div className="flex-1">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Session Insight</span>
                                <h3 className="text-4xl font-bold mt-4 mb-4">
                                  {lastGameResult.stressLevel === 'too_stressed' ? 'Priority Reset Required' : 'Optimal Synchronization'}
                                </h3>
                                <p className="text-slate-300 text-sm max-w-xl leading-relaxed italic">
                                  {lastGameResult.stressLevel === 'too_stressed' 
                                    ? "Cognitive indicators show significant load. We recommend a 15-minute sanctuary break before your next shift phase."
                                    : "High levels of neuronal coherence detected. You are uniquely prepared for complex problem-solving tasks currently."}
                                </p>
                              </div>
                              <div className="flex flex-col items-center gap-4 bg-white/5 p-8 rounded-[40px] border border-white/10 border-dashed">
                                <div className="text-5xl font-black text-emerald-400">
                                  {lastGameResult.score}
                                  <span className="text-xs font-bold text-slate-400 ml-2">REXP</span>
                                </div>
                                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Resilience Index Gained</div>
                              </div>
                            </div>
                            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {activeTab === 'calendar' && (
                  <div className="space-y-12">
                    <ShiftCalendar />
                    <div className="mt-12">
                      <h3 className="text-2xl font-bold text-emerald-950 mb-8 flex items-center gap-3">
                        <Zap className="text-amber-500" />
                        Ritual Optimization
                      </h3>
                      <ActivityCalendar suggestedActivities={suggestedActivities} />
                    </div>
                  </div>
                )}

                {activeTab === 'specialists' && (
                  <div>
                    {profile?.stressLevel === 'too_stressed' && (
                      <div className="mb-12 bg-rose-950 border border-rose-900 p-8 rounded-[40px] flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center animate-pulse">
                          <Wind size={32} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">Priority Sanctuary Unlocked</h3>
                          <p className="text-slate-300 leading-relaxed max-w-2xl text-sm italic">
                            Your biometric pattern suggests high atmospheric pressure in your current workload. Our specialist network is briefed on immediate cognitive resets.
                          </p>
                        </div>
                      </div>
                    )}
                    <DoctorDirectory />
                  </div>
                )}

                {activeTab === 'stats' && (
                  <PersonalLeaderboard />
                )}

                {activeTab === 'rewards' && (
                  <Rewards />
                )}

                {activeTab === 'about' && (
                  <About />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function Login() {
  const { signIn } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800 overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 opacity-20">
         <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-emerald-200 rounded-full blur-[180px]" />
         <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] bg-amber-200 rounded-full blur-[150px]" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard className="p-12 text-center bg-white/90 border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]">
          <div className="w-24 h-24 bg-emerald-50 rounded-[40px] flex items-center justify-center mx-auto mb-10 border border-emerald-100 shadow-xl group transition-all duration-500 hover:rotate-12">
            <Activity size={48} className="text-emerald-600" />
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tighter text-emerald-950">CalmShift</h1>
          <p className="text-slate-500 mb-12 italic text-sm leading-relaxed">Neural-adaptive workspace companion for advanced professional synchronization.</p>
          
          <button 
            onClick={signIn}
            className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-bold flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-2xl overflow-hidden group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale invert brightness-200" alt="G" />
            <span className="relative z-10 uppercase tracking-[0.2em] text-[10px]">Authenticate with SSO</span>
          </button>
          
          <div className="mt-12 flex items-center justify-center gap-2 opacity-30 grayscale">
            <div className="h-px w-8 bg-slate-400" />
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Enterprise Standard</p>
            <div className="h-px w-8 bg-slate-400" />
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="relative">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-20 h-20 bg-emerald-100 rounded-full blur-xl"
        />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="absolute inset-0 w-20 h-20 border-t-2 border-emerald-600 rounded-full"
        />
      </div>
    </div>
  );

  return user ? <Dashboard /> : <Login />;
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
