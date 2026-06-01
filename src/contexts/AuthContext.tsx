import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://hokapi.project-n.site';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
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
  // User data still stored in localStorage (not sensitive — just display info)
  // Tokens are now in httpOnly cookies — we only track "logged in" state here
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [contributorId, setContributorId] = useState<string | null>(() => localStorage.getItem('contributorId'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const login = useCallback((newToken: string, newUser: User) => {
    // Token is set as httpOnly cookie by the server — we just track state
    setToken(newToken);
    setContributorId(newUser.id);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('contributorId', newUser.id);
    localStorage.setItem('user', JSON.stringify(newUser));
  }, []);

  const logout = useCallback(async () => {
    // Server clears httpOnly cookies via Set-Cookie
    fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => { /* ignore */ });

    setToken(null);
    setContributorId(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('contributorId');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const promise = (async () => {
      try {
        // Refresh token is in httpOnly cookie — sent automatically
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        if (!res.ok) {
          logout();
          return null;
        }

        const data = await res.json();
        const newToken = data.token as string;

        setToken(newToken);
        localStorage.setItem('token', newToken);

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

  // Wrapper around fetch that sends httpOnly cookies and auto-retries on 401
  const authFetch = useCallback(async (url: string, init?: RequestInit): Promise<Response> => {
    const response = await fetch(url, { ...init, credentials: 'include' });

    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return fetch(url, { ...init, credentials: 'include' });
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
