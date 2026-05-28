import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Swords, Target, Shield, Skull, Star, Zap, Award, Crown, Crosshair, Heart, Users, ChevronDown, Flame, Gamepad2 } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { PlayerProfile, PlayerCareerStats, PlayerAward, PlayerMatchupsResponse, HeatmapCell, PlayerHeroPoolEntry } from '../../api/fantasy';

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="rounded-xl p-3" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1 rounded-lg" style={{ background: `${color}15`, color }}>{icon}</div>
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-black text-white">{value}</div>
      {sub && <div className="text-[10px] text-gray-600">{sub}</div>}
    </div>
  );
}

function Sparkline({ data }: { data: Record<string, number> }) {
  const weeks = Object.keys(data).map(Number).sort((a, b) => a - b);
  if (weeks.length < 2) return null;
  const vals = weeks.map(w => data[w]);
  const max = Math.max(...vals, 1);
  const min = Math.min(...vals, 0);
  const range = max - min || 1;
  const w = 200;
  const h = 40;
  const points = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');

  return (
    <div className="rounded-xl p-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-wider mb-3">Weekly Performance</h4>
      <svg viewBox={`-5 -5 ${w + 10} ${h + 10}`} className="w-full h-12">
        <polyline fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
        {vals.map((v, i) => (
          <circle key={i} cx={(i / (vals.length - 1)) * w} cy={h - ((v - min) / range) * h} r="3" fill="#F59E0B" />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-gray-700 mt-1">
        <span>W{weeks[0]}</span>
        <span>W{weeks[weeks.length - 1]}</span>
      </div>
    </div>
  );
}

const AWARD_ICONS: Record<string, React.ReactNode> = {
  mvp_master: <Crown className="w-4 h-4" />,
  mvp_hunter: <Trophy className="w-4 h-4" />,
  penta_king: <Zap className="w-4 h-4" />,
  centurion: <Crosshair className="w-4 h-4" />,
  slayer: <Swords className="w-4 h-4" />,
  veteran: <Shield className="w-4 h-4" />,
  killer_instinct: <Target className="w-4 h-4" />,
  immortal: <Heart className="w-4 h-4" />,
  kda_god: <Star className="w-4 h-4" />,
  playmaker: <Users className="w-4 h-4" />,
  team_player: <Users className="w-4 h-4" />,
};

const TIER_STYLES = {
  gold: {
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.35)',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.2)',
  },
  silver: {
    bg: 'rgba(148,163,184,0.12)',
    border: 'rgba(148,163,184,0.3)',
    color: '#94A3B8',
    glow: 'rgba(148,163,184,0.15)',
  },
};

function AwardBadge({ award }: { award: PlayerAward }) {
  const style = TIER_STYLES[award.tier] || TIER_STYLES.silver;
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all hover:scale-[1.02]"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        boxShadow: `0 0 12px ${style.glow}`,
      }}
    >
      <div className="flex-shrink-0" style={{ color: style.color }}>
        {AWARD_ICONS[award.type] || <Award className="w-4 h-4" />}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-black truncate" style={{ color: style.color }}>
          {award.label}
        </div>
        <div className="text-[10px] text-gray-600 truncate">{award.desc}</div>
      </div>
    </div>
  );
}

export function PlayerProfilePage() {
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const playerId = useMemo(() => {
    const raw = urlParams.get('playerId');
    return raw ? parseInt(raw) : null;
  }, [urlParams]);
  const navigate = (opts: { to: string }) => { window.location.href = opts.to; };
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [careerStats, setCareerStats] = useState<PlayerCareerStats | null>(null);
  const [awards, setAwards] = useState<PlayerAward[]>([]);
  const [matchups, setMatchups] = useState<PlayerMatchupsResponse | null>(null);
  const [matchupsOpen, setMatchupsOpen] = useState(false);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [heatmapOpen, setHeatmapOpen] = useState(false);
  const [heroPool, setHeroPool] = useState<PlayerHeroPoolEntry[]>([]);
  const [heroPoolOpen, setHeroPoolOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!playerId) { setLoading(false); setError('No player ID'); return; }
    Promise.all([
      fantasyApi.getPlayerProfile(playerId),
      fantasyApi.getPlayerCareerStats(playerId),
      fantasyApi.getPlayerAwards(playerId),
      fantasyApi.getPlayerMatchups(playerId),
      fantasyApi.getPlayerHeatmap(playerId),
      fantasyApi.getPlayerHeroPool(playerId),
    ])
      .then(([p, c, a, m, h, hp]) => {
        setProfile(p);
        setCareerStats(c);
        setAwards(Array.isArray(a) ? a : []);
        setMatchups(m);
        setHeatmap(Array.isArray(h) ? h : []);
        setHeroPool(Array.isArray(hp) ? hp : []);
      })
      .catch(() => setError('Player not found'))
      .finally(() => setLoading(false));
  }, [playerId]);

  if (loading) return (
    <div className="min-h-screen bg-[#07090f] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-screen bg-[#07090f] flex flex-col items-center justify-center gap-4 px-4">
      <Skull className="w-12 h-12 text-gray-700" />
      <p className="text-white font-black">{error || 'Player not found'}</p>
      <button onClick={() => navigate({ to: '/fantasy' })}
        className="text-amber-400 text-sm font-bold hover:text-amber-300">
        Back to Fantasy
      </button>
    </div>
  );

  const initials = profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen text-white pb-24" style={{ background: '#07090f' }}>
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${profile.team_color}30, transparent 70%)`,
        }} />
        <div className="container mx-auto px-4 pt-6 pb-8 relative">
          <button onClick={() => navigate({ to: '/fantasy' })}
            className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm font-bold mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl flex-shrink-0 overflow-hidden" style={{
              background: `${profile.team_color}25`, border: `2px solid ${profile.team_color}60`,
            }}>
              {profile.photo_url ? (
                <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-black" style={{ color: profile.team_color }}>
                  {initials}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-black truncate">{profile.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{
                  background: `${profile.team_color}20`, color: profile.team_color, border: `1px solid ${profile.team_color}40`,
                }}>
                  {profile.team_short}
                </span>
                <span className="text-xs font-bold text-gray-500 px-2 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {profile.role}
                </span>
                <span className="text-xs font-bold text-gray-600">{profile.price} CR</span>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-black text-amber-400">{profile.fantasy_pts}</span>
                <span className="text-xs text-gray-600 font-bold">fantasy pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl space-y-4">
        {/* Key stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={<Swords className="w-3.5 h-3.5" />} label="KDA" value={profile.kda} color="#F59E0B"
            sub={`${profile.avgKills}/${profile.avgDeaths}/${profile.avgAssists} avg`} />
          <StatCard icon={<Trophy className="w-3.5 h-3.5" />} label="MVPs" value={profile.totalMvps} color="#A855F7" />
          <StatCard icon={<Target className="w-3.5 h-3.5" />} label="Games" value={profile.gamesPlayed} color="#3B82F6"
            sub={`${profile.matchesPlayed} series`} />
          <StatCard icon={<Zap className="w-3.5 h-3.5" />} label="Penta Kills" value={profile.totalPentas} color="#EF4444" />
        </div>

        {/* Totals */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<Swords className="w-3.5 h-3.5" />} label="Total Kills" value={profile.totalKills} color="#22C55E" />
          <StatCard icon={<Skull className="w-3.5 h-3.5" />} label="Total Deaths" value={profile.totalDeaths} color="#EF4444" />
          <StatCard icon={<Shield className="w-3.5 h-3.5" />} label="Total Assists" value={profile.totalAssists} color="#3B82F6" />
        </div>

        {/* Weekly sparkline */}
        {Object.keys(profile.weeklyPts).length >= 2 && <Sparkline data={profile.weeklyPts} />}

        {/* Awards & Milestones (#52) */}
        {awards.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="w-3 h-3 text-amber-400" /> Awards & Milestones
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {awards.map((a) => (
                <AwardBadge key={a.type} award={a} />
              ))}
            </div>
          </div>
        )}

        {/* Career Stats Across Seasons (#48) */}
        {careerStats && careerStats.total_games > 0 && (
          <div className="rounded-xl p-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Trophy className="w-3 h-3 text-purple-400" /> Career Overview
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div className="text-center">
                <div className="text-lg font-black text-white">{careerStats.total_matches}</div>
                <div className="text-[10px] text-gray-600 font-bold">Matches</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-white">{careerStats.total_games}</div>
                <div className="text-[10px] text-gray-600 font-bold">Games</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-amber-400">{careerStats.total_mvps}</div>
                <div className="text-[10px] text-gray-600 font-bold">MVPs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-red-400">{careerStats.total_pentas}</div>
                <div className="text-[10px] text-gray-600 font-bold">Pentas</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center rounded-lg py-2" style={{ background: 'rgba(34,197,94,0.08)' }}>
                <div className="text-sm font-black text-green-400">{careerStats.total_kills}</div>
                <div className="text-[10px] text-gray-600 font-bold">Kills ({careerStats.avg_kills}/g)</div>
              </div>
              <div className="text-center rounded-lg py-2" style={{ background: 'rgba(239,68,68,0.08)' }}>
                <div className="text-sm font-black text-red-400">{careerStats.total_deaths}</div>
                <div className="text-[10px] text-gray-600 font-bold">Deaths ({careerStats.avg_deaths}/g)</div>
              </div>
              <div className="text-center rounded-lg py-2" style={{ background: 'rgba(59,130,246,0.08)' }}>
                <div className="text-sm font-black text-blue-400">{careerStats.total_assists}</div>
                <div className="text-[10px] text-gray-600 font-bold">Assists ({careerStats.avg_assists}/g)</div>
              </div>
            </div>
            {careerStats.seasons_played.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-gray-600 font-bold">Seasons:</span>
                {careerStats.seasons_played.map((s) => (
                  <span key={s.season_id} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(168,85,247,0.12)', color: '#C084FC', border: '1px solid rgba(168,85,247,0.25)' }}>
                    {s.season_name}
                  </span>
                ))}
              </div>
            )}
            {careerStats.best_game && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="text-[10px] font-black text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-amber-400" /> Career Best Game
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-bold text-gray-400">
                    W{careerStats.best_game.week} —{' '}
                    <span style={{ color: careerStats.best_game.team1_color }}>{careerStats.best_game.team1_short}</span>
                    {' vs '}
                    <span style={{ color: careerStats.best_game.team2_color }}>{careerStats.best_game.team2_short}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <span className="text-green-400 font-black">{careerStats.best_game.kills}</span>
                    <span className="text-gray-600">/</span>
                    <span className="text-red-400 font-black">{careerStats.best_game.deaths}</span>
                    <span className="text-gray-600">/</span>
                    <span className="text-blue-400 font-black">{careerStats.best_game.assists}</span>
                    {careerStats.best_game.is_mvp && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">MVP</span>
                    )}
                    {careerStats.best_game.has_penta_kill && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">PENTA</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hero Pool (#50) */}
        {heroPool.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setHeroPoolOpen(prev => !prev)}
              className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.02]"
            >
              <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                <Gamepad2 className="w-3 h-3 text-emerald-400" /> Hero Pool
                <span className="text-gray-700 font-bold normal-case">
                  ({heroPool.length} hero{heroPool.length !== 1 ? 'es' : ''})
                </span>
              </h4>
              <motion.div
                animate={{ rotate: heroPoolOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {heroPoolOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/5">
                    {heroPool.map(hero => {
                      const wrColor = hero.win_rate >= 60 ? '#22C55E' : hero.win_rate >= 40 ? '#EAB308' : '#EF4444';
                      const kdaVal = hero.avg_deaths > 0
                        ? ((hero.avg_kills + hero.avg_assists) / hero.avg_deaths).toFixed(2)
                        : (hero.avg_kills + hero.avg_assists).toFixed(2);
                      return (
                        <div key={hero.hero_name} className="px-4 py-3 border-b border-white/5 last:border-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-black text-white">{hero.hero_name}</span>
                            <div className="flex items-center gap-2 text-[10px] font-bold">
                              <span className="text-gray-500">{hero.games_played} game{hero.games_played !== 1 ? 's' : ''}</span>
                              <span className="px-1.5 py-0.5 rounded-full" style={{
                                background: `${wrColor}18`, color: wrColor, border: `1px solid ${wrColor}40`,
                              }}>
                                {hero.win_rate.toFixed(0)}% WR
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-gray-500">
                              <span className="text-green-400 font-black">{hero.wins}</span>W
                              <span className="text-gray-700 mx-1">/</span>
                              <span className="text-red-400 font-black">{hero.games_played - hero.wins}</span>L
                            </span>
                            <span className="text-gray-700">|</span>
                            <span className="text-gray-500">
                              Avg <span className="text-green-400 font-bold">{hero.avg_kills}</span>
                              <span className="text-gray-700">/</span>
                              <span className="text-red-400 font-bold">{hero.avg_deaths}</span>
                              <span className="text-gray-700">/</span>
                              <span className="text-blue-400 font-bold">{hero.avg_assists}</span>
                            </span>
                            <span className="text-gray-700">|</span>
                            <span className="text-amber-400 font-bold">{kdaVal} KDA</span>
                          </div>
                          {/* Win rate bar */}
                          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${hero.win_rate}%`,
                                background: wrColor,
                                opacity: 0.6,
                                boxShadow: `0 0 6px ${wrColor}40`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Best game */}
        {profile.bestGame && (
          <div className="rounded-xl p-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Star className="w-3 h-3 text-amber-400" /> Best Game
            </h4>
            <div className="flex items-center gap-4">
              <div className="text-sm font-bold text-gray-400">
                W{profile.bestGame.week} — {profile.bestGame.team1_short} vs {profile.bestGame.team2_short}
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-green-400 font-black">{profile.bestGame.kills}</span>
                <span className="text-gray-600">/</span>
                <span className="text-red-400 font-black">{profile.bestGame.deaths}</span>
                <span className="text-gray-600">/</span>
                <span className="text-blue-400 font-black">{profile.bestGame.assists}</span>
                {profile.bestGame.is_mvp && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">MVP</span>
                )}
                {profile.bestGame.has_penta_kill && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">PENTA</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recent games */}
        {profile.recentGames.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="px-4 py-3 border-b border-white/5">
              <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-wider">Recent Games</h4>
            </div>
            {profile.recentGames.map((g, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0 text-xs">
                <span className="text-gray-600 font-bold w-8 flex-shrink-0">W{g.week}</span>
                <span className="font-bold text-gray-400 w-20 flex-shrink-0">
                  <span style={{ color: g.team1_color }}>{g.team1_short}</span>
                  <span className="text-gray-700 mx-1">v</span>
                  <span style={{ color: g.team2_color }}>{g.team2_short}</span>
                </span>
                <span className="text-gray-700 w-6 flex-shrink-0">G{g.game_number}</span>
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="text-green-400 font-black">{g.kills}</span>
                  <span className="text-gray-700">/</span>
                  <span className="text-red-400 font-black">{g.deaths}</span>
                  <span className="text-gray-700">/</span>
                  <span className="text-blue-400 font-black">{g.assists}</span>
                  {g.is_mvp && <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">MVP</span>}
                  {g.has_penta_kill && <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">5K</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Performance Heatmap (#49) */}
        {heatmap.length > 0 && (() => {
          const weeks = [...new Set(heatmap.map((c) => c.week))].sort((a, b) => a - b);
          const games = [...new Set(heatmap.map((c) => c.game_number))].sort((a, b) => a - b);
          const lookup = new Map<string, number>();
          for (const c of heatmap) {
            lookup.set(`${c.week}-${c.game_number}`, Number(c.game_pts));
          }

          function cellColor(pts: number): string {
            if (pts < 0) return 'rgba(239,68,68,0.55)';
            if (pts <= 3) return 'rgba(234,179,8,0.45)';
            if (pts <= 8) return 'rgba(34,197,94,0.45)';
            return 'rgba(34,197,94,0.8)';
          }

          function cellBorder(pts: number): string {
            if (pts < 0) return 'rgba(239,68,68,0.3)';
            if (pts <= 3) return 'rgba(234,179,8,0.25)';
            if (pts <= 8) return 'rgba(34,197,94,0.25)';
            return 'rgba(34,197,94,0.5)';
          }

          return (
            <div className="rounded-xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => setHeatmapOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.02]"
              >
                <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-orange-400" /> Performance Heatmap
                  <span className="text-gray-700 font-bold normal-case">
                    ({weeks.length} week{weeks.length !== 1 ? 's' : ''})
                  </span>
                </h4>
                <motion.div
                  animate={{ rotate: heatmapOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {heatmapOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/5 px-4 py-4">
                      {/* Legend */}
                      <div className="flex items-center gap-3 mb-4 text-[10px] text-gray-600 font-bold">
                        <span>Points:</span>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(239,68,68,0.55)' }} />
                          <span>&lt;0</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(234,179,8,0.45)' }} />
                          <span>0-3</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(34,197,94,0.45)' }} />
                          <span>4-8</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(34,197,94,0.8)' }} />
                          <span>9+</span>
                        </div>
                      </div>

                      {/* Grid */}
                      <div className="overflow-x-auto">
                        <table className="border-separate" style={{ borderSpacing: '3px' }}>
                          <thead>
                            <tr>
                              <th className="text-[10px] text-gray-700 font-bold pr-2 text-right w-8" />
                              {weeks.map((w) => (
                                <th
                                  key={w}
                                  className="text-[10px] text-gray-600 font-bold text-center px-1"
                                  style={{ minWidth: 36 }}
                                >
                                  W{w}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {games.map((g) => (
                              <tr key={g}>
                                <td className="text-[10px] text-gray-600 font-bold pr-2 text-right">
                                  G{g}
                                </td>
                                {weeks.map((w) => {
                                  const key = `${w}-${g}`;
                                  const pts = lookup.get(key);
                                  if (pts === undefined) {
                                    return (
                                      <td key={key}>
                                        <div
                                          className="w-9 h-9 rounded-lg"
                                          style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.04)',
                                          }}
                                        />
                                      </td>
                                    );
                                  }
                                  return (
                                    <td key={key}>
                                      <div
                                        className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black cursor-default group relative"
                                        style={{
                                          background: cellColor(pts),
                                          border: `1px solid ${cellBorder(pts)}`,
                                          color: pts < 0 ? '#FCA5A5' : pts <= 3 ? '#FDE68A' : '#86EFAC',
                                        }}
                                        title={`W${w} G${g}: ${pts} pts`}
                                      >
                                        {pts}
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-[10px] font-bold text-white bg-gray-900 border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                                          W{w} G{g}: {pts} pts
                                        </div>
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })()}

        {/* Matchup Records */}
        {matchups && matchups.matchups.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setMatchupsOpen(prev => !prev)}
              className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.02]"
            >
              <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                <Crosshair className="w-3 h-3 text-cyan-400" /> Matchup Records
                <span className="text-gray-700 font-bold normal-case">({matchups.matchups.length} opponents)</span>
              </h4>
              <motion.div
                animate={{ rotate: matchupsOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {matchupsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/5">
                    {matchups.matchups.map((m) => {
                      const kdaColor = m.avg_kda >= 3 ? '#22C55E' : m.avg_kda >= 2 ? '#EAB308' : '#EF4444';
                      const kdaBg = m.avg_kda >= 3 ? 'rgba(34,197,94,0.12)' : m.avg_kda >= 2 ? 'rgba(234,179,8,0.12)' : 'rgba(239,68,68,0.12)';
                      const kdaPercent = Math.min((m.avg_kda / 8) * 100, 100);

                      return (
                        <motion.div
                          key={m.opponent_team_id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 py-3 border-b border-white/5 last:border-0"
                        >
                          {/* Opponent header row */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="text-xs font-black px-2 py-0.5 rounded-full"
                                style={{
                                  background: `${m.opponent_color}20`,
                                  color: m.opponent_color,
                                  border: `1px solid ${m.opponent_color}40`,
                                }}
                              >
                                {m.opponent_short}
                              </span>
                              <span className="text-xs text-gray-500 font-bold truncate max-w-[140px]">
                                {m.opponent_name}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-600 font-bold">{m.games} games</span>
                          </div>

                          {/* Stats row */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-green-400 font-black">{m.avg_kills.toFixed(1)}</span>
                              <span className="text-gray-700">/</span>
                              <span className="text-red-400 font-black">{m.avg_deaths.toFixed(1)}</span>
                              <span className="text-gray-700">/</span>
                              <span className="text-blue-400 font-black">{m.avg_assists.toFixed(1)}</span>
                            </div>
                            {m.mvps > 0 && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1">
                                <Trophy className="w-2.5 h-2.5" /> {m.mvps} MVP{m.mvps > 1 ? 's' : ''}
                              </span>
                            )}
                            <span
                              className="text-xs font-black ml-auto"
                              style={{ color: kdaColor }}
                            >
                              {m.avg_kda.toFixed(2)} KDA
                            </span>
                          </div>

                          {/* KDA bar */}
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${kdaPercent}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                              className="h-full rounded-full"
                              style={{ background: kdaBg, boxShadow: `0 0 8px ${kdaColor}40` }}
                            >
                              <div className="h-full rounded-full" style={{ background: kdaColor, opacity: 0.7 }} />
                            </motion.div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
