import { Server as SocketIOServer, Socket } from 'socket.io';
import { GameEngine } from './gameEngine';
import { DrawStroke } from './db';

export function setupSocketHandlers(io: SocketIOServer, gameEngine: GameEngine) {
  io.on('connection', (socket: Socket) => {
    let currentRoomId: string | null = null;
    let currentUserId: string | null = null;

    // Join room
    socket.on('room:join', (data: { roomId: string; user: { id: string; username: string; avatar: string } }) => {
      const { roomId, user } = data;
      if (!roomId || !user) return;

      currentRoomId = roomId;
      currentUserId = user.id;

      socket.join(roomId);
      const result = gameEngine.joinRoom(roomId, user, socket.id);
      
      if (!result.success) {
        socket.emit('room:join_error', { message: result.message });
      }
    });

    // Toggle Ready status
    socket.on('room:ready', (data: { roomId: string; userId: string; isReady: boolean }) => {
      gameEngine.setReady(data.roomId, data.userId, data.isReady);
    });

    // Start Game (Host only)
    socket.on('room:start_game', (data: { roomId: string; userId: string }) => {
      gameEngine.startGame(data.roomId, data.userId);
    });

    // Drawer selects one of 3 private words
    socket.on('room:select_word', (data: { roomId: string; drawerId: string; word: string }) => {
      gameEngine.selectWord(data.roomId, data.drawerId, data.word);
    });

    // Drawing strokes
    socket.on('draw:stroke', (data: { roomId: string; userId: string; stroke: DrawStroke }) => {
      gameEngine.handleDrawingStroke(data.roomId, data.userId, data.stroke);
    });

    // Canvas Clear
    socket.on('draw:clear', (data: { roomId: string; userId: string }) => {
      gameEngine.handleCanvasClear(data.roomId, data.userId);
    });

    // Canvas Undo
    socket.on('draw:undo', (data: { roomId: string; userId: string }) => {
      gameEngine.handleCanvasUndo(data.roomId, data.userId);
    });

    // Guess submission
    socket.on('game:submit_guess', (data: { roomId: string; userId: string; text: string }) => {
      gameEngine.submitGuess(data.roomId, data.userId, data.text);
    });

    // Request full state sync
    socket.on('game:request_sync', (data: { roomId: string }) => {
      const room = gameEngine.getRoom(data.roomId);
      if (room) {
        gameEngine.broadcastRoomState(room);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (currentRoomId && currentUserId) {
        gameEngine.leaveRoom(currentRoomId, currentUserId, socket.id);
      }
    });
  });
}
