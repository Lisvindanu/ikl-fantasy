import { useState, useEffect } from 'react';
import { Shield, Trophy, Check, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import type { IKLTeam, IKLSeason, FantasyTeamSelection, TeamLeaderboardEntry, LoyaltyInfo } from '../../api/fantasy';
import * as fantasyApi from '../../api/fantasy';

// ── Scoring reference ──────────────────────────────────────────────────────────
const SCORING = [
  { label: 'Series Win', pts: '+10' },
  { label: 'Per Game Win', pts: '+2' },
  { label: 'Clean Sweep Bonus', pts: '+5' },
];

// ── Team card ──────────────────────────────────────────────────────────────────
function TeamCard({
  team,
  isPicked,
  onPick,
  saving,
}: {
  team: IKLTeam;
  isPicked: boolean;
  onPick: () => void;
  saving: boolean;
}) {
  return (
    <button
      onClick={onPick}
      disabled={saving}
      className="w-full text-left rounded-2xl p-4 transition-all disabled:opacity-60"
      style={{
        background: isPicked ? `${team.color}18` : '#0d1017',
        border: isPicked ? `1.5px solid ${team.color}60` : '1.5px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Team logo */}
        {team.logo_url ? (
          <img
            src={team.logo_url!}
            alt={team.short_name}
            className="w-10 h-10 object-contain flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0"
            style={{ background: `${team.color}25`, color: team.color }}>
            {team.short_name}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-black text-white text-sm">{team.short_name}</span>
            <span className="text-gray-500 text-xs truncate">{team.name}</span>
            {team.qualified_kwc && (
              <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                KWC
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-600">#{team.standing}</span>
            <span className="text-xs font-bold text-green-400">{team.wins}W</span>
            <span className="text-xs font-bold text-red-400">{team.losses}L</span>
            <span className="text-xs text-gray-600">{team.map_wins}–{team.map_losses} maps</span>
          </div>
        </div>

        {isPicked ? (
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: team.color }}>
            <Check className="w-4 h-4 text-black" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full border-2 border-white/10 flex-shrink-0" />
        )}
      </div>
    </button>
  );
}

// ── Loyalty badge styles ──────────────────────────────────────────────────────
const BADGE_STYLES = {
  silver: { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500' },
  gold:   { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500' },
  diamond: { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500' },
} as const;

function LoyaltyBadgeDisplay({ loyalty }: { loyalty: LoyaltyInfo }) {
  const badge = loyalty.badge;
  if (!badge) return null;
  const s = BADGE_STYLES[badge.tier];

  return (
    <div className="rounded-2xl p-4 mb-5" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Badge pill */}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${s.bg} ${s.text} ${s.border}`}>
          {badge.tier === 'diamond' ? '\u2666' : badge.tier === 'gold' ? '\u2605' : '\u25CF'}
          {' '}{badge.label}
        </span>

        {/* Multiplier */}
        <span className="text-xs font-black text-white">
          x{loyalty.loyaltyMultiplier.toFixed(2)} pts
        </span>

        {/* Streak info */}
        <span className="text-xs text-gray-500">
          {loyalty.loyaltySeasons} season{loyalty.loyaltySeasons !== 1 ? 's' : ''} with {loyalty.teamShort}
        </span>
      </div>

      {/* #29: Grace period banner (disbanded team) */}
      {loyalty.switchedThisSeason && loyalty.gracePeriodActive && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className="text-xs font-bold text-blue-400">
            Your previous team was disbanded. Free switch available for 14 days — no loyalty penalty!
          </span>
        </div>
      )}

      {/* Switch penalty warning */}
      {loyalty.switchedThisSeason && !loyalty.gracePeriodActive && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-xs font-bold text-red-400">
            Switched team! -20% penalty on team pts this season
          </span>
        </div>
      )}
    </div>
  );
}

// ── Leaderboard row ────────────────────────────────────────────────────────────
function LeaderboardRow({ entry, rank }: { entry: TeamLeaderboardEntry; rank: number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-t border-white/5 first:border-t-0">
      <span className={`w-6 text-center font-black text-sm flex-shrink-0 ${
        rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-700' : 'text-gray-600'
      }`}>{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white text-sm truncate">{entry.user_name}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.team_color }} />
          <span className="text-xs text-gray-500">{entry.team_short}</span>
        </div>
      </div>
      <span className="font-black text-amber-400 text-sm flex-shrink-0">
        {entry.total_pts > 0 ? `+${entry.total_pts}` : entry.total_pts}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
interface Props {
  season: IKLSeason & { teams: IKLTeam[] };
  isAuthenticated: boolean;
  mySelection: FantasyTeamSelection | null;
  leaderboard: TeamLeaderboardEntry[];
  onSelectionSaved: (sel: FantasyTeamSelection) => void;
  onGoToLogin: () => void;
}

export function TeamPickTab({ season, isAuthenticated, mySelection, leaderboard, onSelectionSaved, onGoToLogin }: Props) {
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [pendingTeamId, setPendingTeamId] = useState<number | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltyInfo | null>(null);

  const teams = [...(season.teams ?? [])].sort((a, b) => a.standing - b.standing);
  const pickedTeamId = pendingTeamId ?? mySelection?.team_id ?? null;

  // Fetch loyalty info when authenticated and selection exists
  useEffect(() => {
    if (!isAuthenticated || !mySelection?.team_id) {
      setLoyalty(null);
      return;
    }
    fantasyApi.getLoyaltyInfo(season.id).then(setLoyalty).catch(() => setLoyalty(null));
  }, [isAuthenticated, season.id, mySelection?.team_id]);

  async function handlePick(teamId: number) {
    if (!isAuthenticated) { onGoToLogin(); return; }
    // Toggle off
    if (pickedTeamId === teamId) return;
    setPendingTeamId(teamId);
    setSaving(true);
    setSaveMsg('');
    try {
      const result = await fantasyApi.saveMyTeamSelection(season.id, teamId);
      onSelectionSaved(result);
      setSaveMsg('Team saved!');
      // Refresh loyalty info after save
      const updatedLoyalty = await fantasyApi.getLoyaltyInfo(season.id);
      setLoyalty(updatedLoyalty);
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : 'Failed to save');
      setPendingTeamId(mySelection?.team_id ?? null);
    }
    setSaving(false);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">

        {/* Left: team picker */}
        <div>
          {/* Scoring info */}
          <div className="rounded-2xl p-4 mb-5 flex items-start gap-3"
            style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            <TrendingUp className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-black text-white uppercase tracking-wider mb-2">Scoring System</p>
              <div className="flex flex-wrap gap-3">
                {SCORING.map(s => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-400">{s.pts}</span>
                    <span className="text-xs text-gray-500">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Loyalty badge */}
          {loyalty && <LoyaltyBadgeDisplay loyalty={loyalty} />}

          <h2 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            Pick Your Team
          </h2>

          {!isAuthenticated && (
            <div className="rounded-xl px-4 py-3 mb-4 text-sm text-amber-400 font-bold"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              Login to save your team pick
            </div>
          )}

          <div className="space-y-2">
            {teams.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                isPicked={pickedTeamId === team.id}
                onPick={() => handlePick(team.id)}
                saving={saving}
              />
            ))}
          </div>

          {saveMsg && (
            <p className={`text-sm font-bold mt-3 ${saveMsg === 'Team saved!' ? 'text-green-400' : 'text-red-400'}`}>
              {saveMsg}
            </p>
          )}
        </div>

        {/* Right: leaderboard */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Team Leaderboard
          </h2>

          <div className="rounded-2xl overflow-hidden"
            style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            {leaderboard.length === 0 ? (
              <div className="py-8 text-center text-gray-600 text-sm">
                No picks yet. Be the first!
              </div>
            ) : (
              leaderboard.map((entry, i) => (
                <LeaderboardRow key={entry.id} entry={entry} rank={i + 1} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
