import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Heart } from 'lucide-react';
import { GameIntro } from '../GameIntro';
import { ResultScreen } from '../ResultScreen';

interface ZenColorsProps {
  onComplete: (score: number) => void;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

export function ZenColors({ onComplete }: ZenColorsProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [score, setScore] = useState(0);
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  const [fallingColors, setFallingColors] = useState<{ id: number; color: string; x: number; speed: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [pulseCount, setPulseCount] = useState(0);

  const getSpeedMultiplier = useCallback(() => {
    // Start at 1.0, increase to 2.5x speed at the end (30s)
    const elapsed = 30 - timeLeft;
    return 1 + (elapsed / 20); 
  }, [timeLeft]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    setPulseCount(0);
    setFallingColors([]);
    setTargetColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  };

  const spawnColor = useCallback(() => {
    if (gameState !== 'playing') return;
    const baseSpeed = 3.5 + Math.random() * 1.5;
    const currentMultiplier = getSpeedMultiplier();
    
    // Bias: 40% chance to spawn target color, 60% for others
    const isTarget = Math.random() < 0.4;
    const chosenColor = isTarget 
      ? targetColor 
      : COLORS[Math.floor(Math.random() * COLORS.length)];

    const newColor = {
      id: Date.now() + Math.random(),
      color: chosenColor,
      x: Math.random() * 84 + 8,
      speed: baseSpeed / currentMultiplier
    };
    setFallingColors(prev => [...prev.slice(-15), newColor]); // Keep list managed
  }, [gameState, getSpeedMultiplier, targetColor]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      
      // Dynamic spawning rate
      const spawnRate = Math.max(400, 1000 - (30 - timeLeft) * 15);
      const spawner = setInterval(spawnColor, spawnRate); 
      return () => {
        clearInterval(timer);
        clearInterval(spawner);
      };
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('complete');
    }
  }, [gameState, timeLeft, score, spawnColor]);

  const handleCatch = (id: number, color: string) => {
    if (gameState !== 'playing') return;
    
    if (color === targetColor) {
      setScore(s => s + 10);
      setTargetColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
      setPulseCount(p => p + 1); // Trigger pulse
    } else {
      setScore(s => Math.max(0, s - 5));
    }
    setFallingColors(prev => prev.filter(fc => fc.id !== id));
  };

  if (gameState === 'intro') {
    return (
      <GameIntro 
        title="Zen Colors"
        description="Harmonize with falling tones to reset your internal rhythm."
        instructions={[
          "Identify the target tone at the bottom of the screen",
          "Tap falling spheres that match the target tone",
          "Avoid mismatching spheres as they disrupt your focus",
          "Match colors consecutively for higher XP multipliers"
        ]}
        benefits={["Color Resonance", "Rapid Reaction", "Focus Retention"]}
        onStart={startGame}
        icon={Sun}
        accentColor="bg-orange-500"
      />
    );
  }

  if (gameState === 'complete') {
    return (
      <ResultScreen 
        score={score}
        title="Zen Colors Mastery"
        accentColor="bg-orange-500"
        onFinish={() => onComplete(score)}
      />
    );
  }

  return (
    <div className="relative h-[600px] w-full overflow-hidden flex flex-col items-center">
      <div className="absolute top-4 left-4 right-4 flex justify-between text-slate-900 font-mono text-xs font-bold z-20">
        <div className="bg-white/80 px-4 py-2 rounded-xl backdrop-blur-md border border-white shadow-sm flex items-center gap-2">
          <span className="text-slate-400">TIME</span> {timeLeft}s
        </div>
        <div className="bg-white/80 px-4 py-2 rounded-xl backdrop-blur-md border border-white shadow-sm flex items-center gap-2">
          <span className="text-slate-400">XP</span> {score}
        </div>
      </div>

      <div className="relative flex-1 w-full bg-slate-50/30 rounded-[40px] overflow-hidden">
        <AnimatePresence>
          {fallingColors.map((fc) => (
            <motion.div
              key={fc.id}
              initial={{ y: -60, opacity: 1, scale: 0.8 }}
              animate={{ y: 600, scale: 1 }}
              exit={{ opacity: 0, scale: 2 }}
              transition={{ duration: fc.speed, ease: "linear" }}
              onPointerDown={() => handleCatch(fc.id, fc.color)}
              className="absolute w-16 h-16 rounded-full cursor-pointer shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border-[6px] border-white z-10"
              style={{ 
                backgroundColor: fc.color,
                left: `${fc.x}%`,
                transform: 'translateX(-50%)'
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-8 pb-8 flex flex-col items-center">
        <p className="text-slate-400 mb-4 text-[10px] uppercase tracking-[0.2em] font-black">Sync Target</p>
        <motion.div
          animate={{ 
            scale: [1, 1.15, 1],
            boxShadow: [
              "0 0 0px rgba(0,0,0,0)",
              `0 0 40px ${targetColor}44`,
              "0 0 0px rgba(0,0,0,0)"
            ]
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-28 h-28 rounded-[40px] border-[10px] border-white shadow-2xl relative"
          style={{ backgroundColor: targetColor }}
        >
          {/* Ripple Pulse Effect */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={pulseCount}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 rounded-[30px] z-[-1]"
              style={{ backgroundColor: targetColor }}
            />
          </AnimatePresence>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Sun size={40} className="text-white" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
