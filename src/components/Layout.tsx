import { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useRouterState } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Trophy, Swords, TrendingUp, Globe, Shield, Gamepad2, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://hokapi.project-n.site';

interface NavLink {
  readonly to: string;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly adminOnly?: boolean;
}

const NAV_LINKS: readonly NavLink[] = [
  { to: '/', label: 'Home', icon: <Gamepad2 className="w-4 h-4" /> },
  { to: '/play', label: 'Play', icon: <Users className="w-4 h-4" /> },
  { to: '/play?tab=matches', label: 'Matches', icon: <Swords className="w-4 h-4" /> },
  { to: '/play?tab=overview', label: 'Standings', icon: <TrendingUp className="w-4 h-4" /> },
  { to: '/play?tab=leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
  { to: '/play?tab=leagues', label: 'Leagues', icon: <Globe className="w-4 h-4" /> },
  { to: '/admin', label: 'Admin', icon: <Shield className="w-4 h-4" />, adminOnly: true },
] as const;

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function handleGoogleLogin() {
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  window.open(
    `${API_BASE}/api/auth/google`,
    'google-login',
    `width=${width},height=${height},left=${left},top=${top}`,
  );
}

export function Layout() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  // Listen for Google OAuth callback messages
  const handleOAuthMessage = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const { token, user: oauthUser, refreshToken } = event.data ?? {};
      if (token && oauthUser) {
        login(token, oauthUser, refreshToken);
      }
    },
    [login],
  );

  useEffect(() => {
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [handleOAuthMessage]);

  const visibleLinks = NAV_LINKS.filter(
    (link) => !link.adminOnly || user?.isAdmin,
  );

  function isActive(to: string): boolean {
    const [path] = to.split('?');
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#07090f' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b border-white/[0.06]"
        style={{ background: '#07090fee', backdropFilter: 'blur(16px)' }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-xs text-black"
                style={{
                  background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                }}
              >
                IKL
              </div>
              <span className="font-display font-black text-white text-sm tracking-wide group-hover:text-amber-400 transition-colors">
                IKL Fantasy
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {visibleLinks.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Auth section (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black"
                        style={{
                          background: 'rgba(245,158,11,0.15)',
                          color: '#F59E0B',
                        }}
                      >
                        {user.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                    )}
                    <span className="text-xs font-bold text-gray-400 max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:bg-white/[0.08]"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <GoogleIcon />
                  Login with Google
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-400" />
              ) : (
                <Menu className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ───────────────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-white/[0.06]"
            >
              <nav className="px-4 py-3 space-y-1">
                {visibleLinks.map((link) => {
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        active
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                      }`}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  );
                })}

                {/* Mobile auth */}
                <div className="pt-3 mt-2 border-t border-white/[0.06]">
                  {isAuthenticated && user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-4 py-2">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full border border-white/10"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                            style={{
                              background: 'rgba(245,158,11,0.15)',
                              color: '#F59E0B',
                            }}
                          >
                            {user.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white text-sm font-bold truncate">
                            {user.name}
                          </p>
                          <p className="text-gray-600 text-xs truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <GoogleIcon />
                      Login with Google
                    </button>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 text-xs font-bold">
            IKL Fantasy &middot; Indonesia King&apos;s League &middot;{' '}
            {new Date().getFullYear()}
          </p>
          <p className="text-gray-700 text-[10px] mt-1">
            Built for the IKL community. Not affiliated with Honor of Kings or
            Moonton.
          </p>
        </div>
      </footer>
    </div>
  );
}
