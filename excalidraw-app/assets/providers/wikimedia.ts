import type { AssetProvider, GratitudeAsset } from "../contracts";

type MetadataValue = { value?: unknown };
type WikimediaPage = {
  pageid?: unknown;
  title?: unknown;
  imageinfo?: Array<{
    url?: unknown;
    thumburl?: unknown;
    mime?: unknown;
    width?: unknown;
    height?: unknown;
    descriptionurl?: unknown;
    extmetadata?: Record<string, MetadataValue>;
  }>;
};
const safeHttps = (value: unknown): value is string =>
  typeof value === "string" && /^https:\/\/[^\s]+$/i.test(value);
const text = (value: MetadataValue | undefined) =>
  typeof value?.value === "string"
    ? value.value.replace(/<[^>]*>/g, "").trim()
    : undefined;
const normalize = (page: WikimediaPage): GratitudeAsset | null => {
  const info = page.imageinfo?.[0];
  if (!info || !safeHttps(info.url) || !safeHttps(info.thumburl)) {
    return null;
  }
  const metadata = info.extmetadata || {};
  const license = text(metadata.LicenseShortName) || "Open license";
  const publicDomain = /public domain|cc0/i.test(license);
  return {
    id: `wikimedia:${String(page.pageid)}`,
    provider: "wikimedia",
    externalId: String(page.pageid),
    type: "photo",
    title:
      text(metadata.ObjectName) ||
      (typeof page.title === "string"
        ? page.title.replace(/^File:/, "")
        : "Wikimedia image"),
    tags: [],
    previewUrl: info.thumburl,
    assetUrl: info.url,
    mimeType: typeof info.mime === "string" ? info.mime : undefined,
    width: typeof info.width === "number" ? info.width : undefined,
    height: typeof info.height === "number" ? info.height : undefined,
    license: {
      tier: publicDomain ? "A" : "C",
      id: license.toLowerCase().replace(/\s+/g, "-"),
      label: license,
      attributionRequired: !publicDomain,
      author: text(metadata.Artist) || text(metadata.Credit),
      sourceUrl: safeHttps(info.descriptionurl)
        ? info.descriptionurl
        : `https://commons.wikimedia.org/?curid=${page.pageid}`,
      licenseUrl: safeHttps(metadata.LicenseUrl?.value)
        ? metadata.LicenseUrl.value
        : undefined,
    },
    editable: { crop: true, filters: true },
  };
};

export const wikimediaProvider: AssetProvider = {
  id: "wikimedia",
  capabilities: { search: true, categories: false, pagination: false },
  async search(query, ownerWindow) {
    const term = query.search?.trim();
    if (!term || (query.type && query.type !== "photo")) {
      return { items: [] };
    }
    const url = new ownerWindow.URL(
      "/api/wikimedia",
      ownerWindow.location.href,
    );
    url.searchParams.set("query", term);
    url.searchParams.set("limit", String(query.limit || 12));
    const response = await ownerWindow.fetch(url.href);
    if (!response.ok) {
      throw new Error("Wikimedia is temporarily unavailable");
    }
    const body = (await response.json()) as { query?: { pages?: unknown } };
    return {
      items: Array.isArray(body.query?.pages)
        ? body.query.pages
            .map((item) => normalize(item as WikimediaPage))
            .filter((item): item is GratitudeAsset => !!item)
        : [],
    };
  },
  async resolve() {
    throw new Error("Wikimedia assets are resolved from saved provenance");
  },
  async fetchAsset(asset, ownerWindow) {
    if (asset.provider !== "wikimedia" || !safeHttps(asset.assetUrl)) {
      throw new Error("Invalid Wikimedia asset URL");
    }
    const response = await ownerWindow.fetch(asset.assetUrl);
    if (!response.ok) {
      throw new Error(`Wikimedia download failed: ${response.status}`);
    }
    return response.blob();
  },
};
