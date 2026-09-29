import type { AssetProvider, GratitudeAsset } from "../contracts";

type CreativeAsset = {
  id: string;
  type: GratitudeAsset["type"];
  title: string;
  tags: string[];
  svg: string;
  colors?: boolean;
};

const wrap = (body: string, viewBox = "0 0 256 256") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="256" height="256">${body}</svg>`;

const catalog: CreativeAsset[] = [
  {
    id: "polaroid",
    type: "shape",
    title: "Polaroid frame",
    tags: ["frame", "photo", "scrapbook"],
    svg: wrap(
      '<rect x="28" y="16" width="200" height="224" rx="5" fill="#fffdf8" stroke="#d9cad0" stroke-width="5"/><rect x="48" y="38" width="160" height="146" rx="2" fill="#f1e8ec"/><path d="M64 166l42-48 28 29 24-27 34 46" fill="none" stroke="#c08aa0" stroke-width="8" stroke-linecap="round"/>',
    ),
  },
  {
    id: "arch-frame",
    type: "shape",
    title: "Soft arch",
    tags: ["frame", "arch", "window"],
    svg: wrap(
      '<path d="M38 232V112a90 90 0 0 1 180 0v120Z" fill="#f8e4e9" stroke="#bf6b88" stroke-width="6"/><path d="M62 218V113a66 66 0 0 1 132 0v105Z" fill="#fff"/>',
    ),
    colors: true,
  },
  {
    id: "blob-frame",
    type: "shape",
    title: "Organic blob",
    tags: ["frame", "blob", "organic"],
    svg: wrap(
      '<path d="M218 132c0 55-38 101-92 101S30 196 31 137 58 26 123 24s95 53 95 108Z" fill="#eadff5" stroke="#8c75c6" stroke-width="6"/>',
    ),
    colors: true,
  },
  {
    id: "pink-tape",
    type: "sticker",
    title: "Pink paper tape",
    tags: ["tape", "scrapbook", "paper"],
    svg: wrap(
      '<path d="m24 72 211-25-3 139-207 22Z" fill="#ef9fb5" opacity=".8"/><path d="m31 82 196-23M30 194l195-19" stroke="#fff" stroke-opacity=".42" stroke-width="5" stroke-dasharray="8 9"/>',
    ),
  },
  {
    id: "paper-note",
    type: "sticker",
    title: "Torn paper",
    tags: ["paper", "note", "scrapbook"],
    svg: wrap(
      '<path d="m31 21 19 8 19-8 19 8 20-8 19 8 20-8 19 8 20-8 19 8 20-8v198l-18-8-20 8-19-8-20 8-19-8-20 8-19-8-20 8-19-8Z" fill="#fff8dc" stroke="#d5bd88" stroke-width="3"/>',
    ),
  },
  {
    id: "growth-doodle",
    type: "illustration",
    title: "Growing toward dreams",
    tags: ["growth", "dream", "nature", "doodle"],
    svg: wrap(
      '<path d="M128 226V83M128 120c-28-35-58-31-75-15 23 31 48 34 75 15Zm0 42c28-35 58-31 75-15-23 31-48 34-75 15Z" fill="#d7eadc" stroke="#3f6d56" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="128" cy="55" r="25" fill="#f6c85f"/><path d="M128 18v-9m0 92v-9M91 55h-9m92 0h-9M102 29l-7-7m59 66-7-7m7-52 7-7M95 88l7-7" stroke="#bf8b48" stroke-width="6" stroke-linecap="round"/>',
    ),
  },
  {
    id: "celebrate-person",
    type: "illustration",
    title: "Celebrating person",
    tags: ["people", "celebrate", "joy", "success"],
    svg: wrap(
      '<circle cx="128" cy="55" r="24" fill="#9b644d"/><path d="M95 221c6-50 8-85 33-112 25 27 27 62 33 112" fill="#ef9fb5" stroke="#593f49" stroke-width="6"/><path d="m110 119-48-52m84 52 48-52M62 67 43 43m151 24 19-24" fill="none" stroke="#593f49" stroke-width="8" stroke-linecap="round"/><path d="m42 31 8-18m151 18-8-18M76 42 67 24m113 18 9-18" stroke="#f6c85f" stroke-width="6" stroke-linecap="round"/>',
    ),
  },
  {
    id: "dots-pattern",
    type: "pattern",
    title: "Soft dots",
    tags: ["pattern", "dots", "background"],
    svg: wrap(
      '<defs><pattern id="p" width="42" height="42" patternUnits="userSpaceOnUse"><rect width="42" height="42" fill="#fff9fb"/><circle cx="10" cy="10" r="4" fill="#d98aa4"/><circle cx="31" cy="29" r="3" fill="#8c75c6"/></pattern></defs><rect width="256" height="256" fill="url(#p)"/>',
    ),
    colors: true,
  },
  {
    id: "waves-pattern",
    type: "pattern",
    title: "Calm waves",
    tags: ["pattern", "waves", "calm", "background"],
    svg: wrap(
      '<rect width="256" height="256" fill="#f6edf2"/><g fill="none" stroke="#c67894" stroke-width="5" opacity=".72"><path d="M-20 30q32-25 64 0t64 0 64 0 64 0 64 0"/><path d="M-20 90q32-25 64 0t64 0 64 0 64 0 64 0"/><path d="M-20 150q32-25 64 0t64 0 64 0 64 0 64 0"/><path d="M-20 210q32-25 64 0t64 0 64 0 64 0 64 0"/></g>',
    ),
    colors: true,
  },
];

const assets = catalog.map((item): GratitudeAsset => {
  const dataUrl = `data:image/svg+xml,${encodeURIComponent(item.svg)}`;
  return {
    id: `creative:${item.id}`,
    provider: "creative-builtin",
    type: item.type,
    title: item.title,
    tags: item.tags,
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
    editable: { colors: !!item.colors, stroke: !!item.colors },
  };
});

export const creativeBuiltinProvider: AssetProvider = {
  id: "creative-builtin",
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
      throw new Error(`Unknown creative asset: ${id}`);
    }
    return asset;
  },
  async fetchAsset(asset, ownerWindow) {
    if (!assets.some(({ id }) => id === asset.id)) {
      throw new Error("Unknown creative asset");
    }
    return (await ownerWindow.fetch(asset.assetUrl)).blob();
  },
};
