import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { soundManager } from '@/lib/audio';
import { ArrowLeft, Link as LinkIcon, LogIn, Globe, Users, Sparkles } from 'lucide-react';

export default function JoinRoomPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [codeOrUrl, setCodeOrUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [publicRooms, setPublicRooms] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetch('/api/rooms/public')
      .then(res => res.json())
      .then(data => {
        if (data.rooms) {
          setPublicRooms(data.rooms);
        }
      })
      .catch(() => {});
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const input = codeOrUrl.trim();
    if (!input) {
      setErrorMsg('Please enter a room code or link');
      soundManager.playWrong();
      return;
    }

    setIsJoining(true);
    soundManager.playPop();

    let roomId = input;
    if (input.includes('/room/')) {
      const parts = input.split('/room/');
      roomId = parts[1].split('?')[0];
    } else if (!input.startsWith('room_')) {
      roomId = `room_${input.toUpperCase()}`;
    }

    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      const data = await res.json();

      if (res.ok && data.id) {
        soundManager.playCorrect();
        router.push(`/room/${data.id}`);
      } else {
        // Try searching by short code
        const codeRes = await fetch(`/api/rooms/find-code/${input}`);
        const codeData = await codeRes.json();
        if (codeRes.ok && codeData.roomId) {
          soundManager.playCorrect();
          router.push(`/room/${codeData.roomId}`);
        } else {
          setErrorMsg('Room not found or game already finished.');
          soundManager.playWrong();
          setIsJoining(false);
        }
      }
    } catch {
      setErrorMsg('Could not connect to room.');
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
          
          <div className="flex items-center gap-3 mb-6">
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

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-100 border-2 border-rose-400 text-rose-700 rounded-2xl text-xs font-bold text-center animate-wiggle">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
                Room Code or Invitation Link
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={codeOrUrl}
                  onChange={(e) => setCodeOrUrl(e.target.value)}
                  placeholder="e.g. 7F3K9 or https://pictobuzz.com/room/7F3K9"
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-300 focus:border-sky-500 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none"
                />
                <LinkIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isJoining}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-black text-lg rounded-2xl border-3 border-slate-900 shadow-sketch-blue transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 font-doodle tracking-wider uppercase flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {isJoining ? 'Joining...' : 'Enter Room'}
            </button>
          </form>

          {/* Public Rooms List */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-sky-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 font-doodle">
                Active Public Rooms
              </h2>
            </div>

            {publicRooms.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/60 border border-slate-200 text-center text-xs text-slate-500 font-bold">
                No public rooms currently waiting. Create your own and invite friends!
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {publicRooms.map(r => (
                  <div
                    key={r.id}
                    className="p-3 bg-white rounded-2xl border-2 border-slate-200 hover:border-sky-400 flex items-center justify-between transition-all"
                  >
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{r.name}</h4>
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                        <span>{r.category}</span>
                        <span>•</span>
                        <span>{r.rounds} Rounds</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-600 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {r.playersCount}/{r.maxPlayers}
                      </span>
                      <button
                        onClick={() => joinDirect(r.id)}
                        className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl border border-slate-900 shadow-sm font-doodle"
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
