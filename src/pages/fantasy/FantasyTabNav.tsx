import { useState, useRef, useEffect } from 'react';
import { Trophy, Users, Swords, Shield, Globe, Target, Award, BarChart3, BarChart2, LayoutDashboard, MoreHorizontal, Star, X } from 'lucide-react';
import type { Tab } from '../../components/fantasy/types';

interface TabDef {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  modes: string[];
}

// ── Desktop: 6 primary tabs ─────────────────────────────────────────────────
const PRIMARY_TABS: TabDef[] = [
  { id: 'overview',    label: 'Home',          icon: <LayoutDashboard className="w-4 h-4" />, modes: ['player','team','both'] },
  { id: 'draft',       label: 'Draft',         icon: <Users className="w-4 h-4" />,           modes: ['player','both'] },
  { id: 'matches',     label: 'Matches',       icon: <Swords className="w-4 h-4" />,          modes: ['player','team','both'] },
  { id: 'leaderboard', label: 'Ranking',       icon: <Trophy className="w-4 h-4" />,          modes: ['player','team','both'] },
  { id: 'team',        label: 'Pick Team',     icon: <Shield className="w-4 h-4" />,          modes: ['team','both'] },
  { id: 'leagues',     label: 'Leagues',       icon: <Globe className="w-4 h-4" />,           modes: ['player','team','both'] },
];

// "More" overflow tabs
const MORE_TABS: TabDef[] = [
  { id: 'predictions',  label: 'Predictions',  icon: <Target className="w-4 h-4" />,   modes: ['player','team','both'] },
  { id: 'players',      label: 'All Players',  icon: <Star className="w-4 h-4" />,     modes: ['player','both'] },
  { id: 'meta',         label: 'Hero Meta',    icon: <BarChart3 className="w-4 h-4" />, modes: ['player','both'] },
  { id: 'compare',      label: 'Compare',      icon: <BarChart2 className="w-4 h-4" />, modes: ['player','both'] },
  { id: 'achievements', label: 'Achievements', icon: <Award className="w-4 h-4" />,    modes: ['player','team','both'] },
];

// ── Mobile: 5 tabs including "More" ─────────────────────────────────────────
const MOBILE_PRIMARY: TabDef[] = [
  { id: 'overview',    label: 'Home',    icon: <LayoutDashboard className="w-5 h-5" />, modes: ['player','team','both'] },
  { id: 'draft',       label: 'Draft',   icon: <Users className="w-5 h-5" />,           modes: ['player','both'] },
  { id: 'team',        label: 'Team',    icon: <Shield className="w-5 h-5" />,          modes: ['team'] },
  { id: 'matches',     label: 'Matches', icon: <Swords className="w-5 h-5" />,          modes: ['player','team','both'] },
  { id: 'leaderboard', label: 'Ranking', icon: <Trophy className="w-5 h-5" />,          modes: ['player','team','both'] },
];

const MOBILE_MORE: TabDef[] = [
  { id: 'leagues',      label: 'Leagues',      icon: <Globe className="w-5 h-5" />,     modes: ['player','team','both'] },
  { id: 'predictions',  label: 'Predictions',  icon: <Target className="w-5 h-5" />,   modes: ['player','team','both'] },
  { id: 'team',         label: 'Pick Team',    icon: <Shield className="w-5 h-5" />,    modes: ['both'] },
  { id: 'players',      label: 'All Players',  icon: <Star className="w-5 h-5" />,     modes: ['player','both'] },
  { id: 'meta',         label: 'Hero Meta',    icon: <BarChart3 className="w-5 h-5" />, modes: ['player','both'] },
  { id: 'compare',      label: 'Compare',      icon: <BarChart2 className="w-5 h-5" />, modes: ['player','both'] },
  { id: 'achievements', label: 'Achievements', icon: <Award className="w-5 h-5" />,    modes: ['player','team','both'] },
];

// ── Desktop Nav ─────────────────────────────────────────────────────────────

interface FantasyTabNavProps {
  tab: Tab;
  setTab: (t: Tab) => void;
  activeMode: 'player' | 'team' | 'both' | null;
  onBackToModeSelector: () => void;
}

export function DesktopTabNav({ tab, setTab, activeMode, onBackToModeSelector }: FantasyTabNavProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    if (moreOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [moreOpen]);

  const filteredPrimary = PRIMARY_TABS.filter(t => activeMode === null || t.modes.includes(activeMode));
  const filteredMore = MORE_TABS.filter(t => activeMode === null || t.modes.includes(activeMode));
  const isMoreActive = filteredMore.some(t => t.id === tab);

  return (
    <div className="sticky top-0 z-20 border-b border-white/8 hidden md:block" style={{ background: '#07090f' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {filteredPrimary.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                  tab === t.id ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-600 hover:text-gray-300'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}

            {/* More dropdown */}
            {filteredMore.length > 0 && (
              <div className="relative" ref={moreRef}>
                <button onClick={() => setMoreOpen(v => !v)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                    isMoreActive ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-600 hover:text-gray-300'
                  }`}>
                  <MoreHorizontal className="w-4 h-4" /> More
                </button>
                {moreOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 rounded-xl py-1 shadow-2xl z-50"
                    style={{ background: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {filteredMore.map(t => (
                      <button key={t.id} onClick={() => { setTab(t.id); setMoreOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors ${
                          tab === t.id ? 'text-amber-400 bg-amber-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={onBackToModeSelector}
            className="flex-shrink-0 ml-3 text-xs font-bold text-gray-600 hover:text-gray-400 transition-colors whitespace-nowrap py-4 border-b-2 border-transparent">
            {'\u21A9'} Ganti Mode
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mobile Bottom Nav ───────────────────────────────────────────────────────

export function MobileBottomNav({ tab, setTab, activeMode }: Omit<FantasyTabNavProps, 'onBackToModeSelector'>) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = MOBILE_PRIMARY.filter(t => activeMode === null || t.modes.includes(activeMode));
  const moreFiltered = MOBILE_MORE.filter(t => activeMode === null || t.modes.includes(activeMode));
  const isMoreActive = moreFiltered.some(t => t.id === tab);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden border-t border-white/8 safe-area-bottom"
        style={{ background: '#07090fee', backdropFilter: 'blur(12px)' }}>
        <div className="flex justify-around items-center">
          {filtered.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 text-xs font-bold transition-colors ${
                tab === t.id ? 'text-amber-400' : 'text-gray-600'
              }`}>
              {t.icon}
              <span className="text-[10px]">{t.label}</span>
            </button>
          ))}
          {/* More button */}
          <button onClick={() => setSheetOpen(true)}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 text-xs font-bold transition-colors ${
              isMoreActive ? 'text-amber-400' : 'text-gray-600'
            }`}>
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </div>

      {/* Mobile More Sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSheetOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl safe-area-bottom"
            style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none' }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-white font-black text-base">Menu Lainnya</h3>
              <button onClick={() => setSheetOpen(false)} className="text-gray-500 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-3 pb-6 grid grid-cols-3 gap-1">
              {moreFiltered.map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setSheetOpen(false); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-colors ${
                    tab === t.id ? 'text-amber-400 bg-amber-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}>
                  {t.icon}
                  <span className="text-xs font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
