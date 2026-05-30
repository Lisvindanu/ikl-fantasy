import { Info, Trophy, Award, Users, Swords, CalendarDays, Globe, Layers } from 'lucide-react';
import type { AdminSectionProps } from './adminConstants';
import { getStatusConfig } from './adminConstants';
import { AdminPanel } from './shared';
import { SeasonSettingsPanel } from './SeasonSettingsPanel';
import { SeasonManagerPanel } from './SeasonManagerPanel';

/* ── Season detail row ───────────────────────────────────────────────────── */

function DetailRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 group">
      <span className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
        <span className="text-gray-600 group-hover:text-amber-500/60 transition-colors">{icon}</span>
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-200">{value}</span>
    </div>
  );
}

/* ── Detail items config ─────────────────────────────────────────────────── */

function buildDetails(
  season: NonNullable<AdminSectionProps['season']>,
  players: AdminSectionProps['players'],
  matches: AdminSectionProps['matches'],
) {
  return [
    { label: 'Full Name', value: season.full_name, icon: <Info className="w-3.5 h-3.5" /> },
    { label: 'Status', value: season.status, icon: <Layers className="w-3.5 h-3.5" /> },
    { label: 'Dates', value: season.dates, icon: <CalendarDays className="w-3.5 h-3.5" /> },
    { label: 'Edition', value: season.edition, icon: <Globe className="w-3.5 h-3.5" /> },
    { label: 'Prize Pool', value: season.prize_pool, icon: <Trophy className="w-3.5 h-3.5" /> },
    { label: 'Teams', value: String(season.teams?.length ?? 0), icon: <Users className="w-3.5 h-3.5" /> },
    { label: 'Players', value: String(players.length), icon: <Users className="w-3.5 h-3.5" /> },
    { label: 'Matches', value: String(matches.length), icon: <Swords className="w-3.5 h-3.5" /> },
    { label: 'Champion', value: season.champion || '-', icon: <Trophy className="w-3.5 h-3.5" /> },
    { label: 'Runner Up', value: season.runner_up || '-', icon: <Award className="w-3.5 h-3.5" /> },
    { label: 'Regular MVP', value: season.regular_season_mvp || '-', icon: <Award className="w-3.5 h-3.5" /> },
    { label: 'Finals MVP', value: season.finals_mvp || '-', icon: <Award className="w-3.5 h-3.5" /> },
  ];
}

/* ── Season selector button ──────────────────────────────────────────────── */

function SeasonButton({
  season,
  isCurrent,
  onSelect,
}: {
  season: AdminSectionProps['allSeasons'][number];
  isCurrent: boolean;
  onSelect: () => void;
}) {
  const cfg = getStatusConfig(season.status);

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
        ${isCurrent ? 'ring-1 ring-amber-500/30' : 'hover:bg-white/[0.03]'}`}
      style={{ background: isCurrent ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)' }}
    >
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-bold truncate ${isCurrent ? 'text-amber-400' : 'text-white'}`}>
          {season.full_name}
        </div>
        <div className="text-[10px] text-gray-600 truncate">
          {season.dates}
          {season.champion ? ` · Champion: ${season.champion}` : ''}
        </div>
      </div>
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
        style={{
          background: `${cfg.color}15`,
          color: cfg.color,
          border: `1px solid ${cfg.color}30`,
        }}
      >
        {cfg.label}
      </span>
    </button>
  );
}

/* ── Main section ────────────────────────────────────────────────────────── */

export function SeasonSection({
  season,
  players,
  matches,
  seasonMeta,
  allSeasons,
  selectedSeasonId,
  onSwitchSeason,
  onSetAllSeasons,
  onSetSelectedSeasonId,
  onRefreshMatches,
}: AdminSectionProps) {
  async function handleRefresh() {
    const { getSeasons } = await import('../../api/fantasy');
    const seasons = await getSeasons();
    onSetAllSeasons(seasons);
    if (seasons.length > 0) {
      const current = seasons.find(s => s.id === selectedSeasonId);
      if (!current) onSetSelectedSeasonId(seasons[0].id);
    }
    onRefreshMatches();
  }

  return (
    <div className="space-y-6">
      {/* Season Manager — create / clone / add teams & players */}
      <SeasonManagerPanel
        allSeasons={allSeasons}
        season={season}
        onRefresh={handleRefresh}
      />

      {season && (
        <>
          <SeasonSettingsPanel seasonId={season.id} initial={seasonMeta} />

          {/* Season details */}
          <AdminPanel>
            <div className="p-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-amber-500/60" />
                Season Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-x-6">
                {buildDetails(season, players, matches).map((item) => (
                  <DetailRow key={item.label} label={item.label} value={item.value} icon={item.icon} />
                ))}
              </div>
            </div>
          </AdminPanel>
        </>
      )}

      {/* All seasons list */}
      {allSeasons.length > 1 && (
        <AdminPanel>
          <div className="p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-amber-500/60" />
              All Seasons
            </h3>
            <div className="space-y-2">
              {allSeasons.map((s) => (
                <SeasonButton
                  key={s.id}
                  season={s}
                  isCurrent={s.id === selectedSeasonId}
                  onSelect={() => onSwitchSeason(s.id)}
                />
              ))}
            </div>
          </div>
        </AdminPanel>
      )}
    </div>
  );
}
