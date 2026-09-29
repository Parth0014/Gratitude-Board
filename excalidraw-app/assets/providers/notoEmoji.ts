import type { AssetProvider, GratitudeAsset } from "../contracts";

const emoji = [
  ["2764", "Heart", ["love", "relationship", "gratitude"]],
  ["2728", "Sparkles", ["dream", "magic", "joy"]],
  ["1f31f", "Glowing star", ["goal", "dream", "success"]],
  ["1f3e0", "Dream home", ["home", "family", "future"]],
  ["1f680", "Rocket", ["career", "launch", "ambition"]],
  ["1f33f", "Growing herb", ["growth", "health", "nature"]],
  ["1f3c6", "Trophy", ["success", "achievement", "goal"]],
  ["1f305", "Sunrise", ["travel", "hope", "nature"]],
] as const;

const assets = emoji.map(([code, title, tags]): GratitudeAsset => {
  const url = `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u${code}.svg`;
  return {
    id: `noto:${code}`,
    provider: "noto-emoji",
    externalId: code,
    type: "sticker",
    title,
    tags: [...tags, "emoji"],
    previewUrl: url,
    assetUrl: url,
    mimeType: "image/svg+xml",
    width: 128,
    height: 128,
    license: {
      tier: "A",
      id: "Apache-2.0",
      label: "Noto Emoji images (Apache 2.0)",
      attributionRequired: false,
      author: "Google",
      sourceUrl: "https://github.com/googlefonts/noto-emoji",
      licenseUrl: "https://github.com/googlefonts/noto-emoji/blob/main/LICENSE",
    },
    editable: { colors: false },
  };
});

export const notoEmojiProvider: AssetProvider = {
  id: "noto-emoji",
  capabilities: { search: true, categories: true, pagination: false },
  async search(query) {
    const term = query.search?.trim().toLowerCase();
    if (query.type && query.type !== "sticker") {
      return { items: [] };
    }
    return {
      items: assets.filter(
        (asset) =>
          !term ||
          `${asset.title} ${asset.tags.join(" ")}`.toLowerCase().includes(term),
      ),
    };
  },
  async resolve(id) {
    const asset = assets.find((item) => item.id === id);
    if (!asset) {
      throw new Error(`Unknown Noto Emoji: ${id}`);
    }
    return asset;
  },
  async fetchAsset(asset, ownerWindow) {
    if (!assets.some(({ id }) => id === asset.id)) {
      throw new Error("Unknown Noto Emoji");
    }
    const response = await ownerWindow.fetch(asset.assetUrl);
    if (!response.ok) {
      throw new Error(`Emoji download failed: ${response.status}`);
    }
    return response.blob();
  },
};
