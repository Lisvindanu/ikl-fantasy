import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import type { LeaderboardEntry } from '../../api/fantasy';

function CountUp({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target <= 0) { setVal(target); return; }
    const dur = 800;
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / dur, 1);
      setVal(Math.round(p * target));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target]);
  return <>{val}</>;
}

interface Props {
  leaderboard: LeaderboardEntry[];
  isAuthenticated: boolean;
  onGoToDraft: () => void;
}

export function LeaderboardTab({ leaderboard, isAuthenticated, onGoToDraft }: Props) {
  return (
    <div className="max-w-lg mx-auto space-y-5">
      {leaderboard.length === 0 ? (
        <div className="py-20 text-center rounded-2xl"
          style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Users className="w-12 h-12 text-gray-800 mx-auto mb-3" />
          <p className="text-gray-500 font-bold mb-1">No teams yet</p>
          <p className="text-gray-700 text-sm mb-6">Be the first to draft your lineup!</p>
          <button
            onClick={onGoToDraft}
            className="px-7 py-3 rounded-xl text-sm font-black"
            style={{ background: 'linear-gradient(90deg,#F59E0B,#D97706)', color: '#000' }}>
            Draft Your Team
          </button>
        </div>
      ) : (
        <>
          {/* Podium — top 3 */}
          {leaderboard.length >= 1 && (
            <div className="relative">
              <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 60% 30% at 50% 80%, #F59E0B, transparent)', filter: 'blur(30px)' }} />

              <div className="relative flex items-end justify-center gap-3 px-4 pt-4">
                {/* 2nd */}
                {leaderboard[1] && (
                  <div className="flex-1 flex flex-col items-center">
                    <div className="text-2xl mb-1">🥈</div>
                    <div className="font-bold text-white text-xs text-center truncate w-full">{leaderboard[1].user_name}</div>
                    <div className="text-gray-600 text-xs text-center truncate w-full mb-2">{leaderboard[1].team_name}</div>
                    <div className="w-full h-24 rounded-t-xl flex items-center justify-center"
                      style={{ background: 'rgba(156,163,175,0.1)', border: '1px solid rgba(156,163,175,0.25)', borderBottom: 'none' }}>
                      <div className="text-center">
                        <div className="text-xl font-black text-gray-300"><CountUp target={leaderboard[1].total_pts} /></div>
                        <div className="text-gray-600 text-xs">pts</div>
                      </div>
                    </div>
                    <div className="w-full py-1.5 text-center text-xs font-black text-gray-400 rounded-b-xl"
                      style={{ background: 'rgba(156,163,175,0.15)' }}>#2</div>
                  </div>
                )}
                {/* 1st */}
                {leaderboard[0] && (
                  <div className="flex-1 flex flex-col items-center">
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="font-black text-white text-sm text-center truncate w-full">{leaderboard[0].user_name}</div>
                    <div className="text-gray-500 text-xs text-center truncate w-full mb-2">{leaderboard[0].team_name}</div>
                    <div className="w-full h-36 rounded-t-xl flex items-center justify-center"
                      style={{ background: 'rgba(245,158,11,0.12)', border: '1.5px solid rgba(245,158,11,0.4)', borderBottom: 'none' }}>
                      <div className="text-center">
                        <div className="text-3xl font-black text-amber-400"><CountUp target={leaderboard[0].total_pts} /></div>
                        <div className="text-amber-700 text-xs">pts</div>
                      </div>
                    </div>
                    <div className="w-full py-2 text-center text-sm font-black text-black rounded-b-xl"
                      style={{ background: '#F59E0B' }}>#1</div>
                  </div>
                )}
                {/* 3rd */}
                {leaderboard[2] && (
                  <div className="flex-1 flex flex-col items-center">
                    <div className="text-2xl mb-1">🥉</div>
                    <div className="font-bold text-white text-xs text-center truncate w-full">{leaderboard[2].user_name}</div>
                    <div className="text-gray-600 text-xs text-center truncate w-full mb-2">{leaderboard[2].team_name}</div>
                    <div className="w-full h-20 rounded-t-xl flex items-center justify-center"
                      style={{ background: 'rgba(205,127,50,0.1)', border: '1px solid rgba(205,127,50,0.25)', borderBottom: 'none' }}>
                      <div className="text-center">
                        <div className="text-xl font-black text-orange-400"><CountUp target={leaderboard[2].total_pts} /></div>
                        <div className="text-orange-800 text-xs">pts</div>
                      </div>
                    </div>
                    <div className="w-full py-1.5 text-center text-xs font-black text-orange-400 rounded-b-xl"
                      style={{ background: 'rgba(205,127,50,0.15)' }}>#3</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full list */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            {leaderboard.map((entry, i) => {
              const kitColor = entry.kit_color || undefined;
              const kitEmoji = entry.kit_emoji || '';
              return (
                <motion.div key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                  style={{
                    background: i === 0 ? 'rgba(245,158,11,0.05)' : kitColor ? `${kitColor}08` : 'transparent',
                    borderLeft: kitColor ? `3px solid ${kitColor}` : undefined,
                  }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{
                      background: i === 0 ? '#F59E0B' : i === 1 ? 'rgba(156,163,175,0.2)' : i === 2 ? 'rgba(205,127,50,0.2)' : 'rgba(255,255,255,0.07)',
                      color: i === 0 ? '#000' : i === 1 ? '#9CA3AF' : i === 2 ? '#CD7F32' : '#6B7280',
                    }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate">
                      {kitEmoji && <span className="mr-1.5">{kitEmoji}</span>}
                      {entry.user_name}
                    </div>
                    <div className="text-gray-600 text-xs truncate">{entry.team_name}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-black" style={{ color: kitColor || '#F59E0B' }}><CountUp target={entry.total_pts} /></div>
                    <div className="text-gray-700 text-xs">pts</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {!isAuthenticated && (
        <div className="p-5 rounded-2xl text-center"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p className="text-gray-400 font-bold mb-1">Join the competition</p>
          <p className="text-gray-600 text-sm mb-4">Login to draft your team and compete on the leaderboard</p>
          <button
            onClick={() => { window.location.href = '/auth'; }}
            className="px-6 py-2.5 rounded-xl text-sm font-black"
            style={{ background: 'linear-gradient(90deg,#F59E0B,#D97706)', color: '#000' }}>
            Login / Register
          </button>
        </div>
      )}
    </div>
  );
}
