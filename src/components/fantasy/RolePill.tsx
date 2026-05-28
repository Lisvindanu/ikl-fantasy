import { ROLE_META } from './types';
import type { Role } from './types';
import { RoleImg } from './RoleImg';

export function RolePill({ role, size = 'sm' }: { role: Role; size?: 'sm' | 'xs' }) {
  const { color, short } = ROLE_META[role];
  const imgSize = size === 'xs' ? 12 : 14;
  const cls = size === 'xs' ? 'px-1.5 py-0.5 text-xs gap-1' : 'px-2 py-0.5 text-xs gap-1.5';
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold ${cls}`}
      style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}
    >
      <RoleImg role={role} size={imgSize} />
      {short}
    </span>
  );
}
