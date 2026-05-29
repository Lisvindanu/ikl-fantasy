import { API, apiFetch } from './fantasy';

// ── #48: Career Stats Across Seasons ─────────────────────────────────────────

export interface CareerBestGame {
  kills: number;
  deaths: number;
  assists: number;
  is_mvp: boolean;
  has_penta_kill: boolean;
  game_number: number;
  week: number;
  stage: string;
  team1_short: string;
  team1_color: string;
  team2_short: string;
  team2_color: string;
}

export interface CareerSeasonPlayed {
  season_id: number;
  season_name: string;
}

export interface PlayerCareerStats {
  total_matches: number;
  total_games: number;
  total_kills: number;
  total_deaths: number;
  total_assists: number;
  total_mvps: number;
  total_pentas: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  best_game: CareerBestGame | null;
  seasons_played: CareerSeasonPlayed[];
}

export async function getPlayerCareerStats(playerId: number): Promise<PlayerCareerStats | null> {
  const r = await apiFetch(`${API}/api/fantasy/players/${playerId}/career`);
  if (!r.ok) return null;
  const data = await r.json();
  return data;
}

// ── #52: Awards & Milestones ─────────────────────────────────────────────────

export interface PlayerAward {
  type: string;
  label: string;
  desc: string;
  tier: 'gold' | 'silver';
}

export async function getPlayerAwards(playerId: number): Promise<PlayerAward[]> {
  const r = await apiFetch(`${API}/api/fantasy/players/${playerId}/awards`);
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

// ── #49: Performance Heatmap ────────────────────────────────────────────────

export interface HeatmapCell {
  week: number;
  game_number: number;
  game_pts: number;
}

export async function getPlayerHeatmap(playerId: number): Promise<HeatmapCell[]> {
  const r = await apiFetch(`${API}/api/fantasy/players/${playerId}/heatmap`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return Array.isArray(data) ? data : [];
}

// ── #XX: Matchup Records ────────────────────────────────────────────────────

export interface PlayerMatchup {
  opponent_team_id: number;
  opponent_name: string;
  opponent_short: string;
  opponent_color: string;
  games: number;
  total_kills: number;
  total_deaths: number;
  total_assists: number;
  mvps: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  avg_kda: number;
}

export interface PlayerMatchupsResponse {
  player_id: number;
  player_name: string;
  player_role: string;
  team_id: number;
  matchups: PlayerMatchup[];
}

export async function getPlayerMatchups(playerId: number): Promise<PlayerMatchupsResponse | null> {
  const r = await apiFetch(`${API}/api/fantasy/players/${playerId}/matchups`);
  if (!r.ok) return null;
  const data = await r.json();
  return data;
}

// ── #33: Game Hero Picks/Bans ───────────────────────────────────────────────

export interface GameHero {
  id: number;
  match_id: number;
  game_number: number;
  player_id: number | null;
  team_id: number | null;
  hero_name: string;
  hero_id: number | null;
  is_ban: boolean;
  is_pick: boolean;
  player_name: string | null;
  player_role: string | null;
  team_name: string | null;
  team_short: string | null;
  team_color: string | null;
}

export async function getMatchHeroes(matchId: number): Promise<Record<number, GameHero[]>> {
  const r = await apiFetch(`${API}/api/fantasy/matches/${matchId}/heroes`);
  if (!r.ok) return {};
  const data = await r.json();
  return data;
}

// ── #34: Season Hero Meta Stats ─────────────────────────────────────────────

export interface HeroMeta {
  hero_name: string;
  pick_count: number;
  ban_count: number;
  win_count: number;
  total_games: number;
  pick_rate: number;
  ban_rate: number;
  win_rate: number;
}

export async function getSeasonHeroMeta(seasonId: number): Promise<HeroMeta[]> {
  const r = await apiFetch(`${API}/api/fantasy/seasons/${seasonId}/hero-meta`);
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

// ── #50: Player Hero Pool ───────────────────────────────────────────────────

export interface PlayerHeroPoolEntry {
  hero_name: string;
  games_played: number;
  wins: number;
  win_rate: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
}

export async function getPlayerHeroPool(playerId: number): Promise<PlayerHeroPoolEntry[]> {
  const r = await apiFetch(`${API}/api/fantasy/players/${playerId}/hero-pool`);
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}
