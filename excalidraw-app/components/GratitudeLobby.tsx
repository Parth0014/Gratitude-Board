import React from "react";

import type { VisionTemplate } from "../vision/templates";

/**
 * Inspiration Lobby — the creative starting point.
 * Replaces the three text-only starter buttons with visual recipes,
 * intent chips, a mood preview, and fast routes for experts.
 */
const INTENT_CHIPS: Array<{ label: string; templateId: string | null }> = [
  { label: "Wellbeing", templateId: "wellness-rhythm" },
  { label: "Travel", templateId: "travel-story" },
  { label: "Home", templateId: "peaceful-home" },
  { label: "Career", templateId: "career-growth" },
  { label: "Relationships", templateId: "daily-gratitude" },
  { label: "Something else", templateId: null },
];

export const LOBBY_MOOD_COLORS = [
  "#fbf7f4",
  "#f9e9e4",
  "#e9f0e4",
  "#e7eef7",
  "#efe7f5",
];

export const GratitudeLobby = ({
  templates,
  onApplyTemplate,
  onUploadPhoto,
  onBlankCanvas,
  moodColors,
  activeMood,
  onMoodSelect,
  onNotify,
}: {
  templates: VisionTemplate[];
  onApplyTemplate: (template: VisionTemplate) => void;
  onUploadPhoto: (file: File, ownerDocument: Document) => Promise<void>;
  onBlankCanvas: () => void;
  moodColors: string[];
  activeMood: string;
  onMoodSelect: (color: string) => void;
  onNotify: (message: string) => void;
}) => {
  const [activeChip, setActiveChip] = React.useState<string | null>(null);
  const uploadRef = React.useRef<HTMLInputElement>(null);
  const highlightedId =
    INTENT_CHIPS.find((chip) => chip.label === activeChip)?.templateId ?? null;

  const applyRecipe = (template: VisionTemplate) => {
    onApplyTemplate(template);
  };

  const surpriseMe = () => {
    const pick = templates[Math.floor(Math.random() * templates.length)];
    if (pick) {
      applyRecipe(pick);
    }
  };

  return (
    <section className="gratitude-lobby" aria-label="Start your board">
      <span className="gratitude-lobby__eyebrow">YOUR BOARD BEGINS</span>
      <h1>What would you love to see more of?</h1>
      <p>
        Choose a starting recipe — a full first draft in one tap. Everything
        can be changed later.
      </p>

      <div
        className="gratitude-lobby__chips"
        role="group"
        aria-label="What do you want more of?"
      >
        {INTENT_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            aria-pressed={activeChip === chip.label}
            onClick={() =>
              setActiveChip((current) =>
                current === chip.label ? null : chip.label,
              )
            }
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="gratitude-lobby__recipes">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            className={`gratitude-lobby__recipe${
              highlightedId === template.id ? " is-highlighted" : ""
            }`}
            style={
              {
                "--recipe-accent": template.accent,
              } as React.CSSProperties
            }
            onClick={() => applyRecipe(template)}
            aria-label={`Start with the ${template.title} recipe`}
          >
            <span>{template.category}</span>
            <strong>{template.title}</strong>
            <em>{template.prompt}</em>
            <small>Use this recipe →</small>
          </button>
        ))}
      </div>

      <div className="gratitude-lobby__mood">
        <span id="gratitude-lobby-mood-label">Preview the mood</span>
        <div
          className="gratitude-lobby__swatches"
          role="group"
          aria-labelledby="gratitude-lobby-mood-label"
        >
          {moodColors.map((color) => (
            <button
              key={color}
              type="button"
              style={{ "--swatch": color } as React.CSSProperties}
              aria-label={`Preview board color ${color}`}
              aria-pressed={activeMood.toLowerCase() === color.toLowerCase()}
              onClick={() => {
                onMoodSelect(color);
                onNotify("Mood preview applied — change it anytime");
              }}
            />
          ))}
        </div>
      </div>

      <div className="gratitude-lobby__routes">
        <button
          type="button"
          className="is-primary"
          onClick={surpriseMe}
          aria-label="Surprise me with a random recipe"
        >
          <span aria-hidden="true">✦</span> Surprise me
        </button>
        <button type="button" onClick={() => uploadRef.current?.click()}>
          <span aria-hidden="true">↑</span> Use my photos
        </button>
        <button type="button" onClick={onBlankCanvas}>
          Blank canvas
        </button>
        <input
          ref={uploadRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-label="Choose a photo to upload"
          className="visually-hidden"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            const ownerDocument = event.currentTarget.ownerDocument;
            if (file) {
              void onUploadPhoto(file, ownerDocument).catch(() =>
                onNotify("That photo could not be added. Try another."),
              );
            }
            event.currentTarget.value = "";
          }}
        />
      </div>
    </section>
  );
};
