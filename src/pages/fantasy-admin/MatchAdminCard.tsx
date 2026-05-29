import { useState } from 'react';
import { Trash2, ChevronDown, Check, X, FileUp, Calendar } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { IKLPlayer, IKLMatch, MatchPlayerStat } from '../../api/fantasy';
import { AdminPanel, Input, STAGE_LABEL, type StatRow } from './shared';
import { ObjectiveInputPanel } from './ObjectiveInputPanel';

/* ── Style constants ──────────────────────────────────────────────────────── */
const KDA = {
  kills:   { text: '#4ADE80', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.18)' },
  deaths:  { text: '#F87171', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.18)' },
  assists: { text: '#60A5FA', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.18)' },
} as const;

const amberBtn = {
  background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
  boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
} as const;

/* ── Small reusable cells ─────────────────────────────────────────────────── */
function KdaInput({ value, onChange, tint }: {
  value: number; onChange: (v: number) => void;
  tint: { text: string; bg: string; border: string };
}) {
  return (
    <input type="number" min={0} max={99} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-10 text-center font-bold rounded-lg px-0.5 py-1 outline-none text-xs transition-all focus:ring-1"
      style={{ color: tint.text, background: tint.bg, border: `1px solid ${tint.border}` }} />
  );
}

function ToggleCell({ active, onToggle, color, bg, border }: {
  active: boolean; onToggle: () => void; color: string; bg: string; border: string;
}) {
  return (
    <button onClick={onToggle} className="w-7 h-6 rounded-md text-xs font-bold transition-all"
      style={{
        background: active ? bg : 'rgba(255,255,255,0.04)',
        border: active ? `1px solid ${border}` : '1px solid rgba(255,255,255,0.08)',
        color: active ? color : '#374151',
      }}>
      {active ? <Check className="w-3 h-3 mx-auto" /> : <X className="w-3 h-3 mx-auto" />}
    </button>
  );
}

/* ── Game stats table ─────────────────────────────────────────────────────── */
function GameStatsForm({ gameNumber, players, stats, onChange }: {
  gameNumber: number; players: IKLPlayer[]; stats: StatRow[]; onChange: (rows: StatRow[]) => void;
}) {
  const updateRow = (idx: number, patch: Partial<StatRow>) =>
    onChange(stats.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-500">Game {gameNumber}</span>
      </div>
      <div className="overflow-x-auto rounded-xl"
        style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}>
        <table className="w-full text-xs min-w-[380px]">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.025)' }}>
              {['Player', 'K', 'D', 'A', 'MVP', '5K'].map((h, i) => (
                <th key={h} className={`${i === 0 ? 'text-left px-2.5' : 'text-center px-1'} py-2 text-[10px] font-black uppercase tracking-wider text-gray-600 ${i > 0 && i < 4 ? 'w-11' : i >= 4 ? 'w-9' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.map((row, i) => {
              const player = players.find(p => p.id === row.playerId);
              if (!player) return null;
              return (
                <tr key={row.playerId} className="border-t hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <td className="px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded flex-shrink-0 text-[9px] font-black flex items-center justify-center"
                        style={{ background: `${player.team_color}20`, color: player.team_color, border: `1px solid ${player.team_color}30` }}>
                        {player.team_short.slice(0, 2)}
                      </div>
                      <span className="font-bold text-gray-200 truncate max-w-[80px] sm:max-w-none">{player.name}</span>
                      <span className="text-gray-700 text-[10px] hidden sm:inline">{player.role}</span>
                    </div>
                  </td>
                  <td className="px-1 py-1.5"><KdaInput value={row.kills} onChange={v => updateRow(i, { kills: v })} tint={KDA.kills} /></td>
                  <td className="px-1 py-1.5"><KdaInput value={row.deaths} onChange={v => updateRow(i, { deaths: v })} tint={KDA.deaths} /></td>
                  <td className="px-1 py-1.5"><KdaInput value={row.assists} onChange={v => updateRow(i, { assists: v })} tint={KDA.assists} /></td>
                  <td className="px-1 py-1.5 text-center">
                    <ToggleCell active={row.isMvp} onToggle={() => updateRow(i, { isMvp: !row.isMvp })}
                      color="#F59E0B" bg="rgba(245,158,11,0.2)" border="rgba(245,158,11,0.4)" />
                  </td>
                  <td className="px-1 py-1.5 text-center">
                    <ToggleCell active={row.hasPentaKill} onToggle={() => updateRow(i, { hasPentaKill: !row.hasPentaKill })}
                      color="#F87171" bg="rgba(239,68,68,0.2)" border="rgba(239,68,68,0.4)" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Match card (admin view) ──────────────────────────────────────────────── */
export function MatchAdminCard({ match, players, onDelete, onStatsSaved }: {
  match: IKLMatch; players: IKLPlayer[]; onDelete: () => void; onStatsSaved: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [existingStats, setExistingStats] = useState<MatchPlayerStat[] | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const totalGames = match.team1_score + match.team2_score;
  const [gameStats, setGameStats] = useState<Record<number, StatRow[]>>({});
  const [savingGame, setSavingGame] = useState<number | null>(null);
  const [saveMsg, setSaveMsg] = useState('');
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvGame, setCsvGame] = useState(1);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvMsg, setCsvMsg] = useState('');

  const matchPlayers = players.filter(p => p.team_id === match.team1_id || p.team_id === match.team2_id);

  async function toggleExpand() {
    if (!expanded && !existingStats) {
      setLoadingStats(true);
      try {
        const s = await fantasyApi.getMatchStats(match.id);
        setExistingStats(s);
        const init: Record<number, StatRow[]> = {};
        for (let g = 1; g <= totalGames; g++) {
          const existing = s.filter(st => st.game_number === g);
          init[g] = matchPlayers.map(p => {
            const ex = existing.find(e => e.player_id === p.id);
            return { playerId: p.id, kills: ex?.kills ?? 0, deaths: ex?.deaths ?? 0,
              assists: ex?.assists ?? 0, isMvp: ex?.is_mvp ?? false, hasPentaKill: ex?.has_penta_kill ?? false };
          });
        }
        setGameStats(init);
      } catch (e) { console.error(e); }
      finally { setLoadingStats(false); }
    }
    setExpanded(v => !v);
  }

  async function saveGame(gameNumber: number) {
    const stats = gameStats[gameNumber];
    const warnings: string[] = [];
    for (const s of stats) {
      const name = players.find(p => p.id === s.playerId)?.name || `#${s.playerId}`;
      if (s.kills > 20) warnings.push(`${name}: ${s.kills} kills is very high`);
      if (s.deaths > 15) warnings.push(`${name}: ${s.deaths} deaths is very high`);
      if (s.assists > 30) warnings.push(`${name}: ${s.assists} assists is very high`);
    }
    if (warnings.length > 0 && !confirm(`Unusual stats detected:\n\n${warnings.join('\n')}\n\nProceed anyway?`)) return;
    setSavingGame(gameNumber); setSaveMsg('');
    try {
      const result = await fantasyApi.adminSaveGameStats(match.id, gameNumber, stats);
      const warnMsg = result.warnings?.length ? ` (${result.warnings.length} warnings)` : '';
      setSaveMsg(`Game ${gameNumber} saved!${warnMsg}`);
      setExistingStats(await fantasyApi.getMatchStats(match.id));
      onStatsSaved();
    } catch (e: unknown) { setSaveMsg(e instanceof Error ? e.message : 'Failed to save'); }
    setSavingGame(null);
  }

  async function handleDelete() {
    if (!confirm(`Delete match ${match.team1_short} vs ${match.team2_short}? This cannot be undone.`)) return;
    setDeleting(true);
    try { await fantasyApi.adminDeleteMatch(match.id); onDelete(); }
    catch (e) { console.error(e); }
    finally { setDeleting(false); }
  }

  const winnerColor = match.winner_team_id === match.team1_id ? match.team1_color
    : match.winner_team_id === match.team2_id ? match.team2_color : '#6B7280';

  return (
    <AdminPanel>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <button onClick={toggleExpand} className="flex items-center gap-3 flex-1 min-w-0 text-left group">
            {/* Stage badge */}
            <span className="text-[10px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.06))',
                color: '#F59E0B', border: '1px solid rgba(245,158,11,0.18)' }}>
              {STAGE_LABEL[match.stage] || match.stage}
              <span className="text-amber-500/50 mx-1">|</span>W{match.week}
            </span>

            {/* Teams + score */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-black text-sm" style={{ color: match.team1_color }}>{match.team1_short}</span>
              <span className="font-black text-sm px-2 py-0.5 rounded-md"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.06)' }}>
                {match.team1_score} - {match.team2_score}
              </span>
              <span className="font-black text-sm" style={{ color: match.team2_color }}>{match.team2_short}</span>
              {match.winner_team_id && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex-shrink-0"
                  style={{ color: winnerColor, background: `${winnerColor}15`, border: `1px solid ${winnerColor}25` }}>
                  {match.winner_short} WIN
                </span>
              )}
            </div>

            <ChevronDown className={`w-4 h-4 text-gray-700 flex-shrink-0 transition-transform duration-200 group-hover:text-gray-500 ${expanded ? 'rotate-180' : ''}`} />
          </button>

          <button onClick={handleDelete} disabled={deleting} title="Delete match"
            className="p-2 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {match.match_date && (
          <div className="flex items-center gap-1.5 mt-2 ml-0.5">
            <Calendar className="w-3 h-3 text-gray-700" />
            <span className="text-[11px] text-gray-700 font-medium">
              {new Date(match.match_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {/* ── Expanded content ────────────────────────────────────────── */}
      {expanded && (
        <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {loadingStats ? (
            <div className="py-8 flex justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            </div>
          ) : matchPlayers.length === 0 ? (
            <p className="text-gray-600 text-sm py-6 text-center">No players found for these teams in DB</p>
          ) : (
            <>
              {Array.from({ length: totalGames }, (_, i) => i + 1).map(g => (
                <div key={g}>
                  {gameStats[g] && (
                    <GameStatsForm gameNumber={g} players={matchPlayers} stats={gameStats[g]}
                      onChange={rows => setGameStats(prev => ({ ...prev, [g]: rows }))} />
                  )}
                  <button onClick={() => saveGame(g)} disabled={savingGame === g}
                    className="mt-2 px-4 py-1.5 rounded-lg text-xs font-black text-black disabled:opacity-50 transition-all" style={amberBtn}>
                    {savingGame === g ? 'Saving...' : `Save Game ${g}`}
                  </button>
                </div>
              ))}

              {saveMsg && (
                <p className={`text-xs mt-2 font-bold ${saveMsg.includes('saved') ? 'text-green-400' : 'text-red-400'}`}>{saveMsg}</p>
              )}

              {/* ── CSV Import ─────────────────────────────────────── */}
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {!showCsvImport ? (
                  <button onClick={() => setShowCsvImport(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-400 transition-colors">
                    <FileUp className="w-3.5 h-3.5" />Import via CSV
                  </button>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">CSV Import</span>
                    </div>
                    <p className="text-[10px] text-gray-600 leading-relaxed">
                      Format: playerId,kills,deaths,assists,isMvp(0/1),hasPentaKill(0/1),isStandin(0/1)
                    </p>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Game #</label>
                      <Input type="number" min={1} max={7} value={csvGame}
                        onChange={e => setCsvGame(Number(e.target.value))}
                        className="!w-14 !px-2 !py-1.5 !text-xs text-center !rounded-lg" />
                    </div>
                    <textarea value={csvText} onChange={e => setCsvText(e.target.value)} rows={5}
                      placeholder={`playerId,kills,deaths,assists,isMvp,hasPentaKill\n101,5,2,8,1,0\n102,3,4,6,0,0`}
                      className="w-full px-3 py-2.5 rounded-xl text-white text-xs outline-none font-mono transition-all focus:ring-1 focus:ring-amber-500/30"
                      style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))',
                        border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 4px rgba(0,0,0,0.3)' }} />
                    {csvMsg && <p className={`text-xs font-bold ${csvMsg.includes('imported') ? 'text-green-400' : 'text-red-400'}`}>{csvMsg}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => { setShowCsvImport(false); setCsvText(''); setCsvMsg(''); }}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-gray-200 transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        Cancel
                      </button>
                      <button disabled={csvImporting || !csvText.trim()}
                        className="px-4 py-1.5 rounded-lg text-xs font-black text-black disabled:opacity-50 transition-all"
                        style={amberBtn}
                        onClick={async () => {
                          if (!csvText.trim()) return;
                          setCsvImporting(true); setCsvMsg('');
                          try {
                            const result = await fantasyApi.adminCsvImportStats(match.id, csvGame, csvText);
                            setCsvMsg(`${result.imported} rows imported!${result.errors.length ? ` (${result.errors.length} errors)` : ''}`);
                            setCsvText('');
                            setExistingStats(await fantasyApi.getMatchStats(match.id));
                            onStatsSaved();
                          } catch (e: unknown) { setCsvMsg(e instanceof Error ? e.message : 'Import failed'); }
                          setCsvImporting(false);
                        }}>
                        {csvImporting ? 'Importing...' : 'Import'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Objective results */}
              <ObjectiveInputPanel match={match} onSaved={onStatsSaved} />

              {/* Existing stats summary */}
              {existingStats && existingStats.length > 0 && (
                <p className="text-[11px] text-gray-700 mt-3 font-medium">{existingStats.length} stat rows recorded</p>
              )}
            </>
          )}
        </div>
      )}
    </AdminPanel>
  );
}
