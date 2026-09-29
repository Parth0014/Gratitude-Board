export interface GratitudeAsset {
  id: string;
  provider: string;
  externalId?: string;
  type:
    | "photo"
    | "illustration"
    | "sticker"
    | "shape"
    | "pattern"
    | "texture"
    | "font"
    | "audio";
  title: string;
  tags: string[];
  previewUrl: string;
  assetUrl: string;
  mimeType?: string;
  width?: number;
  height?: number;
  license: {
    tier: "A" | "B" | "C" | "D" | "E";
    id: string;
    label: string;
    attributionRequired: boolean;
    shareAlike?: boolean;
    author?: string;
    sourceUrl?: string;
    licenseUrl?: string;
  };
  editable: {
    colors?: boolean;
    stroke?: boolean;
    crop?: boolean;
    filters?: boolean;
  };
}

export const GRATITUDE_ASSET_DRAG_TYPE = "application/x-gratitude-asset";

export const normalizeGratitudeAsset = (
  value: unknown,
): GratitudeAsset | null => {
  if (
    typeof value !== "object" ||
    value === null ||
    typeof (value as GratitudeAsset).id !== "string" ||
    typeof (value as GratitudeAsset).title !== "string" ||
    typeof (value as GratitudeAsset).provider !== "string" ||
    typeof (value as GratitudeAsset).previewUrl !== "string" ||
    typeof (value as GratitudeAsset).assetUrl !== "string" ||
    !Array.isArray((value as GratitudeAsset).tags) ||
    typeof (value as GratitudeAsset).license?.label !== "string" ||
    typeof (value as GratitudeAsset).license?.attributionRequired !== "boolean"
  ) {
    return null;
  }
  const asset = value as GratitudeAsset;
  const tier = asset.license.tier;
  return {
    ...asset,
    license: {
      ...asset.license,
      tier: ["A", "B", "C", "D", "E"].includes(tier)
        ? tier
        : asset.license.attributionRequired
        ? "C"
        : "A",
    },
  };
};

export const isGratitudeAsset = (value: unknown): value is GratitudeAsset =>
  normalizeGratitudeAsset(value) !== null;

export interface AssetQuery {
  search?: string;
  type?: GratitudeAsset["type"];
  cursor?: string;
  limit?: number;
}

export interface AssetPage {
  items: GratitudeAsset[];
  nextCursor?: string;
}

export interface AssetProviderFailure {
  provider: string;
  message: string;
}

export interface AssetSearchResult extends AssetPage {
  failures: AssetProviderFailure[];
}

export interface AssetProvider {
  id: string;
  capabilities: { search: boolean; categories: boolean; pagination: boolean };
  search(
    query: AssetQuery,
    ownerWindow: Window & typeof globalThis,
  ): Promise<AssetPage>;
  resolve(
    assetId: string,
    ownerWindow: Window & typeof globalThis,
  ): Promise<GratitudeAsset>;
  fetchAsset(
    asset: GratitudeAsset,
    ownerWindow: Window & typeof globalThis,
  ): Promise<Blob>;
}
