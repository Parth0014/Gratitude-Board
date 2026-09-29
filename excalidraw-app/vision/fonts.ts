import { FONT_FAMILY, FONT_METADATA } from "@excalidraw/common";
import { Fonts } from "@excalidraw/excalidraw/fonts/Fonts";

import type { FontMetadata } from "@excalidraw/common";
import type { ExcalidrawFontFaceDescriptor } from "@excalidraw/excalidraw/fonts/Fonts";

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

const remote: Array<Omit<VisionFontDefinition, "source">> = [
  ["playfair-display", "Playfair Display", "editorial", 100],
  ["dm-serif-display", "DM Serif Display", "editorial", 101],
  ["cormorant-garamond", "Cormorant Garamond", "editorial", 102],
  ["libre-baskerville", "Libre Baskerville", "editorial", 103],
  ["inter", "Inter", "minimal", 104],
  ["poppins", "Poppins", "minimal", 105],
  ["montserrat", "Montserrat", "minimal", 106],
  ["raleway", "Raleway", "minimal", 107],
  ["caveat", "Caveat", "handwritten", 108],
  ["dancing-script", "Dancing Script", "handwritten", 109],
  ["patrick-hand", "Patrick Hand", "handwritten", 110],
  ["kalam", "Kalam", "handwritten", 111],
  ["fredoka", "Fredoka", "playful", 112],
  ["pacifico", "Pacifico", "playful", 113],
].map(([id, family, category, value]) => ({
  id: id as VisionFontFamily,
  family: family as string,
  category: category as VisionFontDefinition["category"],
  value: value as number,
  slug: id as string,
  license: "OFL-1.1" as const,
  licenseUrl: "https://openfontlicense.org/",
}));

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
  ...remote.map((font) => ({ ...font, source: "fontsource" as const })),
];

let registered = false;
export const registerVisionFonts = () => {
  if (registered) {
    return;
  }
  registered = true;
  const familyMap = FONT_FAMILY as unknown as Record<string, number>;
  const metadataMap = FONT_METADATA as Record<number, FontMetadata>;
  const registrar = Fonts as unknown as {
    register(
      family: string,
      metadata: FontMetadata,
      ...faces: ExcalidrawFontFaceDescriptor[]
    ): unknown;
  };
  remote.forEach((font) => {
    familyMap[font.family] = font.value;
    const metadata: FontMetadata = {
      metrics: {
        unitsPerEm: 1000,
        ascender: 950,
        descender: -250,
        lineHeight: 1.25,
      },
    };
    metadataMap[font.value] = metadata;
    registrar.register(font.family, metadata, {
      uri: `https://cdn.jsdelivr.net/fontsource/fonts/${font.slug}@latest/latin-400-normal.woff2`,
      descriptors: { weight: "400", style: "normal" },
    });
  });
};
