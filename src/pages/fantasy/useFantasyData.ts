import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as fantasyApi from '../../api/fantasy';
import type {
  IKLSeason,
  IKLTeam,
  IKLPlayer,
  FantasyTeam,
  LeaderboardEntry,
  IKLMatch,
  SeasonMeta,
  PlayerOwnershipData,
  PlayerFormEntry,
  FantasyTeamSelection,
  TeamLeaderboardEntry,
  LoginStreakInfo,
} from '../../api/fantasy';
import { ROLES, BUDGET } from '../../components/fantasy/types';
import type { Role, SortBy } from '../../components/fantasy/types';

export interface UndoState {
  picks: Record<Role, IKLPlayer | null>;
  benchPicks: [IKLPlayer | null, IKLPlayer | null];
  teamName: string;
  captainId: number | null;
  viceCaptainId: number | null;
}

export function useFantasyData() {
  const { isAuthenticated, user } = useAuth();

  // Parse URL params for direct league spectating
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const spectateLeagueId = useMemo(() => {
    const raw = urlParams.get('league');
    const parsed = raw ? Number(raw) : null;
    return parsed && !Number.isNaN(parsed) ? parsed : null;
  }, [urlParams]);

  const [tab, setTab] = useState<
    'overview' | 'draft' | 'players' | 'leaderboard' | 'matches' | 'team' | 'leagues' | 'predictions' | 'achievements' | 'compare' | 'meta'
  >(spectateLeagueId ? 'leagues' : 'overview');
  const [allSeasons, setAllSeasons] = useState<IKLSeason[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const [season, setSeason] = useState<(IKLSeason & { teams: IKLTeam[] }) | null>(null);
  const [players, setPlayers] = useState<IKLPlayer[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [matches, setMatches] = useState<IKLMatch[]>([]);
  const [myTeamSelection, setMyTeamSelection] = useState<FantasyTeamSelection | null>(null);
  const [teamLeaderboard, setTeamLeaderboard] = useState<TeamLeaderboardEntry[]>([]);
  const [, setMyTeam] = useState<FantasyTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [seasonMeta, setSeasonMeta] = useState<SeasonMeta | null>(null);
  const [showModeSelector, setShowModeSelector] = useState(!spectateLeagueId);
  const [activeMode, setActiveMode] = useState<'player' | 'team' | 'both' | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [picks, setPicks] = useState<Record<Role, IKLPlayer | null>>({
    EXP: null, JGL: null, MID: null, GOLD: null, ROAM: null,
  });
  const [teamName, setTeamName] = useState('My Fantasy Team');
  const [activeRole, setActiveRole] = useState<Role>('EXP');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<Role | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('pts');
  const [detailPlayer, setDetailPlayer] = useState<IKLPlayer | null>(null);
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [viceCaptainId, setViceCaptainId] = useState<number | null>(null);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [ownershipData, setOwnershipData] = useState<PlayerOwnershipData | null>(null);
  const [formData, setFormData] = useState<PlayerFormEntry[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [benchPicks, setBenchPicks] = useState<[IKLPlayer | null, IKLPlayer | null]>([null, null]);
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [loginStreak, setLoginStreak] = useState<LoginStreakInfo | null>(null);

  // Load all seasons once
  useEffect(() => {
    fantasyApi.getSeasons().then(seasons => {
      setAllSeasons(seasons);
      if (seasons.length > 0) setSelectedSeasonId(seasons[0].id);
      else setLoading(false);
    }).catch(e => { console.error(e); setLoading(false); });
  }, []);

  // Load season data when selectedSeasonId or auth changes
  useEffect(() => {
    if (!selectedSeasonId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [s, p, lb, m, tlb, meta, own, frm] = await Promise.all([
          fantasyApi.getSeasonDetail(selectedSeasonId),
          fantasyApi.getPlayers(selectedSeasonId),
          fantasyApi.getLeaderboard(selectedSeasonId),
          fantasyApi.getMatches(selectedSeasonId),
          fantasyApi.getTeamLeaderboard(selectedSeasonId).catch(() => []),
          fantasyApi.getSeasonMeta(selectedSeasonId).catch(() => null),
          fantasyApi.getPlayerOwnership(selectedSeasonId).catch(() => null),
          fantasyApi.getPlayerForm(selectedSeasonId).catch(() => []),
        ]);
        if (cancelled) return;
        setSeason(s);
        setPlayers(Array.isArray(p) ? p : []);
        setLeaderboard(Array.isArray(lb?.entries) ? lb.entries : []);
        setMatches(Array.isArray(m) ? m : []);
        setTeamLeaderboard(Array.isArray(tlb) ? tlb : []);
        setSeasonMeta(meta);
        if (own) setOwnershipData(own);
        if (Array.isArray(frm)) setFormData(frm);

        // Reset draft state for fresh season load
        setPicks({ EXP: null, JGL: null, MID: null, GOLD: null, ROAM: null });
        setBenchPicks([null, null]);
        setTeamName('My Fantasy Team');
        setCaptainId(null);
        setViceCaptainId(null);
        setMyTeamSelection(null);

        if (isAuthenticated) {
          const [mt, mts] = await Promise.all([
            fantasyApi.getMyTeam(selectedSeasonId).catch(() => null),
            fantasyApi.getMyTeamSelection(selectedSeasonId).catch(() => null),
          ]);
          if (cancelled) return;
          if (mt?.picks?.length) {
            setMyTeam(mt);
            setTeamName(mt.name || 'My Fantasy Team');
            const newPicks: Record<Role, IKLPlayer | null> = { EXP: null, JGL: null, MID: null, GOLD: null, ROAM: null };
            const newBench: [IKLPlayer | null, IKLPlayer | null] = [null, null];
            for (const pick of mt.picks) {
              const full = (Array.isArray(p) ? p : []).find(pl => pl.id === pick.player_id);
              if (pick.is_bench && full) {
                const idx = (pick.bench_order || 1) - 1;
                if (idx >= 0 && idx < 2) newBench[idx] = full;
              } else if (full) {
                newPicks[pick.role as Role] = full;
              }
              if (pick.is_captain) setCaptainId(pick.player_id);
              if (pick.is_vice_captain) setViceCaptainId(pick.player_id);
            }
            setPicks(newPicks);
            setBenchPicks(newBench);
          }
          setMyTeamSelection(mts);
        }
      } catch (e) { console.error('Fantasy data load error:', e); }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [selectedSeasonId, isAuthenticated]);

  // #119: Record daily login streak when authenticated (once per session)
  useEffect(() => {
    if (!isAuthenticated) return;
    const key = 'ikl_streak_recorded';
    if (sessionStorage.getItem(key)) {
      // Already recorded this session — just fetch current streak
      fantasyApi.getLoginStreak().then(r => {
        if (r) setLoginStreak({ ...r, bonusAwarded: 0, isNewDay: false });
      }).catch(() => {});
      return;
    }
    fantasyApi.recordLoginStreak().then(r => {
      if (r) {
        setLoginStreak(r);
        try { sessionStorage.setItem(key, '1'); } catch { /* ignore */ }
      }
    }).catch(() => {});
  }, [isAuthenticated]);

  const pickedIds = useMemo(() => {
    const ids = new Set(Object.values(picks).filter(Boolean).map(p => p!.id));
    benchPicks.forEach(p => { if (p) ids.add(p.id); });
    return ids;
  }, [picks, benchPicks]);

  const budget = useMemo(() => {
    let total = Object.values(picks).reduce((s, p) => s + (p?.price ?? 0), 0);
    benchPicks.forEach(p => { total += p?.price ?? 0; });
    return total;
  }, [picks, benchPicks]);

  const totalPts = useMemo(
    () => Object.values(picks).reduce((s, p) => s + (p?.fantasy_pts ?? 0), 0),
    [picks],
  );

  const budgetLeft = BUDGET - budget;
  const filledCount = Object.values(picks).filter(Boolean).length;

  const teamCounts = useMemo(() => {
    const c: Record<string, number> = {};
    Object.values(picks).forEach(p => { if (p) c[p.team_short] = (c[p.team_short] || 0) + 1; });
    benchPicks.forEach(p => { if (p) c[p.team_short] = (c[p.team_short] || 0) + 1; });
    return c;
  }, [picks, benchPicks]);

  const filteredPlayers = useMemo(() => players
    .filter(p => {
      if (filterRole !== 'ALL' && p.role !== filterRole) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.team_short.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) =>
      sortBy === 'pts' ? b.fantasy_pts - a.fantasy_pts :
      sortBy === 'price' ? b.price - a.price :
      b.mvps - a.mvps
    ), [players, filterRole, search, sortBy]);

  const roleCounts = useMemo(() => {
    const c: Record<string, number> = { ALL: players.length };
    players.forEach(p => { c[p.role] = (c[p.role] || 0) + 1; });
    return c;
  }, [players]);

  function selectPlayer(player: IKLPlayer) {
    if (pickedIds.has(player.id)) {
      const benchIdx = benchPicks.findIndex(p => p?.id === player.id);
      if (benchIdx >= 0) {
        setBenchPicks(prev => { const n = [...prev] as [IKLPlayer | null, IKLPlayer | null]; n[benchIdx] = null; return n; });
        return;
      }
      const role = Object.entries(picks).find(([, p]) => p?.id === player.id)?.[0] as Role;
      if (role) setPicks(prev => ({ ...prev, [role]: null }));
      return;
    }
    if (budgetLeft < player.price) return;
    if ((teamCounts[player.team_short] || 0) >= 2) return;
    const targetRole =
      (picks[activeRole] === null ? activeRole : null) ??
      (picks[player.role as Role] === null ? player.role as Role : null) ??
      (ROLES.find(r => picks[r] === null) ?? null);
    if (targetRole) {
      setPicks(prev => ({ ...prev, [targetRole]: player }));
      return;
    }
    if (!benchPicks[0]) {
      setBenchPicks(prev => [player, prev[1]]);
    } else if (!benchPicks[1]) {
      setBenchPicks(prev => [prev[0], player]);
    }
  }

  function handleSaveClick() {
    if (!isAuthenticated || !season) return;
    if (filledCount !== 5) { setSaveMsg('Fill all 5 slots first'); return; }
    setShowConfirmSave(true);
  }

  async function handleConfirmSave() {
    if (!isAuthenticated || !season) return;
    setShowConfirmSave(false);
    setSaving(true);
    setSaveMsg('');
    setUndoState({ picks: { ...picks }, benchPicks: [...benchPicks] as [IKLPlayer | null, IKLPlayer | null], teamName, captainId, viceCaptainId });
    setSaveMsg('Team saved!');
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    setShowUndo(true);
    setTimeout(() => setShowUndo(false), 5000);
    try {
      const pickPayload = ROLES.filter(r => picks[r]).map(r => ({ playerId: picks[r]!.id, role: r }));
      const benchPayload = benchPicks
        .filter((p): p is IKLPlayer => p !== null)
        .map(p => ({ playerId: p.id, role: p.role }));
      await fantasyApi.saveMyTeam(season.id, teamName, pickPayload, {
        captainId: captainId ?? undefined,
        viceCaptainId: viceCaptainId ?? undefined,
        benchPicks: benchPayload.length > 0 ? benchPayload : undefined,
      });
      const [mt, lb] = await Promise.all([
        fantasyApi.getMyTeam(season.id),
        fantasyApi.getLeaderboard(season.id).catch(() => null),
      ]);
      setMyTeam(mt);
      if (lb?.entries) setLeaderboard(lb.entries);
    } catch (e: unknown) {
      if (undoState) {
        setPicks(undoState.picks);
        setBenchPicks(undoState.benchPicks);
        setTeamName(undoState.teamName);
        setCaptainId(undoState.captainId);
        setViceCaptainId(undoState.viceCaptainId);
      }
      setShowConfetti(false);
      setShowUndo(false);
      const msg = e instanceof Error ? e.message : 'Failed to save';
      if (msg.includes('Budget exceeded')) setSaveMsg('Budget exceeded! Remove an expensive player and try again.');
      else if (msg.includes('locked')) setSaveMsg('Season is locked -- picks are closed. Better luck next season!');
      else if (msg.includes('full')) setSaveMsg('Season is full -- no more spots available.');
      else if (msg.includes('Max')) setSaveMsg('Too many players from the same team. Max 2 per team allowed.');
      else setSaveMsg(msg);
    }
    setSaving(false);
  }

  function handleModeSelect(m: 'player' | 'team' | 'both') {
    setActiveMode(m);
    setShowModeSelector(false);
    setTab(m === 'team' ? 'team' : 'draft');
  }

  function restoreUndo() {
    if (!undoState) return;
    setPicks(undoState.picks);
    setBenchPicks(undoState.benchPicks);
    setTeamName(undoState.teamName);
    setCaptainId(undoState.captainId);
    setViceCaptainId(undoState.viceCaptainId);
    setShowUndo(false);
    setSaveMsg('Lineup restored to previous state');
  }

  const sortedByPts = useMemo(
    () => [...players].sort((a, b) => b.fantasy_pts - a.fantasy_pts),
    [players],
  );
  const maxPts = sortedByPts[0]?.fantasy_pts || 1;

  const userRank = useMemo(() => {
    if (!user || !leaderboard.length) return null;
    const idx = leaderboard.findIndex(e => e.user_id === Number(user.id));
    return idx >= 0 ? idx + 1 : null;
  }, [leaderboard, user]);

  function switchSeason(id: number) {
    setSelectedSeasonId(id);
  }

  const draftProps = {
    picks, setPicks,
    activeRole, setActiveRole,
    search, setSearch,
    filterRole, setFilterRole,
    sortBy, setSortBy,
    teamName, setTeamName,
    saving, saveMsg,
    onSave: handleSaveClick,
    onDetail: setDetailPlayer,
    isAuthenticated,
    budget, budgetLeft, totalPts, filledCount,
    pickedIds, teamCounts, filteredPlayers, roleCounts,
    selectPlayer,
    captainId, viceCaptainId, setCaptainId, setViceCaptainId,
    benchPicks, setBenchPicks,
  };

  return {
    // Auth
    isAuthenticated, user,
    // Core data
    season, players, leaderboard, matches, seasonMeta,
    myTeamSelection, setMyTeamSelection, teamLeaderboard, setTeamLeaderboard,
    loading,
    // Season switcher
    allSeasons, selectedSeasonId, switchSeason, userRank,
    // Tab / mode
    tab, setTab, showModeSelector, setShowModeSelector, activeMode, handleModeSelect,
    // Draft state
    picks, setPicks, teamName, setTeamName, saving, saveMsg,
    detailPlayer, setDetailPlayer,
    captainId, setCaptainId, viceCaptainId, setViceCaptainId,
    benchPicks, setBenchPicks,
    budget, budgetLeft, totalPts, filledCount, pickedIds, teamCounts,
    filteredPlayers, roleCounts, selectPlayer,
    search, setSearch, filterRole, setFilterRole, sortBy, setSortBy,
    activeRole, setActiveRole,
    // Save
    showConfirmSave, setShowConfirmSave, handleConfirmSave, handleSaveClick,
    // Overlays
    showConfetti, showUndo, undoState, restoreUndo,
    ownershipData, formData,
    // Derived
    sortedByPts, maxPts,
    draftProps,
    // Spectator
    spectateLeagueId,
    // Login streak (#119)
    loginStreak,
  };
}
