import { useState, useMemo } from 'react';
import { Search, CalendarDays, CircleDot, CheckCircle2, Clock, AlertTriangle, Inbox, ListFilter, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AdminSectionProps, MatchFilter } from './adminConstants';
import { filterMatches, getStatusCounts } from './adminConstants';
import { CreateMatchForm } from './CreateMatchForm';
import { MatchAdminCard } from './MatchAdminCard';
import { AdminPanel, Input, Select } from './shared';

// ── Filter chip configuration ────────────────────────────────────────────────

interface FilterChipConfig {
  readonly key: MatchFilter;
  readonly label: string;
  readonly color: string;
  readonly icon: React.ReactNode;
}

const FILTER_CHIPS: readonly FilterChipConfig[] = [
  { key: 'all',        label: 'All',        color: '#F59E0B', icon: <ListFilter className="w-3 h-3" /> },
  { key: 'upcoming',   label: 'Upcoming',   color: '#F59E0B', icon: <Clock className="w-3 h-3" /> },
  { key: 'live',       label: 'Live',       color: '#22C55E', icon: <CircleDot className="w-3 h-3" /> },
  { key: 'completed',  label: 'Completed',  color: '#3B82F6', icon: <CheckCircle2 className="w-3 h-3" /> },
  { key: 'postponed',  label: 'Postponed',  color: '#EF4444', icon: <AlertTriangle className="w-3 h-3" /> },
] as const;

// ── Filter chip component ────────────────────────────────────────────────────

function FilterChip({
  config,
  count,
  isActive,
  onClick,
}: {
  config: FilterChipConfig;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const { label, color, icon } = config;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
      style={{
        background: isActive
          ? `linear-gradient(180deg, ${color}18 0%, ${color}08 100%)`
          : 'rgba(255,255,255,0.02)',
        color: isActive ? color : '#4B5563',
        border: isActive
          ? `1px solid ${color}30`
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isActive
          ? `0 0 12px -4px ${color}40, inset 0 1px 0 rgba(255,255,255,0.04)`
          : 'none',
      }}
    >
      {icon}
      <span>{label}</span>
      <span
        className="ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black"
        style={{
          background: isActive ? `${color}15` : 'rgba(255,255,255,0.04)',
          color: isActive ? color : '#6B7280',
        }}
      >
        {count}
      </span>
    </button>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasMatches }: { hasMatches: boolean }) {
  return (
    <AdminPanel className="p-10">
      <div className="flex flex-col items-center justify-center text-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.03) 100%)',
            border: '1px solid rgba(245,158,11,0.15)',
          }}
        >
          <Inbox className="w-5 h-5 text-amber-500/60" />
        </div>
        <p className="text-sm font-medium text-gray-500">
          {hasMatches
            ? 'No matches match your current filters.'
            : 'No matches yet. Create one above to get started.'}
        </p>
      </div>
    </AdminPanel>
  );
}

// ── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-amber-500/60" />
        <h2 className="text-xs font-black uppercase tracking-[0.15em] text-gray-500">
          Matches
        </h2>
      </div>
      <span
        className="px-2 py-0.5 rounded-lg text-[10px] font-black text-amber-500/80"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.12)' }}
      >
        {count}
      </span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function MatchesSection({
  season,
  players,
  matches,
  onSetMatches,
  onRefreshMatches,
}: AdminSectionProps) {
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('all');
  const [matchWeek, setMatchWeek] = useState(0);
  const [matchSearch, setMatchSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const statusCounts = useMemo(() => getStatusCounts(matches), [matches]);

  const filteredMatches = useMemo(() => {
    setPage(0);
    const base = filterMatches(matches, matchFilter, matchWeek);
    if (!matchSearch.trim()) return base;
    const q = matchSearch.toLowerCase();
    return base.filter(
      m =>
        m.team1_short.toLowerCase().includes(q) ||
        m.team2_short.toLowerCase().includes(q) ||
        m.team1_name.toLowerCase().includes(q) ||
        m.team2_name.toLowerCase().includes(q),
    );
  }, [matches, matchFilter, matchWeek, matchSearch]);

  const totalPages = Math.ceil(filteredMatches.length / PAGE_SIZE);
  const paginatedMatches = useMemo(() => {
    const sorted = [...filteredMatches].sort((a, b) => b.id - a.id);
    return sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }, [filteredMatches, page]);

  const weeks = useMemo(() => {
    const set = new Set(matches.map(m => m.week));
    return [...set].sort((a, b) => a - b);
  }, [matches]);

  if (!season) return null;

  return (
    <div className="space-y-4">
      {/* Create match form */}
      {season.teams?.length > 0 && (
        <CreateMatchForm
          seasonId={season.id}
          teams={season.teams}
          onCreated={match => onSetMatches(prev => [match, ...prev])}
        />
      )}

      {/* Filter bar */}
      <AdminPanel className="p-4" glow="rgba(245,158,11,0.04)">
        <div className="flex flex-col gap-3">
          {/* Search + Week selector row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              <Input
                value={matchSearch}
                onChange={e => setMatchSearch(e.target.value)}
                placeholder="Search teams..."
                className="w-full pl-10"
              />
            </div>

            {weeks.length > 0 && (
              <div className="flex items-center gap-2.5 shrink-0">
                <CalendarDays className="w-4 h-4 text-gray-600" />
                <Select
                  value={matchWeek}
                  onChange={e => setMatchWeek(Number(e.target.value))}
                >
                  <option value={0}>All Weeks</option>
                  {weeks.map(w => (
                    <option key={w} value={w}>
                      Week {w}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          {/* Filter chips row */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTER_CHIPS.map(chip => (
              <FilterChip
                key={chip.key}
                config={chip}
                count={statusCounts[chip.key]}
                isActive={matchFilter === chip.key}
                onClick={() => setMatchFilter(chip.key)}
              />
            ))}
          </div>
        </div>
      </AdminPanel>

      {/* Results header + pagination */}
      <div className="flex items-center justify-between px-1">
        <SectionHeader count={filteredMatches.length} />
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="p-1.5 rounded-lg disabled:opacity-20 hover:bg-white/5 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <span className="text-[10px] text-gray-600 font-bold px-2">
              {page + 1} / {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg disabled:opacity-20 hover:bg-white/5 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {/* Match list */}
      {filteredMatches.length === 0 ? (
        <EmptyState hasMatches={matches.length > 0} />
      ) : (
        <div className="space-y-2">
          {paginatedMatches.map(match => (
            <MatchAdminCard
              key={match.id}
              match={match}
              players={players}
              onDelete={() =>
                onSetMatches(prev => prev.filter(m => m.id !== match.id))
              }
              onStatsSaved={onRefreshMatches}
            />
          ))}
        </div>
      )}
    </div>
  );
}
