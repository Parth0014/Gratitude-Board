import {
  createBoardSchema,
  meaningCardSchema,
  aspirationStatusSchema,
  type CreateBoardInput,
  type MeaningCard,
} from '@vision-board/contracts';
import { z } from 'zod';
import { findPhoto, templates, type TemplateId } from './starter-content';

const STORAGE_KEY = 'vision-board:boards:v1';
const CHANGE_EVENT = 'vision-board:boards-changed';

const aspirationSchema = z.strictObject({
  id: z.uuid(),
  shapeId: z.string().startsWith('shape:'),
  photoId: z.string().optional(),
  title: z.string().trim().min(1).max(160),
  status: aspirationStatusSchema,
  meaning: meaningCardSchema,
});

const checkInSchema = z.strictObject({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  reflection: z.string().trim().min(1).max(2000),
  nextStep: z.string().trim().max(500).optional(),
});

const localBoardSchema = z.strictObject({
  id: z.uuid(),
  title: z.string().trim().min(1).max(160),
  entryMode: z.enum(['reflect', 'visual']),
  viewMode: z.enum(['guided', 'canvas']).optional(),
  tourCompleted: z.boolean().optional(),
  layoutTried: z.boolean().optional(),
  renamedByUser: z.boolean().optional(),
  themes: z.array(z.string().trim().min(1).max(80)).max(3),
  revision: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  aspirations: z.array(aspirationSchema),
  checkIns: z.array(checkInSchema).max(100).optional(),
});
const boardsSchema = z.array(localBoardSchema);

export type LocalBoard = z.infer<typeof localBoardSchema>;
export type LocalAspiration = z.infer<typeof aspirationSchema>;
export type BoardCheckIn = z.infer<typeof checkInSchema>;

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

export function createTemplateBoard(
  storage: Storage,
  templateId: TemplateId,
): LocalBoard {
  const template = templates.find((item) => item.id === templateId);
  if (!template)
    throw new BoardDataError('That starting board is unavailable.');
  const now = new Date().toISOString();
  const board: LocalBoard = {
    id: crypto.randomUUID(),
    title: template.title,
    entryMode: 'visual',
    viewMode: 'canvas',
    themes: [],
    revision: 0,
    createdAt: now,
    updatedAt: now,
    tourCompleted: false,
    layoutTried: false,
    renamedByUser: false,
    aspirations: template.photoIds.map((photoId) => {
      const photo = findPhoto(photoId)!;
      return {
        id: crypto.randomUUID(),
        shapeId: `shape:${crypto.randomUUID()}`,
        photoId,
        title: photo.title,
        status: 'exploring' as const,
        meaning: {},
      };
    }),
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

export function addPhotoPiece(
  storage: Storage,
  board: LocalBoard,
  shapeId: string,
  photoId: string,
): LocalBoard {
  const photo = findPhoto(photoId);
  if (!photo) throw new BoardDataError('That photo is unavailable.');
  return updateLocalBoard(storage, board.id, board.revision, (current) => ({
    ...current,
    aspirations: [
      ...current.aspirations,
      {
        id: crypto.randomUUID(),
        shapeId,
        photoId,
        title: photo.title,
        status: 'exploring',
        meaning: {},
      },
    ],
  }));
}

export function addNamedPiece(
  storage: Storage,
  board: LocalBoard,
  shapeId: string,
  title: string,
): LocalBoard {
  const safeTitle = title.trim().slice(0, 160);
  if (!safeTitle) throw new BoardDataError('Give this piece a name.');
  return updateLocalBoard(storage, board.id, board.revision, (current) => ({
    ...current,
    aspirations: [
      ...current.aspirations,
      {
        id: crypto.randomUUID(),
        shapeId,
        title: safeTitle,
        status: 'exploring',
        meaning: {},
      },
    ],
  }));
}

export function replacePhotoPiece(
  storage: Storage,
  board: LocalBoard,
  aspirationId: string,
  photoId: string | undefined,
  title: string,
): LocalBoard {
  const safeTitle = title.trim().slice(0, 160);
  if (!safeTitle) throw new BoardDataError('Give this image a name.');
  return updateLocalBoard(storage, board.id, board.revision, (current) => ({
    ...current,
    aspirations: current.aspirations.map((item) =>
      item.id === aspirationId ? { ...item, photoId, title: safeTitle } : item,
    ),
  }));
}

export function removePiece(
  storage: Storage,
  board: LocalBoard,
  aspirationId: string,
): LocalBoard {
  return updateLocalBoard(storage, board.id, board.revision, (current) => ({
    ...current,
    aspirations: current.aspirations.filter((item) => item.id !== aspirationId),
  }));
}

export function restoreLocalBoard(
  storage: Storage,
  candidate: unknown,
): LocalBoard {
  const original = localBoardSchema.parse(candidate);
  const now = new Date().toISOString();
  const restored: LocalBoard = {
    ...original,
    id: crypto.randomUUID(),
    title: `${original.title} (restored)`.slice(0, 160),
    revision: 0,
    createdAt: now,
    updatedAt: now,
    tourCompleted: true,
  };
  writeBoards(storage, [restored, ...readBoards(storage)]);
  return restored;
}

export function renameLocalBoard(
  storage: Storage,
  board: LocalBoard,
  title: string,
): LocalBoard {
  const trimmed = title.trim();
  if (!trimmed) throw new BoardDataError('Give your board a name.');
  return updateLocalBoard(storage, board.id, board.revision, (current) => ({
    ...current,
    title: trimmed,
    renamedByUser: true,
  }));
}

export function markTourCompleted(
  storage: Storage,
  board: LocalBoard,
): LocalBoard {
  return updateLocalBoard(storage, board.id, board.revision, (current) => ({
    ...current,
    tourCompleted: true,
  }));
}

export function markLayoutTried(
  storage: Storage,
  board: LocalBoard,
): LocalBoard {
  return updateLocalBoard(storage, board.id, board.revision, (current) => ({
    ...current,
    layoutTried: true,
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

export function addBoardCheckIn(
  storage: Storage,
  board: LocalBoard,
  input: { reflection: string; nextStep?: string },
): LocalBoard {
  const reflection = input.reflection.trim();
  const nextStep = input.nextStep?.trim();
  if (!reflection)
    throw new BoardDataError('Write a little about what changed.');
  if ((board.checkIns?.length ?? 0) >= 100)
    throw new BoardDataError('This board has reached its note limit.');
  const checkIn = checkInSchema.parse({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    reflection,
    ...(nextStep ? { nextStep } : {}),
  });
  return updateLocalBoard(storage, board.id, board.revision, (current) => ({
    ...current,
    checkIns: [checkIn, ...(current.checkIns ?? [])],
  }));
}

export function removeBoardCheckIn(
  storage: Storage,
  board: LocalBoard,
  checkInId: string,
): LocalBoard {
  return updateLocalBoard(storage, board.id, board.revision, (current) => ({
    ...current,
    checkIns: (current.checkIns ?? []).filter((note) => note.id !== checkInId),
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
