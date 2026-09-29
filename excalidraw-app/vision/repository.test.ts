import { describe, expect, it } from "vitest";

import { VisionDocumentRepository } from "./repository";

import type { VisionBoardDocument } from "./model";

const document: VisionBoardDocument = {
  version: 3,
  id: "board",
  title: "My board",
  canvas: {
    width: 1200,
    height: 960,
    backgroundColor: "#ffffff",
    texture: "none",
  },
  elements: [],
  assets: {},
  layout: { slotIds: [], freeform: true },
  fontManifest: [],
  reelConfig: {
    aspectRatio: "9:16",
    defaultDurationMs: 2500,
    elementOrder: [],
  },
};

describe("vision document repository", () => {
  it("round-trips a versioned document", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) || null,
      setItem: (key: string, value: string) => values.set(key, value),
    } as unknown as Storage;
    const repository = new VisionDocumentRepository(storage);

    expect(repository.save(document)).toBe(true);
    expect(repository.load()).toEqual(document);
  });

  it("fails safely when storage is blocked", () => {
    const storage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    } as unknown as Storage;
    const repository = new VisionDocumentRepository(storage);

    expect(repository.load()).toBeNull();
    expect(repository.save(document)).toBe(false);
  });
});
