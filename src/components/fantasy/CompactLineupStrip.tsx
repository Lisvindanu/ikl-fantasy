import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ROLE_META, ROLES } from './types';
import type { Role } from './types';
import type { IKLPlayer } from '../../api/fantasy';

interface Props {
  picks: Record<Role, IKLPlayer | null>;
  activeRole: Role;
  onSlotClick: (r: Role) => void;
  onRemove: (r: Role) => void;
  totalPts: number;
}

export function CompactLineupStrip({ picks, activeRole, onSlotClick, onRemove, totalPts }: Props) {
  return (
    <div className="flex items-center gap-1.5 w-full">
      {ROLES.map(role => {
        const p = picks[role];
        const { color, img, short } = ROLE_META[role];
        const isActive = activeRole === role;
        return (
          <motion.div
            key={role}
            whileTap={{ scale: 0.93 }}
            onClick={() => onSlotClick(role)}
            className="relative flex-1 min-w-0 flex flex-col items-center cursor-pointer rounded-2xl px-1 py-2 transition-all"
            style={{
              background: p ? `linear-gradient(160deg, ${p.team_color}30, #0d1017)` : isActive ? `${color}15` : '#0d1017',
              border: p ? `1.5px solid ${p.team_color}60` : isActive ? `1.5px solid ${color}50` : '1.5px dashed rgba(255,255,255,0.12)',
            }}
          >
            {p ? (
              <>
                <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center font-black text-xs flex-shrink-0"
                  style={{ background: `${p.team_color}30`, color: p.team_color, border: `1.5px solid ${p.team_color}50` }}>
                  {p.photo_url
                    ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover object-top" />
                    : p.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-white font-bold text-xs mt-1 leading-tight text-center w-full truncate px-0.5">{p.name}</div>
                <div className="text-xs font-bold" style={{ color }}>{short}</div>
                <button
                  onClick={e => { e.stopPropagation(); onRemove(role); }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"
                >
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}12`, border: `1.5px dashed ${color}35` }}>
                  <img src={img} alt={role} style={{ width: 22, height: 22, filter: 'brightness(0) invert(1)', opacity: 0.5 }} />
                </div>
                <div className="text-xs font-bold mt-1" style={{ color: isActive ? color : '#4B5563' }}>{short}</div>
                <div className="text-gray-700 text-xs">{isActive ? '← pick' : '·'}</div>
              </>
            )}
          </motion.div>
        );
      })}
      {totalPts > 0 && (
        <div className="flex-shrink-0 flex flex-col items-center justify-center px-2 ml-1"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="font-black text-amber-400 text-lg leading-none">{totalPts}</div>
          <div className="text-gray-600 text-xs">pts</div>
        </div>
      )}
    </div>
  );
}
