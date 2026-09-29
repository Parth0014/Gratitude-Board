import React from "react";

import { VISION_LAYOUTS } from "../vision/layouts";
import { VISION_TEXT_PRESETS } from "../vision/typography";

import { AssetPanel } from "./AssetPanel";

import type { CanvasAdapter, VisionTheme } from "../vision/contracts";

import type { GratitudeAsset } from "../assets/contracts";

const ExportMenu = ({ adapter }: { adapter: CanvasAdapter | null }) => {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (!open) {
      return;
    }
    closeRef.current?.focus();
    const ownerDocument = rootRef.current?.ownerDocument;
    const handleDialogKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key === "Tab") {
        const controls = Array.from(
          rootRef.current?.querySelectorAll<HTMLElement>(
            ".gratitude-export-dialog section button:not(:disabled), .gratitude-export-dialog section a[href]",
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
  }, [open]);
  const runExport = async (
    label: string,
    action: (ownerDocument: Document) => void | Promise<void>,
    ownerDocument: Document,
  ) => {
    setBusy(label);
    setError(null);
    try {
      await action(ownerDocument);
      setOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Export failed");
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className="gratitude-export-menu" ref={rootRef}>
      <button
        className="gratitude-export"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Export
      </button>
      {open && (
        <div
          className="gratitude-export-dialog"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="gratitude-export-dialog__backdrop"
            aria-label="Close export dialog"
            onClick={() => setOpen(false)}
          />
          <section aria-labelledby="gratitude-export-title">
            <header>
              <div>
                <span>READY TO SHARE</span>
                <h2 id="gratitude-export-title">Export your vision</h2>
                <p>
                  Choose an output. Image readiness is checked before export.
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </header>
            <div className="gratitude-export-dialog__options">
              <button
                type="button"
                disabled={!adapter || busy !== null}
                onClick={(event) =>
                  void runExport(
                    "high-resolution",
                    (ownerDocument) =>
                      adapter?.downloadHighResolution(ownerDocument, 3),
                    event.currentTarget.ownerDocument,
                  )
                }
              >
                <strong>
                  {busy === "high-resolution"
                    ? "Preparing image…"
                    : "High-resolution PNG"}
                </strong>
                <span>3× board image for sharing and large screens</span>
              </button>
              <button
                type="button"
                disabled={!adapter || busy !== null}
                onClick={(event) =>
                  void runExport(
                    "print",
                    (ownerDocument) => adapter?.printBoard(ownerDocument),
                    event.currentTarget.ownerDocument,
                  )
                }
              >
                <strong>
                  {busy === "print" ? "Preparing print…" : "Print / Save PDF"}
                </strong>
                <span>Clean print layout with browser PDF saving</span>
              </button>
              <button
                type="button"
                disabled={!adapter || busy !== null}
                onClick={(event) =>
                  void runExport(
                    "board",
                    (ownerDocument) =>
                      adapter?.downloadHighResolution(ownerDocument, 2),
                    event.currentTarget.ownerDocument,
                  )
                }
              >
                <strong>
                  {busy === "board" ? "Preparing board…" : "Board PNG"}
                </strong>
                <span>2× share image with required asset credits</span>
              </button>
              <button
                type="button"
                disabled={!adapter || busy !== null}
                onClick={(event) =>
                  void runExport(
                    "selection",
                    (ownerDocument) =>
                      adapter?.downloadSelectedPrint(ownerDocument, 3),
                    event.currentTarget.ownerDocument,
                  )
                }
              >
                <strong>
                  {busy === "selection"
                    ? "Preparing print piece…"
                    : "Selected print piece"}
                </strong>
                <span>Transparent 3× PNG of the selected item</span>
              </button>
              <button
                type="button"
                onClick={(event) => {
                  adapter?.downloadReel(event.currentTarget.ownerDocument);
                  setOpen(false);
                }}
              >
                <strong>Animated web reel</strong>
                <span>Self-contained vertical story for a browser</span>
              </button>
              <button
                type="button"
                disabled={!adapter || busy !== null}
                onClick={(event) =>
                  void runExport(
                    "video",
                    (ownerDocument) =>
                      adapter?.downloadReelVideo(ownerDocument),
                    event.currentTarget.ownerDocument,
                  )
                }
              >
                <strong>
                  {busy === "video" ? "Rendering video…" : "WebM reel video"}
                </strong>
                <span>Vertical 9:16 video with a subtle motion effect</span>
              </button>
              <button
                type="button"
                onClick={(event) => {
                  adapter?.downloadReelPlan(event.currentTarget.ownerDocument);
                  setOpen(false);
                }}
              >
                <strong>Reel plan</strong>
                <span>9:16 sequence manifest for video rendering</span>
              </button>
              <button
                type="button"
                onClick={(event) => {
                  adapter?.downloadAttributions(
                    event.currentTarget.ownerDocument,
                  );
                  setOpen(false);
                }}
              >
                <strong>Asset credits</strong>
                <span>Required creator and license details</span>
              </button>
            </div>
            {error && (
              <p className="gratitude-export-dialog__error" role="alert">
                {error}
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export const GratitudeShell = ({
  adapter,
  name,
  theme,
  onPlaceAsset,
  onReplaceAsset,
  onUploadAsset,
  rightOpen,
  boardSettingsOpen,
  onBoardSettingsOpen,
  boardSettings,
  onRightToggle,
  footerRef,
  selectionToolbar,
  hasBoardContent,
  children,
}: {
  adapter: CanvasAdapter | null;
  name: string;
  theme: VisionTheme;
  onPlaceAsset: (
    asset: GratitudeAsset,
    ownerDocument: Document,
  ) => Promise<void>;
  onReplaceAsset: (
    asset: GratitudeAsset,
    ownerDocument: Document,
  ) => Promise<void>;
  onUploadAsset: (file: File, ownerDocument: Document) => Promise<void>;
  rightOpen: boolean;
  boardSettingsOpen: boolean;
  onBoardSettingsOpen: () => void;
  boardSettings: React.ReactNode;
  onRightToggle: () => void;
  footerRef: (element: HTMLDivElement | null) => void;
  selectionToolbar: React.ReactNode;
  hasBoardContent: boolean;
  children: React.ReactNode;
}) => (
  <div className="gratitude-studio" data-theme={theme}>
    <header className="gratitude-header">
      <div className="gratitude-brand" aria-label="Gratitude Studio">
        <svg
          className="gratitude-brand__mark"
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M16 27.5 5.9 17.8C1 13.1 3.5 5.8 9.6 5.8c2.9 0 5.1 1.5 6.4 3.6 1.3-2.1 3.5-3.6 6.4-3.6 6.1 0 8.6 7.3 3.7 12L16 27.5Z"
            fill="currentColor"
          />
          <path
            d="m16 11.8 1.2 2.9 2.9 1.2-2.9 1.2-1.2 2.9-1.2-2.9-2.9-1.2 2.9-1.2 1.2-2.9Z"
            fill="var(--gratitude-header)"
          />
        </svg>
        <span>Gratitude Studio</span>
      </div>
      <div
        className="gratitude-board-name"
        title={name}
        aria-label={`Board: ${name}`}
      >
        {name || "My vision board"}
      </div>
      <div className="gratitude-header__actions">
        <button
          className="gratitude-board-setup"
          type="button"
          onClick={onBoardSettingsOpen}
        >
          Board setup
        </button>
        <ExportMenu adapter={adapter} />
      </div>
    </header>
    <div
      className={`gratitude-workspace${
        rightOpen ? " gratitude-workspace--inspector-open" : ""
      }`}
    >
      <AssetPanel
        onPlace={onPlaceAsset}
        onReplace={onReplaceAsset}
        canReplace={adapter?.getSelection().kind === "image"}
        onUpload={onUploadAsset}
        onApplyLayout={(layout) => adapter?.applyLayout(layout)}
        onApplyTemplate={(template) => adapter?.applyTemplate(template)}
        onAddText={(preset) => adapter?.createTextPreset(preset)}
      />
      <main className="gratitude-editor" aria-label="Vision board editor">
        {!hasBoardContent && adapter && (
          <section
            className="gratitude-board-starter"
            aria-label="Start your board"
          >
            <span>START YOUR VISION</span>
            <h1>What would you love to see more of?</h1>
            <p>
              Choose a gentle starting point. You can change everything later.
            </p>
            <div>
              <button
                type="button"
                onClick={() => adapter.applyLayout(VISION_LAYOUTS[0])}
              >
                <strong>Start with a layout</strong>
                <small>Arrange five meaningful moments</small>
              </button>
              <button
                type="button"
                onClick={() => adapter.createTextPreset(VISION_TEXT_PRESETS[0])}
              >
                <strong>Add an intention</strong>
                <small>Begin with words that guide you</small>
              </button>
              <button type="button" onClick={onBoardSettingsOpen}>
                <strong>Set the mood</strong>
                <small>Choose your board color and texture</small>
              </button>
            </div>
          </section>
        )}
        <div
          className="gratitude-selection-toolbar"
          aria-label="Selected item styles"
        >
          {selectionToolbar}
        </div>
        {children}
        <div
          className={`gratitude-editor-footer excalidraw theme--${theme}`}
          ref={footerRef}
        />
      </main>
      {rightOpen && (
        <aside className="gratitude-inspector" aria-label="Element properties">
          <div className="gratitude-inspector__header">
            <div>
              <span>EDIT YOUR BOARD</span>
              <h2>Board setup</h2>
            </div>
            <button
              type="button"
              onClick={onRightToggle}
              aria-label="Collapse properties panel"
            >
              ›
            </button>
          </div>
          <div
            className={`gratitude-inspector__content excalidraw theme--${theme}`}
          >
            {boardSettingsOpen && boardSettings}
          </div>
        </aside>
      )}
    </div>
  </div>
);
