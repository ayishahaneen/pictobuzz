import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Avatar } from './Avatar';
import { soundManager } from '../lib/audio';
import { Trophy, Crown, RotateCcw, Home, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlayerRank {
  id: string;
  username: string;
  avatar: string;
  score: number;
}

interface GameOverModalProps {
  rankings: PlayerRank[];
  winners: PlayerRank[];
  totalRounds: number;
  onPlayAgain?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  rankings,
  winners,
  totalRounds,
  onPlayAgain
}) => {
  const router = useRouter();

  useEffect(() => {
    // Grand celebratory confetti cannon
    try {
      const duration = 3.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FACC15', '#F97316', '#0EA5E9', '#22C55E', '#EF4444']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FACC15', '#F97316', '#0EA5E9', '#22C55E', '#EF4444']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch {}
  }, []);

  const topWinner = winners[0] || rankings[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-splatter">
      <div className="relative w-full max-w-lg bg-sketch-paper rounded-3xl p-6 sm:p-8 border-4 border-slate-900 shadow-sketch-lg text-slate-900 text-center overflow-hidden">
        {/* Top Trophy & Crown */}
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-3 border-slate-900 flex items-center justify-center shadow-sketch mx-auto">
            <Trophy className="w-10 h-10 text-slate-900 fill-slate-900" />
          </div>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Crown className="w-8 h-8 text-yellow-500 fill-yellow-400 animate-crownFloat" />
          </div>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-doodle tracking-tight mb-1">
          Game Completed!
        </h2>

        <p className="text-sm font-bold text-slate-600 mb-6">
          {winners.length > 1 ? "It's a Tie for First Place! 🌟" : `${topWinner?.username} Takes the Crown! 👑`}
        </p>

        {/* Podium for Top 3 */}
        <div className="grid grid-cols-3 gap-2 items-end mb-6 pt-4 px-2">
          {/* 2nd Place */}
          {rankings[1] ? (
            <div className="flex flex-col items-center">
              <Avatar id={rankings[1].avatar} size="md" />
              <span className="text-xs font-black text-slate-800 truncate max-w-[80px] mt-1">
                {rankings[1].username}
              </span>
              <span className="text-[11px] font-black text-slate-500">
                {rankings[1].score} pts
              </span>
              <div className="w-full h-16 bg-slate-300 rounded-t-xl border-2 border-b-0 border-slate-900 mt-2 flex items-center justify-center font-black text-lg text-slate-700">
                2
              </div>
            </div>
          ) : <div />}

          {/* 1st Place (Center & Tallest) */}
          {topWinner && (
            <div className="flex flex-col items-center">
              <Avatar id={topWinner.avatar} size="lg" showCrown />
              <span className="text-sm font-black text-amber-700 truncate max-w-[90px] mt-1">
                {topWinner.username}
              </span>
              <span className="text-xs font-black text-amber-600">
                {topWinner.score} pts
              </span>
              <div className="w-full h-24 bg-amber-400 rounded-t-xl border-3 border-b-0 border-slate-900 mt-2 flex items-center justify-center font-black text-2xl text-slate-950 shadow-sm">
                1 🏆
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {rankings[2] ? (
            <div className="flex flex-col items-center">
              <Avatar id={rankings[2].avatar} size="md" />
              <span className="text-xs font-black text-slate-800 truncate max-w-[80px] mt-1">
                {rankings[2].username}
              </span>
              <span className="text-[11px] font-black text-slate-500">
                {rankings[2].score} pts
              </span>
              <div className="w-full h-12 bg-amber-700/70 rounded-t-xl border-2 border-b-0 border-slate-900 mt-2 flex items-center justify-center font-black text-base text-amber-100">
                3
              </div>
            </div>
          ) : <div />}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onPlayAgain && (
            <button
              onClick={() => {
                soundManager.playPop();
                onPlayAgain();
              }}
              className="w-full sm:w-auto flex-1 py-3 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-2xl border-3 border-slate-900 shadow-sketch transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 font-doodle uppercase tracking-wider"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playPop();
              router.push('/dashboard');
            }}
            className="w-full sm:w-auto flex-1 py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-2xl border-3 border-slate-900 shadow-sketch transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 font-doodle uppercase tracking-wider"
          >
            <Home className="w-4 h-4" /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
