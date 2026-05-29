import { LayoutDashboard, Swords, Users, Calendar, ShieldCheck, Wrench, CheckCircle2, Clock } from 'lucide-react';
import type { IKLSeason, IKLTeam, IKLPlayer, IKLMatch, SeasonMeta } from '../../api/fantasy';

// ── Types ────────────────────────────────────────────────────────────────────

export type AdminSection = 'overview' | 'matches' | 'players' | 'season' | 'admins' | 'tools';
export type MatchFilter = 'all' | 'upcoming' | 'live' | 'completed' | 'postponed';

export interface NavItem {
  readonly id: AdminSection;
  readonly label: string;
  readonly icon: React.ReactNode;
}

/** Props shared by all section renderers */
export interface AdminSectionProps {
  season: (IKLSeason & { teams: IKLTeam[] }) | null;
  players: IKLPlayer[];
  matches: IKLMatch[];
  seasonMeta: SeasonMeta | null;
  allSeasons: IKLSeason[];
  selectedSeasonId: number | null;
  onSwitchSeason: (id: number) => void;
  onRefreshMatches: () => void;
  onSetMatches: React.Dispatch<React.SetStateAction<IKLMatch[]>>;
  onSetPlayers: React.Dispatch<React.SetStateAction<IKLPlayer[]>>;
  onSetAllSeasons: React.Dispatch<React.SetStateAction<IKLSeason[]>>;
  onSetSelectedSeasonId: React.Dispatch<React.SetStateAction<number | null>>;
}

// ── Constants ────────────────────────────────────────────────────────────────

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'matches', label: 'Matches', icon: <Swords className="w-4 h-4" /> },
  { id: 'players', label: 'Players', icon: <Users className="w-4 h-4" /> },
  { id: 'season', label: 'Season', icon: <Calendar className="w-4 h-4" /> },
  { id: 'admins', label: 'Admins', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'tools', label: 'Tools', icon: <Wrench className="w-4 h-4" /> },
] as const;

export const STATUS_CONFIG = {
  active: { label: 'LIVE', color: '#22C55E', bg: 'bg-green-500/15', border: 'border-green-500/30', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  upcoming: { label: 'UPCOMING', color: '#F59E0B', bg: 'bg-amber-500/15', border: 'border-amber-500/30', icon: <Clock className="w-3.5 h-3.5" /> },
  completed: { label: 'COMPLETED', color: '#6B7280', bg: 'bg-white/6', border: 'border-white/10', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
} as const;

export const SECTION_TITLES: Record<AdminSection, string> = {
  overview: 'Dashboard Overview',
  matches: 'Match Management',
  players: 'Player Database',
  season: 'Season Settings',
  admins: 'Admin Management',
  tools: 'Tools & Utilities',
};

// ── Match filter helpers ─────────────────────────────────────────────────────

export function filterMatches(matches: readonly IKLMatch[], filter: MatchFilter, weekFilter: number): readonly IKLMatch[] {
  return matches.filter(m => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (weekFilter > 0 && m.week !== weekFilter) return false;
    return true;
  });
}

export function getStatusCounts(matches: readonly IKLMatch[]): Record<MatchFilter, number> {
  const counts: Record<MatchFilter, number> = { all: matches.length, upcoming: 0, live: 0, completed: 0, postponed: 0 };
  for (const m of matches) {
    if (m.status in counts) counts[m.status as Exclude<MatchFilter, 'all'>]++;
  }
  return counts;
}

export function getStatusConfig(status: string) {
  return STATUS_CONFIG[(status as keyof typeof STATUS_CONFIG)] || STATUS_CONFIG.active;
}
