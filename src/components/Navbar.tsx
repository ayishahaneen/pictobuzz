import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import { soundManager } from '../lib/audio';
import { Volume2, VolumeX, Trophy, User, LogOut, Sparkles, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) soundManager.playPop();
  };

  return (
    <header className="relative z-30 w-full bg-chalk-card/90 backdrop-blur-md border-b-2 border-slate-700/80 px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 group transition-transform hover:scale-105"
          onClick={() => soundManager.playPop()}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 flex items-center justify-center shadow-sketch border-2 border-slate-900">
            <span className="text-2xl font-black text-slate-900">P</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-wider text-amber-400 drop-shadow-[0_2px_0_rgba(15,23,42,1)] font-doodle">
              PICTO<span className="text-sky-400">BUZZ</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase -mt-1 font-sans">
              Draw · Guess · Win
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-4">
          {user && (
            <>
              <Link
                href="/dashboard"
                className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all border-2 ${
                  router.pathname === '/dashboard'
                    ? 'bg-amber-400 text-slate-900 border-slate-900 shadow-sketch'
                    : 'text-slate-300 hover:text-white border-transparent hover:border-slate-600'
                }`}
                onClick={() => soundManager.playPop()}
              >
                Dashboard
              </Link>
              <Link
                href="/ai-mode"
                className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all border-2 flex items-center gap-1.5 ${
                  router.pathname === '/ai-mode'
                    ? 'bg-emerald-500 text-slate-900 border-slate-900 shadow-sketch'
                    : 'text-emerald-400 hover:text-emerald-300 border-transparent hover:border-emerald-500/40'
                }`}
                onClick={() => soundManager.playPop()}
              >
                <Sparkles className="w-4 h-4" />
                Play with AI
              </Link>
              <Link
                href="/leaderboard"
                className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all border-2 flex items-center gap-1.5 ${
                  router.pathname === '/leaderboard'
                    ? 'bg-sky-400 text-slate-900 border-slate-900 shadow-sketch'
                    : 'text-sky-400 hover:text-sky-300 border-transparent hover:border-sky-500/40'
                }`}
                onClick={() => soundManager.playPop()}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                Leaderboard
              </Link>
            </>
          )}
        </div>

        {/* User Status / Sound Toggle / Profile */}
        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800/80 border-2 border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-400/50 transition-all shadow-sm"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  soundManager.playPop();
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-800/90 hover:bg-slate-700 border-2 border-slate-600 rounded-full transition-all shadow-sketch-sm"
              >
                <Avatar id={user.avatar} size="sm" showCrown={user.totalScore > 300} />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    {user.username}
                  </div>
                  <div className="text-[10px] font-semibold text-amber-400">
                    {user.totalScore} pts
                  </div>
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border-2 border-slate-600 rounded-2xl p-2 shadow-2xl z-50 animate-bounceShort">
                  <div className="px-3 py-2 border-b border-slate-700">
                    <p className="text-sm font-bold text-white">{user.username}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs">
                      🏆 Total: {user.totalScore} pts
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => {
                      setProfileOpen(false);
                      soundManager.playPop();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-xl transition-colors mt-1"
                  >
                    <User className="w-4 h-4 text-sky-400" />
                    Profile & Avatars
                  </Link>

                  <Link
                    href="/leaderboard"
                    onClick={() => {
                      setProfileOpen(false);
                      soundManager.playPop();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-xl transition-colors"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Global Rankings
                  </Link>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                      router.push('/');
                      soundManager.playPop();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors border-t border-slate-700/80 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/"
              className="px-4 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-sm border-2 border-slate-900 shadow-sketch transition-transform hover:scale-105"
              onClick={() => soundManager.playPop()}
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-800 border-2 border-slate-700 text-white"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && user && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-700 flex flex-col gap-2">
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="px-3 py-2 rounded-xl bg-slate-800 text-white font-bold text-sm"
          >
            Dashboard
          </Link>
          <Link
            href="/ai-mode"
            onClick={() => setMenuOpen(false)}
            className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Play with AI
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => setMenuOpen(false)}
            className="px-3 py-2 rounded-xl bg-sky-500/20 text-sky-400 font-bold text-sm flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Link>
        </div>
      )}
    </header>
  );
};
