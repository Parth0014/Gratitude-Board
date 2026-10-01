import React from "react";

import { CloseIcon } from "./icons";

import type { CanvasAdapter } from "../vision/contracts";

type ShareAction = "png" | "print" | "video" | "credits";

const ACTIONS: {
  id: ShareAction;
  label: string;
  description: string;
}[] = [
  {
    id: "png",
    label: "Download image",
    description: "A high-resolution PNG of your board, ready to share.",
  },
  {
    id: "print",
    label: "Print or save PDF",
    description: "Open a print-ready layout in a new window.",
  },
  {
    id: "video",
    label: "Download video tour",
    description: "A short WebM video that sweeps across your board.",
  },
  {
    id: "credits",
    label: "Photo credits",
    description: "Download attribution text for photos on your board.",
  },
];

/**
 * Module 6 share dialog: product-owned export UI over the engine's
 * download operations. The engine's native export dialog
 * (exportImage) is deliberately not used — native Excalidraw UI stays
 * disabled.
 */
export const ShareDialog = ({
  adapter,
  boardName,
  onClose,
}: {
  adapter: CanvasAdapter;
  boardName: string;
  onClose: () => void;
}) => {
  const [busy, setBusy] = React.useState<ShareAction | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const ownerDocument = rootRef.current?.ownerDocument;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    ownerDocument?.addEventListener("keydown", closeOnEscape);
    return () => {
      ownerDocument?.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const run = async (action: ShareAction) => {
    const ownerDocument = rootRef.current?.ownerDocument;
    if (!ownerDocument || busy) {
      return;
    }
    setBusy(action);
    setError(null);
    try {
      if (action === "png") {
        await adapter.downloadHighResolution(ownerDocument);
      } else if (action === "print") {
        await adapter.printBoard(ownerDocument);
      } else if (action === "video") {
        await adapter.downloadReelVideo(ownerDocument);
      } else {
        adapter.downloadAttributions(ownerDocument);
      }
    } catch (thrown) {
      setError(
        thrown instanceof Error
          ? thrown.message
          : "Export failed. Please try again.",
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="share-dialog__veil"
      ref={rootRef}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="share-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Share your board"
      >
        <div className="share-dialog__header">
          <div>
            <h2>Share your board</h2>
            <p>{boardName || "My vision board"}</p>
          </div>
          <button
            type="button"
            className="share-dialog__close"
            aria-label="Close share dialog"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
        {error && <p className="share-dialog__error">{error}</p>}
        <ul className="share-dialog__actions">
          {ACTIONS.map((action) => (
            <li key={action.id}>
              <button
                type="button"
                className="share-dialog__action"
                disabled={busy !== null}
                onClick={() => void run(action.id)}
              >
                <span className="share-dialog__action-text">
                  <strong>{action.label}</strong>
                  <span>{action.description}</span>
                </span>
                <span className="share-dialog__action-state" aria-hidden="true">
                  {busy === action.id ? <span className="share-dialog__spinner" /> : "→"}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="share-dialog__hint">
          Exports include everything currently on your board.
        </p>
      </div>
    </div>
  );
};
