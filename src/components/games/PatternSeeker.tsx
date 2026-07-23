import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Moon } from 'lucide-react';
import { GameIntro } from '../GameIntro';

import { ResultScreen } from '../ResultScreen';

interface PatternSeekerProps {
  onComplete: (score: number) => void;
}

export function PatternSeeker({ onComplete }: PatternSeekerProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [padOrder, setPadOrder] = useState<number[]>([0, 1, 2, 3]);
  const [score, setScore] = useState(0);

  const shufflePads = () => {
    setPadOrder(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const startNextLevel = (currentScore: number) => {
    const nextSequence = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(nextSequence);
    setUserSequence([]);
    shufflePads();
    showSequence(nextSequence);
  };

  const showSequence = async (seq: number[]) => {
    setIsShowingSequence(true);
    for (let pad of seq) {
      await new Promise(r => setTimeout(r, 500));
      setActivePad(pad);
      // Play a small sound or visual feedback
      await new Promise(r => setTimeout(r, 400));
      setActivePad(null);
    }
    setIsShowingSequence(false);
  };

  const handlePadClick = (index: number) => {
    if (isShowingSequence || gameState !== 'playing') return;
    
    setActivePad(index);
    setTimeout(() => setActivePad(null), 200);

    const newUserSequence = [...userSequence, index];
    setUserSequence(newUserSequence);
    
    if (index !== sequence[newUserSequence.length - 1]) {
      setGameState('complete');
      return;
    }

    if (newUserSequence.length === sequence.length) {
      const levelPoints = sequence.length * 15;
      setScore(s => s + levelPoints);
      setTimeout(() => startNextLevel(score + levelPoints), 800);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setSequence([]);
    startNextLevel(0);
  };

  if (gameState === 'intro') {
    return (
      <GameIntro 
        title="Pattern Flow"
        description="Rhythmic sequence retention for neural synchronization."
        instructions={[
          "Watch the sequence of glowing nodes carefully",
          "Repeat the pattern exactly as it was shown",
          "Each level adds a new pulse to the neural rhythm",
          "Mistakes reset the synchronization process"
        ]}
        benefits={["Memory Retention", "Pattern Recognition", "Rhythmic Flow"]}
        onStart={startGame}
        icon={Moon}
        accentColor="bg-indigo-500"
      />
    );
  }

  if (gameState === 'complete') {
    return (
      <ResultScreen 
        score={score}
        title="Pattern Flow Synchronization"
        accentColor="bg-indigo-500"
        onFinish={() => onComplete(score)}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 h-[500px]">
      <div className="w-full flex justify-center text-slate-900 font-mono text-xs font-bold mb-12">
        <div className="bg-white/80 px-4 py-2 rounded-xl backdrop-blur-md border border-white shadow-sm flex items-center gap-2">
          <span className="text-slate-400">NEURAL LEVEL</span> {sequence.length}
          <div className="w-px h-3 bg-slate-200 mx-2" />
          <span className="text-slate-400">XP</span> {score}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 relative">
        <div className="absolute inset-0 bg-indigo-100/30 blur-3xl rounded-full scale-110" />
        {padOrder.map((i) => (
          <motion.button
            layout
            key={i}
            whileHover={{ scale: isShowingSequence ? 1 : 1.05 }}
            whileTap={{ scale: 0.9 }}
            disabled={isShowingSequence}
            onPointerDown={() => handlePadClick(i)}
            className={`w-36 h-36 rounded-[48px] border-4 border-white transition-all shadow-xl relative z-10 ${
              activePad === i 
                ? 'bg-indigo-400 scale-105 shadow-[0_0_50px_rgba(129,140,248,0.6)]' 
                : 'bg-white/70 backdrop-blur-sm'
            }`}
          >
            <div className={`absolute inset-4 rounded-[32px] border-2 border-dashed ${activePad === i ? 'border-white/40' : 'border-slate-100'}`} />
          </motion.button>
        ))}
      </div>
      
      <div className="mt-12 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isShowingSequence ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
        {isShowingSequence ? "Transmitting Neural Sequence" : "Awaiting User Frequency"}
      </div>
    </div>
  );
}
