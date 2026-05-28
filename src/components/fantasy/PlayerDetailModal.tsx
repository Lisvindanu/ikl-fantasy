import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Snowflake, ChevronDown, Award } from 'lucide-react';
import { ROLE_META, NAT_FLAG } from './types';
import type { Role } from './types';
import type { IKLPlayer, PlayerMatchHistoryEntry, PlayerAward } from '../../api/fantasy';
import { getPlayerMatchHistory, getPlayerAwards } from '../../api/fantasy';

interface Props {
  player: IKLPlayer;
  onClose: () => void;
  onPick: () => void;
  isPicked: boolean;
  canPick: boolean;
  ownership?: number;
  form?: number;
  streak?: 'hot' | 'cold' | null;
}

export function PlayerDetailModal({ player, onClose, onPick, isPicked, canPick, ownership, form, streak }: Props) {
  const [history, setHistory] = useState<PlayerMatchHistoryEntry[] | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [awards, setAwards] = useState<PlayerAward[]>([]);

  useEffect(() => {
    getPlayerAwards(player.id).then(a => setAwards(Array.isArray(a) ? a : [])).catch(() => {});
  }, [player.id]);

  async function toggleHistory() {
    if (!showHistory && !history) {
      setLoadingHistory(true);
      const h = await getPlayerMatchHistory(player.id);
      setHistory(h);
      setLoadingHistory(false);
    }
    setShowHistory(v => !v);
  }
  const { color, label, img } = ROLE_META[player.role as Role];
  const valueScore = player.price > 0 ? +(player.fantasy_pts / player.price).toFixed(1) : 0;
  const rating = Math.min(99, Math.round(40 + player.fantasy_pts / 2));

  const stats = [
    { label: 'PTS',   value: player.fantasy_pts },
    { label: 'MVP',   value: player.mvps },
    { label: 'PRICE', value: `${player.price}cr` },
    { label: 'VALUE', value: `${valueScore}x` },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
          exit={{ scale: 0.85, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="relative w-72 select-none"
          style={{ filter: 'drop-shadow(0 25px 60px rgba(0,0,0,0.9))' }}
        >
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(160deg, ${player.team_color}cc 0%, ${player.team_color}66 25%, #1a1a2e 55%, #0d0d1a 100%)`,
              border: `1px solid ${player.team_color}60`,
            }}
          >
            {/* Holographic sheen */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.04) 100%)' }} />

            {/* Top row */}
            <div className="relative px-4 pt-4 flex items-start justify-between">
              <div className="text-center leading-none">
                <div className="font-black text-white leading-none" style={{ fontSize: 42, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{rating}</div>
                <div className="flex items-center gap-1 mt-1">
                  <img src={img} alt={player.role} style={{ width: 14, height: 14, filter: 'brightness(0) invert(1)' }} />
                  <span className="text-white font-black text-xs tracking-wider">{player.role}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${player.team_color}40`, color: player.team_color, border: `1px solid ${player.team_color}60` }}>
                  {player.team_short}
                </span>
                <span className="text-lg">{NAT_FLAG[player.nationality] || player.nationality}</span>
              </div>
            </div>

            {/* Player photo */}
            <div className="relative flex justify-center mt-1" style={{ height: 200 }}>
              {player.photo_url ? (
                <img
                  src={player.photo_url}
                  alt={player.name}
                  className="h-full object-contain object-bottom"
                  style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))' }}
                />
              ) : (
                <div className="w-32 h-full flex items-center justify-center font-black text-5xl"
                  style={{ color: player.team_color, opacity: 0.4 }}>
                  {player.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-12"
                style={{ background: 'linear-gradient(transparent, rgba(13,13,26,0.8))' }} />
            </div>

            {/* Name */}
            <div className="text-center px-4 -mt-2">
              <div className="font-black text-white text-2xl tracking-wide leading-tight uppercase"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
                {player.name}
              </div>
              <div className="text-xs font-medium mt-0.5" style={{ color: `${player.team_color}cc` }}>
                {player.team_name}
              </div>
              <div className="text-xs mt-0.5" style={{ color }}>{label}</div>
            </div>

            <div className="mx-4 my-3 h-px" style={{ background: `${player.team_color}30` }} />

            {/* Stats */}
            <div className="grid grid-cols-4 gap-1 px-4 pb-1">
              {stats.map(({ label: sl, value }) => (
                <div key={sl} className="text-center">
                  <div className="font-black text-white text-lg leading-none">{value}</div>
                  <div className="text-xs font-bold mt-0.5" style={{ color: `${player.team_color}99` }}>{sl}</div>
                </div>
              ))}
            </div>

            {/* Fantasy rating bar */}
            <div className="px-4 mt-3 pb-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Fantasy Rating</span>
                <span className="text-xs font-bold text-amber-400">{player.fantasy_pts} pts</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(player.fantasy_pts / 2, 100)}%` }}
                  transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${player.team_color}, ${player.team_color}99)` }}
                />
              </div>
            </div>

            {/* Ownership + Form + Streak (#7, #13, #14, #15) */}
            {(ownership !== undefined || form !== undefined || streak) && (
              <div className="flex items-center justify-center gap-3 px-4 mt-2">
                {ownership !== undefined && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.25)' }}>
                    {ownership}% owned
                  </span>
                )}
                {form !== undefined && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: 'rgba(168,85,247,0.15)', color: '#C084FC', border: '1px solid rgba(168,85,247,0.25)' }}>
                    Form {form}/10
                  </span>
                )}
                {streak === 'hot' && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <Flame className="w-3 h-3" /> Hot
                  </span>
                )}
                {streak === 'cold' && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                    style={{ background: 'rgba(96,165,250,0.15)', color: '#93C5FD', border: '1px solid rgba(96,165,250,0.25)' }}>
                    <Snowflake className="w-3 h-3" /> Cold
                  </span>
                )}
              </div>
            )}

            {/* Awards badges (#52) */}
            {awards.length > 0 && (
              <div className="px-4 mt-2">
                <div className="flex items-center gap-1 mb-1.5">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">Awards</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {awards.map((a) => (
                    <span key={a.type} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: a.tier === 'gold' ? 'rgba(245,158,11,0.12)' : 'rgba(148,163,184,0.12)',
                        color: a.tier === 'gold' ? '#F59E0B' : '#94A3B8',
                        border: `1px solid ${a.tier === 'gold' ? 'rgba(245,158,11,0.3)' : 'rgba(148,163,184,0.25)'}`,
                      }}
                      title={a.desc}>
                      {a.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Match history toggle (#57) */}
            <div className="px-4 mt-3">
              <button onClick={toggleHistory}
                className="w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                Match History
                <ChevronDown className={`w-3 h-3 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
              </button>
              {showHistory && (
                <div className="mt-2 max-h-32 overflow-y-auto space-y-1 text-xs" style={{ scrollbarWidth: 'thin' }}>
                  {loadingHistory ? (
                    <div className="py-3 text-center text-gray-600">Loading...</div>
                  ) : history && history.length > 0 ? (
                    history.map((h, i) => (
                      <div key={i} className="flex items-center justify-between py-1 px-2 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold" style={{ color: h.team1_color }}>{h.team1_short}</span>
                          <span className="text-gray-700">{h.team1_score}-{h.team2_score}</span>
                          <span className="font-bold" style={{ color: h.team2_color }}>{h.team2_short}</span>
                          <span className="text-gray-700">G{h.game_number}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400">{h.kills}</span>
                          <span className="text-gray-700">/</span>
                          <span className="text-red-400">{h.deaths}</span>
                          <span className="text-gray-700">/</span>
                          <span className="text-blue-400">{h.assists}</span>
                          {h.is_mvp && <span className="text-amber-400 font-bold">MVP</span>}
                          <span className="font-bold text-amber-400">{h.game_pts > 0 ? `+${h.game_pts}` : h.game_pts}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-3 text-center text-gray-700">No match history yet</div>
                  )}
                </div>
              )}
            </div>

            {/* Social links (#54) */}
            {(player.twitter_url || player.youtube_url || player.instagram_url || player.twitch_url) && (
              <div className="flex items-center justify-center gap-2 px-4 mt-2">
                {player.twitter_url && (
                  <a href={player.twitter_url} target="_blank" rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onClick={e => e.stopPropagation()}>
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-gray-400"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
                {player.youtube_url && (
                  <a href={player.youtube_url} target="_blank" rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.15)' }}
                    onClick={e => e.stopPropagation()}>
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-red-400"><path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
                {player.instagram_url && (
                  <a href={player.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ background: 'rgba(225,48,108,0.08)', border: '1px solid rgba(225,48,108,0.15)' }}
                    onClick={e => e.stopPropagation()}>
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-pink-400"><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                  </a>
                )}
                {player.twitch_url && (
                  <a href={player.twitch_url} target="_blank" rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ background: 'rgba(145,70,255,0.08)', border: '1px solid rgba(145,70,255,0.15)' }}
                    onClick={e => e.stopPropagation()}>
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-purple-400"><path fill="currentColor" d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0 1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
                  </a>
                )}
              </div>
            )}

            {/* View profile + action button */}
            <div className="px-4 py-4 space-y-2">
              <a href={`/fantasy-player?playerId=${player.id}`}
                className="block w-full py-2 rounded-xl font-bold text-xs text-center tracking-wide text-gray-400 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                View Full Profile
              </a>
              {isPicked ? (
                <button
                  onClick={onPick}
                  className="w-full py-2.5 rounded-xl font-black text-sm tracking-wide transition-all"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.35)' }}
                >
                  Remove from Team
                </button>
              ) : canPick ? (
                <button
                  onClick={onPick}
                  className="w-full py-2.5 rounded-xl font-black text-sm tracking-wide transition-all"
                  style={{ background: player.team_color, color: '#000' }}
                >
                  Pick Player
                </button>
              ) : (
                <div className="w-full py-2.5 rounded-xl font-black text-sm tracking-wide text-center"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Not Available
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10"
            style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
