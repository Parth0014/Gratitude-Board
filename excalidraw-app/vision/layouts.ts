export interface VisionLayoutSlot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  frame?: "none" | "rounded" | "circle" | "polaroid";
}

export interface VisionLayout {
  id: string;
  title: string;
  description: string;
  slots: VisionLayoutSlot[];
}

const slot = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  frame: VisionLayoutSlot["frame"] = "rounded",
  rotation = 0,
): VisionLayoutSlot => ({ id, x, y, width, height, frame, rotation });

export const VISION_LAYOUTS: VisionLayout[] = [
  {
    id: "hero-four",
    title: "Hero + four",
    description: "One defining image with four supporting moments",
    slots: [
      slot("hero", 0.05, 0.06, 0.56, 0.56),
      slot("a", 0.65, 0.06, 0.3, 0.26),
      slot("b", 0.65, 0.36, 0.3, 0.26),
      slot("c", 0.05, 0.67, 0.43, 0.27),
      slot("d", 0.52, 0.67, 0.43, 0.27),
    ],
  },
  {
    id: "editorial",
    title: "Editorial story",
    description: "Magazine inspired rhythm",
    slots: [
      slot("a", 0.06, 0.08, 0.38, 0.52, "none", -2),
      slot("b", 0.49, 0.08, 0.45, 0.26),
      slot("c", 0.49, 0.39, 0.45, 0.5, "polaroid", 2),
    ],
  },
  {
    id: "nine-grid",
    title: "Nine moments",
    description: "A balanced memory grid",
    slots: Array.from({ length: 9 }, (_, index) =>
      slot(
        String(index),
        0.05 + (index % 3) * 0.31,
        0.05 + Math.floor(index / 3) * 0.31,
        0.28,
        0.28,
      ),
    ),
  },
  {
    id: "three-columns",
    title: "Three paths",
    description: "Three equal aspirations",
    slots: [
      slot("a", 0.05, 0.1, 0.28, 0.8),
      slot("b", 0.36, 0.1, 0.28, 0.8),
      slot("c", 0.67, 0.1, 0.28, 0.8),
    ],
  },
  {
    id: "center-focus",
    title: "Center focus",
    description: "A central dream surrounded by details",
    slots: [
      slot("center", 0.28, 0.22, 0.44, 0.56, "circle"),
      slot("a", 0.05, 0.08, 0.2, 0.3),
      slot("b", 0.75, 0.08, 0.2, 0.3),
      slot("c", 0.05, 0.62, 0.2, 0.3),
      slot("d", 0.75, 0.62, 0.2, 0.3),
    ],
  },
  {
    id: "postcards",
    title: "Postcards",
    description: "A playful travel wall",
    slots: [
      slot("a", 0.06, 0.08, 0.4, 0.36, "polaroid", -4),
      slot("b", 0.53, 0.07, 0.4, 0.36, "polaroid", 3),
      slot("c", 0.09, 0.53, 0.4, 0.36, "polaroid", 3),
      slot("d", 0.54, 0.53, 0.38, 0.36, "polaroid", -3),
    ],
  },
  {
    id: "horizon",
    title: "Horizon",
    description: "Wide scenes and small details",
    slots: [
      slot("hero", 0.05, 0.06, 0.9, 0.5),
      slot("a", 0.05, 0.62, 0.28, 0.3),
      slot("b", 0.36, 0.62, 0.28, 0.3),
      slot("c", 0.67, 0.62, 0.28, 0.3),
    ],
  },
  {
    id: "journal",
    title: "Journal page",
    description: "Asymmetric scrapbook composition",
    slots: [
      slot("a", 0.06, 0.07, 0.5, 0.42, "polaroid", -2),
      slot("b", 0.61, 0.1, 0.32, 0.32, "circle"),
      slot("c", 0.1, 0.57, 0.3, 0.32, "rounded", 3),
      slot("d", 0.46, 0.51, 0.47, 0.41, "none", -1),
    ],
  },
  {
    id: "diptych",
    title: "Then and next",
    description: "Two strong side by side images",
    slots: [slot("a", 0.06, 0.1, 0.41, 0.8), slot("b", 0.53, 0.1, 0.41, 0.8)],
  },
  {
    id: "cascade",
    title: "Dream cascade",
    description: "Overlapping inspiration cards",
    slots: [
      slot("a", 0.08, 0.08, 0.42, 0.45, "polaroid", -5),
      slot("b", 0.47, 0.12, 0.42, 0.45, "polaroid", 5),
      slot("c", 0.27, 0.48, 0.46, 0.44, "polaroid", -1),
    ],
  },
];
