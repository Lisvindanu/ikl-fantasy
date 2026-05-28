import { useState, useEffect } from 'react';
import { Shield, Users, Search } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { AdminUser } from '../../api/fantasy';

export function AdminManagementPanel() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState<AdminUser | null | undefined>(undefined);
  const [searching, setSearching] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fantasyApi.adminGetAdmins().then(setAdmins).catch(() => []);
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    setSearching(true);
    setFoundUser(undefined);
    setMsg('');
    try {
      const user = await fantasyApi.adminFindUser(searchEmail.trim());
      setFoundUser(user);
    } catch (e) {
      console.error(e);
      setFoundUser(null);
    } finally {
      setSearching(false);
    }
  }

  async function handleGrant(userId: number) {
    setMsg('');
    try {
      await fantasyApi.adminSetAdmin(userId, true);
      const updated = await fantasyApi.adminGetAdmins();
      setAdmins(updated);
      setFoundUser(prev => prev ? { ...prev, is_admin: true } : prev);
      setMsg('Admin granted!');
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : 'Failed'); }
  }

  async function handleRevoke(userId: number) {
    setMsg('');
    try {
      await fantasyApi.adminSetAdmin(userId, false);
      setAdmins(prev => prev.filter(a => a.id !== userId));
      setMsg('Admin revoked');
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : 'Failed'); }
  }

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
        <Users className="w-4 h-4 text-amber-400" /> Admin Accounts
      </h3>

      {/* Current admins */}
      {admins.length > 0 && (
        <div className="space-y-2">
          {admins.map(a => (
            <div key={a.id} className="flex items-center gap-3 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <Shield className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm">{a.name}</div>
                <div className="text-gray-600 text-xs truncate">{a.email}</div>
              </div>
              <button onClick={() => handleRevoke(a.id)}
                className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded">
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Grant admin by email */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
          <input
            value={searchEmail}
            onChange={e => setSearchEmail(e.target.value)}
            placeholder="Search user by email"
            className="w-full pl-8 pr-3 py-2 rounded-lg text-white text-sm outline-none"
            style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
        <button type="submit" disabled={searching}
          className="px-4 py-2 rounded-lg text-xs font-bold text-black disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
          {searching ? '…' : 'Search'}
        </button>
      </form>

      {foundUser === null && <p className="text-gray-600 text-xs">User not found</p>}
      {foundUser && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm">{foundUser.name}</div>
            <div className="text-gray-600 text-xs">{foundUser.email}</div>
          </div>
          {foundUser.is_admin ? (
            <span className="text-xs text-amber-400 font-bold">Already admin</span>
          ) : (
            <button onClick={() => handleGrant(foundUser.id)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg text-black"
              style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
              Grant Admin
            </button>
          )}
        </div>
      )}

      {msg && <p className={`text-xs font-bold ${msg.includes('granted') || msg.includes('!') ? 'text-green-400' : msg.includes('revoked') ? 'text-amber-400' : 'text-red-400'}`}>{msg}</p>}
    </div>
  );
}
