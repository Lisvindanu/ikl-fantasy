import { motion } from 'framer-motion';
import { Wallet, Plus, X } from 'lucide-react';
import { ROLE_META, NAT_FLAG } from './types';
import type { Role } from './types';
import { RoleImg } from './RoleImg';
import { RolePill } from './RolePill';
import type { IKLPlayer } from '../../api/fantasy';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';

interface Props {
  player: IKLPlayer;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
  onDetail: () => void;
  onSwipeDismiss?: () => void;
  enableSwipe?: boolean;
}

export function PickerCard({ player, selected, onSelect, disabled, onDetail, onSwipeDismiss, enableSwipe = false }: Props) {
  const { color: roleColor } = ROLE_META[player.role as Role];
  const ptsRatio = Math.min(player.fantasy_pts / 200, 1);
  const valueScore = player.price > 0 ? +(player.fantasy_pts / player.price).toFixed(1) : 0;

  const swipeEnabled = enableSwipe && !disabled && !selected;
  const { ref: swipeRef, offsetX, swiping, direction } = useSwipeGesture({
    onSwipeRight: swipeEnabled ? onSelect : undefined,
    onSwipeLeft: swipeEnabled ? (onSwipeDismiss || (() => {})) : undefined,
    threshold: 80,
    enabled: swipeEnabled,
  });

  return (
    <div ref={swipeRef} className="relative">
      {/* Swipe feedback backgrounds */}
      {swiping && direction === 'right' && (
        <div className="absolute inset-0 rounded-2xl flex items-center pl-5 z-0"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1.5px solid rgba(34,197,94,0.3)' }}>
          <Plus className="w-6 h-6 text-green-400" />
          <span className="text-green-400 font-bold text-sm ml-2">Add</span>
        </div>
      )}
      {swiping && direction === 'left' && (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-end pr-5 z-0"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1.5px solid rgba(239,68,68,0.3)' }}>
          <span className="text-red-400 font-bold text-sm mr-2">Skip</span>
          <X className="w-6 h-6 text-red-400" />
        </div>
      )}
    <motion.div
      layout
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={() => !disabled && onSelect()}
      className="relative rounded-2xl overflow-hidden cursor-pointer select-none"
      style={{
        background: selected ? `linear-gradient(135deg, ${player.team_color}20 0%, #0f1520 100%)` : '#0f1520',
        border: selected ? `1.5px solid ${player.team_color}80` : disabled ? '1.5px solid rgba(255,255,255,0.04)' : '1.5px solid rgba(255,255,255,0.08)',
        opacity: disabled && !selected ? 0.4 : 1,
        transform: swiping ? `translateX(${offsetX}px)` : 'translateX(0)',
        transition: swiping ? 'none' : 'transform 0.3s ease',
      }}
    >
      <div className="h-0.5" style={{ background: selected ? player.team_color : `${player.team_color}50` }} />

      <div className="p-3.5">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              onClick={e => { e.stopPropagation(); onDetail(); }}
              className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center font-black text-sm cursor-pointer hover:ring-2 transition-all"
              style={{
                background: `linear-gradient(135deg, ${player.team_color}35, ${player.team_color}15)`,
                border: `1.5px solid ${player.team_color}45`,
                color: player.team_color,
              }}
            >
              {player.photo_url
                ? <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover object-top"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex'; }} />
                : null}
              <span style={{ display: player.photo_url ? 'none' : 'flex' }}>{player.name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: '#07090f', border: `1.5px solid ${roleColor}` }}
            >
              <RoleImg role={player.role as Role} size={10} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-white text-sm leading-tight">{player.name}</span>
              <span className="text-sm leading-none">{NAT_FLAG[player.nationality] || player.nationality}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                style={{ background: `${player.team_color}25`, color: player.team_color }}>
                {player.team_short}
              </span>
              <RolePill role={player.role as Role} size="xs" />
            </div>
          </div>

          {selected && (
            <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: player.team_color }}>
              <span className="text-black text-xs font-black">✓</span>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-3 flex items-end gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">pts</span>
              <span className="font-black text-amber-400 text-sm">{player.fantasy_pts}</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div className="h-full rounded-full" style={{ width: `${ptsRatio * 100}%`, background: 'linear-gradient(90deg,#F59E0B,#FBBF24)' }} />
            </div>
          </div>
          <div className="text-center flex-shrink-0">
            <div className="text-white font-bold text-sm leading-none">{player.mvps}</div>
            <div className="text-gray-700 text-xs">MVP</div>
          </div>
          <div className="flex-shrink-0">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Wallet className="w-3 h-3 text-amber-500" />
              <span className="text-amber-300 font-black text-sm">{player.price}</span>
              <span className="text-amber-700 text-xs">cr</span>
            </div>
          </div>
        </div>

        {/* Value indicator */}
        <div className="mt-1.5 flex items-center gap-1">
          <span className="text-gray-700 text-xs">Value:</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-3 h-1.5 rounded-sm"
                style={{ background: i <= Math.round(valueScore / 4) ? '#22C55E' : 'rgba(255,255,255,0.08)' }} />
            ))}
          </div>
          <span className="text-gray-600 text-xs">{valueScore}x</span>
        </div>
      </div>
    </motion.div>
    </div>
  );
}
