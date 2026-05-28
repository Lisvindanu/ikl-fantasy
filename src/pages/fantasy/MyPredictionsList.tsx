import { useMemo } from 'react';
import { Trophy, Target, Zap, Check, X } from 'lucide-react';
import type { Prediction } from '../../api/fantasy';

interface MyPredictionsListProps {
  predictions: Prediction[];
}

export function MyPredictionsList({ predictions }: MyPredictionsListProps) {
  // Group by match
  const grouped = useMemo(() => {
    const map = new Map<number, Prediction[]>();
    for (const p of predictions) {
      const arr = map.get(p.match_id) || [];
      arr.push(p);
      map.set(p.match_id, arr);
    }
    return Array.from(map.entries());
  }, [predictions]);

  const totalEarned = predictions.reduce((s, p) => s + (p.points_earned || 0), 0);
  const totalCorrect = predictions.filter(p => p.is_correct).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-3">
        {[
          { label: 'Total Predictions', value: predictions.length, color: '#F59E0B' },
          { label: 'Correct', value: totalCorrect, color: '#22C55E' },
          { label: 'Points Earned', value: totalEarned, color: '#A855F7' },
        ].map(s => (
          <div key={s.label} className="flex-1 rounded-xl p-3 text-center"
            style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grouped predictions */}
      {grouped.map(([matchId, preds]) => {
        const first = preds[0];
        return (
          <div key={matchId} className="rounded-2xl overflow-hidden"
            style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm" style={{ color: first.team1_color }}>{first.team1_short}</span>
                <span className="text-gray-600 text-xs">vs</span>
                <span className="font-black text-sm" style={{ color: first.team2_color }}>{first.team2_short}</span>
                {first.match_status === 'completed' && first.team1_score !== undefined && (
                  <span className="text-gray-400 text-xs font-bold ml-2">{first.team1_score}-{first.team2_score}</span>
                )}
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                first.match_status === 'completed' ? 'bg-green-500/10 text-green-400' :
                first.match_status === 'upcoming' ? 'bg-amber-500/10 text-amber-400' :
                'bg-blue-500/10 text-blue-400'
              }`}>{first.match_status}</span>
            </div>
            <div className="divide-y divide-white/5">
              {preds.map(pred => (
                <div key={pred.id} className="px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {pred.prediction_type === 'winner' && <Target className="w-3.5 h-3.5 text-green-400" />}
                    {pred.prediction_type === 'exact_score' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    {pred.prediction_type === 'mvp' && <Trophy className="w-3.5 h-3.5 text-purple-400" />}
                    <span className="text-sm text-gray-300">
                      {pred.prediction_type === 'winner' && `Winner: ${pred.predicted_winner_short}`}
                      {pred.prediction_type === 'exact_score' && `Score: ${pred.predicted_score}`}
                      {pred.prediction_type === 'mvp' && `MVP: ${pred.predicted_mvp_name}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {pred.is_correct === true && <Check className="w-4 h-4 text-green-400" />}
                    {pred.is_correct === false && <X className="w-4 h-4 text-red-400" />}
                    {pred.is_correct === null && <span className="text-gray-600 text-xs">pending</span>}
                    {pred.points_earned > 0 && (
                      <span className="text-green-400 text-xs font-black">+{pred.points_earned}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
