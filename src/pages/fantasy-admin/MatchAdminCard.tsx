import { useState } from 'react';
import { Trash2, ChevronDown, Check, X } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { IKLPlayer, IKLMatch, MatchPlayerStat } from '../../api/fantasy';
import { STAGE_LABEL, type StatRow } from './shared';
import { ObjectiveInputPanel } from './ObjectiveInputPanel';

// ── Game stats input row ───────────────────────────────────────────────────────
function GameStatsForm({
  gameNumber,
  players,
  stats,
  onChange,
}: {
  gameNumber: number;
  players: IKLPlayer[];
  stats: StatRow[];
  onChange: (rows: StatRow[]) => void;
}) {
  function updateRow(idx: number, patch: Partial<StatRow>) {
    const next = stats.map((r, i) => i === idx ? { ...r, ...patch } : r);
    onChange(next);
  }

  return (
    <div className="mt-2">
      <div className="text-xs font-black uppercase tracking-widest text-amber-500 mb-2">Game {gameNumber}</div>
      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <table className="w-full text-xs min-w-[380px]">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              <th className="text-left px-2 py-2 text-gray-500 font-bold">Player</th>
              <th className="text-center px-1 py-2 text-gray-500 font-bold w-11">K</th>
              <th className="text-center px-1 py-2 text-gray-500 font-bold w-11">D</th>
              <th className="text-center px-1 py-2 text-gray-500 font-bold w-11">A</th>
              <th className="text-center px-1 py-2 text-gray-500 font-bold w-10">MVP</th>
              <th className="text-center px-1 py-2 text-gray-500 font-bold w-10">5K</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((row, i) => {
              const player = players.find(p => p.id === row.playerId);
              if (!player) return null;
              return (
                <tr key={row.playerId} className="border-t border-white/5">
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded flex-shrink-0 text-[10px] font-black flex items-center justify-center"
                        style={{ background: `${player.team_color}30`, color: player.team_color }}>
                        {player.team_short.slice(0, 2)}
                      </div>
                      <span className="font-bold text-white truncate max-w-[80px] sm:max-w-none">{player.name}</span>
                      <span className="text-gray-600 hidden sm:inline">{player.role}</span>
                    </div>
                  </td>
                  <td className="px-1 py-1.5">
                    <input type="number" min={0} max={99} value={row.kills}
                      onChange={e => updateRow(i, { kills: Number(e.target.value) })}
                      className="w-10 text-center text-green-400 font-bold rounded px-0.5 py-0.5 outline-none"
                      style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }} />
                  </td>
                  <td className="px-1 py-1.5">
                    <input type="number" min={0} max={99} value={row.deaths}
                      onChange={e => updateRow(i, { deaths: Number(e.target.value) })}
                      className="w-10 text-center text-red-400 font-bold rounded px-0.5 py-0.5 outline-none"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }} />
                  </td>
                  <td className="px-1 py-1.5">
                    <input type="number" min={0} max={99} value={row.assists}
                      onChange={e => updateRow(i, { assists: Number(e.target.value) })}
                      className="w-10 text-center text-blue-400 font-bold rounded px-0.5 py-0.5 outline-none"
                      style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }} />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button onClick={() => updateRow(i, { isMvp: !row.isMvp })}
                      className="w-8 h-6 rounded font-bold text-xs transition-all"
                      style={{
                        background: row.isMvp ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.05)',
                        border: row.isMvp ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.1)',
                        color: row.isMvp ? '#F59E0B' : '#4B5563',
                      }}>
                      {row.isMvp ? <Check className="w-3 h-3 mx-auto" /> : <X className="w-3 h-3 mx-auto" />}
                    </button>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button onClick={() => updateRow(i, { hasPentaKill: !row.hasPentaKill })}
                      className="w-8 h-6 rounded font-bold text-xs transition-all"
                      style={{
                        background: row.hasPentaKill ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.05)',
                        border: row.hasPentaKill ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                        color: row.hasPentaKill ? '#F87171' : '#4B5563',
                      }}>
                      {row.hasPentaKill ? <Check className="w-3 h-3 mx-auto" /> : <X className="w-3 h-3 mx-auto" />}
                    </button>
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

// ── Match card (admin view) ────────────────────────────────────────────────────
export function MatchAdminCard({
  match,
  players,
  onDelete,
  onStatsSaved,
}: {
  match: IKLMatch;
  players: IKLPlayer[];
  onDelete: () => void;
  onStatsSaved: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [existingStats, setExistingStats] = useState<MatchPlayerStat[] | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Game stats per game: gameNum -> rows
  const totalGames = match.team1_score + match.team2_score;
  const [gameStats, setGameStats] = useState<Record<number, StatRow[]>>({});
  const [savingGame, setSavingGame] = useState<number | null>(null);
  const [saveMsg, setSaveMsg] = useState<string>('');
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvGame, setCsvGame] = useState(1);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvMsg, setCsvMsg] = useState('');

  // Players for this match's teams
  const matchPlayers = players.filter(p =>
    p.team_id === match.team1_id || p.team_id === match.team2_id
  );

  async function toggleExpand() {
    if (!expanded && !existingStats) {
      setLoadingStats(true);
      try {
        const s = await fantasyApi.getMatchStats(match.id);
        setExistingStats(s);
        // Init game stats from existing or blank
        const init: Record<number, StatRow[]> = {};
        for (let g = 1; g <= totalGames; g++) {
          const existing = s.filter(st => st.game_number === g);
          init[g] = matchPlayers.map(p => {
            const ex = existing.find(e => e.player_id === p.id);
            return {
              playerId: p.id,
              kills:   ex?.kills ?? 0,
              deaths:  ex?.deaths ?? 0,
              assists: ex?.assists ?? 0,
              isMvp:   ex?.is_mvp ?? false,
              hasPentaKill: ex?.has_penta_kill ?? false,
            };
          });
        }
        setGameStats(init);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStats(false);
      }
    }
    setExpanded(v => !v);
  }

  async function saveGame(gameNumber: number) {
    // Client-side stat validation warnings
    const stats = gameStats[gameNumber];
    const clientWarnings: string[] = [];
    for (const s of stats) {
      if (s.kills > 20) clientWarnings.push(`${players.find(p => p.id === s.playerId)?.name || `#${s.playerId}`}: ${s.kills} kills is very high`);
      if (s.deaths > 15) clientWarnings.push(`${players.find(p => p.id === s.playerId)?.name || `#${s.playerId}`}: ${s.deaths} deaths is very high`);
      if (s.assists > 30) clientWarnings.push(`${players.find(p => p.id === s.playerId)?.name || `#${s.playerId}`}: ${s.assists} assists is very high`);
    }
    if (clientWarnings.length > 0) {
      const proceed = confirm(`⚠️ Unusual stats detected:\n\n${clientWarnings.join('\n')}\n\nProceed anyway?`);
      if (!proceed) return;
    }

    setSavingGame(gameNumber);
    setSaveMsg('');
    try {
      const result = await fantasyApi.adminSaveGameStats(match.id, gameNumber, stats);
      const warnMsg = result.warnings?.length ? ` (⚠️ ${result.warnings.length} warnings)` : '';
      setSaveMsg(`Game ${gameNumber} saved!${warnMsg}`);
      const s = await fantasyApi.getMatchStats(match.id);
      setExistingStats(s);
      onStatsSaved();
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : 'Failed to save');
    }
    setSavingGame(null);
  }

  async function handleDelete() {
    if (!confirm(`Delete match ${match.team1_short} vs ${match.team2_short}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await fantasyApi.adminDeleteMatch(match.id);
      onDelete();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  }

  const winnerColor = match.winner_team_id === match.team1_id ? match.team1_color
    : match.winner_team_id === match.team2_id ? match.team2_color : '#6B7280';

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={toggleExpand} className="flex items-center gap-3 flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                  {STAGE_LABEL[match.stage] || match.stage} · W{match.week}
                </span>
                <span className="font-black text-white text-sm truncate">
                  {match.team1_short}
                  <span className="text-gray-600 mx-1.5">
                    {match.team1_score}–{match.team2_score}
                  </span>
                  {match.team2_short}
                </span>
                {match.winner_team_id && (
                  <span className="text-xs font-bold flex-shrink-0" style={{ color: winnerColor }}>
                    {match.winner_short} wins
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <button onClick={handleDelete} disabled={deleting}
            className="ml-3 p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {match.match_date && (
          <p className="text-xs text-gray-700 mt-1 ml-0.5">
            {new Date(match.match_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>

      {expanded && (
        <div className="border-t border-white/6 px-4 pb-4">
          {loadingStats ? (
            <div className="py-6 flex justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            </div>
          ) : matchPlayers.length === 0 ? (
            <p className="text-gray-600 text-sm py-4 text-center">No players found for these teams in DB</p>
          ) : (
            <>
              {Array.from({ length: totalGames }, (_, i) => i + 1).map(g => (
                <div key={g}>
                  {gameStats[g] && (
                    <GameStatsForm
                      gameNumber={g}
                      players={matchPlayers}
                      stats={gameStats[g]}
                      onChange={rows => setGameStats(prev => ({ ...prev, [g]: rows }))}
                    />
                  )}
                  <button
                    onClick={() => saveGame(g)}
                    disabled={savingGame === g}
                    className="mt-2 px-4 py-1.5 rounded-lg text-xs font-bold text-black transition-opacity disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
                    {savingGame === g ? 'Saving…' : `Save Game ${g}`}
                  </button>
                </div>
              ))}
              {saveMsg && (
                <p className={`text-xs mt-2 font-bold ${saveMsg.includes('saved') ? 'text-green-400' : 'text-red-400'}`}>
                  {saveMsg}
                </p>
              )}

              {/* CSV Import */}
              <div className="mt-4 pt-3 border-t border-white/5">
                {!showCsvImport ? (
                  <button onClick={() => setShowCsvImport(true)}
                    className="text-xs font-bold text-gray-600 hover:text-gray-300 transition-colors">
                    + Import via CSV
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400">CSV Import (one game at a time)</p>
                    <p className="text-[10px] text-gray-600">Format: playerId,kills,deaths,assists,isMvp(0/1),hasPentaKill(0/1),isStandin(0/1)</p>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 font-bold">Game #</label>
                      <input type="number" min={1} max={7} value={csvGame}
                        onChange={e => setCsvGame(Number(e.target.value))}
                        className="w-14 px-2 py-1 rounded text-white text-xs text-center outline-none"
                        style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                    <textarea value={csvText} onChange={e => setCsvText(e.target.value)}
                      rows={5} placeholder={`playerId,kills,deaths,assists,isMvp,hasPentaKill\n101,5,2,8,1,0\n102,3,4,6,0,0`}
                      className="w-full px-3 py-2 rounded-lg text-white text-xs outline-none font-mono"
                      style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.1)' }} />
                    {csvMsg && <p className={`text-xs font-bold ${csvMsg.includes('imported') ? 'text-green-400' : 'text-red-400'}`}>{csvMsg}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => { setShowCsvImport(false); setCsvText(''); setCsvMsg(''); }}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-gray-400" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        Cancel
                      </button>
                      <button onClick={async () => {
                        if (!csvText.trim()) return;
                        setCsvImporting(true); setCsvMsg('');
                        try {
                          const result = await fantasyApi.adminCsvImportStats(match.id, csvGame, csvText);
                          setCsvMsg(`${result.imported} rows imported!${result.errors.length ? ` (${result.errors.length} errors)` : ''}`);
                          setCsvText('');
                          const s = await fantasyApi.getMatchStats(match.id);
                          setExistingStats(s);
                          onStatsSaved();
                        } catch (e: unknown) { setCsvMsg(e instanceof Error ? e.message : 'Import failed'); }
                        setCsvImporting(false);
                      }} disabled={csvImporting || !csvText.trim()}
                        className="px-4 py-1 rounded-lg text-xs font-bold text-black disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
                        {csvImporting ? 'Importing...' : 'Import'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* #19-24: Objective results input */}
              <ObjectiveInputPanel match={match} onSaved={onStatsSaved} />

              {/* Show existing stats summary */}
              {existingStats && existingStats.length > 0 && (
                <p className="text-xs text-gray-600 mt-3">
                  {existingStats.length} stat rows recorded
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
