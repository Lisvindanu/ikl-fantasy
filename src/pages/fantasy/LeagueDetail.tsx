import { useState, useEffect, useMemo } from 'react';
import { Copy, Check, Pencil, Share2, ArrowRightLeft, AlertTriangle, Eye, LogIn, UserPlus, MessageCircle, ChevronDown, Swords, Trophy, Trash2, LogOut } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { FantasyLeague, LeagueMemberEntry, LeagueActivity, KnockoutSummary, Knockout, KnockoutMatch } from '../../api/fantasy';
import { LeagueChat } from './LeagueChat';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatAction(action: string, detail: Record<string, unknown> | null): string {
  switch (action) {
    case 'joined': return 'joined the league';
    case 'used_chip': {
      const chipLabels: Record<string, string> = {
        triple_captain: 'Triple Captain',
        bench_boost: 'Bench Boost',
        wildcard: 'Wildcard',
        free_hit: 'Free Hit',
      };
      const chip = detail?.chipType as string || 'a chip';
      return `used ${chipLabels[chip] || chip}`;
    }
    case 'transferred': return 'made a transfer';
    default: return action.replace(/_/g, ' ');
  }
}

interface LeagueDetailProps {
  leagueId: number;
  onBack: () => void;
  currentUserId: number | null;
  isAuthenticated?: boolean;
  onGoToLogin?: () => void;
  onJoinLeague?: (inviteCode: string) => void;
}

export function LeagueDetail({ leagueId, onBack, currentUserId, isAuthenticated = !!currentUserId, onGoToLogin, onJoinLeague }: LeagueDetailProps) {
  const [data, setData] = useState<(FantasyLeague & { leaderboard: LeagueMemberEntry[] }) | null>(null);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMax, setEditMax] = useState(50);
  const [editSaving, setEditSaving] = useState(false);
  const [editErr, setEditErr] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferTarget, setTransferTarget] = useState<number | null>(null);
  const [transferring, setTransferring] = useState(false);
  const [transferMsg, setTransferMsg] = useState('');
  const [fetchError, setFetchError] = useState(false);
  const [activity, setActivity] = useState<LeagueActivity[]>([]);
  const [chatOpen, setChatOpen] = useState(false);

  // Knockout Cup state (#65)
  const [knockouts, setKnockouts] = useState<KnockoutSummary[]>([]);
  const [activeKnockout, setActiveKnockout] = useState<Knockout | null>(null);
  const [knockoutOpen, setKnockoutOpen] = useState(false);
  const [creatingKnockout, setCreatingKnockout] = useState(false);
  const [advancingRound, setAdvancingRound] = useState(false);
  const [knockoutMsg, setKnockoutMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    fantasyApi.getLeague(leagueId).then(d => {
      setData(d);
      setEditName(d.name);
      setEditMax(d.max_members);
    }).catch(() => setFetchError(true));
    fantasyApi.getLeagueActivity(leagueId).then(setActivity);
    fantasyApi.getLeagueKnockouts(leagueId).then(kos => {
      setKnockouts(kos);
      // Auto-load active knockout bracket
      const active = kos.find(k => k.status === 'active');
      if (active) {
        fantasyApi.getKnockoutBracket(active.id).then(b => { if (b) setActiveKnockout(b); });
      } else if (kos.length > 0) {
        fantasyApi.getKnockoutBracket(kos[0].id).then(b => { if (b) setActiveKnockout(b); });
      }
    });
  }, [leagueId]);

  function copyCode() {
    if (!data) return;
    navigator.clipboard.writeText(data.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareLeague() {
    if (!data) return;
    const url = `${window.location.origin}/fantasy?join=${data.invite_code}`;
    if (navigator.share) {
      navigator.share({ title: `Join ${data.name}`, text: `Join my IKL Fantasy league! Code: ${data.invite_code}`, url });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleEditSave() {
    if (!editName.trim()) { setEditErr('Name required'); return; }
    setEditSaving(true);
    setEditErr('');
    try {
      const updated = await fantasyApi.updateLeague(leagueId, { name: editName.trim(), maxMembers: editMax });
      setData(prev => prev ? { ...prev, name: updated.name, max_members: updated.max_members } : prev);
      setEditing(false);
    } catch (e: unknown) { setEditErr(e instanceof Error ? e.message : 'Failed to update'); }
    setEditSaving(false);
  }

  async function handleTransfer() {
    if (!transferTarget) return;
    setTransferring(true);
    setTransferMsg('');
    try {
      await fantasyApi.transferLeagueOwnership(leagueId, transferTarget);
      setTransferMsg('Ownership transferred!');
      setShowTransfer(false);
      setTransferTarget(null);
      const d = await fantasyApi.getLeague(leagueId);
      setData(d);
    } catch (e: unknown) { setTransferMsg(e instanceof Error ? e.message : 'Failed'); }
    setTransferring(false);
  }

  const isMember = data && currentUserId != null
    && Array.isArray(data.leaderboard)
    && data.leaderboard.some(m => m.user_id === currentUserId);
  const isCreator = data && currentUserId === data.creator_id;
  const isSpectator = data && !isMember;

  const [joiningLeague, setJoiningLeague] = useState(false);
  const [joinError, setJoinError] = useState('');

  async function handleJoinLeague() {
    if (!data) return;
    if (onJoinLeague) {
      onJoinLeague(data.invite_code);
      return;
    }
    setJoiningLeague(true);
    setJoinError('');
    try {
      await fantasyApi.joinLeague(data.invite_code);
      const refreshed = await fantasyApi.getLeague(leagueId);
      setData(refreshed);
    } catch (e: unknown) {
      setJoinError(e instanceof Error ? e.message : 'Failed to join league');
    } finally {
      setJoiningLeague(false);
    }
  }

  if (fetchError) return (
    <div className="py-16 text-center">
      <AlertTriangle className="w-10 h-10 text-red-500/60 mx-auto mb-3" />
      <p className="text-white font-bold mb-1">Failed to load league</p>
      <p className="text-gray-500 text-sm mb-4">Something went wrong while fetching league data.</p>
      <button onClick={onBack}
        className="px-5 py-2 rounded-xl font-bold text-sm text-white"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
        Back
      </button>
    </div>
  );

  if (!data) return (
    <div className="py-10 flex justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div>
      <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-300 font-bold mb-4 flex items-center gap-1">
        ← {isMember ? 'Back to my leagues' : 'Back'}
      </button>

      {/* Spectator banner */}
      {isSpectator && (
        <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3 flex-wrap"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="text-xs font-bold text-indigo-300">Spectator Mode</span>
            <span className="text-xs text-gray-500">You are viewing this league as a spectator</span>
          </div>
          {isAuthenticated ? (
            <button onClick={handleJoinLeague} disabled={joiningLeague}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-black disabled:opacity-60 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
              <UserPlus className="w-3.5 h-3.5" />
              {joiningLeague ? 'Joining...' : 'Join this league'}
            </button>
          ) : (
            <button onClick={onGoToLogin}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <LogIn className="w-3.5 h-3.5" />
              Login to join
            </button>
          )}
        </div>
      )}

      {joinError && (
        <p className="text-red-400 text-xs font-bold bg-red-500/10 px-3 py-2 rounded-xl mb-4">{joinError}</p>
      )}

      <div className="rounded-2xl p-4 mb-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
        {editing ? (
          <div className="space-y-3">
            <input value={editName} onChange={e => setEditName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-white text-sm outline-none"
              style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.1)' }} />
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-500 font-bold flex-shrink-0">Max anggota</label>
              <input type="number" min={2} max={200} value={editMax}
                onChange={e => setEditMax(Number(e.target.value))}
                className="w-20 px-3 py-2 rounded-xl text-white text-sm text-center outline-none"
                style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            {editErr && <p className="text-red-400 text-xs">{editErr}</p>}
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-gray-400"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                Cancel
              </button>
              <button onClick={handleEditSave} disabled={editSaving}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-black disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
                {editSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-lg">{data.name}</h3>
                {isCreator && (
                  <button onClick={() => setEditing(true)} className="text-gray-600 hover:text-gray-300 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-xs mt-0.5">{data.member_count} / {data.max_members} members</p>
            </div>
            {isMember && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={copyCode}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {data.invite_code}
                </button>
                <button onClick={shareLeague}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Creator actions: Transfer + Delete | Member: Leave */}
      {isCreator && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button onClick={() => setShowTransfer(true)}
            className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-300 font-bold transition-colors">
            <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer Ownership
          </button>
          <button onClick={async () => {
            if (!confirm('Yakin hapus liga ini? Semua data liga akan hilang.')) return;
            try {
              await fantasyApi.deleteLeague(leagueId);
              onBack();
            } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed to delete'); }
          }}
            className="flex items-center gap-2 text-xs text-red-500/70 hover:text-red-400 font-bold transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Hapus Liga
          </button>
        </div>
      )}
      {isMember && !isCreator && (
        <div className="mb-4">
          <button onClick={async () => {
            if (!confirm('Yakin keluar dari liga ini?')) return;
            try {
              await fantasyApi.leaveLeague(leagueId);
              onBack();
            } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed to leave'); }
          }}
            className="flex items-center gap-2 text-xs text-red-500/70 hover:text-red-400 font-bold transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Keluar Liga
          </button>
        </div>
      )}

      {/* Transfer ownership form */}
      {isCreator && showTransfer && (
        <div className="mb-4">
          <div className="rounded-xl p-4 space-y-3" style={{ background: '#0d1017', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-xs font-bold text-gray-400">Transfer ownership to a member:</p>
            <select value={transferTarget ?? ''} onChange={e => setTransferTarget(Number(e.target.value) || null)}
              className="w-full px-3 py-2 rounded-xl text-white text-sm outline-none"
              style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.1)' }}>
              <option value="">Select member...</option>
              {data.leaderboard.filter(m => m.user_id !== currentUserId).map(m => (
                <option key={m.user_id} value={m.user_id}>{m.user_name}</option>
              ))}
            </select>
            {transferMsg && <p className={`text-xs ${transferMsg.includes('transferred') ? 'text-green-400' : 'text-red-400'}`}>{transferMsg}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setShowTransfer(false); setTransferTarget(null); setTransferMsg(''); }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-gray-400"
                style={{ background: 'rgba(255,255,255,0.05)' }}>Cancel</button>
              <button onClick={handleTransfer} disabled={!transferTarget || transferring}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-40"
                style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }}>
                {transferring ? 'Transferring...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-4 py-3 border-b border-white/5 grid grid-cols-[2rem_1fr_5rem_5rem_5rem] text-xs font-black uppercase tracking-wider text-gray-600">
          <span>#</span>
          <span>Player</span>
          <span className="text-center text-amber-500">Plyr</span>
          <span className="text-center text-purple-400">Team</span>
          <span className="text-center text-white">Total</span>
        </div>
        {data.leaderboard.length === 0 ? (
          <p className="text-center text-gray-600 text-sm py-8">No participants yet</p>
        ) : (
          data.leaderboard.map((entry, i) => {
            const total = entry.player_pts + entry.team_pts;
            const trophyIcon = i === 0 ? (
              <span className="text-base flex-shrink-0" title="1st Place" role="img" aria-label="Gold Trophy">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 4V2h10v2h3a1 1 0 011 1v3c0 2.21-1.79 4-4 4h-.29A6.006 6.006 0 0113 17.92V20h3v2H8v-2h3v-2.08A6.006 6.006 0 017.29 12H7c-2.21 0-4-1.79-4-4V5a1 1 0 011-1h3zm-3 2v2c0 1.1.9 2 2 2h.54A6.02 6.02 0 017 6.5V6H4zm16 0h-3v.5A6.02 6.02 0 0117.46 10H18c1.1 0 2-.9 2-2V6z" fill="#FFD700"/>
                </svg>
              </span>
            ) : i === 1 ? (
              <span className="text-base flex-shrink-0" title="2nd Place" role="img" aria-label="Silver Medal">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="10" r="7" fill="#C0C0C0"/>
                  <text x="12" y="13" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#555">2</text>
                  <path d="M8 17l-2 5h2.5l3.5-3 3.5 3H18l-2-5" fill="#C0C0C0"/>
                </svg>
              </span>
            ) : i === 2 ? (
              <span className="text-base flex-shrink-0" title="3rd Place" role="img" aria-label="Bronze Medal">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="10" r="7" fill="#CD7F32"/>
                  <text x="12" y="13" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#fff">3</text>
                  <path d="M8 17l-2 5h2.5l3.5-3 3.5 3H18l-2-5" fill="#CD7F32"/>
                </svg>
              </span>
            ) : null;
            return (
              <div key={entry.user_id}
                className="grid grid-cols-[2rem_1fr_5rem_5rem_5rem] items-center px-4 py-3 border-t border-white/5">
                <span className={`text-sm font-black ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-700' : 'text-gray-600'}`}>
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {trophyIcon}
                    <span className="font-bold text-white text-sm truncate">{entry.user_name}</span>
                  </div>
                  {entry.picked_team_short && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: entry.picked_team_color }} />
                      <span className="text-xs text-gray-600">{entry.picked_team_short}</span>
                    </div>
                  )}
                </div>
                <span className="text-center text-amber-400 font-bold text-sm">
                  {entry.player_pts > 0 ? `+${entry.player_pts}` : entry.player_pts}
                </span>
                <span className="text-center text-purple-400 font-bold text-sm">
                  {entry.team_pts > 0 ? `+${entry.team_pts}` : entry.team_pts}
                </span>
                <span className="text-center text-white font-black text-sm">
                  {total > 0 ? `+${total}` : total}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* #65: Knockout Cup */}
      <KnockoutSection
        knockouts={knockouts}
        activeKnockout={activeKnockout}
        isCreator={!!isCreator}
        knockoutOpen={knockoutOpen}
        setKnockoutOpen={setKnockoutOpen}
        creatingKnockout={creatingKnockout}
        advancingRound={advancingRound}
        knockoutMsg={knockoutMsg}
        onCreateKnockout={async () => {
          setCreatingKnockout(true);
          setKnockoutMsg(null);
          try {
            const ko = await fantasyApi.createKnockout(leagueId);
            setKnockouts(prev => [ko, ...prev]);
            const bracket = await fantasyApi.getKnockoutBracket(ko.id);
            if (bracket) setActiveKnockout(bracket);
            setKnockoutMsg({ type: 'ok', text: 'Knockout Cup created!' });
            setKnockoutOpen(true);
          } catch (e: unknown) {
            setKnockoutMsg({ type: 'err', text: e instanceof Error ? e.message : 'Failed to create knockout' });
          }
          setCreatingKnockout(false);
        }}
        onAdvanceRound={async () => {
          if (!activeKnockout) return;
          setAdvancingRound(true);
          setKnockoutMsg(null);
          try {
            const result = await fantasyApi.advanceKnockoutRound(activeKnockout.id);
            const bracket = await fantasyApi.getKnockoutBracket(activeKnockout.id);
            if (bracket) setActiveKnockout(bracket);
            if (result.status === 'completed') {
              setKnockoutMsg({ type: 'ok', text: `Knockout complete! Winner: ${result.winner?.user_name || 'N/A'}` });
              setKnockouts(prev => prev.map(k => k.id === activeKnockout.id ? { ...k, status: 'completed' as const } : k));
            } else {
              setKnockoutMsg({ type: 'ok', text: `Advanced to Round ${result.round}` });
            }
          } catch (e: unknown) {
            setKnockoutMsg({ type: 'err', text: e instanceof Error ? e.message : 'Failed to advance round' });
          }
          setAdvancingRound(false);
        }}
        onSelectKnockout={async (koId: number) => {
          const bracket = await fantasyApi.getKnockoutBracket(koId);
          if (bracket) setActiveKnockout(bracket);
        }}
        currentUserId={currentUserId}
      />

      {/* #62: Activity Feed */}
      <div className="mt-4 rounded-2xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-4 py-3 border-b border-white/5">
          <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">Activity</h4>
        </div>
        {activity.length === 0 ? (
          <p className="text-center text-gray-600 text-sm py-8">No activity yet</p>
        ) : (
          <div className="divide-y divide-white/5">
            {activity.slice(0, 20).map(a => (
              <div key={a.id} className="px-4 py-2.5 flex items-baseline justify-between gap-3">
                <p className="text-sm text-gray-300 min-w-0">
                  <span className="font-bold text-white">{a.user_name}</span>{' '}
                  {formatAction(a.action, a.detail)}
                </p>
                <span className="text-xs text-gray-600 flex-shrink-0 whitespace-nowrap">{timeAgo(a.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* #61: League Chat — members only */}
      {isMember && (
        <div className="mt-4 rounded-2xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setChatOpen(v => !v)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">Chat</h4>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform ${chatOpen ? 'rotate-180' : ''}`} />
          </button>
          {chatOpen && (
            <LeagueChat
              leagueId={leagueId}
              isAuthenticated={isAuthenticated}
              userId={currentUserId}
              userName={data.leaderboard.find(m => m.user_id === currentUserId)?.user_name || 'User'}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── #65: Knockout Cup Bracket Component ──────────────────────────────────────

interface KnockoutSectionProps {
  knockouts: KnockoutSummary[];
  activeKnockout: Knockout | null;
  isCreator: boolean;
  knockoutOpen: boolean;
  setKnockoutOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  creatingKnockout: boolean;
  advancingRound: boolean;
  knockoutMsg: { type: 'ok' | 'err'; text: string } | null;
  onCreateKnockout: () => void;
  onAdvanceRound: () => void;
  onSelectKnockout: (koId: number) => void;
  currentUserId: number | null;
}

function KnockoutSection({
  knockouts, activeKnockout, isCreator, knockoutOpen, setKnockoutOpen,
  creatingKnockout, advancingRound, knockoutMsg,
  onCreateKnockout, onAdvanceRound, onSelectKnockout, currentUserId,
}: KnockoutSectionProps) {
  const hasActiveKnockout = knockouts.some(k => k.status === 'active');

  // Group matches by round
  const roundsMap = useMemo(() => {
    if (!activeKnockout?.matches) return new Map<number, KnockoutMatch[]>();
    const map = new Map<number, KnockoutMatch[]>();
    for (const m of activeKnockout.matches) {
      const arr = map.get(m.round) || [];
      arr.push(m);
      map.set(m.round, arr);
    }
    return map;
  }, [activeKnockout]);

  const totalRounds = activeKnockout?.total_rounds || 0;

  function getRoundLabel(round: number): string {
    if (round === totalRounds) return 'Final';
    if (round === totalRounds - 1) return 'Semi-Final';
    if (round === totalRounds - 2) return 'Quarter-Final';
    return `Round ${round}`;
  }

  return (
    <div className="mt-4 rounded-2xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(168,85,247,0.12)' }}>
      <button
        onClick={() => setKnockoutOpen((v: boolean) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-purple-400" />
          <h4 className="text-xs font-black uppercase tracking-wider text-purple-400">Knockout Cup</h4>
          {hasActiveKnockout && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400">ACTIVE</span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform ${knockoutOpen ? 'rotate-180' : ''}`} />
      </button>

      {knockoutOpen && (
        <div className="px-4 pb-4 space-y-3">
          {knockoutMsg && (
            <div className={`text-xs font-bold px-3 py-2 rounded-xl ${knockoutMsg.type === 'ok' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
              {knockoutMsg.text}
            </div>
          )}

          {/* Creator controls */}
          {isCreator && !hasActiveKnockout && (
            <button onClick={onCreateKnockout} disabled={creatingKnockout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-black disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#A855F7,#7C3AED)' }}>
              <Swords className="w-3.5 h-3.5" />
              {creatingKnockout ? 'Creating...' : 'Start Knockout Cup'}
            </button>
          )}

          {isCreator && activeKnockout && activeKnockout.status === 'active' && (
            <button onClick={onAdvanceRound} disabled={advancingRound}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60"
              style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}>
              {advancingRound ? 'Advancing...' : `Advance to ${getRoundLabel((activeKnockout.current_round || 1) + 1)}`}
            </button>
          )}

          {/* Knockout selector if multiple */}
          {knockouts.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {knockouts.map(ko => (
                <button key={ko.id}
                  onClick={() => onSelectKnockout(ko.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeKnockout?.id === ko.id
                      ? 'text-purple-300 bg-purple-500/15 border border-purple-500/30'
                      : 'text-gray-500 bg-white/5 border border-white/5 hover:text-gray-300'
                  }`}>
                  {ko.status === 'completed' ? 'Completed' : 'Active'} #{ko.id}
                </button>
              ))}
            </div>
          )}

          {/* Bracket display */}
          {activeKnockout && activeKnockout.matches.length > 0 ? (
            <div className="overflow-x-auto -mx-4 px-4">
              <div className="flex gap-6 min-w-max py-2">
                {Array.from({ length: totalRounds }, (_, i) => i + 1).map(round => {
                  const matches = roundsMap.get(round) || [];
                  return (
                    <div key={round} className="flex flex-col gap-3 min-w-[200px]">
                      <div className="text-[10px] font-black uppercase tracking-widest text-purple-400/60 text-center mb-1">
                        {getRoundLabel(round)}
                      </div>
                      {matches.length === 0 ? (
                        <div className="rounded-xl p-3 text-center"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                          <p className="text-gray-700 text-xs">Pending</p>
                        </div>
                      ) : (
                        matches.map(match => (
                          <KnockoutMatchCard key={match.id} match={match} currentUserId={currentUserId} />
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : knockouts.length === 0 ? (
            <div className="py-6 text-center">
              <Swords className="w-8 h-8 text-gray-800 mx-auto mb-2" />
              <p className="text-gray-600 text-sm font-bold">No knockout cups yet</p>
              {isCreator && (
                <p className="text-gray-700 text-xs mt-1">Create a knockout cup to start elimination rounds</p>
              )}
            </div>
          ) : null}

          {/* Completed winner banner */}
          {activeKnockout && activeKnockout.status === 'completed' && (() => {
            const finalMatch = activeKnockout.matches
              .filter(m => m.round === activeKnockout.total_rounds)
              .sort((a, b) => a.match_order - b.match_order)[0];
            if (!finalMatch?.winner_id) return null;
            const winnerName = finalMatch.winner_id === finalMatch.user1_id ? finalMatch.user1_name : finalMatch.user2_name;
            return (
              <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <Trophy className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-black text-amber-400 uppercase tracking-wider">Champion</p>
                  <p className="text-white font-bold text-sm">{winnerName}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// Individual knockout match card
function KnockoutMatchCard({ match, currentUserId }: { match: KnockoutMatch; currentUserId: number | null }) {
  const isBye = !match.user1_id || !match.user2_id;
  const isResolved = match.winner_id !== null;

  function playerRow(userId: number | null, userName: string, pts: number, isWinner: boolean) {
    const isCurrentUser = userId === currentUserId;
    return (
      <div className={`flex items-center justify-between gap-2 px-3 py-2 ${
        isWinner ? 'bg-green-500/8' : ''
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          {isWinner && <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />}
          <span className={`text-xs font-bold truncate ${
            !userId ? 'text-gray-700 italic' :
            isWinner ? 'text-green-400' :
            isCurrentUser ? 'text-amber-400' :
            'text-white'
          }`}>
            {userName}
          </span>
        </div>
        {isResolved && userId && (
          <span className={`text-xs font-bold flex-shrink-0 ${isWinner ? 'text-green-400' : 'text-gray-600'}`}>
            {pts}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${isResolved ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)'}` }}>
      {playerRow(match.user1_id, match.user1_name, Number(match.user1_pts), match.winner_id === match.user1_id)}
      <div className="border-t border-white/5" />
      {playerRow(match.user2_id, match.user2_name, Number(match.user2_pts), match.winner_id === match.user2_id)}
      {isBye && (
        <div className="px-3 py-1 text-center border-t border-white/5">
          <span className="text-[10px] text-gray-700 font-bold uppercase">BYE</span>
        </div>
      )}
    </div>
  );
}
