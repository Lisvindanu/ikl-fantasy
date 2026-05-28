import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://hokapi.project-n.site';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  token: string | null;
  contributorId: string | null;
  user: User | null;
  login: (token: string, user: User, refreshToken?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  refreshAccessToken: () => Promise<string | null>;
  authFetch: (url: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [contributorId, setContributorId] = useState<string | null>(() => localStorage.getItem('contributorId'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Track whether a refresh is in progress to avoid concurrent refreshes
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const login = useCallback((newToken: string, newUser: User, refreshToken?: string) => {
    setToken(newToken);
    setContributorId(newUser.id);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('contributorId', newUser.id);
    localStorage.setItem('user', JSON.stringify(newUser));
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }, []);

  const logout = useCallback(async () => {
    const rt = localStorage.getItem('refreshToken');

    // Revoke refresh token on server (fire and forget)
    if (rt) {
      fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      }).catch(() => { /* ignore */ });
    }

    setToken(null);
    setContributorId(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('contributorId');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    // If a refresh is already in progress, wait for it
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const rt = localStorage.getItem('refreshToken');
    if (!rt) {
      logout();
      return null;
    }

    const promise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rt }),
        });

        if (!res.ok) {
          logout();
          return null;
        }

        const data = await res.json();
        const newToken = data.token as string;
        const newRefreshToken = data.refreshToken as string;

        setToken(newToken);
        localStorage.setItem('token', newToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        return newToken;
      } catch {
        logout();
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = promise;
    return promise;
  }, [logout]);

  // Wrapper around fetch that auto-retries on 401 using refresh token
  const authFetch = useCallback(async (url: string, init?: RequestInit): Promise<Response> => {
    const currentToken = localStorage.getItem('token');
    const headers = new Headers(init?.headers);
    if (currentToken) {
      headers.set('Authorization', `Bearer ${currentToken}`);
    }

    const response = await fetch(url, { ...init, headers });

    if (response.status === 401 && localStorage.getItem('refreshToken')) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        return fetch(url, { ...init, headers });
      }
    }

    return response;
  }, [refreshAccessToken]);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, contributorId, user, login, logout, isAuthenticated, refreshAccessToken, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
