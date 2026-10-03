import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { soundManager } from '../lib/audio';

export interface RoomPlayer {
  id: string;
  username: string;
  avatar: string;
  score: number;
  roundScore: number;
  isHost: boolean;
  isReady: boolean;
  hasGuessedCorrectly: boolean;
  connected: boolean;
  hasCrown?: boolean;
}

export interface RoomSettings {
  name: string;
  isPublic: boolean;
  maxPlayers: number;
  rounds: number;
  drawDuration: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  category: string;
}

export interface GuessMsg {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  isCorrect?: boolean;
  isClose?: boolean;
  isSystem?: boolean;
  timestamp: number;
}

export interface RoomState {
  id: string;
  code: string;
  settings: RoomSettings;
  hostId: string;
  status: 'lobby' | 'selecting_word' | 'drawing' | 'round_over' | 'game_over';
  players: RoomPlayer[];
  currentRound: number;
  currentDrawerId: string;
  roundStartTime: number;
  roundEndTime: number;
  revealedWord?: string;
  wordLength?: number;
  guesses: GuessMsg[];
  drawingHistory: any[];
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  roomState: RoomState | null;
  privateWordChoices: string[];
  drawerSecretWord: string | null;
  closeGuessHint: string | null;
  correctGuessNotification: { points: number; word: string } | null;
  roundEndedPayload: any | null;
  gameOverPayload: any | null;
  joinRoom: (roomId: string, user: { id: string; username: string; avatar: string }) => void;
  leaveRoom: (roomId: string, userId: string) => void;
  setReady: (roomId: string, userId: string, isReady: boolean) => void;
  startGame: (roomId: string, userId: string) => void;
  selectWord: (roomId: string, drawerId: string, word: string) => void;
  sendStroke: (roomId: string, userId: string, stroke: any) => void;
  clearCanvas: (roomId: string, userId: string) => void;
  undoCanvas: (roomId: string, userId: string) => void;
  submitGuess: (roomId: string, userId: string, text: string) => void;
  clearCelebrations: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [privateWordChoices, setPrivateWordChoices] = useState<string[]>([]);
  const [drawerSecretWord, setDrawerSecretWord] = useState<string | null>(null);
  const [closeGuessHint, setCloseGuessHint] = useState<string | null>(null);
  const [correctGuessNotification, setCorrectGuessNotification] = useState<{ points: number; word: string } | null>(null);
  const [roundEndedPayload, setRoundEndedPayload] = useState<any | null>(null);
  const [gameOverPayload, setGameOverPayload] = useState<any | null>(null);

  useEffect(() => {
    const newSocket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('room:state_update', (state: RoomState) => {
      setRoomState(state);
      if (state.status === 'drawing' && state.revealedWord) {
        // Reset secret word if not drawer
      }
      if (state.status !== 'selecting_word') {
        setPrivateWordChoices([]);
      }
    });

    // CRITICAL: Private 3-word choices sent ONLY to the current drawer
    newSocket.on('room:private_word_choices', (data: { choices: string[]; duration: number }) => {
      setPrivateWordChoices(data.choices);
      soundManager.playPop();
    });

    // Private drawer confirmation
    newSocket.on('room:private_drawer_word', (data: { word: string }) => {
      setDrawerSecretWord(data.word);
    });

    // Guesser private notifications
    newSocket.on('game:close_guess_hint', (data: { guess: string; message: string }) => {
      setCloseGuessHint(data.message);
      soundManager.playClose();
      setTimeout(() => setCloseGuessHint(null), 3000);
    });

    newSocket.on('game:you_guessed_correctly', (data: { points: number; word: string }) => {
      setCorrectGuessNotification(data);
      soundManager.playCorrect();
    });

    newSocket.on('room:round_ended', (data: any) => {
      setRoundEndedPayload(data);
      setDrawerSecretWord(null);
      setPrivateWordChoices([]);
      soundManager.playFanfare();
    });

    newSocket.on('room:game_over', (data: any) => {
      setGameOverPayload(data);
      soundManager.playFanfare();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinRoom = (roomId: string, user: { id: string; username: string; avatar: string }) => {
    if (socket) {
      socket.emit('room:join', { roomId, user });
    }
  };

  const leaveRoom = (roomId: string, userId: string) => {
    if (socket) {
      socket.emit('room:leave', { roomId, userId });
      setRoomState(null);
    }
  };

  const setReady = (roomId: string, userId: string, isReady: boolean) => {
    if (socket) {
      socket.emit('room:ready', { roomId, userId, isReady });
      soundManager.playPop();
    }
  };

  const startGame = (roomId: string, userId: string) => {
    if (socket) {
      socket.emit('room:start_game', { roomId, userId });
      soundManager.playFanfare();
    }
  };

  const selectWord = (roomId: string, drawerId: string, word: string) => {
    if (socket) {
      socket.emit('room:select_word', { roomId, drawerId, word });
      setPrivateWordChoices([]);
      soundManager.playPop();
    }
  };

  const sendStroke = (roomId: string, userId: string, stroke: any) => {
    if (socket) {
      socket.emit('draw:stroke', { roomId, userId, stroke });
    }
  };

  const clearCanvas = (roomId: string, userId: string) => {
    if (socket) {
      socket.emit('draw:clear', { roomId, userId });
      soundManager.playPop();
    }
  };

  const undoCanvas = (roomId: string, userId: string) => {
    if (socket) {
      socket.emit('draw:undo', { roomId, userId });
      soundManager.playPop();
    }
  };

  const submitGuess = (roomId: string, userId: string, text: string) => {
    if (socket && text.trim()) {
      socket.emit('game:submit_guess', { roomId, userId, text: text.trim() });
      soundManager.playPop();
    }
  };

  const clearCelebrations = () => {
    setCorrectGuessNotification(null);
    setRoundEndedPayload(null);
    setGameOverPayload(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
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
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
