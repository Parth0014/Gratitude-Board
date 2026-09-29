import type { AssetProvider, GratitudeAsset } from "../contracts";

type SmithsonianRow = {
  id?: unknown;
  title?: unknown;
  url?: unknown;
  content?: {
    descriptiveNonRepeating?: {
      record_link?: unknown;
      online_media?: {
        media?: Array<{
          content?: unknown;
          thumbnail?: unknown;
          type?: unknown;
        }>;
      };
    };
    freetext?: { name?: Array<{ content?: unknown }> };
  };
};
const safeHttps = (value: unknown): value is string =>
  typeof value === "string" && /^https:\/\/[^\s]+$/i.test(value);
const normalize = (row: SmithsonianRow): GratitudeAsset | null => {
  const media = row.content?.descriptiveNonRepeating?.online_media?.media?.find(
    (item) =>
      safeHttps(item.content) &&
      (!item.type || String(item.type).startsWith("image")),
  );
  if (!media || !safeHttps(media.content)) {
    return null;
  }
  const preview = safeHttps(media.thumbnail) ? media.thumbnail : media.content;
  const recordLink = row.content?.descriptiveNonRepeating?.record_link;
  const author = row.content?.freetext?.name
    ?.map((item) => item.content)
    .find((item): item is string => typeof item === "string");
  return {
    id: `smithsonian:${String(row.id)}`,
    provider: "smithsonian",
    externalId: String(row.id),
    type: "photo",
    title:
      typeof row.title === "string"
        ? row.title
        : "Smithsonian Open Access image",
    tags: [],
    previewUrl: preview,
    assetUrl: media.content,
    license: {
      tier: "A",
      id: "cc0-1.0",
      label: "CC0 1.0",
      attributionRequired: false,
      author,
      sourceUrl: safeHttps(recordLink)
        ? recordLink
        : safeHttps(row.url)
        ? row.url
        : "https://www.si.edu/openaccess",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    },
    editable: { crop: true, filters: true },
  };
};

export const smithsonianProvider: AssetProvider = {
  id: "smithsonian",
  capabilities: { search: true, categories: false, pagination: false },
  async search(query, ownerWindow) {
    const term = query.search?.trim();
    if (!term || (query.type && query.type !== "photo")) {
      return { items: [] };
    }
    const url = new ownerWindow.URL(
      "/api/smithsonian",
      ownerWindow.location.href,
    );
    url.searchParams.set("query", term);
    url.searchParams.set("limit", String(query.limit || 10));
    const response = await ownerWindow.fetch(url.href);
    if (!response.ok) {
      throw new Error(
        response.status === 503
          ? "Smithsonian is not configured"
          : "Smithsonian is temporarily unavailable",
      );
    }
    const body = (await response.json()) as { response?: { rows?: unknown } };
    return {
      items: Array.isArray(body.response?.rows)
        ? body.response.rows
            .map((row) => normalize(row as SmithsonianRow))
            .filter((item): item is GratitudeAsset => !!item)
        : [],
    };
  },
  async resolve() {
    throw new Error("Smithsonian assets are resolved from saved provenance");
  },
  async fetchAsset(asset, ownerWindow) {
    if (asset.provider !== "smithsonian" || !safeHttps(asset.assetUrl)) {
      throw new Error("Invalid Smithsonian asset URL");
    }
    const response = await ownerWindow.fetch(asset.assetUrl);
    if (!response.ok) {
      throw new Error(`Smithsonian download failed: ${response.status}`);
    }
    return response.blob();
  },
};
