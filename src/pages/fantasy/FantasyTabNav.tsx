import { useState, useRef, useEffect } from 'react';
import { Users, Swords, Trophy, Globe, Shield, ChevronDown, ArrowLeft, Wallet, Star, Crown } from 'lucide-react';
import type { Tab, Role } from '../../components/fantasy/types';
import { BUDGET } from '../../components/fantasy/types';
import type { IKLSeason, IKLPlayer } from '../../api/fantasy';

// ── Nav icon by tab ID ───────────────────────────────────────────────────────

function NavIcon({ id, className = 'w-4 h-4' }: { id: Tab; className?: string }) {
  switch (id) {
    case 'draft': return <Users className={className} />;
    case 'matches': return <Swords className={className} />;
    case 'leaderboard': return <Trophy className={className} />;
    case 'leagues': return <Globe className={className} />;
    case 'team': return <Shield className={className} />;
    default: return null;
  }
}

// ── Nav items per mode ───────────────────────────────────────────────────────

interface NavItem { id: Tab; label: string }

const DRAFT_NAV: NavItem[] = [
  { id: 'draft', label: 'Squad' },
  { id: 'matches', label: 'Matches' },
  { id: 'leaderboard', label: 'Ranking' },
  { id: 'leagues', label: 'Leagues' },
];

const TEAM_NAV: NavItem[] = [
  { id: 'team', label: 'My Team' },
  { id: 'matches', label: 'Matches' },
  { id: 'leaderboard', label: 'Ranking' },
  { id: 'leagues', label: 'Leagues' },
];

const BOTH_NAV: NavItem[] = [
  { id: 'draft', label: 'Squad' },
  { id: 'team', label: 'My Team' },
  { id: 'matches', label: 'Matches' },
  { id: 'leaderboard', label: 'Ranking' },
  { id: 'leagues', label: 'Leagues' },
];

function getNavItems(mode: 'player' | 'team' | 'both' | null): NavItem[] {
  switch (mode) {
    case 'player': return DRAFT_NAV;
    case 'team': return TEAM_NAV;
    case 'both': return BOTH_NAV;
    default: return DRAFT_NAV;
  }
}

function getModeLabel(mode: 'player' | 'team' | 'both' | null): string {
  switch (mode) {
    case 'player': return 'DRAFT';
    case 'team': return 'TEAM';
    case 'both': return 'DUAL';
    default: return '';
  }
}

// ── Props ────────────────────────────────────────────────────────────────────

export interface FantasyNavProps {
  tab: Tab;
  setTab: (t: Tab) => void;
  activeMode: 'player' | 'team' | 'both' | null;
  onBackToModeSelector: () => void;
  allSeasons: IKLSeason[];
  selectedSeasonId: number | null;
  onSwitchSeason: (id: number) => void;
}

export interface StatsBarProps {
  activeMode: 'player' | 'team' | 'both' | null;
  budgetLeft: number;
  totalPts: number;
  filledCount: number;
  captainId: number | null;
  picks: Record<Role, IKLPlayer | null>;
  rank: number | null;
}

// ── Season Switcher ──────────────────────────────────────────────────────────

function SeasonSwitcher({ allSeasons, selectedSeasonId, onSwitch }: {
  allSeasons: IKLSeason[];
  selectedSeasonId: number | null;
  onSwitch: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const current = allSeasons.find(s => s.id === selectedSeasonId);
  if (allSeasons.length <= 1) {
    return current ? (
      <span className="text-[10px] font-black tracking-wider uppercase text-gray-500 px-2.5 py-1 rounded-lg"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {current.edition}
      </span>
    ) : null;
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg transition-colors hover:bg-white/5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#9CA3AF' }}>
        {current?.edition || 'Season'}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-52 rounded-xl py-1 shadow-2xl z-50"
          style={{ background: '#14171f', border: '1px solid rgba(255,255,255,0.08)' }}>
          {allSeasons.map(s => (
            <button key={s.id} onClick={() => { onSwitch(s.id); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                s.id === selectedSeasonId ? 'text-amber-400 bg-amber-500/8' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              <div className="flex items-center justify-between">
                <span>{s.edition}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  s.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-gray-600'
                }`}>
                  {s.status === 'active' ? 'LIVE' : s.status?.toUpperCase()}
                </span>
              </div>
              <div className="text-[10px] text-gray-600 mt-0.5">{s.dates}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Desktop Navbar ───────────────────────────────────────────────────────────

export function DesktopTabNav({
  tab, setTab, activeMode, onBackToModeSelector,
  allSeasons, selectedSeasonId, onSwitchSeason,
}: FantasyNavProps) {
  const navItems = getNavItems(activeMode);
  const modeLabel = getModeLabel(activeMode);

  return (
    <div className="sticky top-0 z-20 hidden md:block"
      style={{ background: 'rgba(7,9,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center h-14">
          {/* Logo + Mode */}
          <div className="flex items-center gap-3 mr-8 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FBBF24, #D97706)', boxShadow: '0 2px 8px rgba(245,158,11,0.3)' }}>
              <Trophy className="w-4 h-4 text-black" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-sm tracking-tight">IKL Fantasy</span>
              {modeLabel && (
                <span className="text-[9px] font-black tracking-[0.12em] px-2 py-0.5 rounded-md"
                  style={{
                    background: activeMode === 'team' ? 'rgba(139,92,246,0.15)' : 'rgba(245,158,11,0.12)',
                    color: activeMode === 'team' ? '#A78BFA' : '#F59E0B',
                    border: `1px solid ${activeMode === 'team' ? 'rgba(139,92,246,0.2)' : 'rgba(245,158,11,0.2)'}`,
                  }}>
                  {modeLabel}
                </span>
              )}
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex items-center h-full flex-1">
            {navItems.map(item => {
              const active = tab === item.id;
              return (
                <button key={item.id} onClick={() => setTab(item.id)}
                  className={`flex items-center gap-2 px-5 h-full text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                    active ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-600 hover:text-gray-300'
                  }`}>
                  <NavIcon id={item.id} className={`w-4 h-4 ${active ? 'text-amber-400' : ''}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right: Season + Mode switch */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <SeasonSwitcher allSeasons={allSeasons} selectedSeasonId={selectedSeasonId} onSwitch={onSwitchSeason} />
            <button onClick={onBackToModeSelector}
              className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 hover:text-gray-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5">
              <ArrowLeft className="w-3 h-3" />
              Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stats Bar (desktop, draft mode) ──────────────────────────────────────────

export function StatsBar({ activeMode, budgetLeft, totalPts, filledCount, captainId, picks, rank }: StatsBarProps) {
  if (activeMode === 'team') return null;

  const captainPlayer = captainId
    ? Object.values(picks).find(p => p?.id === captainId)
    : null;
  const budgetPct = (budgetLeft / BUDGET) * 100;

  return (
    <div className="hidden md:block sticky top-14 z-10"
      style={{ background: 'rgba(7,9,15,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-6 h-10 text-xs">
          {/* Budget */}
          <div className="flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5 text-amber-500/60" />
            <span className="text-gray-500 font-bold">Budget</span>
            <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${budgetPct}%`,
                  background: budgetPct < 20 ? '#EF4444' : budgetPct < 50 ? '#F59E0B' : '#22C55E',
                }} />
            </div>
            <span className={`font-black tabular-nums ${budgetPct < 20 ? 'text-red-400' : 'text-white'}`}>
              {budgetLeft}
            </span>
          </div>

          <div className="w-px h-4 bg-white/6" />

          {/* Points */}
          <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-amber-500/60" />
            <span className="text-gray-500 font-bold">Pts</span>
            <span className="text-white font-black tabular-nums">{totalPts}</span>
          </div>

          <div className="w-px h-4 bg-white/6" />

          {/* Rank */}
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500/60" />
            <span className="text-gray-500 font-bold">Rank</span>
            <span className="text-white font-black tabular-nums">{rank ?? '--'}</span>
          </div>

          <div className="w-px h-4 bg-white/6" />

          {/* Squad */}
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-amber-500/60" />
            <span className="text-gray-500 font-bold">Squad</span>
            <span className="text-white font-black tabular-nums">{filledCount}/5</span>
          </div>

          <div className="w-px h-4 bg-white/6" />

          {/* Captain */}
          <div className="flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-amber-500/60" />
            <span className="text-gray-500 font-bold">Cpt</span>
            <span className={`font-black ${captainPlayer ? 'text-amber-400' : 'text-gray-600'}`}>
              {captainPlayer ? captainPlayer.name : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mobile Top Header ────────────────────────────────────────────────────────

export function MobileTopHeader({
  activeMode, onBackToModeSelector,
  allSeasons, selectedSeasonId, onSwitchSeason,
}: Omit<FantasyNavProps, 'tab' | 'setTab'>) {
  const modeLabel = getModeLabel(activeMode);

  return (
    <div className="md:hidden sticky top-0 z-20"
      style={{ background: 'rgba(7,9,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between px-4 h-12">
        <div className="flex items-center gap-2.5">
          <button onClick={onBackToModeSelector}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-gray-500">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FBBF24, #D97706)' }}>
            <Trophy className="w-3 h-3 text-black" />
          </div>
          <span className="text-white font-black text-sm">Fantasy</span>
          {modeLabel && (
            <span className="text-[8px] font-black tracking-[0.1em] px-1.5 py-0.5 rounded"
              style={{
                background: activeMode === 'team' ? 'rgba(139,92,246,0.15)' : 'rgba(245,158,11,0.12)',
                color: activeMode === 'team' ? '#A78BFA' : '#F59E0B',
              }}>
              {modeLabel}
            </span>
          )}
        </div>
        <SeasonSwitcher allSeasons={allSeasons} selectedSeasonId={selectedSeasonId} onSwitch={onSwitchSeason} />
      </div>
    </div>
  );
}

// ── Mobile Bottom Nav ────────────────────────────────────────────────────────

export function MobileBottomNav({ tab, setTab, activeMode }: {
  tab: Tab;
  setTab: (t: Tab) => void;
  activeMode: 'player' | 'team' | 'both' | null;
}) {
  const navItems = getNavItems(activeMode);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden safe-area-bottom"
      style={{ background: 'rgba(7,9,15,0.95)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex justify-around items-center">
        {navItems.map(item => {
          const active = tab === item.id;
          return (
            <button key={item.id} onClick={() => setTab(item.id)}
              className="flex flex-col items-center gap-0.5 py-2 px-3 relative transition-colors"
              style={{ color: active ? '#F59E0B' : '#4B5563' }}>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #FBBF24, #D97706)' }} />
              )}
              <NavIcon id={item.id} className="w-5 h-5" />
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
