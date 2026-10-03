function setupSocketHandlers(io, gameEngine) {
  io.on('connection', (socket) => {
    let currentRoomId = null;
    let currentUserId = null;

    socket.on('room:join', (data) => {
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

    socket.on('room:ready', (data) => {
      gameEngine.setReady(data.roomId, data.userId, data.isReady);
    });

    socket.on('room:start_game', (data) => {
      gameEngine.startGame(data.roomId, data.userId);
    });

    socket.on('room:select_word', (data) => {
      gameEngine.selectWord(data.roomId, data.drawerId, data.word);
    });

    socket.on('draw:stroke', (data) => {
      gameEngine.handleDrawingStroke(data.roomId, data.userId, data.stroke);
    });

    socket.on('draw:clear', (data) => {
      gameEngine.handleCanvasClear(data.roomId, data.userId);
    });

    socket.on('draw:undo', (data) => {
      gameEngine.handleCanvasUndo(data.roomId, data.userId);
    });

    socket.on('game:submit_guess', (data) => {
      gameEngine.submitGuess(data.roomId, data.userId, data.text);
    });

    socket.on('game:request_sync', (data) => {
      const room = gameEngine.getRoom(data.roomId);
      if (room) {
        gameEngine.broadcastRoomState(room);
      }
    });

    socket.on('disconnect', () => {
      if (currentRoomId && currentUserId) {
        gameEngine.leaveRoom(currentRoomId, currentUserId, socket.id);
      }
    });
  });
}

module.exports = {
  setupSocketHandlers
};
