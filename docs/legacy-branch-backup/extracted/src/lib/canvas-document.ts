export type CanvasItem = {
  id: string;
  kind: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  opacity?: number;
  crop?: { x: number; y: number; width: number; height: number };
  flipX?: boolean;
  flipY?: boolean;
  src?: string;
  text?: string;
  fontFamily?: 'Inter' | 'Prata';
  fontSize?: number;
  fill?: string;
  backgroundColor?: string;
};

export type CanvasDocument = {
  version: 1;
  background?: string;
  items: CanvasItem[];
};

export function centeredCrop(
  sourceWidth: number,
  sourceHeight: number,
  targetAspect: number,
): NonNullable<CanvasItem['crop']> {
  const sourceAspect = sourceWidth / sourceHeight;
  if (sourceAspect > targetAspect) {
    const width = targetAspect / sourceAspect;
    return { x: (1 - width) / 2, y: 0, width, height: 1 };
  }
  const height = sourceAspect / targetAspect;
  return { x: 0, y: (1 - height) / 2, width: 1, height };
}

const DATABASE_NAME = 'vision-board-canvas-v1';
const STORE_NAME = 'boards';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME))
        request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readCanvasDocument(
  boardId: string,
): Promise<CanvasDocument | null> {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = db
        .transaction(STORE_NAME, 'readonly')
        .objectStore(STORE_NAME)
        .get(boardId);
      request.onsuccess = () => resolve(parseCanvasDocument(request.result));
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function writeCanvasDocument(
  boardId: string,
  document: CanvasDocument,
): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(document, boardId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export function parseCanvasDocument(candidate: unknown): CanvasDocument | null {
  if (!candidate || typeof candidate !== 'object') return null;
  const value = candidate as {
    version?: unknown;
    background?: unknown;
    items?: unknown;
  };
  if (value.version !== 1 || !Array.isArray(value.items)) return null;
  if (
    value.background !== undefined &&
    (typeof value.background !== 'string' ||
      !/^#[0-9a-f]{6}$/i.test(value.background))
  )
    return null;
  if (value.items.length > 500) return null;
  const items: CanvasItem[] = [];
  for (const item of value.items) {
    if (!item || typeof item !== 'object') return null;
    const entry = item as Partial<CanvasItem>;
    if (
      typeof entry.id !== 'string' ||
      !entry.id.startsWith('shape:') ||
      (entry.kind !== 'image' && entry.kind !== 'text') ||
      ![entry.x, entry.y, entry.width, entry.height, entry.angle].every(
        (number) => typeof number === 'number' && Number.isFinite(number),
      ) ||
      (entry.width ?? 0) <= 0 ||
      (entry.height ?? 0) <= 0 ||
      (entry.opacity !== undefined &&
        (typeof entry.opacity !== 'number' ||
          !Number.isFinite(entry.opacity) ||
          entry.opacity < 0 ||
          entry.opacity > 1)) ||
      (entry.flipX !== undefined && typeof entry.flipX !== 'boolean') ||
      (entry.flipY !== undefined && typeof entry.flipY !== 'boolean') ||
      (entry.crop !== undefined &&
        (!entry.crop ||
          ![
            entry.crop.x,
            entry.crop.y,
            entry.crop.width,
            entry.crop.height,
          ].every(
            (number) => typeof number === 'number' && Number.isFinite(number),
          ) ||
          entry.crop.x < 0 ||
          entry.crop.y < 0 ||
          entry.crop.width < 0.01 ||
          entry.crop.height < 0.01 ||
          entry.crop.x + entry.crop.width > 1.000001 ||
          entry.crop.y + entry.crop.height > 1.000001)) ||
      (entry.kind === 'image' && !normalizeImageSource(entry.src)) ||
      (entry.kind === 'text' && typeof entry.text !== 'string') ||
      (entry.fontFamily !== undefined &&
        !['Inter', 'Prata'].includes(entry.fontFamily)) ||
      (entry.fontSize !== undefined &&
        (typeof entry.fontSize !== 'number' ||
          !Number.isFinite(entry.fontSize) ||
          entry.fontSize < 8 ||
          entry.fontSize > 160)) ||
      (entry.fill !== undefined && !/^#[0-9a-f]{6}$/i.test(entry.fill)) ||
      (entry.backgroundColor !== undefined &&
        !/^#[0-9a-f]{6}$/i.test(entry.backgroundColor))
    )
      return null;
    items.push(
      entry.kind === 'image'
        ? ({ ...entry, src: normalizeImageSource(entry.src)! } as CanvasItem)
        : (entry as CanvasItem),
    );
  }
  return {
    version: 1,
    ...(typeof value.background === 'string'
      ? { background: value.background }
      : {}),
    items,
  };
}

export function isSafeImageSource(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    (value.startsWith('/photos/') ||
      /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value))
  );
}

export function normalizeImageSource(value: unknown): string | null {
  if (isSafeImageSource(value)) return value;
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (
      /^https?:$/.test(url.protocol) &&
      /^\/photos\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/i.test(url.pathname)
    )
      return url.pathname;
  } catch {
    return null;
  }
  return null;
}

type LegacyRecord = {
  id?: string;
  typeName?: string;
  type?: string;
  x?: number;
  y?: number;
  props?: Record<string, unknown>;
};

function recordList(snapshot: unknown): LegacyRecord[] {
  if (!snapshot || typeof snapshot !== 'object') return [];
  const wrapper = snapshot as {
    document?: { store?: Record<string, LegacyRecord> };
    records?: LegacyRecord[];
  };
  if (wrapper.document?.store) return Object.values(wrapper.document.store);
  return Array.isArray(wrapper.records) ? wrapper.records : [];
}

export function convertLegacySnapshot(
  snapshot: unknown,
  labels: Record<string, string>,
): CanvasDocument | null {
  const records = recordList(snapshot);
  if (records.length === 0) return null;
  const assets = new Map(
    records
      .filter((record) => record.typeName === 'asset')
      .map((record) => [record.id, record]),
  );
  const items: CanvasItem[] = [];
  for (const record of records) {
    if (
      record.typeName !== 'shape' ||
      typeof record.id !== 'string' ||
      !record.id.startsWith('shape:')
    )
      continue;
    const x = Number(record.x ?? 0);
    const y = Number(record.y ?? 0);
    const width = Number(record.props?.w ?? 220);
    const height = Number(record.props?.h ?? 130);
    if (![x, y, width, height].every(Number.isFinite)) continue;
    if (record.type === 'image') {
      const asset = assets.get(String(record.props?.assetId));
      const src = normalizeImageSource(asset?.props?.src);
      if (!src) continue;
      items.push({
        id: record.id,
        kind: 'image',
        x,
        y,
        width,
        height,
        angle: 0,
        src,
      });
    } else if (record.type === 'geo') {
      items.push({
        id: record.id,
        kind: 'text',
        x,
        y,
        width,
        height,
        angle: 0,
        text: labels[record.id] ?? 'Your words here',
      });
    }
  }
  return { version: 1, items };
}

export async function readLegacyCanvas(
  boardId: string,
  labels: Record<string, string>,
): Promise<CanvasDocument | null> {
  const name = `TLDRAW_DOCUMENT_v2vision-board:${boardId}`;
  const databases = await indexedDB.databases?.();
  if (!databases?.some((database) => database.name === name)) return null;
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    if (!db.objectStoreNames.contains('records')) return null;
    const records = await new Promise<LegacyRecord[]>((resolve, reject) => {
      const request = db
        .transaction('records', 'readonly')
        .objectStore('records')
        .getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return convertLegacySnapshot({ records }, labels);
  } finally {
    db.close();
  }
}
