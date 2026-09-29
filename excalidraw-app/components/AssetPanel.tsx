import React, { useEffect, useRef, useState } from "react";

import { searchAssetsWithStatus } from "../assets/registry";

import { GRATITUDE_ASSET_DRAG_TYPE } from "../assets/contracts";

import { VISION_LAYOUTS } from "../vision/layouts";
import { VISION_TEXT_PRESETS } from "../vision/typography";

import type { GratitudeAsset } from "../assets/contracts";
import type { VisionLayout } from "../vision/layouts";

type AssetKind =
  | "all"
  | "photo"
  | "sticker"
  | "illustration"
  | "shape"
  | "pattern"
  | "text"
  | "layout";
const LABELS: Record<AssetKind, string> = {
  all: "All assets",
  photo: "Photos",
  sticker: "Stickers",
  illustration: "Doodles",
  shape: "Frames",
  pattern: "Patterns",
  text: "Text",
  layout: "Layouts",
};

const ToolIcon = ({ name }: { name: AssetKind | "upload" }) => {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": true as const,
  };
  switch (name) {
    case "photo":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9" r="1.5" />
          <path d="m4 17 5-5 3 3 3-4 5 6" />
        </svg>
      );
    case "sticker":
      return (
        <svg {...common}>
          <path d="M12 2.5 14.6 9l6.9 3-6.9 3-2.6 6.5L9.4 15l-6.9-3 6.9-3L12 2.5Z" />
        </svg>
      );
    case "illustration":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3" />
          <path d="M6 21c.8-5 2.6-8 6-8s5.2 3 6 8M5 7 2 4m17 3 3-3" />
        </svg>
      );
    case "shape":
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <rect x="7" y="6" width="10" height="9" rx="1" />
        </svg>
      );
    case "pattern":
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="2" />
          <circle cx="18" cy="6" r="2" />
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="18" r="2" />
          <path d="M8 6h8M6 8v8m12-8v8M8 18h8" />
        </svg>
      );
    case "layout":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M12 3v18M3 12h9" />
        </svg>
      );
    case "text":
      return (
        <svg {...common}>
          <path d="M5 5h14M12 5v14M8 19h8" />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V3m0 0L7 8m5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
  }
};

export const AssetPanel = ({
  onPlace,
  onUpload,
  onApplyLayout,
  onAddText,
}: {
  onPlace: (asset: GratitudeAsset, ownerDocument: Document) => Promise<void>;
  onUpload: (file: File, ownerDocument: Document) => Promise<void>;
  onApplyLayout: (layout: VisionLayout) => void;
  onAddText: (preset: typeof VISION_TEXT_PRESETS[number]) => void;
}) => {
  const rootRef = useRef<HTMLElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<AssetKind>("photo");
  const [assets, setAssets] = useState<GratitudeAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [providerNotice, setProviderNotice] = useState("");
  const [details, setDetails] = useState<GratitudeAsset | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    const ownerWindow = rootRef.current?.ownerDocument.defaultView;
    if (!ownerWindow) {
      return;
    }
    if (kind === "layout" || kind === "text") {
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
          { search: query, type: kind === "all" ? undefined : kind, limit: 20 },
          ownerWindow,
        ).then(
          (result) => {
            if (active) {
              setAssets(result.items);
              setProviderNotice(
                result.failures.length
                  ? "Some library sources are temporarily unavailable."
                  : "",
              );
              setBusy(false);
            }
          },
          (reason) => {
            if (active) {
              setAssets([]);
              setError(
                reason instanceof Error
                  ? reason.message
                  : "Assets could not be loaded.",
              );
              setBusy(false);
            }
          },
        );
      },
      query ? 300 : 0,
    );
    return () => {
      active = false;
      ownerWindow.clearTimeout(timer);
    };
  }, [query, kind]);

  return (
    <aside
      ref={rootRef}
      className={`gratitude-assets${panelOpen ? "" : " is-collapsed"}`}
      aria-label="Assets"
    >
      <nav className="gratitude-assets__rail" aria-label="Asset tools">
        {(
          [
            "all",
            "photo",
            "sticker",
            "illustration",
            "shape",
            "pattern",
            "text",
            "layout",
          ] as const
        ).map((option) => (
          <button
            key={option}
            type="button"
            aria-label={LABELS[option]}
            aria-pressed={kind === option}
            onClick={() => {
              setKind(option);
              setQuery("");
              setPanelOpen(true);
            }}
          >
            <ToolIcon name={option} />
            <span>{option === "all" ? "All" : LABELS[option]}</span>
          </button>
        ))}
        <div className="gratitude-assets__rail-divider" />
        <button
          type="button"
          aria-label="Upload a photo"
          onClick={() => uploadRef.current?.click()}
        >
          <ToolIcon name="upload" />
          <span>Uploads</span>
        </button>
      </nav>
      <div className="gratitude-assets__panel">
        <div className="gratitude-assets__heading">
          <button
            type="button"
            className="gratitude-assets__sheet-close"
            aria-label="Close asset panel"
            onClick={() => setPanelOpen(false)}
          >
            ×
          </button>
          <span className="gratitude-assets__eyebrow">
            YOUR CREATIVE LIBRARY
          </span>
          <h2>{LABELS[kind]}</h2>
          <p>
            {kind === "photo"
              ? "Find the moments that tell your story."
              : kind === "sticker"
              ? "Add a little personality to your board."
              : kind === "illustration"
              ? "Tell your story with expressive artwork."
              : kind === "shape"
              ? "Frame the moments that matter."
              : kind === "pattern"
              ? "Give your board texture and rhythm."
              : kind === "layout"
              ? "Start with a composition, then fill each space."
              : kind === "text"
              ? "Add expressive titles, reflections and captions."
              : "Explore photos and stickers for your board."}
          </p>
        </div>
        {kind !== "layout" && kind !== "text" && (
          <label className="gratitude-assets__search">
            <span className="visually-hidden">Search assets</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 5 5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder={
                kind === "photo"
                  ? "Search photos and ideas"
                  : `Search ${LABELS[kind].toLowerCase()}`
              }
            />
          </label>
        )}
        <input
          ref={uploadRef}
          className="visually-hidden"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-label="Choose a photo to upload"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            const ownerDocument = rootRef.current?.ownerDocument;
            if (file && ownerDocument) {
              void onUpload(file, ownerDocument);
            }
            event.currentTarget.value = "";
          }}
        />
        {kind !== "layout" && kind !== "text" && (
          <button
            className="gratitude-assets__upload"
            type="button"
            onClick={() => uploadRef.current?.click()}
          >
            <ToolIcon name="upload" /> Upload your own photo
          </button>
        )}
        {!query && (kind === "photo" || kind === "all") && (
          <div className="gratitude-assets__suggestions">
            <span>Try searching</span>
            <div>
              {["Travel", "Nature", "Family", "Dream home"].map((term) => (
                <button key={term} type="button" onClick={() => setQuery(term)}>
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="gratitude-assets__results-heading">
          <h3>
            {query
              ? `Results for “${query}”`
              : `Featured ${LABELS[kind].toLowerCase()}`}
          </h3>
          {busy && <span role="status">Searching…</span>}
        </div>
        {error && (
          <p className="gratitude-assets__message" role="alert">
            {error}
          </p>
        )}
        {providerNotice && (
          <p className="gratitude-assets__message" role="status">
            {providerNotice}
          </p>
        )}
        <div
          className={`gratitude-assets__grid${
            kind === "layout" || kind === "text"
              ? " gratitude-assets__layouts"
              : ""
          }`}
        >
          {kind === "layout"
            ? VISION_LAYOUTS.map((layout) => (
                <button
                  key={layout.id}
                  type="button"
                  className="gratitude-layout-card"
                  onClick={() => onApplyLayout(layout)}
                  aria-label={`Apply ${layout.title} layout`}
                >
                  <span
                    className="gratitude-layout-card__preview"
                    aria-hidden="true"
                  >
                    {layout.slots.map((slot) => (
                      <i
                        key={slot.id}
                        style={{
                          left: `${slot.x * 100}%`,
                          top: `${slot.y * 100}%`,
                          width: `${slot.width * 100}%`,
                          height: `${slot.height * 100}%`,
                          transform: `rotate(${slot.rotation || 0}deg)`,
                          borderRadius:
                            slot.frame === "circle" ? "50%" : undefined,
                        }}
                      />
                    ))}
                  </span>
                  <strong>{layout.title}</strong>
                  <small>{layout.description}</small>
                </button>
              ))
            : kind === "text"
            ? VISION_TEXT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="gratitude-text-card"
                  onClick={() => onAddText(preset)}
                >
                  <span style={{ color: preset.color }}>{preset.sample}</span>
                  <small>
                    {preset.label} · {preset.category}
                  </small>
                </button>
              ))
            : assets.map((asset) => (
                <div
                  key={asset.id}
                  className={`gratitude-asset-card ${
                    asset.type === "photo" ? "is-photo" : "is-sticker"
                  }`}
                >
                  <button
                    type="button"
                    draggable
                    aria-label={`Add ${asset.title}`}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "copy";
                      event.dataTransfer.setData(
                        GRATITUDE_ASSET_DRAG_TYPE,
                        JSON.stringify(asset),
                      );
                    }}
                    onClick={() => {
                      const ownerDocument = rootRef.current?.ownerDocument;
                      if (ownerDocument) {
                        void onPlace(asset, ownerDocument);
                      }
                    }}
                  >
                    <img src={asset.previewUrl} alt="" loading="lazy" />
                    {asset.type !== "photo" && <span>{asset.title}</span>}
                  </button>
                  <button
                    type="button"
                    className="gratitude-asset-card__info"
                    aria-label={`View source and license for ${asset.title}`}
                    onClick={() => setDetails(asset)}
                  >
                    i
                  </button>
                  {asset.license.attributionRequired && (
                    <span className="gratitude-asset-card__license">
                      Credit
                    </span>
                  )}
                </div>
              ))}
        </div>
        {kind !== "layout" &&
          kind !== "text" &&
          !busy &&
          !error &&
          !assets.length && (
            <p className="gratitude-assets__message">
              {kind === "photo" && !query
                ? "Search a theme or choose an idea above to find photos."
                : "No matching assets. Try another search."}
            </p>
          )}
        {(kind === "photo" || kind === "all") && (
          <p className="gratitude-assets__credit">
            Photos from{" "}
            <a href="https://www.pexels.com/" target="_blank" rel="noreferrer">
              Pexels
            </a>{" "}
            ,{" "}
            <a href="https://openverse.org/" target="_blank" rel="noreferrer">
              Openverse
            </a>
            , Wikimedia Commons, Smithsonian Open Access and Rijksmuseum.
          </p>
        )}
        {details && (
          <div
            className="gratitude-asset-details"
            role="dialog"
            aria-modal="true"
            aria-label="Asset details"
          >
            <button
              type="button"
              className="gratitude-asset-details__backdrop"
              aria-label="Close asset details"
              onClick={() => setDetails(null)}
            />
            <section>
              <button
                type="button"
                className="gratitude-asset-details__close"
                aria-label="Close"
                onClick={() => setDetails(null)}
              >
                ×
              </button>
              <img src={details.previewUrl} alt="" />
              <h3>{details.title}</h3>
              {details.license.author && <p>By {details.license.author}</p>}
              <p>
                <strong>{details.license.label}</strong>
                {details.license.attributionRequired
                  ? " · Credit required"
                  : " · No credit required"}
              </p>
              <div>
                {details.license.sourceUrl && (
                  <a
                    href={details.license.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View source
                  </a>
                )}
                {details.license.licenseUrl && (
                  <a
                    href={details.license.licenseUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    License terms
                  </a>
                )}
              </div>
              <button
                type="button"
                className="gratitude-asset-details__add"
                onClick={() => {
                  const ownerDocument = rootRef.current?.ownerDocument;
                  if (ownerDocument) {
                    void onPlace(details, ownerDocument);
                  }
                  setDetails(null);
                }}
              >
                Add to board
              </button>
            </section>
          </div>
        )}
      </div>
    </aside>
  );
};
