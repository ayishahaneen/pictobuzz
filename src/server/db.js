const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'picto_buzz_db.json');

class DatabaseService {
  constructor() {
    this.data = {
      users: {},
      usernameToId: {},
      emailToId: {},
      resetTokens: {}
    };
    this.load();
  }

  load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = {
          users: {},
          usernameToId: {},
          emailToId: {},
          resetTokens: {}
        };
        this.save();
      }
    } catch (e) {
      console.error('Error loading database:', e);
      this.data = {
        users: {},
        usernameToId: {},
        emailToId: {},
        resetTokens: {}
      };
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  async createUser(username, email, passwordPlain, avatar = 'avatar_1') {
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (this.data.usernameToId[cleanUsername.toLowerCase()]) {
      throw new Error('Username is already taken');
    }
    if (this.data.emailToId[cleanEmail]) {
      throw new Error('Email is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);
    const id = 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    const newUser = {
      id,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      avatar,
      totalScore: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      correctGuesses: 0,
      longestStreak: 0,
      personalBest: 0,
      createdAt: new Date().toISOString(),
      matchHistory: []
    };

    this.data.users[id] = newUser;
    this.data.usernameToId[cleanUsername.toLowerCase()] = id;
    this.data.emailToId[cleanEmail] = id;
    this.save();

    return newUser;
  }

  findUserById(id) {
    return this.data.users[id] || null;
  }

  findUserByUsernameOrEmail(identifier) {
    const clean = identifier.trim().toLowerCase();
    const idFromUser = this.data.usernameToId[clean];
    if (idFromUser && this.data.users[idFromUser]) {
      return this.data.users[idFromUser];
    }
    const idFromEmail = this.data.emailToId[clean];
    if (idFromEmail && this.data.users[idFromEmail]) {
      return this.data.users[idFromEmail];
    }
    return null;
  }

  async verifyPassword(user, passwordPlain) {
    return bcrypt.compare(passwordPlain, user.passwordHash);
  }

  async updateProfile(userId, updates) {
    const user = this.data.users[userId];
    if (!user) throw new Error('User not found');

    if (updates.username && updates.username.toLowerCase() !== user.username.toLowerCase()) {
      const cleanUser = updates.username.trim();
      if (this.data.usernameToId[cleanUser.toLowerCase()]) {
        throw new Error('Username is already taken');
      }
      delete this.data.usernameToId[user.username.toLowerCase()];
      user.username = cleanUser;
      this.data.usernameToId[cleanUser.toLowerCase()] = user.id;
    }

    if (updates.avatar) {
      user.avatar = updates.avatar;
    }

    this.save();
    return user;
  }

  updateUserStats(userId, stats) {
    const user = this.data.users[userId];
    if (!user) return;

    user.totalScore += (stats.scoreDelta || 0);
    user.gamesPlayed += 1;
    if (stats.won) user.gamesWon += 1;
    user.correctGuesses += (stats.correctGuessesDelta || 0);
    if (stats.scoreDelta > user.personalBest) {
      user.personalBest = stats.scoreDelta;
    }
    if (stats.newStreak && stats.newStreak > user.longestStreak) {
      user.longestStreak = stats.newStreak;
    }
    if (stats.matchSummary) {
      user.matchHistory.unshift(stats.matchSummary);
      if (user.matchHistory.length > 20) {
        user.matchHistory.pop();
      }
    }

    this.save();
  }

  createPasswordResetToken(email) {
    const user = this.findUserByUsernameOrEmail(email);
    if (!user) return null;

    const token = 'rst_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    this.data.resetTokens[token] = {
      userId: user.id,
      expiresAt: Date.now() + 3600000
    };
    this.save();
    return token;
  }

  async resetPasswordWithToken(token, newPasswordPlain) {
    const record = this.data.resetTokens[token];
    if (!record || record.expiresAt < Date.now()) {
      return false;
    }

    const user = this.data.users[record.userId];
    if (!user) return false;

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPasswordPlain, salt);
    delete this.data.resetTokens[token];
    this.save();
    return true;
  }

  getLeaderboard(limit = 10) {
    return Object.values(this.data.users)
      .map(u => ({
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        totalScore: u.totalScore,
        gamesWon: u.gamesWon,
        gamesPlayed: u.gamesPlayed
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
  }
}

const db = new DatabaseService();

module.exports = {
  db
};
