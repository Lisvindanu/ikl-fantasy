import { useState } from 'react';
import { Copy, Check, Trophy, ExternalLink } from 'lucide-react';
import type { FantasyLeague } from '../../api/fantasy';

interface LeagueCardProps {
  league: FantasyLeague;
  onOpen: () => void;
  currentUserId: number | null;
}

export function LeagueCard({ league, onOpen, currentUserId }: LeagueCardProps) {
  const [copied, setCopied] = useState(false);

  function copyCode(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(league.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button onClick={onOpen} className="w-full text-left rounded-2xl p-4 transition-all hover:border-white/15"
      style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-white text-sm">{league.name}</div>
          <div className="text-gray-600 text-xs mt-0.5">
            {league.member_count} / {league.max_members} members
            {currentUserId === league.creator_id && <span className="ml-2 text-amber-600">· Creator</span>}
          </div>
        </div>
        <button onClick={copyCode}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#9CA3AF' }}>
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          {league.invite_code}
        </button>
        <ExternalLink className="w-4 h-4 text-gray-700 flex-shrink-0" />
      </div>
    </button>
  );
}
