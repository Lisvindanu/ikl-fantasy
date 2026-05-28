import { useState, useEffect, useMemo } from 'react';
import { Trophy, Target, Zap, Lock } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { IKLMatch, IKLPlayer, Prediction, PredictionLeaderboardEntry } from '../../api/fantasy';
import { PredictionCard } from './PredictionCard';
import { MyPredictionsList } from './MyPredictionsList';
import { PredictionLeaderboard } from './PredictionLeaderboard';

interface PredictionsTabProps {
  seasonId: number;
  matches: IKLMatch[];
  players: IKLPlayer[];
  isAuthenticated: boolean;
}

type SubTab = 'predict' | 'my' | 'leaderboard';

export function PredictionsTab({ seasonId, matches, players, isAuthenticated }: PredictionsTabProps) {
  const [subTab, setSubTab] = useState<SubTab>('predict');
  const [myPredictions, setMyPredictions] = useState<Prediction[]>([]);
  const [leaderboard, setLeaderboard] = useState<PredictionLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const upcomingMatches = useMemo(
    () => matches.filter(m => m.status === 'upcoming').sort((a, b) => {
      const da = a.match_date ? new Date(a.match_date).getTime() : 0;
      const db = b.match_date ? new Date(b.match_date).getTime() : 0;
      return da - db;
    }),
    [matches],
  );

  useEffect(() => {
    if (subTab === 'my' && isAuthenticated) {
      setLoading(true);
      fantasyApi.getMyPredictions(seasonId).then(d => {
        setMyPredictions(Array.isArray(d) ? d : []);
      }).finally(() => setLoading(false));
    }
    if (subTab === 'leaderboard') {
      setLoading(true);
      fantasyApi.getPredictionLeaderboard(seasonId).then(d => {
        setLeaderboard(Array.isArray(d) ? d : []);
      }).finally(() => setLoading(false));
    }
  }, [subTab, seasonId, isAuthenticated]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Match Predictions</h2>
          <p className="text-gray-500 text-sm mt-1">Predict match outcomes and earn bonus points</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5 text-green-400" /> Winner = 3pts</span>
          <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> Score = 5pts</span>
          <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-purple-400" /> MVP = 4pts</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1.5">
        {([
          { id: 'predict', label: 'Predict' },
          { id: 'my', label: 'My Predictions' },
          { id: 'leaderboard', label: 'Leaderboard' },
        ] as { id: SubTab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: subTab === t.id ? 'rgba(245,158,11,0.15)' : '#0d1017',
              color: subTab === t.id ? '#F59E0B' : '#6B7280',
              border: subTab === t.id ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.07)',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'predict' && (
        !isAuthenticated ? (
          <div className="rounded-2xl p-8 text-center space-y-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Lock className="w-10 h-10 text-gray-600 mx-auto" />
            <p className="text-gray-400 font-bold">Login to make predictions</p>
            <button onClick={() => { window.location.href = '/auth'; }}
              className="px-6 py-2.5 rounded-xl text-sm font-black"
              style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
              Login
            </button>
          </div>
        ) : upcomingMatches.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-gray-500 font-bold">No upcoming matches to predict</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingMatches.map(match => (
              <PredictionCard key={match.id} match={match} players={players} />
            ))}
          </div>
        )
      )}

      {subTab === 'my' && (
        loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : !isAuthenticated ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-gray-500 font-bold">Login to see your predictions</p>
          </div>
        ) : myPredictions.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-gray-500 font-bold">No predictions yet</p>
            <button onClick={() => setSubTab('predict')} className="text-amber-400 text-sm font-bold mt-2 hover:underline">
              Make your first prediction
            </button>
          </div>
        ) : (
          <MyPredictionsList predictions={myPredictions} />
        )
      )}

      {subTab === 'leaderboard' && (
        loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-gray-500 font-bold">No predictions yet this season</p>
          </div>
        ) : (
          <PredictionLeaderboard entries={leaderboard} />
        )
      )}
    </div>
  );
}
