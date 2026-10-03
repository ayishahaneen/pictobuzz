import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from './Avatar';
import { soundManager } from '../lib/audio';
import { Send, CheckCircle2, XCircle, Sparkles, MessageSquare } from 'lucide-react';
import { GuessMsg } from '../context/SocketContext';

interface GuessingPanelProps {
  guesses: GuessMsg[];
  isDrawer: boolean;
  hasGuessedCorrectly: boolean;
  closeHint?: string | null;
  onSendGuess: (text: string) => void;
  disabled?: boolean;
}

export const GuessingPanel: React.FC<GuessingPanelProps> = ({
  guesses,
  isDrawer,
  hasGuessedCorrectly,
  closeHint,
  onSendGuess,
  disabled = false
}) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [guesses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isDrawer || hasGuessedCorrectly || disabled) return;
    onSendGuess(inputText);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border-2 border-slate-700 rounded-3xl p-3 shadow-sketch-lg backdrop-blur-md overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 font-doodle">
            Live Guesses & Chat
          </h4>
        </div>
        <span className="text-[10px] font-bold text-slate-500">
          {guesses.length} messages
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-2 px-1 space-y-2 max-h-[340px] scrollbar-thin">
        {guesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-36 text-center text-slate-500 text-xs italic">
            <Sparkles className="w-5 h-5 text-amber-500/40 mb-1" />
            No guesses yet! Type your answer below.
          </div>
        ) : (
          guesses.map((msg) => {
            if (msg.isSystem) {
              return (
                <div
                  key={msg.id}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold text-center animate-bounceShort"
                >
                  📢 {msg.text}
                </div>
              );
            }

            if (msg.isCorrect) {
              return (
                <div
                  key={msg.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-300 text-xs font-black animate-wiggle shadow-sm"
                >
                  <Avatar id={msg.avatar} size="sm" />
                  <div className="flex-1">
                    <span className="text-emerald-400 font-bold">{msg.username}</span>
                    <span className="ml-1.5">{msg.text}</span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs transition-all hover:bg-slate-800"
              >
                <Avatar id={msg.avatar} size="sm" />
                <div className="flex-1 break-words">
                  <span className="font-bold text-slate-400 mr-1.5">{msg.username}:</span>
                  <span className="text-white font-medium">{msg.text}</span>
                </div>
                <XCircle className="w-3.5 h-3.5 text-rose-500/70 flex-shrink-0" />
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Close Guess Hint Banner */}
      {closeHint && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-yellow-500/20 border border-yellow-400 text-yellow-300 text-xs font-bold text-center animate-wiggle">
          {closeHint}
        </div>
      )}

      {/* Input Field Form */}
      <form onSubmit={handleSubmit} className="pt-2 border-t border-slate-800">
        {isDrawer ? (
          <div className="px-3 py-2.5 rounded-2xl bg-slate-800/90 text-amber-300 text-xs font-bold text-center border-2 border-dashed border-amber-400/40">
            🎨 You are drawing! Watch your friends guess.
          </div>
        ) : hasGuessedCorrectly ? (
          <div className="px-3 py-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 text-xs font-black text-center border-2 border-emerald-500/40 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            You got it! Waiting for next round...
          </div>
        ) : (
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your guess here..."
              disabled={disabled}
              className="w-full pl-4 pr-12 py-2.5 bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-full text-white text-sm font-semibold placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || disabled}
              className="absolute right-1.5 p-2 rounded-full bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 border-2 border-slate-900 shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
