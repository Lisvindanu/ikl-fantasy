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

  // Season list & switcher
  const [allSeasons, setAllSeasons] = useState<IKLSeason[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);

  // Data state
  const [season, setSeason] = useState<(IKLSeason & { teams: IKLTeam[] }) | null>(null);
  const [players, setPlayers] = useState<IKLPlayer[]>([]);
  const [matches, setMatches] = useState<IKLMatch[]>([]);
  const [seasonMeta, setSeasonMeta] = useState<SeasonMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Seed state (for empty-state CTA)
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  // Load all seasons on mount
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const seasons = await fantasyApi.getSeasons();
        setAllSeasons(seasons);
        if (seasons.length > 0) setSelectedSeasonId(seasons[0].id);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [isAdmin]);

  // Load season data when selectedSeasonId changes
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin || !selectedSeasonId) return;
    loadSeasonData(selectedSeasonId);
  }, [isAdmin, selectedSeasonId, loadSeasonData]);

  function switchSeason(id: number) {
    setSelectedSeasonId(id);
  }

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
    if (!window.confirm('Seed IKL Spring 2026 data? This will create a new season with teams and players.')) return;
    setSeeding(true);
    setSeedMsg('');
    try {
      const result = await fantasyApi.adminSeedIklFull();
      setSeedMsg(`Seeded! Season ${result.seasonId}, ${result.teams} teams, ${result.players} players.`);
      const seasons = await fantasyApi.getSeasons();
      setAllSeasons(seasons);
      if (result.seasonId) setSelectedSeasonId(result.seasonId);
    } catch (err) {
      setSeedMsg(err instanceof Error ? err.message : 'Failed to seed');
    }
    setSeeding(false);
  }

  // ── Auth guards ────────────────────────────────────────────────────────────

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#07090f] flex items-center justify-center px-4">
      <div className="text-center">
        <Shield className="w-12 h-12 text-gray-700 mx-auto mb-3" />
        <p className="text-white font-black text-lg">Login Required</p>
        <p className="text-gray-500 text-sm mt-1">You must be logged in with an admin account</p>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-[#07090f] flex items-center justify-center px-4">
      <div className="text-center">
        <Shield className="w-12 h-12 text-red-900/50 mx-auto mb-3" />
        <p className="text-white font-black text-lg">Access Denied</p>
        <p className="text-gray-500 text-sm mt-1">Your account doesn't have admin privileges</p>
      </div>
    </div>
  );

  // ── Shared props for sections ──────────────────────────────────────────────

  const sectionProps: AdminSectionProps = {
    season, players, matches, seasonMeta,
    allSeasons, selectedSeasonId,
    onSwitchSeason: switchSeason,
    onRefreshMatches: refreshMatches,
    onSetMatches: setMatches,
    onSetPlayers: setPlayers,
    onSetAllSeasons: setAllSeasons,
    onSetSelectedSeasonId: setSelectedSeasonId,
  };

  const SECTION_RENDERERS: Record<AdminSection, () => React.ReactNode> = {
    overview: () => <OverviewSection {...sectionProps} />,
    matches: () => <MatchesSection {...sectionProps} />,
    players: () => <PlayersPanel players={players} />,
    season: () => <SeasonSection {...sectionProps} />,
    admins: () => <AdminManagementPanel />,
    tools: () => <ToolsSection {...sectionProps} />,
  };

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen text-white" style={{ background: '#07090f' }}>
      {/* Mobile header */}
      <div className="lg:hidden border-b border-white/6 sticky top-0 z-30" style={{ background: '#07090f' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-400" />
            <div>
              <h1 className="text-white font-black text-sm leading-none">Fantasy Admin</h1>
              <div className="mt-1">
                <SeasonSwitcher allSeasons={allSeasons} selectedSeasonId={selectedSeasonId} onSwitch={switchSeason} compact />
              </div>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(v => !v)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            {mobileMenuOpen ? <X className="w-5 h-5 text-gray-400" /> : <Menu className="w-5 h-5 text-gray-400" />}
          </button>
        </div>

        {!mobileMenuOpen && (
          <div className="flex overflow-x-auto px-2 pb-2 gap-1 no-scrollbar">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => navigateTo(item.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: activeSection === item.id ? 'rgba(245,158,11,0.12)' : 'transparent',
                  color: activeSection === item.id ? '#F59E0B' : '#6B7280',
                }}>
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}

        {mobileMenuOpen && (
          <div className="px-2 pb-3 space-y-0.5">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => navigateTo(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: activeSection === item.id ? 'rgba(245,158,11,0.1)' : 'transparent',
                  color: activeSection === item.id ? '#F59E0B' : '#9CA3AF',
                  borderLeft: activeSection === item.id ? '3px solid #F59E0B' : '3px solid transparent',
                }}>
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop layout */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 border-r border-white/6 sticky top-0 h-screen"
          style={{ background: '#0a0d14' }}>
          <div className="px-5 py-5 border-b border-white/6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
                <Shield className="w-5 h-5 text-black" />
              </div>
              <h1 className="text-white font-black text-sm leading-none">Fantasy Admin</h1>
            </div>
            <SeasonSwitcher allSeasons={allSeasons} selectedSeasonId={selectedSeasonId} onSwitch={switchSeason} />
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 px-3 mb-2">Navigation</p>
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button key={item.id} onClick={() => navigateTo(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group"
                  style={{
                    background: isActive ? 'rgba(245,158,11,0.08)' : 'transparent',
                    color: isActive ? '#F59E0B' : '#6B7280',
                    borderLeft: isActive ? '3px solid #F59E0B' : '3px solid transparent',
                  }}>
                  <span className={`transition-colors ${isActive ? 'text-amber-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
                    {item.icon}
                  </span>
                  <span className={`transition-colors ${isActive ? '' : 'group-hover:text-gray-300'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-white/6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
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
              <p className="text-gray-500 text-sm mb-6">No seasons exist yet. Seed the first season to get started.</p>
              <button onClick={handleSeedIkl} disabled={seeding}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-black disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
                <Database className="w-4 h-4" />
                {seeding ? 'Seeding...' : 'Seed IKL Spring 2026'}
              </button>
              {seedMsg && (
                <p className={`text-xs font-bold mt-4 ${seedMsg.includes('Seeded') ? 'text-green-400' : 'text-red-400'}`}>
                  {seedMsg}
                </p>
              )}
            </div>
          ) : (
            <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-5xl">
              <div className="mb-6">
                <h2 className="text-xl font-black text-white">{SECTION_TITLES[activeSection]}</h2>
                <p className="text-gray-600 text-xs mt-1">{season.full_name}</p>
              </div>
              {SECTION_RENDERERS[activeSection]()}
            </div>
          )}
        </main>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
