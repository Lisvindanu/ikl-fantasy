import { useState } from 'react';
import { Plus } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { IKLTeam, IKLMatch } from '../../api/fantasy';
import { STAGES, STAGE_LABEL, Field, Input, Select } from './shared';

export function CreateMatchForm({
  seasonId,
  teams,
  onCreated,
}: {
  seasonId: number;
  teams: IKLTeam[];
  onCreated: (match: IKLMatch) => void;
}) {
  const [team1Id, setTeam1Id] = useState(teams[0]?.id ?? 0);
  const [team2Id, setTeam2Id] = useState(teams[1]?.id ?? 0);
  const [week, setWeek] = useState(1);
  const [stage, setStage] = useState('regular');
  const [matchDate, setMatchDate] = useState('');
  const [bestOf, setBestOf] = useState(3);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [winnerTeamId, setWinnerTeamId] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (team1Id === team2Id) { setErr('Teams must be different'); return; }
    setSaving(true);
    setErr('');
    try {
      const match = await fantasyApi.adminCreateMatch({
        seasonId, week, stage, matchDate,
        team1Id, team2Id, bestOf,
        team1Score, team2Score,
        winnerTeamId: winnerTeamId === '' ? null : Number(winnerTeamId),
      });
      onCreated(match);
      // Reset scores
      setTeam1Score(0);
      setTeam2Score(0);
      setWinnerTeamId('');
      setMatchDate('');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to create match');
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-5 space-y-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
        <Plus className="w-4 h-4 text-amber-400" /> New Match
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Team 1">
          <Select value={team1Id} onChange={e => setTeam1Id(Number(e.target.value))}>
            {teams.map(t => <option key={t.id} value={t.id}>{t.short_name} — {t.name}</option>)}
          </Select>
        </Field>
        <Field label="Team 2">
          <Select value={team2Id} onChange={e => setTeam2Id(Number(e.target.value))}>
            {teams.map(t => <option key={t.id} value={t.id}>{t.short_name} — {t.name}</option>)}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Week">
          <Input type="number" min={1} max={20} value={week} onChange={e => setWeek(Number(e.target.value))} />
        </Field>
        <Field label="Stage">
          <Select value={stage} onChange={e => setStage(e.target.value)}>
            {STAGES.map(s => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
          </Select>
        </Field>
        <Field label="Best Of">
          <Select value={bestOf} onChange={e => setBestOf(Number(e.target.value))}>
            <option value={1}>BO1</option>
            <option value={3}>BO3</option>
            <option value={5}>BO5</option>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Match Date (optional)">
          <Input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)} />
        </Field>
        <Field label="Winner (optional)">
          <Select value={winnerTeamId} onChange={e => setWinnerTeamId(e.target.value === '' ? '' : Number(e.target.value))}>
            <option value="">TBD</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.short_name}</option>)}
          </Select>
        </Field>
      </div>

      <div className="flex items-center gap-4">
        <Field label={`${teams.find(t => t.id === team1Id)?.short_name ?? 'Team 1'} Score`}>
          <Input type="number" min={0} max={bestOf} value={team1Score} onChange={e => setTeam1Score(Number(e.target.value))} style={{ width: 72 }} />
        </Field>
        <div className="text-gray-600 font-black mt-5">–</div>
        <Field label={`${teams.find(t => t.id === team2Id)?.short_name ?? 'Team 2'} Score`}>
          <Input type="number" min={0} max={bestOf} value={team2Score} onChange={e => setTeam2Score(Number(e.target.value))} style={{ width: 72 }} />
        </Field>
      </div>

      {err && <p className="text-red-400 text-xs">{err}</p>}

      <button type="submit" disabled={saving}
        className="px-5 py-2.5 rounded-xl font-bold text-sm text-black disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
        {saving ? 'Creating…' : 'Create Match'}
      </button>
    </form>
  );
}
