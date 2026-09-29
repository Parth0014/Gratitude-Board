import type { AssetProvider, GratitudeAsset } from "../contracts";

const items = [
  "heart",
  "star",
  "idea",
  "music",
  "laugh",
  "faceHappy",
  "hearts",
  "stars",
];
const assets: GratitudeAsset[] = items.map((name) => {
  const url = `https://raw.githubusercontent.com/ETdoFresh/kenney.nl/master/kenney_emotespack/PNG/Pixel/Style%201/emote_${name}.png`;
  return {
    id: `kenney:${name}`,
    provider: "kenney",
    externalId: name,
    type: "sticker",
    title: `Kenney ${name.replace(/([A-Z])/g, " $1").toLowerCase()}`,
    tags: [name.toLowerCase(), "pixel", "emote", "sticker"],
    previewUrl: url,
    assetUrl: url,
    mimeType: "image/png",
    license: {
      tier: "A",
      id: "cc0-1.0",
      label: "CC0 1.0",
      attributionRequired: false,
      author: "Kenney",
      sourceUrl: "https://kenney.nl/assets/emotes-pack",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    },
    editable: { filters: true },
  };
});
export const kenneyProvider: AssetProvider = {
  id: "kenney",
  capabilities: { search: true, categories: true, pagination: false },
  async search(query) {
    if (query.type && query.type !== "sticker") {
      return { items: [] };
    }
    const term = query.search?.trim().toLowerCase();
    return {
      items: assets
        .filter(
          (asset) =>
            !term ||
            `${asset.title} ${asset.tags.join(" ")}`
              .toLowerCase()
              .includes(term),
        )
        .slice(0, query.limit || 20),
    };
  },
  async resolve(assetId) {
    const asset = assets.find((item) => item.id === assetId);
    if (!asset) {
      throw new Error("Kenney sticker not found");
    }
    return asset;
  },
  async fetchAsset(asset, ownerWindow) {
    const response = await ownerWindow.fetch(asset.assetUrl);
    if (!response.ok) {
      throw new Error(`Kenney download failed: ${response.status}`);
    }
    return response.blob();
  },
};
