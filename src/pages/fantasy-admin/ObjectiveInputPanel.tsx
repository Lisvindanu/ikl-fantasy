import { useState } from 'react';
import { Droplets, Shield, Skull, Crown, Waves, BarChart2, Check, Save } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { IKLMatch } from '../../api/fantasy';
import { Input } from './shared';

interface ObjectiveField {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  dbField: 'firstBloodTeamId' | 'firstTowerTeamId' | 'firstTyrantTeamId' | 'firstOverlordTeamId' | 'tempestDragonTeamId';
}

const OBJECTIVES: ObjectiveField[] = [
  { key: 'first_blood_team_id', label: 'First Blood', icon: <Droplets className="w-3.5 h-3.5" />, color: '#EF4444', dbField: 'firstBloodTeamId' },
  { key: 'first_tower_team_id', label: 'First Tower', icon: <Shield className="w-3.5 h-3.5" />, color: '#3B82F6', dbField: 'firstTowerTeamId' },
  { key: 'first_tyrant_team_id', label: 'First Tyrant', icon: <Skull className="w-3.5 h-3.5" />, color: '#8B5CF6', dbField: 'firstTyrantTeamId' },
  { key: 'first_overlord_team_id', label: 'First Overlord', icon: <Crown className="w-3.5 h-3.5" />, color: '#F59E0B', dbField: 'firstOverlordTeamId' },
  { key: 'tempest_dragon_team_id', label: 'Tempest Dragon', icon: <Waves className="w-3.5 h-3.5" />, color: '#06B6D4', dbField: 'tempestDragonTeamId' },
];

interface Props {
  match: IKLMatch;
  onSaved: () => void;
}

export function ObjectiveInputPanel({ match, onSaved }: Props) {
  const [picks, setPicks] = useState<Record<string, number | null>>(() => ({
    first_blood_team_id: match.first_blood_team_id,
    first_tower_team_id: match.first_tower_team_id,
    first_tyrant_team_id: match.first_tyrant_team_id,
    first_overlord_team_id: match.first_overlord_team_id,
    tempest_dragon_team_id: match.tempest_dragon_team_id,
  }));
  const [overUnderLine, setOverUnderLine] = useState<string>(
    match.over_under_line != null ? String(match.over_under_line) : ''
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const teams = [
    { id: match.team1_id, short: match.team1_short, color: match.team1_color },
    { id: match.team2_id, short: match.team2_short, color: match.team2_color },
  ];

  async function saveObjectives() {
    setSaving(true);
    setMsg('');
    try {
      const payload: Record<string, number | null> = {};
      for (const obj of OBJECTIVES) {
        payload[obj.dbField] = picks[obj.key] ?? null;
      }
      payload.overUnderLine = overUnderLine ? Number(overUnderLine) : null;
      await fantasyApi.adminUpdateMatchObjectives(match.id, payload);
      setMsg('Objectives saved!');
      onSaved();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed to save');
    }
    setSaving(false);
  }

  return (
    <div className="mt-3 pt-3 border-t border-white/5 space-y-2.5">
      <div className="flex items-center gap-1.5 text-cyan-400 mb-2">
        <Waves className="w-3.5 h-3.5" />
        <span className="text-xs font-black uppercase tracking-widest">Match Objectives</span>
      </div>

      {OBJECTIVES.map(obj => {
        const picked = picks[obj.key];
        return (
          <div key={obj.key} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 min-w-[120px]" style={{ color: obj.color }}>
              {obj.icon}
              <span className="text-xs font-bold">{obj.label}</span>
            </div>
            <div className="flex gap-1.5 flex-1">
              {teams.map(t => (
                <button key={t.id}
                  onClick={() => setPicks(p => ({ ...p, [obj.key]: picked === t.id ? null : t.id }))}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: picked === t.id
                      ? `${t.color}30`
                      : 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.15) 100%)',
                    color: picked === t.id ? t.color : '#9CA3AF',
                    border: picked === t.id ? `2px solid ${t.color}60` : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: picked === t.id ? `0 0 12px -4px ${t.color}40` : 'none',
                  }}>
                  {t.short}
                </button>
              ))}
            </div>
            {picked && <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />}
          </div>
        );
      })}

      {/* Over/Under line */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 min-w-[120px] text-emerald-400">
          <BarChart2 className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">O/U Line</span>
        </div>
        <Input type="number" min={0} max={200} value={overUnderLine}
          onChange={e => setOverUnderLine(e.target.value)}
          placeholder="e.g. 25"
          className="flex-1 !py-1.5 !text-xs" />
      </div>

      {msg && (
        <p className={`text-xs font-bold ${msg.includes('saved') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>
      )}

      <button onClick={saveObjectives} disabled={saving}
        className="px-4 py-1.5 rounded-xl text-xs font-bold text-black transition-opacity disabled:opacity-60 flex items-center gap-1.5"
        style={{ background: 'linear-gradient(135deg,#06B6D4,#0891B2)' }}>
        <Save className="w-3 h-3" />
        {saving ? 'Saving...' : 'Save Objectives'}
      </button>
    </div>
  );
}
