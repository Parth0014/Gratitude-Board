import React from "react";

export type LobbyProgress = {
  photo: boolean;
  text: boolean;
  mood: boolean;
};

export const CHECKLIST_DISMISS_KEY = "gratitude:lobby-checklist-dismissed:v1";

/**
 * Gentle momentum checklist for the first 90 seconds.
 * Collapsible, never blocks, and disappears once momentum is established.
 * Storage access always derives from the mounted node's owner window —
 * no window/document globals.
 */
export const GratitudeChecklist = ({
  progress,
  onDismiss,
}: {
  progress: LobbyProgress;
  onDismiss: () => void;
}) => {
  const rootRef = React.useRef<HTMLElement>(null);
  const steps = [
    { label: "Choose a direction", done: true },
    { label: "Add one personal image", done: progress.photo },
    { label: "Write one intention", done: progress.text },
    { label: "Make it yours", done: progress.mood },
  ];
  const handleDismiss = () => {
    const storage =
      rootRef.current?.ownerDocument.defaultView?.localStorage;
    try {
      storage?.setItem(CHECKLIST_DISMISS_KEY, "1");
    } catch {
      // dismissal is a nicety; ignore storage failures
    }
    onDismiss();
  };
  return (
    <aside
      ref={rootRef}
      className="gratitude-checklist"
      aria-label="Getting started checklist"
    >
      <header>
        <h2>Your first draft</h2>
        <button type="button" aria-label="Dismiss checklist" onClick={handleDismiss}>
          ×
        </button>
      </header>
      <ol>
        {steps.map((step) => (
          <li key={step.label} className={step.done ? "is-done" : ""}>
            {step.label}
          </li>
        ))}
      </ol>
    </aside>
  );
};
