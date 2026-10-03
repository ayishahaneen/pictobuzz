import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface UserMatchSummary {
  roomId: string;
  roomName: string;
  mode: 'friends' | 'ai' | 'public';
  date: string;
  rank: number;
  totalPlayers: number;
  score: number;
  wordGuessedCount: number;
  isWinner: boolean;
}

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar: string;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  correctGuesses: number;
  longestStreak: number;
  personalBest: number;
  createdAt: string;
  matchHistory: UserMatchSummary[];
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

export interface PlayerState {
  id: string;
  username: string;
  avatar: string;
  score: number;
  roundScore: number;
  isHost: boolean;
  isReady: boolean;
  hasGuessedCorrectly: boolean;
  connected: boolean;
  socketId?: string;
}

export interface DrawStroke {
  tool: 'pencil' | 'brush' | 'eraser';
  color: string;
  size: number;
  points: { x: number; y: number }[];
}

export interface GuessMessage {
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

export interface RoomRecord {
  id: string;
  code: string;
  settings: RoomSettings;
  hostId: string;
  status: 'lobby' | 'selecting_word' | 'drawing' | 'round_over' | 'game_over';
  players: PlayerState[];
  currentRound: number;
  currentDrawerIndex: number;
  currentDrawerId: string;
  secretChoices: string[];
  selectedWord: string;
  roundStartTime: number;
  roundEndTime: number;
  drawingHistory: DrawStroke[];
  guesses: GuessMessage[];
  createdAt: number;
  lastActive: number;
}

interface DatabaseSchema {
  users: Record<string, UserRecord>;
  usernameToId: Record<string, string>;
  emailToId: Record<string, string>;
  resetTokens: Record<string, { userId: string; expiresAt: number }>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'picto_buzz_db.json');

class DatabaseService {
  private data: DatabaseSchema = {
    users: {},
    usernameToId: {},
    emailToId: {},
    resetTokens: {}
  };
  private isLoaded = false;

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seedInitialUsers();
        this.save();
      }
      this.isLoaded = true;
    } catch (e) {
      console.error('Error loading database:', e);
      this.data = {
        users: {},
        usernameToId: {},
        emailToId: {},
        resetTokens: {}
      };
      this.seedInitialUsers();
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  private seedInitialUsers() {
    // Seed default demo user 'Danish' and others matching the screenshot
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('pictionary123', salt);

    const danishUser: UserRecord = {
      id: 'usr_danish_101',
      username: 'Danish',
      email: 'danish@pictobuzz.com',
      passwordHash: hash,
      avatar: 'avatar_1',
      totalScore: 320,
      gamesPlayed: 14,
      gamesWon: 9,
      correctGuesses: 42,
      longestStreak: 6,
      personalBest: 480,
      createdAt: new Date().toISOString(),
      matchHistory: [
        {
          roomId: 'room_7F3K9',
          roomName: "Danish's Room",
          mode: 'friends',
          date: new Date(Date.now() - 3600000).toISOString(),
          rank: 1,
          totalPlayers: 4,
          score: 320,
          wordGuessedCount: 4,
          isWinner: true
        }
      ]
    };

    const ayaanUser: UserRecord = {
      id: 'usr_ayaan_102',
      username: 'Ayaan',
      email: 'ayaan@pictobuzz.com',
      passwordHash: hash,
      avatar: 'avatar_2',
      totalScore: 280,
      gamesPlayed: 12,
      gamesWon: 5,
      correctGuesses: 35,
      longestStreak: 4,
      personalBest: 410,
      createdAt: new Date().toISOString(),
      matchHistory: []
    };

    const zaraUser: UserRecord = {
      id: 'usr_zara_103',
      username: 'Zara',
      email: 'zara@pictobuzz.com',
      passwordHash: hash,
      avatar: 'avatar_3',
      totalScore: 210,
      gamesPlayed: 9,
      gamesWon: 3,
      correctGuesses: 26,
      longestStreak: 3,
      personalBest: 360,
      createdAt: new Date().toISOString(),
      matchHistory: []
    };

    this.data.users[danishUser.id] = danishUser;
    this.data.usernameToId[danishUser.username.toLowerCase()] = danishUser.id;
    this.data.emailToId[danishUser.email.toLowerCase()] = danishUser.id;

    this.data.users[ayaanUser.id] = ayaanUser;
    this.data.usernameToId[ayaanUser.username.toLowerCase()] = ayaanUser.id;
    this.data.emailToId[ayaanUser.email.toLowerCase()] = ayaanUser.id;

    this.data.users[zaraUser.id] = zaraUser;
    this.data.usernameToId[zaraUser.username.toLowerCase()] = zaraUser.id;
    this.data.emailToId[zaraUser.email.toLowerCase()] = zaraUser.id;
  }

  // User methods
  public async createUser(username: string, email: string, passwordPlain: string, avatar: string = 'avatar_1'): Promise<UserRecord> {
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

    const newUser: UserRecord = {
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

  public findUserById(id: string): UserRecord | null {
    return this.data.users[id] || null;
  }

  public findUserByUsernameOrEmail(identifier: string): UserRecord | null {
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

  public async verifyPassword(user: UserRecord, passwordPlain: string): Promise<boolean> {
    return bcrypt.compare(passwordPlain, user.passwordHash);
  }

  public async updateProfile(userId: string, updates: { username?: string; avatar?: string }): Promise<UserRecord> {
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

  public updateUserStats(userId: string, stats: { scoreDelta: number; won: boolean; correctGuessesDelta: number; newStreak?: number; matchSummary?: UserMatchSummary }) {
    const user = this.data.users[userId];
    if (!user) return;

    user.totalScore += stats.scoreDelta;
    user.gamesPlayed += 1;
    if (stats.won) user.gamesWon += 1;
    user.correctGuesses += stats.correctGuessesDelta;
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

  public createPasswordResetToken(email: string): string | null {
    const user = this.findUserByUsernameOrEmail(email);
    if (!user) return null;

    const token = 'rst_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    this.data.resetTokens[token] = {
      userId: user.id,
      expiresAt: Date.now() + 3600000 // 1 hour
    };
    this.save();
    return token;
  }

  public async resetPasswordWithToken(token: string, newPasswordPlain: string): Promise<boolean> {
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

  public getLeaderboard(limit = 10): { id: string; username: string; avatar: string; totalScore: number; gamesWon: number; gamesPlayed: number }[] {
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

export const db = new DatabaseService();
