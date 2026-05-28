import { useState } from 'react';
import { Droplets, Shield, Skull, Crown, Waves, BarChart2, Check, Star } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { IKLMatch, PredictionType } from '../../api/fantasy';

interface ObjectivePrediction {
  type: PredictionType;
  label: string;
  icon: React.ReactNode;
  pts: number;
  color: string;
}

const OBJECTIVES: ObjectivePrediction[] = [
  { type: 'first_blood', label: 'First Blood', icon: <Droplets className="w-3.5 h-3.5" />, pts: 2, color: '#EF4444' },
  { type: 'first_tower', label: 'First Tower', icon: <Shield className="w-3.5 h-3.5" />, pts: 2, color: '#3B82F6' },
  { type: 'first_tyrant', label: 'First Tyrant', icon: <Skull className="w-3.5 h-3.5" />, pts: 3, color: '#8B5CF6' },
  { type: 'first_overlord', label: 'First Overlord', icon: <Crown className="w-3.5 h-3.5" />, pts: 3, color: '#F59E0B' },
  { type: 'tempest_dragon', label: 'Tempest Dragon', icon: <Waves className="w-3.5 h-3.5" />, pts: 3, color: '#06B6D4' },
];

interface Props {
  match: IKLMatch;
  savedTypes: Set<PredictionType>;
  onSaved: (type: PredictionType) => void;
}

export function ObjectivePredictions({ match, savedTypes, onSaved }: Props) {
  const [picks, setPicks] = useState<Record<string, number | null>>({});
  const [overUnder, setOverUnder] = useState<'over' | 'under' | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');

  const teams = [
    { id: match.team1_id, short: match.team1_short, color: match.team1_color },
    { id: match.team2_id, short: match.team2_short, color: match.team2_color },
  ];

  async function submitObjective(type: PredictionType, winnerId?: number) {
    setSaving(type);
    setError('');
    try {
      await fantasyApi.savePrediction({
        matchId: match.id,
        predictionType: type,
        winnerId,
        predictedScore: type === 'over_under' ? (overUnder ?? undefined) : undefined,
      });
      onSaved(type);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
    setSaving(null);
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5 text-cyan-400" /> Match Objectives
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-500/10 px-3 py-1.5 rounded-lg">{error}</p>
      )}

      <div className="space-y-2">
        {OBJECTIVES.map(obj => {
          const picked = picks[obj.type];
          const isSaved = savedTypes.has(obj.type);
          return (
            <div key={obj.type} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 min-w-[110px]" style={{ color: obj.color }}>
                {obj.icon}
                <span className="text-xs font-bold">{obj.label}</span>
                <span className="text-[10px] opacity-50">+{obj.pts}</span>
              </div>
              <div className="flex gap-1.5 flex-1">
                {teams.map(t => (
                  <button key={t.id} disabled={isSaved} onClick={() => setPicks(p => ({ ...p, [obj.type]: t.id }))}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                    style={{
                      background: picked === t.id ? `${t.color}20` : 'rgba(255,255,255,0.03)',
                      color: picked === t.id ? t.color : '#6B7280',
                      border: picked === t.id ? `1px solid ${t.color}40` : '1px solid rgba(255,255,255,0.05)',
                    }}>
                    {t.short}
                  </button>
                ))}
              </div>
              {isSaved ? (
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              ) : picked ? (
                <button onClick={() => submitObjective(obj.type, picked)} disabled={saving === obj.type}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold flex-shrink-0"
                  style={{ background: `${obj.color}15`, color: obj.color, border: `1px solid ${obj.color}30` }}>
                  {saving === obj.type ? '...' : 'Save'}
                </button>
              ) : <div className="w-12" />}
            </div>
          );
        })}

        {/* Over/Under total kills (#24) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 min-w-[110px] text-emerald-400">
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Over/Under</span>
            <span className="text-[10px] opacity-50">+2</span>
          </div>
          <div className="flex gap-1.5 flex-1">
            {(['over', 'under'] as const).map(pick => (
              <button key={pick} disabled={savedTypes.has('over_under')}
                onClick={() => setOverUnder(pick)}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all capitalize disabled:opacity-40"
                style={{
                  background: overUnder === pick ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                  color: overUnder === pick ? '#10B981' : '#6B7280',
                  border: overUnder === pick ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.05)',
                }}>
                {pick}
              </button>
            ))}
          </div>
          {savedTypes.has('over_under') ? (
            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
          ) : overUnder ? (
            <button onClick={() => submitObjective('over_under')} disabled={saving === 'over_under'}
              className="px-2 py-1 rounded-lg text-[10px] font-bold flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
              {saving === 'over_under' ? '...' : 'Save'}
            </button>
          ) : <div className="w-12" />}
        </div>
      </div>
    </div>
  );
}
