import React from "react";

import { AssetPanel } from "./AssetPanel";

import type { CanvasAdapter, VisionTheme } from "../vision/contracts";

import type { GratitudeAsset } from "../assets/contracts";

const ExportMenu = ({ adapter }: { adapter: CanvasAdapter | null }) => {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  return (
    <div className="gratitude-export-menu" ref={rootRef}>
      <button
        className="gratitude-export"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Export
      </button>
      {open && (
        <div role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              adapter?.exportImage();
              setOpen(false);
            }}
          >
            <strong>Board image</strong>
            <span>PNG or SVG at your chosen scale</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              adapter?.exportSelection();
              setOpen(false);
            }}
          >
            <strong>Selected print piece</strong>
            <span>Export the selected photo or polaroid</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={(event) => {
              adapter?.downloadReelPlan(event.currentTarget.ownerDocument);
              setOpen(false);
            }}
          >
            <strong>Reel plan</strong>
            <span>9:16 sequence manifest for rendering</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={(event) => {
              adapter?.downloadReel(event.currentTarget.ownerDocument);
              setOpen(false);
            }}
          >
            <strong>Playable reel</strong>
            <span>Self-contained animated 9:16 story</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={(event) => {
              adapter?.downloadAttributions(event.currentTarget.ownerDocument);
              setOpen(false);
            }}
          >
            <strong>Asset credits</strong>
            <span>Required creator and license details</span>
          </button>
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
  onUploadAsset,
  rightOpen,
  boardSettingsOpen,
  onBoardSettingsOpen,
  boardSettings,
  onRightToggle,
  footerRef,
  selectionToolbar,
  children,
}: {
  adapter: CanvasAdapter | null;
  name: string;
  theme: VisionTheme;
  onPlaceAsset: (
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
        onUpload={onUploadAsset}
        onApplyLayout={(layout) => adapter?.applyLayout(layout)}
        onAddText={(preset) => adapter?.createTextPreset(preset)}
      />
      <main className="gratitude-editor" aria-label="Vision board editor">
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
