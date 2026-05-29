import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import type { AdminSectionProps, MatchFilter } from './adminConstants';
import { filterMatches, getStatusCounts } from './adminConstants';
import { CreateMatchForm } from './CreateMatchForm';
import { MatchAdminCard } from './MatchAdminCard';

export function MatchesSection({ season, players, matches, onSetMatches, onRefreshMatches }: AdminSectionProps) {
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('all');
  const [matchWeek, setMatchWeek] = useState(0);
  const [matchSearch, setMatchSearch] = useState('');

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

  if (!season) return null;

  return (
    <div className="space-y-4">
      {season.teams?.length > 0 && (
        <CreateMatchForm
          seasonId={season.id}
          teams={season.teams}
          onCreated={match => onSetMatches(prev => [match, ...prev])}
        />
      )}

      {/* Filter bar */}
      <div className="rounded-2xl p-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input value={matchSearch} onChange={e => setMatchSearch(e.target.value)}
              placeholder="Search matches..."
              className="w-full pl-10 pr-3 py-2 rounded-lg text-white text-sm outline-none"
              style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'upcoming', 'live', 'completed', 'postponed'] as const).map(f => {
              const count = statusCounts[f];
              const isActive = matchFilter === f;
              const color = f === 'live' ? '#22C55E' : f === 'completed' ? '#3B82F6' : f === 'postponed' ? '#EF4444' : '#F59E0B';
              return (
                <button key={f} onClick={() => setMatchFilter(f)}
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

          {weeks.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-600" />
              <select value={matchWeek} onChange={e => setMatchWeek(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg text-white text-xs font-bold outline-none"
                style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.08)' }}>
                <option value={0}>All Weeks</option>
                {weeks.map(w => <option key={w} value={w}>Week {w}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

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
                onDelete={() => onSetMatches(prev => prev.filter(m => m.id !== match.id))}
                onStatsSaved={onRefreshMatches}
              />
            ))}
        </div>
      )}
    </div>
  );
}
