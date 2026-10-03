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

function getDatabaseFilePath(): string {
  try {
    const defaultDataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(defaultDataDir)) {
      fs.mkdirSync(defaultDataDir, { recursive: true });
    }
    const testFile = path.join(defaultDataDir, '.test');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    return path.join(defaultDataDir, 'picto_buzz_db.json');
  } catch {
    // Serverless environment fallback to /tmp
    const tmpDir = process.env.TMPDIR || process.env.TEMP || '/tmp';
    return path.join(tmpDir, 'picto_buzz_db.json');
  }
}

class DatabaseService {
  private data: DatabaseSchema = {
    users: {},
    usernameToId: {},
    emailToId: {},
    resetTokens: {}
  };
  private dbFilePath = '';

  constructor() {
    this.dbFilePath = getDatabaseFilePath();
    this.load();
  }

  private load() {
    try {
      if (this.dbFilePath && fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
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
      this.data = {
        users: {},
        usernameToId: {},
        emailToId: {},
        resetTokens: {}
      };
    }
  }

  private save() {
    try {
      if (this.dbFilePath) {
        const dir = path.dirname(this.dbFilePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.dbFilePath, JSON.stringify(this.data, null, 2), 'utf-8');
      }
    } catch (e) {
      // Keep in-memory if disk is completely unavailable
    }
  }

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
      expiresAt: Date.now() + 3600000
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
