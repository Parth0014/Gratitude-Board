/** Studio shell types for Module 1 (engine mounting + shell). */

export type StudioTab =
  | "templates"
  | "elements"
  | "text"
  | "photos"
  | "uploads"
  | "background";

export const STUDIO_TABS: readonly StudioTab[] = [
  "templates",
  "elements",
  "text",
  "photos",
  "uploads",
  "background",
];

/** Which build module delivers each tab's real panel. */
export const STUDIO_TAB_MODULE: Record<StudioTab, number> = {
  templates: 3,
  elements: 4,
  text: 4,
  photos: 4,
  uploads: 4,
  background: 4,
};

export const STUDIO_TAB_LABELS: Record<StudioTab, string> = {
  templates: "Templates",
  elements: "Elements",
  text: "Text",
  photos: "Photos",
  uploads: "Uploads",
  background: "Background",
};
