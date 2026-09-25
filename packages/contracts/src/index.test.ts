import { describe, expect, it } from 'vitest';
import {
  aspirationStatusSchema,
  createBoardSchema,
  meaningCardSchema,
} from './index';

describe('public input boundaries', () => {
  it('allows visual entry without reflection or themes', () => {
    expect(
      createBoardSchema.parse({
        title: '  My next chapter  ',
        entryMode: 'visual',
      }),
    ).toEqual({ title: 'My next chapter', entryMode: 'visual', themes: [] });
    expect(meaningCardSchema.parse({})).toEqual({});
  });
  it('rejects client attempts to assign ownership or public visibility', () => {
    for (const extra of [
      { ownerId: 'someone-else' },
      { visibility: 'public' },
    ]) {
      expect(
        createBoardSchema.safeParse({
          title: 'A board',
          entryMode: 'reflect',
          ...extra,
        }).success,
      ).toBe(false);
    }
  });
  it('bounds content and requires a complete if-then plan', () => {
    expect(
      createBoardSchema.safeParse({ title: ' ', entryMode: 'visual' }).success,
    ).toBe(false);
    expect(
      createBoardSchema.safeParse({
        title: 'Board',
        entryMode: 'visual',
        themes: ['a', 'b', 'c', 'd'],
      }).success,
    ).toBe(false);
    expect(
      meaningCardSchema.safeParse({ ifThenPlan: { if: 'After breakfast' } })
        .success,
    ).toBe(false);
  });
  it('keeps visibility separate from goal lifecycle', () => {
    expect(aspirationStatusSchema.safeParse('released').success).toBe(true);
    expect(aspirationStatusSchema.safeParse('private').success).toBe(false);
  });
});
