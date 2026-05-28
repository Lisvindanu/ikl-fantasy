import type { PredictionLeaderboardEntry } from '../../api/fantasy';

interface PredictionLeaderboardProps {
  entries: PredictionLeaderboardEntry[];
}

export function PredictionLeaderboard({ entries }: PredictionLeaderboardProps) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-5 py-3 border-b border-white/5">
        <h3 className="text-sm font-black text-white">Prediction Rankings</h3>
      </div>
      <div className="divide-y divide-white/5">
        {entries.map((entry, i) => {
          const accuracy = entry.total_predictions > 0
            ? Math.round((entry.correct_predictions / entry.total_predictions) * 100)
            : 0;
          return (
            <div key={entry.user_id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-colors">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                i === 0 ? 'bg-amber-500/20 text-amber-400' :
                i === 1 ? 'bg-gray-400/15 text-gray-300' :
                i === 2 ? 'bg-orange-500/15 text-orange-400' :
                'bg-white/5 text-gray-600'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{entry.user_name}</div>
                <div className="text-xs text-gray-600">
                  {entry.correct_predictions}/{entry.total_predictions} correct ({accuracy}%)
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-amber-400">{entry.total_points}</div>
                <div className="text-[10px] text-gray-600 uppercase">pts</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
