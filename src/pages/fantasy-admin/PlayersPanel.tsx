import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Trophy, Users, Filter, Pencil, X, ChevronLeft, ChevronRight, Save, ImagePlus } from 'lucide-react';
import { AdminPanel, Input, Field } from './shared';
import * as fantasyApi from '../../api/fantasy';
import type { IKLPlayer } from '../../api/fantasy';

type SortKey = 'name' | 'role' | 'team_short' | 'price' | 'fantasy_pts' | 'mvps';
type SortDir = 'asc' | 'desc';
const PAGE_SIZE = 15;
const ROLES = ['all', 'CLASH', 'JGL', 'MID', 'FARM', 'ROAM'] as const;
const ROLE_COLOR: Record<string, string> = {
  JGL: '#22C55E', MID: '#3B82F6', FARM: '#EAB308', CLASH: '#F97316', ROAM: '#A855F7',
};

function SortIcon({ field, active, dir }: { field: SortKey; active: SortKey; dir: SortDir }) {
  if (field !== active) return <ArrowUpDown className="w-2.5 h-2.5 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />;
  const I = dir === 'asc' ? ArrowUp : ArrowDown;
  return <I className="w-2.5 h-2.5 text-amber-400" />;
}

function PlayerAvatar({ player, size = 'sm' }: { player: IKLPlayer; size?: 'sm' | 'lg' }) {
  const s = size === 'lg' ? 'w-16 h-16 rounded-xl text-lg' : 'w-6 h-6 rounded text-[8px]';
  if (player.photo_url) {
    return <img src={player.photo_url} alt={player.name}
      className={`${s} object-cover flex-shrink-0`}
      style={{ border: `1px solid ${player.team_color}40` }} />;
  }
  return (
    <div className={`${s} flex items-center justify-center font-black flex-shrink-0`}
      style={{ background: `${player.team_color}20`, color: player.team_color }}>
      {player.name.slice(0, 2).toUpperCase()}
    </div>
  );
}

/* ── Edit Modal ───────────────────────────────────────────────────────────── */

interface EditForm {
  name: string; role: string; nationality: string;
  price: number; mvps: number; fantasyPts: number; photoUrl: string;
}

function EditModal({ player, onClose, onSaved }: {
  player: IKLPlayer; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState<EditForm>({
    name: player.name, role: player.role, nationality: player.nationality || '',
    price: player.price, mvps: player.mvps, fantasyPts: player.fantasy_pts,
    photoUrl: player.photo_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const patch = (k: keyof EditForm, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    setSaving(true); setMsg('');
    try {
      await fantasyApi.adminUpdatePlayer(player.id, {
        name: form.name, role: form.role, nationality: form.nationality || undefined,
        price: form.price, mvps: form.mvps, fantasyPts: form.fantasyPts,
        photoUrl: form.photoUrl,
      });
      onSaved();
      onClose();
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed to save'); }
    setSaving(false);
  }

  const roleColor = ROLE_COLOR[form.role] ?? '#6B7280';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(13,16,23,0.98) 0%, rgba(7,9,15,0.99) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <PlayerAvatar player={{ ...player, photo_url: form.photoUrl || player.photo_url } as IKLPlayer} size="lg" />
            <div>
              <h3 className="text-sm font-black text-white">{player.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                  style={{ background: `${roleColor}15`, color: roleColor }}>{form.role}</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                  style={{ background: `${player.team_color}15`, color: player.team_color }}>{player.team_short}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-3">
          {/* Photo URL */}
          <Field label="Photo URL">
            <div className="relative">
              <ImagePlus className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
              <Input value={form.photoUrl} onChange={e => patch('photoUrl', e.target.value)}
                placeholder="https://..." className="w-full pl-9 !text-xs" />
            </div>
          </Field>

          {/* Name + Nationality */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              <Input value={form.name} onChange={e => patch('name', e.target.value)} className="w-full !text-xs" />
            </Field>
            <Field label="Nationality">
              <Input value={form.nationality} onChange={e => patch('nationality', e.target.value)}
                placeholder="ID" className="w-full !text-xs" />
            </Field>
          </div>

          {/* Role + Price */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <select value={form.role} onChange={e => patch('role', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-white text-xs font-medium outline-none appearance-none cursor-pointer"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                {['CLASH', 'JGL', 'MID', 'FARM', 'ROAM'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Price (M)">
              <Input type="number" min={5} max={50} value={form.price}
                onChange={e => patch('price', Number(e.target.value))} className="w-full !text-xs" />
            </Field>
          </div>

          {/* Points + MVPs */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fantasy Pts">
              <Input type="number" min={0} max={999} value={form.fantasyPts}
                onChange={e => patch('fantasyPts', Number(e.target.value))} className="w-full !text-xs" />
            </Field>
            <Field label="MVPs">
              <Input type="number" min={0} max={99} value={form.mvps}
                onChange={e => patch('mvps', Number(e.target.value))} className="w-full !text-xs" />
            </Field>
          </div>

          {msg && (
            <p className="text-xs font-bold text-red-400 px-2.5 py-1.5 rounded-lg bg-red-500/5 border border-red-500/10">{msg}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-black disabled:opacity-50 transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #FBBF24, #D97706)', boxShadow: '0 2px 8px rgba(245,158,11,0.25)' }}>
            <Save className="w-3 h-3" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Players Panel ────────────────────────────────────────────────────────── */

export function PlayersPanel({ players, onRefresh }: { players: IKLPlayer[]; onRefresh: () => void }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('fantasy_pts');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [editPlayer, setEditPlayer] = useState<IKLPlayer | null>(null);

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

  const columns: { label: string; field: SortKey; right?: boolean }[] = [
    { label: 'Player', field: 'name' },
    { label: 'Role', field: 'role' },
    { label: 'Team', field: 'team_short' },
    { label: 'Price', field: 'price', right: true },
    { label: 'Pts', field: 'fantasy_pts', right: true },
    { label: 'MVP', field: 'mvps', right: true },
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

      {/* Table */}
      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th className="w-8 px-2 py-2 text-gray-700 text-[9px] font-black uppercase">#</th>
                {columns.map(col => (
                  <th key={col.field} onClick={() => toggleSort(col.field)}
                    className={`group px-2 py-2 cursor-pointer select-none hover:bg-white/[0.02] ${col.right ? 'text-right' : 'text-left'}`}>
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-gray-600 group-hover:text-gray-400">
                      {col.label}
                      <SortIcon field={col.field} active={sortKey} dir={sortDir} />
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
                return (
                  <tr key={p.id} className="border-t hover:bg-white/[0.015] transition-colors cursor-pointer"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                    onClick={() => setEditPlayer(p)}>
                    <td className="px-2 py-1.5 text-gray-700 text-[10px] font-bold tabular-nums">{page * PAGE_SIZE + i + 1}</td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <PlayerAvatar player={p} />
                        <span className="font-bold text-white text-xs truncate max-w-[100px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                        style={{ background: `${roleColor}12`, color: roleColor }}>{p.role}</span>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                        style={{ background: `${p.team_color}15`, color: p.team_color }}>{p.team_short}</span>
                    </td>
                    <td className="px-2 py-1.5 text-right text-gray-400 font-bold tabular-nums text-[11px]">{p.price}M</td>
                    <td className="px-2 py-1.5 text-right">
                      <span className="font-black tabular-nums text-[11px]"
                        style={{ color: p.fantasy_pts > 0 ? '#22C55E' : '#374151' }}>{p.fantasy_pts.toFixed(1)}</span>
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {p.mvps > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-amber-400 font-bold text-[10px] tabular-nums">
                          <Trophy className="w-2.5 h-2.5" />{p.mvps}
                        </span>
                      ) : <span className="text-gray-700 text-[10px]">0</span>}
                    </td>
                    <td className="px-2 py-1.5" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setEditPlayer(p)}
                        className="p-1 rounded hover:bg-white/5 text-gray-700 hover:text-amber-400 transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      {/* Edit Modal */}
      {editPlayer && (
        <EditModal player={editPlayer} onClose={() => setEditPlayer(null)} onSaved={onRefresh} />
      )}
    </div>
  );
}
