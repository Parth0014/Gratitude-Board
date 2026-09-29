import type { AssetProvider, GratitudeAsset } from "../contracts";

const doodles = [
  ["running", "Running toward a dream"],
  ["ice-cream", "Celebrate the sweet moments"],
  ["sleek", "Moving forward"],
  ["Doggie", "Time with a friend"],
  ["selfie", "Capture the moment"],
  ["dancing", "Dance with joy"],
  ["reading-side", "Time to learn"],
] as const;
const peeps = [
  ["5e5358878e2493fbea064dd9_peep-59.svg", "Confident person"],
  ["5e5356be67293a8a335c71b0_peep-44.svg", "Thoughtful person"],
  ["5e532a4c258ffe237b8ef2c1_peep-2.svg", "Creative person"],
  ["5e535cc633d3686b733e5265_mix-7.svg", "Open Peep pose"],
] as const;

const assets: GratitudeAsset[] = [
  ...doodles.map(([slug, title]) => ({
    id: `open-doodles:${slug}`,
    provider: "open-illustrations",
    externalId: slug,
    type: "illustration" as const,
    title,
    tags: ["doodle", "people", "dream", "lifestyle"],
    previewUrl: `https://opendoodles.s3-us-west-1.amazonaws.com/${slug}.svg`,
    assetUrl: `https://opendoodles.s3-us-west-1.amazonaws.com/${slug}.svg`,
    mimeType: "image/svg+xml",
    license: {
      tier: "A" as const,
      id: "cc0-1.0",
      label: "CC0 1.0",
      attributionRequired: false,
      author: "Pablo Stanley",
      sourceUrl: "https://www.opendoodles.com/",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    },
    editable: { colors: true },
  })),
  ...peeps.map(([file, title]) => {
    const url = `https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/${file}`;
    return {
      id: `open-peeps:${file}`,
      provider: "open-illustrations",
      externalId: file,
      type: "illustration" as const,
      title,
      tags: ["people", "person", "pose", "character"],
      previewUrl: url,
      assetUrl: url,
      mimeType: "image/svg+xml",
      license: {
        tier: "A" as const,
        id: "cc0-1.0",
        label: "CC0 1.0",
        attributionRequired: false,
        author: "Pablo Stanley",
        sourceUrl: "https://www.openpeeps.com/",
        licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      },
      editable: { colors: true },
    };
  }),
];

export const openIllustrationsProvider: AssetProvider = {
  id: "open-illustrations",
  capabilities: { search: true, categories: true, pagination: false },
  async search(query) {
    if (query.type && query.type !== "illustration") {
      return { items: [] };
    }
    const terms =
      query.search?.toLowerCase().split(/\s+/).filter(Boolean) || [];
    return {
      items: assets
        .filter(
          (asset) =>
            !terms.length ||
            terms.some((term) =>
              `${asset.title} ${asset.tags.join(" ")}`
                .toLowerCase()
                .includes(term),
            ),
        )
        .slice(0, query.limit || 20),
    };
  },
  async resolve(assetId) {
    const asset = assets.find((item) => item.id === assetId);
    if (!asset) {
      throw new Error("Illustration not found");
    }
    return asset;
  },
  async fetchAsset(asset, ownerWindow) {
    if (
      asset.provider !== "open-illustrations" ||
      !asset.assetUrl.startsWith("https://")
    ) {
      throw new Error("Invalid illustration URL");
    }
    const response = await ownerWindow.fetch(asset.assetUrl);
    if (!response.ok) {
      throw new Error(`Illustration download failed: ${response.status}`);
    }
    return response.blob();
  },
};
