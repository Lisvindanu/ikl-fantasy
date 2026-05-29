import { useState, useEffect } from 'react';
import { Shield, Gamepad2, ClipboardList, UserCheck, Activity } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import * as fantasyApi from '../../api/fantasy';
import type { AdminDashboardMetrics } from '../../api/fantasy';

ChartJS.register(ArcElement, Tooltip, Legend);

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

  const statusLabels = ['upcoming', 'live', 'completed', 'postponed'] as const;
  const statusColors = { upcoming: '#6B7280', live: '#22C55E', completed: '#3B82F6', postponed: '#EF4444' };
  const byStatus = metrics.matchesByStatus || {};

  const chartData = {
    labels: statusLabels.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [{
      data: statusLabels.map(s => byStatus[s] || 0),
      backgroundColor: statusLabels.map(s => `${statusColors[s]}30`),
      borderColor: statusLabels.map(s => statusColors[s]),
      borderWidth: 2,
      hoverBackgroundColor: statusLabels.map(s => `${statusColors[s]}50`),
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1d24',
        titleColor: '#fff',
        bodyColor: '#9CA3AF',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        titleFont: { weight: 'bold' as const, size: 12 },
        bodyFont: { size: 11 },
        cornerRadius: 8,
      },
    },
  };

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

      {/* Chart + recent activity */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Matches by Status</h4>

          {metrics.totalMatches > 0 ? (
            <div className="flex items-center gap-4">
              <div className="w-28 h-28 flex-shrink-0">
                <Doughnut data={chartData} options={chartOptions} />
              </div>
              <div className="space-y-2 flex-1">
                {statusLabels.map(s => {
                  const cnt = byStatus[s] || 0;
                  const color = statusColors[s];
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                      <span className="text-xs font-bold capitalize text-gray-400 flex-1">{s}</span>
                      <span className="text-xs font-black text-white">{cnt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-gray-700 text-xs">No matches yet</p>
          )}
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
