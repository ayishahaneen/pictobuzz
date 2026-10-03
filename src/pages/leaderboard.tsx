import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Avatar } from '@/components/Avatar';
import { soundManager } from '@/lib/audio';
import { Trophy, Crown, Medal, Star, Flame, ArrowLeft } from 'lucide-react';

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-chalk-bg text-white">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        {/* Back button & Page header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => {
              soundManager.playPop();
              router.push('/dashboard');
            }}
            className="p-2 rounded-xl bg-slate-800 border-2 border-slate-700 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-amber-400 font-doodle tracking-wide flex items-center gap-2">
              <Trophy className="w-8 h-8 text-amber-400 fill-amber-400" />
              Global Leaderboard
            </h1>
            <p className="text-xs text-slate-400 font-bold">
              Top doodlers and guessers in the Picto Buzz hall of fame
            </p>
          </div>
        </div>

        {/* Leaderboard Card */}
        <div className="bg-slate-900/90 border-3 border-slate-700 rounded-[32px] p-4 sm:p-6 shadow-sketch-lg">
          {isLoading ? (
            <div className="py-12 text-center text-amber-400 font-bold font-doodle text-lg">
              Loading rankings... 🏆
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm font-bold">
              No ranked doodlers yet. Be the first to claim the golden crown!
            </div>
          ) : (
            <div className="space-y-2.5">
              {leaderboard.map((player, index) => {
                const isLeader = index === 0;
                const isMe = user?.id === player.id;

                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                      isLeader
                        ? 'bg-amber-500/15 border-amber-400 shadow-sketch-yellow'
                        : isMe
                        ? 'bg-sky-500/15 border-sky-400'
                        : 'bg-slate-800/80 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 ${
                          index === 0
                            ? 'bg-amber-400 text-slate-950 border-amber-600 shadow-sm'
                            : index === 1
                            ? 'bg-slate-200 text-slate-900 border-slate-400'
                            : index === 2
                            ? 'bg-amber-700 text-white border-amber-800'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {index + 1}
                      </div>

                      {/* Avatar with Golden Crown on #1 */}
                      <Avatar
                        id={player.avatar}
                        size="md"
                        showCrown={isLeader}
                      />

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm sm:text-base font-black text-white">
                            {player.username}
                          </span>
                          {isLeader && <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                          {isMe && (
                            <span className="text-[10px] font-black text-sky-400 bg-sky-500/20 px-2 py-0.5 rounded-full">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-2">
                          <span>{player.gamesWon} wins</span>
                          <span>•</span>
                          <span>{player.gamesPlayed} played</span>
                        </span>
                      </div>
                    </div>

                    {/* Total Score */}
                    <div className="text-right">
                      <span className="text-lg sm:text-xl font-black text-amber-400 font-doodle block">
                        {player.totalScore} pts
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400">
                        {player.gamesPlayed > 0 ? Math.round((player.gamesWon / player.gamesPlayed) * 100) : 0}% win rate
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
