import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { soundManager } from '@/lib/audio';
import {
  ArrowLeft,
  Link as LinkIcon,
  LogIn,
  Globe,
  Users,
  Sparkles,
  ClipboardPaste,
  RefreshCw,
  Search,
  Plus
} from 'lucide-react';

export default function JoinRoomPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [codeOrUrl, setCodeOrUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [publicRooms, setPublicRooms] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const loadPublicRooms = () => {
    setIsRefreshing(true);
    fetch('/api/rooms/public')
      .then(res => res.json())
      .then(data => {
        setIsRefreshing(false);
        if (data.rooms) {
          setPublicRooms(data.rooms);
        }
      })
      .catch(() => {
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    loadPublicRooms();
  }, []);

  const cleanCodeInput = (input: string) => {
    let clean = input.trim();
    if (clean.includes('/room/')) {
      const parts = clean.split('/room/');
      clean = parts[1].split('?')[0].split('#')[0];
    }
    return clean.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
  };

  const handlePaste = async () => {
    try {
      soundManager.playPop();
      const text = await navigator.clipboard.readText();
      const cleaned = cleanCodeInput(text);
      setCodeOrUrl(cleaned);
    } catch {
      // Clipboard permissions denied
    }
  };

  const handleJoin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const input = cleanCodeInput(codeOrUrl);
    if (!input) {
      setErrorMsg('Please enter a 5-letter room code or link');
      soundManager.playWrong();
      return;
    }

    setIsJoining(true);
    soundManager.playPop();

    try {
      const res = await fetch(`/api/rooms/${input}`);
      let data: any = null;
      if (res.headers.get('content-type')?.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok && data?.id) {
        soundManager.playCorrect();
        router.push(`/room/${data.id}`);
        return;
      }

      // Also try find-code endpoint
      const codeRes = await fetch(`/api/rooms/find-code/${input}`);
      let codeData: any = null;
      if (codeRes.headers.get('content-type')?.includes('application/json')) {
        codeData = await codeRes.json();
      }

      if (codeRes.ok && codeData?.roomId) {
        soundManager.playCorrect();
        router.push(`/room/${codeData.roomId}`);
      } else {
        setErrorMsg('Room not found! Check the code or create a new room.');
        soundManager.playWrong();
        setIsJoining(false);
      }
    } catch {
      setErrorMsg('Could not connect to room server.');
      soundManager.playWrong();
      setIsJoining(false);
    }
  };

  const joinDirect = (roomId: string) => {
    soundManager.playPop();
    router.push(`/room/${roomId}`);
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-chalk-bg">
      <Navbar />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center">
        {/* Sketchbook Card */}
        <div className="bg-sketch-paper rounded-[36px] p-6 sm:p-8 border-4 border-slate-900 shadow-sketch-lg text-slate-900">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  soundManager.playPop();
                  router.push('/dashboard');
                }}
                className="p-2 rounded-xl bg-white border-2 border-slate-900 shadow-sm hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-900" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-doodle tracking-tight">
                Join a Room
              </h1>
            </div>

            <button
              onClick={() => {
                soundManager.playPop();
                router.push('/create-room');
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-doodle font-black text-xs border-2 border-slate-900 shadow-sm flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Host New
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-100 border-2 border-rose-400 text-rose-700 rounded-2xl text-xs font-bold text-center animate-wiggle">
              {errorMsg}
            </div>
          )}

          {/* Code Input Form */}
          <form onSubmit={handleJoin} className="space-y-4 mb-6">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wide">
                  Enter Room Code or Link:
                </label>
                <button
                  type="button"
                  onClick={handlePaste}
                  className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 font-sans"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" /> Paste from Clipboard
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={codeOrUrl}
                  onChange={(e) => setCodeOrUrl(cleanCodeInput(e.target.value))}
                  placeholder="e.g. 7F3K9"
                  maxLength={40}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-300 focus:border-sky-500 rounded-2xl text-base font-black tracking-widest text-slate-900 focus:outline-none uppercase"
                />
                <LinkIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isJoining}
              className="w-full py-4 px-6 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-black text-lg rounded-2xl border-3 border-slate-900 shadow-sketch-blue transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 font-doodle tracking-wider uppercase flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {isJoining ? 'Connecting to Room...' : 'Enter Room 🚀'}
            </button>
          </form>

          {/* Active Public Rooms Section */}
          <div className="border-t-2 border-dashed border-slate-300 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-600" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 font-doodle">
                  Public Rooms Waiting
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px]">
                  {publicRooms.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundManager.playPop();
                  loadPublicRooms();
                }}
                disabled={isRefreshing}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 font-sans"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {publicRooms.length === 0 ? (
              <div className="p-5 rounded-2xl bg-white/70 border-2 border-slate-200 text-center text-xs text-slate-500 font-bold space-y-2">
                <p>No public rooms currently waiting for players.</p>
                <button
                  onClick={() => {
                    soundManager.playPop();
                    router.push('/create-room');
                  }}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl border border-slate-900 shadow-sm font-doodle inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Host a Room Now
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {publicRooms.map(r => (
                  <div
                    key={r.id}
                    className="p-3 bg-white rounded-2xl border-2 border-slate-200 hover:border-sky-400 flex items-center justify-between transition-all shadow-sm"
                  >
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{r.name}</h4>
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                        <span className="font-mono font-bold text-sky-700">#{r.code}</span>
                        <span>•</span>
                        <span>{r.category}</span>
                        <span>•</span>
                        <span>{r.rounds} Rounds</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-600 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-sky-500" />
                        {r.playersCount}/{r.maxPlayers}
                      </span>
                      <button
                        onClick={() => joinDirect(r.id)}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl border-2 border-slate-900 shadow-sm font-doodle uppercase tracking-wider"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
