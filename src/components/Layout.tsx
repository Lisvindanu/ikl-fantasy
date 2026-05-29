import { useState, useEffect } from 'react';
import { Outlet, Link, useRouterState } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Shield, Gamepad2, Users } from 'lucide-react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
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
  { to: '/admin', label: 'Admin', icon: <Shield className="w-4 h-4" />, adminOnly: true },
] as const;

export function Layout() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  const visibleLinks = NAV_LINKS.filter(
    (link) => !link.adminOnly || user?.isAdmin,
  );

  function isActive(to: string): boolean {
    if (to === '/') return currentPath === '/';
    return currentPath === to || currentPath.startsWith(to + '/');
  }

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');
      login(data.token, data.contributor, data.refreshToken);
    } catch (err) {
      console.error('Google login failed:', err);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#07090f' }}>
      <header
        className="sticky top-0 z-40 border-b border-white/[0.06]"
        style={{ background: '#07090fee', backdropFilter: 'blur(16px)' }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-xs text-black"
                style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)' }}
              >
                IKL
              </div>
              <span className="font-display font-black text-white text-sm tracking-wide group-hover:text-amber-400 transition-colors">
                IKL Fantasy
              </span>
            </Link>

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
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}
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
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.error('Google login error')}
                  size="medium"
                  theme="filled_black"
                  shape="pill"
                  text="signin_with"
                />
              )}
            </div>

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

                <div className="pt-3 mt-2 border-t border-white/[0.06]">
                  {isAuthenticated && user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-4 py-2">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name}
                            className="w-8 h-8 rounded-full border border-white/10"
                            referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                            {user.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white text-sm font-bold truncate">{user.name}</p>
                          <p className="text-gray-600 text-xs truncate">{user.email}</p>
                        </div>
                      </div>
                      <button onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center py-2">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => console.error('Google login error')}
                        size="large"
                        theme="filled_black"
                        width="280"
                      />
                    </div>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/[0.06] py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 text-xs font-bold">
            IKL Fantasy &middot; Indonesia King's Laga &middot; {new Date().getFullYear()}
          </p>
          <p className="text-gray-700 text-[10px] mt-1">
            Built for the IKL community. Not affiliated with Honor of Kings.
          </p>
        </div>
      </footer>
    </div>
  );
}
