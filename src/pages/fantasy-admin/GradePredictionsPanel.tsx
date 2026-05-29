import { useState } from 'react';
import { Target } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { IKLMatch } from '../../api/fantasy';

interface Props {
  matches: IKLMatch[];
  onGraded: () => void;
}

export function GradePredictionsPanel({ matches, onGraded }: Props) {
  const [grading, setGrading] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  const completedMatches = matches.filter(m => m.status === 'completed' && m.winner_team_id);

  async function handleGrade(matchId: number) {
    setGrading(matchId);
    setMsg('');
    try {
      const result = await fantasyApi.adminGradePredictions(matchId);
      setMsg(`Graded ${result.graded} prediction${result.graded !== 1 ? 's' : ''} for match #${matchId}`);
      onGraded();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed to grade');
    }
    setGrading(null);
  }

  if (completedMatches.length === 0) {
    return <p className="text-gray-600 text-xs">No completed matches to grade.</p>;
  }

  return (
    <div className="space-y-2">
      {msg && (
        <p className={`text-xs font-bold px-3 py-2 rounded-lg ${msg.includes('Graded') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
          {msg}
        </p>
      )}
      <div className="max-h-48 overflow-y-auto space-y-1.5">
        {completedMatches.slice(0, 10).map(m => (
          <div key={m.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-xs">
              <span className="font-bold text-white">{m.team1_short}</span>
              <span className="text-gray-600 mx-1.5">{m.team1_score} - {m.team2_score}</span>
              <span className="font-bold text-white">{m.team2_short}</span>
              <span className="text-gray-700 ml-2">W{m.week}</span>
            </div>
            <button
              onClick={() => handleGrade(m.id)}
              disabled={grading === m.id}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-purple-400 disabled:opacity-50"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <Target className="w-3 h-3" />
              {grading === m.id ? 'Grading...' : 'Grade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
