import { useState, useEffect, useMemo } from 'react';
import { Users, Plus, Key, Trophy, Globe, Shield, ChevronDown, ChevronUp, UserPlus } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { FantasyLeague } from '../../api/fantasy';
import { LeagueDetail } from './LeagueDetail';
import { LeagueCard } from './LeagueCard';
import { FriendsSection } from './FriendsSection';

interface Props {
  seasonId: number;
  isAuthenticated: boolean;
  userId: number | null;
  onGoToLogin: () => void;
  spectateLeagueId?: number | null;
}

export function LeaguesTab({ seasonId, isAuthenticated, userId, onGoToLogin, spectateLeagueId }: Props) {
  const [myLeagues, setMyLeagues] = useState<FantasyLeague[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeLeagueId, setActiveLeagueId] = useState<number | null>(spectateLeagueId ?? null);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createMax, setCreateMax] = useState(50);
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState('');

  // Join form
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinErr, setJoinErr] = useState('');

  // Public leagues (#59)
  const [publicLeagues, setPublicLeagues] = useState<FantasyLeague[]>([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [showPublic, setShowPublic] = useState(true);
  const [joiningPublicId, setJoiningPublicId] = useState<number | null>(null);
  const [publicMsg, setPublicMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Team-fan leagues (#60)
  const [teamFanLeagues, setTeamFanLeagues] = useState<FantasyLeague[]>([]);
  const [teamFanLoading, setTeamFanLoading] = useState(false);
  const [showTeamFan, setShowTeamFan] = useState(true);
  const [joiningFanId, setJoiningFanId] = useState<number | null>(null);
  const [fanMsg, setFanMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Friends (#68)
  const [showFriends, setShowFriends] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    fantasyApi.getMyLeagues(seasonId).then(data => {
      setMyLeagues(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [seasonId, isAuthenticated]);

  // Fetch public + team-fan leagues (no auth needed)
  useEffect(() => {
    setPublicLoading(true);
    setTeamFanLoading(true);
    fantasyApi.getPublicLeagues(seasonId)
      .then(data => setPublicLeagues(Array.isArray(data) ? data : []))
      .catch(() => setPublicLeagues([]))
      .finally(() => setPublicLoading(false));
    fantasyApi.getTeamFanLeagues(seasonId)
      .then(data => setTeamFanLeagues(Array.isArray(data) ? data : []))
      .catch(() => setTeamFanLeagues([]))
      .finally(() => setTeamFanLoading(false));
  }, [seasonId]);

  // Group public leagues by region
  const publicByRegion = useMemo(() => {
    const groups: Record<string, FantasyLeague[]> = {};
    for (const league of publicLeagues) {
      const region = league.region || 'Global';
      if (!groups[region]) groups[region] = [];
      groups[region].push(league);
    }
    return groups;
  }, [publicLeagues]);

  // Set of league IDs user is already a member of
  const myLeagueIds = useMemo(() => new Set(myLeagues.map(l => l.id)), [myLeagues]);

  async function handleJoinPublic(leagueId: number) {
    if (!isAuthenticated) { onGoToLogin(); return; }
    setJoiningPublicId(leagueId);
    setPublicMsg(null);
    try {
      await fantasyApi.joinPublicLeague(leagueId);
      setPublicMsg({ type: 'ok', text: 'Berhasil bergabung!' });
      // Refresh data
      const [updated, pub] = await Promise.all([
        fantasyApi.getMyLeagues(seasonId),
        fantasyApi.getPublicLeagues(seasonId),
      ]);
      setMyLeagues(updated);
      setPublicLeagues(pub);
    } catch (e: unknown) {
      setPublicMsg({ type: 'err', text: e instanceof Error ? e.message : 'Gagal bergabung' });
    }
    setJoiningPublicId(null);
  }

  async function handleJoinFan(leagueId: number) {
    if (!isAuthenticated) { onGoToLogin(); return; }
    setJoiningFanId(leagueId);
    setFanMsg(null);
    try {
      await fantasyApi.joinPublicLeague(leagueId);
      setFanMsg({ type: 'ok', text: 'Berhasil bergabung!' });
      const [updated, fan] = await Promise.all([
        fantasyApi.getMyLeagues(seasonId),
        fantasyApi.getTeamFanLeagues(seasonId),
      ]);
      setMyLeagues(updated);
      setTeamFanLeagues(fan);
    } catch (e: unknown) {
      setFanMsg({ type: 'err', text: e instanceof Error ? e.message : 'Gagal bergabung' });
    }
    setJoiningFanId(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) { setCreateErr('Name required'); return; }
    setCreating(true);
    setCreateErr('');
    try {
      const league = await fantasyApi.createLeague(seasonId, createName.trim(), createMax);
      setMyLeagues(prev => [{ ...league, member_count: 1 }, ...prev]);
      setShowCreate(false);
      setCreateName('');
      setActiveLeagueId(league.id);
    } catch (e: unknown) { setCreateErr(e instanceof Error ? e.message : 'Failed'); }
    setCreating(false);
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) { setJoinErr('Enter invite code'); return; }
    setJoining(true);
    setJoinErr('');
    try {
      const league = await fantasyApi.joinLeague(joinCode.trim());
      const updated = await fantasyApi.getMyLeagues(seasonId);
      setMyLeagues(updated);
      setShowJoin(false);
      setJoinCode('');
      setActiveLeagueId(league.id);
    } catch (e: unknown) { setJoinErr(e instanceof Error ? e.message : 'Failed to join'); }
    setJoining(false);
  }

  async function handleDeleteLeague(leagueId: number) {
    try {
      await fantasyApi.deleteLeague(leagueId);
      setMyLeagues(prev => prev.filter(l => l.id !== leagueId));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to delete league');
    }
  }

  async function handleLeaveLeague(leagueId: number) {
    try {
      await fantasyApi.leaveLeague(leagueId);
      setMyLeagues(prev => prev.filter(l => l.id !== leagueId));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to leave league');
    }
  }

  if (activeLeagueId !== null) {
    return (
      <LeagueDetail
        leagueId={activeLeagueId}
        onBack={() => setActiveLeagueId(null)}
        currentUserId={userId}
        isAuthenticated={isAuthenticated}
        onGoToLogin={onGoToLogin}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Login prompt */}
        <div className="py-10 text-center mb-6">
          <Users className="w-14 h-14 text-gray-800 mx-auto mb-4" />
          <h3 className="text-white font-black text-xl mb-2">Login untuk buat liga privat</h3>
          <p className="text-gray-500 text-sm mb-6">Compete dengan teman-teman kamu di liga eksklusif</p>
          <button onClick={onGoToLogin}
            className="px-6 py-3 rounded-xl font-bold text-sm text-black"
            style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
            Login sekarang
          </button>
        </div>

        {/* Public leagues (visible without login) */}
        <div className="mb-6">
          <button onClick={() => setShowPublic(v => !v)}
            className="w-full text-xs font-black uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            Liga Publik ({publicLeagues.length})
            {showPublic ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
          </button>
          {showPublic && (
            publicLoading ? (
              <div className="py-6 flex justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              </div>
            ) : publicLeagues.length === 0 ? (
              <div className="rounded-2xl p-6 text-center"
                style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Globe className="w-8 h-8 text-gray-800 mx-auto mb-2" />
                <p className="text-gray-500 font-bold text-sm">Belum ada liga publik</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(publicByRegion).map(([region, leagues]) => (
                  <div key={region}>
                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-400/60 mb-2 pl-1">{region}</div>
                    <div className="space-y-2">
                      {leagues.map(league => (
                        <div key={league.id} className="rounded-2xl p-4"
                          style={{ background: '#0d1017', border: '1px solid rgba(59,130,246,0.12)' }}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                              <Globe className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-black text-white text-sm">{league.name}</div>
                              <div className="text-gray-600 text-xs mt-0.5">
                                {league.member_count} / {league.max_members} members
                                {league.region && (
                                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400">{league.region}</span>
                                )}
                              </div>
                            </div>
                            <button onClick={onGoToLogin}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                              style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }}>
                              Login to Join
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Team fan leagues (visible without login) */}
        <div className="mb-6">
          <button onClick={() => setShowTeamFan(v => !v)}
            className="w-full text-xs font-black uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            Team Fan Leagues ({teamFanLeagues.length})
            {showTeamFan ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
          </button>
          {showTeamFan && (
            teamFanLoading ? (
              <div className="py-6 flex justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
              </div>
            ) : teamFanLeagues.length === 0 ? (
              <div className="rounded-2xl p-6 text-center"
                style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Shield className="w-8 h-8 text-gray-800 mx-auto mb-2" />
                <p className="text-gray-500 font-bold text-sm">Belum ada team fan league</p>
              </div>
            ) : (
              <div className="space-y-2">
                {teamFanLeagues.map(league => {
                  const teamColor = league.team_color || '#888';
                  return (
                    <div key={league.id} className="rounded-2xl p-4"
                      style={{ background: '#0d1017', border: `1px solid ${teamColor}33` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xs"
                          style={{ background: `${teamColor}20`, border: `1px solid ${teamColor}40`, color: teamColor }}>
                          {league.team_short || 'TM'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-white text-sm">{league.name}</div>
                          <div className="text-gray-600 text-xs mt-0.5 flex items-center gap-2">
                            {league.member_count} / {league.max_members} fans
                            {league.team_name && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                                style={{ background: `${teamColor}15`, color: teamColor }}>
                                {league.team_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <button onClick={onGoToLogin}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                          style={{ background: `${teamColor}30`, border: `1px solid ${teamColor}50` }}>
                          Login to Join
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Explanation banner — dismissable */}
      <div className="rounded-2xl px-4 py-3 mb-5 flex items-start gap-3"
        style={{ background: '#0d1017', border: '1px solid rgba(245,158,11,0.15)' }}>
        <Users className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-gray-300 font-bold">Liga = leaderboard privat</p>
          <p className="text-xs text-gray-500 mt-0.5">Buat liga, undang teman pakai kode, dan lihat siapa yang paling jago di antara kalian.</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => { setShowCreate(v => !v); setShowJoin(false); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black"
          style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
          <Plus className="w-4 h-4" /> Buat Liga Baru
        </button>
        <button onClick={() => { setShowJoin(v => !v); setShowCreate(false); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Key className="w-4 h-4" /> Punya Kode?
        </button>
      </div>

      {/* Create form — with clear purpose */}
      {showCreate && (
        <form onSubmit={handleCreate} className="rounded-2xl p-5 mb-5 space-y-3"
          style={{ background: '#0d1017', border: '1px solid rgba(245,158,11,0.2)' }}>
          <h4 className="text-sm font-black text-white">Buat Liga Baru</h4>
          <p className="text-xs text-gray-500">Liga privat = ranking khusus kamu & teman-temanmu. Setelah dibuat, kamu akan dapat kode undangan untuk dishare.</p>
          <input value={createName} onChange={e => setCreateName(e.target.value)}
            placeholder="Nama liga (contoh: Geng ML, Kantor FC)"
            className="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none"
            style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.1)' }} />
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500 font-bold flex-shrink-0">Max anggota</label>
            <input type="number" min={2} max={200} value={createMax}
              onChange={e => setCreateMax(Number(e.target.value))}
              className="w-20 px-3 py-2 rounded-xl text-white text-sm text-center outline-none"
              style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          {createErr && <p className="text-red-400 text-xs">{createErr}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={creating}
              className="px-5 py-2 rounded-xl font-bold text-sm text-black disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
              {creating ? 'Membuat...' : 'Buat Liga'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:text-white transition-colors">
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Join form */}
      {showJoin && (
        <form onSubmit={handleJoin} className="rounded-2xl p-5 mb-5 space-y-3"
          style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 className="text-sm font-black text-white">Masuk dengan Kode Undangan</h4>
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="XXXX XXXX"
            maxLength={8}
            className="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none tracking-[0.3em] font-bold uppercase"
            style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.1)' }} />
          {joinErr && <p className="text-red-400 text-xs">{joinErr}</p>}
          <button type="submit" disabled={joining}
            className="px-5 py-2 rounded-xl font-bold text-sm text-white disabled:opacity-60"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            {joining ? 'Bergabung...' : 'Masuk Liga'}
          </button>
        </form>
      )}

      {/* ── #59: Public Leagues ───────────────────────────────────────── */}
      <div className="mb-6">
        <button onClick={() => setShowPublic(v => !v)}
          className="w-full text-xs font-black uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          Liga Publik ({publicLeagues.length})
          {showPublic ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
        </button>

        {publicMsg && (
          <div className={`text-xs font-bold px-3 py-2 rounded-xl mb-3 ${publicMsg.type === 'ok' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {publicMsg.text}
          </div>
        )}

        {showPublic && (
          publicLoading ? (
            <div className="py-6 flex justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
          ) : publicLeagues.length === 0 ? (
            <div className="rounded-2xl p-6 text-center"
              style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Globe className="w-8 h-8 text-gray-800 mx-auto mb-2" />
              <p className="text-gray-500 font-bold text-sm">Belum ada liga publik</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(publicByRegion).map(([region, leagues]) => (
                <div key={region}>
                  <div className="text-[10px] font-black uppercase tracking-widest text-blue-400/60 mb-2 pl-1">
                    {region}
                  </div>
                  <div className="space-y-2">
                    {leagues.map(league => {
                      const isMember = myLeagueIds.has(league.id);
                      const isFull = league.member_count >= league.max_members;
                      return (
                        <div key={league.id} className="rounded-2xl p-4 transition-all"
                          style={{ background: '#0d1017', border: '1px solid rgba(59,130,246,0.12)' }}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                              <Globe className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-black text-white text-sm">{league.name}</div>
                              <div className="text-gray-600 text-xs mt-0.5">
                                {league.member_count} / {league.max_members} members
                                {league.region && (
                                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400">
                                    {league.region}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isMember ? (
                              <button onClick={() => setActiveLeagueId(league.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-green-400"
                                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                Joined
                              </button>
                            ) : (
                              <button
                                onClick={() => handleJoinPublic(league.id)}
                                disabled={isFull || joiningPublicId === league.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-40"
                                style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }}>
                                {joiningPublicId === league.id ? 'Joining...' : isFull ? 'Full' : 'Join'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* ── #60: Team Fan Leagues ──────────────────────────────────────── */}
      <div className="mb-6">
        <button onClick={() => setShowTeamFan(v => !v)}
          className="w-full text-xs font-black uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          Team Fan Leagues ({teamFanLeagues.length})
          {showTeamFan ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
        </button>

        {fanMsg && (
          <div className={`text-xs font-bold px-3 py-2 rounded-xl mb-3 ${fanMsg.type === 'ok' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {fanMsg.text}
          </div>
        )}

        {showTeamFan && (
          teamFanLoading ? (
            <div className="py-6 flex justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
          ) : teamFanLeagues.length === 0 ? (
            <div className="rounded-2xl p-6 text-center"
              style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Shield className="w-8 h-8 text-gray-800 mx-auto mb-2" />
              <p className="text-gray-500 font-bold text-sm">Belum ada team fan league</p>
            </div>
          ) : (
            <div className="space-y-2">
              {teamFanLeagues.map(league => {
                const isMember = myLeagueIds.has(league.id);
                const isFull = league.member_count >= league.max_members;
                const teamColor = league.team_color || '#888';
                return (
                  <div key={league.id} className="rounded-2xl p-4 transition-all"
                    style={{ background: '#0d1017', border: `1px solid ${teamColor}33` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xs"
                        style={{ background: `${teamColor}20`, border: `1px solid ${teamColor}40`, color: teamColor }}>
                        {league.team_short || 'TM'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-white text-sm">{league.name}</div>
                        <div className="text-gray-600 text-xs mt-0.5 flex items-center gap-2">
                          {league.member_count} / {league.max_members} fans
                          {league.team_name && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                              style={{ background: `${teamColor}15`, color: teamColor }}>
                              {league.team_name}
                            </span>
                          )}
                        </div>
                      </div>
                      {isMember ? (
                        <button onClick={() => setActiveLeagueId(league.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-green-400"
                          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                          Joined
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinFan(league.id)}
                          disabled={isFull || joiningFanId === league.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-40"
                          style={{ background: `${teamColor}30`, border: `1px solid ${teamColor}50` }}>
                          {joiningFanId === league.id ? 'Joining...' : isFull ? 'Full' : 'Join'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* #68: Friends Section */}
      <div className="mb-6">
        <button onClick={() => setShowFriends(v => !v)}
          className="w-full text-xs font-black uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
          <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
          Friends
          {showFriends ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
        </button>
        {showFriends && userId && (
          <FriendsSection userId={userId} />
        )}
      </div>

      {/* My leagues list */}
      <h2 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-2">
        <Trophy className="w-3.5 h-3.5 text-amber-400" />
        Liga Saya ({myLeagues.length})
      </h2>

      {loading ? (
        <div className="py-10 flex justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        </div>
      ) : myLeagues.length === 0 ? (
        <div className="rounded-2xl p-10 text-center"
          style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Users className="w-10 h-10 text-gray-800 mx-auto mb-3" />
          <p className="text-gray-500 font-bold text-sm">Belum ada liga</p>
          <p className="text-gray-700 text-xs mt-1">Buat liga baru atau minta kode undangan dari teman</p>
        </div>
      ) : (
        <div className="space-y-2">
          {myLeagues.map(league => (
            <LeagueCard
              key={league.id}
              league={league}
              onOpen={() => setActiveLeagueId(league.id)}
              currentUserId={userId}
              onDelete={handleDeleteLeague}
              onLeave={handleLeaveLeague}
            />
          ))}
        </div>
      )}
    </div>
  );
}
