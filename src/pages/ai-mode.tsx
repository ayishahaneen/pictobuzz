import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Avatar } from '@/components/Avatar';
import { AI_DRAWINGS, AIDrawingData, getRandomAIDrawing, AIStroke } from '@/lib/aiDrawings';
import { soundManager } from '@/lib/audio';
import {
  Bot,
  Sparkles,
  Clock,
  RotateCcw,
  Flame,
  Trophy,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Send,
  Play,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AIModePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game state
  const [currentDrawing, setCurrentDrawing] = useState<AIDrawingData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [totalTime] = useState(60);
  const [score, setScore] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hasGuessedCorrectly, setHasGuessedCorrectly] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [revealedWord, setRevealedWord] = useState<string | null>(null);

  // Guessing & hints
  const [inputText, setInputText] = useState('');
  const [guesses, setGuesses] = useState<{ id: string; text: string; isCorrect: boolean }[]>([]);
  const [hintIndex, setHintIndex] = useState(0);
  const [usedHint, setUsedHint] = useState(false);

  // Stroke animation progress
  const [drawnStrokes, setDrawnStrokes] = useState<AIStroke[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const startNewAIRound = useCallback((excludeWord?: string) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const nextDrawing = getRandomAIDrawing(excludeWord);
    setCurrentDrawing(nextDrawing);
    setDrawnStrokes([]);
    setTimeLeft(totalTime);
    setHasGuessedCorrectly(false);
    setIsGameOver(false);
    setRevealedWord(null);
    setRoundScore(0);
    setGuesses([]);
    setHintIndex(0);
    setUsedHint(false);
    setIsPlaying(true);
    soundManager.playPop();

    // Start progressive stroke animation
    animateAIDrawing(nextDrawing.strokes);
  }, [totalTime]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
      return;
    }
    if (user) {
      startNewAIRound();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [user, isLoading]);

  // Progressive Canvas Renderer
  const renderCanvas = useCallback((strokes: AIStroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background to clean sketchbook paper
    ctx.fillStyle = '#FAF7EE';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(226, 217, 197, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 40; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 40; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Render completed strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 1) return;
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  }, []);

  // Progressive stroke-by-stroke animator
  const animateAIDrawing = (allStrokes: AIStroke[]) => {
    let strokeIdx = 0;
    let pointIdx = 0;
    const inProgressStrokes: AIStroke[] = [];

    const step = () => {
      if (strokeIdx >= allStrokes.length) {
        // Drawing finished
        return;
      }

      const targetStroke = allStrokes[strokeIdx];
      if (!inProgressStrokes[strokeIdx]) {
        inProgressStrokes[strokeIdx] = {
          color: targetStroke.color,
          width: targetStroke.width,
          points: []
        };
        soundManager.playDrawStroke();
      }

      // Add points progressively
      const targetPoints = targetStroke.points;
      const ptsToAdd = Math.min(2, targetPoints.length - pointIdx);
      for (let p = 0; p < ptsToAdd; p++) {
        inProgressStrokes[strokeIdx].points.push(targetPoints[pointIdx]);
        pointIdx++;
      }

      renderCanvas(inProgressStrokes);

      if (pointIdx >= targetPoints.length) {
        // Move to next stroke
        strokeIdx++;
        pointIdx = 0;
      }

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(() => {
        setTimeout(step, 40); // 40ms per step for smooth human-like sketching pace
      });
    };

    step();
  };

  // Timer Countdown
  useEffect(() => {
    if (!isPlaying || hasGuessedCorrectly || isGameOver) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeExpire();
          return 0;
        }
        if (prev <= 10) {
          soundManager.playTick(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, hasGuessedCorrectly, isGameOver]);

  const handleTimeExpire = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    setStreak(0);
    if (currentDrawing) {
      setRevealedWord(currentDrawing.word);
      // Finish rendering entire drawing
      renderCanvas(currentDrawing.strokes);
    }
    soundManager.playWrong();
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !isPlaying || hasGuessedCorrectly || isGameOver || !currentDrawing) return;

    const guess = inputText.trim();
    const normGuess = guess.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normWord = currentDrawing.word.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (normGuess === normWord) {
      // Correct!
      setHasGuessedCorrectly(true);
      setIsPlaying(false);
      setRevealedWord(currentDrawing.word);

      // Finish drawing
      renderCanvas(currentDrawing.strokes);

      const points = 100 + Math.floor(400 * (timeLeft / totalTime));
      const bonusPoints = usedHint ? Math.floor(points * 0.7) : points;

      setRoundScore(bonusPoints);
      setScore(prev => prev + bonusPoints);
      setStreak(prev => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });

      setGuesses(prev => [{ id: String(Date.now()), text: guess, isCorrect: true }, ...prev]);
      soundManager.playCorrect();

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FACC15', '#F97316', '#0EA5E9', '#22C55E', '#EF4444']
        });
      } catch {}
    } else {
      // Wrong guess
      soundManager.playWrong();
      setGuesses(prev => [{ id: String(Date.now()), text: guess, isCorrect: false }, ...prev]);
    }

    setInputText('');
  };

  const useHint = () => {
    if (!currentDrawing || usedHint) return;
    setUsedHint(true);
    soundManager.playClose();
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-chalk-bg text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 py-6 flex flex-col justify-center">
        {/* Top Mode Header */}
        <div className="flex items-center justify-between bg-slate-900/90 border-2 border-slate-700 rounded-3xl p-4 mb-4 shadow-sketch-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-green-500 border-2 border-slate-950 flex items-center justify-center shadow-sketch-green">
              <Bot className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-emerald-400 font-doodle flex items-center gap-1.5">
                AI Drawing Arena
              </h1>
              <p className="text-xs text-slate-400 font-bold">
                The AI draws stroke-by-stroke. Type your guess before time runs out!
              </p>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-3">
            <div className="text-center px-3 py-1 bg-slate-800 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block font-bold">Total Score</span>
              <span className="text-base font-black text-amber-400 font-doodle">{score}</span>
            </div>

            <div className="text-center px-3 py-1 bg-slate-800 rounded-xl border border-slate-700">
              <span className="text-[10px] text-orange-400 block font-bold flex items-center gap-0.5 justify-center">
                <Flame className="w-3 h-3" /> Streak
              </span>
              <span className="text-base font-black text-orange-400 font-doodle">{streak} 🔥</span>
            </div>
          </div>
        </div>

        {/* Main Grid: AI Canvas on Left, Guess Panel on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* AI Whiteboard (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            
            {/* Header info bar */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                  Category: {currentDrawing?.category || 'General'}
                </span>
                {revealedWord ? (
                  <span className="text-xs font-black uppercase text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 font-doodle">
                    Word: {revealedWord}
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-slate-400 tracking-widest">
                    {currentDrawing ? Array(currentDrawing.word.length).fill('_').join(' ') : '...'}
                  </span>
                )}
              </div>

              {/* Timer Pill */}
              <div
                className={`px-3 py-1 rounded-full font-black text-sm font-mono flex items-center gap-1.5 border-2 ${
                  timeLeft <= 10
                    ? 'bg-rose-500 text-white border-rose-700 animate-pulse'
                    : 'bg-rose-600 text-white border-rose-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>00:{timeLeft.toString().padStart(2, '0')}</span>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative bg-sketch-paper rounded-3xl p-3 border-4 border-slate-900 shadow-sketch-lg overflow-hidden">
              <div className="absolute top-2 left-4 right-4 flex justify-around pointer-events-none opacity-40">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-full bg-slate-400/80 border border-slate-600" />
                ))}
              </div>

              <div className="w-full h-full pt-4">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={500}
                  className="w-full h-auto rounded-2xl bg-[#FAF7EE] select-none"
                  style={{ aspectRatio: '800 / 500' }}
                />
              </div>

              {/* AI Drawing Indicator */}
              {isPlaying && (
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-300 border border-emerald-400/40 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  AI Sketching... 🎨
                </div>
              )}
            </div>
          </div>

          {/* Right Guessing & Action Panel (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            
            {/* Guesses Log */}
            <div className="bg-slate-900/90 border-2 border-slate-700 rounded-3xl p-4 shadow-sketch-lg h-72 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 font-doodle">
                  Your Guesses
                </h3>
                <span className="text-[10px] text-slate-500 font-bold">{guesses.length} tries</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {guesses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs text-center italic">
                    Watch the AI sketch and type your guess below!
                  </div>
                ) : (
                  guesses.map(g => (
                    <div
                      key={g.id}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold ${
                        g.isCorrect
                          ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 border border-slate-700 text-slate-300'
                      }`}
                    >
                      <span>{g.text}</span>
                      {g.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Hint button */}
              {currentDrawing && !usedHint && isPlaying && (
                <button
                  type="button"
                  onClick={useHint}
                  className="mt-2 py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5" /> Need a Hint? (-30% pts)
                </button>
              )}

              {usedHint && currentDrawing && (
                <div className="mt-2 p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-bold text-center">
                  💡 Hint: {currentDrawing.hints[0]}
                </div>
              )}
            </div>

            {/* Guess Input Form */}
            {isPlaying && !hasGuessedCorrectly ? (
              <form onSubmit={handleGuessSubmit} className="relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type what you see..."
                  autoFocus
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl text-white text-sm font-bold placeholder:text-slate-500 focus:outline-none shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 border-2 border-slate-900 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : hasGuessedCorrectly ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 text-center animate-bounceShort">
                <p className="text-base font-black text-emerald-400 font-doodle">
                  🎉 Correct! You earned +{roundScore} pts!
                </p>
                <button
                  onClick={() => startNewAIRound(currentDrawing?.word)}
                  className="mt-3 w-full py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm rounded-xl border-2 border-slate-900 shadow-sketch-green font-doodle uppercase tracking-wide flex items-center justify-center gap-1.5"
                >
                  Next Drawing <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-center">
                <p className="text-sm font-bold text-rose-300">
                  Time expired! The word was <span className="font-black text-white">{revealedWord}</span>
                </p>
                <button
                  onClick={() => startNewAIRound(currentDrawing?.word)}
                  className="mt-3 w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl border-2 border-slate-900 shadow-sketch font-doodle uppercase tracking-wide flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Try Another Word
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
