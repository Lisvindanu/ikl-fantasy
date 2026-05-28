import { useState, useEffect, useMemo } from 'react';
import {
  Shield, BarChart2, RefreshCw, Download, Mail,
  LayoutDashboard, Swords, Users, Calendar, ShieldCheck, Wrench,
  Menu, X, Search, Filter,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as fantasyApi from '../api/fantasy';
import type { IKLSeason, IKLTeam, IKLPlayer, IKLMatch, SeasonMeta } from '../api/fantasy';
import { SeasonSettingsPanel } from './fantasy-admin/SeasonSettingsPanel';
import { DashboardMetricsPanel } from './fantasy-admin/DashboardMetricsPanel';
import { AdminManagementPanel } from './fantasy-admin/AdminManagementPanel';
import { MatchAdminCard } from './fantasy-admin/MatchAdminCard';
import { CreateMatchForm } from './fantasy-admin/CreateMatchForm';
import { PlayersPanel } from './fantasy-admin/PlayersPanel';
import { AuditLogPanel } from './fantasy-admin/AuditLogPanel';

// ── Types ────────────────────────────────────────────────────────────────────

type AdminSection = 'overview' | 'matches' | 'players' | 'season' | 'admins' | 'tools';

interface NavItem {
  readonly id: AdminSection;
  readonly label: string;
  readonly icon: React.ReactNode;
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'matches', label: 'Matches', icon: <Swords className="w-4 h-4" /> },
  { id: 'players', label: 'Players', icon: <Users className="w-4 h-4" /> },
  { id: 'season', label: 'Season', icon: <Calendar className="w-4 h-4" /> },
  { id: 'admins', label: 'Admins', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'tools', label: 'Tools', icon: <Wrench className="w-4 h-4" /> },
] as const;

// ── Match filter helpers ─────────────────────────────────────────────────────

type MatchFilter = 'all' | 'upcoming' | 'live' | 'completed' | 'postponed';

function filterMatches(matches: readonly IKLMatch[], filter: MatchFilter, weekFilter: number): readonly IKLMatch[] {
  return matches.filter(m => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (weekFilter > 0 && m.week !== weekFilter) return false;
    return true;
  });
}

function getStatusCounts(matches: readonly IKLMatch[]): Record<MatchFilter, number> {
  const counts: Record<MatchFilter, number> = { all: matches.length, upcoming: 0, live: 0, completed: 0, postponed: 0 };
  for (const m of matches) {
    if (m.status in counts) counts[m.status as Exclude<MatchFilter, 'all'>]++;
  }
  return counts;
}

// ── Main component ───────────────────────────────────────────────────────────

export function FantasyAdminPage() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.isAdmin === true;

  // Data state
  const [season, setSeason] = useState<(IKLSeason & { teams: IKLTeam[] }) | null>(null);
  const [players, setPlayers] = useState<IKLPlayer[]>([]);
  const [matches, setMatches] = useState<IKLMatch[]>([]);
  const [seasonMeta, setSeasonMeta] = useState<SeasonMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quick actions state
  const [recalculating, setRecalculating] = useState(false);
  const [recalcMsg, setRecalcMsg] = useState('');
  const [sendingRecap, setSendingRecap] = useState(false);
  const [recapMsg, setRecapMsg] = useState('');
  const [showRecapConfirm, setShowRecapConfirm] = useState(false);

  // Match filters
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('all');
  const [matchWeek, setMatchWeek] = useState(0);
  const [matchSearch, setMatchSearch] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setLoading(true);
      try {
        const seasons = await fantasyApi.getSeasons();
        if (!seasons.length) return;
        const [s, p, m, meta] = await Promise.all([
          fantasyApi.getSeasonDetail(seasons[0].id),
          fantasyApi.getPlayers(seasons[0].id),
          fantasyApi.getMatches(seasons[0].id),
          fantasyApi.getSeasonMeta(seasons[0].id).catch(() => null),
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
    })();
  }, [isAdmin]);

  // Derived data
  const statusCounts = useMemo(() => getStatusCounts(matches), [matches]);

  const filteredMatches = useMemo(() => {
    const base = filterMatches(matches, matchFilter, matchWeek);
    if (!matchSearch.trim()) return base;
    const q = matchSearch.toLowerCase();
    return base.filter(m =>
      m.team1_short.toLowerCase().includes(q) ||
      m.team2_short.toLowerCase().includes(q) ||
      m.team1_name.toLowerCase().includes(q) ||
      m.team2_name.toLowerCase().includes(q)
    );
  }, [matches, matchFilter, matchWeek, matchSearch]);

  const weeks = useMemo(() => {
    const set = new Set(matches.map(m => m.week));
    return [...set].sort((a, b) => a - b);
  }, [matches]);

  // Handlers
  async function handleRecalculate() {
    if (!season) return;
    setRecalculating(true);
    setRecalcMsg('');
    try {
      await fantasyApi.adminRecalculate(season.id);
      setRecalcMsg('Recalculation done! Player pts + leaderboard updated.');
    } catch {
      setRecalcMsg('Recalculation failed');
    }
    setRecalculating(false);
  }

  async function refreshMatches() {
    if (!season) return;
    const m = await fantasyApi.getMatches(season.id).catch(() => null);
    if (m) setMatches(Array.isArray(m) ? m : []);
  }

  async function handleSendRecap() {
    if (!season) return;
    setSendingRecap(true);
    setRecapMsg('');
    setShowRecapConfirm(false);
    try {
      const result = await fantasyApi.sendWeeklyRecap(season.id);
      setRecapMsg(`Recap sent to ${result.sent} user${result.sent !== 1 ? 's' : ''}!`);
    } catch (err) {
      setRecapMsg(err instanceof Error ? err.message : 'Failed to send recap');
    }
    setSendingRecap(false);
  }

  function navigateTo(section: AdminSection) {
    setActiveSection(section);
    setMobileMenuOpen(false);
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

  // ── Render sections ────────────────────────────────────────────────────────

  function renderOverview() {
    if (!season) return null;
    return (
      <div className="space-y-6">
        {/* Season info card */}
        <div className="rounded-2xl p-5" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-4">
            <BarChart2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-black text-white text-lg">{season.full_name}</div>
              <div className="text-gray-600 text-xs mt-0.5">{season.dates} · {players.length} players · {matches.length} matches</div>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${
              season.status === 'active'
                ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                : 'bg-white/6 text-gray-500 border border-white/10'
            }`}>
              {season.status === 'active' ? 'LIVE' : season.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Dashboard metrics */}
        <DashboardMetricsPanel seasonId={season.id} />

        {/* Quick actions */}
        <div className="rounded-2xl p-5" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
              <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
              {recalculating ? 'Recalculating...' : 'Recalculate All'}
            </button>

            <a
              href={fantasyApi.getExportUrl(season.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/[0.08] transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Download className="w-3.5 h-3.5" /> Export Data
            </a>

            {!showRecapConfirm ? (
              <button
                onClick={() => setShowRecapConfirm(true)}
                disabled={sendingRecap}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                <Mail className="w-3.5 h-3.5" />
                {sendingRecap ? 'Sending...' : 'Send Weekly Recap'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-xs font-bold">Send recap?</span>
                <button
                  onClick={handleSendRecap}
                  disabled={sendingRecap}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-black disabled:opacity-50"
                  style={{ background: 'linear-gradient(90deg,#3B82F6,#2563EB)' }}>
                  {sendingRecap ? 'Sending...' : 'Yes'}
                </button>
                <button
                  onClick={() => setShowRecapConfirm(false)}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Status messages */}
          {recalcMsg && (
            <p className={`text-xs font-bold mt-3 px-3 py-2 rounded-lg ${recalcMsg.includes('done') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
              {recalcMsg}
            </p>
          )}
          {recapMsg && (
            <p className={`text-xs font-bold mt-3 px-3 py-2 rounded-lg ${recapMsg.includes('sent') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
              {recapMsg}
            </p>
          )}
        </div>
      </div>
    );
  }

  function renderMatches() {
    if (!season) return null;
    return (
      <div className="space-y-4">
        {/* Create match form */}
        {season.teams?.length > 0 && (
          <CreateMatchForm
            seasonId={season.id}
            teams={season.teams}
            onCreated={match => {
              setMatches(prev => [match, ...prev]);
            }}
          />
        )}

        {/* Filter bar */}
        <div className="rounded-2xl p-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                value={matchSearch}
                onChange={e => setMatchSearch(e.target.value)}
                placeholder="Search matches..."
                className="w-full pl-10 pr-3 py-2 rounded-lg text-white text-sm outline-none"
                style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>

            {/* Status filter */}
            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'upcoming', 'live', 'completed', 'postponed'] as const).map(f => {
                const count = statusCounts[f];
                const isActive = matchFilter === f;
                const color = f === 'live' ? '#22C55E' : f === 'completed' ? '#3B82F6' : f === 'postponed' ? '#EF4444' : '#F59E0B';
                return (
                  <button
                    key={f}
                    onClick={() => setMatchFilter(f)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: isActive ? `${color}15` : 'rgba(255,255,255,0.04)',
                      color: isActive ? color : '#6B7280',
                      border: isActive ? `1px solid ${color}30` : '1px solid rgba(255,255,255,0.06)',
                    }}>
                    <span className="capitalize">{f}</span>
                    <span className="opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Week filter */}
            {weeks.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-600" />
                <select
                  value={matchWeek}
                  onChange={e => setMatchWeek(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg text-white text-xs font-bold outline-none"
                  style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <option value={0}>All Weeks</option>
                  {weeks.map(w => (
                    <option key={w} value={w}>Week {w}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Match list */}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-600">
            Matches ({filteredMatches.length})
          </h2>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="rounded-2xl p-8 text-center text-gray-600 text-sm" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.06)' }}>
            {matches.length === 0 ? 'No matches yet. Create one above.' : 'No matches match your filters.'}
          </div>
        ) : (
          <div className="space-y-3">
            {[...filteredMatches]
              .sort((a, b) => b.id - a.id)
              .map(match => (
                <MatchAdminCard
                  key={match.id}
                  match={match}
                  players={players}
                  onDelete={() => {
                    setMatches(prev => prev.filter(m => m.id !== match.id));
                  }}
                  onStatsSaved={refreshMatches}
                />
              ))}
          </div>
        )}
      </div>
    );
  }

  function renderPlayers() {
    return <PlayersPanel players={players} />;
  }

  function renderSeason() {
    if (!season) return null;
    return (
      <div className="space-y-6">
        <SeasonSettingsPanel seasonId={season.id} initial={seasonMeta} />

        {/* Season info details */}
        <div className="rounded-2xl p-5" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Season Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: season.full_name },
              { label: 'Status', value: season.status },
              { label: 'Dates', value: season.dates },
              { label: 'Edition', value: season.edition },
              { label: 'Prize Pool', value: season.prize_pool },
              { label: 'Teams', value: String(season.teams?.length ?? 0) },
              { label: 'Players', value: String(players.length) },
              { label: 'Matches', value: String(matches.length) },
              { label: 'Champion', value: season.champion || '-' },
              { label: 'Runner Up', value: season.runner_up || '-' },
              { label: 'Regular MVP', value: season.regular_season_mvp || '-' },
              { label: 'Finals MVP', value: season.finals_mvp || '-' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{item.label}</span>
                <span className="text-sm font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderAdmins() {
    return <AdminManagementPanel />;
  }

  function renderTools() {
    if (!season) return null;
    return (
      <div className="space-y-6">
        {/* Weekly Recap Email */}
        <div className="rounded-2xl p-5" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Weekly Recap Email</h3>
          </div>
          <p className="text-gray-600 text-xs mb-3">
            Send a weekly recap email to all fantasy participants with their rank, points, top performer, and recent results.
          </p>
          {recapMsg && (
            <p className={`text-xs font-bold mb-3 px-3 py-2 rounded-lg ${recapMsg.includes('sent') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
              {recapMsg}
            </p>
          )}
          {showRecapConfirm ? (
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 text-xs font-bold">Send recap to all participants?</span>
              <button
                onClick={handleSendRecap}
                disabled={sendingRecap}
                className="px-4 py-2 rounded-lg text-xs font-bold text-black disabled:opacity-50"
                style={{ background: 'linear-gradient(90deg,#3B82F6,#2563EB)' }}>
                {sendingRecap ? 'Sending...' : 'Yes, Send'}
              </button>
              <button
                onClick={() => setShowRecapConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowRecapConfirm(true)}
              disabled={sendingRecap}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
              <Mail className="w-3.5 h-3.5" />
              {sendingRecap ? 'Sending...' : 'Send Weekly Recap'}
            </button>
          )}
        </div>

        {/* Export */}
        <div className="rounded-2xl p-5" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Download className="w-4 h-4 text-green-400" />
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Export Data</h3>
          </div>
          <p className="text-gray-600 text-xs mb-3">
            Download all season data as JSON including matches, stats, leaderboard, and players.
          </p>
          <a
            href={fantasyApi.getExportUrl(season.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white w-fit hover:bg-white/[0.08] transition-colors"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <Download className="w-3.5 h-3.5" /> Export Season Data
          </a>
        </div>

        {/* Recalculate */}
        <div className="rounded-2xl p-5" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Recalculate Points</h3>
          </div>
          <p className="text-gray-600 text-xs mb-3">
            Recalculate all fantasy points, player totals, and leaderboard rankings from match stats.
          </p>
          {recalcMsg && (
            <p className={`text-xs font-bold mb-3 px-3 py-2 rounded-lg ${recalcMsg.includes('done') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
              {recalcMsg}
            </p>
          )}
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            {recalculating ? 'Recalculating...' : 'Recalculate All'}
          </button>
        </div>

        {/* Audit log */}
        <AuditLogPanel />
      </div>
    );
  }

  const SECTION_RENDERERS: Record<AdminSection, () => React.ReactNode> = {
    overview: renderOverview,
    matches: renderMatches,
    players: renderPlayers,
    season: renderSeason,
    admins: renderAdmins,
    tools: renderTools,
  };

  const SECTION_TITLES: Record<AdminSection, string> = {
    overview: 'Dashboard Overview',
    matches: 'Match Management',
    players: 'Player Database',
    season: 'Season Settings',
    admins: 'Admin Management',
    tools: 'Tools & Utilities',
  };

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen text-white" style={{ background: '#07090f' }}>
      {/* ── Mobile header ─────────────────────────────────────────────────── */}
      <div className="lg:hidden border-b border-white/6 sticky top-0 z-30" style={{ background: '#07090f' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-400" />
            <div>
              <h1 className="text-white font-black text-sm leading-none">Fantasy Admin</h1>
              {season && <p className="text-gray-600 text-[10px]">{season.full_name}</p>}
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            {mobileMenuOpen ? <X className="w-5 h-5 text-gray-400" /> : <Menu className="w-5 h-5 text-gray-400" />}
          </button>
        </div>

        {/* Mobile nav tabs - scrollable */}
        {!mobileMenuOpen && (
          <div className="flex overflow-x-auto px-2 pb-2 gap-1 no-scrollbar">
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0"
                  style={{
                    background: isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
                    color: isActive ? '#F59E0B' : '#6B7280',
                  }}>
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="px-2 pb-3 space-y-0.5">
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: isActive ? 'rgba(245,158,11,0.1)' : 'transparent',
                    color: isActive ? '#F59E0B' : '#9CA3AF',
                    borderLeft: isActive ? '3px solid #F59E0B' : '3px solid transparent',
                  }}>
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Desktop layout: sidebar + content ─────────────────────────────── */}
      <div className="flex min-h-screen">
        {/* Sidebar (desktop only) */}
        <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 border-r border-white/6 sticky top-0 h-screen"
          style={{ background: '#0a0d14' }}>
          {/* Sidebar header */}
          <div className="px-5 py-5 border-b border-white/6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
                <Shield className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-white font-black text-sm leading-none">Fantasy Admin</h1>
                {season && <p className="text-gray-600 text-[10px] mt-0.5">{season.full_name}</p>}
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 px-3 mb-2">Navigation</p>
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
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

          {/* Sidebar footer */}
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

        {/* ── Content area ──────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            </div>
          ) : !season ? (
            <div className="py-20 text-center text-gray-500">No season found. Create one via the API first.</div>
          ) : (
            <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-5xl">
              {/* Section title */}
              <div className="mb-6">
                <h2 className="text-xl font-black text-white">{SECTION_TITLES[activeSection]}</h2>
                <p className="text-gray-600 text-xs mt-1">{season.full_name}</p>
              </div>

              {/* Active section content */}
              {SECTION_RENDERERS[activeSection]()}
            </div>
          )}
        </main>
      </div>

      {/* Hide scrollbar for mobile tabs */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
