import { useState, useMemo } from 'react';
import { Trophy, Target, Zap, ChevronDown, ChevronUp, Check } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { IKLMatch, IKLPlayer, PredictionType } from '../../api/fantasy';
import { ObjectivePredictions } from './ObjectivePredictions';

interface PredictionCardProps {
  match: IKLMatch;
  players: IKLPlayer[];
}

export function PredictionCard({ match, players }: PredictionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedTypes, setSavedTypes] = useState<Set<PredictionType>>(new Set());
  const [error, setError] = useState('');
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [predictedScore, setPredictedScore] = useState('');
  const [mvpPlayerId, setMvpPlayerId] = useState<number | null>(null);
  const [isConfident, setIsConfident] = useState<PredictionType | null>(null);
  const matchPlayers = useMemo(
    () => players.filter(p => p.team_id === match.team1_id || p.team_id === match.team2_id),
    [players, match.team1_id, match.team2_id],
  );

  const matchDate = match.match_date ? new Date(match.match_date) : null;

  async function submitPrediction(type: PredictionType) {
    setSaving(true);
    setError('');
    try {
      await fantasyApi.savePrediction({
        matchId: match.id,
        predictionType: type,
        winnerId: type === 'winner' ? (winnerId ?? undefined) : undefined,
        predictedScore: type === 'exact_score' ? predictedScore : undefined,
        mvpPlayerId: type === 'mvp' ? (mvpPlayerId ?? undefined) : undefined,
        isConfident: isConfident === type,
      });
      setSavedTypes(prev => new Set(prev).add(type));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    }
    setSaving(false);
  }

  // Generate score options based on best_of
  const scoreOptions = useMemo(() => {
    const winsNeeded = Math.ceil(match.best_of / 2);
    const results: string[] = [];
    for (let a = 0; a <= winsNeeded; a++) {
      for (let b = 0; b <= winsNeeded; b++) {
        if (a === winsNeeded && b < winsNeeded) results.push(`${a}-${b}`);
        if (b === winsNeeded && a < winsNeeded) results.push(`${a}-${b}`);
      }
    }
    return results;
  }, [match.best_of]);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Match header */}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
              style={{ background: `${match.team1_color}20`, color: match.team1_color }}>
              {match.team1_short}
            </div>
            <span className="text-gray-600 text-xs font-bold">vs</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
              style={{ background: `${match.team2_color}20`, color: match.team2_color }}>
              {match.team2_short}
            </div>
          </div>
          <div className="text-left">
            <div className="text-white text-sm font-bold">{match.team1_short} vs {match.team2_short}</div>
            <div className="text-gray-600 text-xs">
              Week {match.week} {match.stage !== 'regular' ? `· ${match.stage}` : ''} · BO{match.best_of}
              {matchDate && ` · ${matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savedTypes.size > 0 && (
            <span className="text-xs font-bold text-green-400 px-2 py-1 rounded-lg bg-green-500/10">
              {savedTypes.size} saved
            </span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
          {error && (
            <p className="text-red-400 text-xs font-bold bg-red-500/10 px-3 py-2 rounded-xl">{error}</p>
          )}

          {/* Winner prediction */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-green-400" /> Pick Winner
                <span className="text-green-400/60">+3 pts</span>
              </span>
              {savedTypes.has('winner') && <span className="text-green-400 text-xs font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
            </div>
            <div className="flex gap-2">
              {[
                { id: match.team1_id, short: match.team1_short, color: match.team1_color },
                { id: match.team2_id, short: match.team2_short, color: match.team2_color },
              ].map(t => (
                <button key={t.id} onClick={() => setWinnerId(t.id)}
                  className="flex-1 py-3 rounded-xl text-sm font-black transition-all"
                  style={{
                    background: winnerId === t.id ? `${t.color}20` : 'rgba(255,255,255,0.03)',
                    color: winnerId === t.id ? t.color : '#6B7280',
                    border: winnerId === t.id ? `1px solid ${t.color}50` : '1px solid rgba(255,255,255,0.07)',
                  }}>
                  {t.short}
                </button>
              ))}
            </div>
            {winnerId && !savedTypes.has('winner') && (
              <button onClick={() => submitPrediction('winner')} disabled={saving}
                className="w-full py-2 rounded-xl text-xs font-black transition-all disabled:opacity-40"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
                {saving ? 'Saving...' : 'Confirm Winner Prediction'}
              </button>
            )}
          </div>

          {/* BO7 Ultimate Battle note */}
          {match.best_of === 7 && (
            <div className="rounded-xl px-3 py-2 flex items-center gap-2"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <span className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse flex-shrink-0">
                BO7
              </span>
              <span className="text-xs text-amber-400/80 font-bold">
                Ultimate Battle - Game 7 has chaos mode rules. 1.5x prediction bonus if it goes the distance!
              </span>
            </div>
          )}

          {/* Exact score prediction */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Exact Score
                <span className="text-amber-400/60">+5 pts</span>
              </span>
              {savedTypes.has('exact_score') && <span className="text-green-400 text-xs font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {scoreOptions.map(score => (
                <button key={score} onClick={() => setPredictedScore(score)}
                  className="px-3 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: predictedScore === score ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
                    color: predictedScore === score ? '#F59E0B' : '#6B7280',
                    border: predictedScore === score ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.07)',
                  }}>
                  {score}
                </button>
              ))}
            </div>
            {predictedScore && !savedTypes.has('exact_score') && (
              <button onClick={() => submitPrediction('exact_score')} disabled={saving}
                className="w-full py-2 rounded-xl text-xs font-black transition-all disabled:opacity-40"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                {saving ? 'Saving...' : `Confirm Score: ${predictedScore}`}
              </button>
            )}
          </div>

          {/* MVP prediction */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-purple-400" /> Series MVP
                <span className="text-purple-400/60">+4 pts</span>
              </span>
              {savedTypes.has('mvp') && <span className="text-green-400 text-xs font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {matchPlayers.map(p => (
                <button key={p.id} onClick={() => setMvpPlayerId(p.id)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: mvpPlayerId === p.id ? `${p.team_color}15` : 'rgba(255,255,255,0.03)',
                    color: mvpPlayerId === p.id ? p.team_color : '#6B7280',
                    border: mvpPlayerId === p.id ? `1px solid ${p.team_color}40` : '1px solid rgba(255,255,255,0.07)',
                  }}>
                  {p.photo_url ? (
                    <img src={p.photo_url} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black flex-shrink-0"
                      style={{ background: `${p.team_color}30`, color: p.team_color }}>
                      {p.name.slice(0, 2)}
                    </div>
                  )}
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
            {mvpPlayerId && !savedTypes.has('mvp') && (
              <button onClick={() => submitPrediction('mvp')} disabled={saving}
                className="w-full py-2 rounded-xl text-xs font-black transition-all disabled:opacity-40"
                style={{ background: 'rgba(168,85,247,0.1)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.3)' }}>
                {saving ? 'Saving...' : `Confirm MVP: ${matchPlayers.find(p => p.id === mvpPlayerId)?.name}`}
              </button>
            )}
          </div>

          {/* #19-24: Objective predictions */}
          <ObjectivePredictions match={match} savedTypes={savedTypes}
            onSaved={(type) => setSavedTypes(prev => new Set(prev).add(type))} />

          {/* #30: Confidence multiplier */}
          <div className="pt-2 border-t border-white/5">
            <div className="text-[10px] font-bold text-gray-600 mb-1.5">
              2x CONFIDENT (1 per matchday — double pts if correct, 0 if wrong)
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(['winner', 'exact_score', 'mvp'] as PredictionType[]).map(type => (
                <button key={type} onClick={() => setIsConfident(isConfident === type ? null : type)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                  style={{
                    background: isConfident === type ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.03)',
                    color: isConfident === type ? '#FBBF24' : '#6B7280',
                    border: isConfident === type ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.05)',
                  }}>
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
