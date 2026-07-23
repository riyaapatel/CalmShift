import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, increment, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { GlassCard } from './GlassCard';
import { MapPin, Users, Calendar, ShieldCheck, Sparkles, X, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Specialist {
  id: string;
  name: string;
  email: string;
  insurance: string;
  visitors: number;
  specialty: string;
  type: 'doctor' | 'coach';
  location: string;
}

const INITIAL_SPECIALISTS: Specialist[] = [
  { id: 'dr1', name: 'Dr. Julianne Reed', email: 'reed@wellness.bg.com', specialty: 'Holistic Therapist', insurance: 'Blue Cross, Aetna', visitors: 112, type: 'doctor', location: 'Bowling Green, KY' },
  { id: 'dr2', name: 'Dr. Mark Spencer', email: 'spencer@clinic.bg.com', specialty: 'Mental Resilience Specialist', insurance: 'UnitedHealth, Humana', visitors: 85, type: 'doctor', location: 'Bowling Green, KY' },
  { id: 'dr3', name: 'Dr. Sarah Chen', email: 'chen@med.bg.com', specialty: 'Mindfulness Coach', insurance: 'Cigna, Blue Cross', visitors: 204, type: 'doctor', location: 'Bowling Green, KY' },
  { id: 'dr4', name: 'Dr. Robert Miller', email: 'miller@care.bg.com', specialty: 'Stress Management Physician', insurance: 'Aetna, Humana', visitors: 45, type: 'doctor', location: 'Bowling Green, KY' },
  { id: 'dr5', name: 'Dr. Emily Watson', email: 'watson@sleep.bg.com', specialty: 'Sleep Medicine Specialist', insurance: 'Most Major Plans', visitors: 156, type: 'doctor', location: 'Bowling Green, KY' },
  { id: 'dr6', name: 'Dr. Kevin Ortiz', email: 'ortiz@sports.bg.com', specialty: 'Sports Medicine Physician', insurance: 'UnitedHealth, Cigna', visitors: 92, type: 'doctor', location: 'Bowling Green, KY' },
  { id: 'dr7', name: 'Dr. Lisa Grant', email: 'grant@psy.bg.com', specialty: 'Clinical Psychiatrist', insurance: 'Anthem, Medicare', visitors: 178, type: 'doctor', location: 'Bowling Green, KY' },
  
  { id: 'ch1', name: 'Alex Rivers', email: 'alex@bgperformance.com', specialty: 'Performance Coach', insurance: 'Private, Corporate', visitors: 156, type: 'coach', location: 'Bowling Green, KY' },
  { id: 'ch2', name: 'Sam Taylor', email: 'sam@flowstate.bg.com', specialty: 'Mindset & Peak Performance', insurance: 'Private Pay', visitors: 92, type: 'coach', location: 'Bowling Green, KY' },
  { id: 'ch3', name: 'Jordan Valez', email: 'jordan@wealth-wellness.com', specialty: 'Financial Wellness Coach', insurance: 'Employer Sponsored', visitors: 64, type: 'coach', location: 'Bowling Green, KY' },
  { id: 'ch4', name: 'Casey North', email: 'casey@rest.bg.com', specialty: 'Certified Sleep Coach', insurance: 'Private Pay', visitors: 110, type: 'coach', location: 'Bowling Green, KY' },
  
  { id: 'dt1', name: 'Maya Hills', email: 'maya@bg-nutrition.com', specialty: 'Registered Dietitian', insurance: 'UnitedHealth, Anthem', visitors: 128, type: 'coach', location: 'Bowling Green, KY' },
  { id: 'dt2', name: 'Liam Brooks', email: 'liam@metabolic.bg.com', specialty: 'Clinical Nutritionist', insurance: 'Aetna, Cigna', visitors: 74, type: 'coach', location: 'Bowling Green, KY' },
  
  { id: 'pt1', name: 'Chris Stone', email: 'chris@bg-physio.com', specialty: 'Physical Therapist', insurance: 'Most Major Plans', visitors: 189, type: 'coach', location: 'Bowling Green, KY' },
  { id: 'pt2', name: 'Elena Vance', email: 'elena@vance-pt.bg.com', specialty: 'Mobility Specialist', insurance: 'Blue Cross, Medicare', visitors: 63, type: 'coach', location: 'Bowling Green, KY' },
];

export function DoctorDirectory() {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [activeSpecialist, setActiveSpecialist] = useState<Specialist | null>(null);
  const [scheduling, setScheduling] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'doctor' | 'coach'>('all');
  
  // Prompt State
  const [message, setMessage] = useState('');
  const [shareResilience, setShareResilience] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'specialists'), (snapshot) => {
      const docsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Specialist[];
      if (docsData.length === 0) {
        setSpecialists(INITIAL_SPECIALISTS);
      } else {
        setSpecialists(docsData);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'specialists');
    });

    return unsubscribe;
  }, []);

  const handleConfirmContact = async () => {
    if (!activeSpecialist) return;
    setScheduling(true);
    
    try {
      // 1. Fetch Resilience Data if requested
      let resilienceData = null;
      if (shareResilience) {
        const q = query(collection(db, 'scores'), orderBy('date', 'desc'), limit(5));
        const snapshot = await getDocs(q);
        resilienceData = snapshot.docs.map(d => ({
          score: d.data().score,
          date: d.data().date?.toDate?.()?.toLocaleDateString() || d.data().date,
          analysis: d.data().analysis
        }));
      }

      // 2. Increment visitor count (Update existing or create new)
      const docRef = doc(db, 'specialists', activeSpecialist.id);
      const { id, ...dataToSave } = activeSpecialist;
      await setDoc(docRef, { 
        ...dataToSave,
        visitors: increment(1) 
      }, { merge: true });
      
      // 3. Dispatch Email
      await fetch('/api/send-doctor-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorEmail: activeSpecialist.email,
          doctorName: activeSpecialist.name,
          userName: 'Wellness User',
          userEmail: 'user@example.com',
          userMessage: message,
          resilienceData: shareResilience ? resilienceData : null
        })
      });
      
      alert(`Success! Your request and data have been shared with ${activeSpecialist.name}.`);
      setActiveSpecialist(null);
      setMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `specialists/${activeSpecialist?.id}`);
    } finally {
      setScheduling(false);
    }
  };

  const filteredSpecialists = specialists.filter(s => filter === 'all' || s.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
          <MapPin size={24} className="text-emerald-600" />
          Care & Performance (Bowling Green, KY)
        </h2>
        
        <div className="flex bg-white/40 p-1 rounded-xl border border-white shadow-sm">
          {(['all', 'doctor', 'coach'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t === 'all' ? 'All Experts' : t === 'doctor' ? 'Medical' : 'Coaches'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSpecialists.map((spec, i) => (
          <GlassCard key={spec.id} delay={i * 0.05} className="bg-white/80 border-white shadow-lg flex flex-col h-full ring-1 ring-black/5">
            <div className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{spec.name}</h3>
                    {spec.type === 'coach' && <Sparkles size={14} className="text-amber-500" />}
                  </div>
                  <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">{spec.specialty}</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1 border border-emerald-100 shrink-0">
                  <Users size={10} /> {spec.visitors} Visited
                </span>
              </div>

              <div className="flex flex-col gap-2 mb-8">
                <div className="flex items-center gap-2 text-slate-500 text-[11px] italic">
                  <ShieldCheck size={14} className="text-slate-400 shrink-0" />
                  <span>Supports: {spec.insurance}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <MapPin size={14} className="shrink-0" />
                  <span>{spec.location}</span>
                </div>
              </div>

              <button
                disabled={activeSpecialist !== null}
                onClick={() => setActiveSpecialist(spec)}
                className={`mt-auto flex items-center justify-center gap-2 w-full py-3 rounded-2xl transition-all font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 ${
                  spec.type === 'coach' 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <Calendar size={14} />
                {spec.type === 'coach' ? 'Enlist Coach' : 'Email Office'}
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Contact Prompt Modal */}
      <AnimatePresence>
        {activeSpecialist && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSpecialist(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Contact {activeSpecialist.name}</h3>
                    <p className="text-slate-500 text-sm">{activeSpecialist.specialty}</p>
                  </div>
                  <button onClick={() => setActiveSpecialist(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hi, I'd like to schedule a session to discuss my performance..."
                      className="w-full min-h-[120px] bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        id="share-resilience"
                        checked={shareResilience}
                        onChange={(e) => setShareResilience(e.target.checked)}
                        className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                    <label htmlFor="share-resilience" className="flex flex-col cursor-pointer">
                      <span className="text-xs font-bold text-emerald-900 leading-tight">Share Resilience Data</span>
                      <span className="text-[10px] text-emerald-700/70">Includes your recent wellness scores and AI insights.</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setActiveSpecialist(null)}
                      className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={scheduling}
                      onClick={handleConfirmContact}
                      className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 hover:bg-slate-800 disabled:opacity-50 transition-all"
                    >
                      {scheduling ? 'Sending...' : (
                        <>
                          <Send size={14} />
                          Send Request
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
