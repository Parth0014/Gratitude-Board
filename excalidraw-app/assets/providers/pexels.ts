import type { AssetProvider, GratitudeAsset } from "../contracts";

type PexelsPhoto = {
  id?: unknown;
  width?: unknown;
  height?: unknown;
  url?: unknown;
  photographer?: unknown;
  alt?: unknown;
  src?: { medium?: unknown; large2x?: unknown; original?: unknown };
};

const isHttpsUrl = (value: unknown): value is string =>
  typeof value === "string" && /^https:\/\/[^\s]+$/i.test(value);

const normalize = (
  photo: PexelsPhoto,
  ownerWindow: Window & typeof globalThis,
): GratitudeAsset | null => {
  if (
    typeof photo.id !== "number" ||
    !Number.isSafeInteger(photo.id) ||
    !isHttpsUrl(photo.url) ||
    !isHttpsUrl(photo.src?.medium) ||
    !isHttpsUrl(photo.src?.large2x) ||
    !["pexels.com", "www.pexels.com"].includes(
      new ownerWindow.URL(photo.url).hostname,
    ) ||
    new ownerWindow.URL(photo.src.medium).hostname !== "images.pexels.com" ||
    new ownerWindow.URL(photo.src.large2x).hostname !== "images.pexels.com"
  ) {
    return null;
  }
  return {
    id: `pexels:${photo.id}`,
    provider: "pexels",
    externalId: String(photo.id),
    type: "photo",
    title:
      typeof photo.alt === "string" && photo.alt.trim()
        ? photo.alt.trim()
        : "Pexels photo",
    tags: [],
    previewUrl: photo.src.medium,
    assetUrl: photo.src.large2x,
    mimeType: "image/jpeg",
    width: typeof photo.width === "number" ? photo.width : undefined,
    height: typeof photo.height === "number" ? photo.height : undefined,
    license: {
      tier: "A",
      id: "pexels",
      label: "Pexels License",
      attributionRequired: false,
      author:
        typeof photo.photographer === "string" ? photo.photographer : undefined,
      sourceUrl: photo.url,
      licenseUrl: "https://www.pexels.com/license/",
    },
    editable: { crop: true, filters: true },
  };
};

export const pexelsProvider: AssetProvider = {
  id: "pexels",
  capabilities: { search: true, categories: false, pagination: true },
  async search(query, ownerWindow) {
    const term = query.search?.trim();
    if (query.type && query.type !== "photo") {
      return { items: [] };
    }
    const url = new ownerWindow.URL("/api/pexels", ownerWindow.location.href);
    if (term) {
      url.searchParams.set("query", term.slice(0, 100));
    } else {
      url.searchParams.set("featured", "1");
    }
    url.searchParams.set("per_page", String(Math.min(query.limit || 20, 30)));
    if (query.cursor && /^\d+$/.test(query.cursor)) {
      url.searchParams.set("page", query.cursor);
    }
    const response = await ownerWindow.fetch(url.href);
    if (!response.ok) {
      throw new Error(
        response.status === 503
          ? "Add PEXELS_API_KEY to .env.local and restart the app to search photos."
          : `Pexels search failed: ${response.status}`,
      );
    }
    const data = (await response.json()) as {
      photos?: unknown;
      page?: unknown;
      next_page?: unknown;
    };
    return {
      items: Array.isArray(data.photos)
        ? data.photos
            .map((photo) => normalize(photo as PexelsPhoto, ownerWindow))
            .filter((photo): photo is GratitudeAsset => !!photo)
        : [],
      nextCursor:
        typeof data.next_page === "string" && typeof data.page === "number"
          ? String(data.page + 1)
          : undefined,
    };
  },
  async resolve(assetId, ownerWindow) {
    const id = assetId.replace(/^pexels:/, "");
    if (!/^\d+$/.test(id)) {
      throw new Error("Invalid Pexels photo ID");
    }
    const url = new ownerWindow.URL("/api/pexels", ownerWindow.location.href);
    url.searchParams.set("id", id);
    const response = await ownerWindow.fetch(url.href);
    if (!response.ok) {
      throw new Error("Pexels photo could not be resolved");
    }
    const asset = normalize(
      (await response.json()) as PexelsPhoto,
      ownerWindow,
    );
    if (!asset) {
      throw new Error("Pexels photo could not be resolved");
    }
    return asset;
  },
  async fetchAsset(asset, ownerWindow) {
    if (
      asset.provider !== "pexels" ||
      !isHttpsUrl(asset.assetUrl) ||
      new ownerWindow.URL(asset.assetUrl).hostname !== "images.pexels.com"
    ) {
      throw new Error("Invalid Pexels image URL");
    }
    const response = await ownerWindow.fetch(asset.assetUrl);
    if (!response.ok) {
      throw new Error(`Photo download failed: ${response.status}`);
    }
    const blob = await response.blob();
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(blob.type) ||
      blob.size > 20_000_000
    ) {
      throw new Error("Photo format or size is unsupported");
    }
    return blob;
  },
};
