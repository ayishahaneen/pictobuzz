import React from 'react';
import { Avatar } from './Avatar';
import { RoomPlayer } from '../context/SocketContext';
import { Trophy, Crown, Sparkles } from 'lucide-react';

interface InRoomLeaderboardProps {
  players: RoomPlayer[];
  currentDrawerId?: string;
}

export const InRoomLeaderboard: React.FC<InRoomLeaderboardProps> = ({
  players,
  currentDrawerId
}) => {
  // Sort players descending by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const maxScore = sortedPlayers[0]?.score || 0;

  return (
    <div className="bg-slate-900/90 border-2 border-slate-700 rounded-3xl p-3.5 shadow-sketch-lg backdrop-blur-md flex flex-col h-full overflow-hidden">
      {/* Golden Banner Header matching the screenshot */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-2xl py-2 px-4 mb-3 border-2 border-slate-900 shadow-sketch text-center transform -rotate-1">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-slate-950 fill-slate-950" />
          <h3 className="text-lg font-black tracking-wider text-slate-950 uppercase font-doodle">
            Leaderboard
          </h3>
        </div>
      </div>

      {/* Players Ranking List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {sortedPlayers.map((player, index) => {
          const isLeader = maxScore > 0 && player.score === maxScore;
          const isDrawer = player.id === currentDrawerId;

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2 rounded-2xl border-2 transition-all ${
                isLeader
                  ? 'bg-amber-500/15 border-amber-400/80 shadow-sketch-yellow'
                  : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Rank Number */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border ${
                    index === 0
                      ? 'bg-amber-400 text-slate-950 border-amber-600'
                      : index === 1
                      ? 'bg-slate-300 text-slate-950 border-slate-400'
                      : index === 2
                      ? 'bg-amber-700 text-white border-amber-800'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {index + 1}
                </div>

                {/* Avatar with Golden Crown on Leader */}
                <Avatar
                  id={player.avatar}
                  size="sm"
                  showCrown={isLeader}
                />

                {/* Player details */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white truncate max-w-[100px]">
                      {player.username}
                    </span>
                    {isLeader && (
                      <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                  {isDrawer && (
                    <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                      🎨 Drawing
                    </span>
                  )}
                </div>
              </div>

              {/* Score breakdown */}
              <div className="text-right">
                <span className="text-sm font-black text-amber-400">
                  {player.score}
                </span>
                {player.roundScore > 0 && (
                  <span className="text-[10px] font-extrabold text-emerald-400 ml-1">
                    +{player.roundScore}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 text-center flex items-center justify-center gap-1.5 text-xs font-black text-amber-300 font-doodle">
        <Sparkles className="w-4 h-4 text-amber-400 animate-wiggle" />
        <span>Keep Guessing! 🏆</span>
      </div>
    </div>
  );
};
