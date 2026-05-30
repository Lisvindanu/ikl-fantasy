import { RotateCcw, Save, Lock } from 'lucide-react';
import type { Role } from '../../components/fantasy/types';
import type { IKLPlayer } from '../../api/fantasy';

interface DraftActionsProps {
  teamName: string;
  setTeamName: (n: string) => void;
  saving: boolean;
  saveMsg: string;
  onSave: () => void;
  isAuthenticated: boolean;
  filledCount: number;
  setPicks: React.Dispatch<React.SetStateAction<Record<Role, IKLPlayer | null>>>;
  setBenchPicks: React.Dispatch<React.SetStateAction<[IKLPlayer | null, IKLPlayer | null]>>;
}

export function DraftActions({
  teamName, setTeamName,
  saving, saveMsg, onSave,
  isAuthenticated, filledCount,
  setPicks, setBenchPicks,
}: DraftActionsProps) {
  return (
    <>
      <input
        value={teamName}
        onChange={e => setTeamName(e.target.value)}
        placeholder="Your Team Name"
        maxLength={50}
        className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-700 font-bold text-sm focus:outline-none"
        style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.1)' }}
        onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.5)')}
        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
      />
      <div className="flex gap-2">
        <button
          onClick={() => { setPicks({ CLASH: null, JGL: null, MID: null, FARM: null, ROAM: null }); setBenchPicks([null, null]); }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 hover:text-white transition-colors"
          style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        {isAuthenticated ? (
          <button onClick={onSave} disabled={saving || filledCount < 5}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black disabled:opacity-40"
            style={{ background: 'linear-gradient(90deg,#F59E0B,#D97706)', color: '#000' }}>
            {saving
              ? <div className="w-4 h-4 rounded-full border-2 border-black/40 border-t-transparent animate-spin" />
              : <Save className="w-4 h-4" />}
            Save Team
          </button>
        ) : (
          <button onClick={() => { window.location.href = '/auth'; }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Lock className="w-4 h-4" /> Login to Save
          </button>
        )}
      </div>
      {saveMsg && (
        <p className={`text-center text-sm font-bold py-2 rounded-xl ${saveMsg.includes('!') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
          {saveMsg}
        </p>
      )}
    </>
  );
}
