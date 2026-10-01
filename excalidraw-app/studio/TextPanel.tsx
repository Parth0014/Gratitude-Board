import { VISION_TEXT_PRESETS } from "../vision/typography";
import type { VisionTextPreset } from "../vision/contracts";

export interface TextPanelProps {
  onInsertText: (preset: VisionTextPreset) => void;
}

/**
 * Module 4 text panel: the six typographic presets. Clicking one drops the
 * text at the board center via the engine's createTextPreset.
 */
export const TextPanel = ({ onInsertText }: TextPanelProps) => (
  <div className="text-panel">
    <p className="text-panel__intro">
      Pick a style to drop text onto your board — then edit the words right on
      the canvas.
    </p>
    <ul className="text-panel__list">
      {VISION_TEXT_PRESETS.map((preset) => (
        <li key={preset.id}>
          <button
            type="button"
            className="text-panel__item"
            onClick={() => onInsertText(preset)}
            title={`Add ${preset.label}`}
          >
            <span className="text-panel__label">{preset.label}</span>
            <span
              className="text-panel__sample"
              style={{ color: preset.color }}
              data-font={preset.fontFamily}
            >
              {preset.sample}
            </span>
          </button>
        </li>
      ))}
    </ul>
  </div>
);
