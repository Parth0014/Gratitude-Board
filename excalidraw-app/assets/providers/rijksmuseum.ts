import type { AssetProvider, GratitudeAsset } from "../contracts";
type RijksItem = {
  id?: unknown;
  title?: unknown;
  image?: unknown;
  creator?: unknown;
};
const safeHttps = (value: unknown): value is string =>
  typeof value === "string" && /^https:\/\/[^\s]+$/i.test(value);
const normalize = (item: RijksItem): GratitudeAsset | null => {
  if (!safeHttps(item.id) || !safeHttps(item.image)) {
    return null;
  }
  return {
    id: `rijksmuseum:${item.id.split("/").pop()}`,
    provider: "rijksmuseum",
    externalId: item.id,
    type: "photo",
    title: typeof item.title === "string" ? item.title : "Rijksmuseum artwork",
    tags: [],
    previewUrl: item.image,
    assetUrl: item.image,
    license: {
      tier: "C",
      id: "rijksmuseum-open-data",
      label: "Rijksmuseum Open Data",
      attributionRequired: true,
      author: typeof item.creator === "string" ? item.creator : "Rijksmuseum",
      sourceUrl: item.id,
      licenseUrl:
        "https://www.rijksmuseum.nl/en/research/conduct-research/data/policy",
    },
    editable: { crop: true, filters: true },
  };
};
export const rijksmuseumProvider: AssetProvider = {
  id: "rijksmuseum",
  capabilities: { search: true, categories: false, pagination: false },
  async search(query, ownerWindow) {
    const term = query.search?.trim();
    if (!term || (query.type && query.type !== "photo")) {
      return { items: [] };
    }
    const url = new ownerWindow.URL(
      "/api/rijksmuseum",
      ownerWindow.location.href,
    );
    url.searchParams.set("query", term);
    url.searchParams.set("limit", String(query.limit || 8));
    const response = await ownerWindow.fetch(url.href);
    if (!response.ok) {
      throw new Error("Rijksmuseum is temporarily unavailable");
    }
    const body = (await response.json()) as { items?: unknown };
    return {
      items: Array.isArray(body.items)
        ? body.items
            .map((item) => normalize(item as RijksItem))
            .filter((item): item is GratitudeAsset => !!item)
        : [],
    };
  },
  async resolve() {
    throw new Error("Rijksmuseum assets are resolved from saved provenance");
  },
  async fetchAsset(asset, ownerWindow) {
    if (asset.provider !== "rijksmuseum" || !safeHttps(asset.assetUrl)) {
      throw new Error("Invalid Rijksmuseum asset URL");
    }
    const response = await ownerWindow.fetch(asset.assetUrl);
    if (!response.ok) {
      throw new Error(`Rijksmuseum download failed: ${response.status}`);
    }
    return response.blob();
  },
};
