import { useState } from 'react';
import { Settings } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { SeasonMeta } from '../../api/fantasy';
import { AdminPanel, Field, Input } from './shared';

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
    <AdminPanel>
      <form onSubmit={handleSave} className="p-5 space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4 h-4 text-amber-400" /> Season Settings
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Field label="Picks Lock Date">
              <Input
                type="datetime-local"
                value={picksLockAt}
                onChange={e => setPicksLockAt(e.target.value)}
                className="w-full"
                style={{ colorScheme: 'dark' }}
              />
            </Field>
            <p className="text-gray-700 text-[10px] pl-2.5">After this time, no new picks or changes</p>
          </div>

          <div className="space-y-1">
            <Field label="Max Participants">
              <Input
                type="number"
                min={1}
                placeholder="Unlimited"
                value={maxParticipants}
                onChange={e => setMaxParticipants(e.target.value)}
                className="w-full"
              />
            </Field>
            <p className="text-gray-700 text-[10px] pl-2.5">Leave empty for unlimited registrations</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-black disabled:opacity-60 transition-opacity"
            style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {msg && (
            <span className={`text-xs font-bold ${msg.includes('saved') ? 'text-green-400' : 'text-red-400'}`}>
              {msg}
            </span>
          )}
        </div>
      </form>
    </AdminPanel>
  );
}
