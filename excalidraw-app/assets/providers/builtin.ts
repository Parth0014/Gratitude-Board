import type { AssetProvider, GratitudeAsset } from "../contracts";

const shapes = [
  {
    name: "heart",
    title: "Heart",
    tags: ["love", "relationship"],
    path: "M12 21 3.5 12.5a5.5 5.5 0 0 1 7.8-7.8L12 5.4l.7-.7a5.5 5.5 0 0 1 7.8 7.8Z",
  },
  {
    name: "star",
    title: "Star",
    tags: ["dream", "goal"],
    path: "m12 2 3 6.5 7 1-5 4.9 1.2 7.1L12 17.2l-6.2 3.3L7 13.4 2 9.5l7-1Z",
  },
  {
    name: "sparkle",
    title: "Sparkle",
    tags: ["hope", "joy"],
    path: "m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z",
  },
  {
    name: "sun",
    title: "Sun",
    tags: ["nature", "energy"],
    path: "M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM12 1v3m0 16v3M1 12h3m16 0h3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M19.8 4.2l-2.1 2.1M6.3 17.7l-2.1 2.1",
  },
];

const assets: GratitudeAsset[] = shapes.map((shape) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="#5b4b55" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${shape.path}"/></svg>`;
  const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  return {
    id: `gratitude:${shape.name}`,
    provider: "builtin",
    type: "sticker",
    title: shape.title,
    tags: shape.tags,
    previewUrl: dataUrl,
    assetUrl: dataUrl,
    mimeType: "image/svg+xml",
    width: 256,
    height: 256,
    license: {
      tier: "A",
      id: "gratitude-original",
      label: "Gratitude original",
      attributionRequired: false,
    },
    editable: { colors: false },
  };
});

export const builtinProvider: AssetProvider = {
  id: "builtin",
  capabilities: { search: true, categories: true, pagination: false },
  async search(query) {
    const term = query.search?.trim().toLowerCase();
    return {
      items: assets.filter(
        (asset) =>
          (!query.type || asset.type === query.type) &&
          (!term ||
            `${asset.title} ${asset.tags.join(" ")}`
              .toLowerCase()
              .includes(term)),
      ),
    };
  },
  async resolve(id) {
    const asset = assets.find((item) => item.id === id);
    if (!asset) {
      throw new Error(`Unknown built-in asset: ${id}`);
    }
    return asset;
  },
  async fetchAsset(asset, ownerWindow) {
    if (!assets.some((item) => item.id === asset.id)) {
      throw new Error("Unknown built-in asset");
    }
    const response = await ownerWindow.fetch(asset.assetUrl);
    return response.blob();
  },
};
