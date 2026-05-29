import { useState, useCallback, useEffect } from 'react';
import { Search, Wallet, RotateCcw, Save, Lock, Share2, Image, Palette } from 'lucide-react';
import { ROLE_META, ROLES, FORMATION_LAYOUT, BUDGET, MAX_PER_TEAM } from '../../components/fantasy/types';
import type { Role, DraftProps } from '../../components/fantasy/types';
import type { IKLPlayer } from '../../api/fantasy';
import { updateTeamKit, getMyTeam } from '../../api/fantasy';
import { RoleImg } from '../../components/fantasy/RoleImg';
import { PickerCard } from '../../components/fantasy/PickerCard';
import { FormationSlot } from '../../components/fantasy/FormationSlot';

// ── Share Lineup Card (#123) ─────────────────────────────────────────────────

interface ShareCardPick {
  readonly role: string;
  readonly name: string;
  readonly teamShort: string;
  readonly teamColor: string;
  readonly fantasyPts: number;
  readonly isCaptain: boolean;
  readonly isViceCaptain: boolean;
}

function generateShareCard(
  teamName: string,
  cardPicks: readonly ShareCardPick[],
  totalPts: number,
): HTMLCanvasElement {
  const W = 600;
  const H = 800;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0d1017');
  grad.addColorStop(0.5, '#131825');
  grad.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative top bar
  const topGrad = ctx.createLinearGradient(0, 0, W, 0);
  topGrad.addColorStop(0, '#F59E0B');
  topGrad.addColorStop(1, '#D97706');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, 4);

  // Subtle radial glow
  const glow = ctx.createRadialGradient(W / 2, 120, 0, W / 2, 120, 300);
  glow.addColorStop(0, 'rgba(245, 158, 11, 0.06)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 400);

  // Header label
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '3px';
  ctx.fillText('IKL FANTASY LINEUP', W / 2, 45);

  // Team name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px sans-serif';
  ctx.letterSpacing = '0px';
  const displayName = teamName.length > 24 ? teamName.slice(0, 24) + '...' : teamName;
  ctx.fillText(displayName, W / 2, 85);

  // Separator line
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 110);
  ctx.lineTo(W - 60, 110);
  ctx.stroke();

  // Player rows
  cardPicks.forEach((pick, i) => {
    const y = 140 + i * 105;
    const rowBg = ctx.createLinearGradient(30, y, W - 30, y);
    rowBg.addColorStop(0, `${pick.teamColor}12`);
    rowBg.addColorStop(1, 'transparent');
    ctx.fillStyle = rowBg;

    // Row background with rounded corners (approximated)
    ctx.beginPath();
    const rx = 30, ry = y - 8, rw = W - 60, rh = 85, rr = 12;
    ctx.moveTo(rx + rr, ry);
    ctx.lineTo(rx + rw - rr, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rr);
    ctx.lineTo(rx + rw, ry + rh - rr);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rr, ry + rh);
    ctx.lineTo(rx + rr, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rr);
    ctx.lineTo(rx, ry + rr);
    ctx.quadraticCurveTo(rx, ry, rx + rr, ry);
    ctx.closePath();
    ctx.fill();

    // Row border
    ctx.strokeStyle = `${pick.teamColor}25`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Role badge
    ctx.fillStyle = pick.teamColor;
    const badgeW = 52, badgeH = 24, badgeX = 48, badgeY = y + 8;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(pick.role, badgeX + badgeW / 2, badgeY + 16);

    // Captain/Vice indicator
    if (pick.isCaptain) {
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.roundRect(badgeX + badgeW + 8, badgeY, 36, badgeH, 6);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CAP', badgeX + badgeW + 26, badgeY + 16);
    } else if (pick.isViceCaptain) {
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.roundRect(badgeX + badgeW + 8, badgeY, 40, badgeH, 6);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VICE', badgeX + badgeW + 28, badgeY + 16);
    }

    // Player name
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 20px sans-serif`;
    ctx.fillText(pick.name, 48, y + 55);

    // Team short
    ctx.fillStyle = pick.teamColor;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(pick.teamShort, 48, y + 72);

    // Points
    ctx.textAlign = 'right';
    const ptsStr = `${pick.fantasyPts}`;
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(ptsStr, W - 55, y + 50);
    ctx.fillStyle = '#6B7280';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('pts', W - 55, y + 68);
    ctx.textAlign = 'left';
  });

  // Total points section
  const totalY = 660;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, totalY);
  ctx.lineTo(W - 60, totalY);
  ctx.stroke();

  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TOTAL PROJECTED', W / 2, totalY + 30);

  const totalGrad = ctx.createLinearGradient(0, totalY + 35, 0, totalY + 70);
  totalGrad.addColorStop(0, '#F59E0B');
  totalGrad.addColorStop(1, '#FBBF24');
  ctx.fillStyle = totalGrad;
  ctx.font = 'bold 42px sans-serif';
  ctx.fillText(`${totalPts} pts`, W / 2, totalY + 72);

  // Branding footer
  ctx.fillStyle = '#374151';
  ctx.font = '12px sans-serif';
  ctx.fillText('IKL Fantasy  |  hok-hub.project-n.site', W / 2, H - 25);

  return canvas;
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

async function shareCanvas(canvas: HTMLCanvasElement, title: string): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/png'),
    );
    if (!blob) return false;

    const file = new File([blob], 'ikl-fantasy-lineup.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        text: 'Check out my IKL Fantasy lineup!',
        files: [file],
      });
      return true;
    }
  } catch {
    // Share cancelled or unsupported
  }
  return false;
}

// ── Kit Customizer (#83) ─────────────────────────────────────────────────────

const KIT_COLORS = [
  '#6366f1', '#3B82F6', '#06B6D4', '#22C55E', '#84CC16',
  '#EAB308', '#F59E0B', '#F97316', '#EF4444', '#EC4899',
  '#A855F7', '#8B5CF6',
];

import { KIT_ICONS, KitIcon } from '../../components/fantasy/KitIcons';

function KitCustomizer({ seasonId, isAuthenticated }: { seasonId: number | null; isAuthenticated: boolean }) {
  const [open, setOpen] = useState(false);
  const [kitColor, setKitColor] = useState('#6366f1');
  const [kitEmoji, setKitEmoji] = useState('');
  const [customHex, setCustomHex] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [loaded, setLoaded] = useState(false);

  // Load current kit from API on first open
  useEffect(() => {
    if (!open || loaded || !seasonId || !isAuthenticated) return;
    getMyTeam(seasonId).then(team => {
      if (team?.kit_color) setKitColor(team.kit_color);
      if (team?.kit_emoji) setKitEmoji(team.kit_emoji);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [open, loaded, seasonId, isAuthenticated]);

  async function handleSave() {
    if (!seasonId) return;
    setSaving(true);
    setMsg('');
    try {
      await updateTeamKit(seasonId, kitColor, kitEmoji);
      setMsg('Kit saved!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed to save');
    }
    setSaving(false);
  }

  if (!isAuthenticated || !seasonId) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
        style={{
          background: open ? 'rgba(99,102,241,0.1)' : '#0d1017',
          border: open ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)',
          color: open ? '#818CF8' : '#6B7280',
        }}>
        <Palette className="w-3.5 h-3.5" />
        Customize Kit
        {kitEmoji && <KitIcon name={kitEmoji} className="ml-auto w-4 h-4" />}
        {kitColor !== '#6366f1' && (
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: kitColor }} />
        )}
      </button>

      {open && (
        <div className="mt-2 rounded-xl p-4 space-y-4" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Preview */}
          <div className="flex items-center justify-center gap-3 py-3 rounded-lg" style={{ background: `${kitColor}15`, border: `1px solid ${kitColor}30` }}>
            <KitIcon name={kitEmoji || 'trophy'} className="w-8 h-8" />
            <div>
              <div className="font-black text-white text-sm">Your Team Kit</div>
              <div className="text-xs" style={{ color: kitColor }}>Kit preview</div>
            </div>
            <span className="w-8 h-8 rounded-lg" style={{ background: kitColor }} />
          </div>

          {/* Color picker */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Team Color</div>
            <div className="flex flex-wrap gap-1.5">
              {KIT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => { setKitColor(c); setCustomHex(''); }}
                  className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                  style={{
                    background: c,
                    outline: kitColor === c ? '2px solid white' : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                value={customHex}
                onChange={e => {
                  const val = e.target.value;
                  setCustomHex(val);
                  if (/^#[0-9a-fA-F]{6}$/.test(val)) setKitColor(val);
                }}
                placeholder="#custom"
                maxLength={7}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs text-white placeholder-gray-700 font-mono focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              {customHex && /^#[0-9a-fA-F]{6}$/.test(customHex) && (
                <span className="w-6 h-6 rounded-md" style={{ background: customHex }} />
              )}
            </div>
          </div>

          {/* Icon selector */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Team Icon</div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setKitEmoji('')}
                className="w-8 h-8 rounded-lg text-xs flex items-center justify-center transition-transform hover:scale-110"
                style={{
                  background: kitEmoji === '' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  border: kitEmoji === '' ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  color: '#6B7280',
                }}>
                --
              </button>
              {KIT_ICONS.map(k => (
                <button
                  key={k.name}
                  onClick={() => setKitEmoji(k.name)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
                  style={{
                    background: kitEmoji === k.name ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                    border: kitEmoji === k.name ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    color: kitEmoji === k.name ? '#F59E0B' : '#6B7280',
                  }}>
                  <k.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 rounded-lg text-xs font-black text-black disabled:opacity-50"
              style={{ background: kitColor }}>
              {saving ? 'Saving...' : 'Save Kit'}
            </button>
            {msg && (
              <span className={`text-xs font-bold ${msg.includes('saved') ? 'text-green-400' : 'text-red-400'}`}>
                {msg}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function DraftTab({
  picks, setPicks,
  activeRole, setActiveRole,
  search, setSearch,
  filterRole, setFilterRole,
  sortBy, setSortBy,
  teamName, setTeamName,
  saving, saveMsg, onSave, onDetail,
  isAuthenticated,
  budget, budgetLeft, totalPts, filledCount,
  pickedIds, teamCounts, filteredPlayers, roleCounts,
  selectPlayer,
  captainId, viceCaptainId, setCaptainId, setViceCaptainId,
  benchPicks, setBenchPicks,
}: DraftProps) {
  const [shareMsg, setShareMsg] = useState('');

  function handleShare() {
    const roleNames: Record<string, string> = { EXP: 'EXP', JGL: 'JGL', MID: 'MID', GOLD: 'GOLD', ROAM: 'ROAM' };
    const lines = Object.entries(picks)
      .filter(([, p]) => p !== null)
      .map(([role, p]) => `${roleNames[role]}: ${p!.name}`)
      .join(' | ');
    const text = `My IKL Fantasy Team: ${teamName || 'Unnamed'} | ${lines} | Total: ${totalPts} pts | #IKLFantasy`;

    if (navigator.share) {
      navigator.share({ title: 'My IKL Fantasy Team', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setShareMsg('Copied!');
        setTimeout(() => setShareMsg(''), 2000);
      }).catch(() => {
        setShareMsg('Failed to copy');
        setTimeout(() => setShareMsg(''), 2000);
      });
    }
  }

  const handleShareCard = useCallback(async () => {
    const cardPicks: ShareCardPick[] = ROLES
      .filter(r => picks[r] !== null)
      .map(r => {
        const p = picks[r]!;
        return {
          role: r,
          name: p.name,
          teamShort: p.team_short,
          teamColor: p.team_color,
          fantasyPts: p.fantasy_pts,
          isCaptain: p.id === captainId,
          isViceCaptain: p.id === viceCaptainId,
        };
      });

    if (cardPicks.length === 0) return;

    const canvas = generateShareCard(teamName || 'My Fantasy Team', cardPicks, totalPts);
    const shared = await shareCanvas(canvas, 'IKL Fantasy Lineup');
    if (!shared) {
      downloadCanvas(canvas, `ikl-fantasy-${teamName.replace(/\s+/g, '-').toLowerCase() || 'lineup'}.png`);
      setShareMsg('Card downloaded!');
      setTimeout(() => setShareMsg(''), 2000);
    }
  }, [picks, teamName, totalPts, captainId, viceCaptainId]);

  return (
    <div className="grid lg:grid-cols-5 gap-6">

      {/* Left: Formation board */}
      <div className="lg:col-span-2 space-y-4">
        {/* Budget card */}
        <div className="rounded-2xl p-5" style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <Wallet className="w-4 h-4 text-amber-400" /> Budget
            </div>
            <div className={`font-black text-lg ${budgetLeft < 10 ? 'text-red-400' : 'text-amber-400'}`}>
              {budgetLeft}<span className="text-gray-700 text-sm font-normal"> / {BUDGET} cr</span>
            </div>
          </div>
          <div className="flex gap-1 mb-2">
            {Array.from({ length: 10 }).map((_, i) => {
              const segValue = (i + 1) * 10;
              const filled = budget >= segValue;
              const partial = budget > segValue - 10 && budget < segValue;
              return (
                <div key={i} className="flex-1 h-3 rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div className="h-full transition-all" style={{
                    width: partial ? `${((budget % 10) / 10) * 100}%` : filled ? '100%' : '0%',
                    background: budget > 85 ? '#EF4444' : 'linear-gradient(90deg,#F59E0B,#FBBF24)',
                  }} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-700">
            <span>{budget} cr spent</span>
            <span>max {MAX_PER_TEAM} per team</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/6">
            <span className="text-gray-700 text-xs font-bold mr-1">{filledCount}/5 + {benchPicks.filter(Boolean).length}/2</span>
            {ROLES.map(r => (
              <div key={r} className="flex-1 h-1.5 rounded-full transition-colors"
                style={{ background: picks[r] ? ROLE_META[r].color : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
        </div>

        <input
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          placeholder="Your Team Name"
          maxLength={50}
          className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-700 font-bold text-sm focus:outline-none transition-colors"
          style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.1)' }}
          onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.5)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
        />

        {/* Formation map */}
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #0d1520 0%, #0a1018 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(245,158,11,0.4) 0%, transparent 100%)' }} />
          <div className="text-xs font-black uppercase tracking-widest text-gray-600 mb-4 text-center">Lineup</div>
          <div className="space-y-3">
            {FORMATION_LAYOUT.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-3 justify-center">
                {row.map(role => (
                  <FormationSlot
                    key={role}
                    role={role}
                    player={picks[role]}
                    isActive={activeRole === role}
                    onClick={() => { setActiveRole(role); setFilterRole(role); }}
                    onRemove={e => { e.stopPropagation(); setPicks(p => ({ ...p, [role]: null })); if (picks[role]?.id === captainId) setCaptainId(null); if (picks[role]?.id === viceCaptainId) setViceCaptainId(null); }}
                    isCaptain={picks[role]?.id === captainId}
                    isViceCaptain={picks[role]?.id === viceCaptainId}
                    onSetCaptain={e => { e.stopPropagation(); const pid = picks[role]?.id; if (!pid) return; if (captainId === pid) { setCaptainId(null); } else { setCaptainId(pid); if (viceCaptainId === pid) setViceCaptainId(null); } }}
                    onSetViceCaptain={e => { e.stopPropagation(); const pid = picks[role]?.id; if (!pid) return; if (viceCaptainId === pid) { setViceCaptainId(null); } else { setViceCaptainId(pid); if (captainId === pid) setCaptainId(null); } }}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Bench slots (#3) */}
          <div className="mt-4 pt-3 border-t border-white/6">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2 text-center">Bench</div>
            <div className="flex gap-3 justify-center">
              {([0, 1] as const).map(idx => {
                const player = benchPicks[idx];
                return (
                  <div key={`bench-${idx}`}
                    className="relative w-20 h-24 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:border-white/20"
                    style={{
                      background: player ? `${player.team_color}15` : 'rgba(255,255,255,0.03)',
                      border: player ? `1px solid ${player.team_color}40` : '1px dashed rgba(255,255,255,0.1)',
                    }}
                    onClick={() => { if (!player) setFilterRole('ALL'); }}
                  >
                    {player ? (
                      <>
                        {player.photo_url ? (
                          <img src={player.photo_url} alt={player.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs"
                            style={{ background: `${player.team_color}30`, color: player.team_color }}>
                            {player.name.slice(0, 2)}
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-white mt-1 truncate w-full text-center px-1">{player.name}</span>
                        <span className="text-[10px]" style={{ color: player.team_color }}>{player.team_short}</span>
                        <button
                          onClick={e => { e.stopPropagation(); setBenchPicks(prev => { const n = [...prev] as [IKLPlayer | null, IKLPlayer | null]; n[idx] = null; return n; }); }}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                          style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.2)', fontSize: '10px' }}>
                          ×
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center text-gray-700 text-xs">+</div>
                        <span className="text-[10px] text-gray-700 mt-1">Sub {idx + 1}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {totalPts > 0 && (
            <div className="mt-4 pt-4 border-t border-white/6 flex items-center justify-between">
              <span className="text-gray-600 text-xs font-bold uppercase tracking-wider">Projected</span>
              <span className="text-amber-400 font-black text-2xl">{totalPts} pts</span>
            </div>
          )}
        </div>

        {/* Save actions */}
        <div className="flex gap-2">
          <button
            onClick={() => { setPicks({ EXP: null, JGL: null, MID: null, GOLD: null, ROAM: null }); setBenchPicks([null, null]); }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-colors text-gray-600 hover:text-white"
            style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          {filledCount > 0 && (
            <>
              <button onClick={handleShare}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-colors text-gray-400 hover:text-white"
                style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button onClick={handleShareCard}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-colors text-indigo-400 hover:text-white"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Image className="w-4 h-4" /> Card
              </button>
            </>
          )}
          {isAuthenticated ? (
            <button onClick={onSave} disabled={saving || filledCount < 5}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all disabled:opacity-40"
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
        {shareMsg && (
          <p className="text-center text-sm font-bold py-2 rounded-xl text-green-400 bg-green-500/10">
            {shareMsg}
          </p>
        )}
        {saveMsg && (
          <p className={`text-center text-sm font-bold py-2 rounded-xl ${saveMsg.includes('!') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {saveMsg}
          </p>
        )}

        {/* Kit Customizer (#83) */}
        <KitCustomizer
          seasonId={filteredPlayers[0]?.season_id ?? null}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Right: Player picker */}
      <div className="lg:col-span-3 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-white placeholder-gray-700 text-sm focus:outline-none"
              style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as 'pts' | 'price' | 'mvps')}
            className="px-3 py-2.5 rounded-xl text-gray-400 text-sm focus:outline-none"
            style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.1)' }}>
            <option value="pts">By Points</option>
            <option value="mvps">By MVPs</option>
            <option value="price">By Price</option>
          </select>
        </div>

        {/* Role filter */}
        <div className="flex gap-1.5" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
          {(['ALL', ...ROLES] as (Role | 'ALL')[]).map(r => {
            const active = filterRole === r;
            const color = r === 'ALL' ? '#F59E0B' : ROLE_META[r as Role].color;
            const count = roleCounts[r] || 0;
            return (
              <button key={r} onClick={() => setFilterRole(r)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: active ? `${color}18` : '#0d1017',
                  color: active ? color : '#4B5563',
                  border: active ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.07)',
                }}>
                {r !== 'ALL' && <RoleImg role={r as Role} size={13} />}
                {r === 'ALL' ? 'All' : ROLE_META[r as Role].short}
                <span className="px-1.5 py-0.5 rounded-full text-xs"
                  style={{ background: active ? `${color}25` : 'rgba(255,255,255,0.07)', color: active ? color : '#6B7280' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Picker hint */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-600"
          style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: ROLE_META[activeRole].color, boxShadow: `0 0 6px ${ROLE_META[activeRole].color}` }} />
          Picking for <span className="font-bold ml-1" style={{ color: ROLE_META[activeRole].color }}>{ROLE_META[activeRole].label}</span>
          <span className="ml-auto text-white font-bold">{budgetLeft} cr left</span>
        </div>

        {/* Player grid */}
        <div className="grid sm:grid-cols-2 gap-2.5 lg:max-h-[600px] lg:overflow-y-auto lg:pr-1 min-w-0"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
          {filteredPlayers.map(player => {
            const isSelected = pickedIds.has(player.id);
            const overBudget = !isSelected && player.price > budgetLeft;
            const overTeam = !isSelected && (teamCounts[player.team_short] || 0) >= MAX_PER_TEAM;
            const allFilled = Object.values(picks).every(Boolean) && benchPicks.every(Boolean) && !isSelected;
            return (
              <PickerCard
                key={player.id}
                player={player}
                selected={isSelected}
                onSelect={() => selectPlayer(player)}
                disabled={overBudget || overTeam || allFilled}
                onDetail={() => onDetail(player)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
