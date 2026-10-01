import React from "react";

import { VISION_TEMPLATES } from "../vision/templates";
import type { VisionTemplate } from "../vision/templates";

export interface TemplatesPanelProps {
  onApplyTemplate: (template: VisionTemplate) => void;
}

/** Schematic preview of a template's layout slots. */
const TemplatePreview = ({ template }: { template: VisionTemplate }) => (
  <svg
    className="templates-panel__preview"
    viewBox="0 0 100 80"
    aria-hidden="true"
  >
    <rect
      x="1"
      y="1"
      width="98"
      height="78"
      rx="6"
      fill={template.backgroundColor}
      stroke="var(--line)"
      strokeWidth="1.5"
    />
    {template.layout.slots.map((slot) => (
      <rect
        key={slot.id}
        x={2 + slot.x * 96}
        y={4 + slot.y * 72}
        width={Math.max(2, slot.width * 96)}
        height={Math.max(2, slot.height * 72)}
        rx="3"
        fill={template.accent}
        opacity="0.28"
        stroke={template.accent}
        strokeWidth="1"
      />
    ))}
  </svg>
);

/**
 * Module 3 templates panel. Applying a template re-themes the board and
 * lays out fresh slots through the engine; existing content is kept.
 */
export const TemplatesPanel = ({ onApplyTemplate }: TemplatesPanelProps) => (
  <div className="templates-panel">
    <p className="templates-panel__intro">
      Start from a guided layout. Applying a template re-themes your board and
      adds fresh slots — your existing pieces stay put.
    </p>
    <ul className="templates-panel__list">
      {VISION_TEMPLATES.map((template) => (
        <li key={template.id} className="templates-panel__card">
          <TemplatePreview template={template} />
          <div className="templates-panel__meta">
            <h3>{template.title}</h3>
            <p className="templates-panel__desc">{template.description}</p>
            <p className="templates-panel__prompt">“{template.prompt}”</p>
            <button
              type="button"
              className="templates-panel__apply"
              onClick={() => onApplyTemplate(template)}
            >
              Use this template
            </button>
          </div>
        </li>
      ))}
    </ul>
  </div>
);
