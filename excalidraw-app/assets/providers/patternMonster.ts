import type { AssetProvider, GratitudeAsset } from "../contracts";
type Pattern = {
  slug?: unknown;
  id?: unknown;
  name?: unknown;
  title?: unknown;
  tags?: unknown;
};
const normalize = (
  item: Pattern,
  ownerWindow: Window & typeof globalThis,
): GratitudeAsset | null => {
  const slug =
    typeof item.slug === "string"
      ? item.slug
      : typeof item.id === "string"
      ? item.id
      : "";
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return null;
  }
  const url = new ownerWindow.URL(
    "/api/pattern-monster",
    ownerWindow.location.href,
  );
  url.searchParams.set("render", "1");
  url.searchParams.set("slug", slug);
  return {
    id: `pattern-monster:${slug}`,
    provider: "pattern-monster",
    externalId: slug,
    type: "pattern",
    title:
      typeof item.name === "string"
        ? item.name
        : typeof item.title === "string"
        ? item.title
        : slug.replace(/-/g, " "),
    tags: Array.isArray(item.tags)
      ? item.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    previewUrl: url.href,
    assetUrl: url.href,
    mimeType: "image/svg+xml",
    license: {
      tier: "B",
      id: "pattern-monster",
      label: "Pattern Monster license",
      attributionRequired: false,
      sourceUrl: `https://pattern.monster/${slug}`,
    },
    editable: { colors: true },
  };
};
export const patternMonsterProvider: AssetProvider = {
  id: "pattern-monster",
  capabilities: { search: true, categories: true, pagination: false },
  async search(query, ownerWindow) {
    if (query.type && query.type !== "pattern") {
      return { items: [] };
    }
    const url = new ownerWindow.URL(
      "/api/pattern-monster",
      ownerWindow.location.href,
    );
    url.searchParams.set("query", query.search || "");
    url.searchParams.set("limit", String(query.limit || 16));
    const response = await ownerWindow.fetch(url.href);
    if (!response.ok) {
      throw new Error(
        response.status === 503
          ? "Pattern Monster is not configured"
          : "Pattern Monster is temporarily unavailable",
      );
    }
    const body = (await response.json()) as {
      patterns?: unknown;
      items?: unknown;
      data?: unknown;
    };
    const list = Array.isArray(body.patterns)
      ? body.patterns
      : Array.isArray(body.items)
      ? body.items
      : Array.isArray(body.data)
      ? body.data
      : [];
    return {
      items: list
        .map((item) => normalize(item as Pattern, ownerWindow))
        .filter((item): item is GratitudeAsset => !!item),
    };
  },
  async resolve() {
    throw new Error("Pattern assets are resolved from saved provenance");
  },
  async fetchAsset(asset, ownerWindow) {
    const response = await ownerWindow.fetch(asset.assetUrl);
    if (!response.ok) {
      throw new Error(`Pattern download failed: ${response.status}`);
    }
    return response.blob();
  },
};
