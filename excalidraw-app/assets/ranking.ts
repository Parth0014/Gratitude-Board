import type { GratitudeAsset } from "./contracts";

const words = (value: string) =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

export const rankAssets = (assets: GratitudeAsset[], query = "") => {
  const terms = words(query);
  return assets
    .map((asset, index) => {
      const title = asset.title.toLowerCase();
      const tags = asset.tags.map((tag) => tag.toLowerCase());
      const relevance = terms.reduce(
        (score, term) =>
          score +
          (title === term ? 12 : title.includes(term) ? 7 : 0) +
          (tags.some((tag) => tag === term)
            ? 5
            : tags.some((tag) => tag.includes(term))
            ? 2
            : 0),
        0,
      );
      const quality =
        asset.width && asset.height
          ? Math.min(
              4,
              Math.log2(Math.max(asset.width, asset.height) / 400 + 1),
            )
          : 0;
      const license =
        asset.license.tier === "A" ? 2 : asset.license.tier === "B" ? 1 : 0;
      return { asset, score: relevance + quality + license, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ asset }) => asset);
};
