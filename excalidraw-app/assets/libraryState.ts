import { normalizeGratitudeAsset } from "./contracts";

import type { GratitudeAsset } from "./contracts";

const STORAGE_KEY = "gratitude:asset-library:v1";
const MAX_RECENTS = 30;

export interface AssetLibraryState {
  favorites: GratitudeAsset[];
  recents: GratitudeAsset[];
}

export const EMPTY_ASSET_LIBRARY: AssetLibraryState = {
  favorites: [],
  recents: [],
};

const normalizeList = (value: unknown, limit: number) =>
  Array.isArray(value)
    ? value
        .map(normalizeGratitudeAsset)
        .filter((asset): asset is GratitudeAsset => Boolean(asset))
        .filter(
          (asset, index, assets) =>
            assets.findIndex((candidate) => candidate.id === asset.id) ===
            index,
        )
        .slice(0, limit)
    : [];

export const readAssetLibrary = (
  storage: Storage | undefined,
): AssetLibraryState => {
  if (!storage) {
    return EMPTY_ASSET_LIBRARY;
  }
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY) || "null");
    return {
      favorites: normalizeList(value?.favorites, MAX_RECENTS),
      recents: normalizeList(value?.recents, MAX_RECENTS),
    };
  } catch {
    return EMPTY_ASSET_LIBRARY;
  }
};

export const writeAssetLibrary = (
  storage: Storage | undefined,
  state: AssetLibraryState,
) => {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Asset placement must continue when browser storage is unavailable.
  }
};

export const toggleFavorite = (
  state: AssetLibraryState,
  asset: GratitudeAsset,
): AssetLibraryState => ({
  ...state,
  favorites: state.favorites.some((favorite) => favorite.id === asset.id)
    ? state.favorites.filter((favorite) => favorite.id !== asset.id)
    : [asset, ...state.favorites],
});

export const addRecent = (
  state: AssetLibraryState,
  asset: GratitudeAsset,
): AssetLibraryState => ({
  ...state,
  recents: [
    asset,
    ...state.recents.filter((recent) => recent.id !== asset.id),
  ].slice(0, MAX_RECENTS),
});
