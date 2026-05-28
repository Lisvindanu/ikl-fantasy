import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Wallet, LayoutGrid, Users, Save } from 'lucide-react';
import { ROLE_META, ROLES, FORMATION_LAYOUT, BUDGET, MAX_PER_TEAM } from '../../components/fantasy/types';
import type { Role, DraftProps } from '../../components/fantasy/types';
import type { IKLPlayer } from '../../api/fantasy';
import { RoleImg } from '../../components/fantasy/RoleImg';
import { CompactLineupStrip } from '../../components/fantasy/CompactLineupStrip';
import { FormationSlot } from '../../components/fantasy/FormationSlot';
import { PickerCard } from '../../components/fantasy/PickerCard';
import { DraftActions } from './DraftActions';
import { useSwipeHintShown, markSwipeHintShown } from '../../hooks/useSwipeGesture';

type MobileView = 'lineup' | 'players';

export function MobileDraftPage({
  picks, setPicks,
  activeRole, setActiveRole,
  search, setSearch,
  filterRole, setFilterRole,
  sortBy, setSortBy,
  teamName, setTeamName,
  saving, saveMsg, onSave, onDetail,
  isAuthenticated,
  budget, budgetLeft, totalPts, filledCount,
  pickedIds, teamCounts, filteredPlayers, roleCounts,
  selectPlayer,
  captainId, viceCaptainId, setCaptainId, setViceCaptainId,
  benchPicks, setBenchPicks,
}: DraftProps) {
  const [view, setView] = useState<MobileView>('players');
  const hintShown = useSwipeHintShown();
  const [showSwipeHint, setShowSwipeHint] = useState(!hintShown);

  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
        markSwipeHintShown();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

  return (
    <div className="flex flex-col gap-0">
      {/* View toggle */}
      <div className="flex rounded-2xl overflow-hidden mb-4 p-1 gap-1"
        style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => setView('lineup')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all"
          style={{
            background: view === 'lineup' ? 'linear-gradient(90deg,#F59E0B22,#D9770622)' : 'transparent',
            color: view === 'lineup' ? '#F59E0B' : '#4B5563',
            border: view === 'lineup' ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
          }}
        >
          <LayoutGrid className="w-4 h-4" />
          Formation
          {filledCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}>
              {filledCount}/5
            </span>
          )}
        </button>
        <button
          onClick={() => setView('players')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all"
          style={{
            background: view === 'players' ? 'rgba(255,255,255,0.05)' : 'transparent',
            color: view === 'players' ? '#fff' : '#4B5563',
            border: view === 'players' ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
          }}
        >
          <Users className="w-4 h-4" />
          Players
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'lineup' ? (
          <motion.div
            key="lineup"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="space-y-4"
          >
            {/* Budget bar */}
            <div className="rounded-2xl p-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-black text-white">
                  <Wallet className="w-4 h-4 text-amber-400" /> Budget
                </div>
                <div className={`font-black text-lg ${budgetLeft < 10 ? 'text-red-400' : 'text-amber-400'}`}>
                  {budgetLeft}<span className="text-gray-700 text-sm font-normal"> / {BUDGET} cr</span>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {Array.from({ length: 10 }).map((_, i) => {
                  const segValue = (i + 1) * 10;
                  const filled = budget >= segValue;
                  const partial = budget > segValue - 10 && budget < segValue;
                  return (
                    <div key={i} className="flex-1 h-2.5 rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div className="h-full transition-all" style={{
                        width: partial ? `${((budget % 10) / 10) * 100}%` : filled ? '100%' : '0%',
                        background: budget > 85 ? '#EF4444' : 'linear-gradient(90deg,#F59E0B,#FBBF24)',
                      }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-700">
                <span>{budget} cr spent</span>
                <span>max {MAX_PER_TEAM} per team</span>
              </div>
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/6">
                <span className="text-gray-700 text-xs font-bold mr-1">{filledCount}/5 + {benchPicks.filter(Boolean).length}/2</span>
                {ROLES.map(r => (
                  <div key={r} className="flex-1 h-1.5 rounded-full transition-colors"
                    style={{ background: picks[r] ? ROLE_META[r].color : 'rgba(255,255,255,0.1)' }} />
                ))}
              </div>
            </div>

            {/* Formation map — full width on mobile */}
            <div className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(180deg, #0d1520 0%, #0a1018 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(245,158,11,0.4) 0%, transparent 100%)' }} />
              <div className="text-xs font-black uppercase tracking-widest text-gray-600 mb-4 text-center">Lineup</div>
              <div className="space-y-3">
                {FORMATION_LAYOUT.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex gap-3 justify-center">
                    {row.map(role => (
                      <FormationSlot
                        key={role}
                        role={role}
                        player={picks[role]}
                        isActive={activeRole === role}
                        onClick={() => { setActiveRole(role); setView('players'); setFilterRole(role); }}
                        onRemove={e => { e.stopPropagation(); setPicks(p => ({ ...p, [role]: null })); if (picks[role]?.id === captainId) setCaptainId(null); if (picks[role]?.id === viceCaptainId) setViceCaptainId(null); }}
                        isCaptain={picks[role]?.id === captainId}
                        isViceCaptain={picks[role]?.id === viceCaptainId}
                        onSetCaptain={e => { e.stopPropagation(); const pid = picks[role]?.id; if (!pid) return; if (captainId === pid) { setCaptainId(null); } else { setCaptainId(pid); if (viceCaptainId === pid) setViceCaptainId(null); } }}
                        onSetViceCaptain={e => { e.stopPropagation(); const pid = picks[role]?.id; if (!pid) return; if (viceCaptainId === pid) { setViceCaptainId(null); } else { setViceCaptainId(pid); if (captainId === pid) setCaptainId(null); } }}
                      />
                    ))}
                  </div>
                ))}
              </div>
              {/* Bench slots (#3) */}
              <div className="mt-4 pt-3 border-t border-white/6">
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2 text-center">Bench</div>
                <div className="flex gap-3 justify-center">
                  {([0, 1] as const).map(idx => {
                    const player = benchPicks[idx];
                    return (
                      <div key={`bench-${idx}`}
                        className="relative w-20 h-24 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all"
                        style={{
                          background: player ? `${player.team_color}15` : 'rgba(255,255,255,0.03)',
                          border: player ? `1px solid ${player.team_color}40` : '1px dashed rgba(255,255,255,0.1)',
                        }}
                      >
                        {player ? (
                          <>
                            {player.photo_url ? (
                              <img src={player.photo_url} alt={player.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs"
                                style={{ background: `${player.team_color}30`, color: player.team_color }}>
                                {player.name.slice(0, 2)}
                              </div>
                            )}
                            <span className="text-[10px] font-bold text-white mt-1 truncate w-full text-center px-1">{player.name}</span>
                            <span className="text-[10px]" style={{ color: player.team_color }}>{player.team_short}</span>
                            <button
                              onClick={e => { e.stopPropagation(); setBenchPicks(prev => { const n = [...prev] as [IKLPlayer | null, IKLPlayer | null]; n[idx] = null; return n; }); }}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-gray-500 hover:text-white"
                              style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.2)', fontSize: '10px' }}>
                              ×
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center text-gray-700 text-xs">+</div>
                            <span className="text-[10px] text-gray-700 mt-1">Sub {idx + 1}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {totalPts > 0 && (
                <div className="mt-4 pt-4 border-t border-white/6 flex items-center justify-between">
                  <span className="text-gray-600 text-xs font-bold uppercase tracking-wider">Projected</span>
                  <span className="text-amber-400 font-black text-2xl">{totalPts} pts</span>
                </div>
              )}
            </div>

            <DraftActions
              teamName={teamName} setTeamName={setTeamName}
              saving={saving} saveMsg={saveMsg} onSave={onSave}
              isAuthenticated={isAuthenticated} filledCount={filledCount}
              setPicks={setPicks} setBenchPicks={setBenchPicks}
            />
          </motion.div>
        ) : (
          <motion.div
            key="players"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            className="space-y-3"
          >
            {/* Compact lineup strip */}
            <CompactLineupStrip
              picks={picks}
              activeRole={activeRole}
              onSlotClick={role => setActiveRole(role)}
              onRemove={role => setPicks(p => ({ ...p, [role]: null }))}
              totalPts={totalPts}
            />

            {/* Search + sort */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-white placeholder-gray-700 text-sm focus:outline-none"
                  style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as 'pts' | 'price' | 'mvps')}
                className="px-3 py-2.5 rounded-xl text-gray-400 text-sm focus:outline-none"
                style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.1)' }}>
                <option value="pts">Points</option>
                <option value="mvps">MVPs</option>
                <option value="price">Price</option>
              </select>
            </div>

            {/* Role filter */}
            <div className="flex gap-1.5" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
              {(['ALL', ...ROLES] as (Role | 'ALL')[]).map(r => {
                const active = filterRole === r;
                const color = r === 'ALL' ? '#F59E0B' : ROLE_META[r as Role].color;
                const count = roleCounts[r] || 0;
                return (
                  <button key={r} onClick={() => setFilterRole(r)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: active ? `${color}18` : '#0d1017',
                      color: active ? color : '#4B5563',
                      border: active ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.07)',
                    }}>
                    {r !== 'ALL' && <RoleImg role={r as Role} size={13} />}
                    {r === 'ALL' ? 'All' : ROLE_META[r as Role].short}
                    <span className="px-1.5 py-0.5 rounded-full text-xs"
                      style={{ background: active ? `${color}25` : 'rgba(255,255,255,0.07)', color: active ? color : '#6B7280' }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active role hint */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-600"
              style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: ROLE_META[activeRole].color, boxShadow: `0 0 6px ${ROLE_META[activeRole].color}` }} />
              Picking for <span className="font-bold ml-1" style={{ color: ROLE_META[activeRole].color }}>{ROLE_META[activeRole].label}</span>
              <span className="ml-auto text-white font-bold">{budgetLeft} cr left</span>
            </div>

            {/* Swipe hint for first-time users */}
            {showSwipeHint && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <span className="text-indigo-400">Swipe right to add, left to skip</span>
                <button
                  onClick={() => { setShowSwipeHint(false); markSwipeHintShown(); }}
                  className="ml-auto text-gray-600 hover:text-white text-xs font-bold">
                  Got it
                </button>
              </div>
            )}

            {/* Floating draft summary — always visible context */}
            {filledCount > 0 && (
              <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-3 py-2 rounded-xl -mx-1"
                style={{ background: '#07090fee', backdropFilter: 'blur(8px)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-amber-400">{filledCount}/5</span>
                  <div className="flex gap-0.5">
                    {ROLES.map(r => (
                      <div key={r} className="w-4 h-1.5 rounded-full"
                        style={{ background: picks[r] ? ROLE_META[r].color : 'rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-black ${budgetLeft < 10 ? 'text-red-400' : 'text-white'}`}>
                    {budgetLeft} cr
                  </span>
                  {filledCount === 5 && (
                    <button onClick={onSave} disabled={saving}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black text-black"
                      style={{ background: 'linear-gradient(90deg,#FBBF24,#F59E0B)' }}>
                      <Save className="w-3 h-3" /> Save
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Player list — single column on mobile */}
            <div className="space-y-2">
              {filteredPlayers.map(player => {
                const isSelected = pickedIds.has(player.id);
                const overBudget = !isSelected && player.price > budgetLeft;
                const overTeam = !isSelected && (teamCounts[player.team_short] || 0) >= MAX_PER_TEAM;
                const allFilled = Object.values(picks).every(Boolean) && benchPicks.every(Boolean) && !isSelected;
                return (
                  <PickerCard
                    key={player.id}
                    player={player}
                    selected={isSelected}
                    onSelect={() => selectPlayer(player)}
                    disabled={overBudget || overTeam || allFilled}
                    onDetail={() => onDetail(player)}
                    enableSwipe
                  />
                );
              })}
            </div>

            {/* Mobile save actions below list */}
            <div className="pt-2 space-y-2">
              <DraftActions
                teamName={teamName} setTeamName={setTeamName}
                saving={saving} saveMsg={saveMsg} onSave={onSave}
                isAuthenticated={isAuthenticated} filledCount={filledCount}
                setPicks={setPicks} setBenchPicks={setBenchPicks}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
