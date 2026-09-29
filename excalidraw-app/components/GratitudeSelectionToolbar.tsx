import React from "react";

import { VISION_FONTS } from "../vision/fonts";

import type {
  CanvasAdapter,
  VisionFontFamily,
  VisionSelection,
} from "../vision/contracts";

const FONTS = VISION_FONTS.map((font) => ({
  label: font.family,
  value: font.id,
  category: font.category,
}));
const SWATCHES = [
  "#33272b",
  "#ea436b",
  "#8b5277",
  "#8c75c6",
  "#6b927d",
  "#bf8b48",
  "#ffffff",
];
const PAPERS = [
  "#f9dce3",
  "#fbe5d5",
  "#fbefca",
  "#def0e5",
  "#ebe2f7",
  "#dfecf7",
];

const ColorField = ({
  label,
  value,
  colors,
  onChange,
}: {
  label: string;
  value: string;
  colors: string[];
  onChange: (color: string) => void;
}) => (
  <div className="gratitude-selection-toolbar__colors" aria-label={label}>
    <span>{label}</span>
    {colors.map((color) => (
      <button
        key={color}
        type="button"
        className={value === color ? "is-active" : ""}
        style={{ backgroundColor: color }}
        title={color}
        aria-label={`${label} ${color}`}
        aria-pressed={value === color}
        onClick={() => onChange(color)}
      />
    ))}
    <label
      className="gratitude-selection-toolbar__custom"
      title={`Custom ${label.toLowerCase()}`}
    >
      <input
        type="color"
        aria-label={`Custom ${label.toLowerCase()}`}
        value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff"}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  </div>
);

export const GratitudeSelectionToolbar = ({
  adapter,
  selection,
}: {
  adapter: CanvasAdapter | null;
  selection: VisionSelection;
}) => {
  const [photoPanel, setPhotoPanel] = React.useState<
    "crop" | "adjust" | "style" | "effects"
  >("crop");
  if (!adapter || selection.count !== 1) {
    return selection.count > 1 ? (
      <div className="gratitude-selection-toolbar__hint">
        {selection.count} items selected
      </div>
    ) : null;
  }
  const { kind, style } = selection;
  const names = {
    text: "Text",
    note: "Note",
    image: "Photo",
    drawing: "Drawing",
    shape: "Shape",
    item: "Item",
    none: "Item",
    multiple: "Items",
  } as const;
  return (
    <div className="gratitude-selection-toolbar__inner">
      <span className="gratitude-selection-toolbar__name">{names[kind]}</span>
      <div
        className="gratitude-selection-toolbar__buttons gratitude-selection-toolbar__quick"
        aria-label="Quick actions"
      >
        <button type="button" onClick={() => adapter.duplicateSelection()}>
          Duplicate
        </button>
        <button type="button" onClick={() => adapter.arrangeSelection("front")}>
          Front
        </button>
        <button type="button" onClick={() => adapter.arrangeSelection("back")}>
          Back
        </button>
        <button
          type="button"
          className="is-danger"
          onClick={() => adapter.delete(selection.ids)}
        >
          Delete
        </button>
      </div>
      {kind === "text" && (
        <>
          <select
            aria-label="Font"
            value={style.fontFamily}
            onChange={(event) =>
              adapter.updateSelection({
                fontFamily: event.currentTarget.value as VisionFontFamily,
              })
            }
          >
            {(["editorial", "handwritten", "playful", "minimal"] as const).map(
              (category) => (
                <optgroup
                  key={category}
                  label={category[0].toUpperCase() + category.slice(1)}
                >
                  {FONTS.filter((font) => font.category === category).map(
                    (font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ),
                  )}
                </optgroup>
              ),
            )}
          </select>
          <label className="gratitude-selection-toolbar__number">
            Size
            <input
              aria-label="Font size"
              type="number"
              min="8"
              max="200"
              value={style.fontSize}
              onChange={(event) =>
                adapter.updateSelection({
                  fontSize: Math.max(
                    8,
                    Math.min(200, Number(event.currentTarget.value) || 8),
                  ),
                })
              }
            />
          </label>
          <ColorField
            label="Text"
            value={style.strokeColor || SWATCHES[0]}
            colors={SWATCHES}
            onChange={(strokeColor) => adapter.updateSelection({ strokeColor })}
          />
          <div
            className="gratitude-selection-toolbar__buttons"
            aria-label="Text alignment"
          >
            {(["left", "center", "right"] as const).map((textAlign) => (
              <button
                key={textAlign}
                type="button"
                aria-label={`Align ${textAlign}`}
                aria-pressed={style.textAlign === textAlign}
                className={style.textAlign === textAlign ? "is-active" : ""}
                onClick={() => adapter.updateSelection({ textAlign })}
              >
                {textAlign === "left"
                  ? "≡"
                  : textAlign === "center"
                  ? "☷"
                  : "≣"}
              </button>
            ))}
          </div>
        </>
      )}
      {kind === "note" && (
        <ColorField
          label="Paper"
          value={style.backgroundColor || PAPERS[0]}
          colors={PAPERS}
          onChange={(backgroundColor) =>
            adapter.updateSelection({ backgroundColor })
          }
        />
      )}
      {kind === "image" && (
        <>
          <div className="gratitude-photo-tabs" aria-label="Photo editing">
            {(["crop", "adjust", "style", "effects"] as const).map((panel) => (
              <button
                key={panel}
                type="button"
                aria-pressed={photoPanel === panel}
                className={photoPanel === panel ? "is-active" : ""}
                onClick={() => setPhotoPanel(panel)}
              >
                {panel === "style"
                  ? "Filters & frame"
                  : panel[0].toUpperCase() + panel.slice(1)}
              </button>
            ))}
          </div>
          {photoPanel === "crop" && (
            <>
              <div
                className="gratitude-selection-toolbar__buttons"
                aria-label="Photo crop and fit"
              >
                <button type="button" onClick={() => adapter.startImageCrop()}>
                  Crop
                </button>
                <button
                  type="button"
                  onClick={() => adapter.setImageFit("fit")}
                >
                  Fit
                </button>
                <button
                  type="button"
                  onClick={() => adapter.setImageFit("fill")}
                >
                  Fill
                </button>
                <button
                  type="button"
                  onClick={() => adapter.rotateSelection(90)}
                >
                  Rotate
                </button>
              </div>
              {(["width", "height"] as const).map((axis) => (
                <label
                  className="gratitude-selection-toolbar__number"
                  key={axis}
                >
                  {axis === "width" ? "Width" : "Height"}
                  <input
                    type="number"
                    min="16"
                    max="2000"
                    aria-label={`Photo ${axis}`}
                    value={Math.round(style[axis] || 16)}
                    onChange={(event) =>
                      adapter.updateSelection({
                        [axis]: Math.max(
                          16,
                          Math.min(
                            2000,
                            Number(event.currentTarget.value) || 16,
                          ),
                        ),
                      })
                    }
                  />
                </label>
              ))}
            </>
          )}
          {photoPanel === "style" && (
            <>
              <label className="gratitude-selection-toolbar__number">
                Filter
                <select
                  aria-label="Photo filter"
                  value={style.imageEdits?.filter || "original"}
                  onChange={(event) =>
                    void adapter.updateImageEdits(
                      {
                        filter: event.currentTarget.value as NonNullable<
                          typeof style.imageEdits
                        >["filter"],
                      },
                      event.currentTarget.ownerDocument,
                    )
                  }
                >
                  {(
                    [
                      "original",
                      "warm",
                      "film",
                      "soft",
                      "mono",
                      "dreamy",
                      "vintage",
                    ] as const
                  ).map((filter) => (
                    <option key={filter} value={filter}>
                      {filter[0].toUpperCase() + filter.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="gratitude-selection-toolbar__number">
                Frame
                <select
                  aria-label="Photo frame"
                  value={style.imageEdits?.frame || "none"}
                  onChange={(event) =>
                    void adapter.updateImageEdits(
                      {
                        frame: event.currentTarget.value as NonNullable<
                          typeof style.imageEdits
                        >["frame"],
                      },
                      event.currentTarget.ownerDocument,
                    )
                  }
                >
                  {(
                    [
                      "none",
                      "rounded",
                      "circle",
                      "polaroid",
                      "film",
                      "arch",
                      "heart",
                      "blob",
                      "organic",
                      "torn",
                    ] as const
                  ).map((frame) => (
                    <option key={frame} value={frame}>
                      {frame[0].toUpperCase() + frame.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              <div
                className="gratitude-selection-toolbar__buttons"
                aria-label="Flip photo"
              >
                <button
                  type="button"
                  aria-pressed={!!style.imageEdits?.flipX}
                  onClick={(event) =>
                    void adapter.updateImageEdits(
                      { flipX: !style.imageEdits?.flipX },
                      event.currentTarget.ownerDocument,
                    )
                  }
                >
                  Flip H
                </button>
                <button
                  type="button"
                  aria-pressed={!!style.imageEdits?.flipY}
                  onClick={(event) =>
                    void adapter.updateImageEdits(
                      { flipY: !style.imageEdits?.flipY },
                      event.currentTarget.ownerDocument,
                    )
                  }
                >
                  Flip V
                </button>
              </div>
              <label className="gratitude-selection-toolbar__number">
                Border
                <select
                  aria-label="Photo border width"
                  value={style.imageEdits?.borderWidth || 0}
                  onChange={(event) =>
                    void adapter.updateImageEdits(
                      { borderWidth: Number(event.currentTarget.value) },
                      event.currentTarget.ownerDocument,
                    )
                  }
                >
                  {[0, 2, 4, 8, 12, 20].map((width) => (
                    <option key={width} value={width}>
                      {width === 0 ? "None" : `${width}px`}
                    </option>
                  ))}
                </select>
              </label>
              <label
                className="gratitude-selection-toolbar__custom"
                title="Border color"
              >
                <input
                  type="color"
                  aria-label="Photo border color"
                  value={style.imageEdits?.borderColor || "#ffffff"}
                  onChange={(event) =>
                    void adapter.updateImageEdits(
                      { borderColor: event.currentTarget.value },
                      event.currentTarget.ownerDocument,
                    )
                  }
                />
              </label>
              <button
                type="button"
                onPointerDown={() => adapter.previewOriginalImage(true)}
                onPointerUp={() => adapter.previewOriginalImage(false)}
                onPointerCancel={() => adapter.previewOriginalImage(false)}
                onPointerLeave={() => adapter.previewOriginalImage(false)}
              >
                Hold to compare
              </button>
              <button
                type="button"
                onClick={(event) =>
                  void adapter.resetImageEdits(
                    event.currentTarget.ownerDocument,
                  )
                }
              >
                Reset edits
              </button>
            </>
          )}
          {photoPanel === "adjust" && (
            <>
              {(["brightness", "contrast", "saturation"] as const).map(
                (adjustment) => (
                  <label
                    className="gratitude-selection-toolbar__opacity"
                    key={adjustment}
                  >
                    {adjustment[0].toUpperCase() + adjustment.slice(1)}{" "}
                    {style.imageEdits?.[adjustment] || 100}%
                    <input
                      type="range"
                      min="50"
                      max="150"
                      step="5"
                      value={style.imageEdits?.[adjustment] || 100}
                      onChange={(event) =>
                        void adapter.updateImageEdits(
                          { [adjustment]: Number(event.currentTarget.value) },
                          event.currentTarget.ownerDocument,
                        )
                      }
                    />
                  </label>
                ),
              )}
              {(["exposure", "highlights", "shadows"] as const).map(
                (adjustment) => (
                  <label
                    className="gratitude-selection-toolbar__opacity"
                    key={adjustment}
                  >
                    {adjustment[0].toUpperCase() + adjustment.slice(1)}{" "}
                    {style.imageEdits?.[adjustment] || 0}
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      step="5"
                      value={style.imageEdits?.[adjustment] || 0}
                      onChange={(event) =>
                        void adapter.updateImageEdits(
                          { [adjustment]: Number(event.currentTarget.value) },
                          event.currentTarget.ownerDocument,
                        )
                      }
                    />
                  </label>
                ),
              )}
              {(["fade", "grain"] as const).map((adjustment) => (
                <label
                  className="gratitude-selection-toolbar__opacity"
                  key={adjustment}
                >
                  {adjustment[0].toUpperCase() + adjustment.slice(1)}{" "}
                  {style.imageEdits?.[adjustment] || 0}%
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={style.imageEdits?.[adjustment] || 0}
                    onChange={(event) =>
                      void adapter.updateImageEdits(
                        { [adjustment]: Number(event.currentTarget.value) },
                        event.currentTarget.ownerDocument,
                      )
                    }
                  />
                </label>
              ))}
              <label className="gratitude-selection-toolbar__opacity">
                Warmth {style.imageEdits?.warmth || 0}
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="10"
                  value={style.imageEdits?.warmth || 0}
                  onChange={(event) =>
                    void adapter.updateImageEdits(
                      { warmth: Number(event.currentTarget.value) },
                      event.currentTarget.ownerDocument,
                    )
                  }
                />
              </label>
              <label className="gratitude-selection-toolbar__opacity">
                Blur {style.imageEdits?.blur || 0}px
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={style.imageEdits?.blur || 0}
                  onChange={(event) =>
                    void adapter.updateImageEdits(
                      { blur: Number(event.currentTarget.value) },
                      event.currentTarget.ownerDocument,
                    )
                  }
                />
              </label>
            </>
          )}
          {photoPanel === "effects" && (
            <>
              {(["shadow", "glow"] as const).map((effect) => (
                <label
                  className="gratitude-selection-toolbar__opacity"
                  key={effect}
                >
                  {effect[0].toUpperCase() + effect.slice(1)}{" "}
                  {style.imageEdits?.[effect] || 0}px
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="2"
                    value={style.imageEdits?.[effect] || 0}
                    onChange={(event) =>
                      void adapter.updateImageEdits(
                        { [effect]: Number(event.currentTarget.value) },
                        event.currentTarget.ownerDocument,
                      )
                    }
                  />
                </label>
              ))}
              <p className="gratitude-selection-toolbar__hint">
                Effects are baked into the photo so they stay consistent in
                exports.
              </p>
            </>
          )}
        </>
      )}
      {(kind === "shape" || kind === "drawing") && (
        <>
          {kind === "shape" && (
            <ColorField
              label="Fill"
              value={style.backgroundColor || PAPERS[0]}
              colors={PAPERS}
              onChange={(backgroundColor) =>
                adapter.updateSelection({ backgroundColor })
              }
            />
          )}
          <ColorField
            label={kind === "drawing" ? "Ink" : "Outline"}
            value={style.strokeColor || SWATCHES[0]}
            colors={SWATCHES}
            onChange={(strokeColor) => adapter.updateSelection({ strokeColor })}
          />
          <label className="gratitude-selection-toolbar__number">
            Width
            <select
              aria-label="Stroke width"
              value={style.strokeWidth}
              onChange={(event) =>
                adapter.updateSelection({
                  strokeWidth: Number(event.currentTarget.value),
                })
              }
            >
              {[1, 2, 4, 8].map((width) => (
                <option key={width} value={width}>
                  {width}px
                </option>
              ))}
            </select>
          </label>
          {style.rounded !== undefined && (
            <button
              type="button"
              className={style.rounded ? "is-active" : ""}
              aria-pressed={style.rounded}
              onClick={() =>
                adapter.updateSelection({ rounded: !style.rounded })
              }
            >
              Rounded corners
            </button>
          )}
        </>
      )}
      <label className="gratitude-selection-toolbar__opacity">
        Opacity {style.opacity}%
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={style.opacity}
          aria-label="Opacity"
          onChange={(event) =>
            adapter.updateSelection({
              opacity: Number(event.currentTarget.value),
            })
          }
        />
      </label>
    </div>
  );
};
