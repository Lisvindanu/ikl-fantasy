import { useState } from 'react';
import {
  RefreshCw, Download, Mail, DollarSign, Target,
  Database, AlertTriangle, Terminal,
} from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { AdminSectionProps } from './adminConstants';
import { AdminPanel } from './shared';
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
    <div className="space-y-4">
      {/* ── Command Deck header ──────────────────────────────────────── */}
      <AdminPanel>
        <div className="px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FBBF24, #D97706)', boxShadow: '0 2px 12px rgba(245,158,11,0.3)' }}>
            <Terminal className="w-4 h-4 text-black" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-tight">Command Deck</h2>
            <p className="text-[10px] font-medium text-gray-600">Administrative tools and utilities</p>
          </div>
        </div>
      </AdminPanel>

      {/* ── Quick Actions — 2-col grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Recalculate Points */}
        <QuickAction
          icon={<RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />}
          color="#F59E0B"
          title="Recalculate Points"
          sub="Rebuild all pts + leaderboard"
          btnLabel={recalculating ? 'Running...' : 'Recalculate'}
          onClick={handleRecalculate}
          disabled={recalculating}
          msg={recalcMsg}
          msgOk="done"
          primary
        />

        {/* Update Player Prices */}
        <QuickAction
          icon={<DollarSign className="w-4 h-4" />}
          color="#22C55E"
          title="Update Prices"
          sub="Performance-based price adjust"
          btnLabel={updatingPrices ? 'Updating...' : 'Update'}
          onClick={handleUpdatePrices}
          disabled={updatingPrices}
          msg={priceMsg}
          msgOk="updated"
        />

        {/* Export Data */}
        <QuickAction
          icon={<Download className="w-4 h-4" />}
          color="#3B82F6"
          title="Export Data"
          sub="Download season JSON dump"
          href={fantasyApi.getExportUrl(season.id)}
        />

        {/* Weekly Recap */}
        {showRecapConfirm ? (
          <AdminPanel className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-amber-400">Send to all participants?</span>
              </div>
              <StatusMsg msg={recapMsg} successWord="sent" />
              <div className="flex gap-2">
                <button onClick={handleSendRecap} disabled={sendingRecap}
                  className="flex-1 py-2 rounded-xl text-xs font-black text-black disabled:opacity-50 transition-all"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>
                  {sendingRecap ? 'Sending...' : 'Yes, Send'}
                </button>
                <button onClick={() => setShowRecapConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  Cancel
                </button>
              </div>
            </div>
          </AdminPanel>
        ) : (
          <QuickAction
            icon={<Mail className="w-4 h-4" />}
            color="#8B5CF6"
            title="Weekly Recap"
            sub="Email all participants"
            btnLabel={sendingRecap ? 'Sending...' : 'Send Recap'}
            onClick={() => setShowRecapConfirm(true)}
            disabled={sendingRecap}
            msg={recapMsg}
            msgOk="sent"
          />
        )}
      </div>

      {/* ── Grade Predictions ────────────────────────────────────────── */}
      <AdminPanel className="p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)', color: '#A855F7' }}>
            <Target className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">Grade Predictions</h3>
            <p className="text-[10px] text-gray-700">Select a completed match to grade</p>
          </div>
        </div>
        <GradePredictionsPanel matches={matches} onGraded={onRefreshMatches} />
      </AdminPanel>

      {/* ── Seed IKL Data ────────────────────────────────────────────── */}
      <AdminPanel className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316' }}>
              <Database className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">Seed IKL Data</h3>
              <p className="text-[10px] text-gray-700">Initialize new season with teams + players</p>
            </div>
          </div>
          <ActionBtn onClick={handleSeedIkl} disabled={seeding} color="#F97316"
            icon={<Database className="w-3 h-3" />}>
            {seeding ? 'Seeding...' : 'Seed'}
          </ActionBtn>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.08)' }}>
          <AlertTriangle className="w-3 h-3 text-amber-500/60 flex-shrink-0" />
          <span className="text-amber-500/60 text-[10px] font-bold">Creates a new season. Make sure you haven't already seeded.</span>
        </div>
        <StatusMsg msg={seedMsg} successWord="Seeded" />
      </AdminPanel>

      {/* ── Audit Log ────────────────────────────────────────────────── */}
      <AdminPanel className="p-5">
        <AuditLogPanel />
      </AdminPanel>
    </div>
  );
}

/* ── QuickAction card ────────────────────────────────────────────────────── */

function QuickAction({ icon, color, title, sub, btnLabel, onClick, disabled, msg, msgOk, href, primary }: {
  icon: React.ReactNode;
  color: string;
  title: string;
  sub: string;
  btnLabel?: string;
  onClick?: () => void;
  disabled?: boolean;
  msg?: string;
  msgOk?: string;
  href?: string;
  primary?: boolean;
}) {
  return (
    <AdminPanel className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: primary
              ? `linear-gradient(135deg, ${color}, ${color}CC)`
              : `${color}14`,
            border: primary ? 'none' : `1px solid ${color}22`,
            color: primary ? '#000' : color,
            boxShadow: primary ? `0 2px 12px ${color}30` : 'none',
          }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-black text-white mb-0.5">{title}</h4>
          <p className="text-[10px] text-gray-600 mb-3">{sub}</p>
          {msg && msgOk && <StatusMsg msg={msg} successWord={msgOk} />}
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: `linear-gradient(180deg, ${color}18 0%, ${color}0A 100%)`,
                color: `${color}DD`,
                border: `1px solid ${color}25`,
              }}>
              <Download className="w-3 h-3" /> Download JSON
            </a>
          ) : btnLabel && onClick ? (
            <button onClick={onClick} disabled={disabled}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold disabled:opacity-50 transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: primary
                  ? `linear-gradient(135deg, ${color}, ${color}CC)`
                  : `linear-gradient(180deg, ${color}18 0%, ${color}0A 100%)`,
                color: primary ? '#000' : `${color}DD`,
                border: primary ? 'none' : `1px solid ${color}25`,
                boxShadow: primary ? `0 2px 10px ${color}25` : 'none',
              }}>
              {btnLabel}
            </button>
          ) : null}
        </div>
      </div>
    </AdminPanel>
  );
}

/* ── ActionBtn ───────────────────────────────────────────────────────────── */

function ActionBtn({ children, onClick, disabled, color, icon }: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold disabled:opacity-50 transition-all hover:brightness-110 active:scale-[0.98]"
      style={{
        background: `linear-gradient(180deg, ${color}18 0%, ${color}0A 100%)`,
        color: `${color}CC`,
        border: `1px solid ${color}28`,
      }}>
      {icon}
      {children}
    </button>
  );
}

/* ── StatusMsg ────────────────────────────────────────────────────────────── */

function StatusMsg({ msg, successWord }: { msg: string; successWord: string }) {
  if (!msg) return null;
  const ok = msg.includes(successWord);
  return (
    <p className={`text-[10px] font-bold mb-2 px-2.5 py-1.5 rounded-lg ${ok ? 'text-green-400' : 'text-red-400'}`}
      style={{
        background: ok ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
        border: ok ? '1px solid rgba(34,197,94,0.1)' : '1px solid rgba(239,68,68,0.1)',
      }}>
      {msg}
    </p>
  );
}
