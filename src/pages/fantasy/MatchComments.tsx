import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Trash2, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { MatchComment } from '../../api/fantasy';
import * as fantasyApi from '../../api/fantasy';

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
  matchId: number;
}

export function MatchComments({ matchId }: Props) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<MatchComment[]>([]);
  const [collapsed, setCollapsed] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      const data = await fantasyApi.getMatchComments(matchId);
      setComments(data);
      setLoaded(true);
    } catch {
      // fail silently
    }
  }, [matchId]);

  // Load comment count on mount
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const comment = await fantasyApi.addMatchComment(matchId, newComment.trim());
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: number) {
    try {
      await fantasyApi.deleteMatchComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  }

  const commentCount = comments.length;

  return (
    <div className="mt-3">
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors w-full justify-center py-1.5"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span className="font-bold">
          {commentCount > 0 ? `${commentCount} Comment${commentCount !== 1 ? 's' : ''}` : 'Comments'}
        </span>
        {commentCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black"
            style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA' }}>
            {commentCount}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>

      {/* Comments section */}
      {!collapsed && (
        <div className="mt-2 space-y-2">
          {/* Comment input */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                maxLength={500}
                className="flex-1 text-xs px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-600 outline-none focus:border-blue-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30"
                style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.3)' }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <p className="text-xs text-gray-600 text-center py-2">Log in to comment</p>
          )}

          {/* Comments list */}
          {loaded && comments.length === 0 && (
            <p className="text-xs text-gray-700 text-center py-3">No comments yet. Be the first!</p>
          )}

          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {comments.map(c => (
              <div key={c.id} className="flex items-start gap-2 px-3 py-2 rounded-xl"
                style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-300">{c.user_name}</span>
                    <span className="text-[10px] text-gray-700">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 break-words">{c.content}</p>
                </div>
                {user && String(user.id) === String(c.user_id) && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
