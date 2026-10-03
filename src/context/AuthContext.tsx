import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  correctGuesses: number;
  longestStreak: number;
  personalBest: number;
  createdAt: string;
  matchHistory: {
    roomId: string;
    roomName: string;
    mode: 'friends' | 'ai' | 'public';
    date: string;
    rank: number;
    totalPlayers: number;
    score: number;
    wordGuessedCount: number;
    isWinner: boolean;
  }[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string, avatar: string) => Promise<{ success: boolean; error?: string }>;
  playAsGuest: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: { username?: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('picto_buzz_token');
    const savedUser = localStorage.getItem('picto_buzz_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify with server in background
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.user) {
              setUser(data.user);
              localStorage.setItem('picto_buzz_user', JSON.stringify(data.user));
            }
          })
          .catch(() => {});
      } catch (e) {
        localStorage.removeItem('picto_buzz_token');
        localStorage.removeItem('picto_buzz_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('picto_buzz_token', data.token);
      localStorage.setItem('picto_buzz_user', JSON.stringify(data.user));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  };

  const register = async (username: string, email: string, password: string, avatar: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, avatar })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('picto_buzz_token', data.token);
      localStorage.setItem('picto_buzz_user', JSON.stringify(data.user));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  };

  const playAsGuest = async () => {
    try {
      const res = await fetch('/api/auth/guest', {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to create guest user' };
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('picto_buzz_token', data.token);
      localStorage.setItem('picto_buzz_user', JSON.stringify(data.user));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('picto_buzz_token');
    localStorage.removeItem('picto_buzz_user');
  };

  const updateProfile = async (updates: { username?: string; avatar?: string }) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Update failed' };
      }
      setUser(data.user);
      localStorage.setItem('picto_buzz_user', JSON.stringify(data.user));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('picto_buzz_user', JSON.stringify(data.user));
      }
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        playAsGuest,
        logout,
        updateProfile,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
