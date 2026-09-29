import type { AssetProvider, GratitudeAsset } from "../contracts";

type OpenverseImage = {
  id?: unknown;
  title?: unknown;
  creator?: unknown;
  creator_url?: unknown;
  foreign_landing_url?: unknown;
  url?: unknown;
  thumbnail?: unknown;
  width?: unknown;
  height?: unknown;
  license?: unknown;
  license_url?: unknown;
};

const safeHttps = (value: unknown): value is string =>
  typeof value === "string" && /^https:\/\/[^\s]+$/i.test(value);

const normalize = (image: OpenverseImage): GratitudeAsset | null => {
  if (
    typeof image.id !== "string" ||
    !safeHttps(image.url) ||
    !safeHttps(image.thumbnail) ||
    !safeHttps(image.foreign_landing_url)
  ) {
    return null;
  }
  const license =
    typeof image.license === "string" ? image.license.toLowerCase() : "";
  if (!["cc0", "pdm"].includes(license)) {
    return null;
  }
  return {
    id: `openverse:${image.id}`,
    provider: "openverse",
    externalId: image.id,
    type: "photo",
    title:
      typeof image.title === "string" && image.title.trim()
        ? image.title
        : "Open image",
    tags: [],
    previewUrl: image.thumbnail,
    assetUrl: image.url,
    width: typeof image.width === "number" ? image.width : undefined,
    height: typeof image.height === "number" ? image.height : undefined,
    license: {
      tier: "A",
      id: license,
      label: license === "cc0" ? "CC0 1.0" : "Public Domain Mark",
      attributionRequired: false,
      author: typeof image.creator === "string" ? image.creator : undefined,
      sourceUrl: image.foreign_landing_url,
      licenseUrl: safeHttps(image.license_url) ? image.license_url : undefined,
    },
    editable: { crop: true, filters: true },
  };
};

export const openverseProvider: AssetProvider = {
  id: "openverse",
  capabilities: { search: true, categories: false, pagination: true },
  async search(query, ownerWindow) {
    const term = query.search?.trim();
    if (!term || (query.type && query.type !== "photo")) {
      return { items: [] };
    }
    const url = new ownerWindow.URL(
      "/api/openverse",
      ownerWindow.location.href,
    );
    url.searchParams.set("query", term);
    url.searchParams.set("per_page", String(Math.min(query.limit || 20, 30)));
    const response = await ownerWindow.fetch(url.href);
    if (!response.ok) {
      throw new Error("Openverse is temporarily unavailable");
    }
    const body = (await response.json()) as { results?: unknown };
    return {
      items: Array.isArray(body.results)
        ? body.results
            .map((item) => normalize(item as OpenverseImage))
            .filter((item): item is GratitudeAsset => !!item)
        : [],
    };
  },
  async resolve() {
    throw new Error("Openverse assets are resolved from saved provenance");
  },
  async fetchAsset(asset, ownerWindow) {
    if (asset.provider !== "openverse" || !safeHttps(asset.assetUrl)) {
      throw new Error("Invalid Openverse asset URL");
    }
    const response = await ownerWindow.fetch(asset.assetUrl);
    if (!response.ok) {
      throw new Error(`Open image download failed: ${response.status}`);
    }
    return response.blob();
  },
};
