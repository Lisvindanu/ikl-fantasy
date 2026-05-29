import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Trophy, Swords, Play } from 'lucide-react';
import { RolePill } from '../../components/fantasy/RolePill';
import type { Role } from '../../components/fantasy/types';
import type { IKLMatch, MatchPlayerStat, MatchPreview } from '../../api/fantasy';
import * as fantasyApi from '../../api/fantasy';
import { API } from '../../api/fantasy';
import { MatchComments } from './MatchComments';

export const STAGE_LABEL: Record<string, string> = {
  regular: 'Regular Season',
  quarterfinal: 'Quarterfinal',
  semifinal: 'Semifinal',
  final: 'Grand Final',
};

function ScoreBox({ score, isWinner, color }: { score: number; isWinner: boolean; color: string }) {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl"
      style={{
        background: isWinner ? `${color}25` : 'rgba(255,255,255,0.05)',
        border: isWinner ? `1.5px solid ${color}60` : '1.5px solid rgba(255,255,255,0.08)',
        color: isWinner ? color : '#4B5563',
      }}>
      {score}
    </div>
  );
}

export function GameStatsRow({ stats, gameNumber, isUltimateBattle }: { stats: MatchPlayerStat[]; gameNumber: number; isUltimateBattle?: boolean }) {
  const game = stats.filter(s => s.game_number === gameNumber);
  if (!game.length) return null;

  const teams: Record<string, MatchPlayerStat[]> = {};
  for (const s of game) {
    if (!teams[s.team_short]) teams[s.team_short] = [];
    teams[s.team_short].push(s);
  }

  return (
    <div className="mt-3">
      <div className="text-xs font-black uppercase tracking-widest text-gray-600 mb-2 text-center flex items-center justify-center gap-2">
        <span>Game {gameNumber}</span>
        {isUltimateBattle && (
          <span className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
            ULTIMATE BATTLE
          </span>
        )}
      </div>
      <div className="overflow-x-auto rounded-xl" style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.06)' }}>
        <table className="w-full text-xs min-w-[400px]">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              <th className="text-left px-3 py-2 text-gray-600 font-bold">Player</th>
              <th className="text-center px-2 py-2 text-gray-600 font-bold">K</th>
              <th className="text-center px-2 py-2 text-gray-600 font-bold">D</th>
              <th className="text-center px-2 py-2 text-gray-600 font-bold">A</th>
              <th className="text-center px-2 py-2 text-gray-600 font-bold">Pts</th>
              <th className="text-center px-2 py-2 text-gray-600 font-bold">Bonus</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(teams).map(([teamShort, players]) => (
              players.map((p, i) => {
                const pts = p.kills + p.assists - p.deaths + (p.is_mvp ? 3 : 0) + (p.has_penta_kill ? 10 : 0);
                return (
                  <tr key={p.id} className="border-t border-white/5"
                    style={{ background: i === 0 && Object.keys(teams).indexOf(teamShort) === 0 ? `${p.team_color}06` : 'transparent' }}>
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center font-black text-xs"
                          style={{ background: `${p.team_color}30`, color: p.team_color }}>
                          {p.photo_url
                            ? <img src={p.photo_url} alt={p.player_name} className="w-full h-full object-cover object-top" />
                            : p.player_name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-white">{p.player_name}</span>
                        <RolePill role={p.role as Role} size="xs" />
                      </div>
                    </td>
                    <td className="text-center px-2 py-1.5 text-green-400 font-bold">{p.kills}</td>
                    <td className="text-center px-2 py-1.5 text-red-400 font-bold">{p.deaths}</td>
                    <td className="text-center px-2 py-1.5 text-blue-400 font-bold">{p.assists}</td>
                    <td className="text-center px-2 py-1.5 font-black text-amber-400">{pts > 0 ? `+${pts}` : pts}</td>
                    <td className="text-center px-2 py-1.5">
                      <div className="flex items-center justify-center gap-1">
                        {p.is_mvp && <span className="text-xs px-1 rounded" style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}>MVP</span>}
                        {p.has_penta_kill && <span className="text-xs px-1 rounded" style={{ background: 'rgba(239,68,68,0.2)', color: '#F87171' }}>PENTA</span>}
                        {p.is_standin && <span className="text-xs px-1 rounded" style={{ background: 'rgba(168,85,247,0.2)', color: '#C084FC' }}>SUB</span>}
                      </div>
                    </td>
                  </tr>
                );
              })
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FormDots({ form, color }: { form: ('W' | 'L' | 'D')[]; color: string }) {
  return (
    <div className="flex gap-1">
      {form.map((r, i) => (
        <div key={i} className="w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center"
          style={{
            background: r === 'W' ? `${color}30` : r === 'L' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)',
            color: r === 'W' ? color : r === 'L' ? '#EF4444' : '#6B7280',
            border: `1px solid ${r === 'W' ? `${color}50` : r === 'L' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`,
          }}>
          {r}
        </div>
      ))}
    </div>
  );
}

export function MatchCard({ match }: { match: IKLMatch }) {
  const [expanded, setExpanded] = useState(false);
  const [stats, setStats] = useState<MatchPlayerStat[] | null>(null);
  const [preview, setPreview] = useState<MatchPreview | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const totalGames = match.team1_score + match.team2_score;
  const hasWinner = !!match.winner_team_id;
  const isBO7 = match.best_of === 7;
  const hasGame7 = Array.isArray(stats) && stats.some(s => s.game_number === 7);

  async function toggleExpand() {
    if (!expanded && !stats) {
      setLoadingStats(true);
      try {
        const [s, p] = await Promise.all([
          fantasyApi.getMatchStats(match.id).catch(() => []),
          fantasyApi.getMatchPreview(match.id).catch(() => null),
        ]);
        setStats(Array.isArray(s) ? s : []);
        if (p) setPreview(p);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStats(false);
      }
    }
    setExpanded(v => !v);
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Match header */}
      <button
        className={`w-full text-left ${expanded ? 'sticky top-0 z-10 bg-[#0d1017]/95 backdrop-blur-sm border-b border-gray-700/50 md:static md:bg-transparent md:backdrop-blur-none md:border-b-0' : ''}`}
        onClick={toggleExpand}
      >
        <div className="p-4">
          {/* Stage + status + date */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                {STAGE_LABEL[match.stage] || match.stage} · Week {match.week}
              </span>
              {isBO7 && (
                <span className="bg-gradient-to-r from-purple-600 to-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  BO7
                </span>
              )}
              {isBO7 && hasGame7 && (
                <span className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                  ULTIMATE BATTLE
                </span>
              )}
              {match.status && match.status !== 'completed' && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  match.status === 'live' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                  match.status === 'upcoming' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                  match.status === 'postponed' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' :
                  'bg-white/5 text-gray-500 border border-white/10'
                }`}>
                  {match.status === 'live' && '● '}{match.status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {match.match_date && (
                <span className="text-xs text-gray-600">
                  {new Date(match.match_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* Teams + score */}
          <div className="flex items-center gap-3">
            {/* Team 1 */}
            <div className="flex-1 flex items-center gap-2">
              {match.team1_logo ? (
                <img src={`${API}${match.team1_logo}`} alt={match.team1_short} className="w-8 h-8 object-contain flex-shrink-0" />
              ) : (
                <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: match.team1_color }} />
              )}
              <div className="min-w-0">
                <div className={`font-black text-sm ${match.winner_team_id === match.team1_id ? 'text-white' : 'text-gray-500'}`}>
                  {match.team1_short}
                </div>
                <div className="text-xs text-gray-700 truncate hidden sm:block">{match.team1_name}</div>
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ScoreBox score={match.team1_score} isWinner={match.winner_team_id === match.team1_id} color={match.team1_color} />
              <div className="flex flex-col items-center">
                <Swords className="w-3.5 h-3.5 text-gray-700" />
                {!hasWinner && <span className="text-xs text-gray-700 mt-0.5">TBD</span>}
              </div>
              <ScoreBox score={match.team2_score} isWinner={match.winner_team_id === match.team2_id} color={match.team2_color} />
            </div>

            {/* Team 2 */}
            <div className="flex-1 flex items-center gap-2 justify-end">
              <div className="min-w-0 text-right">
                <div className={`font-black text-sm ${match.winner_team_id === match.team2_id ? 'text-white' : 'text-gray-500'}`}>
                  {match.team2_short}
                </div>
                <div className="text-xs text-gray-700 truncate hidden sm:block">{match.team2_name}</div>
              </div>
              {match.team2_logo ? (
                <img src={`${API}${match.team2_logo}`} alt={match.team2_short} className="w-8 h-8 object-contain flex-shrink-0" />
              ) : (
                <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: match.team2_color }} />
              )}
            </div>
          </div>

          {/* Winner badge + VOD link */}
          <div className="mt-2 flex items-center justify-center gap-2">
            {hasWinner && (
              <span className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{
                  background: match.winner_team_id === match.team1_id ? `${match.team1_color}15` : `${match.team2_color}15`,
                  color: match.winner_team_id === match.team1_id ? match.team1_color : match.team2_color,
                }}>
                <Trophy className="w-3 h-3" />
                {match.winner_short} wins
              </span>
            )}
            {match.vod_url && (
              <a href={match.vod_url} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors hover:opacity-80"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Play className="w-3 h-3" /> VOD
              </a>
            )}
          </div>
        </div>
      </button>

      {/* Expanded: game stats */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/6"
          >
            <div className="px-4 pb-4">
              {/* Pre-match preview */}
              {preview && (preview.h2h.total > 0 || preview.team1Form.length > 0) && (
                <div className="rounded-xl p-3 mb-3 space-y-2" style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.06)' }}>
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
                        <div className="flex justify-end">
                          <FormDots form={preview.team2Form} color={match.team2_color} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {loadingStats ? (
                <div className="py-6 flex justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                </div>
              ) : stats && stats.length > 0 ? (
                <>
                  {Array.from({ length: totalGames }, (_, i) => i + 1).map(g => (
                    <GameStatsRow key={g} stats={stats} gameNumber={g} isUltimateBattle={isBO7 && g === 7} />
                  ))}
                  {/* Post-match recap */}
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
                <p className="text-center text-gray-600 text-sm py-4">No game stats recorded yet</p>
              )}

              {/* Match comments (#38) */}
              <MatchComments matchId={match.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
