import React, { useEffect, useState } from 'react';
import { soundManager } from '../lib/audio';
import { Sparkles, Clock } from 'lucide-react';

interface WordSelectorProps {
  words: string[];
  duration?: number;
  onSelectWord: (word: string) => void;
}

export const WordSelector: React.FC<WordSelectorProps> = ({
  words,
  duration = 15,
  onSelectWord
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-select first choice
          if (words.length > 0) {
            onSelectWord(words[0]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, words, onSelectWord]);

  const buttonColors = [
    { bg: 'bg-amber-400 hover:bg-amber-300 text-slate-900 border-amber-500 shadow-sketch-yellow' },
    { bg: 'bg-sky-400 hover:bg-sky-300 text-slate-900 border-sky-500 shadow-sketch-blue' },
    { bg: 'bg-emerald-400 hover:bg-emerald-300 text-slate-900 border-emerald-500 shadow-sketch-green' },
  ];

  return (
    <div className="w-full bg-slate-900/95 border-2 border-amber-400/80 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md text-center animate-bounceShort mb-4">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Sparkles className="w-6 h-6 text-yellow-400 animate-wiggle" />
        <h3 className="text-xl sm:text-2xl font-black text-amber-400 font-doodle tracking-wide">
          Your Turn to Draw! Choose a word:
        </h3>
      </div>

      <p className="text-xs sm:text-sm text-slate-300 mb-4 font-sans">
        Pick one secret word to sketch. Guessers will not see your choices!
      </p>

      {/* 3 Large Word Choice Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto">
        {words.map((word, index) => {
          const color = buttonColors[index % buttonColors.length];
          return (
            <button
              key={word}
              onClick={() => {
                soundManager.playPop();
                onSelectWord(word);
              }}
              className={`py-3.5 px-5 rounded-2xl font-black text-lg sm:text-xl border-3 uppercase tracking-wider transition-all transform hover:-translate-y-1 active:translate-y-0.5 ${color.bg}`}
            >
              {word}
            </button>
          );
        })}
      </div>

      {/* Countdown timer */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300/80">
        <Clock className="w-4 h-4" />
        <span>Auto-selecting in {timeLeft}s</span>
      </div>
    </div>
  );
};
