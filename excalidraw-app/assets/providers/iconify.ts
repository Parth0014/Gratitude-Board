import type { AssetProvider, GratitudeAsset } from "../contracts";

const COLLECTIONS = {
  tabler: {
    label: "Tabler Icons",
    license: "MIT",
    author: "Tabler",
    url: "https://tabler.io/icons",
  },
  ph: {
    label: "Phosphor Icons",
    license: "MIT",
    author: "Phosphor Icons",
    url: "https://phosphoricons.com",
  },
  lucide: {
    label: "Lucide Icons",
    license: "ISC",
    author: "Lucide Contributors",
    url: "https://lucide.dev/icons",
  },
  "material-symbols": {
    label: "Material Symbols",
    license: "Apache-2.0",
    author: "Google",
    url: "https://fonts.google.com/icons",
  },
  bi: {
    label: "Bootstrap Icons",
    license: "MIT",
    author: "Bootstrap",
    url: "https://icons.getbootstrap.com",
  },
} as const;

type Prefix = keyof typeof COLLECTIONS;
const prefixes = Object.keys(COLLECTIONS) as Prefix[];
const iconName = new RegExp(`^(${prefixes.join("|")}):[a-z0-9-]+$`);
const iconUrl = (id: string) => {
  const [prefix, name] = id.split(":");
  return `https://api.iconify.design/${prefix}/${name}.svg?color=%235b4b55`;
};

const normalize = (id: string): GratitudeAsset => {
  if (!iconName.test(id)) {
    throw new Error("Icon is outside the approved collections");
  }
  const [prefix, name] = id.split(":") as [Prefix, string];
  const collection = COLLECTIONS[prefix];
  return {
    id: `iconify:${id}`,
    provider: "iconify",
    externalId: id,
    type: "sticker",
    title: name.replace(/-/g, " "),
    tags: [...name.split("-"), prefix],
    previewUrl: iconUrl(id),
    assetUrl: iconUrl(id),
    mimeType: "image/svg+xml",
    license: {
      tier: "A",
      id: collection.license,
      label: `${collection.label} (${collection.license})`,
      attributionRequired: false,
      author: collection.author,
      sourceUrl: collection.url,
      licenseUrl: collection.url,
    },
    editable: { colors: true, stroke: true },
  };
};

export const iconifyProvider: AssetProvider = {
  id: "iconify",
  capabilities: { search: true, categories: false, pagination: false },
  async search(query, ownerWindow) {
    const term = query.search?.trim();
    if (!term || (query.type && query.type !== "sticker")) {
      return { items: [] };
    }
    const results = await Promise.allSettled(
      prefixes.map(async (prefix) => {
        const url = new ownerWindow.URL("https://api.iconify.design/search");
        url.searchParams.set("query", term.slice(0, 80));
        url.searchParams.set("prefix", prefix);
        url.searchParams.set("limit", String(Math.min(query.limit || 20, 20)));
        const response = await ownerWindow.fetch(url.href);
        if (!response.ok) {
          throw new Error(`Icon search failed: ${response.status}`);
        }
        const body = (await response.json()) as { icons?: unknown };
        return Array.isArray(body.icons)
          ? body.icons
              .filter(
                (id): id is string =>
                  typeof id === "string" &&
                  id.startsWith(`${prefix}:`) &&
                  iconName.test(id),
              )
              .map(normalize)
          : [];
      }),
    );
    if (results.every((result) => result.status === "rejected")) {
      throw new Error("Icon library is temporarily unavailable");
    }
    return {
      items: results
        .flatMap((result) =>
          result.status === "fulfilled" ? result.value : [],
        )
        .slice(0, query.limit || 20),
    };
  },
  async resolve(assetId) {
    return normalize(assetId.replace(/^iconify:/, ""));
  },
  async fetchAsset(asset, ownerWindow) {
    const id = asset.externalId;
    if (!id || !iconName.test(id)) {
      throw new Error("Icon is outside the approved collections");
    }
    const response = await ownerWindow.fetch(iconUrl(id));
    if (!response.ok) {
      throw new Error(`Icon download failed: ${response.status}`);
    }
    return response.blob();
  },
};
