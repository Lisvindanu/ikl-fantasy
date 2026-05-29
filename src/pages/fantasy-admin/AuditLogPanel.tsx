import { useState, useEffect } from 'react';
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { AuditLogEntry } from '../../api/fantasy';
import { AdminPanel } from './shared';

export function AuditLogPanel() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLoading(true);
    fantasyApi.adminGetAuditLog(PAGE_SIZE, page * PAGE_SIZE)
      .then(data => {
        setEntries(data);
        setHasMore(data.length >= PAGE_SIZE);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [page]);

  function formatAction(action: string): string {
    return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  function getActionColor(action: string): string {
    if (action.includes('delete') || action.includes('revoke')) return '#EF4444';
    if (action.includes('create') || action.includes('grant')) return '#22C55E';
    if (action.includes('update') || action.includes('save')) return '#3B82F6';
    if (action.includes('recalculate')) return '#F59E0B';
    return '#6B7280';
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Audit Log</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-white/5 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
          <span className="text-xs text-gray-600 font-bold px-2">Page {page + 1}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-white/5 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <AdminPanel>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-gray-600 text-sm">No audit log entries found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600">Time</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600">Admin</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600">Action</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600">Target</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString('id-ID', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-white text-xs">{entry.admin_name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                        style={{
                          background: `${getActionColor(entry.action)}15`,
                          color: getActionColor(entry.action),
                        }}>
                        {formatAction(entry.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {entry.target_type && (
                        <span>
                          {entry.target_type}
                          {entry.target_id ? ` #${entry.target_id}` : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
