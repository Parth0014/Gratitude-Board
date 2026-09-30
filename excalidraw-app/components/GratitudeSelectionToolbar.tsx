import React from "react";

import { VISION_FONTS } from "../vision/fonts";

import type {
  CanvasAdapter,
  VisionFontFamily,
  VisionImageEdits,
  VisionSelection,
} from "../vision/contracts";

const FONTS = VISION_FONTS.map((font) => ({
  label: font.family,
  value: font.id,
  category: font.category,
}));
const INK_COLORS = [
  "#33272b",
  "#b4325a",
  "#8b5277",
  "#6f5eb5",
  "#557f6b",
  "#a86f35",
  "#ffffff",
];
const FILL_COLORS = [
  "#f9dce3",
  "#fbe5d5",
  "#fbefca",
  "#def0e5",
  "#ebe2f7",
  "#dfecf7",
  "#ffffff",
];

type Panel = "color" | "position" | "adjust" | "more" | "opacity" | null;

const Icon = ({ name }: { name: "copy" | "layers" | "trash" }) => {
  const paths = {
    copy: (
      <>
        <rect x="8" y="8" width="10" height="10" rx="2" />
        <path d="M6 14H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3-9 5 9 5 9-5-9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
      </>
    ),
  } as const;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

const Divider = () => (
  <span className="gratitude-toolbar__divider" aria-hidden="true" />
);

const Swatches = ({
  label,
  value,
  colors,
  onChange,
}: {
  label: string;
  value: string;
  colors: string[];
  onChange: (value: string) => void;
}) => (
  <div className="gratitude-toolbar__swatches" aria-label={label}>
    {colors.map((color) => (
      <button
        key={color}
        type="button"
        className={value === color ? "is-active" : ""}
        style={{ backgroundColor: color }}
        aria-label={`${label} ${color}`}
        aria-pressed={value === color}
        onClick={() => onChange(color)}
      />
    ))}
    <label
      className="gratitude-toolbar__custom-color"
      title={`Custom ${label}`}
    >
      <input
        type="color"
        aria-label={`Custom ${label}`}
        value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff"}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      <span>+</span>
    </label>
  </div>
);

const Range = ({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) => (
  <label className="gratitude-toolbar__range">
    <span>{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.currentTarget.value))}
    />
    <output>
      {value}
      {suffix}
    </output>
  </label>
);

export const GratitudeSelectionToolbar = ({
  adapter,
  selection,
}: {
  adapter: CanvasAdapter | null;
  selection: VisionSelection;
}) => {
  const [panel, setPanel] = React.useState<Panel>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const selectionKey = selection.ids.join(",");

  React.useEffect(() => setPanel(null), [selectionKey]);
  React.useEffect(() => {
    if (!panel) {
      return;
    }
    const ownerDocument = rootRef.current?.ownerDocument;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPanel(null);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanel(null);
      }
    };
    ownerDocument?.addEventListener("pointerdown", close);
    ownerDocument?.addEventListener("keydown", closeOnEscape);
    return () => {
      ownerDocument?.removeEventListener("pointerdown", close);
      ownerDocument?.removeEventListener("keydown", closeOnEscape);
    };
  }, [panel]);

  if (!adapter || selection.count === 0) {
    return null;
  }

  const { kind, style } = selection;
  const isMultiple = selection.count > 1;
  const title = isMultiple
    ? `${selection.count} items`
    : (
        {
          text: "Text",
          note: "Note",
          image: "Photo",
          drawing: "Drawing",
          shape: "Shape",
          item: "Item",
          none: "Item",
          multiple: "Items",
        } as const
      )[kind];
  const togglePanel = (next: Exclude<Panel, null>) =>
    setPanel((current) => (current === next ? null : next));
  const updateImage = (
    patch: Partial<VisionImageEdits>,
    ownerDocument: Document,
  ) => void adapter.updateImageEdits(patch, ownerDocument);

  return (
    <div className="gratitude-selection-toolbar__inner" ref={rootRef}>
      <span className="gratitude-selection-toolbar__name">{title}</span>
      <Divider />

      {!isMultiple && kind === "text" && (
        <>
          <select
            className="gratitude-toolbar__select gratitude-toolbar__select--font"
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
          <input
            className="gratitude-toolbar__number"
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
          <div className="gratitude-toolbar__anchor">
            <button
              type="button"
              className="gratitude-toolbar__color"
              aria-label="Text color"
              aria-expanded={panel === "color"}
              style={
                {
                  "--toolbar-color": style.strokeColor || INK_COLORS[0],
                } as React.CSSProperties
              }
              onClick={() => togglePanel("color")}
            />
            {panel === "color" && (
              <div className="gratitude-toolbar__popover">
                <strong>Text color</strong>
                <Swatches
                  label="Text color"
                  value={style.strokeColor || INK_COLORS[0]}
                  colors={INK_COLORS}
                  onChange={(strokeColor) =>
                    adapter.updateSelection({ strokeColor })
                  }
                />
              </div>
            )}
          </div>
          <div
            className="gratitude-toolbar__segmented"
            aria-label="Text alignment"
          >
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                type="button"
                className={style.textAlign === align ? "is-active" : ""}
                aria-label={`Align ${align}`}
                aria-pressed={style.textAlign === align}
                onClick={() => adapter.updateSelection({ textAlign: align })}
              >
                {align === "left" ? "≡" : align === "center" ? "☷" : "≣"}
              </button>
            ))}
          </div>
        </>
      )}

      {!isMultiple && kind === "image" && (
        <>
          <button type="button" onClick={() => adapter.startImageCrop()}>
            Crop
          </button>
          <button type="button" onClick={() => adapter.setImageFit("fit")}>
            Fit
          </button>
          <button type="button" onClick={() => adapter.setImageFit("fill")}>
            Fill
          </button>
          <select
            className="gratitude-toolbar__select"
            aria-label="Photo filter"
            value={style.imageEdits?.filter || "original"}
            onChange={(event) =>
              updateImage(
                {
                  filter: event.currentTarget
                    .value as VisionImageEdits["filter"],
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
                {filter === "original"
                  ? "No filter"
                  : filter[0].toUpperCase() + filter.slice(1)}
              </option>
            ))}
          </select>
          <div className="gratitude-toolbar__anchor">
            <button
              type="button"
              aria-expanded={panel === "adjust"}
              onClick={() => togglePanel("adjust")}
            >
              Adjust
            </button>
            {panel === "adjust" && (
              <div className="gratitude-toolbar__popover gratitude-toolbar__popover--wide">
                <strong>Adjust photo</strong>
                {(["brightness", "contrast", "saturation"] as const).map(
                  (key) => (
                    <Range
                      key={key}
                      label={key[0].toUpperCase() + key.slice(1)}
                      value={style.imageEdits?.[key] || 100}
                      min={50}
                      max={150}
                      step={5}
                      suffix="%"
                      onChange={(value) =>
                        rootRef.current &&
                        updateImage(
                          { [key]: value },
                          rootRef.current.ownerDocument,
                        )
                      }
                    />
                  ),
                )}
                {(["exposure", "highlights", "shadows", "warmth"] as const).map(
                  (key) => (
                    <Range
                      key={key}
                      label={key[0].toUpperCase() + key.slice(1)}
                      value={style.imageEdits?.[key] || 0}
                      min={-100}
                      max={100}
                      step={5}
                      onChange={(value) =>
                        rootRef.current &&
                        updateImage(
                          { [key]: value },
                          rootRef.current.ownerDocument,
                        )
                      }
                    />
                  ),
                )}
                <Range
                  label="Fade"
                  value={style.imageEdits?.fade || 0}
                  min={0}
                  max={100}
                  step={5}
                  suffix="%"
                  onChange={(fade) =>
                    rootRef.current &&
                    updateImage({ fade }, rootRef.current.ownerDocument)
                  }
                />
                <Range
                  label="Blur"
                  value={style.imageEdits?.blur || 0}
                  min={0}
                  max={12}
                  suffix="px"
                  onChange={(blur) =>
                    rootRef.current &&
                    updateImage({ blur }, rootRef.current.ownerDocument)
                  }
                />
              </div>
            )}
          </div>
          <div className="gratitude-toolbar__anchor">
            <button
              type="button"
              aria-expanded={panel === "more"}
              onClick={() => togglePanel("more")}
            >
              More
            </button>
            {panel === "more" && (
              <div className="gratitude-toolbar__popover gratitude-toolbar__popover--compact">
                <strong>Photo tools</strong>
                <label>
                  Frame
                  <select
                    aria-label="Photo frame"
                    value={style.imageEdits?.frame || "none"}
                    onChange={(event) =>
                      updateImage(
                        {
                          frame: event.currentTarget
                            .value as VisionImageEdits["frame"],
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
                <button
                  type="button"
                  onClick={() => adapter.rotateSelection(90)}
                >
                  Rotate 90°
                </button>
                <button
                  type="button"
                  onClick={(event) =>
                    updateImage(
                      { flipX: !style.imageEdits?.flipX },
                      event.currentTarget.ownerDocument,
                    )
                  }
                >
                  Flip horizontal
                </button>
                <button
                  type="button"
                  onClick={(event) =>
                    updateImage(
                      { flipY: !style.imageEdits?.flipY },
                      event.currentTarget.ownerDocument,
                    )
                  }
                >
                  Flip vertical
                </button>
                <button
                  type="button"
                  onClick={(event) =>
                    void adapter.resetImageEdits(
                      event.currentTarget.ownerDocument,
                    )
                  }
                >
                  Reset photo
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {!isMultiple &&
        (kind === "shape" || kind === "drawing" || kind === "note") && (
          <>
            <div className="gratitude-toolbar__anchor">
              <button
                type="button"
                className="gratitude-toolbar__labeled-color"
                aria-expanded={panel === "color"}
                onClick={() => togglePanel("color")}
              >
                <span
                  style={{
                    backgroundColor:
                      kind === "drawing"
                        ? style.strokeColor
                        : style.backgroundColor,
                  }}
                />
                {kind === "drawing"
                  ? "Ink"
                  : kind === "note"
                  ? "Paper"
                  : "Color"}
              </button>
              {panel === "color" && (
                <div className="gratitude-toolbar__popover">
                  <strong>
                    {kind === "drawing"
                      ? "Ink"
                      : kind === "note"
                      ? "Paper"
                      : "Fill color"}
                  </strong>
                  <Swatches
                    label="Color"
                    value={
                      (kind === "drawing"
                        ? style.strokeColor
                        : style.backgroundColor) || FILL_COLORS[0]
                    }
                    colors={kind === "drawing" ? INK_COLORS : FILL_COLORS}
                    onChange={(color) =>
                      adapter.updateSelection(
                        kind === "drawing"
                          ? { strokeColor: color }
                          : { backgroundColor: color },
                      )
                    }
                  />
                </div>
              )}
            </div>
            {(kind === "shape" || kind === "drawing") && (
              <select
                className="gratitude-toolbar__select"
                aria-label="Line width"
                value={style.strokeWidth}
                onChange={(event) =>
                  adapter.updateSelection({
                    strokeWidth: Number(event.currentTarget.value),
                  })
                }
              >
                {[1, 2, 4, 8].map((width) => (
                  <option key={width} value={width}>
                    {width}px line
                  </option>
                ))}
              </select>
            )}
            {kind === "shape" && style.rounded !== undefined && (
              <button
                type="button"
                className={style.rounded ? "is-active" : ""}
                aria-pressed={style.rounded}
                onClick={() =>
                  adapter.updateSelection({ rounded: !style.rounded })
                }
              >
                Rounded
              </button>
            )}
          </>
        )}

      <Divider />
      <div className="gratitude-toolbar__anchor">
        <button
          type="button"
          className="gratitude-toolbar__icon-label"
          aria-expanded={panel === "position"}
          onClick={() => togglePanel("position")}
        >
          <Icon name="layers" />
          Position
        </button>
        {panel === "position" && (
          <div className="gratitude-toolbar__popover gratitude-toolbar__popover--compact">
            <strong>Position</strong>
            <button
              type="button"
              onClick={() => adapter.arrangeSelection("front")}
            >
              Bring to front
            </button>
            <button
              type="button"
              onClick={() => adapter.arrangeSelection("back")}
            >
              Send to back
            </button>
          </div>
        )}
      </div>
      {!isMultiple && typeof style.opacity === "number" && (
        <div className="gratitude-toolbar__anchor">
          <button
            type="button"
            aria-expanded={panel === "opacity"}
            onClick={() => togglePanel("opacity")}
          >
            Opacity
          </button>
          {panel === "opacity" && (
            <div className="gratitude-toolbar__popover">
              <strong>Opacity</strong>
              <Range
                label="Opacity"
                value={style.opacity}
                min={10}
                max={100}
                step={5}
                suffix="%"
                onChange={(opacity) => adapter.updateSelection({ opacity })}
              />
            </div>
          )}
        </div>
      )}
      <button
        type="button"
        className="gratitude-toolbar__icon"
        aria-label="Duplicate"
        title="Duplicate"
        onClick={() => adapter.duplicateSelection()}
      >
        <Icon name="copy" />
      </button>
      <button
        type="button"
        className="gratitude-toolbar__icon gratitude-toolbar__danger"
        aria-label="Delete"
        title="Delete"
        onClick={() => adapter.delete(selection.ids)}
      >
        <Icon name="trash" />
      </button>
    </div>
  );
};
