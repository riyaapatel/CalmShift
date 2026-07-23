import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Laugh, 
  Ghost, 
  Rocket, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { GameIntro } from '../GameIntro';
import { ResultScreen } from '../ResultScreen';

interface Scene {
  text: string;
  visualPrompt: string;
}

interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface StoryData {
  title: string;
  scenes: Scene[];
  quiz: Question[];
}

interface StoryScrollsProps {
  onComplete: (score: number) => void;
}

const CATEGORIES = [
  { id: 'History', icon: History, label: 'Historical BG', color: 'bg-amber-500', accent: 'text-amber-500' },
  { id: 'Comedy', icon: Laugh, label: 'B-Green Laughs', color: 'bg-emerald-500', accent: 'text-emerald-500' },
  { id: 'Horror', icon: Ghost, label: 'Haunted KY', color: 'bg-purple-500', accent: 'text-purple-500' },
  { id: 'Future', icon: Rocket, label: 'BG 2077', color: 'bg-blue-500', accent: 'text-blue-500' },
];

export function StoryScrolls({ onComplete }: StoryScrollsProps) {
  const [gameState, setGameState] = useState<'intro' | 'loading' | 'scrolling' | 'quiz' | 'complete'>('intro');
  const [category, setCategory] = useState<string | null>(null);
  const [story, setStory] = useState<StoryData | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchStory = async (cat: string) => {
    setCategory(cat);
    setGameState('loading');
    try {
      const res = await fetch('/api/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat }),
      });
      const data = await res.json();
      if (data && Array.isArray(data.scenes) && data.scenes.length > 0 && Array.isArray(data.quiz) && data.quiz.length > 0) {
        setStory(data);
        setCurrentSceneIndex(0);
        setQuizIndex(0);
        setQuizScore(0);
        setSelectedOption(null);
        setIsCorrect(null);
        setGameState('scrolling');
      } else {
        throw new Error('Invalid story response');
      }
    } catch (error) {
      console.error('Failed to fetch story:', error);
      setGameState('intro');
    }
  };

  const handleNextScene = () => {
    const scenesCount = story?.scenes?.length || 0;
    if (currentSceneIndex < scenesCount - 1) {
      setCurrentSceneIndex(prev => prev + 1);
    } else {
      setGameState('quiz');
    }
  };

  const handleAnswer = (option: string) => {
    if (selectedOption || !story?.quiz?.[quizIndex]) return;
    
    const correctOption = story.quiz[quizIndex].answer;
    setSelectedOption(option);
    
    if (option === correctOption) {
      setIsCorrect(true);
      setQuizScore(s => s + 33); // Approx 100/3
    } else {
      setIsCorrect(false);
    }

    setTimeout(() => {
      const quizCount = story.quiz?.length || 0;
      if (quizIndex < quizCount - 1) {
        setQuizIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setGameState('complete');
      }
    }, 1500);
  };

  if (gameState === 'complete') {
    return (
      <ResultScreen 
        score={quizScore + (isCorrect ? 34 : 0)} // Using calculation here for immediate state or we can rely on quizScore update
        title={`${category} Narrative Mastery`}
        accentColor="bg-slate-900"
        onFinish={() => onComplete(quizScore)}
      />
    );
  }

  if (gameState === 'intro') {
    return (
      <GameIntro 
        title="Story Scrolls"
        description="Immersive reels of Bowling Green tales. Watch, learn, and recall."
        instructions={[
          "Choose a story category rooted in BG, KY history and lore",
          "Vertical scroll through the story reels like a social feed",
          "Pay close attention to names, dates, and specific details",
          "Answer 3 synchronization questions at the end to earn XP"
        ]}
        benefits={["Amnestic Resilience", "Information Retention", "Local Connection"]}
        onStart={() => {}} // Not used as we select category below
        icon={Play}
        accentColor="bg-slate-900"
      >
        <div className="grid grid-cols-2 gap-4 mt-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => fetchStory(cat.id)}
              className="group p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:scale-105 transition-all text-center flex flex-col items-center gap-3"
            >
              <div className={`w-12 h-12 rounded-2xl ${cat.color} flex items-center justify-center text-white shadow-lg`}>
                <cat.icon size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">{cat.label}</span>
            </button>
          ))}
        </div>
      </GameIntro>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="w-16 h-16 border-4 border-slate-100 border-t-indigo-500 rounded-full shadow-inner"
        />
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-1">Synthesizing BG Lore</h3>
          <p className="text-xs text-slate-400 animate-pulse">Scanning historical archives and future possibilities...</p>
        </div>
      </div>
    );
  }

  if (gameState === 'scrolling' && story) {
    return (
      <div className="relative h-[600px] w-full max-w-sm mx-auto overflow-hidden rounded-[40px] shadow-2xl border-8 border-slate-900 bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSceneIndex}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="absolute inset-0 flex flex-col"
          >
            {/* Visual Placeholder with Category Overlay */}
            <div className="h-2/3 relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950">
              <div className="absolute inset-0 opacity-40">
                <div className={`absolute top-0 left-0 w-full h-full ${category === 'History' ? 'bg-amber-900/40' : category === 'Horror' ? 'bg-purple-900/40' : category === 'Comedy' ? 'bg-emerald-900/40' : 'bg-blue-900/40'}`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1),transparent)]" />
              </div>
              
              <div className="absolute bottom-10 left-10 right-10 z-20">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2 block">{category} • Reel {currentSceneIndex + 1}</span>
                  <p className="text-white font-medium leading-relaxed italic">
                    {story.scenes?.[currentSceneIndex]?.text || story.scenes?.[0]?.text || "Narrative scene..."}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Controls / Info Area */}
            <div className="flex-1 bg-slate-900 p-8 flex flex-col justify-between border-t border-white/5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40">
                    {CATEGORIES.find(c => c.id === category)?.icon && React.createElement(CATEGORIES.find(c => c.id === category)!.icon, { size: 16 })}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{story.title}</h4>
                    <span className="text-white/40 text-[10px] font-bold uppercase">Bowling Green Narrative</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentSceneIndex + 1) / (story.scenes?.length || 1)) * 100}%` }}
                    className="h-full bg-indigo-500"
                  />
                </div>
                <button 
                  onClick={handleNextScene}
                  className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/90 transition-all"
                >
                  {currentSceneIndex === (story.scenes?.length || 1) - 1 ? 'Start Assessment' : 'Next Reel'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Floating Navigation Hints */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30">
          <div className="flex flex-col items-center gap-1">
             <div className="w-1 h-8 bg-white/20 rounded-full" />
             <ChevronUp className="text-white/20" size={16} />
          </div>
          <div className="flex flex-col items-center gap-1">
             <ChevronDown className="text-white/60 animate-bounce" size={16} />
             <div className="w-1 h-8 bg-white/40 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'quiz' && story) {
    const currentQ = story.quiz[quizIndex];
    
    return (
      <div className="flex flex-col items-center justify-center p-6 h-[500px]">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center">
            <div className="bg-indigo-50 inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 border border-indigo-100">
               <CheckCircle2 size={14} className="text-indigo-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Synchronization Stage {quizIndex + 1}/3</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 px-4 leading-tight">{currentQ.question}</h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((opt, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.98 }}
                disabled={!!selectedOption}
                onClick={() => handleAnswer(opt)}
                className={`w-full p-4 rounded-2xl border-2 transition-all text-left font-medium text-sm flex items-center justify-between ${
                  selectedOption === opt
                    ? isCorrect
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                      : 'bg-rose-50 border-rose-500 text-rose-900'
                    : selectedOption && opt === currentQ.answer
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                    : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600 shadow-sm'
                }`}
              >
                {opt}
                {selectedOption === opt && (
                  isCorrect ? <CheckCircle2 size={18} className="text-emerald-500" /> : <RefreshCw size={18} className="text-rose-500" />
                )}
              </motion.button>
            ))}
          </div>

          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === quizIndex ? 'w-8 bg-indigo-500' : i < quizIndex ? 'w-4 bg-indigo-200' : 'w-4 bg-slate-100'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
