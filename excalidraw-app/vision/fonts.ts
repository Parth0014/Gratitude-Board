import { FONT_FAMILY } from "@excalidraw/common";

import type { VisionFontFamily } from "./contracts";

export interface VisionFontDefinition {
  id: VisionFontFamily;
  family: string;
  category: "editorial" | "handwritten" | "playful" | "minimal";
  value: number;
  source: "bundled" | "fontsource";
  license: "OFL-1.1" | "system";
  licenseUrl?: string;
  slug?: string;
}

export const VISION_FONTS: VisionFontDefinition[] = [
  {
    id: "nunito",
    family: "Nunito",
    category: "minimal",
    value: FONT_FAMILY.Nunito,
    source: "bundled",
    license: "OFL-1.1",
  },
  {
    id: "lilita-one",
    family: "Lilita One",
    category: "playful",
    value: FONT_FAMILY["Lilita One"],
    source: "bundled",
    license: "OFL-1.1",
  },
  {
    id: "helvetica",
    family: "Helvetica",
    category: "minimal",
    value: FONT_FAMILY.Helvetica,
    source: "bundled",
    license: "system",
  },
  {
    id: "virgil",
    family: "Virgil",
    category: "handwritten",
    value: FONT_FAMILY.Virgil,
    source: "bundled",
    license: "OFL-1.1",
  },
  {
    id: "assistant",
    family: "Assistant",
    category: "minimal",
    value: FONT_FAMILY.Assistant,
    source: "bundled",
    license: "OFL-1.1",
  },
  {
    id: "comic-shanns",
    family: "Comic Shanns",
    category: "handwritten",
    value: FONT_FAMILY["Comic Shanns"],
    source: "bundled",
    license: "OFL-1.1",
  },
];

/** Bundled Excalidraw fonts register themselves during application startup. */
export const registerVisionFonts = () => undefined;
