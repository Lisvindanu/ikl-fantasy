import { useState } from 'react';
import { Zap } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { IKLTeam, IKLMatch } from '../../api/fantasy';
import { STAGES, STAGE_LABEL, Field, Input, Select, AdminPanel } from './shared';

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
  const [collapsed, setCollapsed] = useState(true);

  const t1 = teams.find(t => t.id === team1Id);
  const t2 = teams.find(t => t.id === team2Id);

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
      setTeam1Score(0);
      setTeam2Score(0);
      setWinnerTeamId('');
      setMatchDate('');
      setCollapsed(true);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to create match');
    }
    setSaving(false);
  }

  if (collapsed) {
    return (
      <button onClick={() => setCollapsed(false)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-amber-400 transition-all hover:scale-[1.005] active:scale-[0.995]"
        style={{
          background: 'linear-gradient(180deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.02) 100%)',
          border: '1px dashed rgba(245,158,11,0.25)',
        }}>
        <Zap className="w-4 h-4" />
        Create New Match
      </button>
    );
  }

  return (
    <AdminPanel glow="rgba(245,158,11,0.08)">
      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
              <Zap className="w-3.5 h-3.5 text-black" />
            </div>
            New Match
          </h3>
          <button type="button" onClick={() => setCollapsed(true)}
            className="text-xs font-bold text-gray-600 hover:text-gray-400 transition-colors">
            Collapse
          </button>
        </div>

        {/* Teams — visual VS layout */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <Field label="Team 1">
            <Select value={team1Id} onChange={e => setTeam1Id(Number(e.target.value))}>
              {teams.map(t => <option key={t.id} value={t.id}>{t.short_name} — {t.name}</option>)}
            </Select>
          </Field>
          <div className="pb-2.5 px-2">
            <span className="text-xs font-black text-gray-700 uppercase tracking-widest">vs</span>
          </div>
          <Field label="Team 2">
            <Select value={team2Id} onChange={e => setTeam2Id(Number(e.target.value))}>
              {teams.map(t => <option key={t.id} value={t.id}>{t.short_name} — {t.name}</option>)}
            </Select>
          </Field>
        </div>

        {/* Meta row */}
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
              <option value={7}>BO7</option>
            </Select>
          </Field>
        </div>

        {/* Date + Winner */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Match Date">
            <Input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)}
              style={{ colorScheme: 'dark' }} />
          </Field>
          <Field label="Winner">
            <Select value={winnerTeamId} onChange={e => setWinnerTeamId(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="">TBD</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.short_name}</option>)}
            </Select>
          </Field>
        </div>

        {/* Score — centered prominent display */}
        <div className="flex items-end justify-center gap-4">
          <Field label={t1?.short_name ?? 'T1'}>
            <Input type="number" min={0} max={bestOf} value={team1Score}
              onChange={e => setTeam1Score(Number(e.target.value))}
              className="!text-center !text-lg !font-black !w-20"
              style={{
                background: t1 ? `linear-gradient(180deg, ${t1.color}08 0%, ${t1.color}03 100%)` : undefined,
                borderColor: t1 ? `${t1.color}25` : undefined,
              }} />
          </Field>
          <div className="pb-3 text-gray-700 font-black text-lg">:</div>
          <Field label={t2?.short_name ?? 'T2'}>
            <Input type="number" min={0} max={bestOf} value={team2Score}
              onChange={e => setTeam2Score(Number(e.target.value))}
              className="!text-center !text-lg !font-black !w-20"
              style={{
                background: t2 ? `linear-gradient(180deg, ${t2.color}08 0%, ${t2.color}03 100%)` : undefined,
                borderColor: t2 ? `${t2.color}25` : undefined,
              }} />
          </Field>
        </div>

        {err && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/8 border border-red-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <p className="text-red-400 text-xs font-bold">{err}</p>
          </div>
        )}

        <button type="submit" disabled={saving}
          className="w-full py-3 rounded-xl font-black text-sm text-black disabled:opacity-60 transition-all hover:brightness-110 active:scale-[0.99]"
          style={{
            background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
            boxShadow: '0 4px 16px rgba(245,158,11,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}>
          {saving ? 'Creating...' : 'Create Match'}
        </button>
      </form>
    </AdminPanel>
  );
}
