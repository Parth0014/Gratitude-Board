import {
  createBoardSchema,
  meaningCardSchema,
  aspirationStatusSchema,
  type CreateBoardInput,
  type MeaningCard,
} from '@vision-board/contracts';
import { z } from 'zod';

const STORAGE_KEY = 'vision-board:boards:v1';
const CHANGE_EVENT = 'vision-board:boards-changed';

const aspirationSchema = z.strictObject({
  id: z.uuid(),
  shapeId: z.string().startsWith('shape:'),
  title: z.string().trim().min(1).max(160),
  status: aspirationStatusSchema,
  meaning: meaningCardSchema,
});

const localBoardSchema = z.strictObject({
  id: z.uuid(),
  title: z.string().trim().min(1).max(160),
  entryMode: z.enum(['reflect', 'visual']),
  viewMode: z.enum(['guided', 'canvas']).optional(),
  themes: z.array(z.string().trim().min(1).max(80)).max(3),
  revision: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  aspirations: z.array(aspirationSchema),
});
const boardsSchema = z.array(localBoardSchema);

export type LocalBoard = z.infer<typeof localBoardSchema>;
export type LocalAspiration = z.infer<typeof aspirationSchema>;

export class BoardDataError extends Error {}
export class BoardConflictError extends Error {}

export function readBoards(storage: Pick<Storage, 'getItem'>): LocalBoard[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) return [];
  try {
    return boardsSchema.parse(JSON.parse(raw));
  } catch {
    throw new BoardDataError(
      'Saved boards could not be read. Existing browser data has been left untouched.',
    );
  }
}

function writeBoards(storage: Pick<Storage, 'setItem'>, boards: LocalBoard[]) {
  storage.setItem(STORAGE_KEY, JSON.stringify(boardsSchema.parse(boards)));
  if (typeof window !== 'undefined')
    window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function createLocalBoard(
  storage: Storage,
  input: CreateBoardInput,
): LocalBoard {
  const validated = createBoardSchema.parse(input);
  const now = new Date().toISOString();
  const board: LocalBoard = {
    id: crypto.randomUUID(),
    title: validated.title,
    entryMode: validated.entryMode,
    viewMode: validated.entryMode === 'reflect' ? 'guided' : 'canvas',
    themes: validated.themes,
    revision: 0,
    createdAt: now,
    updatedAt: now,
    aspirations: [],
  };
  writeBoards(storage, [board, ...readBoards(storage)]);
  return board;
}

export function updateLocalBoard(
  storage: Storage,
  id: string,
  expectedRevision: number,
  change: (board: LocalBoard) => LocalBoard,
): LocalBoard {
  const boards = readBoards(storage);
  const index = boards.findIndex((board) => board.id === id);
  if (index === -1)
    throw new BoardDataError('This board is no longer in this browser.');
  const current = boards[index]!;
  if (current.revision !== expectedRevision)
    throw new BoardConflictError(
      'This board changed in another tab. Reload before saving.',
    );
  const updated = localBoardSchema.parse({
    ...change(current),
    id: current.id,
    revision: current.revision + 1,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  });
  boards[index] = updated;
  writeBoards(storage, boards);
  return updated;
}

export function addAspiration(
  storage: Storage,
  board: LocalBoard,
  shapeId: string,
): LocalBoard {
  return updateLocalBoard(storage, board.id, board.revision, (current) => ({
    ...current,
    aspirations: [
      ...current.aspirations,
      {
        id: crypto.randomUUID(),
        shapeId,
        title: 'New aspiration',
        status: 'exploring',
        meaning: {},
      },
    ],
  }));
}

export function setBoardViewMode(
  storage: Storage,
  board: LocalBoard,
  viewMode: 'guided' | 'canvas',
): LocalBoard {
  return updateLocalBoard(storage, board.id, board.revision, (current) => ({
    ...current,
    viewMode,
  }));
}

export function saveAspiration(
  storage: Storage,
  board: LocalBoard,
  aspirationId: string,
  input: {
    title: string;
    meaning: MeaningCard;
    status: LocalAspiration['status'];
  },
): LocalBoard {
  const meaning = meaningCardSchema.parse(input.meaning);
  return updateLocalBoard(storage, board.id, board.revision, (current) => ({
    ...current,
    aspirations: current.aspirations.map((item) =>
      item.id === aspirationId
        ? { ...item, title: input.title.trim(), meaning, status: input.status }
        : item,
    ),
  }));
}

export function subscribeToBoards(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function getBoardsSnapshot(): string | null {
  return window.localStorage.getItem(STORAGE_KEY);
}

export function getServerBoardsSnapshot(): string | null {
  return null;
}

export function parseBoardsSnapshot(raw: string | null): LocalBoard[] {
  return readBoards({ getItem: () => raw });
}
