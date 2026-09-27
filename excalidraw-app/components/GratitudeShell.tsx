import React from "react";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

export const GratitudeShell = ({
  api,
  name,
  children,
}: {
  api: ExcalidrawImperativeAPI | null;
  name: string;
  children: React.ReactNode;
}) => (
  <div className="gratitude-studio">
    <header className="gratitude-header">
      <div className="gratitude-brand" aria-label="Gratitude Studio">
        <span className="gratitude-brand__mark" aria-hidden="true">
          ♥
        </span>
        <span>Gratitude Studio</span>
      </div>
      <div className="gratitude-board-name" title={name}>
        {name || "My vision board"}
      </div>
      <button
        className="gratitude-export"
        type="button"
        onClick={() =>
          api?.updateScene({
            appState: { openDialog: { name: "imageExport" } },
          })
        }
      >
        Export
      </button>
    </header>
    <div className="gratitude-workspace">
      <main className="gratitude-editor" aria-label="Vision board editor">
        {children}
      </main>
    </div>
  </div>
);
