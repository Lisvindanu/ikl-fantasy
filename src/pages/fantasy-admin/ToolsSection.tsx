import { useState } from 'react';
import {
  RefreshCw, Download, Mail, DollarSign, Target,
  Database, AlertTriangle, ScrollText, Wrench,
} from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { AdminSectionProps } from './adminConstants';
import { AdminPanel } from './shared';
import { GradePredictionsPanel } from './GradePredictionsPanel';
import { AuditLogPanel } from './AuditLogPanel';

// ── Main section ─────────────────────────────────────────────────────────────

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
    <div className="space-y-5">
      {/* Section header */}
      <AdminPanel>
        <div className="px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-tight">Command Deck</h2>
            <p className="text-[10px] font-medium text-gray-600">Administrative tools and utilities</p>
          </div>
        </div>
      </AdminPanel>

      {/* Update Dynamic Prices */}
      <ToolCard
        icon={<DollarSign className="w-4 h-4" />}
        iconColor="#22C55E"
        title="Update Player Prices"
        description="Recalculate dynamic player prices based on performance. Higher-performing players become more expensive."
      >
        <StatusMsg msg={priceMsg} successWord="updated" />
        <ActionBtn
          onClick={handleUpdatePrices}
          disabled={updatingPrices}
          color="#22C55E"
          icon={<DollarSign className="w-3.5 h-3.5" />}
        >
          {updatingPrices ? 'Updating...' : 'Update Prices'}
        </ActionBtn>
      </ToolCard>

      {/* Grade Predictions */}
      <ToolCard
        icon={<Target className="w-4 h-4" />}
        iconColor="#A855F7"
        title="Grade Predictions"
        description="Grade predictions for completed matches. Select a match below to grade its predictions."
      >
        <GradePredictionsPanel matches={matches} onGraded={onRefreshMatches} />
      </ToolCard>

      {/* Weekly Recap Email */}
      <ToolCard
        icon={<Mail className="w-4 h-4" />}
        iconColor="#3B82F6"
        title="Weekly Recap Email"
        description="Send a weekly recap email to all fantasy participants with their rank, points, top performer, and recent results."
      >
        <StatusMsg msg={recapMsg} successWord="sent" />
        {showRecapConfirm ? (
          <div className="flex items-center gap-3">
            <span className="text-amber-400 text-xs font-bold">Send recap to all participants?</span>
            <button
              onClick={handleSendRecap}
              disabled={sendingRecap}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50 transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
              }}
            >
              {sendingRecap ? 'Sending...' : 'Yes, Send'}
            </button>
            <button
              onClick={() => setShowRecapConfirm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <ActionBtn
            onClick={() => setShowRecapConfirm(true)}
            disabled={sendingRecap}
            color="#3B82F6"
            icon={<Mail className="w-3.5 h-3.5" />}
          >
            {sendingRecap ? 'Sending...' : 'Send Weekly Recap'}
          </ActionBtn>
        )}
      </ToolCard>

      {/* Export */}
      <ToolCard
        icon={<Download className="w-4 h-4" />}
        iconColor="#22C55E"
        title="Export Data"
        description="Download all season data as JSON including matches, stats, leaderboard, and players."
      >
        <a
          href={fantasyApi.getExportUrl(season.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(180deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.06) 100%)',
            color: '#86EFAC',
            border: '1px solid rgba(34,197,94,0.18)',
            boxShadow: '0 0 12px rgba(34,197,94,0.06)',
          }}
        >
          <Download className="w-3.5 h-3.5" /> Export Season Data
        </a>
      </ToolCard>

      {/* Recalculate */}
      <ToolCard
        icon={<RefreshCw className="w-4 h-4" />}
        iconColor="#F59E0B"
        title="Recalculate Points"
        description="Recalculate all fantasy points, player totals, and leaderboard rankings from match stats."
      >
        <StatusMsg msg={recalcMsg} successWord="done" />
        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-black disabled:opacity-50 transition-all hover:brightness-110 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)',
            boxShadow: '0 4px 12px rgba(245,158,11,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          {recalculating ? 'Recalculating...' : 'Recalculate All'}
        </button>
      </ToolCard>

      {/* Seed IKL Data */}
      <ToolCard
        icon={<Database className="w-4 h-4" />}
        iconColor="#F97316"
        title="Seed IKL Data"
        description="Create a new season with IKL Spring 2026 teams and players data. Use this to initialize a fresh season."
      >
        <div
          className="flex items-center gap-2.5 mb-3 px-3.5 py-2.5 rounded-xl"
          style={{
            background: 'linear-gradient(180deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.02) 100%)',
            border: '1px solid rgba(245,158,11,0.1)',
          }}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="text-amber-500/80 text-xs font-bold">
            This creates a new season. Make sure you haven't already seeded.
          </span>
        </div>
        <StatusMsg msg={seedMsg} successWord="Seeded" />
        <ActionBtn
          onClick={handleSeedIkl}
          disabled={seeding}
          color="#F97316"
          icon={<Database className="w-3.5 h-3.5" />}
        >
          {seeding ? 'Seeding...' : 'Seed IKL Full'}
        </ActionBtn>
      </ToolCard>

      {/* Audit Log */}
      <ToolCard
        icon={<ScrollText className="w-4 h-4" />}
        iconColor="#6B7280"
        title="Audit Log"
        description="Review recent administrative actions across the system."
      >
        <AuditLogPanel />
      </ToolCard>
    </div>
  );
}

// ── ToolCard — uses AdminPanel internally ────────────────────────────────────

function ToolCard({ icon, iconColor, title, description, children }: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <AdminPanel>
      <div className="p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: `${iconColor}12`,
              border: `1px solid ${iconColor}20`,
              color: iconColor,
            }}
          >
            {icon}
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">
            {title}
          </h3>
        </div>
        <p className="text-gray-600 text-xs mb-4 leading-relaxed pl-[38px]">{description}</p>
        <div className="pl-[38px]">{children}</div>
      </div>
    </AdminPanel>
  );
}

// ── ActionBtn ────────────────────────────────────────────────────────────────

function ActionBtn({ children, onClick, disabled, color, icon }: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 transition-all hover:brightness-110 active:scale-[0.98]"
      style={{
        background: `linear-gradient(180deg, ${color}18 0%, ${color}0A 100%)`,
        color: `${color}CC`,
        border: `1px solid ${color}28`,
        boxShadow: `0 0 12px ${color}08`,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

// ── StatusMsg ────────────────────────────────────────────────────────────────

function StatusMsg({ msg, successWord }: { msg: string; successWord: string }) {
  if (!msg) return null;
  const ok = msg.includes(successWord);
  return (
    <p
      className={`text-xs font-bold mb-3 px-3.5 py-2.5 rounded-xl ${
        ok
          ? 'text-green-400'
          : 'text-red-400'
      }`}
      style={{
        background: ok
          ? 'linear-gradient(180deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.03) 100%)'
          : 'linear-gradient(180deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.03) 100%)',
        border: ok
          ? '1px solid rgba(34,197,94,0.12)'
          : '1px solid rgba(239,68,68,0.12)',
      }}
    >
      {msg}
    </p>
  );
}
