import { motion } from 'framer-motion';
import type { IKLPlayer, PlayerOwnershipData, PlayerFormEntry } from '../../api/fantasy';
import { PlayerDetailModal } from '../../components/fantasy/PlayerDetailModal';
import type { UndoState } from './useFantasyData';

const CONFETTI_COLORS = ['#F59E0B', '#EF4444', '#3B82F6', '#22C55E', '#A855F7', '#EC4899'];

interface ConfettiOverlayProps {
  show: boolean;
}

export function ConfettiOverlay({ show }: ConfettiOverlayProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            background: CONFETTI_COLORS[i % 6],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${Math.random() * 0.8}s`,
            animationDuration: `${1.5 + Math.random() * 1.5}s`,
          }} />
      ))}
    </div>
  );
}

interface UndoToastProps {
  show: boolean;
  undoState: UndoState | null;
  onUndo: () => void;
}

export function UndoToast({ show, undoState, onUndo }: UndoToastProps) {
  if (!show || !undoState) return null;
  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[9998]">
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
        style={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)' }}>
        <span className="text-sm text-white font-bold">Team saved!</span>
        <button onClick={onUndo}
          className="px-3 py-1 rounded-lg text-xs font-black text-amber-400 hover:text-amber-300"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
          Undo
        </button>
      </div>
    </div>
  );
}

interface PlayerDetailOverlayProps {
  player: IKLPlayer | null;
  onClose: () => void;
  isPicked: boolean;
  canPick: boolean;
  onPick: () => void;
  ownershipData: PlayerOwnershipData | null;
  formData: PlayerFormEntry[];
}

export function PlayerDetailOverlay({
  player, onClose, isPicked, canPick, onPick,
  ownershipData, formData,
}: PlayerDetailOverlayProps) {
  if (!player) return null;
  return (
    <PlayerDetailModal
      player={player}
      onClose={onClose}
      isPicked={isPicked}
      canPick={canPick}
      onPick={onPick}
      ownership={ownershipData && ownershipData.total > 0
        ? (ownershipData.ownership[player.id] || 0)
        : undefined}
      form={formData.find(f => f.player_id === player.id)?.form}
      streak={formData.find(f => f.player_id === player.id)?.streak}
    />
  );
}

interface ConfirmSaveDialogProps {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  teamName: string;
  filledCount: number;
  captainId: number | null;
}

export function ConfirmSaveDialog({
  show, onCancel, onConfirm,
  teamName, filledCount, captainId,
}: ConfirmSaveDialogProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6 max-w-sm w-full space-y-4"
        style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-black text-white">Save Lineup?</h3>
        <p className="text-gray-400 text-sm">
          This will save your team <span className="text-white font-bold">{teamName}</span> with {filledCount} players.
          {captainId && <span> Captain gets <span className="text-amber-400 font-bold">2x points</span>.</span>}
          {!captainId && <span className="text-amber-400"> Tip: Set a captain for 2x points!</span>}
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-black text-black transition-all"
            style={{ background: 'linear-gradient(90deg,#F59E0B,#D97706)' }}>
            Confirm Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}
