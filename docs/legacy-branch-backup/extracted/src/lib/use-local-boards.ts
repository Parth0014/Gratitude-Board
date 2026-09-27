'use client';

import { useSyncExternalStore } from 'react';
import {
  getBoardsSnapshot,
  getServerBoardsSnapshot,
  parseBoardsSnapshot,
  subscribeToBoards,
} from './local-boards';

export function useLocalBoards() {
  const snapshot = useSyncExternalStore(
    subscribeToBoards,
    getBoardsSnapshot,
    getServerBoardsSnapshot,
  );
  try {
    return { boards: parseBoardsSnapshot(snapshot), error: null };
  } catch (error) {
    return {
      boards: [],
      error:
        error instanceof Error ? error.message : 'Could not read saved boards.',
    };
  }
}
