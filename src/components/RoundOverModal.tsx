import React from 'react';
import { Avatar } from './Avatar';
import { soundManager } from '../lib/audio';
import { Trophy, Crown, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScoreEntry {
  id: string;
  username: string;
  avatar: string;
  totalScore: number;
  roundScore: number;
  hasGuessedCorrectly: boolean;
}

interface RoundOverModalProps {
  word: string;
  drawerName: string;
  scores: ScoreEntry[];
  onNextRound?: () => void;
  isHost?: boolean;
}

export const RoundOverModal: React.FC<RoundOverModalProps> = ({
  word,
  drawerName,
  scores,
  onNextRound,
  isHost = false
}) => {
  React.useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FACC15', '#F97316', '#0EA5E9', '#22C55E', '#EF4444']
      });
    } catch {}
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-splatter">
      <div className="relative w-full max-w-md bg-sketch-paper rounded-3xl p-6 border-4 border-slate-900 shadow-sketch-lg text-slate-900 text-center overflow-hidden">
        {/* Decorative spiral sketch header */}
        <div className="flex justify-center mb-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 border-2 border-slate-900 flex items-center justify-center shadow-sketch-sm transform -rotate-6">
            <Crown className="w-7 h-7 text-slate-900 fill-slate-900" />
          </div>
        </div>

        <h2 className="text-3xl font-black tracking-tight text-slate-900 font-doodle mb-1">
          Round Over!
        </h2>

        <p className="text-xs font-bold text-slate-600 mb-3">
          Drawn by <span className="text-amber-600">{drawerName}</span>
        </p>

        {/* Word Reveal Banner matching the screenshot */}
        <div className="relative mb-5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 py-2.5 px-6 rounded-2xl border-3 border-slate-900 shadow-sketch text-center transform rotate-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 block -mb-0.5">
            The word was:
          </span>
          <span className="text-2xl sm:text-3xl font-black tracking-wider text-slate-950 uppercase font-doodle">
            {word}
          </span>
        </div>

        {/* Scores Gain Breakdown */}
        <div className="bg-white/80 rounded-2xl border-2 border-slate-300 p-3 mb-5 space-y-2 max-h-48 overflow-y-auto">
          {scores.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-500 w-4">{index + 1}</span>
                <Avatar id={entry.avatar} size="sm" showCrown={index === 0 && entry.totalScore > 0} />
                <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                  {entry.username}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-black ${entry.roundScore > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  +{entry.roundScore}
                </span>
                <span className="text-xs font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  {entry.totalScore} pts
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button & Fun Accents */}
        <div className="flex flex-col items-center gap-2">
          {isHost && onNextRound && (
            <button
              onClick={() => {
                soundManager.playPop();
                onNextRound();
              }}
              className="w-full py-3 px-6 bg-sky-500 hover:bg-sky-400 text-white font-black text-base rounded-2xl border-3 border-slate-900 shadow-sketch transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 font-doodle uppercase tracking-wider"
            >
              Next Round <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <div className="text-xs font-black text-emerald-600 flex items-center gap-1 font-doodle pt-1">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Great Job! Next turn starting soon...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
