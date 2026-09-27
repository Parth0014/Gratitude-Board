import type { BoardRole } from '@vision-board/contracts';
type Action = 'read' | 'edit' | 'manage';

// Call only with a role loaded server-side for the authenticated principal.
export function canAccessBoard(
  role: BoardRole | undefined,
  action: Action,
): boolean {
  if (!role) return false;
  if (action === 'read') return true;
  if (action === 'edit') return role === 'owner' || role === 'editor';
  return role === 'owner';
}
