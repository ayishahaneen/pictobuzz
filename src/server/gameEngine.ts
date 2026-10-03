import { Server as SocketIOServer, Socket } from 'socket.io';
import { getWordChoices } from '../lib/wordBank';
import { db, PlayerState, RoomRecord, RoomSettings, DrawStroke, GuessMessage } from './db';

const globalRooms: Map<string, RoomRecord> = (global as any).__PICTO_ROOMS__ || new Map();
(global as any).__PICTO_ROOMS__ = globalRooms;

export class GameEngine {
  private io?: SocketIOServer;
  private rooms: Map<string, RoomRecord> = globalRooms;
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private selectionTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(io?: SocketIOServer) {
    this.io = io;
  }

  public setIO(io: SocketIOServer) {
    this.io = io;
  }

  public getRoom(roomId: string): RoomRecord | undefined {
    if (!roomId) return undefined;
    const direct = this.rooms.get(roomId);
    if (direct) return direct;

    const upper = roomId.toUpperCase();
    const withPrefix = upper.startsWith('ROOM_') ? upper : `ROOM_${upper}`;

    for (const room of Array.from(this.rooms.values())) {
      if (
        room.id.toUpperCase() === upper ||
        room.id.toUpperCase() === withPrefix ||
        room.code.toUpperCase() === upper ||
        room.code.toUpperCase() === upper.replace('ROOM_', '')
      ) {
        return room;
      }
    }
    return undefined;
  }

  public findRoomByCode(code: string): RoomRecord | undefined {
    for (const room of Array.from(this.rooms.values())) {
      if (room.code.toUpperCase() === code.toUpperCase()) {
        return room;
      }
    }
    return undefined;
  }

  public getPublicRooms(): RoomRecord[] {
    return Array.from(this.rooms.values()).filter(
      r => r.settings.isPublic && r.status === 'lobby' && r.players.length < r.settings.maxPlayers
    );
  }

  public createRoom(
    hostUser: { id: string; username: string; avatar: string },
    settings: RoomSettings
  ): RoomRecord {
    const roomId = 'room_' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = roomId.replace('room_', '');

    const hostPlayer: PlayerState = {
      id: hostUser.id,
      username: hostUser.username,
      avatar: hostUser.avatar,
      score: 0,
      roundScore: 0,
      isHost: true,
      isReady: true,
      hasGuessedCorrectly: false,
      connected: true
    };

    const room: RoomRecord = {
      id: roomId,
      code,
      settings,
      hostId: hostUser.id,
      status: 'lobby',
      players: [hostPlayer],
      currentRound: 1,
      currentDrawerIndex: 0,
      currentDrawerId: hostUser.id,
      secretChoices: [],
      selectedWord: '',
      roundStartTime: 0,
      roundEndTime: 0,
      drawingHistory: [],
      guesses: [],
      createdAt: Date.now(),
      lastActive: Date.now()
    };

    this.rooms.set(roomId, room);
    return room;
  }

  public joinRoom(
    roomId: string,
    user: { id: string; username: string; avatar: string },
    socketId: string
  ): { success: boolean; room?: RoomRecord; message?: string } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    let player = room.players.find(p => p.id === user.id);
    if (player) {
      // Reconnecting player
      player.connected = true;
      player.socketId = socketId;
      player.username = user.username;
      player.avatar = user.avatar;
    } else {
      if (room.players.length >= room.settings.maxPlayers) {
        return { success: false, message: 'Room is full' };
      }
      player = {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        score: 0,
        roundScore: 0,
        isHost: room.players.length === 0,
        isReady: false,
        hasGuessedCorrectly: false,
        connected: true,
        socketId
      };
      room.players.push(player);
    }

    room.lastActive = Date.now();
    this.broadcastRoomState(room);
    return { success: true, room };
  }

  public leaveRoom(roomId: string, userId: string, socketId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === userId);
    if (playerIndex === -1) return;

    const player = room.players[playerIndex];
    player.connected = false;

    // Check if room is active or in lobby
    if (room.status === 'lobby') {
      room.players.splice(playerIndex, 1);
      if (room.players.length === 0) {
        this.rooms.delete(roomId);
        return;
      }
      if (player.isHost) {
        room.players[0].isHost = true;
        room.hostId = room.players[0].id;
      }
    } else {
      // If the current drawer left during active turn
      if (room.currentDrawerId === userId && (room.status === 'selecting_word' || room.status === 'drawing')) {
        this.addSystemMessage(room, `${player.username} (the drawer) disconnected! Ending round...`);
        this.endRound(room, true);
      }
    }

    room.lastActive = Date.now();
    this.broadcastRoomState(room);
  }

  public setReady(roomId: string, userId: string, isReady: boolean) {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'lobby') return;

    const player = room.players.find(p => p.id === userId);
    if (player) {
      player.isReady = isReady;
      this.broadcastRoomState(room);
    }
  }

  public startGame(roomId: string, requesterId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    if (room.hostId !== requesterId) return false;
    if (room.players.length < 1) return false;

    room.currentRound = 1;
    room.currentDrawerIndex = 0;
    room.players.forEach(p => {
      p.score = 0;
      p.roundScore = 0;
      p.hasGuessedCorrectly = false;
    });

    this.startDrawerTurn(room);
    return true;
  }

  // Phase 1: Start turn & private 3-word selection for current drawer
  private startDrawerTurn(room: RoomRecord) {
    // Clear any existing timers
    this.clearRoomTimers(room.id);

    // Pick active drawer
    const activePlayers = room.players.filter(p => p.connected);
    if (activePlayers.length === 0) {
      this.rooms.delete(room.id);
      return;
    }

    if (room.currentDrawerIndex >= activePlayers.length) {
      room.currentDrawerIndex = 0;
      room.currentRound += 1;
      if (room.currentRound > room.settings.rounds) {
        this.endGame(room);
        return;
      }
    }

    const drawer = activePlayers[room.currentDrawerIndex];
    room.currentDrawerId = drawer.id;
    room.status = 'selecting_word';
    room.drawingHistory = [];
    room.guesses = [];
    room.selectedWord = '';

    room.players.forEach(p => {
      p.roundScore = 0;
      p.hasGuessedCorrectly = false;
    });

    // Generate exactly 3 distinct word choices from word bank
    const choices = getWordChoices(room.settings.category, room.settings.difficulty);
    room.secretChoices = choices;

    // Send private 3-word choices ONLY to the drawer socket
    if (drawer.socketId && this.io) {
      this.io.to(drawer.socketId).emit('room:private_word_choices', {
        choices,
        duration: 15 // 15 seconds to choose
      });
    }

    // Broadcast public state to all room players (SECRET CHOICES ARE OMITTED!)
    this.broadcastRoomState(room);

    // Auto-select first word if drawer takes longer than 15 seconds
    const timer = setTimeout(() => {
      if (room.status === 'selecting_word') {
        const autoWord = room.secretChoices[0] || 'Elephant';
        this.selectWord(room.id, drawer.id, autoWord);
      }
    }, 15000);

    this.selectionTimers.set(room.id, timer);
  }

  // Phase 2: Drawer selects word, drawing phase starts
  public selectWord(roomId: string, drawerId: string, word: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'selecting_word' || room.currentDrawerId !== drawerId) {
      return false;
    }

    // Verify word is one of the valid secret choices
    if (!room.secretChoices.includes(word)) {
      word = room.secretChoices[0] || 'Elephant';
    }

    if (this.selectionTimers.has(roomId)) {
      clearTimeout(this.selectionTimers.get(roomId)!);
      this.selectionTimers.delete(roomId);
    }

    room.selectedWord = word;
    room.status = 'drawing';
    room.roundStartTime = Date.now();
    room.roundEndTime = Date.now() + room.settings.drawDuration * 1000;

    const drawer = room.players.find(p => p.id === drawerId);

    // Send private selected word confirmation to the drawer
    if (drawer && drawer.socketId && this.io) {
      this.io.to(drawer.socketId).emit('room:private_drawer_word', {
        word: room.selectedWord
      });
    }

    this.addSystemMessage(room, `${drawer?.username || 'The drawer'} is now drawing!`);
    this.broadcastRoomState(room);

    // Start server-authoritative round countdown timer
    const roundTimer = setTimeout(() => {
      this.endRound(room, false);
    }, room.settings.drawDuration * 1000);

    this.timers.set(room.id, roundTimer);
    return true;
  }

  // Phase 3: Drawing stroke synchronization
  public handleDrawingStroke(roomId: string, userId: string, stroke: DrawStroke): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'drawing' || room.currentDrawerId !== userId) {
      return false;
    }

    room.drawingHistory.push(stroke);
    // Broadcast stroke to all guessers
    this.io?.to(roomId).emit('draw:stroke', stroke);
    return true;
  }

  public handleCanvasClear(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'drawing' || room.currentDrawerId !== userId) {
      return false;
    }

    room.drawingHistory = [];
    this.io?.to(roomId).emit('draw:clear');
    return true;
  }

  public handleCanvasUndo(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'drawing' || room.currentDrawerId !== userId) {
      return false;
    }

    if (room.drawingHistory.length > 0) {
      room.drawingHistory.pop();
      this.io?.to(roomId).emit('draw:history_sync', { history: room.drawingHistory });
      return true;
    }
    return false;
  }

  // Phase 4: Guess verification & scoring
  public submitGuess(roomId: string, userId: string, text: string): { status: 'correct' | 'close' | 'wrong' | 'already_guessed' | 'drawer_blocked' | 'error' } {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'drawing') {
      return { status: 'error' };
    }

    // Drawer cannot guess
    if (room.currentDrawerId === userId) {
      return { status: 'drawer_blocked' };
    }

    const player = room.players.find(p => p.id === userId);
    if (!player) return { status: 'error' };

    // Player already guessed correctly this round
    if (player.hasGuessedCorrectly) {
      return { status: 'already_guessed' };
    }

    const normalizedGuess = text.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const normalizedAnswer = room.selectedWord.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');

    // Check exact match
    if (normalizedGuess === normalizedAnswer) {
      player.hasGuessedCorrectly = true;

      const remainingTime = Math.max(0, (room.roundEndTime - Date.now()) / 1000);
      const totalTime = room.settings.drawDuration;

      // Formula: 100 + floor(400 * remaining / total)
      const basePoints = 100 + Math.floor(400 * (remainingTime / totalTime));
      const isFirst = !room.players.some(p => p.id !== player.id && p.hasGuessedCorrectly);
      const points = isFirst ? basePoints + 50 : basePoints;

      player.roundScore = points;
      player.score += points;

      const guessMsg: GuessMessage = {
        id: 'msg_' + Math.random().toString(36).substring(2, 9),
        userId: player.id,
        username: player.username,
        avatar: player.avatar,
        text: 'Guessed the word correctly! 🎉',
        isCorrect: true,
        timestamp: Date.now()
      };
      room.guesses.push(guessMsg);

      // Notify room of correct guess
      this.io?.to(roomId).emit('game:guess_message', guessMsg);

      // Send private score celebration to the lucky guesser
      if (player.socketId && this.io) {
        this.io.to(player.socketId).emit('game:you_guessed_correctly', {
          points,
          word: room.selectedWord
        });
      }

      this.broadcastRoomState(room);

      // Check if all connected guessers have guessed correctly
      const activeGuessers = room.players.filter(p => p.connected && p.id !== room.currentDrawerId);
      const allGuessed = activeGuessers.length > 0 && activeGuessers.every(p => p.hasGuessedCorrectly);
      if (allGuessed) {
        this.addSystemMessage(room, 'All players guessed correctly! Great job!');
        this.endRound(room, false);
      }

      return { status: 'correct' };
    }

    // Check close guess (Levenshtein distance <= 1)
    if (this.isCloseMatch(normalizedGuess, normalizedAnswer)) {
      if (player.socketId && this.io) {
        this.io.to(player.socketId).emit('game:close_guess_hint', {
          guess: text,
          message: "You're super close! 🤏"
        });
      }
      return { status: 'close' };
    }

    // Regular wrong guess - broadcast to public chat
    const wrongMsg: GuessMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      userId: player.id,
      username: player.username,
      avatar: player.avatar,
      text,
      isCorrect: false,
      timestamp: Date.now()
    };
    room.guesses.push(wrongMsg);
    this.io?.to(roomId).emit('game:guess_message', wrongMsg);
    return { status: 'wrong' };
  }

  // Phase 5: End of Round & points compilation
  private endRound(room: RoomRecord, wasSkipped: boolean = false) {
    this.clearRoomTimers(room.id);

    room.status = 'round_over';

    const drawer = room.players.find(p => p.id === room.currentDrawerId);
    const correctGuessers = room.players.filter(p => p.id !== room.currentDrawerId && p.hasGuessedCorrectly);

    // Award drawer points if anyone guessed correctly
    if (drawer && correctGuessers.length > 0 && !wasSkipped) {
      const drawerPoints = correctGuessers.length * 60 + 40;
      drawer.roundScore = drawerPoints;
      drawer.score += drawerPoints;
    } else if (drawer) {
      drawer.roundScore = 0;
    }

    // Public round over payload with word reveal
    this.io?.to(room.id).emit('room:round_ended', {
      word: room.selectedWord,
      drawerId: room.currentDrawerId,
      drawerName: drawer?.username || 'Drawer',
      drawingHistory: room.drawingHistory,
      scores: room.players.map(p => ({
        id: p.id,
        username: p.username,
        avatar: p.avatar,
        totalScore: p.score,
        roundScore: p.roundScore,
        hasGuessedCorrectly: p.hasGuessedCorrectly
      })),
      leaderId: this.getLeaderId(room)
    });

    this.broadcastRoomState(room);

    // Auto transition to next turn after 7 seconds
    const nextTurnTimer = setTimeout(() => {
      room.currentDrawerIndex += 1;
      this.startDrawerTurn(room);
    }, 7000);

    this.timers.set(room.id, nextTurnTimer);
  }

  // Phase 6: Final Game Over & Winner announcement
  private endGame(room: RoomRecord) {
    this.clearRoomTimers(room.id);
    room.status = 'game_over';

    // Sort players by score descending
    const sorted = [...room.players].sort((a, b) => b.score - a.score);
    const topScore = sorted[0]?.score || 0;
    const winners = sorted.filter(p => p.score === topScore && topScore > 0);

    // Update database records for all registered users
    sorted.forEach((player, rankIndex) => {
      const isWinner = winners.some(w => w.id === player.id);
      db.updateUserStats(player.id, {
        scoreDelta: player.score,
        won: isWinner,
        correctGuessesDelta: player.score > 0 ? 3 : 0,
        matchSummary: {
          roomId: room.id,
          roomName: room.settings.name,
          mode: room.settings.isPublic ? 'public' : 'friends',
          date: new Date().toISOString(),
          rank: rankIndex + 1,
          totalPlayers: sorted.length,
          score: player.score,
          wordGuessedCount: 0,
          isWinner
        }
      });
    });

    this.io?.to(room.id).emit('room:game_over', {
      winners,
      rankings: sorted,
      totalRounds: room.settings.rounds
    });

    this.broadcastRoomState(room);
  }

  // Helpers
  private getLeaderId(room: RoomRecord): string | null {
    if (room.players.length === 0) return null;
    const maxScore = Math.max(...room.players.map(p => p.score));
    if (maxScore <= 0) return null;
    const leaders = room.players.filter(p => p.score === maxScore);
    return leaders.length === 1 ? leaders[0].id : null; // single leader or shared
  }

  public broadcastRoomState(room: RoomRecord) {
    const maxScore = Math.max(...room.players.map(p => p.score), 0);
    const leaderIds = maxScore > 0 ? room.players.filter(p => p.score === maxScore).map(p => p.id) : [];

    // Sanitize state for public broadcast: NEVER INCLUDE secretChoices or selectedWord (unless round_over/game_over)
    const sanitizedRoom = {
      id: room.id,
      code: room.code,
      settings: room.settings,
      hostId: room.hostId,
      status: room.status,
      players: room.players.map(p => ({
        id: p.id,
        username: p.username,
        avatar: p.avatar,
        score: p.score,
        roundScore: p.roundScore,
        isHost: p.isHost,
        isReady: p.isReady,
        hasGuessedCorrectly: p.hasGuessedCorrectly,
        connected: p.connected,
        hasCrown: leaderIds.includes(p.id)
      })),
      currentRound: room.currentRound,
      currentDrawerId: room.currentDrawerId,
      roundStartTime: room.roundStartTime,
      roundEndTime: room.roundEndTime,
      revealedWord: (room.status === 'round_over' || room.status === 'game_over') ? room.selectedWord : undefined,
      wordLength: room.selectedWord ? room.selectedWord.length : 0,
      guesses: room.guesses.slice(-30),
      drawingHistory: room.drawingHistory
    };

    this.io?.to(room.id).emit('room:state_update', sanitizedRoom);
  }

  private addSystemMessage(room: RoomRecord, text: string) {
    const sysMsg: GuessMessage = {
      id: 'sys_' + Math.random().toString(36).substring(2, 9),
      userId: 'system',
      username: 'Picto Buzz',
      avatar: 'system',
      text,
      isSystem: true,
      timestamp: Date.now()
    };
    room.guesses.push(sysMsg);
    this.io?.to(room.id).emit('game:guess_message', sysMsg);
  }

  private clearRoomTimers(roomId: string) {
    if (this.timers.has(roomId)) {
      clearTimeout(this.timers.get(roomId)!);
      this.timers.delete(roomId);
    }
    if (this.selectionTimers.has(roomId)) {
      clearTimeout(this.selectionTimers.get(roomId)!);
      this.selectionTimers.delete(roomId);
    }
  }

  private isCloseMatch(guess: string, answer: string): boolean {
    if (Math.abs(guess.length - answer.length) > 2) return false;
    if (guess.length < 3) return false;

    // Simple Levenshtein distance
    const track = Array(answer.length + 1).fill(null).map(() =>
      Array(guess.length + 1).fill(null));
    for (let i = 0; i <= answer.length; i += 1) {
      track[i][0] = i;
    }
    for (let j = 0; j <= guess.length; j += 1) {
      track[0][j] = j;
    }
    for (let i = 1; i <= answer.length; i += 1) {
      for (let j = 1; j <= guess.length; j += 1) {
        const indicator = answer[i - 1] === guess[j - 1] ? 0 : 1;
        track[i][j] = Math.min(
          track[i - 1][j] + 1,
          track[i][j - 1] + 1,
          track[i - 1][j - 1] + indicator,
        );
      }
    }
    return track[answer.length][guess.length] === 1;
  }
}

export const defaultGameEngine = new GameEngine();

