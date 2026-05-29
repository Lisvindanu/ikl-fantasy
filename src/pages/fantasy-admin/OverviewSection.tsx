import { useState } from 'react';
import { RefreshCw, Download, Mail } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { AdminSectionProps } from './adminConstants';
import { getStatusConfig } from './adminConstants';
import { AdminPanel } from './shared';
import { DashboardMetricsPanel } from './DashboardMetricsPanel';

export function OverviewSection({ season, players, matches }: AdminSectionProps) {
  const [recalculating, setRecalculating] = useState(false);
  const [recalcMsg, setRecalcMsg] = useState('');
  const [sendingRecap, setSendingRecap] = useState(false);
  const [recapMsg, setRecapMsg] = useState('');
  const [showRecapConfirm, setShowRecapConfirm] = useState(false);

  if (!season) return null;
  const cfg = getStatusConfig(season.status);

  async function handleRecalculate() {
    if (!season) return;
    setRecalculating(true); setRecalcMsg('');
    try {
      await fantasyApi.adminRecalculate(season.id);
      setRecalcMsg('Recalculation done! Player pts + leaderboard updated.');
    } catch { setRecalcMsg('Recalculation failed'); }
    setRecalculating(false);
  }

  async function handleSendRecap() {
    if (!season) return;
    setSendingRecap(true); setRecapMsg(''); setShowRecapConfirm(false);
    try {
      const result = await fantasyApi.sendWeeklyRecap(season.id);
      setRecapMsg(`Recap sent to ${result.sent} user${result.sent !== 1 ? 's' : ''}!`);
    } catch (err) { setRecapMsg(err instanceof Error ? err.message : 'Failed'); }
    setSendingRecap(false);
  }

  const completedCount = matches.filter(m => m.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Season hero — dramatic gradient card */}
      <AdminPanel glow={`${cfg.color}15`}>
        <div className="p-6 relative">
          {/* Atmospheric gradient */}
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ background: `radial-gradient(ellipse at 20% 50%, ${cfg.color} 0%, transparent 70%)` }} />

          <div className="relative">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: cfg.color }}>
                    {cfg.label} Season
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight leading-tight">{season.full_name}</h2>
                <p className="text-gray-500 text-sm mt-1 font-medium">{season.dates}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[10px] font-black px-3 py-1 rounded-full"
                  style={{
                    background: `${cfg.color}10`,
                    color: cfg.color,
                    border: `1px solid ${cfg.color}25`,
                    boxShadow: `0 0 12px ${cfg.color}08`,
                  }}>
                  {season.edition}
                </span>
                {season.prize_pool && (
                  <span className="text-[10px] font-bold text-gray-600">{season.prize_pool}</span>
                )}
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Teams', value: season.teams?.length ?? 0, color: '#F59E0B', glow: 'rgba(245,158,11,0.06)' },
                { label: 'Players', value: players.length, color: '#3B82F6', glow: 'rgba(59,130,246,0.06)' },
                { label: 'Matches', value: matches.length, color: '#22C55E', glow: 'rgba(34,197,94,0.06)' },
                { label: 'Completed', value: completedCount, color: '#A855F7', glow: 'rgba(168,85,247,0.06)' },
              ].map(s => (
                <div key={s.label} className="text-center py-3 px-3 rounded-xl relative overflow-hidden"
                  style={{
                    background: s.glow,
                    border: `1px solid ${s.color}12`,
                  }}>
                  <div className="text-xl font-black text-white">{s.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.12em] mt-0.5" style={{ color: `${s.color}90` }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Champion strip */}
            {season.status === 'completed' && (season.champion || season.runner_up) && (
              <div className="mt-5 pt-4 grid sm:grid-cols-2 gap-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {season.champion && (
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-500/60">Champion</span>
                    <span className="text-sm font-black text-white">{season.champion}</span>
                  </div>
                )}
                {season.runner_up && (
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-600">Runner Up</span>
                    <span className="text-sm font-bold text-gray-400">{season.runner_up}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </AdminPanel>

      <DashboardMetricsPanel seasonId={season.id} />

      {/* Quick actions */}
      <AdminPanel>
        <div className="p-5">
          <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-4 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-amber-500/50" />
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <ActionBtn onClick={handleRecalculate} disabled={recalculating} variant="primary"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />}>
              {recalculating ? 'Recalculating...' : 'Recalculate All'}
            </ActionBtn>

            <a href={fantasyApi.getExportUrl(season.id)} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/[0.06] transition-all"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}>
              <Download className="w-3.5 h-3.5" /> Export
            </a>

            {!showRecapConfirm ? (
              <ActionBtn onClick={() => setShowRecapConfirm(true)} disabled={sendingRecap} variant="blue"
                icon={<Mail className="w-3.5 h-3.5" />}>
                {sendingRecap ? 'Sending...' : 'Weekly Recap'}
              </ActionBtn>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-xs font-bold">Send recap?</span>
                <button onClick={handleSendRecap} disabled={sendingRecap}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#3B82F6,#2563EB)', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}>
                  {sendingRecap ? 'Sending...' : 'Yes'}
                </button>
                <button onClick={() => setShowRecapConfirm(false)}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-gray-500 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          <StatusMsg msg={recalcMsg} successWord="done" />
          <StatusMsg msg={recapMsg} successWord="sent" />
        </div>
      </AdminPanel>
    </div>
  );
}

function ActionBtn({ children, onClick, disabled, variant, icon }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean;
  variant: 'primary' | 'blue'; icon: React.ReactNode;
}) {
  const styles = variant === 'primary'
    ? { background: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)', color: '#000', boxShadow: '0 4px 12px rgba(245,158,11,0.25), inset 0 1px 0 rgba(255,255,255,0.2)' }
    : { background: 'linear-gradient(180deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.08) 100%)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 0 12px rgba(59,130,246,0.06)' };

  return (
    <button onClick={onClick} disabled={disabled}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-all hover:brightness-110 active:scale-[0.98]"
      style={styles}>
      {icon}{children}
    </button>
  );
}

function StatusMsg({ msg, successWord }: { msg: string; successWord: string }) {
  if (!msg) return null;
  const ok = msg.includes(successWord);
  return (
    <p className={`text-xs font-bold mt-3 px-3 py-2 rounded-lg ${ok ? 'text-green-400 bg-green-500/8 border border-green-500/10' : 'text-red-400 bg-red-500/8 border border-red-500/10'}`}>
      {msg}
    </p>
  );
}
