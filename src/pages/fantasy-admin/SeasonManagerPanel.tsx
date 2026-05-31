import { useState } from 'react';
import { Plus, Copy, Trash2, Users, UserPlus, CalendarPlus, ChevronDown, ChevronUp } from 'lucide-react';
import * as fantasyApi from '../../api/fantasy';
import type { IKLSeason, IKLTeam } from '../../api/fantasy';
import { AdminPanel, Field, Input, Select } from './shared';

const ROLES = ['CLASH', 'JGL', 'MID', 'FARM', 'ROAM'] as const;

/* ── Create Season Form ──────────────────────────────────────────────────── */

function CreateSeasonForm({ onCreated }: { onCreated: (s: IKLSeason) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [dates, setDates] = useState('');
  const [edition, setEdition] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleCreate() {
    if (!name.trim()) { setMsg('Name is required'); return; }
    setBusy(true); setMsg('');
    try {
      const season = await fantasyApi.adminCreateSeason({
        name: name.trim(),
        fullName: fullName.trim() || undefined,
        dates: dates.trim() || undefined,
        edition: edition.trim() || undefined,
        prizePool: prizePool.trim() || undefined,
      });
      setMsg(`Season "${season.name}" created (ID: ${season.id})`);
      setName(''); setFullName(''); setDates(''); setEdition(''); setPrizePool('');
      onCreated(season);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed');
    }
    setBusy(false);
  }

  return (
    <AdminPanel className="overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}>
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white">Buat Season Baru</h3>
            <p className="text-[10px] text-gray-600">Buat season kosong, lalu tambah tim & jadwal</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nama Season *">
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="IKL Summer 2026" />
            </Field>
            <Field label="Nama Lengkap">
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Indonesia Kings League Summer 2026" />
            </Field>
            <Field label="Tanggal">
              <Input value={dates} onChange={e => setDates(e.target.value)} placeholder="Jun - Sep 2026" />
            </Field>
            <Field label="Edisi">
              <Input value={edition} onChange={e => setEdition(e.target.value)} placeholder="4th Edition" />
            </Field>
            <Field label="Prize Pool">
              <Input value={prizePool} onChange={e => setPrizePool(e.target.value)} placeholder="Rp 500.000.000" />
            </Field>
          </div>
          {msg && <StatusLine msg={msg} ok={msg.includes('created')} />}
          <button onClick={handleCreate} disabled={busy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-black disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', boxShadow: '0 2px 12px rgba(34,197,94,0.25)' }}>
            <Plus className="w-3.5 h-3.5" />
            {busy ? 'Membuat...' : 'Buat Season'}
          </button>
        </div>
      )}
    </AdminPanel>
  );
}

/* ── Clone Season Form ───────────────────────────────────────────────────── */

function CloneSeasonForm({ allSeasons, onCloned }: {
  allSeasons: IKLSeason[];
  onCloned: (result: { season: IKLSeason; teams: number; players: number; matches: number }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [sourceId, setSourceId] = useState(allSeasons[0]?.id ?? 0);
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [dates, setDates] = useState('');
  const [edition, setEdition] = useState('');
  const [startDate, setStartDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleClone() {
    if (!name.trim()) { setMsg('Nama season baru wajib diisi'); return; }
    if (!sourceId) { setMsg('Pilih season sumber'); return; }
    setBusy(true); setMsg('');
    try {
      const result = await fantasyApi.adminCloneSeason(sourceId, {
        name: name.trim(),
        fullName: fullName.trim() || undefined,
        dates: dates.trim() || undefined,
        edition: edition.trim() || undefined,
        startDate: startDate || undefined,
      });
      setMsg(`Berhasil! ${result.teams} tim, ${result.players} pemain, ${result.matches} match di-clone.`);
      setName(''); setFullName(''); setDates(''); setEdition(''); setStartDate('');
      onCloned(result);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Gagal clone');
    }
    setBusy(false);
  }

  return (
    <AdminPanel className="overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', color: '#3B82F6' }}>
            <Copy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white">Clone Season</h3>
            <p className="text-[10px] text-gray-600">Salin tim + pemain dari season lama, auto-generate jadwal</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Season Sumber *">
              <Select value={sourceId} onChange={e => setSourceId(Number(e.target.value))}>
                {allSeasons.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name} (ID: {s.id})</option>
                ))}
              </Select>
            </Field>
            <Field label="Nama Season Baru *">
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="IKL Summer 2026" />
            </Field>
            <Field label="Nama Lengkap">
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Indonesia Kings League Summer 2026" />
            </Field>
            <Field label="Tanggal">
              <Input value={dates} onChange={e => setDates(e.target.value)} placeholder="Jun - Sep 2026" />
            </Field>
            <Field label="Edisi">
              <Input value={edition} onChange={e => setEdition(e.target.value)} placeholder="4th Edition" />
            </Field>
            <Field label="Tanggal Mulai (Jadwal)">
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </Field>
          </div>
          {msg && <StatusLine msg={msg} ok={msg.includes('Berhasil')} />}
          <button onClick={handleClone} disabled={busy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-black disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', boxShadow: '0 2px 12px rgba(59,130,246,0.25)' }}>
            <Copy className="w-3.5 h-3.5" />
            {busy ? 'Cloning...' : 'Clone Season'}
          </button>
        </div>
      )}
    </AdminPanel>
  );
}

/* ── Add Team Form ───────────────────────────────────────────────────────── */

function AddTeamForm({ seasonId, onAdded }: { seasonId: number; onAdded: () => void }) {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [color, setColor] = useState('#F59E0B');
  const [logoUrl, setLogoUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleAdd() {
    if (!name.trim() || !shortName.trim()) { setMsg('Nama dan singkatan wajib diisi'); return; }
    setBusy(true); setMsg('');
    try {
      await fantasyApi.adminCreateTeam(seasonId, {
        name: name.trim(),
        shortName: shortName.trim().toUpperCase(),
        color,
        logoUrl: logoUrl.trim() || undefined,
      });
      setMsg(`Tim "${name}" berhasil ditambah!`);
      setName(''); setShortName(''); setLogoUrl('');
      onAdded();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Gagal');
    }
    setBusy(false);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Nama Tim *">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Mahadewa" />
        </Field>
        <Field label="Singkatan *">
          <Input value={shortName} onChange={e => setShortName(e.target.value)} placeholder="MDW" className="uppercase" />
        </Field>
        <Field label="Warna">
          <div className="flex gap-2">
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
            <Input value={color} onChange={e => setColor(e.target.value)} className="flex-1" />
          </div>
        </Field>
        <Field label="Logo URL">
          <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." />
        </Field>
      </div>
      {msg && <StatusLine msg={msg} ok={msg.includes('berhasil')} />}
      <button onClick={handleAdd} disabled={busy}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold disabled:opacity-50 transition-all"
        style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
        <Plus className="w-3 h-3" />
        {busy ? 'Menambah...' : 'Tambah Tim'}
      </button>
    </div>
  );
}

/* ── Add Player Form ─────────────────────────────────────────────────────── */

function AddPlayerForm({ teams, onAdded }: { teams: IKLTeam[]; onAdded: () => void }) {
  const [teamId, setTeamId] = useState(teams[0]?.id ?? 0);
  const [name, setName] = useState('');
  const [role, setRole] = useState<string>('MID');
  const [price, setPrice] = useState('10');
  const [nationality, setNationality] = useState('ID');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleAdd() {
    if (!name.trim()) { setMsg('Nama pemain wajib diisi'); return; }
    if (!teamId) { setMsg('Pilih tim'); return; }
    setBusy(true); setMsg('');
    try {
      await fantasyApi.adminCreatePlayer(teamId, {
        name: name.trim(),
        role,
        price: Number(price) || 10,
        nationality: nationality.trim() || undefined,
      });
      setMsg(`Pemain "${name}" berhasil ditambah!`);
      setName('');
      onAdded();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Gagal');
    }
    setBusy(false);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Field label="Tim *">
          <Select value={teamId} onChange={e => setTeamId(Number(e.target.value))}>
            {teams.map(t => <option key={t.id} value={t.id}>{t.short_name} — {t.name}</option>)}
          </Select>
        </Field>
        <Field label="Nama *">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="PlayerName" />
        </Field>
        <Field label="Role *">
          <Select value={role} onChange={e => setRole(e.target.value)}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
        <Field label="Harga">
          <Input type="number" value={price} onChange={e => setPrice(e.target.value)} min={1} />
        </Field>
        <Field label="Negara">
          <Input value={nationality} onChange={e => setNationality(e.target.value)} placeholder="ID" />
        </Field>
      </div>
      {msg && <StatusLine msg={msg} ok={msg.includes('berhasil')} />}
      <button onClick={handleAdd} disabled={busy}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold disabled:opacity-50 transition-all"
        style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
        <UserPlus className="w-3 h-3" />
        {busy ? 'Menambah...' : 'Tambah Pemain'}
      </button>
    </div>
  );
}

/* ── Generate Schedule Form ──────────────────────────────────────────────── */

function GenerateScheduleForm({ seasonId, teamCount, onGenerated }: {
  seasonId: number; teamCount: number; onGenerated: () => void;
}) {
  const [startDate, setStartDate] = useState('');
  const [bestOf, setBestOf] = useState('5');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleGenerate() {
    if (teamCount < 2) { setMsg('Minimal 2 tim untuk generate jadwal'); return; }
    if (!window.confirm(`Generate jadwal round-robin untuk ${teamCount} tim (${teamCount * (teamCount - 1) / 2} match)?`)) return;
    setBusy(true); setMsg('');
    try {
      const result = await fantasyApi.adminGenerateSchedule(seasonId, {
        startDate: startDate || undefined,
        bestOf: Number(bestOf) || 5,
      });
      setMsg(`Jadwal berhasil dibuat! ${result.matches} match dalam ${result.weeks} minggu.`);
      onGenerated();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Gagal');
    }
    setBusy(false);
  }

  const totalMatches = teamCount * (teamCount - 1) / 2;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)' }}>
        <CalendarPlus className="w-3 h-3 text-blue-400/60 flex-shrink-0" />
        <span className="text-blue-400/80 text-[10px] font-bold">
          {teamCount} tim = {totalMatches} match (round-robin), ~{Math.ceil(totalMatches / 9)} minggu
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tanggal Mulai">
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </Field>
        <Field label="Best Of">
          <Select value={bestOf} onChange={e => setBestOf(e.target.value)}>
            <option value="3">BO3</option>
            <option value="5">BO5</option>
            <option value="7">BO7</option>
          </Select>
        </Field>
      </div>
      {msg && <StatusLine msg={msg} ok={msg.includes('berhasil')} />}
      <button onClick={handleGenerate} disabled={busy || teamCount < 2}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold disabled:opacity-50 transition-all"
        style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }}>
        <CalendarPlus className="w-3 h-3" />
        {busy ? 'Generating...' : 'Generate Jadwal'}
      </button>
    </div>
  );
}

/* ── Team list with delete ───────────────────────────────────────────────── */

function TeamList({ teams, onRefresh }: { teams: IKLTeam[]; onRefresh: () => void }) {
  const [deleting, setDeleting] = useState<number | null>(null);

  async function handleDelete(teamId: number, teamName: string) {
    if (!window.confirm(`Hapus tim "${teamName}" beserta semua pemainnya?`)) return;
    setDeleting(teamId);
    try {
      await fantasyApi.adminDeleteTeam(teamId);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal hapus');
    }
    setDeleting(null);
  }

  if (teams.length === 0) {
    return <p className="text-gray-600 text-xs italic py-2">Belum ada tim</p>;
  }

  return (
    <div className="space-y-1.5">
      {teams.map(t => (
        <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-lg group hover:bg-white/[0.02] transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-2.5">
            {t.logo_url ? (
              <img src={t.logo_url!} alt={t.short_name} className="w-6 h-6 rounded object-contain" />
            ) : (
              <div className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-black"
                style={{ background: t.color + '20', color: t.color, border: `1px solid ${t.color}30` }}>
                {t.short_name?.slice(0, 2)}
              </div>
            )}
            <div>
              <span className="text-xs font-bold text-white">{t.name}</span>
              <span className="text-[10px] text-gray-600 ml-2">{t.short_name}</span>
            </div>
          </div>
          <button onClick={() => handleDelete(t.id, t.name)} disabled={deleting === t.id}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10"
            title="Hapus tim">
            {deleting === t.id ? (
              <div className="w-3.5 h-3.5 rounded-full border border-red-500 border-t-transparent animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5 text-red-500/60" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── Main Panel ──────────────────────────────────────────────────────────── */

export function SeasonManagerPanel({
  allSeasons,
  season,
  onRefresh,
}: {
  allSeasons: IKLSeason[];
  season: (IKLSeason & { teams: IKLTeam[] }) | null;
  onRefresh: () => void;
}) {
  const [expandTeams, setExpandTeams] = useState(false);
  const [expandPlayers, setExpandPlayers] = useState(false);
  const [expandSchedule, setExpandSchedule] = useState(false);
  const [deletingSeason, setDeletingSeason] = useState(false);

  async function handleDeleteSeason() {
    if (!season) return;
    if (!window.confirm(`Hapus season "${season.full_name}"? Semua tim dan pemain akan dihapus.`)) return;
    setDeletingSeason(true);
    try {
      await fantasyApi.adminDeleteSeason(season.id);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal hapus season');
    }
    setDeletingSeason(false);
  }

  return (
    <div className="space-y-4">
      {/* Create new */}
      <CreateSeasonForm onCreated={() => onRefresh()} />

      {/* Clone from existing */}
      {allSeasons.length > 0 && (
        <CloneSeasonForm allSeasons={allSeasons} onCloned={() => onRefresh()} />
      )}

      {/* Team & Player management for current season */}
      {season && (
        <>
          {/* Teams */}
          <AdminPanel className="overflow-hidden">
            <button onClick={() => setExpandTeams(v => !v)}
              className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">Tim ({season.teams?.length ?? 0})</h3>
                  <p className="text-[10px] text-gray-600">Kelola tim di season ini</p>
                </div>
              </div>
              {expandTeams ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
            </button>
            {expandTeams && (
              <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="pt-4">
                  <TeamList teams={season.teams ?? []} onRefresh={onRefresh} />
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }} className="pt-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-3">Tambah Tim Baru</p>
                  <AddTeamForm seasonId={season.id} onAdded={onRefresh} />
                </div>
              </div>
            )}
          </AdminPanel>

          {/* Players */}
          <AdminPanel className="overflow-hidden">
            <button onClick={() => setExpandPlayers(v => !v)}
              className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)', color: '#A855F7' }}>
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">Tambah Pemain</h3>
                  <p className="text-[10px] text-gray-600">Tambah pemain ke tim yang ada</p>
                </div>
              </div>
              {expandPlayers ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
            </button>
            {expandPlayers && season.teams && season.teams.length > 0 && (
              <div className="px-5 pb-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <AddPlayerForm teams={season.teams} onAdded={onRefresh} />
              </div>
            )}
            {expandPlayers && (!season.teams || season.teams.length === 0) && (
              <div className="px-5 pb-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <p className="text-gray-600 text-xs italic">Tambah tim dulu sebelum menambah pemain</p>
              </div>
            )}
          </AdminPanel>

          {/* Generate Schedule */}
          <AdminPanel className="overflow-hidden">
            <button onClick={() => setExpandSchedule(v => !v)}
              className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', color: '#3B82F6' }}>
                  <CalendarPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">Generate Jadwal</h3>
                  <p className="text-[10px] text-gray-600">Auto round-robin dari tim yang ada</p>
                </div>
              </div>
              {expandSchedule ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
            </button>
            {expandSchedule && (
              <div className="px-5 pb-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <GenerateScheduleForm
                  seasonId={season.id}
                  teamCount={season.teams?.length ?? 0}
                  onGenerated={onRefresh}
                />
              </div>
            )}
          </AdminPanel>

          {/* Delete Season */}
          <AdminPanel className="overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">Hapus Season</h3>
                  <p className="text-[10px] text-gray-600">Hapus "{season.full_name}" beserta tim & pemain</p>
                </div>
              </div>
              <button onClick={handleDeleteSeason} disabled={deletingSeason}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold disabled:opacity-50 transition-all hover:bg-red-500/20"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Trash2 className="w-3 h-3" />
                {deletingSeason ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </AdminPanel>
        </>
      )}
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function StatusLine({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <p className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg ${ok ? 'text-green-400' : 'text-red-400'}`}
      style={{
        background: ok ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
        border: ok ? '1px solid rgba(34,197,94,0.1)' : '1px solid rgba(239,68,68,0.1)',
      }}>
      {ok ? '' : ''} {msg}
    </p>
  );
}
