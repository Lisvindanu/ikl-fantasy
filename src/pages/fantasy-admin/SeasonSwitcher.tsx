import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { IKLSeason } from '../../api/fantasy';
import { STATUS_CONFIG, getStatusConfig } from './adminConstants';

interface Props {
  allSeasons: IKLSeason[];
  selectedSeasonId: number | null;
  onSwitch: (id: number) => void;
  compact?: boolean;
}

export function SeasonSwitcher({ allSeasons, selectedSeasonId, onSwitch, compact }: Props) {
  const [open, setOpen] = useState(false);

  if (allSeasons.length === 0) return null;

  const current = allSeasons.find(s => s.id === selectedSeasonId);
  const statusCfg = getStatusConfig(current?.status || 'active');

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-2 rounded-xl font-bold transition-all hover:bg-white/5 ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2.5 text-sm'}`}
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.1) 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusCfg.color, boxShadow: `0 0 6px ${statusCfg.color}60` }} />
        <span className="text-white truncate flex-1 text-left">
          {current?.full_name || 'Select Season'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl py-1 shadow-2xl z-50 overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(13,16,23,0.98) 0%, rgba(7,9,15,0.99) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}>
            <div className="px-3 py-2 border-b border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                All Seasons ({allSeasons.length})
              </span>
            </div>
            {allSeasons.map(s => {
              const cfg = STATUS_CONFIG[(s.status as keyof typeof STATUS_CONFIG)] || STATUS_CONFIG.active;
              const isSelected = s.id === selectedSeasonId;
              return (
                <button
                  key={s.id}
                  onClick={() => { onSwitch(s.id); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors ${isSelected ? 'bg-amber-500/10' : 'hover:bg-white/5'}`}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}40` }} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold truncate ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                      {s.full_name}
                    </div>
                    <div className="text-[10px] text-gray-600 truncate">{s.dates}</div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: `${cfg.color}15`,
                      border: `1px solid ${cfg.color}30`,
                      color: cfg.color,
                    }}>
                    {cfg.label}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
