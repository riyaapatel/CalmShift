import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO
} from 'date-fns';
import { GlassCard } from './GlassCard';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './FirebaseProvider';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface Shift {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  date: string;
}

interface Activity {
  id: string;
  title: string;
  completed: boolean;
  date: string;
}

export function ShiftCalendar() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [newShift, setNewShift] = useState({ start: '09:00', end: '17:00' });

  // Fetch shifts and activities
  useEffect(() => {
    if (!user) return;

    const shiftsQuery = query(collection(db, 'shifts'), where('userId', '==', user.uid));
    const unsubscribeShifts = onSnapshot(shiftsQuery, (snapshot) => {
      setShifts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Shift[]);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'shifts'));

    const activitiesQuery = query(collection(db, 'activities'), where('userId', '==', user.uid));
    const unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
      setActivities(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Activity[]);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'activities'));

    return () => {
      unsubscribeShifts();
      unsubscribeActivities();
    };
  }, [user]);

  const addShift = async () => {
    if (!user) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const shiftId = `shift_${Date.now()}`;
    try {
      await setDoc(doc(db, 'shifts', shiftId), {
        userId: user.uid,
        date: dateStr,
        startTime: newShift.start,
        endTime: newShift.end
      });
      setIsAddingShift(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `shifts/${shiftId}`);
    }
  };

  const deleteShift = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'shifts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `shifts/${id}`);
    }
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl font-bold text-emerald-950 flex items-center gap-3">
        <CalendarIcon className="text-emerald-600" />
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <div className="flex gap-2">
        <button 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-emerald-50 rounded-xl border border-emerald-100 transition-colors text-emerald-700"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-emerald-50 rounded-xl border border-emerald-100 transition-colors text-emerald-700"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map(day => (
          <div key={day} className="text-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        const dateStr = format(day, 'yyyy-MM-dd');
        const hasShift = shifts.some(s => s.date === dateStr);
        const dayActivities = activities.filter(a => a.date === dateStr);
        const allCompleted = dayActivities.length > 0 && dayActivities.every(a => a.completed);

        days.push(
          <div
            key={day.toString()}
            className={`relative h-24 border border-emerald-50/30 p-2 transition-all cursor-pointer hover:bg-emerald-50/50 ${
              !isSameMonth(day, monthStart) ? 'bg-slate-50/20 text-slate-300' : 'text-slate-700'
            } ${isSameDay(day, selectedDate) ? 'bg-emerald-50/80 ring-2 ring-emerald-500 ring-inset' : ''}`}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <span className="text-xs font-bold">{formattedDate}</span>
            <div className="mt-2 flex flex-col gap-1">
              {hasShift && (
                <div className="w-full h-1 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
              )}
              <div className="flex gap-1">
                {dayActivities.slice(0, 3).map(a => (
                  <div 
                    key={a.id} 
                    className={`w-1.5 h-1.5 rounded-full ${a.completed ? 'bg-emerald-400' : 'bg-slate-300'}`} 
                  />
                ))}
              </div>
            </div>
            {isSameDay(day, new Date()) && (
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border border-emerald-100 rounded-3xl overflow-hidden bg-white/40">{rows}</div>;
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayShifts = shifts.filter(s => s.date === selectedDateStr);
  const dayActivities = activities.filter(a => a.date === selectedDateStr);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <GlassCard className="xl:col-span-2 bg-white/80 border-white shadow-xl">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </GlassCard>

      <div className="space-y-6">
        <GlassCard className="bg-emerald-900 text-white border-emerald-800 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock size={80} />
          </div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock size={20} className="text-emerald-300" />
            {format(selectedDate, 'EEE, MMM d')}
          </h3>
          
          <div className="space-y-4 relative z-10">
            {dayShifts.map(s => (
              <div key={s.id} className="p-4 bg-white/10 rounded-2xl border border-white/20 flex justify-between items-center group">
                <div>
                  <div className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-1">Shift Time</div>
                  <div className="text-xl font-bold">{s.startTime} - {s.endTime}</div>
                </div>
                <button 
                  onClick={() => deleteShift(s.id)}
                  className="p-2 text-white/40 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            {dayShifts.length === 0 && !isAddingShift && (
              <button 
                onClick={() => setIsAddingShift(true)}
                className="w-full py-6 border-2 border-dashed border-white/20 rounded-2xl text-white/60 hover:text-white hover:border-white/40 transition-all flex flex-col items-center gap-2"
              >
                <Plus />
                <span className="text-xs font-bold uppercase tracking-widest">Add Shift</span>
              </button>
            )}

            {isAddingShift && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white/20 rounded-2xl border border-white/30 space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-emerald-300 mb-1 block">Start</label>
                    <input 
                      type="time" 
                      value={newShift.start}
                      onChange={(e) => setNewShift(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full bg-emerald-800 border border-emerald-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-emerald-300 mb-1 block">End</label>
                    <input 
                      type="time" 
                      value={newShift.end}
                      onChange={(e) => setNewShift(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full bg-emerald-800 border border-emerald-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={addShift}
                    className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 transition-colors"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setIsAddingShift(false)}
                    className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="bg-white/80 border-white shadow-lg">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            Day Rituals
          </h3>
          <div className="space-y-2">
            {dayActivities.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                {a.completed ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                )}
                <span className={`text-xs ${a.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                  {a.title}
                </span>
              </div>
            ))}
            {dayActivities.length === 0 && (
              <p className="text-center py-6 text-slate-400 text-[10px] uppercase font-bold italic">No rituals planned</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
