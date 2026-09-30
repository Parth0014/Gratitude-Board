import React, { useEffect, useRef, useState } from "react";

import { searchAssetsWithStatus } from "../assets/registry";

import { GRATITUDE_ASSET_DRAG_TYPE } from "../assets/contracts";
import {
  addRecent,
  EMPTY_ASSET_LIBRARY,
  readAssetLibrary,
  toggleFavorite,
  writeAssetLibrary,
} from "../assets/libraryState";

import { VISION_LAYOUTS } from "../vision/layouts";
import { VISION_TEMPLATES } from "../vision/templates";
import { VISION_TEXT_PRESETS } from "../vision/typography";

import type { GratitudeAsset } from "../assets/contracts";
import type { VisionLayout } from "../vision/layouts";
import type { VisionTemplate } from "../vision/templates";

type AssetKind =
  | "all"
  | "template"
  | "favorite"
  | "recent"
  | "photo"
  | "sticker"
  | "illustration"
  | "shape"
  | "pattern"
  | "text"
  | "layout";
const LABELS: Record<AssetKind, string> = {
  all: "All assets",
  template: "Templates",
  favorite: "Favorites",
  recent: "Recent",
  photo: "Photos",
  sticker: "Stickers",
  illustration: "Doodles",
  shape: "Frames",
  pattern: "Patterns",
  text: "Text",
  layout: "Layouts",
};
const ELEMENT_KINDS = ["sticker", "illustration", "shape", "pattern"] as const;

const getAssetType = (kind: AssetKind): GratitudeAsset["type"] | undefined =>
  kind === "all" ||
  kind === "template" ||
  kind === "favorite" ||
  kind === "recent" ||
  kind === "text" ||
  kind === "layout"
    ? undefined
    : kind;

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

import { AssetThumbnail } from "./AssetThumbnail";

export const AssetPanel = ({
  onPlace,
  onReplace,
  canReplace,
  onUpload,
  onApplyLayout,
  onApplyTemplate,
  onAddText,
}: {
  onPlace: (asset: GratitudeAsset, ownerDocument: Document) => Promise<void>;
  onReplace: (asset: GratitudeAsset, ownerDocument: Document) => Promise<void>;
  canReplace: boolean;
  onUpload: (file: File, ownerDocument: Document) => Promise<void>;
  onApplyLayout: (layout: VisionLayout) => void;
  onApplyTemplate: (template: VisionTemplate) => void;
  onAddText: (preset: typeof VISION_TEXT_PRESETS[number]) => void;
}) => {
  const rootRef = useRef<HTMLElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const detailsCloseRef = useRef<HTMLButtonElement>(null);
  const scrollPositions = useRef<Partial<Record<AssetKind, number>>>({});
  const [query, setQuery] = useState("");
  const [queries, setQueries] = useState<Partial<Record<AssetKind, string>>>(
    {},
  );
  const [kind, setKind] = useState<AssetKind>("photo");
  const [assets, setAssets] = useState<GratitudeAsset[]>([]);
  const [nextCursor, setNextCursor] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [providerNotice, setProviderNotice] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const [orientation, setOrientation] = useState<
    "any" | "landscape" | "portrait" | "square"
  >("any");
  const [license, setLicense] = useState<
    "any" | "no-credit" | "credit-required"
  >("any");
  const [details, setDetails] = useState<GratitudeAsset | null>(null);
  const [assetColor, setAssetColor] = useState("#c94f7c");
  const [panelOpen, setPanelOpen] = useState(true);
  const [library, setLibrary] = useState(EMPTY_ASSET_LIBRARY);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const ownerWindow = rootRef.current?.ownerDocument.defaultView;
    setLibrary(readAssetLibrary(ownerWindow?.localStorage));
    setOnline(ownerWindow?.navigator.onLine ?? true);
    if (ownerWindow?.matchMedia("(max-width: 700px)").matches) {
      setPanelOpen(false);
    }
  }, []);

  useEffect(() => {
    const ownerWindow = rootRef.current?.ownerDocument.defaultView;
    if (!ownerWindow) {
      return;
    }
    const update = () => setOnline(ownerWindow.navigator.onLine);
    ownerWindow.addEventListener("online", update);
    ownerWindow.addEventListener("offline", update);
    return () => {
      ownerWindow.removeEventListener("online", update);
      ownerWindow.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    const ownerWindow = rootRef.current?.ownerDocument.defaultView;
    const panel = rootRef.current?.querySelector<HTMLElement>(
      ".gratitude-assets__panel",
    );
    if (!ownerWindow || !panel) {
      return;
    }
    ownerWindow.requestAnimationFrame(() => {
      panel.scrollTop = scrollPositions.current[kind] || 0;
    });
  }, [kind]);

  useEffect(() => {
    if (!details) {
      return;
    }
    detailsCloseRef.current?.focus();
    const ownerDocument = rootRef.current?.ownerDocument;
    const handleDialogKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDetails(null);
        return;
      }
      if (event.key === "Tab") {
        const controls = Array.from(
          rootRef.current?.querySelectorAll<HTMLElement>(
            ".gratitude-asset-details section button:not(:disabled), .gratitude-asset-details section a[href]",
          ) || [],
        );
        if (!controls.length) {
          return;
        }
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && ownerDocument?.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && ownerDocument?.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    ownerDocument?.addEventListener("keydown", handleDialogKey);
    return () => ownerDocument?.removeEventListener("keydown", handleDialogKey);
  }, [details]);

  const chooseKind = (nextKind: AssetKind) => {
    const panel = rootRef.current?.querySelector<HTMLElement>(
      ".gratitude-assets__panel",
    );
    scrollPositions.current[kind] = panel?.scrollTop || 0;
    setQueries((current) => ({ ...current, [kind]: query }));
    setKind(nextKind);
    setQuery(queries[nextKind] || "");
    setPanelOpen(true);
  };

  const updateLibrary = (
    update: (current: typeof library) => typeof library,
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

  const place = async (asset: GratitudeAsset) => {
    const ownerDocument = rootRef.current?.ownerDocument;
    if (!ownerDocument) {
      return;
    }
    const customized = asset.editable.colors
      ? { ...asset, customization: { color: assetColor } }
      : asset;
    await onPlace(customized, ownerDocument);
    updateLibrary((current) => addRecent(current, asset));
  };

  const replace = async (asset: GratitudeAsset) => {
    const ownerDocument = rootRef.current?.ownerDocument;
    if (!ownerDocument) {
      return;
    }
    const customized = asset.editable.colors
      ? { ...asset, customization: { color: assetColor } }
      : asset;
    await onReplace(customized, ownerDocument);
    updateLibrary((current) => addRecent(current, asset));
  };

  useEffect(() => {
    const ownerWindow = rootRef.current?.ownerDocument.defaultView;
    if (!ownerWindow) {
      return;
    }
    if (
      kind === "layout" ||
      kind === "text" ||
      kind === "template" ||
      kind === "favorite" ||
      kind === "recent"
    ) {
      setAssets([]);
      setNextCursor(undefined);
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
          {
            search: query,
            type: getAssetType(kind),
            orientation: orientation === "any" ? undefined : orientation,
            license: license === "any" ? undefined : license,
            limit: 20,
          },
          ownerWindow,
        ).then(
          (result) => {
            if (active) {
              setAssets(result.items);
              setNextCursor(result.nextCursor);
              setProviderNotice(
                result.failures.length
                  ? "The local collection is ready. Some optional sources are unavailable."
                  : "",
              );
              setBusy(false);
            }
          },
          (reason) => {
            if (active) {
              setAssets([]);
              setNextCursor(undefined);
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
  }, [query, kind, orientation, license, refreshToken]);

  const loadMore = async () => {
    const ownerWindow = rootRef.current?.ownerDocument.defaultView;
    if (!ownerWindow || !nextCursor || loadingMore) {
      return;
    }
    setLoadingMore(true);
    try {
      const result = await searchAssetsWithStatus(
        {
          search: query,
          type: getAssetType(kind),
          orientation: orientation === "any" ? undefined : orientation,
          license: license === "any" ? undefined : license,
          cursor: nextCursor,
          limit: 20,
        },
        ownerWindow,
      );
      setAssets((current) => {
        const known = new Set(current.map(({ id }) => id));
        return [
          ...current,
          ...result.items.filter((asset) => !known.has(asset.id)),
        ];
      });
      setNextCursor(result.nextCursor);
      if (result.failures.length) {
        setProviderNotice(
          "The local collection is ready. Some optional sources are unavailable.",
        );
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "More assets could not be loaded.",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const visibleAssets =
    kind === "favorite"
      ? library.favorites
      : kind === "recent"
      ? library.recents
      : assets;

  return (
    <aside
      ref={rootRef}
      className={`gratitude-assets${panelOpen ? "" : " is-collapsed"}`}
      aria-label="Assets"
    >
      <nav className="gratitude-assets__rail" aria-label="Asset tools">
        {(["photo", "sticker", "text", "layout", "template"] as const).map(
          (option) => (
            <button
              key={option}
              type="button"
              aria-label={option === "sticker" ? "Elements" : LABELS[option]}
              aria-pressed={
                option === "sticker"
                  ? ELEMENT_KINDS.includes(kind as typeof ELEMENT_KINDS[number])
                  : kind === option
              }
              onClick={() => chooseKind(option)}
            >
              <ToolIcon name={option} />
              <span>{option === "sticker" ? "Elements" : LABELS[option]}</span>
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Uploads"
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
          <div>
            <span className="gratitude-assets__eyebrow">BUILD YOUR BOARD</span>
            <h2>{LABELS[kind]}</h2>
            <p className="gratitude-assets__subheading">
              Collect the pieces that feel like you.
            </p>
          </div>
        </div>
        <div className="gratitude-assets__view-tabs" aria-label="Library view">
          <button
            type="button"
            className={kind === "favorite" ? "is-active" : ""}
            onClick={() => chooseKind("favorite")}
          >
            Favorites
          </button>
          <button
            type="button"
            className={kind === "recent" ? "is-active" : ""}
            onClick={() => chooseKind("recent")}
          >
            Recent
          </button>
        </div>
        {ELEMENT_KINDS.includes(kind as typeof ELEMENT_KINDS[number]) && (
          <div className="gratitude-assets__element-tabs" aria-label="Elements">
            {ELEMENT_KINDS.map((option) => (
              <button
                key={option}
                type="button"
                className={kind === option ? "is-active" : ""}
                onClick={() => chooseKind(option)}
              >
                {LABELS[option]}
              </button>
            ))}
          </div>
        )}
        {!["layout", "text", "template", "favorite", "recent"].includes(
          kind,
        ) && (
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
              onChange={(event) => {
                const value = event.currentTarget.value;
                setQuery(value);
                setQueries((current) => ({ ...current, [kind]: value }));
              }}
              placeholder={
                kind === "photo"
                  ? "Search photos and ideas"
                  : `Search ${LABELS[kind].toLowerCase()}`
              }
            />
          </label>
        )}
        {(kind === "photo" || kind === "all") && (
          <div className="gratitude-assets__filters" aria-label="Photo filters">
            <label>
              <span>Orientation</span>
              <select
                value={orientation}
                onChange={(event) =>
                  setOrientation(
                    event.currentTarget.value as typeof orientation,
                  )
                }
              >
                <option value="any">Any</option>
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
                <option value="square">Square</option>
              </select>
            </label>
            <label>
              <span>License</span>
              <select
                value={license}
                onChange={(event) =>
                  setLicense(event.currentTarget.value as typeof license)
                }
              >
                <option value="any">Any safe license</option>
                <option value="no-credit">No credit needed</option>
                <option value="credit-required">Credit required</option>
              </select>
            </label>
          </div>
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
        {!["layout", "text", "template", "favorite", "recent"].includes(
          kind,
        ) && (
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
          <div className="gratitude-assets__message" role="status">
            <span>{providerNotice}</span>
            <button
              type="button"
              onClick={() => setRefreshToken((value) => value + 1)}
            >
              Retry sources
            </button>
          </div>
        )}
        {!online && (
          <p className="gratitude-assets__message" role="status">
            Offline mode. The complete built-in collection remains available;
            optional online sources will return when you reconnect.
          </p>
        )}
        {visibleAssets.some((asset) => asset.editable.colors) && (
          <label className="gratitude-assets__recolor">
            <span>Asset color</span>
            <input
              type="color"
              value={assetColor}
              onChange={(event) => setAssetColor(event.currentTarget.value)}
            />
            <small>Applied when you add a recolorable vector</small>
          </label>
        )}
        {busy && !visibleAssets.length && (
          <div className="gratitude-assets__skeleton" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <span key={index} />
            ))}
          </div>
        )}
        <div
          className={`gratitude-assets__grid${
            kind === "layout" || kind === "text" || kind === "template"
              ? " gratitude-assets__layouts"
              : ""
          }`}
        >
          {kind === "template"
            ? VISION_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className="gratitude-template-card"
                  style={
                    {
                      "--template-accent": template.accent,
                    } as React.CSSProperties
                  }
                  onClick={() => onApplyTemplate(template)}
                >
                  <span className="gratitude-template-card__category">
                    {template.category}
                  </span>
                  <strong>{template.title}</strong>
                  <span>{template.description}</span>
                  <small>{template.prompt}</small>
                </button>
              ))
            : kind === "layout"
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
                            slot.frame === "circle"
                              ? "50%"
                              : slot.frame === "rounded"
                              ? "5px"
                              : "1px",
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
            : visibleAssets.map((asset) => (
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
                    onClick={() => void place(asset)}
                  >
                    <AssetThumbnail src={asset.previewUrl} title={asset.title} />
                    {asset.type !== "photo" && <span>{asset.title}</span>}
                  </button>
                  <button
                    type="button"
                    className="gratitude-asset-card__favorite"
                    aria-label={`${
                      library.favorites.some(
                        (favorite) => favorite.id === asset.id,
                      )
                        ? "Remove"
                        : "Add"
                    } ${asset.title} ${
                      library.favorites.some(
                        (favorite) => favorite.id === asset.id,
                      )
                        ? "from"
                        : "to"
                    } favorites`}
                    aria-pressed={library.favorites.some(
                      (favorite) => favorite.id === asset.id,
                    )}
                    onClick={() =>
                      updateLibrary((current) => toggleFavorite(current, asset))
                    }
                  >
                    {library.favorites.some(
                      (favorite) => favorite.id === asset.id,
                    )
                      ? "♥"
                      : "♡"}
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
                  {canReplace && asset.type === "photo" && (
                    <button
                      type="button"
                      className="gratitude-asset-card__replace"
                      onClick={() => void replace(asset)}
                    >
                      Replace
                    </button>
                  )}
                </div>
              ))}
        </div>
        {nextCursor && !busy && (
          <button
            type="button"
            className="gratitude-assets__load-more"
            disabled={loadingMore}
            onClick={() => void loadMore()}
          >
            {loadingMore ? "Loading more…" : "Load more"}
          </button>
        )}
        {kind !== "layout" &&
          kind !== "text" &&
          kind !== "template" &&
          !busy &&
          !error &&
          !visibleAssets.length && (
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
                ref={detailsCloseRef}
                type="button"
                className="gratitude-asset-details__close"
                aria-label="Close"
                onClick={() => setDetails(null)}
              >
                ×
              </button>
              <AssetThumbnail
                src={details.previewUrl}
                title={details.title}
                className="gratitude-asset-details__image"
              />
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
                  void place(details);
                  setDetails(null);
                }}
              >
                Add to board
              </button>
              {canReplace && details.type === "photo" && (
                <button
                  type="button"
                  className="gratitude-asset-details__add"
                  onClick={() => {
                    void replace(details);
                    setDetails(null);
                  }}
                >
                  Replace selected photo
                </button>
              )}
            </section>
          </div>
        )}
      </div>
    </aside>
  );
};
