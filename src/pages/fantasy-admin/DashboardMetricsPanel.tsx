import { useState, useEffect } from 'react';
import { Shield, Gamepad2, ClipboardList, UserCheck, Activity } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { AdminDashboardMetrics } from '../../api/fantasy';

export function DashboardMetricsPanel({ seasonId }: { seasonId: number }) {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  useEffect(() => {
    fantasyApi.adminGetDashboardMetrics(seasonId).then(setMetrics).catch(() => {});
  }, [seasonId]);

  if (!metrics) return null;

  const statCards = [
    { icon: <UserCheck className="w-4 h-4" />, label: 'Draft Players', value: metrics.totalParticipants, color: '#22C55E' },
    { icon: <Shield className="w-4 h-4" />, label: 'Team Picks', value: metrics.totalTeamPicks, color: '#3B82F6' },
    { icon: <Gamepad2 className="w-4 h-4" />, label: 'Total Matches', value: metrics.totalMatches, color: '#F59E0B' },
    { icon: <ClipboardList className="w-4 h-4" />, label: 'Stat Entries', value: metrics.totalStatRows, color: '#A855F7' },
  ];

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map(c => (
          <div key={c.label} className="rounded-xl p-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg" style={{ background: `${c.color}15`, color: c.color }}>{c.icon}</div>
            </div>
            <div className="text-2xl font-black text-white">{c.value}</div>
            <div className="text-xs text-gray-600 font-bold">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Match status breakdown + recent activity */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Matches by Status</h4>
          <div className="space-y-2">
            {(['upcoming', 'live', 'completed', 'postponed'] as const).map(s => {
              const cnt = metrics.matchesByStatus[s] || 0;
              const color = s === 'live' ? '#22C55E' : s === 'completed' ? '#3B82F6' : s === 'postponed' ? '#EF4444' : '#6B7280';
              const pct = metrics.totalMatches > 0 ? (cnt / metrics.totalMatches) * 100 : 0;
              return (
                <div key={s}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold capitalize" style={{ color }}>{s}</span>
                    <span className="text-gray-500 font-bold">{cnt}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Recent Activity
          </h4>
          {metrics.recentActivity.length === 0 ? (
            <p className="text-gray-700 text-xs">No activity yet</p>
          ) : (
            <div className="space-y-2">
              {metrics.recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-white font-bold">{a.admin_name}</span>
                    <span className="text-gray-600"> {a.action.replace(/_/g, ' ')}</span>
                    <div className="text-gray-700 text-[10px]">
                      {new Date(a.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
