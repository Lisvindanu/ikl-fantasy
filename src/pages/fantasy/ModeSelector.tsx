import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, ChevronRight, ChevronDown, Lock, AlertCircle, Zap, Trophy, Target, Sparkles } from 'lucide-react';
import type { SeasonMeta } from '../../api/fantasy';
import { NotificationReminder } from '../../components/fantasy/NotificationReminder';

interface Props {
  onSelect: (mode: 'player' | 'team' | 'both') => void;
  meta: SeasonMeta | null;
}

export function ModeSelector({ onSelect, meta }: Props) {
  const [expandedCard, setExpandedCard] = useState<'player' | 'team' | null>(null);
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

      {/* Quick intro */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-400">IKL Fantasy League</span>
        </div>
        <h2 className="text-3xl font-black text-white">Pilih Mode Fantasy</h2>
        <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
          Prediksi performa pemain & tim IKL, kumpulkan poin, dan bersaing di leaderboard.
        </p>
        {meta && (
          <p className="text-gray-600 text-xs mt-2">
            {meta.participant_count} peserta terdaftar
            {meta.max_participants ? ` · ${meta.max_participants} max` : ''}
          </p>
        )}
      </div>

      {/* How it works — 3 steps */}
      <div className="flex items-center gap-3 mb-8 flex-wrap justify-center">
        {[
          { step: '1', text: 'Pilih mode', icon: <Target className="w-3.5 h-3.5" /> },
          { step: '2', text: 'Draft / pick tim', icon: <Users className="w-3.5 h-3.5" /> },
          { step: '3', text: 'Kumpulkan poin!', icon: <Trophy className="w-3.5 h-3.5" /> },
        ].map(({ step, text, icon }) => (
          <div key={step} className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
              {step}
            </div>
            <span className="text-xs text-gray-400 font-bold flex items-center gap-1">{icon} {text}</span>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {/* Fantasy Draft Mode */}
        <div className="relative rounded-2xl text-left group transition-all"
          style={{ background: '#0d1017', border: expandedCard === 'player' ? '1.5px solid rgba(245,158,11,0.3)' : '1.5px solid rgba(255,255,255,0.08)' }}>
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ background: 'radial-gradient(circle at 30% 30%, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />

          <div className="relative p-6">
            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <Users className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-black text-xl">Fantasy Draft</h3>
                <p className="text-gray-500 text-sm mt-0.5">Untuk yang suka analisa pemain</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Draft 5 pemain IKL dengan budget 100 kredit. Makin bagus KDA pemain pilihanmu, makin banyak poinmu.
            </p>

            {/* Quick scoring preview */}
            <div className="grid grid-cols-4 gap-1.5 mb-4">
              {[
                { pts: '+1', label: 'Kill', color: '#22C55E' },
                { pts: '-1', label: 'Death', color: '#EF4444' },
                { pts: '+3', label: 'MVP', color: '#F59E0B' },
                { pts: '×2', label: 'Captain', color: '#FBBF24' },
              ].map(s => (
                <div key={s.label} className="rounded-lg px-2 py-1.5 text-center"
                  style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
                  <div className="text-sm font-black" style={{ color: s.color }}>{s.pts}</div>
                  <div className="text-[10px] text-gray-500 font-bold">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Expandable detail */}
            <button onClick={(e) => { e.stopPropagation(); setExpandedCard(expandedCard === 'player' ? null : 'player'); }}
              className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-gray-400 transition-colors mb-4">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedCard === 'player' ? 'rotate-180' : ''}`} />
              {expandedCard === 'player' ? 'Sembunyikan detail' : 'Lihat detail scoring'}
            </button>

            <AnimatePresence>
              {expandedCard === 'player' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-4">
                  <div className="rounded-xl p-3 space-y-2 text-xs text-gray-400"
                    style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-black text-gray-300 uppercase tracking-wider text-[10px]">Detail Scoring</span>
                    </div>
                    <p><span className="text-green-400 font-bold">+1</span> per Kill · <span className="text-blue-400 font-bold">+1</span> per Assist · <span className="text-red-400 font-bold">-1</span> per Death</p>
                    <p><span className="text-amber-400 font-bold">+3</span> MVP bonus · <span className="text-purple-400 font-bold">+10</span> Penta Kill bonus</p>
                    <p><span className="text-green-400 font-bold">+5</span> jika tim pemainmu menang seri</p>
                    <p><span className="text-amber-300 font-bold">×2</span> Captain mendapat poin ganda</p>
                    <div className="pt-2 border-t border-white/5">
                      <p className="text-gray-500">Draft 5 starter + 2 bench. Pilih 1 captain untuk poin ganda.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-2 mb-4">
              {['5 pemain', 'Budget 100', 'Bench 2', 'Captain ×2'].map(t => (
                <span key={t} className="text-xs px-2 py-1 rounded-full font-bold"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                  {t}
                </span>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect('player')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-black"
              style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)' }}>
              Pilih Fantasy Draft <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Fantasy Team Mode */}
        <div className="relative rounded-2xl text-left group transition-all"
          style={{ background: '#0d1017', border: expandedCard === 'team' ? '1.5px solid rgba(168,85,247,0.3)' : '1.5px solid rgba(255,255,255,0.08)' }}>
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ background: 'radial-gradient(circle at 30% 30%, rgba(168,85,247,0.08) 0%, transparent 70%)' }} />

          <div className="relative p-6">
            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-black text-xl">Fantasy Team</h3>
                <p className="text-gray-500 text-sm mt-0.5">Untuk fans setia tim tertentu</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Pilih 1 tim IKL jagoanmu. Setiap kali mereka menang, kamu dapat poin. Simpel!
            </p>

            {/* Quick scoring preview */}
            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {[
                { pts: '+10', label: 'Series Win', color: '#22C55E' },
                { pts: '+2', label: 'Game Win', color: '#3B82F6' },
                { pts: '+5', label: 'Sweep', color: '#A855F7' },
              ].map(s => (
                <div key={s.label} className="rounded-lg px-2 py-1.5 text-center"
                  style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
                  <div className="text-sm font-black" style={{ color: s.color }}>{s.pts}</div>
                  <div className="text-[10px] text-gray-500 font-bold">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Expandable detail */}
            <button onClick={(e) => { e.stopPropagation(); setExpandedCard(expandedCard === 'team' ? null : 'team'); }}
              className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-gray-400 transition-colors mb-4">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedCard === 'team' ? 'rotate-180' : ''}`} />
              {expandedCard === 'team' ? 'Sembunyikan detail' : 'Lihat detail scoring'}
            </button>

            <AnimatePresence>
              {expandedCard === 'team' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-4">
                  <div className="rounded-xl p-3 space-y-2 text-xs text-gray-400"
                    style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-black text-gray-300 uppercase tracking-wider text-[10px]">Detail Scoring</span>
                    </div>
                    <p><span className="text-green-400 font-bold">+10</span> Menang seri (Bo3/Bo5)</p>
                    <p><span className="text-blue-400 font-bold">+2</span> per game yang dimenangkan</p>
                    <p><span className="text-purple-400 font-bold">+5</span> bonus clean sweep (menang tanpa kalah game)</p>
                    <div className="pt-2 border-t border-white/5">
                      <p className="text-gray-500">Mode ini lebih simpel — cocok untuk yang baru pertama kali main fantasy.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-2 mb-4">
              {['1 tim', 'Simpel', 'Cocok pemula'].map(t => (
                <span key={t} className="text-xs px-2 py-1 rounded-full font-bold"
                  style={{ background: 'rgba(168,85,247,0.1)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.2)' }}>
                  {t}
                </span>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect('team')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}>
              Pilih Fantasy Team <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          onClick={() => onSelect('both')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-white/[0.06]"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF' }}>
          <Users className="w-4 h-4 text-amber-400" />
          <span className="text-white">+</span>
          <Shield className="w-4 h-4 text-purple-400" />
          Ikut keduanya sekaligus
        </button>
        <p className="text-gray-700 text-xs">Draft pemain + pick tim — dapet poin dari keduanya</p>
      </div>
    </div>
  );
}
