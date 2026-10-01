import React from "react";

import { VISION_FONTS } from "../vision/fonts";

import { CropIcon, DuplicateIcon, LayersIcon, TrashIcon } from "./icons";

import type {
  CanvasAdapter,
  VisionFontFamily,
  VisionImageEdits,
  VisionImageFilter,
  VisionImageFrame,
  VisionSelection,
} from "../vision/contracts";

type PillPanel = "color" | "adjust" | "photo" | "position" | "opacity" | null;

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

const FILTERS: VisionImageFilter[] = [
  "original",
  "warm",
  "film",
  "soft",
  "mono",
  "dreamy",
  "vintage",
];

const FRAMES: VisionImageFrame[] = [
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
];

const KIND_LABELS = {
  text: "Text",
  note: "Note",
  image: "Photo",
  drawing: "Drawing",
  shape: "Shape",
  item: "Item",
  none: "Item",
  multiple: "Items",
} as const;

const capitalize = (value: string) =>
  value ? value[0].toUpperCase() + value.slice(1) : value;

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
  <div className="selection-pill__swatches" role="group" aria-label={label}>
    {colors.map((color) => (
      <button
        key={color}
        type="button"
        className={`selection-pill__swatch${
          value.toLowerCase() === color.toLowerCase() ? " is-active" : ""
        }`}
        style={{ backgroundColor: color }}
        aria-label={`${label} ${color}`}
        aria-pressed={value.toLowerCase() === color.toLowerCase()}
        onClick={() => onChange(color)}
      />
    ))}
    <label className="selection-pill__custom-color" title={`Custom ${label}`}>
      <input
        type="color"
        aria-label={`Custom ${label}`}
        value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#b4325a"}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      <span aria-hidden="true">+</span>
    </label>
  </div>
);

const Slider = ({
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
  <label className="selection-pill__slider">
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

export const SelectionPill = ({
  adapter,
  selection,
}: {
  adapter: CanvasAdapter;
  selection: VisionSelection;
}) => {
  const [panel, setPanel] = React.useState<PillPanel>(null);
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

  if (selection.count === 0) {
    return null;
  }

  const { kind, style } = selection;
  const isMultiple = selection.count > 1;
  const title = isMultiple
    ? `${selection.count} items`
    : KIND_LABELS[kind];
  const togglePanel = (next: Exclude<PillPanel, null>) =>
    setPanel((current) => (current === next ? null : next));
  const ownerDocumentOf = (target: HTMLElement) => target.ownerDocument;
  const updateImage = (patch: Partial<VisionImageEdits>, target: HTMLElement) =>
    void adapter.updateImageEdits(patch, ownerDocumentOf(target));

  return (
    <div
      className="selection-pill"
      ref={rootRef}
      role="toolbar"
      aria-label="Selection options"
    >
      <span className="selection-pill__label">{title}</span>
      <span className="selection-pill__divider" aria-hidden="true" />

      {!isMultiple && kind === "text" && (
        <>
          <select
            className="selection-pill__select"
            aria-label="Font"
            value={style.fontFamily ?? ""}
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
                  label={capitalize(category)}
                >
                  {VISION_FONTS.filter(
                    (font) => font.category === category,
                  ).map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.family}
                    </option>
                  ))}
                </optgroup>
              ),
            )}
          </select>
          <input
            className="selection-pill__number"
            aria-label="Font size"
            type="number"
            min={8}
            max={200}
            value={style.fontSize ?? 16}
            onChange={(event) =>
              adapter.updateSelection({
                fontSize: Math.max(
                  8,
                  Math.min(200, Number(event.currentTarget.value) || 8),
                ),
              })
            }
          />
          <div className="selection-pill__anchor">
            <button
              type="button"
              className="selection-pill__color-dot"
              aria-label="Text color"
              aria-expanded={panel === "color"}
              style={{ backgroundColor: style.strokeColor || INK_COLORS[0] }}
              onClick={() => togglePanel("color")}
            />
            {panel === "color" && (
              <div className="selection-pill__popover" role="dialog" aria-label="Text color">
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
            className="selection-pill__segmented"
            role="group"
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
                {align === "left" ? "≡" : align === "center" ? "☰" : "≣"}
              </button>
            ))}
          </div>
        </>
      )}

      {!isMultiple && kind === "image" && (
        <>
          <button
            type="button"
            className="selection-pill__btn"
            onClick={() => adapter.startImageCrop()}
          >
            <CropIcon />
            <span>Crop</span>
          </button>
          <div
            className="selection-pill__segmented"
            role="group"
            aria-label="Photo fit"
          >
            {(["fit", "fill"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-label={`Photo ${mode}`}
                onClick={() => adapter.setImageFit(mode)}
              >
                {capitalize(mode)}
              </button>
            ))}
          </div>
          <select
            className="selection-pill__select"
            aria-label="Photo filter"
            value={style.imageEdits?.filter || "original"}
            onChange={(event) =>
              updateImage(
                {
                  filter: event.currentTarget.value as VisionImageFilter,
                },
                event.currentTarget,
              )
            }
          >
            {FILTERS.map((filter) => (
              <option key={filter} value={filter}>
                {filter === "original" ? "No filter" : capitalize(filter)}
              </option>
            ))}
          </select>
          <div className="selection-pill__anchor">
            <button
              type="button"
              className="selection-pill__btn"
              aria-expanded={panel === "adjust"}
              onClick={() => togglePanel("adjust")}
            >
              Adjust
            </button>
            {panel === "adjust" && (
              <div
                className="selection-pill__popover selection-pill__popover--wide"
                role="dialog"
                aria-label="Adjust photo"
              >
                <strong>Adjust photo</strong>
                {(["brightness", "contrast", "saturation"] as const).map(
                  (key) => (
                    <Slider
                      key={key}
                      label={capitalize(key)}
                      value={style.imageEdits?.[key] ?? 100}
                      min={50}
                      max={150}
                      step={5}
                      suffix="%"
                      onChange={(value) =>
                        rootRef.current &&
                        void adapter.updateImageEdits(
                          { [key]: value },
                          rootRef.current.ownerDocument,
                        )
                      }
                    />
                  ),
                )}
                {(["exposure", "highlights", "shadows", "warmth"] as const).map(
                  (key) => (
                    <Slider
                      key={key}
                      label={capitalize(key)}
                      value={style.imageEdits?.[key] ?? 0}
                      min={-100}
                      max={100}
                      step={5}
                      onChange={(value) =>
                        rootRef.current &&
                        void adapter.updateImageEdits(
                          { [key]: value },
                          rootRef.current.ownerDocument,
                        )
                      }
                    />
                  ),
                )}
                <Slider
                  label="Fade"
                  value={style.imageEdits?.fade ?? 0}
                  min={0}
                  max={100}
                  step={5}
                  suffix="%"
                  onChange={(value) =>
                    rootRef.current &&
                    void adapter.updateImageEdits(
                      { fade: value },
                      rootRef.current.ownerDocument,
                    )
                  }
                />
                <Slider
                  label="Blur"
                  value={style.imageEdits?.blur ?? 0}
                  min={0}
                  max={12}
                  suffix="px"
                  onChange={(value) =>
                    rootRef.current &&
                    void adapter.updateImageEdits(
                      { blur: value },
                      rootRef.current.ownerDocument,
                    )
                  }
                />
              </div>
            )}
          </div>
          <div className="selection-pill__anchor">
            <button
              type="button"
              className="selection-pill__btn"
              aria-expanded={panel === "photo"}
              onClick={() => togglePanel("photo")}
            >
              Photo
            </button>
            {panel === "photo" && (
              <div
                className="selection-pill__popover"
                role="dialog"
                aria-label="Photo tools"
              >
                <strong>Photo tools</strong>
                <label className="selection-pill__field">
                  <span>Frame</span>
                  <select
                    aria-label="Photo frame"
                    value={style.imageEdits?.frame || "none"}
                    onChange={(event) =>
                      updateImage(
                        {
                          frame: event.currentTarget
                            .value as VisionImageFrame,
                        },
                        event.currentTarget,
                      )
                    }
                  >
                    {FRAMES.map((frame) => (
                      <option key={frame} value={frame}>
                        {capitalize(frame)}
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
                      event.currentTarget,
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
                      event.currentTarget,
                    )
                  }
                >
                  Flip vertical
                </button>
                <button
                  type="button"
                  onClick={(event) =>
                    void adapter.resetImageEdits(
                      ownerDocumentOf(event.currentTarget),
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
            <div className="selection-pill__anchor">
              <button
                type="button"
                className="selection-pill__btn"
                aria-expanded={panel === "color"}
                onClick={() => togglePanel("color")}
              >
                <span
                  className="selection-pill__color-dot"
                  style={{
                    backgroundColor:
                      kind === "drawing"
                        ? style.strokeColor
                        : style.backgroundColor,
                  }}
                />
                <span>
                  {kind === "drawing"
                    ? "Ink"
                    : kind === "note"
                      ? "Paper"
                      : "Color"}
                </span>
              </button>
              {panel === "color" && (
                <div
                  className="selection-pill__popover"
                  role="dialog"
                  aria-label="Color"
                >
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
                className="selection-pill__select"
                aria-label="Line width"
                value={style.strokeWidth ?? 2}
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
                className={`selection-pill__btn${
                  style.rounded ? " is-active" : ""
                }`}
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

      <span className="selection-pill__divider" aria-hidden="true" />
      <div className="selection-pill__anchor">
        <button
          type="button"
          className="selection-pill__icon-btn"
          aria-label="Arrange"
          aria-expanded={panel === "position"}
          title="Arrange"
          onClick={() => togglePanel("position")}
        >
          <LayersIcon />
        </button>
        {panel === "position" && (
          <div
            className="selection-pill__popover selection-pill__popover--compact"
            role="dialog"
            aria-label="Position"
          >
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
        <div className="selection-pill__anchor">
          <button
            type="button"
            className="selection-pill__btn"
            aria-expanded={panel === "opacity"}
            onClick={() => togglePanel("opacity")}
          >
            Opacity
          </button>
          {panel === "opacity" && (
            <div
              className="selection-pill__popover"
              role="dialog"
              aria-label="Opacity"
            >
              <strong>Opacity</strong>
              <Slider
                label="Opacity"
                value={style.opacity ?? 100}
                min={10}
                max={100}
                step={5}
                suffix="%"
                onChange={(opacity) =>
                  adapter.updateSelection({ opacity })
                }
              />
            </div>
          )}
        </div>
      )}
      <button
        type="button"
        className="selection-pill__icon-btn"
        aria-label="Duplicate"
        title="Duplicate"
        onClick={() => adapter.duplicateSelection()}
      >
        <DuplicateIcon />
      </button>
      <button
        type="button"
        className="selection-pill__icon-btn selection-pill__icon-btn--danger"
        aria-label="Delete"
        title="Delete"
        onClick={() => adapter.delete(selection.ids)}
      >
        <TrashIcon />
      </button>
    </div>
  );
};
