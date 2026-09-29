import React from "react";

import type { CanvasAdapter } from "../vision/contracts";

export const GratitudeWelcomeScreen = ({
  adapter,
}: {
  adapter: CanvasAdapter | null;
}) => (
  <div className="gratitude-empty-state">
    <div className="gratitude-empty-state__content">
      <div className="gratitude-empty-state__mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="gratitude-empty-state__eyebrow">YOUR SPACE TO DREAM</p>
      <h1>Make space for what matters.</h1>
      <p className="gratitude-empty-state__description">
        Bring your ideas together with photos, notes, and words. Start anywhere.
      </p>
      <div className="gratitude-empty-state__actions">
        <button type="button" onClick={() => adapter?.activateTool("image")}>
          Add a photo
        </button>
        <button type="button" onClick={() => adapter?.activateTool("note")}>
          Add a note
        </button>
        <button type="button" onClick={() => adapter?.activateTool("text")}>
          Add text
        </button>
      </div>
      <p className="gratitude-empty-state__hint">
        Choose a tool, then place it on your board.
      </p>
    </div>
    <div className="gratitude-empty-state__preview" aria-hidden="true">
      <div className="gratitude-empty-state__preview-photo" />
      <div className="gratitude-empty-state__preview-note">
        <span>little things</span>
        <strong>more of this ♡</strong>
      </div>
      <div className="gratitude-empty-state__preview-caption">
        A space that feels like yours
      </div>
    </div>
  </div>
);
