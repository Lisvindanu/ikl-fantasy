import { Search, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { ROLE_META, ROLES } from '../../components/fantasy/types';
import type { Role, SortBy } from '../../components/fantasy/types';
import { RolePill } from '../../components/fantasy/RolePill';
import { NAT_FLAG } from '../../components/fantasy/types';
import type { IKLPlayer } from '../../api/fantasy';

interface Props {
  filteredPlayers: IKLPlayer[];
  search: string;
  setSearch: (s: string) => void;
  filterRole: Role | 'ALL';
  setFilterRole: (r: Role | 'ALL') => void;
  sortBy: SortBy;
  setSortBy: (s: SortBy) => void;
  onDetail: (p: IKLPlayer) => void;
}

export function PlayersTab({ filteredPlayers, search, setSearch, filterRole, setFilterRole, sortBy, setSortBy, onDetail }: Props) {
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search players or teams..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-white placeholder-gray-700 text-sm focus:outline-none"
            style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
        <div className="flex gap-1.5" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
          {(['ALL', ...ROLES] as (Role | 'ALL')[]).map(r => {
            const active = filterRole === r;
            const color = r === 'ALL' ? '#F59E0B' : ROLE_META[r as Role].color;
            return (
              <button key={r} onClick={() => setFilterRole(r)}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: active ? `${color}18` : '#0d1017',
                  color: active ? color : '#4B5563',
                  border: active ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.07)',
                }}>
                {r === 'ALL' ? 'All' : ROLE_META[r as Role].short}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden overflow-x-auto" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-white/8 text-gray-600 text-xs uppercase tracking-wider" style={{ background: '#07090f' }}>
              <th className="text-left px-4 py-3 w-8">#</th>
              <th className="text-left px-4 py-3">Player</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Team</th>
              <th className="text-center px-3 py-3">Role</th>
              <th className="text-center px-3 py-3 hidden sm:table-cell">Nat</th>
              <th className="text-center px-3 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => setSortBy('mvps')}>
                <span className="inline-flex items-center gap-1">
                  MVP {sortBy === 'mvps' ? <ChevronDown className="w-3 h-3 text-amber-400" /> : <ChevronUp className="w-3 h-3 opacity-20" />}
                </span>
              </th>
              <th className="text-center px-3 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => setSortBy('pts')}>
                <span className="inline-flex items-center gap-1">
                  Pts {sortBy === 'pts' ? <ChevronDown className="w-3 h-3 text-amber-400" /> : <ChevronUp className="w-3 h-3 opacity-20" />}
                </span>
              </th>
              <th className="text-center px-3 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => setSortBy('price')}>
                <span className="inline-flex items-center gap-1">
                  Price {sortBy === 'price' ? <ChevronDown className="w-3 h-3 text-amber-400" /> : <ChevronUp className="w-3 h-3 opacity-20" />}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((p, i) => (
              <tr key={p.id}
                className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                style={{ background: i < 3 && sortBy === 'pts' ? `${p.team_color}06` : 'transparent' }}>
                <td className="px-4 py-3 text-gray-700 text-xs font-bold">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      onClick={() => onDetail(p)}
                      className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center font-black text-xs flex-shrink-0 cursor-pointer hover:ring-2 transition-all"
                      style={{ background: `${p.team_color}30`, color: p.team_color, border: `1.5px solid ${p.team_color}50` }}>
                      {p.photo_url
                        ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover object-top"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        : p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-xs font-bold md:hidden" style={{ color: p.team_color }}>{p.team_short}</div>
                    </div>
                    {i < 3 && sortBy === 'pts' && <Flame className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: `${p.team_color}20`, color: p.team_color }}>{p.team_short}</span>
                </td>
                <td className="px-3 py-3 text-center"><RolePill role={p.role as Role} size="xs" /></td>
                <td className="px-3 py-3 text-center hidden sm:table-cell text-base">{NAT_FLAG[p.nationality] || p.nationality}</td>
                <td className="px-3 py-3 text-center font-bold text-white">{p.mvps}</td>
                <td className="px-3 py-3 text-center">
                  <span className="font-black text-amber-400 text-base">{p.fantasy_pts}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="px-2 py-1 rounded-lg text-xs font-black"
                    style={{ background: 'rgba(245,158,11,0.12)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.2)' }}>
                    {p.price} cr
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
