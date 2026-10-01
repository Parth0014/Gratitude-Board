import React from "react";

import {
  addRecent,
  EMPTY_ASSET_LIBRARY,
  readAssetLibrary,
  toggleFavorite,
  writeAssetLibrary,
} from "../assets/libraryState";
import { searchAssetsWithStatus } from "../assets/registry";

import type { AssetLibraryState } from "../assets/libraryState";
import type { GratitudeAsset } from "../assets/contracts";

export interface ElementsPanelProps {
  onInsertAsset: (asset: GratitudeAsset) => Promise<void>;
}

type AssetCategory =
  | "sticker"
  | "illustration"
  | "shape"
  | "pattern"
  | "favorites"
  | "recents";

const CATEGORIES: { id: AssetCategory; label: string }[] = [
  { id: "sticker", label: "Stickers" },
  { id: "illustration", label: "Doodles" },
  { id: "shape", label: "Frames" },
  { id: "pattern", label: "Patterns" },
  { id: "favorites", label: "Favorites" },
  { id: "recents", label: "Recent" },
];

const isSearchableCategory = (category: AssetCategory) =>
  category === "sticker" ||
  category === "illustration" ||
  category === "shape" ||
  category === "pattern";

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path d="M12 20.5c-5.5-3.6-8.5-7-8.5-10.5 0-2.8 2.2-5 5-5 1.6 0 2.9.8 3.5 2 .6-1.2 1.9-2 3.5-2 2.8 0 5 2.2 5 5 0 3.5-3 6.9-8.5 10.5Z" />
  </svg>
);

/**
 * Asset browser: the restored customization library. Each category queries
 * the asset registry and only renders results from providers that answered —
 * failed providers are excluded (never shown as broken tiles) with a quiet
 * notice. Favorites and recents persist in localStorage.
 */
export const ElementsPanel = ({ onInsertAsset }: ElementsPanelProps) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [category, setCategory] = React.useState<AssetCategory>("sticker");
  const [queries, setQueries] = React.useState<
    Partial<Record<AssetCategory, string>>
  >({});
  const [assets, setAssets] = React.useState<GratitudeAsset[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [providerNotice, setProviderNotice] = React.useState("");
  const [insertingId, setInsertingId] = React.useState<string | null>(null);
  const [insertError, setInsertError] = React.useState<string | null>(null);
  const [library, setLibrary] =
    React.useState<AssetLibraryState>(EMPTY_ASSET_LIBRARY);

  const query = queries[category] ?? "";

  // Read favorites/recents from localStorage once mounted.
  React.useEffect(() => {
    const ownerWindow = rootRef.current?.ownerDocument.defaultView;
    setLibrary(readAssetLibrary(ownerWindow?.localStorage));
  }, []);

  const updateLibrary = (
    update: (current: AssetLibraryState) => AssetLibraryState,
  ) => {
    setLibrary((current) => {
      const next = update(current);
      writeAssetLibrary(
        rootRef.current?.ownerDocument.defaultView?.localStorage,
        next,
      );
      return next;
    });
  };

  const chooseCategory = (next: AssetCategory) => {
    setQueries((current) => ({ ...current, [category]: query }));
    setCategory(next);
    setError("");
    setProviderNotice("");
    setInsertError(null);
  };

  // Load assets for searchable categories, debounced while typing. Only
  // providers that answer contribute tiles; failures stay invisible.
  React.useEffect(() => {
    const ownerWindow = rootRef.current?.ownerDocument.defaultView as
      | (Window & typeof globalThis)
      | null
      | undefined;
    if (!ownerWindow) {
      return;
    }
    if (!isSearchableCategory(category)) {
      setAssets([]);
      setBusy(false);
      setError("");
      setProviderNotice("");
      return;
    }
    let active = true;
    const timer = ownerWindow.setTimeout(
      () => {
        setBusy(true);
        setError("");
        setProviderNotice("");
        void searchAssetsWithStatus(
          { search: query.trim() || undefined, type: category, limit: 40 },
          ownerWindow,
        ).then(
          (result) => {
            if (!active) {
              return;
            }
            setAssets(result.items);
            setBusy(false);
            if (result.items.length === 0 && result.failures.length > 0) {
              setError(
                "Couldn't reach any source for this category. Check your connection and try again.",
              );
            } else if (result.failures.length > 0) {
              setProviderNotice(
                "Some optional sources are unavailable — showing what loaded.",
              );
            }
          },
          (reason) => {
            if (!active) {
              return;
            }
            setAssets([]);
            setBusy(false);
            setError(
              reason instanceof Error
                ? reason.message
                : "Assets could not be loaded.",
            );
          },
        );
      },
      query ? 350 : 0,
    );
    return () => {
      active = false;
      ownerWindow.clearTimeout(timer);
    };
  }, [category, query]);

  const visibleAssets =
    category === "favorites"
      ? library.favorites
      : category === "recents"
        ? library.recents
        : assets;

  const insert = async (asset: GratitudeAsset) => {
    setInsertingId(asset.id);
    setInsertError(null);
    try {
      await onInsertAsset(asset);
      updateLibrary((current) => addRecent(current, asset));
    } catch {
      setInsertError(`Could not add “${asset.title}”.`);
    } finally {
      setInsertingId(null);
    }
  };

  const isFavorite = (asset: GratitudeAsset) =>
    library.favorites.some((favorite) => favorite.id === asset.id);

  return (
    <div className="assets-panel" ref={rootRef}>
      <div
        className="assets-panel__categories"
        role="tablist"
        aria-label="Asset categories"
      >
        {CATEGORIES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={category === id}
            className={`assets-panel__category${
              category === id ? " is-active" : ""
            }`}
            onClick={() => chooseCategory(id)}
          >
            {label}
            {id === "favorites" && library.favorites.length > 0 && (
              <span className="assets-panel__count">
                {library.favorites.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isSearchableCategory(category) && (
        <div className="assets-panel__search">
          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQueries((current) => ({
                ...current,
                [category]: event.target.value,
              }))
            }
            placeholder={`Search ${CATEGORIES.find((c) => c.id === category)?.label.toLowerCase()}…`}
            aria-label={`Search ${category}`}
          />
        </div>
      )}

      {insertError && (
        <p className="studio-panel__error" role="alert">
          {insertError}
        </p>
      )}
      {error && (
        <div className="assets-panel__empty">
          <p className="studio-panel__error" role="alert">
            {error}
          </p>
          <button
            type="button"
            className="assets-panel__retry"
            onClick={() => chooseCategory(category)}
          >
            Retry
          </button>
        </div>
      )}
      {!error && providerNotice && (
        <p className="assets-panel__notice">{providerNotice}</p>
      )}
      {!error && busy && visibleAssets.length === 0 && (
        <p className="studio-panel__status">Loading…</p>
      )}
      {!error &&
        !busy &&
        visibleAssets.length === 0 &&
        (category === "favorites" ? (
          <p className="studio-panel__status">
            Tap the heart on anything you love and it will live here.
          </p>
        ) : category === "recents" ? (
          <p className="studio-panel__status">
            Things you add to the board will show up here.
          </p>
        ) : (
          <p className="studio-panel__status">
            Nothing found — try a different search.
          </p>
        ))}

      <ul className="assets-panel__grid">
        {visibleAssets.map((asset) => {
          const favorite = isFavorite(asset);
          return (
            <li key={asset.id} className="assets-panel__cell">
              <button
                type="button"
                className="assets-panel__item"
                title={asset.title}
                disabled={insertingId !== null}
                onClick={() => void insert(asset)}
              >
                <img
                  src={asset.previewUrl}
                  alt={asset.title}
                  loading="lazy"
                  draggable={false}
                />
                {insertingId === asset.id && (
                  <span className="assets-panel__spinner" aria-label="Adding…" />
                )}
              </button>
              <button
                type="button"
                className={`assets-panel__favorite${
                  favorite ? " is-active" : ""
                }`}
                aria-label={
                  favorite
                    ? `Remove “${asset.title}” from favorites`
                    : `Add “${asset.title}” to favorites`
                }
                aria-pressed={favorite}
                title={favorite ? "Remove from favorites" : "Add to favorites"}
                onClick={() =>
                  updateLibrary((current) => toggleFavorite(current, asset))
                }
              >
                <HeartIcon filled={favorite} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
