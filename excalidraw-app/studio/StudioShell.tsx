import React from "react";

import { BackgroundPanel } from "./BackgroundPanel";
import { ElementsPanel } from "./ElementsPanel";
import { PhotosPanel } from "./PhotosPanel";
import { ShareDialog } from "./ShareDialog";
import { StudioDock } from "./StudioDock";
import { TemplatesPanel } from "./TemplatesPanel";
import { TextPanel } from "./TextPanel";
import { TopBar } from "./TopBar";
import { UploadsPanel } from "./UploadsPanel";
import { CloseIcon } from "./icons";

import type { CanvasAdapter } from "../vision/contracts";

import type { BoardTexture } from "../components/BoardSettings";
import type { GratitudeAsset } from "../assets/contracts";

import type { StudioTab } from "./studioTypes";
import { STUDIO_TAB_LABELS } from "./studioTypes";
import type { VisionTheme, VisionTextPreset } from "../vision/contracts";
import type { VisionTemplate } from "../vision/templates";

export interface StudioShellProps {
  boardName: string;
  onNameChange: (name: string) => void;
  onNewBoard: () => void;
  hasBoardContent: boolean;
  onApplyTemplate: (template: VisionTemplate) => void;
  stickers: GratitudeAsset[];
  stickersLoading: boolean;
  onInsertSticker: (asset: GratitudeAsset) => Promise<void>;
  onInsertText: (preset: VisionTextPreset) => void;
  onSearchPhotos: (query: string) => Promise<GratitudeAsset[]>;
  onInsertPhoto: (asset: GratitudeAsset) => Promise<void>;
  onUploadFiles: (files: File[]) => Promise<void>;
  boardColor: string;
  onBoardColor: (color: string) => void;
  boardTexture: BoardTexture;
  onBoardTexture: (texture: BoardTexture) => void;
  shareOpen: boolean;
  onOpenShare: () => void;
  onCloseShare: () => void;
  canvasAdapter: CanvasAdapter | null;
  theme: VisionTheme;
  onFitBoard: () => void;
  /** True while the selection pill is visible; the dock yields to it. */
  hasSelection: boolean;
  children: React.ReactNode;
}

/**
 * Module 1 — Gratitude Studio shell.
 *
 * Owns the Canva-style chrome (top bar, icon rail, flyout mechanics) and
 * hosts the Excalidraw engine as an opaque child. The engine is mounted with
 * its default UI disabled (`ui={false}` on the Excalidraw component), so no
 * stock toolbar, zoom pill, or menus can leak through — every control the
 * user sees is ours. Engine operations flow through the CanvasAdapter,
 * which App creates from the imperative API.
 */
export const StudioShell = ({
  boardName,
  onNameChange,
  onNewBoard,
  hasBoardContent,
  onApplyTemplate,
  stickers,
  stickersLoading,
  onInsertSticker,
  onInsertText,
  onSearchPhotos,
  onInsertPhoto,
  onUploadFiles,
  boardColor,
  onBoardColor,
  boardTexture,
  onBoardTexture,
  shareOpen,
  onOpenShare,
  onCloseShare,
  canvasAdapter,
  theme,
  onFitBoard,
  hasSelection,
  children,
}: StudioShellProps) => {
  const [activeTab, setActiveTab] = React.useState<StudioTab | null>(null);

  const panel =
    activeTab === "templates" ? (
      <TemplatesPanel onApplyTemplate={onApplyTemplate} />
    ) : activeTab === "elements" ? (
      <ElementsPanel
        stickers={stickers}
        stickersLoading={stickersLoading}
        onInsertSticker={onInsertSticker}
      />
    ) : activeTab === "text" ? (
      <TextPanel onInsertText={onInsertText} />
    ) : activeTab === "photos" ? (
      <PhotosPanel
        onSearchPhotos={onSearchPhotos}
        onInsertPhoto={onInsertPhoto}
      />
    ) : activeTab === "uploads" ? (
      <UploadsPanel onUploadFiles={onUploadFiles} />
    ) : activeTab === "background" ? (
      <BackgroundPanel
        boardColor={boardColor}
        onBoardColor={onBoardColor}
        boardTexture={boardTexture}
        onBoardTexture={onBoardTexture}
      />
    ) : undefined;

  return (
    <div className="studio" data-theme={theme} data-testid="gratitude-studio">
      <TopBar
        boardName={boardName}
        onNameChange={onNameChange}
        onFitBoard={onFitBoard}
        onNewBoard={onNewBoard}
        onShare={onOpenShare}
        hasBoardContent={hasBoardContent}
      />
      {shareOpen && canvasAdapter && (
        <ShareDialog
          adapter={canvasAdapter}
          boardName={boardName}
          onClose={onCloseShare}
        />
      )}
      <div className="studio-body">
        <main className="studio-canvas" aria-label="Vision board canvas">
          {children}
        </main>
        {activeTab && (
          <section
            className="studio-panel"
            aria-label={`${STUDIO_TAB_LABELS[activeTab]} panel`}
          >
            <div className="studio-panel__header">
              <div>
                <h2>{STUDIO_TAB_LABELS[activeTab]}</h2>
              </div>
              <button
                type="button"
                className="studio-panel__close"
                aria-label="Close panel"
                onClick={() => setActiveTab(null)}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="studio-panel__body">{panel}</div>
          </section>
        )}
        <StudioDock
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          hidden={hasSelection}
        />
      </div>
    </div>
  );
};
