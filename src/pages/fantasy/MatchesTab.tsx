import { useState, useEffect, useCallback, useRef } from 'react';
import { Swords, Trophy, Radio, Target, Zap, BarChart3 } from 'lucide-react';
import type { IKLMatch, IKLPlayer, IKLTeam } from '../../api/fantasy';
import { getMatches, API } from '../../api/fantasy';
import { STAGE_LABEL } from './MatchCard';
import { PredictionCard } from './PredictionCard';

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

function MatchRow({ match }: { match: IKLMatch }) {
  const t1Win = match.winner_team_id === match.team1_id;
  const t2Win = match.winner_team_id === match.team2_id;
  const hasWinner = !!match.winner_team_id;
  const isLive = match.status === 'live';

  return (
    <div className="flex items-stretch text-xs"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
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

function WeekCard({ week, matches }: { week: number; matches: IKLMatch[] }) {
  const byDate: Record<string, IKLMatch[]> = {};
  for (const m of matches) {
    const date = m.match_date
      ? new Date(m.match_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'TBD';
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(m);
  }

  const primaryStage = matches[0]?.stage;
  const isPlayoff = primaryStage && primaryStage !== 'regular';
  const title = isPlayoff
    ? (STAGE_LABEL[primaryStage] || `Week ${week}`)
    : `Week ${week}`;

  return (
    <div className="rounded-xl overflow-hidden"
      style={{
        background: '#0d1017',
        border: `1px solid ${isPlayoff ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)'}`,
      }}>
      <div className="px-3 py-2 text-center flex items-center justify-center gap-1.5"
        style={{
          background: isPlayoff ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
        {isPlayoff && <Trophy className="w-3 h-3 text-amber-400" />}
        <span className={`text-xs font-black ${isPlayoff ? 'text-amber-400' : 'text-gray-400'}`}>{title}</span>
      </div>

      {Object.entries(byDate).map(([date, dateMatches]) => (
        <div key={date}>
          <div className="px-3 py-1 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="text-[10px] text-gray-600 font-bold">{date}</span>
          </div>
          {dateMatches.map(m => <MatchRow key={m.id} match={m} />)}
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

// ── Main ─────────────────────────────────────────────────────────────────────

export function MatchesTab({
  matches: initialMatches, loading, seasonId,
  players = [], isAuthenticated = false, teams = [],
}: Props) {
  const [matches, setMatches] = useState(initialMatches);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
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
            <WeekCard key={week} week={Number(week)} matches={weekMatches} />
          ))}
        </div>
      </div>
    </div>
  );
}
