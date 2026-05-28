import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as fantasyApi from '../api/fantasy';
import { useFantasyData } from './fantasy/useFantasyData';
import { OnboardingTour } from '../components/fantasy/OnboardingTour';
import { FantasyLoadingSkeleton, FantasyNoSeason } from './fantasy/FantasyLoadingStates';
import { FantasyHeroBanner } from './fantasy/FantasyHeroBanner';
import { DesktopTabNav, MobileBottomNav } from './fantasy/FantasyTabNav';
import { ConfettiOverlay, UndoToast, PlayerDetailOverlay, ConfirmSaveDialog } from './fantasy/FantasyOverlays';
import { ModeSelector } from './fantasy/ModeSelector';
import { StandingsTab } from './fantasy/StandingsTab';
import { DraftTab } from './fantasy/DraftTab';
import { MobileDraftPage } from './fantasy/MobileDraftPage';
import { NotificationReminder } from '../components/fantasy/NotificationReminder';
import { PlayersTab } from './fantasy/PlayersTab';
import { LeaderboardTab } from './fantasy/LeaderboardTab';
import { MatchesTab } from './fantasy/MatchesTab';
import { TeamPickTab } from './fantasy/TeamPickTab';
import { LeaguesTab } from './fantasy/LeaguesTab';
import { PredictionsTab } from './fantasy/PredictionsTab';
import { AchievementsPanel } from './fantasy/AchievementsPanel';
import { CompareTab } from './fantasy/CompareTab';
import { MetaTab } from './fantasy/MetaTab';

const TOUR_STORAGE_KEY = 'ikl-fantasy-tour-done';

export function FantasyLeaguePage() {
  const data = useFantasyData();
  const [showTour, setShowTour] = useState(() => {
    try {
      return !localStorage.getItem(TOUR_STORAGE_KEY);
    } catch {
      return false;
    }
  });

  const handleTourComplete = () => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, '1');
    } catch {
      // localStorage unavailable — silently ignore
    }
    setShowTour(false);
  };

  const [streakToast, setStreakToast] = useState(false);

  useEffect(() => {
    if (data.loginStreak?.bonusAwarded && data.loginStreak.bonusAwarded > 0) {
      setStreakToast(true);
      const timer = setTimeout(() => setStreakToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [data.loginStreak]);

  if (data.loading) return <FantasyLoadingSkeleton />;
  if (!data.season) return <FantasyNoSeason />;

  const { season } = data;

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#07090f' }}>

      <AnimatePresence>
        {showTour && !data.spectateLeagueId && data.showModeSelector && (
          <OnboardingTour onComplete={handleTourComplete} />
        )}
      </AnimatePresence>

      <ConfettiOverlay show={data.showConfetti} />

      <AnimatePresence>
        {streakToast && data.loginStreak && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl border border-amber-500/30"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(124,58,237,0.15) 100%)', backdropFilter: 'blur(16px)' }}
          >
            <div className="flex items-center gap-3 text-white">
              <span className="text-2xl">&#x1F525;</span>
              <div>
                <div className="font-bold text-amber-400">
                  Day {data.loginStreak.streak} streak! +{data.loginStreak.bonusAwarded} credits bonus
                </div>
                <div className="text-xs text-gray-400">Keep logging in daily for more rewards</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <UndoToast
        show={data.showUndo}
        undoState={data.undoState}
        onUndo={data.restoreUndo}
      />

      <PlayerDetailOverlay
        player={data.detailPlayer}
        onClose={() => data.setDetailPlayer(null)}
        isPicked={data.detailPlayer ? data.pickedIds.has(data.detailPlayer.id) : false}
        canPick={data.detailPlayer
          ? !data.pickedIds.has(data.detailPlayer.id)
            && data.budgetLeft >= data.detailPlayer.price
            && (data.teamCounts[data.detailPlayer.team_short] || 0) < 2
            && (data.filledCount < 5 || data.benchPicks.some(b => !b))
          : false}
        onPick={() => { if (data.detailPlayer) { data.selectPlayer(data.detailPlayer); data.setDetailPlayer(null); } }}
        ownershipData={data.ownershipData}
        formData={data.formData}
      />

      <ConfirmSaveDialog
        show={data.showConfirmSave}
        onCancel={() => data.setShowConfirmSave(false)}
        onConfirm={data.handleConfirmSave}
        teamName={data.teamName}
        filledCount={data.filledCount}
        captainId={data.captainId}
      />

      <FantasyHeroBanner season={season} players={data.players} loginStreak={data.loginStreak} />

      {data.showModeSelector ? (
        <div className="container mx-auto px-4">
          <ModeSelector meta={data.seasonMeta} onSelect={data.handleModeSelect} />
        </div>
      ) : (
        <>
          <DesktopTabNav
            tab={data.tab}
            setTab={data.setTab}
            activeMode={data.activeMode}
            onBackToModeSelector={() => data.setShowModeSelector(true)}
          />

          <MobileBottomNav
            tab={data.tab}
            setTab={data.setTab}
            activeMode={data.activeMode}
          />

          <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
            <AnimatePresence mode="wait">

              {data.tab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <StandingsTab season={season} sortedByPts={data.sortedByPts} maxPts={data.maxPts} onDetail={data.setDetailPlayer} />
                </motion.div>
              )}

              {data.tab === 'draft' && (
                <motion.div key="draft" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {data.seasonMeta?.picks_lock_at && (
                    <div className="mb-4">
                      <NotificationReminder picksLockAt={data.seasonMeta.picks_lock_at} />
                    </div>
                  )}
                  <div className="lg:hidden">
                    <MobileDraftPage {...data.draftProps} />
                  </div>
                  <div className="hidden lg:block">
                    <DraftTab {...data.draftProps} />
                  </div>
                </motion.div>
              )}

              {data.tab === 'players' && (
                <motion.div key="players" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <PlayersTab
                    filteredPlayers={data.filteredPlayers}
                    search={data.search} setSearch={data.setSearch}
                    filterRole={data.filterRole} setFilterRole={data.setFilterRole}
                    sortBy={data.sortBy} setSortBy={data.setSortBy}
                    onDetail={data.setDetailPlayer}
                  />
                </motion.div>
              )}

              {data.tab === 'leaderboard' && (
                <motion.div key="lb" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <LeaderboardTab
                    leaderboard={data.leaderboard}
                    isAuthenticated={data.isAuthenticated}
                    onGoToDraft={() => data.setTab('draft')}
                  />
                </motion.div>
              )}

              {data.tab === 'matches' && (
                <motion.div key="matches" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <MatchesTab matches={data.matches} loading={false} seasonId={season?.id} />
                </motion.div>
              )}

              {data.tab === 'team' && (
                <motion.div key="team" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <TeamPickTab
                    season={season}
                    isAuthenticated={data.isAuthenticated}
                    mySelection={data.myTeamSelection}
                    leaderboard={data.teamLeaderboard}
                    onSelectionSaved={sel => {
                      data.setMyTeamSelection(sel);
                      fantasyApi.getTeamLeaderboard(season.id).then(lb => data.setTeamLeaderboard(Array.isArray(lb) ? lb : [])).catch(() => {});
                    }}
                    onGoToLogin={() => data.setTab('draft')}
                  />
                </motion.div>
              )}

              {data.tab === 'leagues' && (
                <motion.div key="leagues" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <LeaguesTab
                    seasonId={season.id}
                    isAuthenticated={data.isAuthenticated}
                    userId={data.user ? Number(data.user.id) : null}
                    onGoToLogin={() => { window.location.href = '/auth'; }}
                    spectateLeagueId={data.spectateLeagueId}
                  />
                </motion.div>
              )}

              {data.tab === 'predictions' && (
                <motion.div key="predictions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <PredictionsTab
                    seasonId={season.id}
                    matches={data.matches}
                    players={data.players}
                    isAuthenticated={data.isAuthenticated}
                  />
                </motion.div>
              )}

              {data.tab === 'meta' && (
                <motion.div key="meta" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <MetaTab seasonId={season.id} />
                </motion.div>
              )}

              {data.tab === 'compare' && (
                <motion.div key="compare" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <CompareTab
                    players={data.players}
                    onDetail={data.setDetailPlayer}
                  />
                </motion.div>
              )}

              {data.tab === 'achievements' && (
                <motion.div key="achievements" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <AchievementsPanel isAuthenticated={data.isAuthenticated} />
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
