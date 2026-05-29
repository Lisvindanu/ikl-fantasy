// ── Shared constants ──────────────────────────────────────────────────────────

export const API = import.meta.env.DEV ? '' : 'https://hokapi.project-n.site';

/**
 * @deprecated — kept for backwards compat during migration.
 * New code should use apiFetch() which sends httpOnly cookies automatically.
 */
export function authHeader(): Record<string, string> {
  return {};
}

/**
 * Fetch wrapper that always sends httpOnly auth cookies.
 * Use this instead of raw `fetch()` for authenticated API calls.
 */
export function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    credentials: 'include',
  });
}

// ── Shared types ──────────────────────────────────────────────────────────────

export interface IKLSeason {
  id: number;
  name: string;
  full_name: string;
  dates: string;
  prize_pool: string;
  champion: string;
  runner_up: string;
  picks_lock_at?: string | null;
  max_participants?: number | null;
  third_place: string;
  regular_season_mvp: string;
  finals_mvp: string;
  edition: string;
  status: 'active' | 'completed' | 'upcoming';
}

export interface IKLTeam {
  id: number;
  season_id: number;
  name: string;
  short_name: string;
  color: string;
  standing: number;
  wins: number;
  losses: number;
  map_wins: number;
  map_losses: number;
  prize: string;
  qualified_kwc: boolean;
  logo_url: string | null;
}

export interface IKLPlayer {
  id: number;
  team_id: number;
  season_id: number;
  name: string;
  role: 'EXP' | 'JGL' | 'MID' | 'GOLD' | 'ROAM';
  nationality: string;
  price: number;
  mvps: number;
  fantasy_pts: number;
  team_name: string;
  team_short: string;
  team_color: string;
  photo_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  instagram_url?: string;
  twitch_url?: string;
}

export interface FantasyPick {
  role: string;
  player_id: number;
  name: string;
  fantasy_pts: number;
  price: number;
  mvps: number;
  team_name: string;
  team_short: string;
  team_color: string;
  photo_url?: string;
  is_captain?: boolean;
  is_vice_captain?: boolean;
  is_bench?: boolean;
  bench_order?: number;
}

export interface AuditLogEntry {
  id: number;
  admin_id: number | null;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: number;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface FantasyTeam {
  id?: number;
  name: string;
  total_pts: number;
  picks: FantasyPick[];
  kit_color?: string;
  kit_emoji?: string;
}

export interface LeaderboardEntry {
  id: number;
  team_name: string;
  total_pts: number;
  updated_at: string;
  user_name: string;
  user_id: number;
  kit_color?: string;
  kit_emoji?: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
}

export interface IKLMatch {
  id: number;
  season_id: number;
  week: number;
  stage: string;
  match_date: string | null;
  team1_id: number;
  team2_id: number;
  best_of: number;
  team1_score: number;
  team2_score: number;
  winner_team_id: number | null;
  status: 'upcoming' | 'live' | 'completed' | 'postponed';
  team1_name: string;
  team1_short: string;
  team1_color: string;
  team1_logo: string | null;
  team2_name: string;
  team2_short: string;
  team2_color: string;
  team2_logo: string | null;
  winner_name: string | null;
  winner_short: string | null;
  vod_url: string | null;
  created_at: string;
  first_blood_team_id: number | null;
  first_tower_team_id: number | null;
  first_tyrant_team_id: number | null;
  first_overlord_team_id: number | null;
  tempest_dragon_team_id: number | null;
  over_under_line: number | null;
}

export interface MatchPlayerStat {
  id: number;
  match_id: number;
  player_id: number;
  game_number: number;
  kills: number;
  deaths: number;
  assists: number;
  is_mvp: boolean;
  has_penta_kill: boolean;
  is_standin?: boolean;
  player_name: string;
  role: string;
  photo_url?: string;
  team_short: string;
  team_color: string;
}

// ── Season meta ───────────────────────────────────────────────────────────────

export interface SeasonMeta {
  picks_lock_at: string | null;
  max_participants: number | null;
  participant_count: number;
}

// ── Fantasy Team Mode ─────────────────────────────────────────────────────────

export interface FantasyTeamSelection {
  id: number;
  user_id: number;
  season_id: number;
  team_id: number;
  team_name: string;
  team_short: string;
  team_color: string;
  total_pts: number;
  updated_at: string;
}

export interface TeamLeaderboardEntry {
  id: number;
  user_id: number;
  user_name: string;
  team_id: number;
  team_name: string;
  team_short: string;
  team_color: string;
  total_pts: number;
  updated_at: string;
}

// ── Team Standings ───────────────────────────────────────────────────────────

export interface TeamStanding {
  team_id: number;
  team_name: string;
  short_name: string;
  color: string;
  logo_url: string | null;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  games_won: number;
  games_lost: number;
  game_diff: number;
  kills_for: number;
  kills_against: number;
  kills_diff: number;
  h2h: Record<string, { wins: number; losses: number }>;
  matches_played: number;
  rank: number;
}

export async function getSeasonStandings(seasonId: number): Promise<TeamStanding[]> {
  const r = await apiFetch(`${API}/api/fantasy/seasons/${seasonId}/standings`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Core API functions ────────────────────────────────────────────────────────

export async function getSeasons(): Promise<IKLSeason[]> {
  const r = await apiFetch(`${API}/api/fantasy/seasons`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getSeasonDetail(id: number): Promise<IKLSeason & { teams: IKLTeam[] }> {
  const r = await apiFetch(`${API}/api/fantasy/seasons/${id}`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getPlayers(seasonId: number, opts?: { role?: string; teamId?: number }): Promise<IKLPlayer[]> {
  const params = new URLSearchParams();
  if (opts?.role) params.set('role', opts.role);
  if (opts?.teamId) params.set('teamId', String(opts.teamId));
  const r = await apiFetch(`${API}/api/fantasy/seasons/${seasonId}/players?${params}`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getLeaderboard(seasonId: number, opts?: { limit?: number; offset?: number }): Promise<LeaderboardResponse> {
  const params = new URLSearchParams();
  if (opts?.limit) params.set('limit', String(opts.limit));
  if (opts?.offset) params.set('offset', String(opts.offset));
  const r = await apiFetch(`${API}/api/fantasy/seasons/${seasonId}/leaderboard?${params}`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getMyTeam(seasonId: number): Promise<FantasyTeam> {
  const r = await apiFetch(`${API}/api/fantasy/my-team/${seasonId}`, {});
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getMatches(seasonId: number): Promise<IKLMatch[]> {
  const r = await apiFetch(`${API}/api/fantasy/seasons/${seasonId}/matches`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getMatchStats(matchId: number): Promise<MatchPlayerStat[]> {
  const r = await apiFetch(`${API}/api/fantasy/matches/${matchId}/stats`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function saveMyTeam(
  seasonId: number, name: string,
  picks: { playerId: number; role: string }[],
  opts?: { captainId?: number; viceCaptainId?: number; benchPicks?: { playerId: number; role: string }[] }
): Promise<{ id: number; totalPts: number }> {
  const r = await apiFetch(`${API}/api/fantasy/team`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seasonId, name, picks,
      captainId: opts?.captainId,
      viceCaptainId: opts?.viceCaptainId,
      benchPicks: opts?.benchPicks,
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to save team');
  return data;
}

// #83: Custom Team Kit
export async function updateTeamKit(seasonId: number, kitColor: string, kitEmoji: string): Promise<void> {
  const r = await apiFetch(`${API}/api/fantasy/my-team/${seasonId}/kit`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kitColor, kitEmoji }),
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error((data as Record<string, string>).error || 'Failed to update kit');
  }
}

export async function getSeasonMeta(seasonId: number): Promise<SeasonMeta> {
  const r = await apiFetch(`${API}/api/fantasy/seasons/${seasonId}/meta`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Team mode API ─────────────────────────────────────────────────────────────

export async function getMyTeamSelection(seasonId: number): Promise<FantasyTeamSelection | null> {
  const r = await apiFetch(`${API}/api/fantasy/my-team-selection/${seasonId}`, {});
  if (!r.ok) return null;
  const data = await r.json();
  return data || null;
}

export async function saveMyTeamSelection(seasonId: number, teamId: number): Promise<FantasyTeamSelection> {
  const r = await apiFetch(`${API}/api/fantasy/team-selection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seasonId, teamId }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to save');
  return data;
}

export async function getTeamLeaderboard(seasonId: number): Promise<TeamLeaderboardEntry[]> {
  const r = await apiFetch(`${API}/api/fantasy/seasons/${seasonId}/team-leaderboard`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Loyalty System (#26-28) ───────────────────────────────────────────────────

export interface LoyaltyBadge {
  tier: 'diamond' | 'gold' | 'silver';
  label: string;
  seasons: number;
}

export interface LoyaltyInfo {
  teamId: number;
  teamName: string;
  teamShort: string;
  teamColor: string;
  loyaltySeasons: number;
  loyaltyMultiplier: number;
  switchedThisSeason: boolean;
  gracePeriodActive?: boolean;
  badge: LoyaltyBadge | null;
}

export async function getLoyaltyInfo(seasonId: number): Promise<LoyaltyInfo | null> {
  const r = await apiFetch(`${API}/api/fantasy/loyalty/${seasonId}`, {});
  if (!r.ok) return null;
  return r.json();
}

// ── Achievements (#122) ──────────────────────────────────────────────────────

export interface Achievement {
  type: string;
  label: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

export async function getAchievements(): Promise<Achievement[]> {
  const r = await apiFetch(`${API}/api/fantasy/achievements`, {});
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

// ── Login Streak (#119) ─────────────────────────────────────────────────────

export interface LoginStreakInfo {
  streak: number;
  longestStreak: number;
  bonusAwarded: number;
  totalBonus: number;
  isNewDay: boolean;
}

export async function recordLoginStreak(): Promise<LoginStreakInfo | null> {
  const r = await apiFetch(`${API}/api/fantasy/login-streak`, {
    method: 'POST',
  });
  if (!r.ok) return null;
  return r.json();
}

export async function getLoginStreak(): Promise<{ streak: number; longestStreak: number; totalBonus: number } | null> {
  const r = await apiFetch(`${API}/api/fantasy/login-streak`, {});
  if (!r.ok) return null;
  return r.json();
}

// ── League Trophies (#64) ────────────────────────────────────────────────────

export interface LeagueTrophy {
  id: number;
  league_id: number;
  season_id: number;
  placement: number;
  created_at: string;
  league_name: string;
  season_name: string;
}

export async function getUserTrophies(userId: number): Promise<LeagueTrophy[]> {
  const r = await apiFetch(`${API}/api/fantasy/trophies/${userId}`);
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

// ── Match Comments (#38) ─────────────────────────────────────────────────────

export interface MatchComment {
  id: number;
  match_id: number;
  user_id: number;
  user_name: string;
  content: string;
  created_at: string;
}

export async function getMatchComments(matchId: number): Promise<MatchComment[]> {
  const r = await apiFetch(`${API}/api/fantasy/matches/${matchId}/comments`);
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

export async function addMatchComment(matchId: number, content: string): Promise<MatchComment> {
  const r = await apiFetch(`${API}/api/fantasy/matches/${matchId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to add comment');
  return data;
}

export async function deleteMatchComment(commentId: number): Promise<void> {
  const r = await apiFetch(`${API}/api/fantasy/comments/${commentId}`, {
    method: 'DELETE',
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete comment');
  }
}

// ── Player News (#55) ───────────────────────────────────────────────────────

export interface PlayerNews {
  id: number;
  season_id: number;
  player_id: number | null;
  team_id: number | null;
  title: string;
  content: string | null;
  news_type: string;
  player_name: string | null;
  photo_url: string | null;
  team_name: string | null;
  team_short: string | null;
  team_color: string | null;
  created_at: string;
}

export async function getSeasonNews(seasonId: number): Promise<PlayerNews[]> {
  const r = await apiFetch(`${API}/api/fantasy/seasons/${seasonId}/news`);
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

// ── Barrel re-exports ─────────────────────────────────────────────────────────

export * from './fantasy-predictions';
export * from './fantasy-chips';
export * from './fantasy-leagues';
export * from './fantasy-admin';
export * from './fantasy-career';
