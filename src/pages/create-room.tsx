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
  Edit2,
  Zap,
  Flame,
  Palette,
  Share2,
  Send
} from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  icon: string;
  desc: string;
  rounds: number;
  drawDuration: number;
  maxPlayers: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  category: string;
  badgeColor: string;
}

const PRESETS: Preset[] = [
  {
    id: 'party',
    name: 'Party Mode',
    icon: '🎉',
    desc: '5 Rounds · 90s · 6 Players',
    rounds: 5,
    drawDuration: 90,
    maxPlayers: 6,
    difficulty: 'easy',
    category: 'All Categories',
    badgeColor: 'bg-amber-400 text-slate-950'
  },
  {
    id: 'blitz',
    name: 'Speed Blitz',
    icon: '⚡',
    desc: '3 Rounds · 60s · 4 Players',
    rounds: 3,
    drawDuration: 60,
    maxPlayers: 4,
    difficulty: 'medium',
    category: 'All Categories',
    badgeColor: 'bg-orange-500 text-white'
  },
  {
    id: 'pro',
    name: 'Master Sketcher',
    icon: '🎨',
    desc: '8 Rounds · 120s · 8 Players',
    rounds: 8,
    drawDuration: 120,
    maxPlayers: 8,
    difficulty: 'mixed',
    category: 'All Categories',
    badgeColor: 'bg-emerald-500 text-white'
  }
];

export default function CreateRoomPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [roomName, setRoomName] = useState('');
  const [mode, setMode] = useState<'friends' | 'ai'>('friends');
  const [selectedPreset, setSelectedPreset] = useState<string>('party');
  const [isPublic, setIsPublic] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [rounds, setRounds] = useState(5);
  const [drawDuration, setDrawDuration] = useState(90);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('easy');
  const [category, setCategory] = useState('All Categories');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    } else if (user) {
      setRoomName(`${user.username}'s Sketch Room`);
    }
  }, [user, isLoading, router]);

  const applyPreset = (preset: Preset) => {
    setSelectedPreset(preset.id);
    setRounds(preset.rounds);
    setDrawDuration(preset.drawDuration);
    setMaxPlayers(preset.maxPlayers);
    setDifficulty(preset.difficulty);
    setCategory(preset.category);
    soundManager.playPop();
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
            name: roomName.trim() || `${user.username}'s Room`,
            isPublic,
            maxPlayers,
            rounds,
            drawDuration,
            difficulty,
            category
          }
        })
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await res.json();
      }

      setIsCreating(false);

      if (data && data.room) {
        soundManager.playFanfare();
        router.push(`/room/${data.room.id}`);
      } else {
        alert(data?.error || 'Failed to create room. Please try again.');
      }
    } catch (e: any) {
      setIsCreating(false);
      alert('Network error while creating room. Please try again.');
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-chalk-bg">
      <Navbar />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center">
        {/* Sketchbook Card */}
        <div className="bg-sketch-paper rounded-[36px] p-6 sm:p-8 border-4 border-slate-900 shadow-sketch-lg text-slate-900 relative">
          
          {/* Top Back navigation & title */}
          <div className="flex items-center justify-between mb-5">
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
                Create Room
              </h1>
            </div>

            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 border-2 border-slate-900 font-doodle text-xs font-black">
              Multiplayer 🎨
            </span>
          </div>

          <div className="space-y-4">
            {/* Choose Mode Toggle Cards */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
                Choose Mode:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode('friends');
                    soundManager.playPop();
                  }}
                  className={`p-3.5 rounded-2xl border-3 text-center transition-all ${
                    mode === 'friends'
                      ? 'bg-sky-50 border-sky-600 shadow-sketch-blue'
                      : 'bg-white border-slate-300 hover:border-slate-400 opacity-70'
                  }`}
                >
                  <Users className="w-7 h-7 text-sky-600 mx-auto mb-1" />
                  <span className="text-sm font-black text-slate-950 block font-doodle">
                    With Friends
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Host Multiplayer Lobby
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('ai');
                    soundManager.playPop();
                  }}
                  className={`p-3.5 rounded-2xl border-3 text-center transition-all ${
                    mode === 'ai'
                      ? 'bg-emerald-50 border-emerald-600 shadow-sketch-green'
                      : 'bg-white border-slate-300 hover:border-slate-400 opacity-70'
                  }`}
                >
                  <Bot className="w-7 h-7 text-emerald-600 mx-auto mb-1" />
                  <span className="text-sm font-black text-slate-950 block font-doodle">
                    Play with AI
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Solo Guessing Mode
                  </span>
                </button>
              </div>
            </div>

            {mode === 'friends' && (
              <>
                {/* Room Name Input */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">
                    Room Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="e.g. Danish's Drawing Party"
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 focus:border-amber-500 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none pr-10"
                    />
                    <Edit2 className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 1-Click Game Presets */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                    <span>Quick Game Presets:</span>
                    <span className="text-[10px] text-amber-600 font-bold font-sans">1-Click Setup</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className={`p-2.5 rounded-2xl border-2 text-center transition-all ${
                          selectedPreset === p.id
                            ? 'bg-amber-100 border-amber-500 shadow-sm ring-2 ring-amber-400/40'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xl mb-0.5">{p.icon}</div>
                        <h4 className="text-xs font-black text-slate-900 font-doodle truncate">{p.name}</h4>
                        <span className="text-[9px] text-slate-500 font-bold block">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Settings Toggle */}
                <div className="border-t border-slate-200 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-doodle"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>{showAdvanced ? 'Hide Custom Rules ▲' : 'Customize Game Rules ▼'}</span>
                  </button>

                  {showAdvanced && (
                    <div className="bg-slate-100/90 rounded-2xl border-2 border-slate-300 p-3.5 space-y-3 mt-2 animate-fadeIn">
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Rounds */}
                        <div>
                          <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                            Rounds
                          </label>
                          <select
                            value={rounds}
                            onChange={(e) => {
                              setRounds(Number(e.target.value));
                              setSelectedPreset('custom');
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                          >
                            <option value={3}>3 Rounds (Quick)</option>
                            <option value={5}>5 Rounds (Standard)</option>
                            <option value={8}>8 Rounds</option>
                            <option value={10}>10 Rounds</option>
                          </select>
                        </div>

                        {/* Draw Duration */}
                        <div>
                          <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                            Turn Timer
                          </label>
                          <select
                            value={drawDuration}
                            onChange={(e) => {
                              setDrawDuration(Number(e.target.value));
                              setSelectedPreset('custom');
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                          >
                            <option value={45}>45s (Super Fast)</option>
                            <option value={60}>60s (Fast)</option>
                            <option value={90}>90s (Balanced)</option>
                            <option value={120}>120s (Relaxed)</option>
                          </select>
                        </div>

                        {/* Word Category */}
                        <div>
                          <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                            Category
                          </label>
                          <select
                            value={category}
                            onChange={(e) => {
                              setCategory(e.target.value);
                              setSelectedPreset('custom');
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                          >
                            {WORD_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Difficulty */}
                        <div>
                          <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                            Difficulty
                          </label>
                          <select
                            value={difficulty}
                            onChange={(e) => {
                              setDifficulty(e.target.value as any);
                              setSelectedPreset('custom');
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                            <option value="mixed">Mixed</option>
                          </select>
                        </div>
                      </div>

                      {/* Public / Private toggle */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200">
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
                          {isPublic ? 'Public Room (Visible in Join)' : 'Private (Code / Link Only)'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Big Action Button */}
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 via-sky-400 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white font-black text-xl rounded-2xl border-4 border-slate-950 shadow-sketch-blue transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 font-doodle tracking-wider uppercase flex items-center justify-center gap-2 mt-3"
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Creating Room...</span>
                </>
              ) : mode === 'ai' ? (
                'Start AI Game 🤖'
              ) : (
                'Create & Enter Lobby 🚀'
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
