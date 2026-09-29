import type { AssetPage, AssetQuery, GratitudeAsset } from "./contracts";

const SEARCH_TTL = 15 * 60 * 1000;
const SEARCH_PREFIX = "gratitude:asset-search:v2:";
const BLOB_CACHE = "gratitude-assets-v1";
const MAX_SEARCH_ENTRIES = 80;
const MAX_MEMORY_BLOBS = 40;
const MAX_CACHED_BLOBS = 100;
const memorySearch = new Map<string, { expires: number; page: AssetPage }>();
const memoryBlobs = new Map<string, Blob>();

const queryKey = (provider: string, query: AssetQuery) =>
  `${provider}:${JSON.stringify({
    search: query.search?.trim().toLowerCase() || "",
    type: query.type || "all",
    cursor: query.cursor || "",
    limit: query.limit || 20,
    orientation: query.orientation || "any",
    license: query.license || "any",
  })}`;

const storageKey = (key: string) => `${SEARCH_PREFIX}${key}`;

export const readCachedSearch = (
  provider: string,
  query: AssetQuery,
  ownerWindow: Window & typeof globalThis,
): AssetPage | null => {
  const key = queryKey(provider, query);
  const memory = memorySearch.get(key);
  if (memory && memory.expires > Date.now()) {
    return memory.page;
  }
  try {
    const serialized = ownerWindow.localStorage.getItem(storageKey(key));
    if (!serialized) {
      return null;
    }
    const cached = JSON.parse(serialized) as {
      expires?: unknown;
      page?: unknown;
    };
    if (
      typeof cached.expires !== "number" ||
      cached.expires <= Date.now() ||
      !cached.page ||
      !Array.isArray((cached.page as AssetPage).items)
    ) {
      ownerWindow.localStorage.removeItem(storageKey(key));
      return null;
    }
    const page = cached.page as AssetPage;
    memorySearch.set(key, { expires: cached.expires, page });
    return page;
  } catch {
    return null;
  }
};

export const writeCachedSearch = (
  provider: string,
  query: AssetQuery,
  page: AssetPage,
  ownerWindow: Window & typeof globalThis,
) => {
  const key = queryKey(provider, query);
  const entry = { expires: Date.now() + SEARCH_TTL, page };
  memorySearch.set(key, entry);
  while (memorySearch.size > MAX_SEARCH_ENTRIES) {
    const oldest = memorySearch.keys().next().value;
    if (typeof oldest !== "string") {
      break;
    }
    memorySearch.delete(oldest);
  }
  try {
    ownerWindow.localStorage.setItem(storageKey(key), JSON.stringify(entry));
    const storedKeys = Array.from(
      { length: ownerWindow.localStorage.length },
      (_, index) => ownerWindow.localStorage.key(index),
    ).filter((item): item is string => !!item?.startsWith(SEARCH_PREFIX));
    if (storedKeys.length > MAX_SEARCH_ENTRIES) {
      storedKeys
        .slice(0, storedKeys.length - MAX_SEARCH_ENTRIES)
        .forEach((item) => ownerWindow.localStorage.removeItem(item));
    }
  } catch {
    // Memory caching still works when browser storage is unavailable.
  }
};

const cacheUrl = (
  asset: GratitudeAsset,
  ownerWindow: Window & typeof globalThis,
) =>
  new ownerWindow.URL(
    `/__gratitude_asset_cache__/${encodeURIComponent(asset.id)}`,
    ownerWindow.location.href,
  ).href;

export const readCachedBlob = async (
  asset: GratitudeAsset,
  ownerWindow: Window & typeof globalThis,
) => {
  const memory = memoryBlobs.get(asset.id);
  if (memory) {
    return memory;
  }
  try {
    if (!ownerWindow.caches) {
      return null;
    }
    const response = await (
      await ownerWindow.caches.open(BLOB_CACHE)
    ).match(cacheUrl(asset, ownerWindow));
    const blob = response ? await response.blob() : null;
    if (blob) {
      memoryBlobs.set(asset.id, blob);
    }
    return blob;
  } catch {
    return null;
  }
};

export const writeCachedBlob = async (
  asset: GratitudeAsset,
  blob: Blob,
  ownerWindow: Window & typeof globalThis,
) => {
  memoryBlobs.set(asset.id, blob);
  while (memoryBlobs.size > MAX_MEMORY_BLOBS) {
    const oldest = memoryBlobs.keys().next().value;
    if (typeof oldest !== "string") {
      break;
    }
    memoryBlobs.delete(oldest);
  }
  try {
    if (!ownerWindow.caches) {
      return;
    }
    const cache = await ownerWindow.caches.open(BLOB_CACHE);
    await cache.put(
      cacheUrl(asset, ownerWindow),
      new ownerWindow.Response(blob),
    );
    const keys = await cache.keys();
    await Promise.all(
      keys
        .slice(0, Math.max(0, keys.length - MAX_CACHED_BLOBS))
        .map((request) => cache.delete(request)),
    );
  } catch {
    // Memory caching still works when Cache Storage is unavailable.
  }
};
