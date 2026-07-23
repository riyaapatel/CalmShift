import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { motion, Reorder } from 'motion/react';
import { CheckCircle2, Circle, Plus, Trash2, Zap } from 'lucide-react';
import { doc, setDoc, updateDoc, increment, deleteDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './FirebaseProvider';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface Activity {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  date: string;
}

interface ActivityCalendarProps {
  suggestedActivities: Omit<Activity, 'id' | 'completed' | 'date'>[];
}

export function ActivityCalendar({ suggestedActivities }: ActivityCalendarProps) {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<Activity[]>([]);

  React.useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'activities'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Activity[];
      setTasks(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'activities');
    });
    return unsubscribe;
  }, [user]);

  const addActivity = async (activity: Omit<Activity, 'id' | 'completed' | 'date'>) => {
    if (!user) return;
    const activityId = `act_${Date.now()}`;
    try {
      await setDoc(doc(db, 'activities', activityId), {
        ...activity,
        userId: user.uid,
        completed: false,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `activities/${activityId}`);
    }
  };

  const toggleComplete = async (task: Activity) => {
    if (!user) return;
    const newStatus = !task.completed;
    try {
      await updateDoc(doc(db, 'activities', task.id), { completed: newStatus });
      
      if (newStatus) {
        // Award points
        await updateDoc(doc(db, 'users', user.uid), { totalPoints: increment(task.points) });
      } else {
        // Deduct points
        await updateDoc(doc(db, 'users', user.uid), { totalPoints: increment(-task.points) });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `activities/${task.id}`);
    }
  };

  const removeTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'activities', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `activities/${id}`);
    }
  };

  const progress = tasks.length > 0 
    ? (tasks.filter(t => t.completed).length / tasks.length) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Suggestions Pool */}
      <GlassCard className="h-full bg-white/40 border-white/60">
        <h3 className="text-lg font-bold text-emerald-900 mb-6 flex items-center gap-2">
          <Zap size={18} className="text-amber-500" />
          AI Rituals
        </h3>
        <div className="space-y-4">
          {suggestedActivities.length === 0 && (
            <p className="text-slate-400 italic text-sm">Complete a stress test to get AI rituals.</p>
          )}
          {suggestedActivities.map((act, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addActivity(act)}
              className="w-full text-left p-4 bg-white/60 rounded-2xl border border-white flex justify-between items-center group shadow-sm hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <div>
                <h4 className="text-slate-900 font-semibold text-sm">{act.title}</h4>
                <p className="text-slate-500 text-[11px] italic">{act.description}</p>
                <span className="text-emerald-600 text-[10px] font-bold mt-1 inline-block">+{act.points} PTS</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-emerald-100">
                <Plus size={20} />
              </div>
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* Today's Schedule */}
      <GlassCard className="bg-white/80 border-white shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Today's Focus</h3>
          <div className="text-emerald-600 font-bold text-xs uppercase tracking-widest">{Math.round(progress)}% Complete</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
          <motion.div 
            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-4 p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100/50">
              <button 
                onClick={() => toggleComplete(task)}
                className={task.completed ? "text-emerald-600" : "text-slate-300"}
              >
                {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              <div className="flex-1">
                <span className={task.completed ? "text-slate-400 line-through" : "text-slate-700 font-medium text-sm"}>
                  {task.title}
                </span>
              </div>
              <button onClick={() => removeTask(task.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-center text-slate-300 py-12 text-sm italic">Your calendar is open. Add suggested rituals.</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
