import { API } from './fantasy';

// #7: Player ownership
export interface PlayerOwnershipData {
  total: number;
  ownership: Record<number, number>;
}

export async function getPlayerOwnership(seasonId: number): Promise<PlayerOwnershipData> {
  const r = await fetch(`${API}/api/fantasy/seasons/${seasonId}/ownership`);
  if (!r.ok) return { total: 0, ownership: {} };
  return r.json();
}

// #13/#14/#15: Form + streak
export interface PlayerFormEntry {
  player_id: number;
  form: number;
  streak: 'hot' | 'cold' | null;
}

export async function getPlayerForm(seasonId: number): Promise<PlayerFormEntry[]> {
  const r = await fetch(`${API}/api/fantasy/seasons/${seasonId}/form`);
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

// #58: Player of the Week
export interface PlayerOfTheWeek {
  id: number;
  name: string;
  role: string;
  photo_url?: string;
  team_short: string;
  team_color: string;
  week: number;
  week_pts: number;
  total_kills: number;
  total_deaths: number;
  total_assists: number;
  mvp_count: number;
}

export async function getPlayerOfTheWeek(seasonId: number): Promise<PlayerOfTheWeek | null> {
  const r = await fetch(`${API}/api/fantasy/seasons/${seasonId}/potw`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// #42/#43: Season records
export interface SeasonRecords {
  highest_kill_games: {
    match_id: number;
    game_number: number;
    week: number;
    stage: string;
    team1_short: string;
    team1_color: string;
    team2_short: string;
    team2_color: string;
    total_kills: number;
  }[];
  best_individual_games: {
    player_name: string;
    role: string;
    photo_url?: string;
    team_short: string;
    team_color: string;
    week: number;
    kills: number;
    deaths: number;
    assists: number;
    is_mvp: boolean;
    has_penta_kill: boolean;
    game_pts: number;
  }[];
}

export async function getSeasonRecords(seasonId: number): Promise<SeasonRecords> {
  const r = await fetch(`${API}/api/fantasy/seasons/${seasonId}/records`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Match preview (H2H + form)
export interface MatchPreview {
  h2h: { team1Wins: number; team2Wins: number; total: number };
  team1Form: ('W' | 'L' | 'D')[];
  team2Form: ('W' | 'L' | 'D')[];
}

export async function getMatchPreview(matchId: number): Promise<MatchPreview | null> {
  const r = await fetch(`${API}/api/fantasy/matches/${matchId}/preview`);
  if (!r.ok) return null;
  return r.json();
}
