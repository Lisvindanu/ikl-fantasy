import { useState, useEffect, useCallback, useRef } from 'react';
import { Swords, Trophy, Radio, Target, Zap, BarChart3, X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IKLMatch, IKLPlayer, IKLTeam, MatchPlayerStat, MatchPreview, VodTimestamp } from '../../api/fantasy';
import { getMatches, getMatchStats, getMatchPreview, API } from '../../api/fantasy';
import { STAGE_LABEL, GameStatsRow, FormDots } from './MatchCard';
import { PredictionCard } from './PredictionCard';
import { MatchComments } from './MatchComments';

interface Props {
  matches: IKLMatch[];
  loading: boolean;
  seasonId?: number;
  players?: IKLPlayer[];
  isAuthenticated?: boolean;
  teams?: IKLTeam[];
}

const POLL_INTERVAL = 30_000;

// ── Match Row (compact, like the screenshot) ─────────────────────────────────

function MatchRow({ match, onClick, isSelected }: { match: IKLMatch; onClick?: () => void; isSelected?: boolean }) {
  const t1Win = match.winner_team_id === match.team1_id;
  const t2Win = match.winner_team_id === match.team2_id;
  const hasWinner = !!match.winner_team_id;
  const isLive = match.status === 'live';

  return (
    <div
      className={`flex items-stretch text-xs ${onClick ? 'cursor-pointer hover:bg-white/[0.04] transition-colors' : ''}`}
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        ...(isSelected ? { background: 'rgba(245,158,11,0.08)', borderLeft: '2px solid #F59E0B' } : {}),
      }}
      onClick={onClick}>
      {/* Team 1 */}
      <div className="flex-1 flex items-center gap-1.5 px-2.5 py-2 min-w-0"
        style={{ background: t1Win ? `${match.team1_color}15` : 'transparent' }}>
        <span className={`font-black truncate ${t1Win ? 'text-white' : hasWinner ? 'text-gray-600' : 'text-gray-400'}`}>
          {match.team1_short}
        </span>
        {match.team1_logo ? (
          <img src={`${API}${match.team1_logo}`} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
        ) : (
          <div className="w-1.5 h-4 rounded-full flex-shrink-0" style={{ background: match.team1_color }} />
        )}
      </div>

      {/* Score */}
      <div className="flex items-center gap-1.5 px-2 py-2 flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.02)', minWidth: '48px', justifyContent: 'center' }}>
        {match.status === 'upcoming' ? (
          <span className="text-[9px] text-blue-400 font-bold uppercase">Segera</span>
        ) : match.status === 'postponed' ? (
          <span className="text-[9px] text-yellow-400 font-bold uppercase">Ditunda</span>
        ) : (
          <>
            <span className={`font-black tabular-nums ${t1Win ? 'text-white' : 'text-gray-600'}`}>
              {match.team1_score}
            </span>
            {isLive ? (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            ) : (
              <span className="text-gray-700 text-[10px]">&middot;</span>
            )}
            <span className={`font-black tabular-nums ${t2Win ? 'text-white' : 'text-gray-600'}`}>
              {match.team2_score}
            </span>
          </>
        )}
      </div>

      {/* Team 2 */}
      <div className="flex-1 flex items-center gap-1.5 px-2.5 py-2 justify-end min-w-0"
        style={{ background: t2Win ? `${match.team2_color}15` : 'transparent' }}>
        {match.team2_logo ? (
          <img src={`${API}${match.team2_logo}`} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
        ) : (
          <div className="w-1.5 h-4 rounded-full flex-shrink-0" style={{ background: match.team2_color }} />
        )}
        <span className={`font-black truncate ${t2Win ? 'text-white' : hasWinner ? 'text-gray-600' : 'text-gray-400'}`}>
          {match.team2_short}
        </span>
      </div>
    </div>
  );
}

// ── Week Card ────────────────────────────────────────────────────────────────

function WeekCard({ week, matches, onMatchClick, selectedMatchId }: { week: number; matches: IKLMatch[]; onMatchClick?: (m: IKLMatch) => void; selectedMatchId?: number }) {
  const byDate: Record<string, IKLMatch[]> = {};
  for (const m of matches) {
    const date = m.match_date
      ? new Date(m.match_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Jadwal menyusul';
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(m);
  }

  const primaryStage = matches[0]?.stage;
  const isPlayoff = primaryStage && primaryStage !== 'regular';
  const isFinal = primaryStage === 'final' || primaryStage === 'grand_final';
  const title = isPlayoff
    ? (STAGE_LABEL[primaryStage] || `Week ${week}`)
    : `Week ${week}`;

  return (
    <div className={`rounded-xl overflow-hidden ${isFinal ? 'ring-1 ring-amber-500/40 shadow-lg shadow-amber-500/10' : ''}`}
      style={{
        background: isFinal ? '#0f0f14' : '#0d1017',
        border: `1px solid ${isFinal ? 'rgba(245,158,11,0.35)' : isPlayoff ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)'}`,
      }}>
      <div className="px-3 py-2 text-center flex items-center justify-center gap-1.5"
        style={{
          background: isFinal
            ? 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(234,179,8,0.08) 100%)'
            : isPlayoff ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)',
          borderBottom: `1px solid ${isFinal ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)'}`,
        }}>
        {isPlayoff && <Trophy className={`w-3.5 h-3.5 ${isFinal ? 'text-yellow-400' : 'text-amber-400'}`} />}
        <span className={`text-xs font-black uppercase tracking-wider ${isFinal ? 'text-yellow-400' : isPlayoff ? 'text-amber-400' : 'text-gray-400'}`}>{title}</span>
        {isFinal && <Trophy className="w-3.5 h-3.5 text-yellow-400" />}
      </div>

      {Object.entries(byDate).map(([date, dateMatches]) => (
        <div key={date}>
          <div className="px-3 py-1 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="text-[10px] text-gray-600 font-bold">{date}</span>
          </div>
          {dateMatches.map(m => (
            <MatchRow key={m.id} match={m} onClick={onMatchClick ? () => onMatchClick(m) : undefined} isSelected={m.id === selectedMatchId} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Team Standings ───────────────────────────────────────────────────────────

function TeamStandings({ teams }: { teams: IKLTeam[] }) {
  const sorted = [...teams].sort((a, b) => a.standing - b.standing);

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs font-black uppercase tracking-wider text-gray-500">Team Standings</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[300px]">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              <th className="text-left px-3 py-1.5 text-gray-600 font-bold w-8">#</th>
              <th className="text-left px-2 py-1.5 text-gray-600 font-bold">Team</th>
              <th className="text-center px-2 py-1.5 text-gray-600 font-bold">W</th>
              <th className="text-center px-2 py-1.5 text-gray-600 font-bold">L</th>
              <th className="text-center px-2 py-1.5 text-gray-600 font-bold">Map</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((team, i) => (
              <tr key={team.id} style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                <td className="px-3 py-1.5 font-black" style={{ color: i < 4 ? '#F59E0B' : '#4B5563' }}>
                  {team.standing}
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    {team.logo_url ? (
                      <img src={`${API}${team.logo_url}`} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
                    ) : (
                      <div className="w-1.5 h-4 rounded-full flex-shrink-0" style={{ background: team.color }} />
                    )}
                    <span className="font-bold text-white">{team.short_name}</span>
                  </div>
                </td>
                <td className="text-center px-2 py-1.5 text-green-400 font-bold">{team.wins}</td>
                <td className="text-center px-2 py-1.5 text-red-400 font-bold">{team.losses}</td>
                <td className="text-center px-2 py-1.5 text-gray-500 font-bold">{team.map_wins}-{team.map_losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Champion Banner ──────────────────────────────────────────────────────────

function ChampionBanner({ matches }: { matches: IKLMatch[] }) {
  const final = matches.find(m =>
    (m.stage === 'final' || m.stage === 'grand_final') && m.status === 'completed' && m.winner_team_id,
  );
  if (!final) return null;

  const isT1 = final.winner_team_id === final.team1_id;
  const winner = {
    name: isT1 ? final.team1_name : final.team2_name,
    short: isT1 ? final.team1_short : final.team2_short,
    color: isT1 ? final.team1_color : final.team2_color,
    logo: isT1 ? final.team1_logo : final.team2_logo,
    score: `${final.team1_score}-${final.team2_score}`,
  };

  return (
    <div className="rounded-xl p-5 text-center relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${winner.color}12 0%, ${winner.color}04 100%)`,
        border: `1px solid ${winner.color}30`,
      }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${winner.color}08, transparent 60%)` }} />
      <div className="relative">
        <Trophy className="w-8 h-8 mx-auto mb-2" style={{ color: winner.color }} />
        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Season Champion</div>
        <div className="flex items-center justify-center gap-3">
          {winner.logo && (
            <img src={`${API}${winner.logo}`} alt="" className="w-10 h-10 object-contain" />
          )}
          <span className="text-2xl font-black text-white">{winner.name}</span>
        </div>
        <div className="text-sm font-bold mt-1.5" style={{ color: winner.color }}>
          Grand Final: {winner.score}
        </div>
      </div>
    </div>
  );
}

// ── Cross-Table Matrix ──────────────────────────────────────────────────────

function CrossTableMatrix({ matches, teams }: { matches: IKLMatch[]; teams: IKLTeam[] }) {
  const regular = matches.filter(m => m.status === 'completed' && m.winner_team_id && m.stage === 'regular');
  if (regular.length === 0 || teams.length === 0) return null;

  const sorted = [...teams].sort((a, b) => a.standing - b.standing);

  const h2h = new Map<number, Map<number, { wins: number; losses: number }>>();
  for (const m of regular) {
    for (const tid of [m.team1_id, m.team2_id]) {
      if (!h2h.has(tid)) h2h.set(tid, new Map());
    }
    const r1 = h2h.get(m.team1_id)!;
    const r2 = h2h.get(m.team2_id)!;
    if (!r1.has(m.team2_id)) r1.set(m.team2_id, { wins: 0, losses: 0 });
    if (!r2.has(m.team1_id)) r2.set(m.team1_id, { wins: 0, losses: 0 });
    if (m.winner_team_id === m.team1_id) {
      r1.get(m.team2_id)!.wins++;
      r2.get(m.team1_id)!.losses++;
    } else {
      r1.get(m.team2_id)!.losses++;
      r2.get(m.team1_id)!.wins++;
    }
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Swords className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs font-black uppercase tracking-wider text-gray-500">Head-to-Head Results</span>
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs" style={{ minWidth: `${sorted.length * 48 + 90}px` }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              <th className="px-2 py-2 text-left text-gray-600 font-bold sticky left-0 z-10 bg-[#0d1017]" />
              {sorted.map(t => (
                <th key={t.id} className="px-1 py-2 text-center font-bold whitespace-nowrap" style={{ color: t.color, minWidth: 44 }}>
                  {t.logo_url ? (
                    <img src={`${API}${t.logo_url}`} alt={t.short_name} className="w-5 h-5 object-contain mx-auto mb-0.5" />
                  ) : null}
                  <div className="text-[10px]">{t.short_name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => (
              <tr key={row.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <td className="px-2 py-1.5 font-bold sticky left-0 z-10 bg-[#0d1017]">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    {row.logo_url ? (
                      <img src={`${API}${row.logo_url}`} alt="" className="w-4 h-4 object-contain" />
                    ) : (
                      <div className="w-1.5 h-4 rounded-full" style={{ background: row.color }} />
                    )}
                    <span style={{ color: row.color }}>{row.short_name}</span>
                  </div>
                </td>
                {sorted.map(col => {
                  if (row.id === col.id) {
                    return <td key={col.id} className="px-1 py-1.5 text-center text-gray-700" style={{ background: 'rgba(255,255,255,0.02)' }}>—</td>;
                  }
                  const rec = h2h.get(row.id)?.get(col.id);
                  if (!rec || (rec.wins === 0 && rec.losses === 0)) {
                    return <td key={col.id} className="px-1 py-1.5 text-center text-gray-700">-</td>;
                  }
                  const w = rec.wins > rec.losses;
                  const l = rec.wins < rec.losses;
                  return (
                    <td key={col.id} className="px-1 py-1.5 text-center font-bold" style={{
                      background: w ? 'rgba(34,197,94,0.08)' : l ? 'rgba(239,68,68,0.08)' : 'transparent',
                      color: w ? '#22C55E' : l ? '#EF4444' : '#9CA3AF',
                    }}>
                      {rec.wins}-{rec.losses}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Match Detail Modal ──────────────────────────────────────────────────────

function MatchDetailModal({ match, onClose }: { match: IKLMatch; onClose: () => void }) {
  const [stats, setStats] = useState<MatchPlayerStat[] | null>(null);
  const [preview, setPreview] = useState<MatchPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMatchStats(match.id).catch(() => []),
      getMatchPreview(match.id).catch(() => null),
    ]).then(([s, p]) => {
      setStats(Array.isArray(s) ? s : []);
      if (p) setPreview(p);
    }).finally(() => setLoading(false));
  }, [match.id]);

  const totalGames = match.team1_score + match.team2_score;
  const hasWinner = !!match.winner_team_id;
  const isBO7 = match.best_of === 7;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative bg-[#0d1017] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0d1017]/95 backdrop-blur-sm px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                {STAGE_LABEL[match.stage] || match.stage} · Week {match.week}
              </span>
              {match.match_date && (
                <span className="text-xs text-gray-600">
                  {new Date(match.match_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
          </div>
          {/* Teams + Score */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 min-w-0">
              {match.team1_logo ? <img src={`${API}${match.team1_logo}`} alt="" className="w-8 h-8 object-contain flex-shrink-0" /> : <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: match.team1_color }} />}
              <div className="min-w-0">
                <div className={`font-black text-sm ${hasWinner && match.winner_team_id === match.team1_id ? 'text-white' : 'text-gray-500'}`}>{match.team1_short}</div>
                <div className="text-xs text-gray-700 truncate hidden sm:block">{match.team1_name}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-2xl font-black ${match.winner_team_id === match.team1_id ? 'text-white' : 'text-gray-600'}`}>{match.team1_score}</span>
              <Swords className="w-4 h-4 text-gray-700" />
              <span className={`text-2xl font-black ${match.winner_team_id === match.team2_id ? 'text-white' : 'text-gray-600'}`}>{match.team2_score}</span>
            </div>
            <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
              <div className="min-w-0 text-right">
                <div className={`font-black text-sm ${hasWinner && match.winner_team_id === match.team2_id ? 'text-white' : 'text-gray-500'}`}>{match.team2_short}</div>
                <div className="text-xs text-gray-700 truncate hidden sm:block">{match.team2_name}</div>
              </div>
              {match.team2_logo ? <img src={`${API}${match.team2_logo}`} alt="" className="w-8 h-8 object-contain flex-shrink-0" /> : <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: match.team2_color }} />}
            </div>
          </div>
          {/* Winner + VOD */}
          <div className="flex items-center justify-center gap-2 mt-2">
            {hasWinner && (
              <span className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-full" style={{
                background: match.winner_team_id === match.team1_id ? `${match.team1_color}15` : `${match.team2_color}15`,
                color: match.winner_team_id === match.team1_id ? match.team1_color : match.team2_color,
              }}><Trophy className="w-3 h-3" />{match.winner_short} wins</span>
            )}
            {match.vod_url && (
              <a href={match.vod_url} target="_blank" rel="noopener noreferrer"
                className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-full hover:opacity-80"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Play className="w-3 h-3" /> VOD
              </a>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pb-4">
          {/* H2H Preview */}
          {preview && (preview.h2h.total > 0 || preview.team1Form.length > 0) && (
            <div className="rounded-xl p-3 mt-3 space-y-2" style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.06)' }}>
              {preview.h2h.total > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-bold">Head-to-Head</span>
                  <div className="flex items-center gap-2 text-xs font-black">
                    <span style={{ color: match.team1_color }}>{match.team1_short} {preview.h2h.team1Wins}</span>
                    <span className="text-gray-600">-</span>
                    <span style={{ color: match.team2_color }}>{preview.h2h.team2Wins} {match.team2_short}</span>
                  </div>
                </div>
              )}
              {(preview.team1Form.length > 0 || preview.team2Form.length > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-600 font-bold mb-1">{match.team1_short} form</p>
                    <FormDots form={preview.team1Form} color={match.team1_color} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-600 font-bold mb-1">{match.team2_short} form</p>
                    <div className="flex justify-end"><FormDots form={preview.team2Form} color={match.team2_color} /></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Game Stats */}
          {loading ? (
            <div className="py-8 flex justify-center"><div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" /></div>
          ) : stats && stats.length > 0 ? (
            <>
              {Array.from({ length: totalGames }, (_, i) => i + 1).map(g => {
                const vts = match.vod_timestamps?.find((v: VodTimestamp) => v.game === g);
                return <GameStatsRow key={g} stats={stats} gameNumber={g} isUltimateBattle={isBO7 && g === 7} vodLink={vts ? { url: vts.url, timestamp: vts.timestamp } : undefined} />;
              })}
              {/* Match Recap */}
              {hasWinner && (() => {
                const mvps = stats.filter(s => s.is_mvp);
                const pentas = stats.filter(s => s.has_penta_kill);
                const topKiller = [...stats].sort((a, b) => b.kills - a.kills)[0];
                const winnerShort = match.winner_team_id === match.team1_id ? match.team1_short : match.team2_short;
                const loserShort = match.winner_team_id === match.team1_id ? match.team2_short : match.team1_short;
                const isSweep = Math.min(match.team1_score, match.team2_score) === 0;
                return (
                  <div className="mt-3 rounded-xl p-3 text-xs text-gray-400" style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="font-bold text-gray-300 mb-1">Match Recap</p>
                    <p>
                      <span className="font-bold text-white">{winnerShort}</span>
                      {isSweep ? ' swept ' : ' defeated '}
                      <span className="font-bold text-white">{loserShort}</span>
                      {` ${match.team1_score}-${match.team2_score} in ${totalGames} game${totalGames > 1 ? 's' : ''}.`}
                      {topKiller && ` ${topKiller.player_name} led with ${topKiller.kills} kills.`}
                      {mvps.length > 0 && ` MVP${mvps.length > 1 ? 's' : ''}: ${[...new Set(mvps.map(m => m.player_name))].join(', ')}.`}
                      {pentas.length > 0 && ` Penta Kill by ${pentas.map(p => p.player_name).join(', ')}!`}
                    </p>
                  </div>
                );
              })()}
            </>
          ) : (
            <p className="text-center text-gray-600 text-sm py-6">No game stats recorded yet</p>
          )}
          <MatchComments matchId={match.id} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function MatchesTab({
  matches: initialMatches, loading, seasonId,
  players = [], isAuthenticated = false, teams = [],
}: Props) {
  const [matches, setMatches] = useState(initialMatches);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<IKLMatch | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setMatches(initialMatches); }, [initialMatches]);

  const hasLiveMatches = matches.some(m => m.status === 'live');

  const refetch = useCallback(async () => {
    if (!seasonId) return;
    try {
      const fresh = await getMatches(seasonId);
      if (Array.isArray(fresh)) setMatches(fresh);
    } catch { /* silent */ }
  }, [seasonId]);

  useEffect(() => {
    if (hasLiveMatches && seasonId) {
      setIsAutoRefreshing(true);
      intervalRef.current = setInterval(refetch, POLL_INTERVAL);
    } else {
      setIsAutoRefreshing(false);
    }
    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [hasLiveMatches, seasonId, refetch]);

  if (loading) return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl p-4 space-y-2" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="h-4 w-20 mx-auto rounded bg-white/5 animate-pulse" />
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="h-8 rounded bg-white/5 animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );

  if (!matches.length) return (
    <div className="py-20 text-center rounded-2xl max-w-md mx-auto" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Swords className="w-14 h-14 text-gray-800 mx-auto mb-4" />
      <p className="text-gray-400 font-black text-lg mb-2">No Matches Yet</p>
      <p className="text-gray-600 text-sm leading-relaxed px-6">
        Match results will appear here once the IKL season gets underway.
      </p>
    </div>
  );

  // Group by week
  const byWeek: Record<number, IKLMatch[]> = {};
  for (const m of matches) {
    if (!byWeek[m.week]) byWeek[m.week] = [];
    byWeek[m.week].push(m);
  }

  const weeks = Object.entries(byWeek).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className="space-y-6">
      {/* Live auto-refresh indicator */}
      {isAutoRefreshing && (
        <div className="flex items-center justify-center gap-2 py-2 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">LIVE</span>
          <span className="text-xs text-gray-500">Auto-refreshing every 30s</span>
        </div>
      )}

      {/* Champion banner */}
      <ChampionBanner matches={matches} />

      {/* Top: Standings */}
      {teams.length > 0 && (
        <TeamStandings teams={teams} />
      )}

      {/* Cross-Table Matrix */}
      {teams.length > 0 && (
        <CrossTableMatrix matches={matches} teams={teams} />
      )}

      {/* Predictions for upcoming matches */}
      {isAuthenticated && (() => {
        const upcoming = matches.filter(m => m.status === 'upcoming');
        if (upcoming.length === 0) return null;
        return (
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-green-400" />
              Prediksi Match Mendatang
              <span className="ml-auto flex items-center gap-2 text-[10px] text-gray-700 font-bold normal-case tracking-normal">
                <span className="flex items-center gap-0.5"><Target className="w-3 h-3 text-green-400" />Winner 3pts</span>
                <span className="flex items-center gap-0.5"><Zap className="w-3 h-3 text-amber-400" />Score 5pts</span>
              </span>
            </h3>
            <div className="space-y-3">
              {upcoming.slice(0, 5).map(match => (
                <PredictionCard key={`pred-${match.id}`} match={match} players={players} />
              ))}
            </div>
          </div>
        );
      })()}

      {/* Match Results Grid */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
          <Swords className="w-3.5 h-3.5 text-amber-400" />
          Match Results
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {weeks.map(([week, weekMatches]) => (
            <WeekCard key={week} week={Number(week)} matches={weekMatches} onMatchClick={setSelectedMatch} selectedMatchId={selectedMatch?.id} />
          ))}
        </div>
      </div>

      {/* Match Detail Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
