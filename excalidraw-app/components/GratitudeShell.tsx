import React from "react";

import { VISION_TEMPLATES } from "../vision/templates";

import { AssetPanel } from "./AssetPanel";
import {
  CHECKLIST_DISMISS_KEY,
  GratitudeChecklist,
} from "./GratitudeChecklist";
import { GratitudeLobby, LOBBY_MOOD_COLORS } from "./GratitudeLobby";

import type { CanvasAdapter, VisionTheme } from "../vision/contracts";

import type { GratitudeAsset } from "../assets/contracts";
import type { VisionTemplate } from "../vision/templates";
import type { VisionLayout } from "../vision/layouts";
import type { VisionTextPreset } from "../vision/typography";

const EXPORT_SUCCESS_MESSAGES: Record<string, string> = {
  "high-resolution": "Board PNG downloaded",
  print: "Print layout opened",
  selection: "Print piece downloaded",
  "reel-web": "Web reel downloaded",
  video: "Reel video downloaded",
  "reel-plan": "Reel plan downloaded",
  credits: "Asset credits downloaded",
};

const ExportMenu = ({
  adapter,
  onNotify,
}: {
  adapter: CanvasAdapter | null;
  onNotify: (message: string) => void;
}) => {
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
      onNotify(EXPORT_SUCCESS_MESSAGES[label] ?? "Export downloaded");
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
                <span>Sharp board image for sharing and large screens</span>
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
                disabled={!adapter || busy !== null}
                onClick={(event) =>
                  void runExport(
                    "reel-web",
                    async (ownerDocument) =>
                      void (await adapter?.downloadReel(ownerDocument)),
                    event.currentTarget.ownerDocument,
                  )
                }
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
                disabled={!adapter || busy !== null}
                onClick={(event) =>
                  void runExport(
                    "reel-plan",
                    async (ownerDocument) =>
                      void (await adapter?.downloadReelPlan(ownerDocument)),
                    event.currentTarget.ownerDocument,
                  )
                }
              >
                <strong>Reel plan</strong>
                <span>9:16 sequence manifest for video rendering</span>
              </button>
              <button
                type="button"
                disabled={!adapter || busy !== null}
                onClick={(event) =>
                  void runExport(
                    "credits",
                    async (ownerDocument) =>
                      void (await adapter?.downloadAttributions(ownerDocument)),
                    event.currentTarget.ownerDocument,
                  )
                }
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
  onNameChange,
  theme,
  onPlaceAsset,
  onReplaceAsset,
  onUploadAsset,
  boardSettingsOpen,
  onBoardSettingsOpen,
  boardSettings,
  onRightToggle,
  footerRef,
  selectionToolbar,
  hasBoardContent,
  boardColor,
  onMoodSelect,
  onNotify,
  children,
}: {
  adapter: CanvasAdapter | null;
  name: string;
  onNameChange: (name: string) => void;
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
  boardSettingsOpen: boolean;
  onBoardSettingsOpen: () => void;
  boardSettings: React.ReactNode;
  onRightToggle: () => void;
  footerRef: (element: HTMLDivElement | null) => void;
  selectionToolbar: React.ReactNode;
  hasBoardContent: boolean;
  boardColor: string;
  onMoodSelect: (color: string) => void;
  onNotify: (message: string) => void;
  children: React.ReactNode;
}) => {
  const studioRef = React.useRef<HTMLDivElement>(null);
  const [lobbyDismissed, setLobbyDismissed] = React.useState(false);
  const [checklistDismissed, setChecklistDismissed] = React.useState(false);
  React.useEffect(() => {
    const storage =
      studioRef.current?.ownerDocument.defaultView?.localStorage;
    try {
      if (storage?.getItem(CHECKLIST_DISMISS_KEY) === "1") {
        setChecklistDismissed(true);
      }
    } catch {
      // checklist dismissal is a nicety; ignore storage failures
    }
  }, []);
  const [progress, setProgress] = React.useState({
    photo: false,
    text: false,
    mood: false,
  });
  const markProgress = (key: "photo" | "text" | "mood") =>
    setProgress((current) =>
      current[key] ? current : { ...current, [key]: true },
    );

  const handlePlaceAsset = async (
    asset: GratitudeAsset,
    ownerDocument: Document,
  ) => {
    await onPlaceAsset(asset, ownerDocument);
    if (asset.type === "photo") {
      markProgress("photo");
    }
  };
  const handleUploadAsset = async (file: File, ownerDocument: Document) => {
    await onUploadAsset(file, ownerDocument);
    markProgress("photo");
  };
  const handleApplyLayout = (layout: VisionLayout) => {
    adapter?.applyLayout(layout);
    markProgress("mood");
    onNotify(`Layout applied: ${layout.title}`);
  };
  const handleApplyTemplate = (template: VisionTemplate) => {
    adapter?.applyTemplate(template);
    markProgress("mood");
    onNotify(`Recipe applied: ${template.title}`);
  };
  const handleAddText = (preset: VisionTextPreset) => {
    adapter?.createTextPreset(preset);
    markProgress("text");
  };
  const handleBoardSettingsOpen = () => {
    markProgress("mood");
    onBoardSettingsOpen();
  };
  const showChecklist =
    hasBoardContent &&
    !checklistDismissed &&
    !(progress.photo && progress.text && progress.mood);

  return (
  <div className="gratitude-studio" data-theme={theme} ref={studioRef}>
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
            fill="var(--studio-surface)"
          />
        </svg>
        <span>Gratitude Studio</span>
      </div>
      <div className="gratitude-header__board">
        <span className="gratitude-header__eyebrow">YOUR VISION BOARD</span>
        <label className="gratitude-board-name" title="Rename board">
          <span className="sr-only">Board name</span>
          <input
            value={name}
            maxLength={80}
            aria-label="Board name"
            onChange={(event) => onNameChange(event.currentTarget.value)}
            onBlur={() => {
              if (!name.trim()) {
                onNameChange("My vision board");
              }
            }}
          />
        </label>
      </div>
      <div className="gratitude-header__actions">
        <button
          className="gratitude-board-setup"
          type="button"
          onClick={handleBoardSettingsOpen}
        >
          <span aria-hidden="true">✦</span> Board setup
        </button>
        <ExportMenu adapter={adapter} onNotify={onNotify} />
      </div>
    </header>
    <div
      className={`gratitude-workspace${
        boardSettingsOpen ? " gratitude-workspace--inspector-open" : ""
      }`}
    >
      <AssetPanel
        onPlace={handlePlaceAsset}
        onReplace={onReplaceAsset}
        canReplace={adapter?.getSelection().kind === "image"}
        onUpload={handleUploadAsset}
        onApplyLayout={handleApplyLayout}
        onApplyTemplate={handleApplyTemplate}
        onAddText={handleAddText}
      />
      <main className="gratitude-editor" aria-label="Vision board editor">
        <div
          className={`gratitude-selection-toolbar theme--${theme}`}
          aria-live="polite"
        >
          {selectionToolbar}
        </div>
        {!hasBoardContent && adapter && !lobbyDismissed && (
          <GratitudeLobby
            templates={VISION_TEMPLATES}
            onApplyTemplate={handleApplyTemplate}
            onUploadPhoto={handleUploadAsset}
            onBlankCanvas={() => setLobbyDismissed(true)}
            moodColors={LOBBY_MOOD_COLORS}
            activeMood={boardColor}
            onMoodSelect={onMoodSelect}
            onNotify={onNotify}
          />
        )}
        {showChecklist && (
          <GratitudeChecklist
            progress={progress}
            onDismiss={() => setChecklistDismissed(true)}
          />
        )}
        {children}
        <div
          className={`gratitude-editor-footer excalidraw theme--${theme}`}
          ref={footerRef}
        />
      </main>
      {boardSettingsOpen && (
        <aside className="gratitude-inspector" aria-label="Board settings">
          <div className="gratitude-inspector__header">
            <div>
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
            {boardSettings}
          </div>
        </aside>
      )}
    </div>
  </div>
  );
};
