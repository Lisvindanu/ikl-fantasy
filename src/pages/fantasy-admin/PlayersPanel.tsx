import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Trophy } from 'lucide-react';
import type { IKLPlayer } from '../../api/fantasy';

type SortKey = 'name' | 'role' | 'team_short' | 'price' | 'fantasy_pts' | 'mvps';
type SortDir = 'asc' | 'desc';

export function PlayersPanel({ players }: { players: IKLPlayer[] }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('fantasy_pts');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
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
          return sortDir === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        const diff = (aVal as number) - (bVal as number);
        return sortDir === 'asc' ? diff : -diff;
      });
  }, [players, search, sortKey, sortDir, roleFilter]);

  const roles = ['all', 'EXP', 'JGL', 'MID', 'GOLD', 'ROAM'] as const;

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th className="text-left px-3 py-2.5 text-gray-500 font-bold cursor-pointer select-none hover:text-gray-300 transition-colors"
      onClick={() => toggleSort(field)}>
      <span className="flex items-center gap-1">
        {label}
        {sortKey === field && (
          <ArrowUpDown className="w-3 h-3 text-amber-400" />
        )}
      </span>
    </th>
  );

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search players..."
            className="w-full pl-10 pr-3 py-2.5 rounded-xl text-white text-sm outline-none"
            style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <div className="flex gap-1.5">
          {roles.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className="px-3 py-2 rounded-lg text-xs font-bold transition-all"
              style={{
                background: roleFilter === r ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                color: roleFilter === r ? '#F59E0B' : '#6B7280',
                border: roleFilter === r ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}>
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="text-xs text-gray-600 font-bold">
        {filtered.length} player{filtered.length !== 1 ? 's' : ''}
        {search || roleFilter !== 'all' ? ` (filtered from ${players.length})` : ''}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th className="w-10 px-3 py-2.5 text-gray-600 text-xs">#</th>
                <SortHeader label="Player" field="name" />
                <SortHeader label="Role" field="role" />
                <SortHeader label="Team" field="team_short" />
                <SortHeader label="Price" field="price" />
                <SortHeader label="Points" field="fantasy_pts" />
                <SortHeader label="MVPs" field="mvps" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-600 text-sm">
                    No players found
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-2.5 text-gray-700 text-xs font-bold">{i + 1}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        {p.photo_url ? (
                          <img src={p.photo_url} alt={p.name}
                            className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                            style={{ border: `1px solid ${p.team_color}40` }} />
                        ) : (
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                            style={{ background: `${p.team_color}20`, color: p.team_color }}>
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          color: p.role === 'JGL' ? '#22C55E' : p.role === 'MID' ? '#3B82F6' : p.role === 'GOLD' ? '#F59E0B' : p.role === 'EXP' ? '#A855F7' : '#06B6D4',
                        }}>
                        {p.role}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ background: `${p.team_color}15`, color: p.team_color }}>
                        {p.team_short}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-400 font-bold">{p.price}M</td>
                    <td className="px-3 py-2.5">
                      <span className={`font-black ${p.fantasy_pts > 0 ? 'text-green-400' : 'text-gray-600'}`}>
                        {p.fantasy_pts.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {p.mvps > 0 ? (
                        <span className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                          <Trophy className="w-3 h-3" />
                          {p.mvps}
                        </span>
                      ) : (
                        <span className="text-gray-700 text-xs">0</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
