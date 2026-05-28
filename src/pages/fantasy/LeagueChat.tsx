import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, X, ArrowDown } from 'lucide-react';
import type { LeagueMessage } from '../../api/fantasy-leagues';
import { getLeagueMessages, sendLeagueMessage, deleteLeagueMessage } from '../../api/fantasy-leagues';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  leagueId: number;
  isAuthenticated: boolean;
  userId: number | null;
  userName: string;
}

const POLL_INTERVAL = 15_000;

export function LeagueChat({ leagueId, isAuthenticated, userId, userName }: Props) {
  const [messages, setMessages] = useState<LeagueMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showNewIndicator, setShowNewIndicator] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevCountRef = useRef(0);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setShowNewIndicator(false);
    }
  }, []);

  const checkIfAtBottom = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 40;
    if (isAtBottomRef.current) {
      setShowNewIndicator(false);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const data = await getLeagueMessages(leagueId);
      setMessages(data);
      setLoaded(true);

      // If new messages arrived while scrolled up, show indicator
      if (prevCountRef.current > 0 && data.length > prevCountRef.current && !isAtBottomRef.current) {
        setShowNewIndicator(true);
      }
      prevCountRef.current = data.length;

      // Auto-scroll to bottom on first load or if already at bottom
      if (!prevCountRef.current || isAtBottomRef.current) {
        requestAnimationFrame(() => scrollToBottom());
      }
    } catch {
      // fail silently
    }
  }, [leagueId, scrollToBottom]);

  // Initial load + polling
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadMessages]);

  // Scroll to bottom on first load
  useEffect(() => {
    if (loaded && messages.length > 0) {
      requestAnimationFrame(() => scrollToBottom());
    }
    // Only run once when first loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const msg = await sendLeagueMessage(leagueId, trimmed);
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
      prevCountRef.current += 1;
      requestAnimationFrame(() => scrollToBottom());
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(messageId: number) {
    try {
      await deleteLeagueMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      prevCountRef.current = Math.max(0, prevCountRef.current - 1);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  }

  return (
    <div className="flex flex-col" style={{ maxHeight: '400px' }}>
      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={checkIfAtBottom}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5"
        style={{ minHeight: '120px', maxHeight: '340px' }}
      >
        {loaded && messages.length === 0 && (
          <p className="text-xs text-gray-700 text-center py-8">No messages yet. Start the conversation!</p>
        )}

        {messages.map(msg => (
          <div key={msg.id} className="group flex items-start gap-2 py-1 px-1 rounded hover:bg-white/[0.02] transition-colors">
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-amber-400/80">{msg.user_name}</span>
              <span className="text-[10px] text-gray-700 ml-2">{timeAgo(msg.created_at)}</span>
              <p className="text-xs text-gray-300 break-words leading-relaxed">{msg.content}</p>
            </div>
            {userId != null && String(userId) === String(msg.user_id) && (
              <button
                onClick={() => handleDelete(msg.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-400 transition-all flex-shrink-0 mt-1"
                title="Delete message"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* New messages indicator */}
      {showNewIndicator && (
        <div className="flex justify-center py-1">
          <button
            onClick={scrollToBottom}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-amber-300 transition-all hover:bg-amber-500/20"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <ArrowDown className="w-3 h-3" />
            New messages
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-white/5 px-3 py-2">
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={`Message as ${userName}...`}
              maxLength={500}
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-600 outline-none focus:border-amber-500/40 transition-colors"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || submitting}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.3)' }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <p className="text-xs text-gray-600 text-center py-1">Log in to chat</p>
        )}
      </div>
    </div>
  );
}
