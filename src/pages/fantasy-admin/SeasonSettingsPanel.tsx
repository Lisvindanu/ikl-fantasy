import { useState } from 'react';
import { Settings, Lock, Hash } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { SeasonMeta } from '../../api/fantasy';

export function SeasonSettingsPanel({ seasonId, initial }: { seasonId: number; initial: SeasonMeta | null }) {
  const [picksLockAt, setPicksLockAt] = useState(
    initial?.picks_lock_at ? new Date(initial.picks_lock_at).toISOString().slice(0, 16) : ''
  );
  const [maxParticipants, setMaxParticipants] = useState<string>(
    initial?.max_participants != null ? String(initial.max_participants) : ''
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await fantasyApi.adminUpdateSeasonSettings(seasonId, {
        picksLockAt: picksLockAt ? new Date(picksLockAt).toISOString() : null,
        maxParticipants: maxParticipants !== '' ? Number(maxParticipants) : null,
      });
      setMsg('Settings saved!');
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Failed to save');
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="rounded-2xl p-5 space-y-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
        <Settings className="w-4 h-4 text-amber-400" /> Season Settings
      </h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> Picks Lock Date
          </label>
          <input
            type="datetime-local"
            value={picksLockAt}
            onChange={e => setPicksLockAt(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none"
            style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
          />
          <p className="text-gray-700 text-xs">After this time, no new picks or changes</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Hash className="w-3 h-3" /> Max Participants
          </label>
          <input
            type="number"
            min={1}
            placeholder="Unlimited"
            value={maxParticipants}
            onChange={e => setMaxParticipants(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none"
            style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <p className="text-gray-700 text-xs">Leave empty for unlimited registrations</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving}
          className="px-5 py-2 rounded-xl font-bold text-sm text-black disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {msg && (
          <span className={`text-xs font-bold ${msg.includes('saved') ? 'text-green-400' : 'text-red-400'}`}>
            {msg}
          </span>
        )}
      </div>
    </form>
  );
}
