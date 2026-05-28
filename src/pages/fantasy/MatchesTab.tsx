import { useState, useEffect, useCallback, useRef } from 'react';
import { Swords, Trophy, Radio, Target, Zap } from 'lucide-react';
import type { IKLMatch, IKLPlayer } from '../../api/fantasy';
import { getMatches } from '../../api/fantasy';
import { MatchCard, STAGE_LABEL } from './MatchCard';
import { PlayoffBracket } from './PlayoffBracket';
import { PredictionCard } from './PredictionCard';

interface Props {
  matches: IKLMatch[];
  loading: boolean;
  seasonId?: number;
  // Predictions integration
  players?: IKLPlayer[];
  isAuthenticated?: boolean;
}

const POLL_INTERVAL = 30_000; // 30 seconds

export function MatchesTab({ matches: initialMatches, loading, seasonId, players = [], isAuthenticated = false }: Props) {
  const [matches, setMatches] = useState(initialMatches);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync with parent when initialMatches changes
  useEffect(() => {
    setMatches(initialMatches);
  }, [initialMatches]);

  const hasLiveMatches = matches.some(m => m.status === 'live');

  const refetch = useCallback(async () => {
    if (!seasonId) return;
    try {
      const fresh = await getMatches(seasonId);
      if (Array.isArray(fresh)) setMatches(fresh);
    } catch {
      // Silently fail on auto-refresh
    }
  }, [seasonId]);

  // Auto-refresh polling when live matches exist (#31)
  useEffect(() => {
    if (hasLiveMatches && seasonId) {
      setIsAutoRefreshing(true);
      intervalRef.current = setInterval(refetch, POLL_INTERVAL);
    } else {
      setIsAutoRefreshing(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hasLiveMatches, seasonId, refetch]);

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-4 space-y-3" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex justify-between">
            <div className="h-3 w-28 rounded-full bg-white/5 animate-pulse" />
            <div className="h-3 w-20 rounded-full bg-white/5 animate-pulse" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-5 w-16 rounded bg-white/5 animate-pulse" />
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
              <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
            </div>
            <div className="h-5 w-16 rounded bg-white/5 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!matches.length) return (
    <div className="py-20 text-center rounded-2xl max-w-md mx-auto" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Swords className="w-14 h-14 text-gray-800 mx-auto mb-4" />
      <p className="text-gray-400 font-black text-lg mb-2">No Matches Yet</p>
      <p className="text-gray-600 text-sm leading-relaxed px-6">
        Match results will appear here once the IKL season gets underway. Stay tuned for exciting series!
      </p>
    </div>
  );

  // Group by week
  const byWeek: Record<number, IKLMatch[]> = {};
  for (const m of matches) {
    if (!byWeek[m.week]) byWeek[m.week] = [];
    byWeek[m.week].push(m);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Live auto-refresh indicator (#31) */}
      {isAutoRefreshing && (
        <div className="flex items-center justify-center gap-2 py-2 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">LIVE</span>
          <span className="text-xs text-gray-500">Auto-refreshing every 30s</span>
        </div>
      )}

      {/* Playoff Bracket (#44) */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-4 flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          Playoff Bracket
        </h3>
        <PlayoffBracket matches={matches} />
      </div>

      {/* Inline predictions for upcoming matches */}
      {isAuthenticated && (() => {
        const upcoming = matches.filter(m => m.status === 'upcoming');
        if (upcoming.length === 0) return null;
        return (
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-green-400" />
              Prediksi Match Mendatang
              <span className="ml-auto flex items-center gap-2 text-[10px] text-gray-700 font-bold normal-case tracking-normal">
                <span className="flex items-center gap-0.5"><Target className="w-3 h-3 text-green-400" />Winner 3pts</span>
                <span className="flex items-center gap-0.5"><Zap className="w-3 h-3 text-amber-400" />Score 5pts</span>
              </span>
            </h3>
            <div className="space-y-3">
              {upcoming.slice(0, 5).map(match => (
                <PredictionCard key={`pred-${match.id}`} match={match} players={players} />
              ))}
            </div>
          </div>
        );
      })()}

      {/* Match list by week */}
      {Object.entries(byWeek)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([week, weekMatches]) => (
          <div key={week}>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              {weekMatches[0].stage !== 'regular' ? STAGE_LABEL[weekMatches[0].stage] : `Week ${week}`}
            </h3>
            <div className="space-y-3">
              {weekMatches.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>
        ))}
    </div>
  );
}
