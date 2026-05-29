import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Trophy, Users, Filter, Pencil, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminPanel, Input } from './shared';
import * as fantasyApi from '../../api/fantasy';
import type { IKLPlayer } from '../../api/fantasy';

type SortKey = 'name' | 'role' | 'team_short' | 'price' | 'fantasy_pts' | 'mvps';
type SortDir = 'asc' | 'desc';
const PAGE_SIZE = 15;

const ROLES = ['all', 'EXP', 'JGL', 'MID', 'GOLD', 'ROAM'] as const;
const ROLE_COLOR: Record<string, string> = {
  JGL: '#22C55E', MID: '#3B82F6', GOLD: '#F59E0B', EXP: '#A855F7', ROAM: '#06B6D4',
};

function SortIcon({ field, activeField, direction }: { field: SortKey; activeField: SortKey; direction: SortDir }) {
  if (field !== activeField) return <ArrowUpDown className="w-2.5 h-2.5 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />;
  const Icon = direction === 'asc' ? ArrowUp : ArrowDown;
  return <Icon className="w-2.5 h-2.5 text-amber-400" />;
}

interface EditState {
  id: number;
  name: string;
  role: string;
  price: number;
  mvps: number;
  fantasyPts: number;
}

export function PlayersPanel({ players, onRefresh }: { players: IKLPlayer[]; onRefresh: () => void }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('fantasy_pts');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir(key === 'name' || key === 'role' || key === 'team_short' ? 'asc' : 'desc'); }
  }

  const filtered = useMemo(() => {
    setPage(0);
    const q = search.toLowerCase().trim();
    return players
      .filter(p => {
        if (roleFilter !== 'all' && p.role !== roleFilter) return false;
        if (!q) return true;
        return p.name.toLowerCase().includes(q) || p.team_short.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const aVal = a[sortKey]; const bVal = b[sortKey];
        if (typeof aVal === 'string' && typeof bVal === 'string')
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });
  }, [players, search, sortKey, sortDir, roleFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function startEdit(p: IKLPlayer) {
    setEditing({ id: p.id, name: p.name, role: p.role, price: p.price, mvps: p.mvps, fantasyPts: p.fantasy_pts });
    setMsg('');
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true); setMsg('');
    try {
      await fantasyApi.adminUpdatePlayer(editing.id, {
        name: editing.name, role: editing.role, price: editing.price,
        mvps: editing.mvps, fantasyPts: editing.fantasyPts,
      });
      setMsg('Saved');
      setEditing(null);
      onRefresh();
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed'); }
    setSaving(false);
  }

  const columns: { label: string; field: SortKey; align?: string }[] = [
    { label: 'Player', field: 'name' },
    { label: 'Role', field: 'role' },
    { label: 'Team', field: 'team_short' },
    { label: 'Price', field: 'price', align: 'right' },
    { label: 'Pts', field: 'fantasy_pts', align: 'right' },
    { label: 'MVP', field: 'mvps', align: 'right' },
  ];

  return (
    <div className="space-y-3">
      {/* Search + role filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search players..." className="w-full pl-9 !py-2 !text-xs" />
        </div>
        <div className="flex items-center gap-1">
          <Filter className="w-3 h-3 text-gray-600 mr-0.5 flex-shrink-0 hidden sm:block" />
          {ROLES.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className="px-2 py-1.5 rounded-md text-[10px] font-bold transition-all"
              style={{
                background: roleFilter === r ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                color: roleFilter === r ? '#F59E0B' : '#6B7280',
                border: roleFilter === r ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.06)',
              }}>
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Count + pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-600 font-bold">
          <Users className="w-3 h-3" />
          {filtered.length} player{filtered.length !== 1 ? 's' : ''}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="p-1 rounded-md disabled:opacity-20 hover:bg-white/5 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <ChevronLeft className="w-3 h-3 text-gray-500" />
            </button>
            <span className="text-[10px] text-gray-600 font-bold px-1.5">{page + 1}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="p-1 rounded-md disabled:opacity-20 hover:bg-white/5 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <ChevronRight className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {msg && (
        <p className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg ${msg === 'Saved' ? 'text-green-400 bg-green-500/5 border border-green-500/10' : 'text-red-400 bg-red-500/5 border border-red-500/10'}`}>
          {msg}
        </p>
      )}

      {/* Table */}
      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th className="w-8 px-2 py-2 text-gray-700 text-[9px] font-black uppercase">#</th>
                {columns.map(col => (
                  <th key={col.field} onClick={() => toggleSort(col.field)}
                    className={`group px-2 py-2 cursor-pointer select-none hover:bg-white/[0.02] ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-gray-600 group-hover:text-gray-400">
                      {col.label}
                      <SortIcon field={col.field} activeField={sortKey} direction={sortDir} />
                    </span>
                  </th>
                ))}
                <th className="w-8 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-600 text-xs">No players found</td></tr>
              ) : paginated.map((p, i) => {
                const roleColor = ROLE_COLOR[p.role] ?? '#6B7280';
                const isEditing = editing?.id === p.id;
                const globalIdx = page * PAGE_SIZE + i + 1;

                return (
                  <tr key={p.id} className="border-t hover:bg-white/[0.015] transition-colors"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <td className="px-2 py-1.5 text-gray-700 text-[10px] font-bold tabular-nums">{globalIdx}</td>

                    {/* Name */}
                    <td className="px-2 py-1.5">
                      {isEditing ? (
                        <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-white text-xs outline-none focus:border-amber-500/40" />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded flex-shrink-0 text-[8px] font-black flex items-center justify-center"
                            style={{ background: `${p.team_color}20`, color: p.team_color }}>
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-white text-xs truncate max-w-[100px]">{p.name}</span>
                        </div>
                      )}
                    </td>

                    {/* Role */}
                    <td className="px-2 py-1.5">
                      {isEditing ? (
                        <select value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })}
                          className="bg-white/5 border border-white/10 rounded px-1 py-0.5 text-white text-[10px] outline-none">
                          {['EXP', 'JGL', 'MID', 'GOLD', 'ROAM'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                          style={{ background: `${roleColor}12`, color: roleColor }}>{p.role}</span>
                      )}
                    </td>

                    {/* Team */}
                    <td className="px-2 py-1.5">
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                        style={{ background: `${p.team_color}15`, color: p.team_color }}>{p.team_short}</span>
                    </td>

                    {/* Price */}
                    <td className="px-2 py-1.5 text-right">
                      {isEditing ? (
                        <input type="number" min={5} max={50} value={editing.price}
                          onChange={e => setEditing({ ...editing, price: Number(e.target.value) })}
                          className="w-12 text-right bg-white/5 border border-white/10 rounded px-1 py-0.5 text-white text-xs outline-none focus:border-amber-500/40" />
                      ) : (
                        <span className="text-gray-400 font-bold tabular-nums text-[11px]">{p.price}M</span>
                      )}
                    </td>

                    {/* Points */}
                    <td className="px-2 py-1.5 text-right">
                      {isEditing ? (
                        <input type="number" min={0} max={999} value={editing.fantasyPts}
                          onChange={e => setEditing({ ...editing, fantasyPts: Number(e.target.value) })}
                          className="w-14 text-right bg-white/5 border border-white/10 rounded px-1 py-0.5 text-white text-xs outline-none focus:border-green-500/40" />
                      ) : (
                        <span className="font-black tabular-nums text-[11px]"
                          style={{ color: p.fantasy_pts > 0 ? '#22C55E' : '#374151' }}>{p.fantasy_pts.toFixed(1)}</span>
                      )}
                    </td>

                    {/* MVPs */}
                    <td className="px-2 py-1.5 text-right">
                      {isEditing ? (
                        <input type="number" min={0} max={99} value={editing.mvps}
                          onChange={e => setEditing({ ...editing, mvps: Number(e.target.value) })}
                          className="w-10 text-right bg-white/5 border border-white/10 rounded px-1 py-0.5 text-white text-xs outline-none focus:border-amber-500/40" />
                      ) : p.mvps > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-amber-400 font-bold text-[10px] tabular-nums">
                          <Trophy className="w-2.5 h-2.5" />{p.mvps}
                        </span>
                      ) : <span className="text-gray-700 text-[10px]">0</span>}
                    </td>

                    {/* Actions */}
                    <td className="px-2 py-1.5">
                      {isEditing ? (
                        <div className="flex gap-0.5">
                          <button onClick={saveEdit} disabled={saving}
                            className="p-1 rounded hover:bg-green-500/10 text-green-400 transition-colors disabled:opacity-50">
                            <Check className="w-3 h-3" />
                          </button>
                          <button onClick={() => setEditing(null)}
                            className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(p)}
                          className="p-1 rounded hover:bg-white/5 text-gray-700 hover:text-amber-400 transition-colors">
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
