import { describe, expect, it } from "vitest";

import { addRecent, readAssetLibrary, toggleFavorite } from "./libraryState";

import type { GratitudeAsset } from "./contracts";

const asset = (id: string) =>
  ({
    id,
    provider: "test",
    type: "photo",
    title: id,
    tags: [],
    previewUrl: `https://example.com/${id}.jpg`,
    assetUrl: `https://example.com/${id}.jpg`,
    license: {
      tier: "A",
      id: "test",
      label: "Test",
      attributionRequired: false,
    },
    editable: {},
  } as GratitudeAsset);

describe("asset library state", () => {
  it("toggles favorites without duplicates", () => {
    const first = toggleFavorite({ favorites: [], recents: [] }, asset("a"));
    expect(first.favorites.map(({ id }) => id)).toEqual(["a"]);
    expect(toggleFavorite(first, asset("a")).favorites).toEqual([]);
  });

  it("moves a reused asset to the front of recents", () => {
    const initial = { favorites: [], recents: [asset("a"), asset("b")] };
    expect(addRecent(initial, asset("b")).recents.map(({ id }) => id)).toEqual([
      "b",
      "a",
    ]);
  });

  it("returns an empty library for corrupt storage", () => {
    const storage = {
      getItem: () => "not-json",
    } as unknown as Storage;
    expect(readAssetLibrary(storage)).toEqual({ favorites: [], recents: [] });
  });
});
