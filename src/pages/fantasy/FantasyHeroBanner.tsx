import { Flame } from 'lucide-react';
import type { IKLSeason, IKLTeam, IKLPlayer, LoginStreakInfo } from '../../api/fantasy';

interface FantasyHeroBannerProps {
  season: IKLSeason & { teams: IKLTeam[] };
  players: IKLPlayer[];
  loginStreak?: LoginStreakInfo | null;
}

export function FantasyHeroBanner({ season, players, loginStreak }: FantasyHeroBannerProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 left-0 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="absolute inset-0 opacity-4"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="container mx-auto px-4 pt-8 pb-6 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.35)' }}>
                <Flame className="w-3 h-3" /> {season.edition}
              </span>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                season.status === 'active'
                  ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                  : 'bg-white/6 text-gray-500 border border-white/10'
              }`}>
                {season.status === 'active' ? '\u25CF LIVE' : 'COMPLETED'}
              </span>
              {loginStreak && loginStreak.streak > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.35)' }}
                  title={`Longest streak: ${loginStreak.longestStreak} days | Total bonus: ${loginStreak.totalBonus} credits`}>
                  <Flame className="w-3 h-3" /> {loginStreak.streak} day streak
                </span>
              )}
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none"
              style={{ background: 'linear-gradient(135deg,#FBBF24 0%,#F59E0B 40%,#D97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              IKL Fantasy
            </h1>
            <p className="text-gray-400 mt-2 font-medium">{season.full_name}</p>
            <p className="text-gray-600 text-sm">{season.dates}</p>
          </div>

          <div className="flex gap-8">
            {[
              { label: 'Teams',   value: season.teams?.length ?? 10 },
              { label: 'Players', value: players.length },
              { label: 'Prize',   value: season.prize_pool },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-black text-amber-400">{value}</div>
                <div className="text-gray-600 text-xs uppercase tracking-widest mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
