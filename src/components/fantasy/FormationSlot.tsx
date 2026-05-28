import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ROLE_META } from './types';
import type { Role } from './types';
import { RoleImg } from './RoleImg';
import type { IKLPlayer } from '../../api/fantasy';

interface Props {
  role: Role;
  player: IKLPlayer | null;
  isActive: boolean;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  onSetCaptain?: (e: React.MouseEvent) => void;
  onSetViceCaptain?: (e: React.MouseEvent) => void;
}

export function FormationSlot({ role, player, isActive, onClick, onRemove, isCaptain, isViceCaptain, onSetCaptain, onSetViceCaptain }: Props) {
  const { color, label } = ROLE_META[role];
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative rounded-2xl cursor-pointer select-none flex flex-col items-center py-3 px-2 transition-all"
      style={{
        background: player ? `linear-gradient(160deg, ${player.team_color}25, #0f1520)` : isActive ? `${color}12` : '#0d1017',
        border: player ? `1.5px solid ${player.team_color}60` : isActive ? `1.5px solid ${color}50` : '1.5px dashed rgba(255,255,255,0.12)',
        minWidth: 90,
      }}
    >
      <div className="flex items-center gap-1 mb-2">
        <RoleImg role={role} size={14} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{label}</span>
      </div>

      {player ? (
        <>
          <div
            className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center font-black text-base mb-1.5 relative"
            style={{
              background: `linear-gradient(135deg, ${player.team_color}40, ${player.team_color}20)`,
              border: `2px solid ${player.team_color}60`,
              color: player.team_color,
            }}
          >
            {player.photo_url
              ? <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover object-top"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex'; }} />
              : null}
            <span style={{ display: player.photo_url ? 'none' : 'flex' }}>{player.name.slice(0, 2).toUpperCase()}</span>
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: player.team_color }}>
              <span className="text-black font-black" style={{ fontSize: 9 }}>✓</span>
            </div>
          </div>
          <div className="font-bold text-white text-xs text-center leading-tight max-w-full truncate px-1">{player.name}</div>
          <div className="text-xs font-bold mt-0.5" style={{ color: player.team_color }}>{player.team_short}</div>
          <div className="text-amber-400 font-black text-sm mt-1">
            {player.fantasy_pts}{isCaptain ? '×2' : ''} pts
          </div>
          {/* Captain / Vice badges */}
          {(isCaptain || isViceCaptain) && (
            <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider shadow-md ${
              isCaptain ? 'bg-amber-500 text-black shadow-amber-500/40' : 'bg-sky-500 text-white shadow-sky-500/40'
            }`}>
              {isCaptain ? 'CAP' : 'VICE'}
            </div>
          )}
          {/* Captain toggle buttons */}
          {player && onSetCaptain && (
            <div className="flex gap-1.5 mt-2">
              <button onClick={onSetCaptain}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wide transition-all min-w-[40px] ${
                  isCaptain
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40 ring-2 ring-amber-400/50'
                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 hover:text-amber-200 border border-amber-500/40'
                }`}>CAP</button>
              <button onClick={onSetViceCaptain}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wide transition-all min-w-[40px] ${
                  isViceCaptain
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40 ring-2 ring-sky-400/50'
                    : 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/40 hover:text-sky-200 border border-sky-500/40'
                }`}>VICE</button>
            </div>
          )}
          <button
            onClick={onRemove}
            className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center bg-red-500/80 text-white hover:bg-red-500 shadow-lg shadow-red-500/30 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1.5"
            style={{ background: `${color}10`, border: `1.5px dashed ${color}35` }}>
            <RoleImg role={role} size={28} />
          </div>
          <div className="text-gray-700 text-xs text-center">{isActive ? 'Select →' : 'Empty'}</div>
        </>
      )}
    </motion.div>
  );
}
