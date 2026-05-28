import { Trophy, Users, Star, TrendingUp, Swords, Shield, Globe, Target, Award, BarChart2, BarChart3 } from 'lucide-react';
import type { Tab } from '../../components/fantasy/types';

interface TabDef {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  modes: string[];
}

const DESKTOP_TABS: TabDef[] = [
  { id: 'overview',    label: 'Standings',     icon: <TrendingUp className="w-4 h-4" />, modes: ['player','team','both'] },
  { id: 'draft',       label: 'Fantasy Draft',  icon: <Users      className="w-4 h-4" />, modes: ['player','both'] },
  { id: 'players',     label: 'All Players',    icon: <Star       className="w-4 h-4" />, modes: ['player','both'] },
  { id: 'leaderboard', label: 'Leaderboard',    icon: <Trophy     className="w-4 h-4" />, modes: ['player','team','both'] },
  { id: 'matches',     label: 'Matches',        icon: <Swords     className="w-4 h-4" />, modes: ['player','team','both'] },
  { id: 'team',        label: 'Pick Team',      icon: <Shield     className="w-4 h-4" />, modes: ['team','both'] },
  { id: 'predictions', label: 'Predictions',    icon: <Target     className="w-4 h-4" />, modes: ['player','team','both'] },
  { id: 'leagues',     label: 'Leagues',        icon: <Globe      className="w-4 h-4" />, modes: ['player','team','both'] },
  { id: 'meta',          label: 'Hero Meta',     icon: <BarChart3   className="w-4 h-4" />, modes: ['player','both'] },
  { id: 'compare',      label: 'Compare',       icon: <BarChart2   className="w-4 h-4" />, modes: ['player','both'] },
  { id: 'achievements', label: 'Achievements', icon: <Award      className="w-4 h-4" />, modes: ['player','team','both'] },
];

const MOBILE_TABS: TabDef[] = [
  { id: 'overview',    label: 'Home',    icon: <TrendingUp className="w-5 h-5" />, modes: ['player','team','both'] },
  { id: 'draft',       label: 'Draft',   icon: <Users      className="w-5 h-5" />, modes: ['player','both'] },
  { id: 'leaderboard', label: 'Ranks',   icon: <Trophy     className="w-5 h-5" />, modes: ['player','team','both'] },
  { id: 'matches',     label: 'Matches', icon: <Swords     className="w-5 h-5" />, modes: ['player','team','both'] },
  { id: 'predictions', label: 'Predict', icon: <Target     className="w-5 h-5" />, modes: ['player','team','both'] },
];

interface FantasyTabNavProps {
  tab: Tab;
  setTab: (t: Tab) => void;
  activeMode: 'player' | 'team' | 'both' | null;
  onBackToModeSelector: () => void;
}

export function DesktopTabNav({ tab, setTab, activeMode, onBackToModeSelector }: FantasyTabNavProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-white/8 hidden md:block" style={{ background: '#07090f' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
            {DESKTOP_TABS
              .filter(t => activeMode === null || t.modes.includes(activeMode))
              .map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                    tab === t.id ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-600 hover:text-gray-300'
                  }`}>
                  {t.icon} {t.label}
                </button>
              ))}
          </div>
          <button
            onClick={onBackToModeSelector}
            className="flex-shrink-0 ml-3 text-xs font-bold text-gray-600 hover:text-gray-400 transition-colors whitespace-nowrap py-4 border-b-2 border-transparent">
            {'\u21A9'} Ganti Mode
          </button>
        </div>
      </div>
    </div>
  );
}

export function MobileBottomNav({ tab, setTab, activeMode }: Omit<FantasyTabNavProps, 'onBackToModeSelector'>) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden border-t border-white/8 safe-area-bottom"
      style={{ background: '#07090fee', backdropFilter: 'blur(12px)' }}>
      <div className="flex justify-around items-center">
        {MOBILE_TABS
          .filter(t => activeMode === null || t.modes.includes(activeMode))
          .map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 text-xs font-bold transition-colors ${
                tab === t.id ? 'text-amber-400' : 'text-gray-600'
              }`}>
              {t.icon}
              <span className="text-[10px]">{t.label}</span>
            </button>
          ))}
      </div>
    </div>
  );
}
