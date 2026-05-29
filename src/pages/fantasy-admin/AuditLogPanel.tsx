import { useState, useEffect } from 'react';
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { AuditLogEntry } from '../../api/fantasy';

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="w-3.5 h-3.5 text-gray-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">Audit Log</h3>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="p-1 rounded-md disabled:opacity-20 hover:bg-white/5 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <span className="text-[10px] text-gray-600 font-bold px-1.5">Page {page + 1}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!hasMore}
            className="p-1 rounded-md disabled:opacity-20 hover:bg-white/5 transition-colors">
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="py-8 text-center text-gray-700 text-xs">No audit log entries found</div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <table className="w-full text-xs min-w-[440px]">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.025)' }}>
                <th className="text-left px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-700">Time</th>
                <th className="text-left px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-700">Admin</th>
                <th className="text-left px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-700">Action</th>
                <th className="text-left px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-700">Target</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id} className="border-t border-white/[0.03] hover:bg-white/[0.015] transition-colors">
                  <td className="px-3 py-2 text-gray-600 text-[11px] whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString('id-ID', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-bold text-white text-[11px]">{entry.admin_name}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                      style={{
                        background: `${getActionColor(entry.action)}12`,
                        color: getActionColor(entry.action),
                      }}>
                      {formatAction(entry.action)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-600 text-[11px]">
                    {entry.target_type && (
                      <span>{entry.target_type}{entry.target_id ? ` #${entry.target_id}` : ''}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
