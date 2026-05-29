import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Trophy, Users, Filter } from 'lucide-react';
import { AdminPanel, Input } from './shared';
import type { IKLPlayer } from '../../api/fantasy';

type SortKey = 'name' | 'role' | 'team_short' | 'price' | 'fantasy_pts' | 'mvps';
type SortDir = 'asc' | 'desc';

const ROLES = ['all', 'EXP', 'JGL', 'MID', 'GOLD', 'ROAM'] as const;

const ROLE_COLOR: Record<string, string> = {
  JGL: '#22C55E',
  MID: '#3B82F6',
  GOLD: '#F59E0B',
  EXP: '#A855F7',
  ROAM: '#06B6D4',
};

function SortIcon({ field, activeField, direction }: { field: SortKey; activeField: SortKey; direction: SortDir }) {
  if (field !== activeField) {
    return <ArrowUpDown className="w-3 h-3 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />;
  }
  const Icon = direction === 'asc' ? ArrowUp : ArrowDown;
  return <Icon className="w-3 h-3 text-amber-400" />;
}

export function PlayersPanel({ players }: { players: IKLPlayer[] }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('fantasy_pts');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' || key === 'role' || key === 'team_short' ? 'asc' : 'desc');
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return players
      .filter(p => {
        if (roleFilter !== 'all' && p.role !== roleFilter) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.team_short.toLowerCase().includes(q) ||
          p.team_name.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        const diff = (aVal as number) - (bVal as number);
        return sortDir === 'asc' ? diff : -diff;
      });
  }, [players, search, sortKey, sortDir, roleFilter]);

  const isFiltered = search.length > 0 || roleFilter !== 'all';

  const columns: { label: string; field: SortKey }[] = [
    { label: 'Player', field: 'name' },
    { label: 'Role', field: 'role' },
    { label: 'Team', field: 'team_short' },
    { label: 'Price', field: 'price' },
    { label: 'Points', field: 'fantasy_pts' },
    { label: 'MVPs', field: 'mvps' },
  ];

  return (
    <div className="space-y-4">
      {/* Search + role filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search players, teams..."
            className="w-full pl-10"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-gray-600 mr-1 flex-shrink-0 hidden sm:block" />
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className="px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200"
              style={{
                background:
                  roleFilter === r
                    ? 'linear-gradient(180deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.08) 100%)'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.15) 100%)',
                color: roleFilter === r ? '#F59E0B' : '#6B7280',
                border:
                  roleFilter === r
                    ? '1px solid rgba(245,158,11,0.25)'
                    : '1px solid rgba(255,255,255,0.06)',
                boxShadow:
                  roleFilter === r
                    ? '0 0 12px -4px rgba(245,158,11,0.2), inset 0 1px 0 rgba(245,158,11,0.1)'
                    : 'inset 0 1px 0 rgba(255,255,255,0.03)',
              }}>
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center gap-2 text-xs text-gray-600 font-bold">
        <Users className="w-3 h-3" />
        <span>
          {filtered.length} player{filtered.length !== 1 ? 's' : ''}
          {isFiltered ? ` filtered from ${players.length}` : ''}
        </span>
      </div>

      {/* Table panel */}
      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                }}>
                <th className="w-10 px-3 py-3 text-gray-700 text-[10px] font-black uppercase tracking-widest">
                  #
                </th>
                {columns.map(col => (
                  <th
                    key={col.field}
                    onClick={() => toggleSort(col.field)}
                    className="group text-left px-3 py-3 cursor-pointer select-none transition-colors hover:bg-white/[0.02]">
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">
                      {col.label}
                      <SortIcon field={col.field} activeField={sortKey} direction={sortDir} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-5 h-5 text-gray-700" />
                      <span className="text-gray-600 text-sm font-medium">No players found</span>
                      {isFiltered && (
                        <button
                          onClick={() => { setSearch(''); setRoleFilter('all'); }}
                          className="text-xs text-amber-500/70 hover:text-amber-400 transition-colors font-bold">
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => {
                  const roleColor = ROLE_COLOR[p.role] ?? '#6B7280';
                  return (
                    <tr
                      key={p.id}
                      className="border-t transition-colors hover:bg-white/[0.02]"
                      style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      {/* Index */}
                      <td className="px-3 py-2.5 text-gray-700 text-xs font-black tabular-nums">
                        {i + 1}
                      </td>

                      {/* Player name + avatar */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          {p.photo_url ? (
                            <img
                              src={p.photo_url}
                              alt={p.name}
                              className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                              style={{ border: `1px solid ${p.team_color}40` }}
                            />
                          ) : (
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                              style={{ background: `${p.team_color}20`, color: p.team_color }}>
                              {p.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="font-bold text-white">{p.name}</span>
                        </div>
                      </td>

                      {/* Role badge */}
                      <td className="px-3 py-2.5">
                        <span
                          className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{ background: `${roleColor}12`, color: roleColor }}>
                          {p.role}
                        </span>
                      </td>

                      {/* Team badge */}
                      <td className="px-3 py-2.5">
                        <span
                          className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{ background: `${p.team_color}15`, color: p.team_color }}>
                          {p.team_short}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-3 py-2.5 text-gray-400 font-bold tabular-nums">
                        {p.price}M
                      </td>

                      {/* Fantasy points */}
                      <td className="px-3 py-2.5">
                        <span
                          className="font-black tabular-nums"
                          style={{
                            color: p.fantasy_pts > 0 ? '#22C55E' : '#374151',
                          }}>
                          {p.fantasy_pts.toFixed(1)}
                        </span>
                      </td>

                      {/* MVPs */}
                      <td className="px-3 py-2.5">
                        {p.mvps > 0 ? (
                          <span className="flex items-center gap-1 text-amber-400 font-bold text-xs tabular-nums">
                            <Trophy className="w-3 h-3" />
                            {p.mvps}
                          </span>
                        ) : (
                          <span className="text-gray-700 text-xs">0</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
