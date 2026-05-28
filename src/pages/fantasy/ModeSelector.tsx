import { motion } from 'framer-motion';
import { Users, Shield, ChevronRight, Lock, AlertCircle } from 'lucide-react';
import type { SeasonMeta } from '../../api/fantasy';
import { NotificationReminder } from '../../components/fantasy/NotificationReminder';

interface Props {
  onSelect: (mode: 'player' | 'team' | 'both') => void;
  meta: SeasonMeta | null;
}

export function ModeSelector({ onSelect, meta }: Props) {
  const isLocked = meta?.picks_lock_at ? new Date() > new Date(meta.picks_lock_at) : false;
  const isFull = meta?.max_participants
    ? meta.participant_count >= meta.max_participants
    : false;
  const spotsLeft = meta?.max_participants
    ? Math.max(0, meta.max_participants - meta.participant_count)
    : null;
  const locksAt = meta?.picks_lock_at ? new Date(meta.picks_lock_at) : null;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      {/* Status banners */}
      <div className="w-full max-w-2xl mb-8 space-y-2">
        {isLocked && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171' }}>
            <Lock className="w-4 h-4 flex-shrink-0" />
            Picks are locked — season has started. You can view but not change picks.
          </div>
        )}
        {!isLocked && locksAt && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Picks lock on {locksAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
            <NotificationReminder picksLockAt={meta?.picks_lock_at ?? null} />
          </div>
        )}
        {isFull && !isLocked && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Season is full — no more registrations. {meta?.max_participants} participants reached.
          </div>
        )}
        {!isFull && spotsLeft !== null && spotsLeft <= 20 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Only {spotsLeft} spots left!
          </div>
        )}
      </div>

      <div className="text-center mb-8">
        <p className="text-gray-600 text-xs font-black uppercase tracking-widest mb-2">Choose your mode</p>
        <h2 className="text-3xl font-black text-white">Mau main mode apa?</h2>
        {meta && (
          <p className="text-gray-600 text-sm mt-2">
            {meta.participant_count} participant{meta.participant_count !== 1 ? 's' : ''} registered
            {meta.max_participants ? ` · ${meta.max_participants} max` : ''}
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {/* Fantasy Draft Mode */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('player')}
          className="relative rounded-2xl p-6 text-left group transition-all"
          style={{ background: '#0d1017', border: '1.5px solid rgba(255,255,255,0.08)' }}
        >
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ background: 'radial-gradient(circle at 30% 30%, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />

          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Users className="w-6 h-6 text-amber-400" />
          </div>

          <h3 className="text-white font-black text-xl mb-1">Fantasy Draft</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Draft 5 pemain IKL dengan budget terbatas. Kumpulkan poin dari KDA, MVP, dan Penta Kill mereka.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {['5 pemain', 'Budget 100', 'KDA scoring'].map(t => (
              <span key={t} className="text-xs px-2 py-1 rounded-full font-bold"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                {t}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-1 text-amber-400 font-bold text-sm">
            Pilih mode ini <ChevronRight className="w-4 h-4" />
          </div>
        </motion.button>

        {/* Fantasy Team Mode */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('team')}
          className="relative rounded-2xl p-6 text-left group transition-all"
          style={{ background: '#0d1017', border: '1.5px solid rgba(255,255,255,0.08)' }}
        >
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ background: 'radial-gradient(circle at 30% 30%, rgba(168,85,247,0.08) 0%, transparent 70%)' }} />

          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <Shield className="w-6 h-6 text-purple-400" />
          </div>

          <h3 className="text-white font-black text-xl mb-1">Fantasy Team</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Pilih 1 tim IKL jagoanmu. Dapet poin dari setiap kemenangan seri dan game mereka.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {['1 tim', 'Win +10', 'Game win +2', 'Sweep +5'].map(t => (
              <span key={t} className="text-xs px-2 py-1 rounded-full font-bold"
                style={{ background: 'rgba(168,85,247,0.1)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.2)' }}>
                {t}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-1 text-purple-400 font-bold text-sm">
            Pilih mode ini <ChevronRight className="w-4 h-4" />
          </div>
        </motion.button>
      </div>

      <button
        onClick={() => onSelect('both')}
        className="mt-6 text-gray-500 text-sm font-bold hover:text-gray-300 transition-colors underline underline-offset-4">
        Ikut keduanya sekaligus →
      </button>
    </div>
  );
}
