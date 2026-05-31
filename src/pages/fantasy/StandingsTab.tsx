import { useState, useEffect } from 'react';
import { TrendingUp, Crown, Medal, Star, Trophy, Flame, Info, Zap, Newspaper, Users, Shield, Swords, Target, ChevronRight } from 'lucide-react';
import { RolePill } from '../../components/fantasy/RolePill';
import type { Role } from '../../components/fantasy/types';
import type { IKLSeason, IKLTeam, IKLPlayer, PlayerOfTheWeek, SeasonRecords, TeamStanding, PlayerNews } from '../../api/fantasy';
import * as fantasyApi from '../../api/fantasy';

interface Props {
  season: IKLSeason & { teams: IKLTeam[] };
  sortedByPts: IKLPlayer[];
  maxPts: number;
  onDetail: (p: IKLPlayer) => void;
  // Action card navigation
  onGoToDraft?: () => void;
  onGoToTeam?: () => void;
  onGoToMatches?: () => void;
  onGoToPredictions?: () => void;
  activeMode?: 'player' | 'team' | 'both' | null;
  hasDraftPicks?: boolean;
  hasTeamPick?: boolean;
  isAuthenticated?: boolean;
}

function rankColor(rank: number): string {
  if (rank === 1) return '#F59E0B'; // gold
  if (rank === 2) return '#9CA3AF'; // silver
  if (rank === 3) return '#CD7F32'; // bronze
  return '#4B5563';
}

function diffDisplay(value: number): { text: string; color: string } {
  if (value > 0) return { text: `+${value}`, color: '#22C55E' };
  if (value < 0) return { text: String(value), color: '#EF4444' };
  return { text: '0', color: '#6B7280' };
}

export function StandingsTab({ season, sortedByPts, maxPts, onDetail, onGoToDraft, onGoToTeam, onGoToMatches, onGoToPredictions, activeMode, hasDraftPicks, hasTeamPick, isAuthenticated }: Props) {
  const [potw, setPotw] = useState<PlayerOfTheWeek | null>(null);
  const [records, setRecords] = useState<SeasonRecords | null>(null);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [showScoringDetail, setShowScoringDetail] = useState(false);
  const [news, setNews] = useState<PlayerNews[]>([]);

  useEffect(() => {
    fantasyApi.getPlayerOfTheWeek(season.id).then(setPotw).catch(() => {});
    fantasyApi.getSeasonRecords(season.id).then(setRecords).catch(() => {});
    fantasyApi.getSeasonStandings(season.id)
      .then(setStandings)
      .catch((err) => setStandingsError(err.message || 'Failed to load standings'));
    fantasyApi.getSeasonNews(season.id).then(setNews).catch(() => {});
  }, [season.id]);

  return (
    <div className="space-y-8">
      {/* Player of the Week (#58) */}
      {potw && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${potw.team_color}15 0%, #0d1017 60%)`, border: `1px solid ${potw.team_color}30` }}>
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center font-black text-lg flex-shrink-0"
              style={{ background: `${potw.team_color}30`, color: potw.team_color, border: `2px solid ${potw.team_color}50` }}>
              {potw.photo_url
                ? <img src={potw.photo_url} alt={potw.name} className="w-full h-full object-cover object-top" />
                : potw.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <Star className="w-3 h-3 inline -mt-0.5 mr-1" />Player of the Week
                </span>
                <span className="text-xs text-gray-600">Week {potw.week}</span>
              </div>
              <div className="font-black text-white text-lg">{potw.name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold px-1.5 rounded" style={{ background: `${potw.team_color}25`, color: potw.team_color }}>{potw.team_short}</span>
                <RolePill role={potw.role as Role} size="xs" />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-black text-3xl leading-none" style={{ color: potw.team_color }}>{potw.week_pts}</div>
              <div className="text-gray-600 text-xs mt-1">pts this week</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {potw.total_kills}/{potw.total_deaths}/{potw.total_assists} · {potw.mvp_count} MVP
              </div>
            </div>
          </div>
        </div>
      )}

      {/* What to do next — action cards */}
      {isAuthenticated && (
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" /> Yang Bisa Kamu Lakukan
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(activeMode === 'player' || activeMode === 'both') && !hasDraftPicks && onGoToDraft && (
              <button onClick={onGoToDraft}
                className="rounded-xl p-3 text-left group transition-all hover:border-amber-500/30"
                style={{ background: '#0d1017', border: '1px solid rgba(245,158,11,0.15)' }}>
                <Users className="w-5 h-5 text-amber-400 mb-2" />
                <div className="text-white font-bold text-xs">Draft Pemain</div>
                <div className="text-gray-600 text-[10px] mt-0.5">Belum ada lineup</div>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400/60 mt-1" />
              </button>
            )}
            {(activeMode === 'player' || activeMode === 'both') && hasDraftPicks && onGoToDraft && (
              <button onClick={onGoToDraft}
                className="rounded-xl p-3 text-left group transition-all hover:border-green-500/30"
                style={{ background: '#0d1017', border: '1px solid rgba(34,197,94,0.15)' }}>
                <Users className="w-5 h-5 text-green-400 mb-2" />
                <div className="text-white font-bold text-xs">Edit Lineup</div>
                <div className="text-gray-600 text-[10px] mt-0.5">Ubah formasi</div>
                <ChevronRight className="w-3.5 h-3.5 text-green-400/60 mt-1" />
              </button>
            )}
            {(activeMode === 'team' || activeMode === 'both') && !hasTeamPick && onGoToTeam && (
              <button onClick={onGoToTeam}
                className="rounded-xl p-3 text-left group transition-all hover:border-purple-500/30"
                style={{ background: '#0d1017', border: '1px solid rgba(168,85,247,0.15)' }}>
                <Shield className="w-5 h-5 text-purple-400 mb-2" />
                <div className="text-white font-bold text-xs">Pilih Tim</div>
                <div className="text-gray-600 text-[10px] mt-0.5">Belum pilih tim</div>
                <ChevronRight className="w-3.5 h-3.5 text-purple-400/60 mt-1" />
              </button>
            )}
            {onGoToMatches && (
              <button onClick={onGoToMatches}
                className="rounded-xl p-3 text-left group transition-all hover:border-white/15"
                style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Swords className="w-5 h-5 text-blue-400 mb-2" />
                <div className="text-white font-bold text-xs">Lihat Pertandingan</div>
                <div className="text-gray-600 text-[10px] mt-0.5">Jadwal & hasil</div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 mt-1" />
              </button>
            )}
            {onGoToPredictions && (
              <button onClick={onGoToPredictions}
                className="rounded-xl p-3 text-left group transition-all hover:border-white/15"
                style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Target className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="text-white font-bold text-xs">Prediksi Match</div>
                <div className="text-gray-600 text-[10px] mt-0.5">Tebak pemenang</div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 mt-1" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Latest News (#55) */}
      {news.length > 0 && (
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-amber-400" /> Latest News
          </h2>
          <div className="space-y-2">
            {news.slice(0, 5).map(n => {
              const typeBadge: Record<string, { label: string; bg: string; color: string }> = {
                roster_move: { label: 'ROSTER', bg: 'rgba(59,130,246,0.15)', color: '#60A5FA' },
                injury: { label: 'INJURY', bg: 'rgba(239,68,68,0.15)', color: '#F87171' },
                suspension: { label: 'SUSPENDED', bg: 'rgba(245,158,11,0.15)', color: '#FBBF24' },
                general: { label: 'NEWS', bg: 'rgba(255,255,255,0.08)', color: '#9CA3AF' },
              };
              const badge = typeBadge[n.news_type] || typeBadge.general;
              const teamColor = n.team_color || '#6B7280';

              return (
                <div key={n.id} className="rounded-xl px-4 py-3 flex items-start gap-3"
                  style={{ background: '#0d1017', border: `1px solid ${teamColor}20` }}>
                  {/* Player photo or team accent */}
                  <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5"
                    style={{ background: `${teamColor}25`, color: teamColor, border: `1.5px solid ${teamColor}40` }}>
                    {n.photo_url
                      ? <img src={n.photo_url} alt={n.player_name || ''} className="w-full h-full object-cover object-top" />
                      : n.team_short
                        ? n.team_short.slice(0, 2)
                        : <Newspaper className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                      {n.team_short && (
                        <span className="text-xs font-bold px-1.5 rounded"
                          style={{ background: `${teamColor}20`, color: teamColor }}>
                          {n.team_short}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-700">
                        {(() => {
                          const diff = Date.now() - new Date(n.created_at).getTime();
                          const mins = Math.floor(diff / 60_000);
                          if (mins < 60) return `${mins}m ago`;
                          const hrs = Math.floor(mins / 60);
                          if (hrs < 24) return `${hrs}h ago`;
                          const days = Math.floor(hrs / 24);
                          return `${days}d ago`;
                        })()}
                      </span>
                    </div>
                    <div className="font-bold text-white text-sm">{n.title}</div>
                    {n.content && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.content}</p>
                    )}
                    {n.player_name && (
                      <span className="text-xs text-gray-600 mt-0.5 inline-block">
                        {n.player_name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team standings table */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" /> Regular Season Standings
        </h2>
        {standingsError ? (
          <div className="rounded-2xl p-6 text-center text-red-400 text-sm"
            style={{ background: '#0d1017', border: '1px solid rgba(239,68,68,0.2)' }}>
            {standingsError}
          </div>
        ) : standings.length === 0 ? (
          <div className="rounded-2xl p-6 text-center text-gray-600 text-sm"
            style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            No standings data available yet.
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-600 w-10">#</th>
                    <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-600">Team</th>
                    <th className="px-3 py-3 text-center text-xs font-black uppercase tracking-wider text-gray-600 w-10">W</th>
                    <th className="px-3 py-3 text-center text-xs font-black uppercase tracking-wider text-gray-600 w-10">L</th>
                    <th className="px-3 py-3 text-center text-xs font-black uppercase tracking-wider text-gray-600 w-10">D</th>
                    <th className="px-3 py-3 text-center text-xs font-black uppercase tracking-wider text-gray-600 w-12">PTS</th>
                    <th className="px-3 py-3 text-center text-xs font-black uppercase tracking-wider text-gray-600 w-12">GD</th>
                    <th className="px-3 py-3 text-center text-xs font-black uppercase tracking-wider text-gray-600 w-12">KD</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team) => {
                    const gd = diffDisplay(team.game_diff);
                    const kd = diffDisplay(team.kills_diff);
                    return (
                      <tr key={team.team_id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors"
                        style={{ background: team.rank === 1 ? 'rgba(245,158,11,0.04)' : 'transparent' }}>
                        <td className="px-3 py-3">
                          <span className="font-black text-sm" style={{ color: rankColor(team.rank) }}>{team.rank}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {team.logo_url ? (
                              <img src={team.logo_url!} alt={team.short_name}
                                className="w-7 h-7 object-contain flex-shrink-0" />
                            ) : (
                              <div className="w-1 h-7 rounded-full flex-shrink-0" style={{ background: team.color }} />
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-white text-sm truncate hidden sm:block">{team.team_name}</div>
                              <div className="font-bold text-white text-sm sm:hidden">{team.short_name}</div>
                              <div className="text-xs text-gray-600 sm:hidden">{team.matches_played} played</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-green-400">{team.wins}</td>
                        <td className="px-3 py-3 text-center font-bold text-red-400">{team.losses}</td>
                        <td className="px-3 py-3 text-center font-bold text-gray-500">{team.draws}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-black text-white text-base">{team.points}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-bold text-xs" style={{ color: gd.color }}>{gd.text}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-bold text-xs" style={{ color: kd.color }}>{kd.text}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Top performers */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" /> Top Fantasy Performers
        </h2>
        <div className="space-y-2">
          {sortedByPts.slice(0, 8).map((p, i) => {
            const barWidth = maxPts > 0 ? (p.fantasy_pts / maxPts) * 100 : 0;
            return (
              <div key={p.id} className="relative rounded-xl overflow-hidden"
                style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="absolute inset-y-0 left-0 rounded-xl"
                  style={{ width: `${barWidth}%`, background: `${p.team_color}10`, transition: 'width 0.8s ease' }} />
                <div className="relative flex items-center gap-3 px-3 py-2.5">
                  <span className="text-gray-700 text-xs font-black w-4 text-center flex-shrink-0">{i + 1}</span>
                  <div
                    onClick={() => onDetail(p)}
                    className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center font-black text-xs flex-shrink-0 cursor-pointer"
                    style={{ background: `${p.team_color}30`, color: p.team_color, border: `1.5px solid ${p.team_color}50` }}>
                    {p.photo_url
                      ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover object-top"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      : p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm">{p.name}</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold px-1.5 rounded"
                        style={{ background: `${p.team_color}25`, color: p.team_color }}>{p.team_short}</span>
                      <RolePill role={p.role as Role} size="xs" />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-amber-400 text-lg leading-none">{p.fantasy_pts}</div>
                    <div className="text-gray-600 text-xs">{p.mvps} MVP</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Season Records (#42, #43) */}
      {records && (records.highest_kill_games?.length > 0 || records.best_individual_games?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {records.best_individual_games?.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Best Individual Performances
              </h2>
              <div className="space-y-2">
                {records.best_individual_games.map((g, i) => (
                  <div key={i} className="rounded-xl px-4 py-3 flex items-center gap-3"
                    style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-gray-700 text-xs font-black w-4">{i + 1}</span>
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center font-black text-xs flex-shrink-0"
                      style={{ background: `${g.team_color}30`, color: g.team_color }}>
                      {g.photo_url
                        ? <img src={g.photo_url} alt={g.player_name} className="w-full h-full object-cover object-top" />
                        : g.player_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm">{g.player_name}</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-bold" style={{ color: g.team_color }}>{g.team_short}</span>
                        <span className="text-gray-600">W{g.week}</span>
                        <span className="text-green-400">{g.kills}</span>
                        <span className="text-gray-700">/</span>
                        <span className="text-red-400">{g.deaths}</span>
                        <span className="text-gray-700">/</span>
                        <span className="text-blue-400">{g.assists}</span>
                        {g.is_mvp && <span className="text-amber-400 font-bold">MVP</span>}
                        {g.has_penta_kill && <span className="text-red-400 font-bold">PENTA</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-black text-amber-400 text-lg">{g.game_pts}</div>
                      <div className="text-gray-600 text-xs">pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {records.highest_kill_games?.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-400" /> Highest Kill Games
              </h2>
              <div className="space-y-2">
                {records.highest_kill_games.map((g, i) => (
                  <div key={i} className="rounded-xl px-4 py-3 flex items-center gap-3"
                    style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-gray-700 text-xs font-black w-4">{i + 1}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ color: g.team1_color }}>{g.team1_short}</span>
                      <span className="text-gray-700 text-xs">vs</span>
                      <span className="font-bold text-sm" style={{ color: g.team2_color }}>{g.team2_short}</span>
                      <span className="text-gray-600 text-xs">G{g.game_number} · W{g.week}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-black text-red-400 text-lg">{g.total_kills}</div>
                      <div className="text-gray-600 text-xs">kills</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Awards strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { icon: <Crown className="w-4 h-4" />,  label: 'Champion',   value: season.champion,           color: '#F59E0B' },
          { icon: <Medal className="w-4 h-4" />,  label: '2nd Place',  value: season.runner_up,          color: '#9CA3AF' },
          { icon: <Star  className="w-4 h-4" />,  label: 'Season MVP', value: season.regular_season_mvp, color: '#60A5FA' },
          { icon: <Trophy className="w-4 h-4" />, label: 'Finals MVP', value: season.finals_mvp,         color: '#A78BFA' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="rounded-2xl p-4"
            style={{ background: '#0d1017', border: `1px solid ${color}22` }}>
            <div className="flex items-center gap-1.5 mb-2" style={{ color }}>
              {icon}
              <span className="text-xs uppercase tracking-wider font-black">{label}</span>
            </div>
            <div className="font-black text-white text-sm truncate">{value || '—'}</div>
          </div>
        ))}
      </div>

      {/* Scoring guide with tooltips (#78) */}
      <div className="rounded-2xl p-6" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">How Points Work</h3>
          <button onClick={() => setShowScoringDetail(v => !v)}
            className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-gray-400 transition-colors">
            <Info className="w-3.5 h-3.5" />
            {showScoringDetail ? 'Hide details' : 'Show details'}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { pts: '+1',  action: 'Kill',         note: 'Per kill in a game',     color: '#22C55E' },
            { pts: '+1',  action: 'Assist',        note: 'Per assist in a game',   color: '#3B82F6' },
            { pts: '-1',  action: 'Death',         note: 'Per death in a game',    color: '#EF4444' },
            { pts: '+3',  action: 'MVP Award',     note: 'Per game MVP',           color: '#F59E0B' },
            { pts: '+10', action: 'Penta Kill',    note: 'Bonus for penta kills',  color: '#A855F7' },
            { pts: '+5',  action: 'Series Win',    note: 'All players on winning side', color: '#10B981' },
            { pts: '×2',  action: 'Captain',       note: 'Captain gets double pts', color: '#FBBF24' },
            { pts: '+0',  action: 'Series Loss',   note: 'No deduction for losing', color: '#6B7280' },
          ].map(({ pts, action, note, color }) => (
            <div key={action} className="rounded-xl p-4"
              style={{ background: '#07090f', border: `1px solid ${color}22` }}>
              <div className="text-2xl font-black mb-1" style={{ color }}>{pts}</div>
              <div className="text-white font-bold text-sm">{action}</div>
              <div className="text-gray-600 text-xs mt-1">{note}</div>
            </div>
          ))}
        </div>

        {/* Detailed scoring breakdown (#78) */}
        {showScoringDetail && (
          <div className="mt-5 rounded-xl p-4 space-y-3 text-xs" style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 className="font-black text-gray-400 uppercase tracking-wider text-xs">Scoring Formula</h4>
            <div className="space-y-2 text-gray-400">
              <p><span className="text-white font-bold">Game Points</span> = Kills + Assists - Deaths + (MVP ? +3 : 0) + (Penta ? +10 : 0)</p>
              <p><span className="text-white font-bold">Series Win Bonus</span> = +5 pts for every player on the winning team</p>
              <p><span className="text-white font-bold">Captain Multiplier</span> = Captain's total fantasy pts are multiplied by 2×</p>
              <p><span className="text-white font-bold">Fantasy Total</span> = Sum of all game points across all matches played</p>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5">
              <h4 className="font-black text-gray-400 uppercase tracking-wider text-xs mb-2">Team Mode Scoring</h4>
              <div className="space-y-1 text-gray-400">
                <p>Series Win: <span className="text-green-400 font-bold">+10</span> | Game Win: <span className="text-green-400 font-bold">+2</span> per game | Clean Sweep: <span className="text-amber-400 font-bold">+5</span> bonus</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
