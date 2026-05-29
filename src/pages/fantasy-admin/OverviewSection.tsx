import { useState } from 'react';
import { RefreshCw, Download, Mail } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { AdminSectionProps } from './adminConstants';
import { getStatusConfig } from './adminConstants';
import { DashboardMetricsPanel } from './DashboardMetricsPanel';

export function OverviewSection({ season, players, matches }: AdminSectionProps) {
  const [recalculating, setRecalculating] = useState(false);
  const [recalcMsg, setRecalcMsg] = useState('');
  const [sendingRecap, setSendingRecap] = useState(false);
  const [recapMsg, setRecapMsg] = useState('');
  const [showRecapConfirm, setShowRecapConfirm] = useState(false);

  if (!season) return null;
  const statusCfg = getStatusConfig(season.status);

  async function handleRecalculate() {
    if (!season) return;
    setRecalculating(true);
    setRecalcMsg('');
    try {
      await fantasyApi.adminRecalculate(season.id);
      setRecalcMsg('Recalculation done! Player pts + leaderboard updated.');
    } catch {
      setRecalcMsg('Recalculation failed');
    }
    setRecalculating(false);
  }

  async function handleSendRecap() {
    if (!season) return;
    setSendingRecap(true);
    setRecapMsg('');
    setShowRecapConfirm(false);
    try {
      const result = await fantasyApi.sendWeeklyRecap(season.id);
      setRecapMsg(`Recap sent to ${result.sent} user${result.sent !== 1 ? 's' : ''}!`);
    } catch (err) {
      setRecapMsg(err instanceof Error ? err.message : 'Failed to send recap');
    }
    setSendingRecap(false);
  }

  return (
    <div className="space-y-6">
      {/* Season hero card */}
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="absolute inset-0 opacity-5" style={{ background: `linear-gradient(135deg, ${statusCfg.color} 0%, transparent 60%)` }} />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {statusCfg.icon}
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: statusCfg.color }}>
                  {statusCfg.label} SEASON
                </span>
              </div>
              <h2 className="text-xl font-black text-white">{season.full_name}</h2>
              <p className="text-gray-500 text-sm mt-0.5">{season.dates}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${statusCfg.bg} ${statusCfg.border} border`}
              style={{ color: statusCfg.color }}>
              {season.edition}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Teams', value: season.teams?.length ?? 0, color: '#F59E0B' },
              { label: 'Players', value: players.length, color: '#3B82F6' },
              { label: 'Matches', value: matches.length, color: '#22C55E' },
              { label: 'Completed', value: matches.filter(m => m.status === 'completed').length, color: '#A855F7' },
            ].map(s => (
              <div key={s.label} className="text-center py-2 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="text-lg font-black text-white">{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: s.color }}>{s.label}</div>
              </div>
            ))}
          </div>

          {season.status === 'completed' && (season.champion || season.runner_up) && (
            <div className="mt-4 pt-4 border-t border-white/5 grid sm:grid-cols-2 gap-3">
              {season.champion && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-amber-400 font-bold text-xs">CHAMPION</span>
                  <span className="text-white font-bold">{season.champion}</span>
                </div>
              )}
              {season.runner_up && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 font-bold text-xs">RUNNER UP</span>
                  <span className="text-white font-bold">{season.runner_up}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <DashboardMetricsPanel seasonId={season.id} />

      {/* Quick actions */}
      <div className="rounded-2xl p-5" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleRecalculate} disabled={recalculating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            {recalculating ? 'Recalculating...' : 'Recalculate All'}
          </button>

          <a href={fantasyApi.getExportUrl(season.id)} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/[0.08] transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Download className="w-3.5 h-3.5" /> Export Data
          </a>

          {!showRecapConfirm ? (
            <button onClick={() => setShowRecapConfirm(true)} disabled={sendingRecap}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
              <Mail className="w-3.5 h-3.5" />
              {sendingRecap ? 'Sending...' : 'Send Weekly Recap'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-xs font-bold">Send recap?</span>
              <button onClick={handleSendRecap} disabled={sendingRecap}
                className="px-3 py-2 rounded-lg text-xs font-bold text-black disabled:opacity-50"
                style={{ background: 'linear-gradient(90deg,#3B82F6,#2563EB)' }}>
                {sendingRecap ? 'Sending...' : 'Yes'}
              </button>
              <button onClick={() => setShowRecapConfirm(false)}
                className="px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                Cancel
              </button>
            </div>
          )}
        </div>

        {recalcMsg && (
          <p className={`text-xs font-bold mt-3 px-3 py-2 rounded-lg ${recalcMsg.includes('done') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {recalcMsg}
          </p>
        )}
        {recapMsg && (
          <p className={`text-xs font-bold mt-3 px-3 py-2 rounded-lg ${recapMsg.includes('sent') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {recapMsg}
          </p>
        )}
      </div>
    </div>
  );
}
