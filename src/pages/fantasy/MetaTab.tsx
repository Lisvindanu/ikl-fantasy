import { useState, useEffect, useMemo } from 'react';
import { Search, ArrowUpDown, TrendingUp, Shield } from 'lucide-react';
import type { HeroMeta } from '../../api/fantasy-career';
import { getSeasonHeroMeta } from '../../api/fantasy-career';

type SortField = 'pick_rate' | 'ban_rate' | 'win_rate' | 'pick_count' | 'ban_count' | 'hero_name';
type SortDir = 'asc' | 'desc';

interface MetaTabProps {
  seasonId: number;
}

function RateBar({ value, max, color, bgColor }: { value: number; max: number; color: string; bgColor: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: bgColor, boxShadow: `0 0 6px ${color}40` }}
        />
      </div>
      <span className="text-xs font-black w-12 text-right" style={{ color }}>
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

export function MetaTab({ seasonId }: MetaTabProps) {
  const [heroes, setHeroes] = useState<HeroMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('pick_rate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    setLoading(true);
    getSeasonHeroMeta(seasonId)
      .then(data => setHeroes(data))
      .catch(() => setHeroes([]))
      .finally(() => setLoading(false));
  }, [seasonId]);

  const maxPickRate = useMemo(() => Math.max(...heroes.map(h => h.pick_rate), 1), [heroes]);
  const maxBanRate = useMemo(() => Math.max(...heroes.map(h => h.ban_rate), 1), [heroes]);
  const maxWinRate = useMemo(() => Math.max(...heroes.map(h => h.win_rate), 1), [heroes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = q ? heroes.filter(h => h.hero_name.toLowerCase().includes(q)) : [...heroes];

    list.sort((a, b) => {
      const aVal = a[sortField as keyof HeroMeta];
      const bVal = b[sortField as keyof HeroMeta];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      const diff = (bVal as number) - (aVal as number);
      return sortDir === 'asc' ? -diff : diff;
    });

    return list;
  }, [heroes, search, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (heroes.length === 0) {
    return (
      <div className="text-center py-20">
        <Shield className="w-12 h-12 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500 font-bold">No hero data available yet</p>
        <p className="text-gray-700 text-sm mt-1">Hero picks/bans will appear here once match data is entered</p>
      </div>
    );
  }

  const totalGames = heroes[0]?.total_games || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Hero Meta
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            {heroes.length} heroes across {totalGames} games this season
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search hero..."
            className="pl-9 pr-3 py-2 rounded-xl text-sm font-bold text-white outline-none w-48"
            style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl p-3" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Total Heroes</div>
          <div className="text-xl font-black text-white">{heroes.length}</div>
        </div>
        <div className="rounded-xl p-3" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Total Games</div>
          <div className="text-xl font-black text-white">{totalGames}</div>
        </div>
        <div className="rounded-xl p-3" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Most Picked</div>
          <div className="text-sm font-black text-amber-400 truncate">
            {heroes.reduce((best, h) => h.pick_count > best.pick_count ? h : best, heroes[0])?.hero_name || '-'}
          </div>
        </div>
        <div className="rounded-xl p-3" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Most Banned</div>
          <div className="text-sm font-black text-red-400 truncate">
            {heroes.reduce((best, h) => h.ban_count > best.ban_count ? h : best, heroes[0])?.hero_name || '-'}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 text-[10px] font-black text-gray-600 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <button className="col-span-3 flex items-center gap-1 hover:text-gray-400 transition-colors text-left" onClick={() => toggleSort('hero_name')}>
            Hero {sortField === 'hero_name' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button className="col-span-2 flex items-center gap-1 hover:text-gray-400 transition-colors" onClick={() => toggleSort('pick_rate')}>
            Pick Rate {sortField === 'pick_rate' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button className="col-span-2 flex items-center gap-1 hover:text-gray-400 transition-colors" onClick={() => toggleSort('ban_rate')}>
            Ban Rate {sortField === 'ban_rate' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button className="col-span-2 flex items-center gap-1 hover:text-gray-400 transition-colors" onClick={() => toggleSort('win_rate')}>
            Win Rate {sortField === 'win_rate' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button className="col-span-2 flex items-center gap-1 hover:text-gray-400 transition-colors" onClick={() => toggleSort('pick_count')}>
            Games {sortField === 'pick_count' && <ArrowUpDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Table rows */}
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-600 text-sm font-bold">
            No heroes match your search
          </div>
        ) : (
          filtered.map((hero, i) => {
            const winColor = hero.win_rate >= 55 ? '#22C55E' : hero.win_rate >= 45 ? '#EAB308' : '#EF4444';
            const winBg = hero.win_rate >= 55 ? 'rgba(34,197,94,0.5)' : hero.win_rate >= 45 ? 'rgba(234,179,8,0.5)' : 'rgba(239,68,68,0.5)';

            return (
              <div key={hero.hero_name}>
                {/* Desktop row */}
                <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <div className="col-span-1 text-xs text-gray-700 font-bold">{i + 1}</div>
                  <div className="col-span-3 text-sm font-black text-white truncate">{hero.hero_name}</div>
                  <div className="col-span-2">
                    <RateBar value={hero.pick_rate} max={maxPickRate} color="#3B82F6" bgColor="rgba(59,130,246,0.5)" />
                  </div>
                  <div className="col-span-2">
                    <RateBar value={hero.ban_rate} max={maxBanRate} color="#EF4444" bgColor="rgba(239,68,68,0.5)" />
                  </div>
                  <div className="col-span-2">
                    <RateBar value={hero.win_rate} max={maxWinRate} color={winColor} bgColor={winBg} />
                  </div>
                  <div className="col-span-2 text-xs text-gray-500 font-bold">
                    <span className="text-blue-400">{hero.pick_count}</span>
                    <span className="text-gray-700 mx-1">/</span>
                    <span className="text-red-400">{hero.ban_count}</span>
                    <span className="text-gray-700 ml-1 text-[10px]">P/B</span>
                  </div>
                </div>

                {/* Mobile row */}
                <div className="sm:hidden px-4 py-3 border-b border-white/[0.04] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-700 font-bold w-6">{i + 1}</span>
                      <span className="text-sm font-black text-white">{hero.hero_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold">
                      <span className="px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>
                        {hero.pick_count}P
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
                        {hero.ban_count}B
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-[10px] text-gray-600 font-bold mb-0.5">Pick</div>
                      <RateBar value={hero.pick_rate} max={maxPickRate} color="#3B82F6" bgColor="rgba(59,130,246,0.5)" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-600 font-bold mb-0.5">Ban</div>
                      <RateBar value={hero.ban_rate} max={maxBanRate} color="#EF4444" bgColor="rgba(239,68,68,0.5)" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-600 font-bold mb-0.5">Win</div>
                      <RateBar value={hero.win_rate} max={maxWinRate} color={winColor} bgColor={winBg} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-gray-600 font-bold">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#3B82F6' }} />
          Pick Rate
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#EF4444' }} />
          Ban Rate
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22C55E' }} />
          Win Rate
        </div>
      </div>
    </div>
  );
}
