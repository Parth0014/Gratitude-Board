import { describe, expect, it } from 'vitest';
import { canAccessBoard } from './authorization';

describe('board authorization policy', () => {
  it('denies every action without membership', () => {
    for (const action of ['read', 'edit', 'manage'] as const)
      expect(canAccessBoard(undefined, action)).toBe(false);
  });
  it('prevents viewers editing and editors managing membership', () => {
    expect(canAccessBoard('viewer', 'read')).toBe(true);
    expect(canAccessBoard('viewer', 'edit')).toBe(false);
    expect(canAccessBoard('viewer', 'manage')).toBe(false);
    expect(canAccessBoard('editor', 'edit')).toBe(true);
    expect(canAccessBoard('editor', 'manage')).toBe(false);
    expect(canAccessBoard('owner', 'manage')).toBe(true);
  });
});
