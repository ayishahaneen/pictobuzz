import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useSocket, RoomPlayer } from '@/context/SocketContext';
import { Navbar } from '@/components/Navbar';
import { Avatar } from '@/components/Avatar';
import { DrawingCanvas, CanvasStroke } from '@/components/DrawingCanvas';
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
  Settings,
  Sparkles,
  Play,
  Check,
  Copy,
  Crown,
  Lock,
  Globe,
  HelpCircle,
  Plus
} from 'lucide-react';

export default function RoomPage() {
  const router = useRouter();
  const { id } = router.query;
  const roomId = typeof id === 'string' ? id : '';

  const { user, isLoading: authLoading } = useAuth();
  const {
    roomState,
    privateWordChoices,
    drawerSecretWord,
    closeGuessHint,
    correctGuessNotification,
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
  const [timeLeft, setTimeLeft] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTabMobile, setActiveTabMobile] = useState<'canvas' | 'leaderboard'>('canvas');

  // Join room when user and roomId are ready
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user && roomId) {
      joinRoom(roomId, {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      });
    }

    return () => {
      if (user && roomId) {
        leaveRoom(roomId, user.id);
      }
    };
  }, [user, roomId, authLoading]);

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

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pictobuzz.com';
    const link = `${origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    soundManager.playPop();
    setTimeout(() => setCopied(false), 2500);
  };

  if (authLoading || !user) return null;

  if (!roomState) {
    return (
      <div className="min-h-screen flex flex-col bg-chalk-bg text-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mb-4" />
          <h2 className="text-xl font-bold font-doodle text-amber-400">
            Connecting to Picto Buzz room... 🎨
          </h2>
        </div>
      </div>
    );
  }

  const isHost = user.id === roomState.hostId;
  const isCurrentDrawer = user.id === roomState.currentDrawerId;
  const currentDrawer = roomState.players.find(p => p.id === roomState.currentDrawerId);
  const myPlayer = roomState.players.find(p => p.id === user.id);
  const isReady = myPlayer?.isReady ?? false;

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
        
        {/* LOBBY VIEW (Matching Screen 4) */}
        {roomState.status === 'lobby' ? (
          <div className="max-w-2xl w-full mx-auto my-auto bg-chalk-card border-3 border-slate-700 rounded-[36px] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Top Room Info Header matching Screen 4 */}
            <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
              <div>
                <span className="text-xs font-bold text-amber-400 block font-sans">
                  Room: {roomState.settings.name}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold mt-0.5">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>Players {roomState.players.length}/{roomState.settings.maxPlayers}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-600 transition-colors"
                  title="Share Room Link"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Blackboard Doodle Title matching Screen 4 */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white font-doodle tracking-wide flex items-center justify-center gap-2">
                <span>Waiting for players...</span>
                <span className="text-2xl animate-wiggle">✏️</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Share room link with friends or ready up to begin!
              </p>
            </div>

            {/* Players Avatars Row with Invite Slots matching Screen 4 */}
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

              {/* Empty Invite Slots matching Screen 4 */}
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

            {/* Game Settings Summary Card matching Screen 4 */}
            <div className="bg-slate-900/80 rounded-2xl border-2 border-slate-800 p-4 mb-6">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-2.5 font-doodle flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Game Settings
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Mode</span>
                  <span className="font-bold text-white">With Friends</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Rounds</span>
                  <span className="font-bold text-white">{roomState.settings.rounds}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Time per turn</span>
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
                    startGame(roomId, user.id);
                  }}
                  className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xl rounded-2xl border-4 border-slate-950 shadow-sketch-yellow transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 font-doodle tracking-wider uppercase flex items-center justify-center gap-2"
                >
                  <Play className="w-6 h-6 fill-slate-950" /> Start Game
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundManager.playPop();
                    setReady(roomId, user.id, !isReady);
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
          /* ACTIVE GAMEPLAY VIEW (Screens 5 & 6) */
          <div className="flex flex-col gap-3 flex-1">
            
            {/* In-Game Header Bar matching Screen 5 */}
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

              {/* Animated Red Countdown Timer matching Screen 5 */}
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

            {/* Private 3-Word Selection Phase for Drawer (CRITICAL FEATURE) */}
            {roomState.status === 'selecting_word' && (
              isCurrentDrawer ? (
                <WordSelector
                  words={privateWordChoices}
                  duration={15}
                  onSelectWord={(word) => selectWord(roomId, user.id, word)}
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
              
              {/* Left & Center: Canvas & Guesses (8 cols on desktop) */}
              <div className={`lg:col-span-8 flex flex-col gap-3 ${activeTabMobile === 'leaderboard' ? 'hidden lg:flex' : 'flex'}`}>
                {/* Canvas */}
                <DrawingCanvas
                  isDrawer={isCurrentDrawer && roomState.status === 'drawing'}
                  incomingStrokes={roomState.drawingHistory}
                  onStrokeComplete={(stroke) => sendStroke(roomId, user.id, stroke)}
                  onClear={() => clearCanvas(roomId, user.id)}
                  onUndo={() => undoCanvas(roomId, user.id)}
                  disabled={roomState.status !== 'drawing'}
                />

                {/* Guessing Panel below canvas */}
                <div className="w-full h-64">
                  <GuessingPanel
                    guesses={roomState.guesses}
                    isDrawer={isCurrentDrawer}
                    hasGuessedCorrectly={myPlayer?.hasGuessedCorrectly ?? false}
                    closeHint={closeGuessHint}
                    onSendGuess={(text) => submitGuess(roomId, user.id, text)}
                    disabled={roomState.status !== 'drawing'}
                  />
                </div>
              </div>

              {/* Right Side: In-Room Live Leaderboard (4 cols on desktop) matching Screen 6 */}
              <div className={`lg:col-span-4 h-[580px] ${activeTabMobile === 'canvas' ? 'hidden lg:block' : 'block'}`}>
                <InRoomLeaderboard
                  players={roomState.players}
                  currentDrawerId={roomState.currentDrawerId}
                />
              </div>
            </div>
          </div>
        )}

        {/* Round Over Modal (Screen 7) */}
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
              if (isHost) startGame(roomId, user.id);
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
                Share this link or room code with anyone to play together!
              </p>

              <div className="p-3 bg-white rounded-2xl border-2 border-slate-300 font-mono text-xs font-bold text-slate-800 break-all mb-4 select-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}` : roomId}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-2xl border-2 border-slate-900 shadow-sketch-sm flex items-center justify-center gap-2 font-doodle uppercase"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied Link!' : 'Copy Link'}
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm rounded-2xl border border-slate-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
