import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Avatar, AVATAR_PRESETS } from '@/components/Avatar';
import { soundManager } from '@/lib/audio';
import {
  User,
  Trophy,
  Star,
  Flame,
  Gamepad2,
  CheckCircle,
  Save,
  ArrowLeft,
  Volume2,
  VolumeX,
  History,
  ShieldCheck
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar_1');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    } else if (user) {
      setUsername(user.username);
      setSelectedAvatar(user.avatar || 'avatar_1');
    }
  }, [user, isLoading, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsSaving(true);
    soundManager.playPop();

    const res = await updateProfile({
      username: username.trim(),
      avatar: selectedAvatar
    });

    setIsSaving(false);

    if (res.success) {
      setStatusMessage('Profile updated successfully! 🎉');
      soundManager.playCorrect();
      setTimeout(() => setStatusMessage(''), 3000);
    } else {
      setStatusMessage(res.error || 'Failed to update profile');
      soundManager.playWrong();
    }
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) soundManager.playPop();
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-chalk-bg text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Back navigation */}
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
              <User className="w-8 h-8 text-amber-400" />
              Player Profile & Settings
            </h1>
            <p className="text-xs text-slate-400 font-bold">
              Customize your persona and review your match statistics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Profile Edit Card (5 cols) */}
          <div className="md:col-span-5 bg-slate-900/90 border-3 border-slate-700 rounded-[32px] p-6 shadow-sketch-lg">
            <div className="text-center mb-6">
              <Avatar id={selectedAvatar} size="2xl" showCrown={user.totalScore > 300} />
              <h2 className="text-xl font-black text-white font-doodle mt-2">
                {username || user.username}
              </h2>
              <p className="text-xs text-slate-400 font-mono truncate">{user.email}</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Preset Grid */}
              <div>
                <label className="block text-xs font-black text-slate-300 uppercase mb-2">
                  Change Avatar
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(p.id);
                        soundManager.playPop();
                      }}
                      className={`p-1.5 rounded-2xl border-2 flex items-center justify-center transition-all ${
                        selectedAvatar === p.id
                          ? 'border-amber-400 bg-amber-500/20 scale-105 shadow-sm'
                          : 'border-slate-700 bg-slate-800/60 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Avatar id={p.id} size="sm" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-xs font-black text-slate-300 uppercase mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-xl text-sm font-bold text-white focus:outline-none"
                />
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-bold text-center">
                  {statusMessage}
                </div>
              )}

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl border-2 border-slate-950 shadow-sketch-yellow font-doodle uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>

            {/* Sound Settings Card */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Game Sound Effects</span>
                <span className="text-[10px] text-slate-400">Pencil scratch, chimes & fanfares</span>
              </div>
              <button
                type="button"
                onClick={toggleSound}
                className={`p-2.5 rounded-xl border-2 flex items-center gap-1.5 text-xs font-bold ${
                  !isMuted
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {!isMuted ? 'Mute' : 'Unmute'}
              </button>
            </div>
          </div>

          {/* Stats & Match History (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Stats Grid */}
            <div className="bg-slate-900/90 border-3 border-slate-700 rounded-[32px] p-6 shadow-sketch-lg">
              <h3 className="text-base font-black text-amber-400 font-doodle uppercase tracking-wider mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" /> Lifetime Performance
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
                  <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-bold">Total Score</span>
                  <p className="text-xl font-black text-white font-doodle">{user.totalScore} pts</p>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
                  <Gamepad2 className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-bold">Games Won</span>
                  <p className="text-xl font-black text-white font-doodle">{user.gamesWon} / {user.gamesPlayed}</p>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-bold">Correct Guesses</span>
                  <p className="text-xl font-black text-white font-doodle">{user.correctGuesses}</p>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
                  <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-bold">Best Streak</span>
                  <p className="text-xl font-black text-white font-doodle">{user.longestStreak} 🔥</p>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
                  <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-bold">Personal Best</span>
                  <p className="text-xl font-black text-white font-doodle">{user.personalBest || user.totalScore} pts</p>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
                  <ShieldCheck className="w-5 h-5 text-teal-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-bold">Win Rate</span>
                  <p className="text-xl font-black text-white font-doodle">
                    {user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Match History Table */}
            <div className="bg-slate-900/90 border-3 border-slate-700 rounded-[32px] p-6 shadow-sketch-lg">
              <h3 className="text-base font-black text-sky-400 font-doodle uppercase tracking-wider mb-4 flex items-center gap-2">
                <History className="w-5 h-5" /> Recent Match History
              </h3>

              {(!user.matchHistory || user.matchHistory.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-500 font-bold">
                  No completed matches recorded yet. Play a multiplayer or AI game to see results here!
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {user.matchHistory.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/70 border border-slate-700"
                    >
                      <div>
                        <h4 className="text-xs font-black text-white">{m.roomName}</h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(m.date).toLocaleDateString()} • {m.mode === 'ai' ? 'AI Solo' : 'Multiplayer'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          m.isWinner ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-slate-700 text-slate-300'
                        }`}>
                          Rank #{m.rank}
                        </span>
                        <span className="text-sm font-black text-amber-400 font-doodle">
                          +{m.score} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
