import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Avatar } from '@/components/Avatar';
import { soundManager } from '@/lib/audio';
import {
  Users,
  Link as LinkIcon,
  Bot,
  Trophy,
  Flame,
  Sparkles,
  ChevronRight,
  Globe,
  Star,
  Gamepad2
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard.slice(0, 5));
        }
      })
      .catch(() => {});
  }, []);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-chalk-bg text-amber-400 font-doodle text-xl">
        Loading Picto Buzz... 🎨
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-chalk-bg">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center">
        {/* Header Greeting matching Screen 2 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs sm:text-sm font-black text-amber-400 tracking-wider uppercase font-sans">
              Welcome back,
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white font-doodle tracking-tight flex items-center gap-2">
              {user.username}!
              <span className="inline-block animate-crownFloat">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 fill-yellow-400 stroke-amber-700 stroke-2" viewBox="0 0 24 24">
                  <path d="M2 18h20v2H2v-2zm1.5-12l4.5 6 4-8 4 8 4.5-6L21 16H3L3.5 6z" />
                </svg>
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-400">Personal Best</span>
              <p className="text-xl font-black text-amber-400 font-doodle">{user.personalBest || user.totalScore} pts</p>
            </div>
            <Avatar id={user.avatar} size="lg" showCrown={user.totalScore > 300} />
          </div>
        </div>

        {/* 3 Prominent Game Option Brush Cards matching Screen 2 */}
        <div className="space-y-4 mb-8">
          {/* Card 1: 🟡 Yellow Brush Card - Create Room */}
          <button
            onClick={() => {
              soundManager.playPop();
              router.push('/create-room');
            }}
            className="w-full text-left p-5 sm:p-6 rounded-[28px] bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 border-4 border-slate-950 shadow-sketch-yellow brush-card flex items-center justify-between group"
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950 text-amber-400 border-2 border-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase font-doodle tracking-wide">
                  Create Room
                </h2>
                <p className="text-xs sm:text-sm font-bold text-slate-900/80 font-sans">
                  Start your own private game with friends
                </p>
              </div>
            </div>
            <ChevronRight className="w-8 h-8 text-slate-950 group-hover:translate-x-1.5 transition-transform flex-shrink-0" />
          </button>

          {/* Card 2: 🔵 Blue Brush Card - Join Room */}
          <button
            onClick={() => {
              soundManager.playPop();
              router.push('/join');
            }}
            className="w-full text-left p-5 sm:p-6 rounded-[28px] bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500 border-4 border-slate-950 shadow-sketch-blue brush-card flex items-center justify-between group"
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950 text-sky-400 border-2 border-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <LinkIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase font-doodle tracking-wide">
                  Join Room
                </h2>
                <p className="text-xs sm:text-sm font-bold text-slate-900/80 font-sans">
                  Use a room code or invite link to join
                </p>
              </div>
            </div>
            <ChevronRight className="w-8 h-8 text-slate-950 group-hover:translate-x-1.5 transition-transform flex-shrink-0" />
          </button>

          {/* Card 3: 🟢 Green Brush Card - Play with AI */}
          <button
            onClick={() => {
              soundManager.playPop();
              router.push('/ai-mode');
            }}
            className="w-full text-left p-5 sm:p-6 rounded-[28px] bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 border-4 border-slate-950 shadow-sketch-green brush-card flex items-center justify-between group"
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950 text-emerald-400 border-2 border-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase font-doodle tracking-wide">
                  Play with AI
                </h2>
                <p className="text-xs sm:text-sm font-bold text-slate-900/80 font-sans">
                  AI draws stroke-by-stroke, you guess! Solo fun!
                </p>
              </div>
            </div>
            <ChevronRight className="w-8 h-8 text-slate-950 group-hover:translate-x-1.5 transition-transform flex-shrink-0" />
          </button>
        </div>

        {/* Good Vibes Only Sketch matching Screen 2 */}
        <div className="text-center my-2 select-none">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-800/80 border-2 border-dashed border-amber-400/50 text-amber-300 font-doodle text-sm">
            <span>✨ Good Vibes Only! ✨</span>
            <span className="text-lg">😊</span>
          </div>
        </div>

        {/* Stats Grid & Public Matchmaking Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-800/90 border-2 border-slate-700 rounded-2xl p-3 text-center shadow-md">
            <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Score</span>
            <p className="text-lg font-black text-white font-doodle">{user.totalScore} pts</p>
          </div>

          <div className="bg-slate-800/90 border-2 border-slate-700 rounded-2xl p-3 text-center shadow-md">
            <Gamepad2 className="w-5 h-5 text-sky-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Games Played</span>
            <p className="text-lg font-black text-white font-doodle">{user.gamesPlayed}</p>
          </div>

          <div className="bg-slate-800/90 border-2 border-slate-700 rounded-2xl p-3 text-center shadow-md">
            <Star className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Games Won</span>
            <p className="text-lg font-black text-white font-doodle">{user.gamesWon}</p>
          </div>

          <div className="bg-slate-800/90 border-2 border-slate-700 rounded-2xl p-3 text-center shadow-md">
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Best Streak</span>
            <p className="text-lg font-black text-white font-doodle">{user.longestStreak} 🔥</p>
          </div>
        </div>

        {/* Public Matchmaking Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border-2 border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sketch-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-doodle">
                Public Matchmaking
              </h3>
              <p className="text-xs text-slate-400">
                Jump into active games with random players worldwide
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playPop();
              router.push('/matchmaking');
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-sketch-sm font-doodle transition-transform hover:scale-105"
          >
            Find Public Match
          </button>
        </div>
      </main>
    </div>
  );
}
