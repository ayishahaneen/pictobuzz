import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { WORD_CATEGORIES } from '@/lib/wordBank';
import { soundManager } from '@/lib/audio';
import {
  ArrowLeft,
  Users,
  Bot,
  Copy,
  Check,
  Sparkles,
  Settings2,
  Lock,
  Globe,
  Clock,
  RotateCcw,
  Edit2
} from 'lucide-react';

export default function CreateRoomPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [roomName, setRoomName] = useState('');
  const [mode, setMode] = useState<'friends' | 'ai'>('friends');
  const [isPublic, setIsPublic] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [rounds, setRounds] = useState(5);
  const [drawDuration, setDrawDuration] = useState(90);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('easy');
  const [category, setCategory] = useState('All Categories');
  const [isCreating, setIsCreating] = useState(false);
  const [previewCode, setPreviewCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    } else if (user) {
      setRoomName(`${user.username}'s Room`);
      setPreviewCode(Math.random().toString(36).substring(2, 7).toUpperCase());
    }
  }, [user, isLoading, router]);

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pictobuzz.com';
    const link = `${origin}/room/room_${previewCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    soundManager.playPop();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateRoom = async () => {
    if (mode === 'ai') {
      soundManager.playPop();
      router.push('/ai-mode');
      return;
    }

    if (!user) return;
    setIsCreating(true);
    soundManager.playPop();

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostUser: {
            id: user.id,
            username: user.username,
            avatar: user.avatar
          },
          settings: {
            name: roomName || `${user.username}'s Room`,
            isPublic,
            maxPlayers,
            rounds,
            drawDuration,
            difficulty,
            category
          }
        })
      });

      const data = await res.json();
      setIsCreating(false);

      if (data.room) {
        soundManager.playFanfare();
        router.push(`/room/${data.room.id}`);
      }
    } catch (e) {
      setIsCreating(false);
      alert('Failed to create room. Please try again.');
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-chalk-bg">
      <Navbar />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center">
        {/* Sketchbook Card matching Screen 3 */}
        <div className="bg-sketch-paper rounded-[36px] p-6 sm:p-8 border-4 border-slate-900 shadow-sketch-lg text-slate-900">
          
          {/* Top Back navigation & title */}
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
              Create Room
            </h1>
          </div>

          <div className="space-y-5">
            {/* Room Name Input */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
                Room Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 focus:border-amber-500 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none pr-10"
                />
                <Edit2 className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Choose Mode Toggle Cards matching Screen 3 */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
                Choose Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode('friends');
                    soundManager.playPop();
                  }}
                  className={`p-4 rounded-2xl border-3 text-center transition-all ${
                    mode === 'friends'
                      ? 'bg-sky-50 border-sky-600 shadow-sketch-blue'
                      : 'bg-white border-slate-300 hover:border-slate-400 opacity-70'
                  }`}
                >
                  <Users className="w-8 h-8 text-sky-600 mx-auto mb-1" />
                  <span className="text-sm font-black text-slate-950 block font-doodle">
                    With Friends
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Multiplayer Lobby
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('ai');
                    soundManager.playPop();
                  }}
                  className={`p-4 rounded-2xl border-3 text-center transition-all ${
                    mode === 'ai'
                      ? 'bg-emerald-50 border-emerald-600 shadow-sketch-green'
                      : 'bg-white border-slate-300 hover:border-slate-400 opacity-70'
                  }`}
                >
                  <Bot className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                  <span className="text-sm font-black text-slate-950 block font-doodle">
                    With AI
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Solo Guessing
                  </span>
                </button>
              </div>
            </div>

            {mode === 'friends' && (
              <>
                {/* Custom Rules & Room Settings */}
                <div className="bg-slate-100/90 rounded-2xl border-2 border-slate-300 p-4 space-y-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase font-doodle">
                    <Settings2 className="w-4 h-4 text-amber-600" />
                    Game Settings
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Rounds */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Rounds
                      </label>
                      <select
                        value={rounds}
                        onChange={(e) => setRounds(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      >
                        <option value={3}>3 Rounds</option>
                        <option value={5}>5 Rounds (Standard)</option>
                        <option value={8}>8 Rounds</option>
                        <option value={10}>10 Rounds</option>
                      </select>
                    </div>

                    {/* Draw Duration */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Time per turn
                      </label>
                      <select
                        value={drawDuration}
                        onChange={(e) => setDrawDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      >
                        <option value={60}>60 Seconds</option>
                        <option value={90}>90 Seconds (Recommended)</option>
                        <option value={120}>120 Seconds</option>
                      </select>
                    </div>

                    {/* Word Category */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Word Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      >
                        {WORD_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Difficulty */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Difficulty
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      >
                        <option value="easy">Easy (Casual)</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard (Tricky)</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                  </div>

                  {/* Public / Private toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-slate-700">Room Visibility</span>
                    <button
                      type="button"
                      onClick={() => setIsPublic(!isPublic)}
                      className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 transition-colors ${
                        isPublic
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                          : 'bg-slate-200 text-slate-800 border-slate-400'
                      }`}
                    >
                      {isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      {isPublic ? 'Public Match' : 'Private (Link only)'}
                    </button>
                  </div>
                </div>

                {/* Share Link Preview Box matching Screen 3 */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
                    Share this link with your friends
                  </label>
                  <div className="flex items-center gap-2 px-3.5 py-3 bg-white border-2 border-slate-300 rounded-2xl">
                    <span className="text-xs font-mono font-bold text-slate-600 truncate flex-1">
                      https://pictobuzz.com/room/{previewCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors flex items-center gap-1 text-xs font-bold flex-shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Big Blue Start Game Button matching Screen 3 */}
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 via-sky-400 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white font-black text-xl rounded-2xl border-4 border-slate-950 shadow-sketch-blue transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 font-doodle tracking-wider uppercase"
            >
              {isCreating ? 'Creating Room...' : (mode === 'ai' ? 'Start AI Game 🤖' : 'Start Game 🚀')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
