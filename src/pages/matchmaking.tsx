import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { soundManager } from '@/lib/audio';
import { Globe, Users, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';

export default function MatchmakingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [statusText, setStatusText] = useState('Searching for players worldwide...');
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    // Search and match logic
    const findMatch = async () => {
      try {
        const res = await fetch('/api/rooms/public');
        const data = await res.json();
        const available = data.rooms && data.rooms.length > 0 ? data.rooms[0] : null;

        if (available) {
          setStatusText(`Found match in "${available.name}"! Connecting...`);
          soundManager.playCorrect();
          setTimeout(() => {
            router.push(`/room/${available.id}`);
          }, 1500);
        } else if (user) {
          setStatusText('No waiting room found. Creating a public arena for you...');
          // Create instant public room
          const createRes = await fetch('/api/rooms/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              hostUser: {
                id: user.id,
                username: user.username,
                avatar: user.avatar
              },
              settings: {
                name: `${user.username}'s Arena`,
                isPublic: true,
                maxPlayers: 6,
                rounds: 5,
                drawDuration: 90,
                difficulty: 'easy',
                category: 'All Categories'
              }
            })
          });
          const createData = await createRes.json();
          if (createData.room) {
            soundManager.playFanfare();
            setTimeout(() => {
              router.push(`/room/${createData.room.id}`);
            }, 1200);
          }
        }
      } catch {
        setStatusText('Matchmaking error. Please try again.');
      }
    };

    const timer = setTimeout(findMatch, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-chalk-bg">
      <Navbar />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
        <div className="w-full bg-sketch-paper rounded-[36px] p-8 border-4 border-slate-900 shadow-sketch-lg text-slate-900">
          
          {/* Animated Globe / Radar */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-sky-400/30 animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-sky-400 to-emerald-400 border-3 border-slate-900 flex items-center justify-center shadow-sketch">
              <Globe className="w-12 h-12 text-slate-950 animate-pulse" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-950 font-doodle mb-2">
            Public Matchmaking
          </h2>

          <p className="text-sm font-bold text-slate-600 mb-6 font-sans">
            {statusText}
            <span className="inline-block w-4 text-left">{dots}</span>
          </p>

          <div className="p-3 bg-white/80 rounded-2xl border border-slate-300 text-xs font-bold text-slate-700 mb-6 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
            Connecting to global doodler network...
          </div>

          <button
            onClick={() => {
              soundManager.playPop();
              router.push('/dashboard');
            }}
            className="w-full py-3 px-6 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-sm rounded-2xl border-2 border-slate-900 shadow-sm"
          >
            Cancel & Return to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
