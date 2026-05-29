import { useState, useEffect, useCallback } from 'react';
import { Shield, Menu, X, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as fantasyApi from '../api/fantasy';
import type { IKLSeason, IKLTeam, IKLPlayer, IKLMatch, SeasonMeta } from '../api/fantasy';
import { type AdminSection, NAV_ITEMS, SECTION_TITLES, type AdminSectionProps } from './fantasy-admin/adminConstants';
import { SeasonSwitcher } from './fantasy-admin/SeasonSwitcher';
import { OverviewSection } from './fantasy-admin/OverviewSection';
import { MatchesSection } from './fantasy-admin/MatchesSection';
import { SeasonSection } from './fantasy-admin/SeasonSection';
import { ToolsSection } from './fantasy-admin/ToolsSection';
import { PlayersPanel } from './fantasy-admin/PlayersPanel';
import { AdminManagementPanel } from './fantasy-admin/AdminManagementPanel';

export function FantasyAdminPage() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.isAdmin === true;

  const [allSeasons, setAllSeasons] = useState<IKLSeason[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const [season, setSeason] = useState<(IKLSeason & { teams: IKLTeam[] }) | null>(null);
  const [players, setPlayers] = useState<IKLPlayer[]>([]);
  const [matches, setMatches] = useState<IKLMatch[]>([]);
  const [seasonMeta, setSeasonMeta] = useState<SeasonMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const seasons = await fantasyApi.getSeasons();
        setAllSeasons(seasons);
        if (seasons.length > 0) setSelectedSeasonId(seasons[0].id);
      } catch (e) { console.error(e); }
    })();
  }, [isAdmin]);

  const loadSeasonData = useCallback(async (seasonId: number) => {
    setLoading(true);
    try {
      const [s, p, m, meta] = await Promise.all([
        fantasyApi.getSeasonDetail(seasonId),
        fantasyApi.getPlayers(seasonId),
        fantasyApi.getMatches(seasonId),
        fantasyApi.getSeasonMeta(seasonId).catch(() => null),
      ]);
      setSeason(s);
      setPlayers(Array.isArray(p) ? p : []);
      setMatches(Array.isArray(m) ? m : []);
      setSeasonMeta(meta);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isAdmin || !selectedSeasonId) return;
    loadSeasonData(selectedSeasonId);
  }, [isAdmin, selectedSeasonId, loadSeasonData]);

  function switchSeason(id: number) { setSelectedSeasonId(id); }

  async function refreshMatches() {
    if (!season) return;
    const m = await fantasyApi.getMatches(season.id).catch(() => null);
    if (m) setMatches(Array.isArray(m) ? m : []);
  }

  function navigateTo(section: AdminSection) {
    setActiveSection(section);
    setMobileMenuOpen(false);
  }

  async function handleSeedIkl() {
    if (!window.confirm('Seed IKL Spring 2026 data?')) return;
    setSeeding(true); setSeedMsg('');
    try {
      const result = await fantasyApi.adminSeedIklFull();
      setSeedMsg(`Seeded! Season ${result.seasonId}, ${result.teams} teams, ${result.players} players.`);
      const seasons = await fantasyApi.getSeasons();
      setAllSeasons(seasons);
      if (result.seasonId) setSelectedSeasonId(result.seasonId);
    } catch (err) { setSeedMsg(err instanceof Error ? err.message : 'Failed'); }
    setSeeding(false);
  }

  // Auth guards
  if (!isAuthenticated) return <AuthGuard icon="lock" title="Login Required" sub="You must be logged in with an admin account" />;
  if (!isAdmin) return <AuthGuard icon="deny" title="Access Denied" sub="Your account doesn't have admin privileges" />;

  const sectionProps: AdminSectionProps = {
    season, players, matches, seasonMeta, allSeasons, selectedSeasonId,
    onSwitchSeason: switchSeason, onRefreshMatches: refreshMatches,
    onSetMatches: setMatches, onSetPlayers: setPlayers,
    onSetAllSeasons: setAllSeasons, onSetSelectedSeasonId: setSelectedSeasonId,
  };

  const SECTION_RENDERERS: Record<AdminSection, () => React.ReactNode> = {
    overview: () => <OverviewSection {...sectionProps} />,
    matches: () => <MatchesSection {...sectionProps} />,
    players: () => <PlayersPanel players={players} />,
    season: () => <SeasonSection {...sectionProps} />,
    admins: () => <AdminManagementPanel />,
    tools: () => <ToolsSection {...sectionProps} />,
  };

  return (
    <div className="admin-shell min-h-screen text-white" style={{ background: '#07090f' }}>

      {/* ── Mobile header ──────────────────────────────────────────────── */}
      <div className="lg:hidden sticky top-0 z-30" style={{ background: 'rgba(7,9,15,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
              <Shield className="w-4 h-4 text-black" />
            </div>
            <div>
              <h1 className="text-white font-black text-sm leading-none">Admin</h1>
              <div className="mt-1">
                <SeasonSwitcher allSeasons={allSeasons} selectedSeasonId={selectedSeasonId} onSwitch={switchSeason} compact />
              </div>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(v => !v)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            {mobileMenuOpen ? <X className="w-5 h-5 text-gray-400" /> : <Menu className="w-5 h-5 text-gray-400" />}
          </button>
        </div>

        {!mobileMenuOpen ? (
          <div className="flex overflow-x-auto px-2 pb-2 gap-1 no-scrollbar">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => navigateTo(item.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: activeSection === item.id ? 'rgba(245,158,11,0.12)' : 'transparent',
                  color: activeSection === item.id ? '#F59E0B' : '#6B7280',
                }}>
                {item.icon}{item.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="px-3 pb-3 space-y-0.5">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => navigateTo(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: activeSection === item.id ? 'rgba(245,158,11,0.08)' : 'transparent',
                  color: activeSection === item.id ? '#F59E0B' : '#9CA3AF',
                }}>
                {item.icon}{item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop layout ─────────────────────────────────────────────── */}
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 sticky top-0 h-screen overflow-visible"
          style={{
            background: 'linear-gradient(180deg, #0c0f18 0%, #080a11 100%)',
            borderRight: '1px solid rgba(255,255,255,0.04)',
          }}>

          {/* Logo area */}
          <div className="px-5 pt-6 pb-5 overflow-visible relative z-20" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)',
                  boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
                }}>
                <Shield className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-white font-black text-sm leading-none tracking-tight">Fantasy</h1>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-500/60">Admin Panel</span>
              </div>
            </div>
            <SeasonSwitcher allSeasons={allSeasons} selectedSeasonId={selectedSeasonId} onSwitch={switchSeason} />
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-700 px-3 mb-3">Navigation</p>
            {NAV_ITEMS.map(item => {
              const active = activeSection === item.id;
              return (
                <button key={item.id} onClick={() => navigateTo(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all group relative"
                  style={{
                    background: active ? 'rgba(245,158,11,0.06)' : 'transparent',
                    color: active ? '#F59E0B' : '#6B7280',
                  }}>
                  {/* Active indicator bar */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{ background: 'linear-gradient(180deg, #FBBF24, #D97706)', boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />
                  )}
                  <span className={`transition-colors ${active ? 'text-amber-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
                    {item.icon}
                  </span>
                  <span className={`transition-colors ${active ? '' : 'group-hover:text-gray-300'}`}>
                    {item.label}
                  </span>
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" style={{ boxShadow: '0 0 6px rgba(245,158,11,0.6)' }} />}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black"
                style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.08))', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.15)' }}>
                {user?.name?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-bold truncate">{user?.name ?? 'Admin'}</p>
                <p className="text-gray-700 text-[10px] truncate">{user?.email ?? ''}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            </div>
          ) : !season ? (
            <div className="py-20 text-center px-4">
              <Database className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-white font-black text-lg mb-2">No Season Found</p>
              <p className="text-gray-500 text-sm mb-6">Seed the first season to get started.</p>
              <button onClick={handleSeedIkl} disabled={seeding}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-black disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)', boxShadow: '0 4px 16px rgba(245,158,11,0.25)' }}>
                <Database className="w-4 h-4" />
                {seeding ? 'Seeding...' : 'Seed IKL Spring 2026'}
              </button>
              {seedMsg && <p className={`text-xs font-bold mt-4 ${seedMsg.includes('Seeded') ? 'text-green-400' : 'text-red-400'}`}>{seedMsg}</p>}
            </div>
          ) : (
            <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-5xl">
              <div className="mb-6">
                <h2 className="text-xl font-black text-white tracking-tight">{SECTION_TITLES[activeSection]}</h2>
                <p className="text-gray-600 text-xs mt-0.5 font-medium">{season.full_name}</p>
              </div>
              {SECTION_RENDERERS[activeSection]()}
            </div>
          )}
        </main>
      </div>

      {/* Admin-wide styles */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .admin-input:focus {
          border-color: rgba(245,158,11,0.35) !important;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 4px rgba(0,0,0,0.3) !important;
        }
        .admin-input:hover:not(:focus) {
          border-color: rgba(255,255,255,0.12) !important;
        }
        .admin-input::placeholder { color: rgba(255,255,255,0.15); }
        .admin-shell {
          background-image: radial-gradient(ellipse at 0% 0%, rgba(245,158,11,0.02) 0%, transparent 50%);
        }
      `}</style>
    </div>
  );
}

function AuthGuard({ icon, title, sub }: { icon: 'lock' | 'deny'; title: string; sub: string }) {
  return (
    <div className="min-h-screen bg-[#07090f] flex items-center justify-center px-4">
      <div className="text-center">
        <Shield className={`w-12 h-12 mx-auto mb-3 ${icon === 'deny' ? 'text-red-900/50' : 'text-gray-700'}`} />
        <p className="text-white font-black text-lg">{title}</p>
        <p className="text-gray-500 text-sm mt-1">{sub}</p>
      </div>
    </div>
  );
}
