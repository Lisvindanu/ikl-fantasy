import { Trophy } from 'lucide-react';

export function FantasyLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#07090f] px-4 py-12">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Skeleton header */}
        <div className="space-y-3">
          <div className="h-4 w-24 rounded-full bg-white/5 animate-pulse" />
          <div className="h-12 w-64 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-4 w-48 rounded-full bg-white/5 animate-pulse" />
        </div>
        {/* Skeleton cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-4 space-y-3" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse mx-auto" />
              <div className="h-3 w-20 rounded-full bg-white/5 animate-pulse mx-auto" />
              <div className="h-3 w-16 rounded-full bg-white/5 animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FantasyNoSeason() {
  return (
    <div className="min-h-screen bg-[#07090f] flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="relative">
        <Trophy className="w-20 h-20 text-amber-500/20" />
        <div className="absolute inset-0 animate-ping">
          <Trophy className="w-20 h-20 text-amber-500/10" />
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-black text-white mb-2">Fantasy League Coming Soon</h2>
        <p className="text-gray-500 max-w-md leading-relaxed">
          Season data is being prepared. Once the next IKL season starts,
          you'll be able to draft players, pick teams, and compete on the leaderboard.
        </p>
      </div>
      <button onClick={() => window.location.reload()}
        className="px-6 py-3 rounded-xl text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
        Refresh Page
      </button>
    </div>
  );
}
