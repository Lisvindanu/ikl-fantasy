import type { AdminSectionProps } from './adminConstants';
import { getStatusConfig } from './adminConstants';
import { SeasonSettingsPanel } from './SeasonSettingsPanel';

export function SeasonSection({ season, players, matches, seasonMeta, allSeasons, selectedSeasonId, onSwitchSeason }: AdminSectionProps) {
  if (!season) return null;

  return (
    <div className="space-y-6">
      <SeasonSettingsPanel seasonId={season.id} initial={seasonMeta} />

      {/* Season info details */}
      <div className="rounded-2xl p-5" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Season Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', value: season.full_name },
            { label: 'Status', value: season.status },
            { label: 'Dates', value: season.dates },
            { label: 'Edition', value: season.edition },
            { label: 'Prize Pool', value: season.prize_pool },
            { label: 'Teams', value: String(season.teams?.length ?? 0) },
            { label: 'Players', value: String(players.length) },
            { label: 'Matches', value: String(matches.length) },
            { label: 'Champion', value: season.champion || '-' },
            { label: 'Runner Up', value: season.runner_up || '-' },
            { label: 'Regular MVP', value: season.regular_season_mvp || '-' },
            { label: 'Finals MVP', value: season.finals_mvp || '-' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{item.label}</span>
              <span className="text-sm font-bold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* All seasons list */}
      {allSeasons.length > 1 && (
        <div className="rounded-2xl p-5" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">All Seasons</h3>
          <div className="space-y-2">
            {allSeasons.map(s => {
              const cfg = getStatusConfig(s.status);
              const isCurrent = s.id === selectedSeasonId;
              return (
                <button
                  key={s.id}
                  onClick={() => onSwitchSeason(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${isCurrent ? 'ring-1 ring-amber-500/30' : 'hover:bg-white/3'}`}
                  style={{ background: isCurrent ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)' }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold ${isCurrent ? 'text-amber-400' : 'text-white'}`}>{s.full_name}</div>
                    <div className="text-[10px] text-gray-600">{s.dates} {s.champion ? `· Champion: ${s.champion}` : ''}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                    {cfg.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
