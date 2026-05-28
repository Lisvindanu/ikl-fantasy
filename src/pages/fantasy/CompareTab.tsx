import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Trash2, UserPlus, BarChart2 } from 'lucide-react';
import { RolePill } from '../../components/fantasy/RolePill';
import type { Role } from '../../components/fantasy/types';
import type { IKLPlayer, PlayerCareerStats } from '../../api/fantasy';
import { getPlayerCareerStats } from '../../api/fantasy';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Props {
  players: IKLPlayer[];
  onDetail: (p: IKLPlayer) => void;
}

interface PlayerWithCareer {
  player: IKLPlayer;
  career: PlayerCareerStats | null;
  loading: boolean;
}

interface StatRow {
  label: string;
  key: string;
  getValue: (pw: PlayerWithCareer) => number;
  format?: (v: number) => string;
  higherIsBetter: boolean;
  color: string;
}

// ── Stat definitions ───────────────────────────────────────────────────────────

const STAT_ROWS: StatRow[] = [
  {
    label: 'Fantasy Pts',
    key: 'fantasy_pts',
    getValue: pw => pw.player.fantasy_pts,
    higherIsBetter: true,
    color: '#F59E0B',
  },
  {
    label: 'Total Kills',
    key: 'kills',
    getValue: pw => pw.career?.total_kills ?? 0,
    higherIsBetter: true,
    color: '#22C55E',
  },
  {
    label: 'Total Deaths',
    key: 'deaths',
    getValue: pw => pw.career?.total_deaths ?? 0,
    higherIsBetter: false,
    color: '#EF4444',
  },
  {
    label: 'Total Assists',
    key: 'assists',
    getValue: pw => pw.career?.total_assists ?? 0,
    higherIsBetter: true,
    color: '#3B82F6',
  },
  {
    label: 'KDA Ratio',
    key: 'kda',
    getValue: pw => {
      const k = pw.career?.total_kills ?? 0;
      const d = pw.career?.total_deaths ?? 1;
      const a = pw.career?.total_assists ?? 0;
      return d === 0 ? k + a : (k + a) / d;
    },
    format: v => v.toFixed(2),
    higherIsBetter: true,
    color: '#A855F7',
  },
  {
    label: 'MVPs',
    key: 'mvps',
    getValue: pw => pw.player.mvps,
    higherIsBetter: true,
    color: '#FBBF24',
  },
  {
    label: 'Penta Kills',
    key: 'pentas',
    getValue: pw => pw.career?.total_pentas ?? 0,
    higherIsBetter: true,
    color: '#EC4899',
  },
  {
    label: 'Price',
    key: 'price',
    getValue: pw => pw.player.price,
    format: v => `${v} cr`,
    higherIsBetter: false,
    color: '#6B7280',
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function findBestIndex(values: number[], higherIsBetter: boolean): number {
  if (values.length === 0) return -1;
  let bestIdx = 0;
  for (let i = 1; i < values.length; i++) {
    const isBetter = higherIsBetter
      ? values[i] > values[bestIdx]
      : values[i] < values[bestIdx];
    if (isBetter) bestIdx = i;
  }
  return bestIdx;
}

// ── Bar visual ─────────────────────────────────────────────────────────────────

function StatBar({ value, maxValue, color, isBest }: { value: number; maxValue: number; color: string; isBest: boolean }) {
  const pct = maxValue > 0 ? Math.max((value / maxValue) * 100, 4) : 4;
  return (
    <div className="w-full">
      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#07090f' }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            background: isBest
              ? `linear-gradient(90deg, ${color}, ${color}CC)`
              : `${color}50`,
            boxShadow: isBest ? `0 0 8px ${color}40` : 'none',
          }}
        />
      </div>
    </div>
  );
}

// ── Player search dropdown ─────────────────────────────────────────────────────

function PlayerSearchSelect({
  players,
  selectedIds,
  onSelect,
}: {
  players: IKLPlayer[];
  selectedIds: Set<number>;
  onSelect: (p: IKLPlayer) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return players.filter(p => !selectedIds.has(p.id)).slice(0, 20);
    const q = query.toLowerCase();
    return players
      .filter(p => !selectedIds.has(p.id))
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.team_short.toLowerCase().includes(q) ||
        p.team_name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [players, selectedIds, query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search player to add..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-white placeholder-gray-700 text-sm focus:outline-none"
          style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-xl shadow-2xl"
            style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => { onSelect(p); setQuery(''); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center font-black text-xs flex-shrink-0"
                  style={{ background: `${p.team_color}30`, color: p.team_color, border: `1.5px solid ${p.team_color}50` }}
                >
                  {p.photo_url
                    ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover object-top"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    : p.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm">{p.name}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold px-1.5 rounded" style={{ background: `${p.team_color}25`, color: p.team_color }}>
                      {p.team_short}
                    </span>
                    <RolePill role={p.role as Role} size="xs" />
                  </div>
                </div>
                <span className="text-amber-400 font-black text-sm">{p.fantasy_pts} pts</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Close dropdown when clicking outside */}
      {open && (
        <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}

// ── Player card header ─────────────────────────────────────────────────────────

function PlayerCardHeader({
  pw,
  onRemove,
  onDetail,
}: {
  pw: PlayerWithCareer;
  onRemove: () => void;
  onDetail: (p: IKLPlayer) => void;
}) {
  const p = pw.player;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl p-4 relative"
      style={{
        background: `linear-gradient(135deg, ${p.team_color}12 0%, #0d1017 70%)`,
        border: `1px solid ${p.team_color}30`,
      }}
    >
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/10 transition-colors text-gray-600 hover:text-red-400"
        title="Remove player"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col items-center text-center gap-2">
        <div
          onClick={() => onDetail(p)}
          className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center font-black text-lg flex-shrink-0 cursor-pointer hover:ring-2 transition-all"
          style={{ background: `${p.team_color}30`, color: p.team_color, border: `2px solid ${p.team_color}50` }}
        >
          {p.photo_url
            ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover object-top"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            : p.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="font-black text-white text-sm">{p.name}</div>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <span className="text-xs font-bold px-1.5 rounded" style={{ background: `${p.team_color}25`, color: p.team_color }}>
              {p.team_short}
            </span>
            <RolePill role={p.role as Role} size="xs" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Empty slot ─────────────────────────────────────────────────────────────────

function EmptySlot({ index }: { index: number }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col items-center justify-center gap-2 min-h-[120px]"
      style={{ background: '#0d1017', border: '1px dashed rgba(255,255,255,0.1)' }}
    >
      <UserPlus className="w-6 h-6 text-gray-700" />
      <span className="text-xs text-gray-700 font-bold">Slot {index + 1}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function CompareTab({ players, onDetail }: Props) {
  const [selected, setSelected] = useState<PlayerWithCareer[]>([]);

  const selectedIds = useMemo(
    () => new Set(selected.map(s => s.player.id)),
    [selected],
  );

  function handleAddPlayer(p: IKLPlayer) {
    if (selected.length >= 3) return;
    if (selectedIds.has(p.id)) return;

    const newEntry: PlayerWithCareer = { player: p, career: null, loading: true };
    setSelected(prev => [...prev, newEntry]);

    getPlayerCareerStats(p.id)
      .then(career => {
        setSelected(prev =>
          prev.map(pw =>
            pw.player.id === p.id ? { ...pw, career, loading: false } : pw,
          ),
        );
      })
      .catch(() => {
        setSelected(prev =>
          prev.map(pw =>
            pw.player.id === p.id ? { ...pw, loading: false } : pw,
          ),
        );
      });
  }

  function handleRemovePlayer(playerId: number) {
    setSelected(prev => prev.filter(pw => pw.player.id !== playerId));
  }

  function handleClearAll() {
    setSelected([]);
  }

  const anyLoading = selected.some(pw => pw.loading);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" /> Player Comparison
          </h2>
          <p className="text-gray-600 text-xs mt-1">Select 2-3 players to compare their stats side-by-side</p>
        </div>
        {selected.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-400/10 transition-colors"
            style={{ border: '1px solid rgba(248,113,113,0.2)' }}
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </motion.button>
        )}
      </div>

      {/* Search */}
      {selected.length < 3 && (
        <PlayerSearchSelect
          players={players}
          selectedIds={selectedIds}
          onSelect={handleAddPlayer}
        />
      )}

      {/* Selected player cards */}
      <div className={`grid gap-3 ${
        selected.length === 3 ? 'grid-cols-3' :
        selected.length === 2 ? 'grid-cols-2 md:grid-cols-3' :
        'grid-cols-1 md:grid-cols-3'
      }`}>
        <AnimatePresence mode="popLayout">
          {selected.map(pw => (
            <PlayerCardHeader
              key={pw.player.id}
              pw={pw}
              onRemove={() => handleRemovePlayer(pw.player.id)}
              onDetail={onDetail}
            />
          ))}
        </AnimatePresence>
        {Array.from({ length: Math.max(0, (selected.length === 0 ? 3 : selected.length >= 2 ? 3 : 3) - selected.length) }).map((_, i) => (
          <EmptySlot key={`empty-${i}`} index={selected.length + i} />
        ))}
      </div>

      {/* Comparison table */}
      {selected.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Loading indicator */}
          {anyLoading && (
            <div className="px-4 py-3 text-center text-xs text-gray-600 border-b border-white/5"
              style={{ background: '#07090f' }}>
              Loading career stats...
            </div>
          )}

          {/* Stat rows */}
          <div className="divide-y divide-white/5">
            {STAT_ROWS.map(stat => {
              const values = selected.map(pw => stat.getValue(pw));
              const bestIdx = findBestIndex(values, stat.higherIsBetter);
              const maxVal = Math.max(...values.map(v => Math.abs(v)), 1);

              return (
                <div key={stat.key} className="px-4 py-3.5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stat.color }} />
                    <span className="text-xs font-black uppercase tracking-wider text-gray-500">{stat.label}</span>
                  </div>

                  <div className={`grid gap-3 ${selected.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-3'}`}>
                    {selected.map((pw, idx) => {
                      const val = values[idx];
                      const isBest = idx === bestIdx;
                      const formatted = stat.format ? stat.format(val) : String(val);

                      return (
                        <div key={pw.player.id} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-600 truncate">{pw.player.name}</span>
                            <span
                              className="text-sm font-black tabular-nums"
                              style={{ color: isBest ? '#22C55E' : '#9CA3AF' }}
                            >
                              {formatted}
                            </span>
                          </div>
                          <StatBar
                            value={Math.abs(val)}
                            maxValue={maxVal}
                            color={stat.color}
                            isBest={isBest}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Team info row */}
          <div className="px-4 py-3.5 border-t border-white/5" style={{ background: '#07090f' }}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#6B7280' }} />
              <span className="text-xs font-black uppercase tracking-wider text-gray-500">Team</span>
            </div>
            <div className={`grid gap-3 ${selected.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-3'}`}>
              {selected.map(pw => (
                <div key={pw.player.id} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-600 truncate">{pw.player.name}</span>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-lg ml-auto"
                    style={{ background: `${pw.player.team_color}20`, color: pw.player.team_color }}
                  >
                    {pw.player.team_short}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {selected.length < 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl p-8 text-center"
          style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <BarChart2 className="w-10 h-10 text-gray-800 mx-auto mb-3" />
          <p className="text-gray-600 text-sm font-bold">
            {selected.length === 0
              ? 'Search and select at least 2 players to start comparing'
              : 'Add one more player to begin the comparison'}
          </p>
          <p className="text-gray-700 text-xs mt-2">
            Compare fantasy points, KDA, MVPs, and more
          </p>
        </motion.div>
      )}
    </div>
  );
}
