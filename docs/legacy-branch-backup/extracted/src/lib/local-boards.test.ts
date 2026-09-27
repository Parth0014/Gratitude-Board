import { describe, expect, it } from 'vitest';
import {
  addBoardCheckIn,
  BoardConflictError,
  createTemplateBoard,
  markTourCompleted,
  readBoards,
  removeBoardCheckIn,
  restoreLocalBoard,
} from './local-boards';

function storage(): Storage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
    clear: () => values.clear(),
    key: (index) => [...values.keys()][index] ?? null,
    get length() {
      return values.size;
    },
  };
}

describe('local starter boards', () => {
  it('creates an editable photo board and remembers the dismissed tour', () => {
    const browserStorage = storage();
    const board = createTemplateBoard(browserStorage, 'home');
    expect(board.aspirations).toHaveLength(4);
    expect(board.aspirations.every((piece) => Boolean(piece.photoId))).toBe(
      true,
    );
    expect(board.tourCompleted).toBe(false);
    markTourCompleted(browserStorage, board);
    expect(readBoards(browserStorage)[0]?.tourCompleted).toBe(true);
    expect(() => markTourCompleted(browserStorage, board)).toThrow(
      BoardConflictError,
    );
  });

  it('restores a backup as a separate board without overwriting the original', () => {
    const browserStorage = storage();
    const original = createTemplateBoard(browserStorage, 'career');
    const restored = restoreLocalBoard(browserStorage, original);
    expect(restored.id).not.toBe(original.id);
    expect(restored.aspirations).toEqual(original.aspirations);
    expect(readBoards(browserStorage)).toHaveLength(2);
  });

  it('keeps optional revisit notes private to the saved board and removable', () => {
    const browserStorage = storage();
    const board = createTemplateBoard(browserStorage, 'home');
    const updated = addBoardCheckIn(browserStorage, board, {
      reflection: 'The room feels calmer now.',
      nextStep: 'Keep one quiet corner.',
    });
    expect(updated.checkIns).toHaveLength(1);
    expect(readBoards(browserStorage)[0]?.checkIns?.[0]?.reflection).toBe(
      'The room feels calmer now.',
    );
    const restored = restoreLocalBoard(browserStorage, updated);
    expect(restored.checkIns).toEqual(updated.checkIns);
    const removed = removeBoardCheckIn(
      browserStorage,
      updated,
      updated.checkIns![0]!.id,
    );
    expect(removed.checkIns).toEqual([]);
    expect(restored.checkIns).toHaveLength(1);
  });
});
