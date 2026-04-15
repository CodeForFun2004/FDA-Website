import type { Role } from '@/features/authenticate/types/auth.type';

type KnownRole = Role | 'AUTHORITY' | 'SUPERADMIN';

function normalizeOneRole(raw: unknown): KnownRole | null {
  if (typeof raw !== 'string') return null;
  const v = raw.trim();
  if (!v) return null;

  // Normalize common backend variants / legacy values
  const key = v.replace(/\s+/g, '_');
  const upper = key.toUpperCase();

  if (upper === 'SUPERADMIN') return 'SUPERADMIN';
  if (upper === 'SUPERADMIN') return 'SUPERADMIN';
  if (upper === 'ADMIN') return 'ADMIN';
  if (upper === 'MODERATOR') return 'MODERATOR';
  if (upper === 'USER') return 'USER';

  // Some backends use AUTHORITY for moderator-like role
  if (upper === 'AUTHORITY') return 'MODERATOR';

  // Common camelCase variants
  if (key === 'SuperAdmin' || upper === 'SUPERADMIN') return 'SUPERADMIN';

  return null;
}

/**
 * Normalize roles coming from backend/token/cookie/storage.
 * Keeps FE as single source of truth: ADMIN | SUPERADMIN | MODERATOR | USER
 */
export function normalizeRoles(input: unknown): Role[] {
  const rawList = Array.isArray(input)
    ? input
    : typeof input === 'string'
      ? [input]
      : [];

  const normalized = rawList
    .map(normalizeOneRole)
    .filter((r): r is Role => Boolean(r));

  // de-duplicate
  const uniq = Array.from(new Set(normalized));
  return uniq.length > 0 ? uniq : ['USER'];
}
