import React from "react";

import type { GratitudeAsset } from "../assets/contracts";

export interface PhotosPanelProps {
  onSearchPhotos: (query: string) => Promise<GratitudeAsset[]>;
  onInsertPhoto: (asset: GratitudeAsset) => Promise<void>;
}

/**
 * Module 4 photos panel: keyless stock search. Clicking a photo downloads it
 * and inserts it at the board center (or into the selected layout slot).
 */
export const PhotosPanel = ({
  onSearchPhotos,
  onInsertPhoto,
}: PhotosPanelProps) => {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<GratitudeAsset[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [searched, setSearched] = React.useState(false);
  const [insertingId, setInsertingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const search = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const term = query.trim();
    if (!term || searching) {
      return;
    }
    setSearching(true);
    setError(null);
    try {
      setResults(await onSearchPhotos(term));
      setSearched(true);
    } catch {
      setError("Photo search failed. Check your connection and try again.");
    } finally {
      setSearching(false);
    }
  };

  const insert = async (asset: GratitudeAsset) => {
    setInsertingId(asset.id);
    setError(null);
    try {
      await onInsertPhoto(asset);
    } catch {
      setError(`Could not add “${asset.title}”.`);
    } finally {
      setInsertingId(null);
    }
  };

  return (
    <div className="photos-panel">
      <form className="photos-panel__search" onSubmit={(e) => void search(e)}>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search photos…"
          aria-label="Search photos"
        />
        <button type="submit" disabled={searching || !query.trim()}>
          {searching ? "…" : "Search"}
        </button>
      </form>
      {error && (
        <p className="studio-panel__error" role="alert">
          {error}
        </p>
      )}
      {!searched && !searching && (
        <p className="studio-panel__status">
          Search for photos to fill your board.
        </p>
      )}
      {searched && !results.length && !searching && (
        <p className="studio-panel__status">
          No photos found — try a different search.
        </p>
      )}
      <ul className="photos-panel__grid">
        {results.map((photo) => (
          <li key={photo.id}>
            <button
              type="button"
              className="photos-panel__item"
              title={photo.title}
              disabled={insertingId !== null}
              onClick={() => void insert(photo)}
            >
              <img
                src={photo.previewUrl}
                alt={photo.title}
                loading="lazy"
                draggable={false}
              />
              {insertingId === photo.id && (
                <span className="photos-panel__spinner" aria-label="Adding…" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
