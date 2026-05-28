import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Users, X, Check, Search, Bell, Trash2 } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { Friend, PendingRequest, UserSearchResult } from '../../api/fantasy';

interface FriendsSectionProps {
  userId: number;
}

export function FriendsSection({ userId }: FriendsSectionProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Feedback
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [f, p] = await Promise.all([
        fantasyApi.getFriends(),
        fantasyApi.getPendingRequests(),
      ]);
      setFriends(f);
      setPending(p);
    } catch {
      // silent
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await fantasyApi.searchUsers(searchQuery);
      // Filter out self and existing friends
      const friendIds = new Set(friends.map(f => f.friend_id));
      setSearchResults(results.filter(r => r.id !== userId && !friendIds.has(r.id)));
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, friends, userId]);

  async function handleSendRequest(friendId: number) {
    setMsg(null);
    try {
      await fantasyApi.sendFriendRequest(friendId);
      setMsg({ type: 'ok', text: 'Friend request sent!' });
      setSearchQuery('');
      setSearchResults([]);
    } catch (e: unknown) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Failed to send request' });
    }
  }

  async function handleAccept(requestId: number) {
    setMsg(null);
    try {
      await fantasyApi.acceptFriendRequest(requestId);
      setMsg({ type: 'ok', text: 'Friend request accepted!' });
      await fetchData();
    } catch (e: unknown) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Failed to accept' });
    }
  }

  async function handleDecline(requestId: number) {
    setMsg(null);
    try {
      await fantasyApi.declineFriendRequest(requestId);
      setPending(prev => prev.filter(p => p.id !== requestId));
    } catch (e: unknown) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Failed to decline' });
    }
  }

  async function handleRemove(friendshipId: number) {
    setMsg(null);
    try {
      await fantasyApi.removeFriend(friendshipId);
      setFriends(prev => prev.filter(f => f.id !== friendshipId));
      setMsg({ type: 'ok', text: 'Friend removed' });
    } catch (e: unknown) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Failed to remove' });
    }
  }

  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {msg && (
        <div className={`text-xs font-bold px-3 py-2 rounded-xl ${msg.type === 'ok' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
          {msg.text}
        </div>
      )}

      {/* Pending Requests */}
      {pending.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(251,191,36,0.15)' }}>
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
              Pending Requests ({pending.length})
            </h4>
          </div>
          <div className="divide-y divide-white/5">
            {pending.map(req => (
              <div key={req.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-bold text-white text-sm">{req.from_name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleAccept(req.id)}
                    className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"
                    title="Accept">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDecline(req.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Decline">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Friend */}
      <div>
        <button onClick={() => setShowSearch(v => !v)}
          className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors mb-3">
          <UserPlus className="w-3.5 h-3.5" />
          {showSearch ? 'Hide Search' : 'Add Friend'}
        </button>

        {showSearch && (
          <div className="rounded-2xl p-4 mb-4" style={{ background: '#0d1017', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-white text-sm outline-none"
                style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            {searching && (
              <div className="py-3 flex justify-center">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              </div>
            )}

            {!searching && searchResults.length > 0 && (
              <div className="mt-3 divide-y divide-white/5">
                {searchResults.map(user => (
                  <div key={user.id} className="py-2.5 flex items-center justify-between gap-3">
                    <span className="font-bold text-white text-sm truncate">{user.name}</span>
                    <button onClick={() => handleSendRequest(user.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 flex-shrink-0"
                      style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-gray-600 text-xs mt-3 text-center">No users found</p>
            )}
          </div>
        )}
      </div>

      {/* Friends List */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
            Friends ({friends.length})
          </h4>
        </div>
        {friends.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="w-8 h-8 text-gray-800 mx-auto mb-2" />
            <p className="text-gray-600 text-sm font-bold">No friends yet</p>
            <p className="text-gray-700 text-xs mt-1">Search and add friends to compete together</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {friends.map(friend => (
              <div key={friend.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <span className="font-bold text-white text-sm truncate">{friend.friend_name}</span>
                <button onClick={() => handleRemove(friend.id)}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Remove friend">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
