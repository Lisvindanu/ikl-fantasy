import { ROLE_META } from './types';
import type { Role } from './types';

export function RoleImg({ role, size = 16 }: { role: Role; size?: number }) {
  return (
    <img
      src={ROLE_META[role].img}
      alt={role}
      style={{ width: size, height: size, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.85 }}
    />
  );
}
