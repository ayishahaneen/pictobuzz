import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { Navbar } from '@/components/Navbar';
import { Avatar, AVATAR_PRESETS } from '@/components/Avatar';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { WordSelector } from '@/components/WordSelector';
import { GuessingPanel } from '@/components/GuessingPanel';
import { InRoomLeaderboard } from '@/components/InRoomLeaderboard';
import { RoundOverModal } from '@/components/RoundOverModal';
import { GameOverModal } from '@/components/GameOverModal';
import { soundManager } from '@/lib/audio';
import {
  Users,
  Clock,
  Share2,
  Sparkles,
  Play,
  Check,
  Copy,
  Plus,
  ArrowLeft,
  MessageCircle,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function RoomPage() {
  const router = useRouter();
  const { id } = router.query;
  const rawId = typeof id === 'string' ? id : '';

  const { user, isLoading: authLoading, register, playAsGuest } = useAuth();
  const {
    roomState,
    privateWordChoices,
    drawerSecretWord,
    closeGuessHint,
    roundEndedPayload,
    gameOverPayload,
    joinRoom,
    leaveRoom,
    setReady,
    startGame,
    selectWord,
    sendStroke,
    clearCanvas,
    undoCanvas,
    submitGuess,
    clearCelebrations
  } = useSocket();

  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTabMobile, setActiveTabMobile] = useState<'canvas' | 'leaderboard'>('canvas');
  const [resolvedRoomId, setResolvedRoomId] = useState<string>('');
  const [resolvedCode, setResolvedCode] = useState<string>('');

  // Unauthenticated Guest Form State
  const [guestName, setGuestName] = useState('');
  const [guestAvatar, setGuestAvatar] = useState('avatar_1');
  const [isJoiningGuest, setIsJoiningGuest] = useState(false);
  const [guestError, setGuestError] = useState('');

  // Resolve room code or ID from server
  useEffect(() => {
    if (!rawId) return;

    fetch(`/api/rooms/${rawId}`)
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setResolvedRoomId(data.id);
          setResolvedCode(data.code || data.id.replace('room_', ''));
        } else {
          setResolvedRoomId(rawId.startsWith('room_') ? rawId : `room_${rawId.toUpperCase()}`);
          setResolvedCode(rawId.replace('room_', '').toUpperCase());
        }
      })
      .catch(() => {
        setResolvedRoomId(rawId);
        setResolvedCode(rawId.replace('room_', '').toUpperCase());
      });
  }, [rawId]);

  // Join room when user and resolvedRoomId are ready
  useEffect(() => {
    if (user && resolvedRoomId) {
      joinRoom(resolvedRoomId, {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      });
    }

    return () => {
      if (user && resolvedRoomId) {
        leaveRoom(resolvedRoomId, user.id);
      }
    };
  }, [user, resolvedRoomId]);

  // Synchronized round timer
  useEffect(() => {
    if (!roomState || roomState.status !== 'drawing') {
      setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((roomState.roundEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining > 0 && remaining <= 10) {
        soundManager.playTick(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roomState]);

  const getShareLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pictobuzz.com';
    const code = resolvedCode || roomState?.code || rawId.replace('room_', '');
    return `${origin}/room/${code}`;
  };

  const handleCopyLink = () => {
    const link = getShareLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    soundManager.playPop();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCode = () => {
    const code = resolvedCode || roomState?.code || rawId.replace('room_', '').toUpperCase();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    soundManager.playPop();
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleNativeShare = async () => {
    const link = getShareLink();
    const code = resolvedCode || roomState?.code || rawId.replace('room_', '').toUpperCase();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Picto Buzz Room!',
          text: `Join my Pictionary drawing game on Picto Buzz! Room Code: ${code}`,
          url: link
        });
        soundManager.playPop();
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const link = getShareLink();
    const code = resolvedCode || roomState?.code || rawId.replace('room_', '').toUpperCase();
    const text = encodeURIComponent(`🎨 Join my Pictionary room on Picto Buzz! Room code: *${code}*\nPlay here: ${link}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    soundManager.playPop();
  };

  const handleQuickGuestJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestError('');
    setIsJoiningGuest(true);
    soundManager.playPop();

    const name = guestName.trim() || `Doodler_${Math.floor(1000 + Math.random() * 9000)}`;
    const guestEmail = `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}@pictobuzz.local`;

    const res = await register(name, guestEmail, 'guestPassword123', guestAvatar);
    setIsJoiningGuest(false);

    if (res.success) {
      soundManager.playFanfare();
    } else {
      // Fallback to anonymous guest play
      const guestRes = await playAsGuest();
      if (guestRes.success) {
        soundManager.playFanfare();
      } else {
        setGuestError(res.error || 'Failed to join. Please try again.');
        soundManager.playWrong();
      }
    }
  };

  // If user is not logged in, show frictionless guest onboarding overlay right in the room!
  if (!authLoading && !user) {
    const displayCode = resolvedCode || rawId.replace('room_', '').toUpperCase();

    return (
      <div className="min-h-screen flex flex-col bg-chalk-bg text-white">
        <Navbar />

        <main className="flex-1 max-w-md w-full mx-auto px-4 py-8 flex flex-col justify-center">
          <div className="bg-sketch-paper rounded-[38px] p-6 sm:p-8 border-4 border-slate-900 shadow-sketch-lg text-slate-900 text-center relative overflow-hidden">
            
            <div className="inline-block px-4 py-1 rounded-full bg-amber-400 border-2 border-slate-900 font-doodle text-xs font-black uppercase mb-3">
              Room Invitation 🎨
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-doodle mb-1">
              Join Room #{displayCode}
            </h2>
            <p className="text-xs text-slate-600 mb-5 font-sans">
              Enter your name or avatar below to jump straight into the game!
            </p>

            {guestError && (
              <div className="mb-4 p-2.5 bg-rose-100 border-2 border-rose-400 text-rose-700 rounded-xl text-xs font-bold">
                {guestError}
              </div>
            )}

            <form onSubmit={handleQuickGuestJoin} className="space-y-4 text-left">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5 text-center">
                  Pick your Avatar:
                </label>
                <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.slice(0, 6).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setGuestAvatar(p.id);
                        soundManager.playPop();
                      }}
                      className={`p-0.5 rounded-full transition-transform ${
                        guestAvatar === p.id ? 'ring-3 ring-amber-500 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Avatar id={p.id} size="sm" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name input */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">
                  Your Nickname:
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. MasterDrawer"
                  maxLength={18}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 focus:border-amber-500 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isJoiningGuest}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-lg rounded-2xl border-3 border-slate-900 shadow-sketch-yellow transition-all transform hover:-translate-y-0.5 font-doodle tracking-wider uppercase flex items-center justify-center gap-2"
              >
                {isJoiningGuest ? 'Entering Room...' : 'Play Now 🚀'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-300 text-xs text-slate-600 flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-slate-500 hover:text-slate-800 font-bold underline"
              >
                Back to Home
              </button>
              <button
                type="button"
                onClick={() => router.push(`/?join=${displayCode}`)}
                className="text-amber-600 hover:text-amber-700 font-black underline"
              >
                Sign in with account →
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (authLoading || !user) return null;

  if (!roomState) {
    const displayCode = resolvedCode || rawId.replace('room_', '').toUpperCase();

    return (
      <div className="min-h-screen flex flex-col bg-chalk-bg text-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mb-4" />
          <h2 className="text-xl font-bold font-doodle text-amber-400">
            Connecting to Room #{displayCode}... 🎨
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Preparing your sketchbook and multiplayer lobby
          </p>
        </div>
      </div>
    );
  }

  const isHost = user.id === roomState.hostId;
  const isCurrentDrawer = user.id === roomState.currentDrawerId;
  const currentDrawer = roomState.players.find(p => p.id === roomState.currentDrawerId);
  const myPlayer = roomState.players.find(p => p.id === user.id);
  const isReady = myPlayer?.isReady ?? false;
  const displayCode = roomState.code || resolvedCode || rawId.replace('room_', '').toUpperCase();

  // Format timer 00:48
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-chalk-bg text-white">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col">
        
        {/* LOBBY VIEW */}
        {roomState.status === 'lobby' ? (
          <div className="max-w-2xl w-full mx-auto my-auto bg-chalk-card border-3 border-slate-700 rounded-[36px] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Top Room Info Header with Prominent Room Code */}
            <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 block font-sans">
                    Room: {roomState.settings.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-mono text-xs font-bold">
                    #{displayCode}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold mt-0.5">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>Players {roomState.players.length}/{roomState.settings.maxPlayers}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowShareModal(true);
                    soundManager.playPop();
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-600 transition-colors flex items-center gap-1.5 text-xs font-bold"
                  title="Invite Friends"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Invite</span>
                </button>
              </div>
            </div>

            {/* Blackboard Doodle Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white font-doodle tracking-wide flex items-center justify-center gap-2">
                <span>Waiting for players...</span>
                <span className="text-2xl animate-wiggle">✏️</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Share code <span className="font-mono font-bold text-amber-400">#{displayCode}</span> with friends or ready up to begin!
              </p>
            </div>

            {/* Quick Share Code Ribbon */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border-2 border-slate-700 flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Room Code:</span>
                <span className="font-mono font-black text-lg text-amber-400 tracking-wider">
                  {displayCode}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs border border-emerald-500 flex items-center gap-1"
                  title="Share on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Players Avatars Row with Invite Slots */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap mb-8">
              {roomState.players.map((player) => (
                <div key={player.id} className="flex flex-col items-center group">
                  <div className="relative">
                    <Avatar
                      id={player.avatar}
                      size="lg"
                      showCrown={player.hasCrown || player.isHost}
                    />
                    {player.isReady && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                        <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-black text-white mt-1.5 truncate max-w-[70px]">
                    {player.username}
                  </span>
                  {player.isHost && (
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                      Host
                    </span>
                  )}
                </div>
              ))}

              {/* Empty Invite Slots */}
              {Array.from({ length: Math.max(0, roomState.settings.maxPlayers - roomState.players.length) })
                .slice(0, 3)
                .map((_, i) => (
                  <button
                    key={i}
                    onClick={handleCopyLink}
                    className="flex flex-col items-center group"
                  >
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-600 hover:border-amber-400 flex items-center justify-center bg-slate-800/40 text-slate-500 group-hover:text-amber-400 transition-colors">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300 mt-1.5">
                      Invite
                    </span>
                  </button>
                ))}
            </div>

            {/* Game Settings Summary Card */}
            <div className="bg-slate-900/80 rounded-2xl border-2 border-slate-800 p-4 mb-6">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-2.5 font-doodle flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Game Rules
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Category</span>
                  <span className="font-bold text-white truncate block">{roomState.settings.category}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Rounds</span>
                  <span className="font-bold text-white">{roomState.settings.rounds}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Turn Timer</span>
                  <span className="font-bold text-white">{roomState.settings.drawDuration}s</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {isHost ? (
                <button
                  onClick={() => {
                    soundManager.playPop();
                    startGame(resolvedRoomId, user.id);
                  }}
                  className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xl rounded-2xl border-4 border-slate-950 shadow-sketch-yellow transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 font-doodle tracking-wider uppercase flex items-center justify-center gap-2"
                >
                  <Play className="w-6 h-6 fill-slate-950" /> Start Game
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundManager.playPop();
                    setReady(resolvedRoomId, user.id, !isReady);
                  }}
                  className={`w-full py-3.5 px-6 font-black text-lg rounded-2xl border-3 border-slate-950 shadow-sketch transition-all font-doodle tracking-wider uppercase ${
                    isReady
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sketch-green'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sketch-yellow'
                  }`}
                >
                  {isReady ? '✓ You are Ready!' : 'Ready Up'}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ACTIVE GAMEPLAY VIEW */
          <div className="flex flex-col gap-3 flex-1">
            
            {/* In-Game Header Bar */}
            <div className="bg-slate-900/90 border-2 border-slate-700 rounded-2xl p-3 px-4 flex items-center justify-between shadow-md">
              
              {/* Current Drawer Badge */}
              <div className="flex items-center gap-2.5">
                <Avatar
                  id={currentDrawer?.avatar || 'avatar_1'}
                  size="sm"
                  showCrown={currentDrawer?.hasCrown}
                />
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1">
                    <span>{currentDrawer?.username}</span>
                    <span className="text-[10px] text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded">
                      {isCurrentDrawer ? 'You' : 'Drawing'}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    {currentDrawer?.score || 0} pts
                  </span>
                </div>
              </div>

              {/* Secret Word / Word Length Helper in Center */}
              <div className="text-center">
                {isCurrentDrawer && drawerSecretWord ? (
                  <div className="px-4 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-sm sm:text-base border-2 border-slate-950 shadow-sketch-sm uppercase font-doodle">
                    Draw: {drawerSecretWord}
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono font-bold text-xs sm:text-sm tracking-widest border border-slate-700">
                    {roomState.wordLength ? Array(roomState.wordLength).fill('_').join(' ') : 'GUESS THE DRAWING'}
                  </div>
                )}
                <span className="text-[10px] font-bold text-slate-500 block mt-0.5">
                  Round {roomState.currentRound} of {roomState.settings.rounds}
                </span>
              </div>

              {/* Animated Countdown Timer */}
              <div className="flex items-center gap-2">
                <div
                  className={`px-3 py-1.5 rounded-full font-black text-sm sm:text-base font-mono flex items-center gap-1.5 border-2 ${
                    timeLeft <= 15
                      ? 'bg-rose-500 text-white border-rose-700 animate-pulse'
                      : 'bg-rose-600 text-white border-rose-800'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>
              </div>
            </div>

            {/* Word Selection Phase for Drawer */}
            {roomState.status === 'selecting_word' && (
              isCurrentDrawer ? (
                <WordSelector
                  words={privateWordChoices}
                  duration={15}
                  onSelectWord={(word) => selectWord(resolvedRoomId, user.id, word)}
                />
              ) : (
                <div className="w-full bg-slate-900/90 border-2 border-dashed border-sky-400/60 rounded-3xl p-6 text-center shadow-lg animate-pulse mb-3">
                  <Sparkles className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                  <h3 className="text-xl font-black text-sky-300 font-doodle">
                    {currentDrawer?.username} is picking a secret word...
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Get ready with your guesses!
                  </p>
                </div>
              )
            )}

            {/* Mobile Tab Switcher */}
            <div className="lg:hidden flex rounded-2xl bg-slate-800 p-1 border border-slate-700 mb-1">
              <button
                onClick={() => setActiveTabMobile('canvas')}
                className={`flex-1 py-1.5 rounded-xl font-bold text-xs ${
                  activeTabMobile === 'canvas' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-300'
                }`}
              >
                Canvas & Guesses
              </button>
              <button
                onClick={() => setActiveTabMobile('leaderboard')}
                className={`flex-1 py-1.5 rounded-xl font-bold text-xs ${
                  activeTabMobile === 'leaderboard' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-300'
                }`}
              >
                Leaderboard ({roomState.players.length})
              </button>
            </div>

            {/* Main Stage Grid (Canvas + Guessing + Live Leaderboard) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 items-start">
              
              {/* Left & Center: Canvas & Guesses */}
              <div className={`lg:col-span-8 flex flex-col gap-3 ${activeTabMobile === 'leaderboard' ? 'hidden lg:flex' : 'flex'}`}>
                <DrawingCanvas
                  isDrawer={isCurrentDrawer && roomState.status === 'drawing'}
                  incomingStrokes={roomState.drawingHistory}
                  onStrokeComplete={(stroke) => sendStroke(resolvedRoomId, user.id, stroke)}
                  onClear={() => clearCanvas(resolvedRoomId, user.id)}
                  onUndo={() => undoCanvas(resolvedRoomId, user.id)}
                  disabled={roomState.status !== 'drawing'}
                />

                {/* Guessing Panel */}
                <div className="w-full h-64">
                  <GuessingPanel
                    guesses={roomState.guesses}
                    isDrawer={isCurrentDrawer}
                    hasGuessedCorrectly={myPlayer?.hasGuessedCorrectly ?? false}
                    closeHint={closeGuessHint}
                    onSendGuess={(text) => submitGuess(resolvedRoomId, user.id, text)}
                    disabled={roomState.status !== 'drawing'}
                  />
                </div>
              </div>

              {/* Right Side: In-Room Live Leaderboard */}
              <div className={`lg:col-span-4 h-[580px] ${activeTabMobile === 'canvas' ? 'hidden lg:block' : 'block'}`}>
                <InRoomLeaderboard
                  players={roomState.players}
                  currentDrawerId={roomState.currentDrawerId}
                />
              </div>
            </div>
          </div>
        )}

        {/* Round Over Modal */}
        {roundEndedPayload && (
          <RoundOverModal
            word={roundEndedPayload.word}
            drawerName={roundEndedPayload.drawerName}
            scores={roundEndedPayload.scores}
            isHost={isHost}
            onNextRound={() => clearCelebrations()}
          />
        )}

        {/* Final Winner Game Over Modal */}
        {gameOverPayload && (
          <GameOverModal
            rankings={gameOverPayload.rankings}
            winners={gameOverPayload.winners}
            totalRounds={gameOverPayload.totalRounds}
            onPlayAgain={() => {
              clearCelebrations();
              if (isHost) startGame(resolvedRoomId, user.id);
            }}
          />
        )}

        {/* Share Invite Link Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-splatter">
            <div className="relative w-full max-w-md bg-sketch-paper rounded-3xl p-6 border-4 border-slate-900 shadow-sketch-lg text-slate-900 text-center">
              <h3 className="text-2xl font-black text-slate-950 font-doodle mb-2">
                Invite Friends 🎨
              </h3>
              <p className="text-xs text-slate-600 mb-4 font-sans">
                Share the 5-letter code or invite link to play together!
              </p>

              {/* Huge Code Display */}
              <div className="p-4 bg-amber-100 rounded-2xl border-2 border-amber-400 mb-4 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] font-black text-amber-800 uppercase block">Room Code</span>
                  <span className="text-2xl font-mono font-black text-slate-950 tracking-wider">
                    {displayCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl border-2 border-slate-900 shadow-sm flex items-center gap-1 font-doodle uppercase"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Full URL box */}
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-300 font-mono text-xs font-bold text-slate-800 break-all mb-4 select-all">
                {getShareLink()}
              </div>

              {/* Share actions */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl border-2 border-slate-900 flex items-center justify-center gap-1.5 font-doodle"
                >
                  <MessageCircle className="w-4 h-4" /> Share WhatsApp
                </button>
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="py-2.5 px-3 bg-sky-500 hover:bg-sky-400 text-white font-black text-xs rounded-xl border-2 border-slate-900 flex items-center justify-center gap-1.5 font-doodle"
                >
                  <Share2 className="w-4 h-4" /> Share Link
                </button>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl border border-slate-400"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
