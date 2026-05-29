import type { IKLMatch, AuditLogEntry } from './fantasy';
import { API, apiFetch } from './fantasy';

// ── Admin: match management ──────────────────────────────────────────────────

export async function adminCreateMatch(data: {
  seasonId: number; week: number; stage: string; matchDate: string;
  team1Id: number; team2Id: number; bestOf: number;
  team1Score: number; team2Score: number; winnerTeamId: number | null;
  status?: string;
}): Promise<IKLMatch> {
  const r = await apiFetch(`${API}/api/fantasy/admin/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const res = await r.json();
  if (!r.ok) throw new Error(res.error || 'Failed to create match');
  return res;
}

export async function adminSaveGameStats(matchId: number, gameNumber: number, stats: {
  playerId: number; kills: number; deaths: number; assists: number; isMvp: boolean; hasPentaKill: boolean;
}[]): Promise<{ ok: boolean; warnings?: string[] }> {
  const r = await apiFetch(`${API}/api/fantasy/admin/matches/${matchId}/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameNumber, stats }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Failed to save stats');
  return d;
}

export async function adminDeleteMatch(matchId: number): Promise<void> {
  const r = await apiFetch(`${API}/api/fantasy/admin/matches/${matchId}`, {
    method: 'DELETE',
  });
  if (!r.ok) throw new Error('Failed to delete match');
}

export async function adminCloneMatch(matchId: number): Promise<IKLMatch> {
  const r = await apiFetch(`${API}/api/fantasy/admin/matches/${matchId}/clone`, {
    method: 'POST',
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Failed to clone match');
  return d;
}

export async function adminRecalculate(seasonId: number): Promise<void> {
  const r = await apiFetch(`${API}/api/fantasy/admin/recalculate/${seasonId}`, {
    method: 'POST',
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error((data as Record<string, string>).error || 'Failed to recalculate');
  }
}

export async function adminUpdateMatchStatus(matchId: number, status: string): Promise<IKLMatch> {
  const r = await apiFetch(`${API}/api/fantasy/admin/matches/${matchId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Failed to update status');
  return d;
}

export async function adminGetAuditLog(limit = 50, offset = 0): Promise<AuditLogEntry[]> {
  const r = await apiFetch(`${API}/api/fantasy/admin/audit?limit=${limit}&offset=${offset}`, {
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Admin: user management ────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

export async function adminGetAdmins(): Promise<AdminUser[]> {
  const r = await apiFetch(`${API}/api/fantasy/admin/admins`, {});
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function adminFindUser(email: string): Promise<AdminUser | null> {
  const r = await apiFetch(`${API}/api/fantasy/admin/find-user?email=${encodeURIComponent(email)}`, {});
  if (!r.ok) return null;
  const data = await r.json();
  return data || null;
}

export async function adminSetAdmin(userId: number, grant: boolean): Promise<AdminUser> {
  const r = await apiFetch(`${API}/api/fantasy/admin/admins/${userId}`, {
    method: grant ? 'POST' : 'DELETE',
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Failed');
  return data;
}

// ── Admin: season settings ────────────────────────────────────────────────────

export async function adminUpdateSeasonSettings(seasonId: number, settings: {
  picksLockAt?: string | null;
  maxParticipants?: number | null;
}): Promise<void> {
  const r = await apiFetch(`${API}/api/fantasy/admin/seasons/${seasonId}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error((data as Record<string, string>).error || 'Failed to update settings');
  }
}

// #103: Admin export
export function getExportUrl(seasonId: number): string {
  return `${API}/api/fantasy/admin/export/${seasonId}`;
}

// #97: Admin dashboard metrics
export interface AdminDashboardMetrics {
  totalParticipants: number;
  totalTeamPicks: number;
  totalMatches: number;
  matchesByStatus: Record<string, number>;
  totalStatRows: number;
  recentActivity: { action: string; admin_name: string; created_at: string }[];
}

export async function adminGetDashboardMetrics(seasonId: number): Promise<AdminDashboardMetrics> {
  const r = await apiFetch(`${API}/api/fantasy/admin/dashboard/${seasonId}`, {});
  return r.json();
}

// ── Admin: predictions grading ────────────────────────────────────────────────

export async function adminGradePredictions(matchId: number): Promise<{ graded: number }> {
  const r = await apiFetch(`${API}/api/fantasy/admin/matches/${matchId}/grade-predictions`, {
    method: 'POST',
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Failed to grade predictions');
  return d;
}

// ── Admin: match objectives (#19-24) ─────────────────────────────────────────

export async function adminUpdateMatchObjectives(matchId: number, objectives: {
  firstBloodTeamId?: number | null;
  firstTowerTeamId?: number | null;
  firstTyrantTeamId?: number | null;
  firstOverlordTeamId?: number | null;
  tempestDragonTeamId?: number | null;
  overUnderLine?: number | null;
}): Promise<IKLMatch> {
  const r = await apiFetch(`${API}/api/fantasy/admin/matches/${matchId}/objectives`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(objectives),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Failed to update objectives');
  return d;
}

// #63: Weekly Recap Email
export async function sendWeeklyRecap(seasonId: number): Promise<{ sent: number }> {
  const r = await apiFetch(`${API}/api/fantasy/admin/seasons/${seasonId}/send-recap`, {
    method: 'POST',
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Failed to send recap');
  return d;
}

// ── Admin: dynamic prices ───────────────────────────────────────────────────

export async function adminUpdatePrices(seasonId: number): Promise<{ updated: number }> {
  const r = await apiFetch(`${API}/api/fantasy/admin/seasons/${seasonId}/update-prices`, {
    method: 'POST',
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Failed to update prices');
  return d;
}

// ── Admin: seed IKL data ────────────────────────────────────────────────────

export async function adminSeedIklFull(): Promise<{ seasonId: number; teams: number; players: number }> {
  const r = await apiFetch(`${API}/api/fantasy/admin/seed-ikl-full`, {
    method: 'POST',
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Failed to seed IKL data');
  return d;
}

// ── Admin: CSV import stats ─────────────────────────────────────────────────

export async function adminCsvImportStats(matchId: number, gameNumber: number, csv: string): Promise<{ ok: boolean; imported: number; errors: string[] }> {
  const r = await apiFetch(`${API}/api/fantasy/admin/matches/${matchId}/csv-import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId, gameNumber, csv }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'CSV import failed');
  return d;
}
