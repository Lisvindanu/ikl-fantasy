import { API, authHeader } from './fantasy';

// #57: Player match history
export interface PlayerMatchHistoryEntry {
  match_id: number;
  game_number: number;
  kills: number;
  deaths: number;
  assists: number;
  is_mvp: boolean;
  has_penta_kill: boolean;
  match_date: string | null;
  week: number;
  stage: string;
  status: string;
  team1_short: string;
  team1_color: string;
  team2_short: string;
  team2_color: string;
  team1_score: number;
  team2_score: number;
  winner_team_id: number | null;
  game_pts: number;
}

export async function getPlayerMatchHistory(playerId: number): Promise<PlayerMatchHistoryEntry[]> {
  const r = await fetch(`${API}/api/fantasy/players/${playerId}/history`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// #47: Player profile
export interface PlayerProfile {
  id: number;
  name: string;
  role: string;
  price: number;
  fantasy_pts: number;
  mvps: number;
  photo_url?: string;
  team_name: string;
  team_short: string;
  team_color: string;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  totalMvps: number;
  totalPentas: number;
  gamesPlayed: number;
  matchesPlayed: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  kda: number;
  bestGame: {
    kills: number; deaths: number; assists: number;
    is_mvp: boolean; has_penta_kill: boolean;
    week: number; team1_short: string; team2_short: string;
  } | null;
  weeklyPts: Record<string, number>;
  recentGames: {
    game_number: number; kills: number; deaths: number; assists: number;
    is_mvp: boolean; has_penta_kill: boolean; week: number; stage: string;
    team1_short: string; team1_color: string; team2_short: string; team2_color: string;
  }[];
}

export async function getPlayerProfile(playerId: number): Promise<PlayerProfile> {
  const r = await fetch(`${API}/api/fantasy/players/${playerId}/profile`);
  if (!r.ok) throw new Error('Player not found');
  return r.json();
}

// ── Predictions (#16-25, #30) ────────────────────────────────────────────────

export type PredictionType = 'winner' | 'exact_score' | 'mvp'
  | 'first_blood' | 'first_tower' | 'first_tyrant' | 'first_overlord' | 'tempest_dragon'
  | 'over_under';

export interface Prediction {
  id: number;
  user_id: number;
  match_id: number;
  prediction_type: PredictionType;
  predicted_winner_id: number | null;
  predicted_score: string | null;
  predicted_mvp_id: number | null;
  game_number: number | null;
  points_earned: number;
  is_correct: boolean | null;
  is_confident: boolean;
  created_at: string;
  week: number;
  stage: string;
  match_date: string | null;
  match_status: string;
  team1_id: number;
  team2_id: number;
  team1_score: number;
  team2_score: number;
  winner_team_id: number | null;
  over_under_line: number | null;
  team1_short: string;
  team1_color: string;
  team2_short: string;
  team2_color: string;
  predicted_winner_short: string | null;
  predicted_mvp_name: string | null;
}

export interface PredictionLeaderboardEntry {
  user_id: number;
  user_name: string;
  total_points: number;
  total_predictions: number;
  correct_predictions: number;
}

export async function savePrediction(data: {
  matchId: number;
  predictionType: PredictionType;
  winnerId?: number;
  predictedScore?: string;
  mvpPlayerId?: number;
  gameNumber?: number;
  isConfident?: boolean;
}): Promise<Prediction> {
  const r = await fetch(`${API}/api/fantasy/predictions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Failed to save prediction');
  return d;
}

export async function getMyPredictions(seasonId: number): Promise<Prediction[]> {
  const r = await fetch(`${API}/api/fantasy/predictions/${seasonId}`, { headers: authHeader() });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getPredictionLeaderboard(seasonId: number): Promise<PredictionLeaderboardEntry[]> {
  const r = await fetch(`${API}/api/fantasy/predictions/${seasonId}/leaderboard`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}
