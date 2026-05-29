import { API, apiFetch } from './fantasy';

// ── Private leagues ───────────────────────────────────────────────────────────

export interface FantasyLeague {
  id: number;
  season_id: number;
  creator_id: number;
  name: string;
  invite_code: string;
  max_members: number;
  member_count: number;
  created_at: string;
  is_public?: boolean;
  region?: string | null;
  league_type?: 'custom' | 'public' | 'team_fan';
  team_id?: number | null;
  team_name?: string | null;
  team_short?: string | null;
  team_color?: string | null;
}

export interface LeagueMemberEntry {
  user_id: number;
  user_name: string;
  player_pts: number;
  team_name: string;
  team_pts: number;
  picked_team_short: string;
  picked_team_color: string;
}

// ── #62: League Activity Feed ─────────────────────────────────────────────────

export interface LeagueActivity {
  id: number;
  league_id: number;
  user_id: number;
  user_name: string;
  action: string;
  detail: Record<string, unknown> | null;
  created_at: string;
}

export async function getLeagueActivity(leagueId: number): Promise<LeagueActivity[]> {
  const r = await apiFetch(`${API}/api/fantasy/leagues/${leagueId}/activity`);
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

export async function createLeague(seasonId: number, name: string, maxMembers?: number): Promise<FantasyLeague> {
  const r = await apiFetch(`${API}/api/fantasy/leagues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seasonId, name, maxMembers }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to create league');
  return data;
}

export async function joinLeague(inviteCode: string): Promise<FantasyLeague> {
  const r = await apiFetch(`${API}/api/fantasy/leagues/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inviteCode }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to join league');
  return data;
}

export async function getMyLeagues(seasonId: number): Promise<FantasyLeague[]> {
  const r = await apiFetch(`${API}/api/fantasy/leagues/mine/${seasonId}`, {});
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

export async function getLeague(leagueId: number): Promise<FantasyLeague & { leaderboard: LeagueMemberEntry[] }> {
  const r = await apiFetch(`${API}/api/fantasy/leagues/${leagueId}`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function transferLeagueOwnership(leagueId: number, newOwnerId: number): Promise<FantasyLeague> {
  const r = await apiFetch(`${API}/api/fantasy/leagues/${leagueId}/transfer-ownership`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newOwnerId }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Failed to transfer ownership');
  return d;
}

export async function deleteLeague(leagueId: number): Promise<void> {
  const r = await apiFetch(`${API}/api/fantasy/leagues/${leagueId}`, {
    method: 'DELETE',
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete league');
  }
}

export async function leaveLeague(leagueId: number): Promise<void> {
  const r = await apiFetch(`${API}/api/fantasy/leagues/${leagueId}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to leave league');
  }
}

export async function updateLeague(leagueId: number, data: { name?: string; maxMembers?: number }): Promise<FantasyLeague> {
  const r = await apiFetch(`${API}/api/fantasy/leagues/${leagueId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Failed to update league');
  return d;
}

// ── #59: Public leagues ───────────────────────────────────────────────────────

export async function getPublicLeagues(seasonId: number): Promise<FantasyLeague[]> {
  const r = await apiFetch(`${API}/api/fantasy/leagues/public/${seasonId}`);
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

export async function joinPublicLeague(leagueId: number): Promise<FantasyLeague> {
  const r = await apiFetch(`${API}/api/fantasy/leagues/${leagueId}/join-public`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to join league');
  return data;
}

// ── #60: Team-fan leagues ─────────────────────────────────────────────────────

export async function getTeamFanLeagues(seasonId: number): Promise<FantasyLeague[]> {
  const r = await apiFetch(`${API}/api/fantasy/leagues/team-fan/${seasonId}`);
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

// ── #61: League chat ─────────────────────────────────────────────────────────

export interface LeagueMessage {
  id: number;
  league_id: number;
  user_id: number;
  user_name: string;
  content: string;
  created_at: string;
}

export async function getLeagueMessages(leagueId: number): Promise<LeagueMessage[]> {
  const r = await apiFetch(`${API}/api/fantasy/leagues/${leagueId}/messages`, {
  });
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

export async function sendLeagueMessage(leagueId: number, content: string): Promise<LeagueMessage> {
  const r = await apiFetch(`${API}/api/fantasy/leagues/${leagueId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to send message');
  return data;
}

export async function deleteLeagueMessage(messageId: number): Promise<void> {
  const r = await apiFetch(`${API}/api/fantasy/league-messages/${messageId}`, {
    method: 'DELETE',
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete message');
  }
}

// ── #65: Knockout Cup ────────────────────────────────────────────────────────

export interface KnockoutMatch {
  id: number;
  knockout_id: number;
  round: number;
  match_order: number;
  user1_id: number | null;
  user1_name: string;
  user2_id: number | null;
  user2_name: string;
  user1_pts: number;
  user2_pts: number;
  winner_id: number | null;
  created_at: string;
}

export interface Knockout {
  id: number;
  league_id: number;
  season_id: number;
  total_rounds: number;
  current_round: number;
  status: 'active' | 'completed';
  created_at: string;
  matches: KnockoutMatch[];
}

export interface KnockoutSummary {
  id: number;
  league_id: number;
  season_id: number;
  total_rounds: number;
  current_round: number;
  status: 'active' | 'completed';
  created_at: string;
}

export async function getLeagueKnockouts(leagueId: number): Promise<KnockoutSummary[]> {
  const r = await apiFetch(`${API}/api/fantasy/leagues/${leagueId}/knockouts`);
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

export async function getKnockoutBracket(knockoutId: number): Promise<Knockout | null> {
  const r = await apiFetch(`${API}/api/fantasy/knockouts/${knockoutId}`);
  if (!r.ok) return null;
  return r.json();
}

export async function createKnockout(leagueId: number): Promise<KnockoutSummary> {
  const r = await apiFetch(`${API}/api/fantasy/leagues/${leagueId}/knockout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to create knockout');
  return data;
}

export async function advanceKnockoutRound(knockoutId: number): Promise<{ status: string; round?: number; winner?: { user_id: number; user_name: string } | null }> {
  const r = await apiFetch(`${API}/api/fantasy/knockouts/${knockoutId}/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to advance round');
  return data;
}

// ── #68: Friend System ──────────────────────────────────────────────────────

export interface Friend {
  id: number;
  friend_id: number;
  friend_name: string;
  status: string;
  created_at: string;
}

export interface PendingRequest {
  id: number;
  user_id: number;
  from_name: string;
  created_at: string;
}

export interface UserSearchResult {
  id: number;
  name: string;
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const r = await apiFetch(`${API}/api/fantasy/users/search?q=${encodeURIComponent(query)}`, {
  });
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

export async function getFriends(): Promise<Friend[]> {
  const r = await apiFetch(`${API}/api/fantasy/friends`, {});
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

export async function getPendingRequests(): Promise<PendingRequest[]> {
  const r = await apiFetch(`${API}/api/fantasy/friends/pending`, {});
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

export async function sendFriendRequest(friendId: number): Promise<void> {
  const r = await apiFetch(`${API}/api/fantasy/friends/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ friendId }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to send request');
}

export async function acceptFriendRequest(requestId: number): Promise<void> {
  const r = await apiFetch(`${API}/api/fantasy/friends/${requestId}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to accept request');
}

export async function declineFriendRequest(requestId: number): Promise<void> {
  const r = await apiFetch(`${API}/api/fantasy/friends/${requestId}/decline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed to decline request');
}

export async function removeFriend(friendshipId: number): Promise<void> {
  const r = await apiFetch(`${API}/api/fantasy/friends/${friendshipId}`, {
    method: 'DELETE',
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to remove friend');
  }
}
