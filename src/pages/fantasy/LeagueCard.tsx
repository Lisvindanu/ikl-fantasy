import { useState, useRef, useEffect } from 'react';
import { Copy, Check, Trophy, MoreVertical, Trash2, Share2, LogOut } from 'lucide-react';
import type { FantasyLeague } from '../../api/fantasy';

interface LeagueCardProps {
  league: FantasyLeague;
  onOpen: () => void;
  currentUserId: number | null;
  onDelete?: (leagueId: number) => void;
  onLeave?: (leagueId: number) => void;
}

export function LeagueCard({ league, onOpen, currentUserId, onDelete, onLeave }: LeagueCardProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCreator = currentUserId === league.creator_id;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmDelete(false);
        setConfirmLeave(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  function copyCode(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(league.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareLeague(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/fantasy?league=${league.id}`;
    if (navigator.share) {
      navigator.share({ title: `Join ${league.name}`, text: `Join my IKL Fantasy league! Code: ${league.invite_code}`, url });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setMenuOpen(false);
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete?.(league.id);
    setMenuOpen(false);
    setConfirmDelete(false);
  }

  function handleLeaveClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirmLeave) {
      setConfirmLeave(true);
      return;
    }
    onLeave?.(league.id);
    setMenuOpen(false);
    setConfirmLeave(false);
  }

  return (
    <div className="relative">
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
              {isCreator && <span className="ml-2 text-amber-600">· Creator</span>}
            </div>
          </div>
          <button onClick={copyCode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#9CA3AF' }}>
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {league.invite_code}
          </button>
          {/* Kebab menu */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); setConfirmDelete(false); setConfirmLeave(false); }}
              className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/10 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute right-3 top-14 w-44 rounded-xl py-1 shadow-2xl z-20"
          style={{ background: '#1a1d24', border: '1px solid rgba(255,255,255,0.12)' }}
          ref={menuRef}>
          <button onClick={shareLeague}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
          {isCreator ? (
            <button onClick={handleDeleteClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 className="w-4 h-4" />
              {confirmDelete ? 'Yakin hapus?' : 'Hapus Liga'}
            </button>
          ) : (
            <button onClick={handleLeaveClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-4 h-4" />
              {confirmLeave ? 'Yakin keluar?' : 'Keluar Liga'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
