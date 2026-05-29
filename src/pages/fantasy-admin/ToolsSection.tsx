import { useState } from 'react';
import { RefreshCw, Download, Mail, DollarSign, Target, Database, AlertTriangle } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { AdminSectionProps } from './adminConstants';
import { GradePredictionsPanel } from './GradePredictionsPanel';
import { AuditLogPanel } from './AuditLogPanel';

export function ToolsSection({ season, matches, onRefreshMatches, onSetPlayers, onSetAllSeasons, onSetSelectedSeasonId }: AdminSectionProps) {
  const [recalculating, setRecalculating] = useState(false);
  const [recalcMsg, setRecalcMsg] = useState('');
  const [sendingRecap, setSendingRecap] = useState(false);
  const [recapMsg, setRecapMsg] = useState('');
  const [showRecapConfirm, setShowRecapConfirm] = useState(false);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [priceMsg, setPriceMsg] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  if (!season) return null;

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

  async function handleUpdatePrices() {
    if (!season) return;
    setUpdatingPrices(true);
    setPriceMsg('');
    try {
      const result = await fantasyApi.adminUpdatePrices(season.id);
      setPriceMsg(`Prices updated! ${result.updated} players affected.`);
      const p = await fantasyApi.getPlayers(season.id).catch(() => []);
      onSetPlayers(Array.isArray(p) ? p : []);
    } catch (err) {
      setPriceMsg(err instanceof Error ? err.message : 'Failed to update prices');
    }
    setUpdatingPrices(false);
  }

  async function handleSeedIkl() {
    if (!window.confirm('Seed IKL Spring 2026 data? This will create a new season with teams and players.')) return;
    setSeeding(true);
    setSeedMsg('');
    try {
      const result = await fantasyApi.adminSeedIklFull();
      setSeedMsg(`Seeded! Season ${result.seasonId}, ${result.teams} teams, ${result.players} players.`);
      const seasons = await fantasyApi.getSeasons();
      onSetAllSeasons(seasons);
      if (result.seasonId) onSetSelectedSeasonId(result.seasonId);
    } catch (err) {
      setSeedMsg(err instanceof Error ? err.message : 'Failed to seed');
    }
    setSeeding(false);
  }

  return (
    <div className="space-y-6">
      {/* Update Dynamic Prices */}
      <ToolCard icon={<DollarSign className="w-4 h-4 text-green-400" />} title="Update Player Prices"
        description="Recalculate dynamic player prices based on performance. Higher-performing players become more expensive.">
        <StatusMsg msg={priceMsg} successWord="updated" />
        <button onClick={handleUpdatePrices} disabled={updatingPrices}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <DollarSign className="w-3.5 h-3.5" />
          {updatingPrices ? 'Updating...' : 'Update Prices'}
        </button>
      </ToolCard>

      {/* Grade Predictions */}
      <ToolCard icon={<Target className="w-4 h-4 text-purple-400" />} title="Grade Predictions"
        description="Grade predictions for completed matches. Select a match below to grade its predictions.">
        <GradePredictionsPanel matches={matches} onGraded={onRefreshMatches} />
      </ToolCard>

      {/* Weekly Recap Email */}
      <ToolCard icon={<Mail className="w-4 h-4 text-blue-400" />} title="Weekly Recap Email"
        description="Send a weekly recap email to all fantasy participants with their rank, points, top performer, and recent results.">
        <StatusMsg msg={recapMsg} successWord="sent" />
        {showRecapConfirm ? (
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 text-xs font-bold">Send recap to all participants?</span>
            <button onClick={handleSendRecap} disabled={sendingRecap}
              className="px-4 py-2 rounded-lg text-xs font-bold text-black disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg,#3B82F6,#2563EB)' }}>
              {sendingRecap ? 'Sending...' : 'Yes, Send'}
            </button>
            <button onClick={() => setShowRecapConfirm(false)}
              className="px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setShowRecapConfirm(true)} disabled={sendingRecap}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <Mail className="w-3.5 h-3.5" />
            {sendingRecap ? 'Sending...' : 'Send Weekly Recap'}
          </button>
        )}
      </ToolCard>

      {/* Export */}
      <ToolCard icon={<Download className="w-4 h-4 text-green-400" />} title="Export Data"
        description="Download all season data as JSON including matches, stats, leaderboard, and players.">
        <a href={fantasyApi.getExportUrl(season.id)} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white w-fit hover:bg-white/[0.08] transition-colors"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <Download className="w-3.5 h-3.5" /> Export Season Data
        </a>
      </ToolCard>

      {/* Recalculate */}
      <ToolCard icon={<RefreshCw className="w-4 h-4 text-amber-400" />} title="Recalculate Points"
        description="Recalculate all fantasy points, player totals, and leaderboard rankings from match stats.">
        <StatusMsg msg={recalcMsg} successWord="done" />
        <button onClick={handleRecalculate} disabled={recalculating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
          <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          {recalculating ? 'Recalculating...' : 'Recalculate All'}
        </button>
      </ToolCard>

      {/* Seed IKL Data */}
      <ToolCard icon={<Database className="w-4 h-4 text-orange-400" />} title="Seed IKL Data"
        description="Create a new season with IKL Spring 2026 teams and players data. Use this to initialize a fresh season.">
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
          <span className="text-yellow-500 text-xs font-bold">This creates a new season. Make sure you haven't already seeded.</span>
        </div>
        <StatusMsg msg={seedMsg} successWord="Seeded" />
        <button onClick={handleSeedIkl} disabled={seeding}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
          style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}>
          <Database className="w-3.5 h-3.5" />
          {seeding ? 'Seeding...' : 'Seed IKL Full'}
        </button>
      </ToolCard>

      <AuditLogPanel />
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────

function ToolCard({ icon, title, description, children }: {
  icon: React.ReactNode; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">{title}</h3>
      </div>
      <p className="text-gray-600 text-xs mb-3">{description}</p>
      {children}
    </div>
  );
}

function StatusMsg({ msg, successWord }: { msg: string; successWord: string }) {
  if (!msg) return null;
  const isSuccess = msg.includes(successWord);
  return (
    <p className={`text-xs font-bold mb-3 px-3 py-2 rounded-lg ${isSuccess ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
      {msg}
    </p>
  );
}
