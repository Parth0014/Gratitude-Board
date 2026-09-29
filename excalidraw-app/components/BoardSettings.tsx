import React, { useEffect, useState } from "react";

export type BoardTexture = "none" | "paper" | "dots" | "grid";

const presets = [
  { label: "Square", width: 1080, height: 1080 },
  { label: "Landscape 4:3", width: 1200, height: 900 },
  { label: "Widescreen 16:9", width: 1920, height: 1080 },
  { label: "Portrait 4:5", width: 1080, height: 1350 },
  { label: "Story 9:16", width: 1080, height: 1920 },
];

export const BoardSettings = ({
  width,
  height,
  color,
  texture,
  hasImage,
  onSizeChange,
  onColorChange,
  onTextureChange,
  onImageChange,
  onImageRemove,
}: {
  width: number;
  height: number;
  color: string;
  texture: BoardTexture;
  hasImage: boolean;
  onSizeChange: (width: number, height: number) => void;
  onColorChange: (color: string) => void;
  onTextureChange: (texture: BoardTexture) => void;
  onImageChange: (file: File) => void;
  onImageRemove: () => void;
}) => {
  const [draftWidth, setDraftWidth] = useState(width);
  const [draftHeight, setDraftHeight] = useState(height);

  useEffect(() => {
    setDraftWidth(width);
    setDraftHeight(height);
  }, [width, height]);

  const applySize = () => {
    if (Number.isFinite(draftWidth) && Number.isFinite(draftHeight)) {
      onSizeChange(
        Math.round(Math.max(320, Math.min(4096, draftWidth))),
        Math.round(Math.max(320, Math.min(4096, draftHeight))),
      );
    }
  };

  return (
    <div className="gratitude-board-settings">
      <section>
        <h3>Board size</h3>
        <p>Choose a format or set an exact size in pixels.</p>
        <div className="gratitude-board-settings__presets">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              aria-pressed={width === preset.width && height === preset.height}
              onClick={() => onSizeChange(preset.width, preset.height)}
            >
              {preset.label}
              <small>
                {preset.width} × {preset.height}
              </small>
            </button>
          ))}
        </div>
        <div className="gratitude-board-settings__size">
          <label>
            Width
            <input
              type="number"
              min="320"
              max="4096"
              value={draftWidth}
              onChange={(event) => setDraftWidth(Number(event.target.value))}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applySize();
                }
              }}
            />
          </label>
          <span>×</span>
          <label>
            Height
            <input
              type="number"
              min="320"
              max="4096"
              value={draftHeight}
              onChange={(event) => setDraftHeight(Number(event.target.value))}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applySize();
                }
              }}
            />
          </label>
          <button type="button" onClick={applySize}>
            Apply
          </button>
        </div>
      </section>
      <section>
        <h3>Background color</h3>
        <div className="gratitude-board-settings__color">
          <input
            type="color"
            aria-label="Board background color"
            value={color}
            onChange={(event) => onColorChange(event.target.value)}
          />
          <span>{color.toUpperCase()}</span>
        </div>
      </section>
      <section>
        <h3>Texture</h3>
        <div className="gratitude-board-settings__textures">
          {(["none", "paper", "dots", "grid"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={texture === option}
              onClick={() => onTextureChange(option)}
            >
              <span
                className={`gratitude-board-settings__texture gratitude-board-settings__texture--${option}`}
              />
              {option === "none"
                ? "Plain"
                : option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3>Background image</h3>
        <p>Place a photo behind your board content.</p>
        <label className="gratitude-board-settings__upload">
          {hasImage ? "Replace image" : "Upload image"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) {
                onImageChange(file);
              }
              event.currentTarget.value = "";
            }}
          />
        </label>
        {hasImage && (
          <button
            type="button"
            className="gratitude-board-settings__remove"
            onClick={onImageRemove}
          >
            Remove image
          </button>
        )}
      </section>
    </div>
  );
};
