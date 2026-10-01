import React from "react";

import type { GratitudeAsset } from "../assets/contracts";

export interface ElementsPanelProps {
  stickers: GratitudeAsset[];
  stickersLoading: boolean;
  onInsertSticker: (asset: GratitudeAsset) => Promise<void>;
}

/**
 * Module 4 elements panel: curated offline SVG stickers. Clicking a sticker
 * inserts it at the board center (or into the selected layout slot) via the
 * engine's createImage.
 */
export const ElementsPanel = ({
  stickers,
  stickersLoading,
  onInsertSticker,
}: ElementsPanelProps) => {
  const [insertingId, setInsertingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const insert = async (asset: GratitudeAsset) => {
    setInsertingId(asset.id);
    setError(null);
    try {
      await onInsertSticker(asset);
    } catch {
      setError(`Could not add “${asset.title}”.`);
    } finally {
      setInsertingId(null);
    }
  };

  if (stickersLoading) {
    return <p className="studio-panel__status">Loading stickers…</p>;
  }

  return (
    <div className="stickers-panel">
      {error && (
        <p className="studio-panel__error" role="alert">
          {error}
        </p>
      )}
      <ul className="stickers-panel__grid">
        {stickers.map((sticker) => (
          <li key={sticker.id}>
            <button
              type="button"
              className="stickers-panel__item"
              title={sticker.title}
              disabled={insertingId !== null}
              onClick={() => void insert(sticker)}
            >
              <img
                src={sticker.previewUrl}
                alt={sticker.title}
                loading="lazy"
                draggable={false}
              />
              {insertingId === sticker.id && (
                <span className="stickers-panel__spinner" aria-label="Adding…" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
