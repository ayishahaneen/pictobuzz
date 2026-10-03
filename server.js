const http = require('http');
const express = require('express');
const next = require('next');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev });
const handle = app.getRequestHandler();

const JWT_SECRET = process.env.JWT_SECRET || 'picto_buzz_super_secret_key_2026';

app.prepare().then(() => {
  const expressApp = express();
  const server = http.createServer(expressApp);
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  expressApp.use(express.json());

  // Import Database and Word Bank
  const { db } = require('./src/server/db');
  const { WORD_BANK, getWordChoices, WORD_CATEGORIES } = require('./src/lib/wordBank');
  const { GameEngine } = require('./src/server/gameEngine');
  const { setupSocketHandlers } = require('./src/server/socketHandler');

  const gameEngine = new GameEngine(io);
  setupSocketHandlers(io, gameEngine);

  // Authentication Helper Middleware
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      req.user = decoded;
      next();
    });
  };

  // Auth REST Endpoints
  expressApp.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password, avatar } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const user = await db.createUser(username, email, password, avatar || 'avatar_1');
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ user, token });
    } catch (e) {
      return res.status(400).json({ error: e.message || 'Registration failed' });
    }
  });

  expressApp.post('/api/auth/login', async (req, res) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({ error: 'Please enter username/email and password' });
      }
      const user = db.findUserByUsernameOrEmail(identifier);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username/email or password' });
      }
      const valid = await db.verifyPassword(user, password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid username/email or password' });
      }
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ user, token });
    } catch (e) {
      return res.status(500).json({ error: 'Login failed' });
    }
  });

  expressApp.post('/api/auth/guest', async (req, res) => {
    try {
      const guestNum = Math.floor(1000 + Math.random() * 9000);
      const username = `Doodler_${guestNum}`;
      const email = `guest_${Date.now()}_${guestNum}@pictobuzz.local`;
      const avatarNum = Math.floor(1 + Math.random() * 8);
      const user = await db.createUser(username, email, 'guestpassword123', `avatar_${avatarNum}`);
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ user, token });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to create guest user' });
    }
  });

  expressApp.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = db.findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  });

  expressApp.post('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
      const { username, avatar } = req.body;
      const updated = await db.updateProfile(req.user.id, { username, avatar });
      return res.json({ user: updated });
    } catch (e) {
      return res.status(400).json({ error: e.message || 'Update failed' });
    }
  });

  expressApp.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const token = db.createPasswordResetToken(email);
    if (!token) {
      // Don't reveal if user exists for security
      return res.json({ message: 'If an account exists, a reset link has been generated', token: 'demo-token' });
    }
    return res.json({ message: 'Reset token generated successfully', token });
  });

  expressApp.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Valid token and new password (min 6 chars) required' });
    }
    const success = await db.resetPasswordWithToken(token, newPassword);
    if (!success) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    return res.json({ message: 'Password reset successfully! You can now log in.' });
  });

  // Rooms & Matchmaking API
  expressApp.get('/api/rooms/public', (req, res) => {
    const rooms = gameEngine.getPublicRooms().map(r => ({
      id: r.id,
      code: r.code,
      name: r.settings.name,
      playersCount: r.players.length,
      maxPlayers: r.settings.maxPlayers,
      difficulty: r.settings.difficulty,
      category: r.settings.category,
      rounds: r.settings.rounds
    }));
    return res.json({ rooms });
  });

  expressApp.post('/api/rooms/create', (req, res) => {
    const { hostUser, settings } = req.body;
    if (!hostUser || !settings || !settings.name) {
      return res.status(400).json({ error: 'Missing room settings or host details' });
    }
    const room = gameEngine.createRoom(hostUser, settings);
    return res.json({ room });
  });

  expressApp.get('/api/rooms/find-code/:code', (req, res) => {
    const room = gameEngine.findRoomByCode(req.params.code);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    return res.json({ roomId: room.id, code: room.code });
  });

  expressApp.get('/api/rooms/:id', (req, res) => {
    const room = gameEngine.getRoom(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    return res.json({
      id: room.id,
      code: room.code,
      name: room.settings.name,
      status: room.status,
      playersCount: room.players.length,
      maxPlayers: room.settings.maxPlayers,
      rounds: room.settings.rounds,
      drawDuration: room.settings.drawDuration,
      category: room.settings.category,
      difficulty: room.settings.difficulty
    });
  });

  expressApp.get('/api/leaderboard', (req, res) => {
    const leaderboard = db.getLeaderboard(15);
    return res.json({ leaderboard });
  });

  expressApp.get('/api/categories', (req, res) => {
    return res.json({ categories: WORD_CATEGORIES });
  });

  // Next.js page handler
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Picto Buzz game server running on http://localhost:${port}`);
  });
});
