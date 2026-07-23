import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, Circle, Triangle, Hexagon, Activity } from 'lucide-react';
import { GameIntro } from '../GameIntro';

import { ResultScreen } from '../ResultScreen';

interface ShapeSorterProps {
  onComplete: (score: number) => void;
}

const SHAPES = [
  { id: 'square', icon: Square, color: '#60a5fa' },
  { id: 'circle', icon: Circle, color: '#f87171' },
  { id: 'triangle', icon: Triangle, color: '#34d399' },
  { id: 'hexagon', icon: Hexagon, color: '#fbbf24' }
];

export function ShapeSorter({ onComplete }: ShapeSorterProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [score, setScore] = useState(0);
  const [currentShape, setCurrentShape] = useState(SHAPES[0]);
  const [shuffledShapes, setShuffledShapes] = useState([...SHAPES]);
  const [timeLeft, setTimeLeft] = useState(25);
  const [combo, setCombo] = useState(0);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(25);
    setCombo(0);
    pickNext();
  };

  const pickNext = () => {
    let next;
    do {
      next = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    } while (next.id === currentShape.id);
    
    // Reshuffle the options
    const shuffled = [...SHAPES].sort(() => Math.random() - 0.5);
    setShuffledShapes(shuffled);
    setCurrentShape(next);
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('complete');
    }
  }, [gameState, timeLeft, score]);

  const handleSort = (shapeId: string) => {
    if (shapeId === currentShape.id) {
      const points = 10 + (combo * 2);
      setScore(s => s + points);
      setCombo(c => c + 1);
      pickNext();
    } else {
      setScore(s => Math.max(0, s - 5));
      setCombo(0);
    }
  };

  if (gameState === 'intro') {
    return (
      <GameIntro 
        title="Shape Harmony"
        description="Symmetric pattern alignment for cognitive reset."
        instructions={[
          "Observe the active shape in the central focus zone",
          "Identify and tap the corresponding portal below",
          "Match correctly to build your resonance multiplier",
          "Speed is essential for optimal neurological results"
        ]}
        benefits={["Symmetric Sorting", "Cognitive Speed", "Pattern Precision"]}
        onStart={startGame}
        icon={Activity}
        accentColor="bg-emerald-500"
      />
    );
  }

  if (gameState === 'complete') {
    return (
      <ResultScreen 
        score={score}
        title="Shape Harmony Precision"
        accentColor="bg-emerald-500"
        onFinish={() => onComplete(score)}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[500px]">
      <div className="w-full flex justify-between text-slate-900 font-mono text-xs font-bold mb-12 relative z-10">
        <div className="bg-white/80 px-4 py-2 rounded-xl backdrop-blur-md border border-white shadow-sm flex items-center gap-2">
          <span className="text-slate-400">TIME</span> {timeLeft}s
        </div>
        <div className="bg-white/80 px-4 py-2 rounded-xl backdrop-blur-md border border-white shadow-sm flex items-center gap-2">
          <span className="text-slate-400">XP</span> {score}
          {combo > 1 && (
            <span className="ml-2 px-1.5 bg-emerald-500 text-white rounded text-[10px] animate-bounce">x{combo}</span>
          )}
        </div>
      </div>

      <div className="relative mb-20">
        <div className="absolute inset-0 bg-emerald-100/50 blur-3xl rounded-full scale-150 animate-pulse" />
        <AnimatePresence mode="wait">
          <motion.div
            key={currentShape.id}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-40 h-40 flex items-center justify-center rounded-[48px] bg-white border-4 border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative z-10"
          >
            <currentShape.icon size={80} color={currentShape.color} strokeWidth={2.5} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
        {shuffledShapes.map((shape) => (
          <motion.button
            layout
            key={shape.id}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSort(shape.id)}
            className="h-28 flex items-center justify-center bg-white/70 rounded-[32px] border-2 border-white hover:bg-white transition-all shadow-xl backdrop-blur-sm group"
          >
            <shape.icon 
              size={40} 
              color={shape.color} 
              className="group-hover:scale-110 transition-transform"
              strokeWidth={2.5}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
