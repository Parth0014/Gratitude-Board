import { describe, expect, it } from "vitest";

import type { ExcalidrawElement } from "@excalidraw/element/types";

import { createVisionBoardDocument, readVisionBoardDocument } from "./document";

const scene = [
  {
    id: "page",
    type: "frame",
    x: 0,
    y: 0,
    width: 1200,
    height: 960,
    customData: { gratitudePage: true },
  },
  {
    id: "photo",
    type: "image",
    x: 40,
    y: 50,
    width: 200,
    height: 120,
    angle: 0,
    opacity: 100,
    locked: false,
    isDeleted: false,
    frameId: "page",
    customData: {
      gratitudeVision: { id: "vision-photo", type: "image" },
      gratitudeAsset: {
        id: "pexels:123",
        provider: "pexels",
        type: "photo",
        title: "Sea",
        tags: [],
        previewUrl: "https://example.com/preview",
        assetUrl: "https://example.com/original",
        license: {
          tier: "A",
          id: "pexels",
          label: "Pexels License",
          attributionRequired: false,
        },
        editable: { crop: true },
      },
    },
  },
] as unknown as ExcalidrawElement[];

describe("vision board document migration", () => {
  it("upgrades a legacy scene and preserves asset provenance", () => {
    const document = createVisionBoardDocument(scene, "My board");
    expect(document.id).toBe("page");
    expect(document.version).toBe(3);
    expect(document.canvas).toMatchObject({ width: 1200, height: 960 });
    expect(document.elements).toHaveLength(1);
    expect(document.elements[0]).toMatchObject({
      id: "vision-photo",
      type: "image",
      x: 40,
      excalidrawIds: ["photo"],
      metadata: { sourceAssetId: "pexels:123" },
    });
    expect(document.assets["pexels:123"].license.label).toBe("Pexels License");
    expect(readVisionBoardDocument(JSON.stringify(document))).toEqual(document);
  });

  it("keeps semantic metadata when scene positions change", () => {
    const previous = createVisionBoardDocument(scene, "My board");
    previous.elements[0].metadata.aspirationId = "goal-1";
    const next = createVisionBoardDocument(
      [{ ...scene[0] }, { ...scene[1], x: 80 }] as ExcalidrawElement[],
      "Updated board",
      previous,
    );
    expect(next.elements[0].x).toBe(80);
    expect(next.elements[0].metadata.aspirationId).toBe("goal-1");
    expect(next.title).toBe("Updated board");
  });

  it("keeps semantic metadata when a compound element uses a secondary id", () => {
    const previous = createVisionBoardDocument(scene, "My board");
    previous.elements[0].metadata.aspirationId = "goal-1";
    previous.elements[0].excalidrawIds.push("photo-secondary");

    const next = createVisionBoardDocument(
      [
        { ...scene[0] },
        { ...scene[1], id: "photo-secondary", x: 120 },
      ] as ExcalidrawElement[],
      "Updated board",
      previous,
    );

    expect(next.elements[0].metadata.aspirationId).toBe("goal-1");
  });

  it("ignores invalid or unsupported stored documents", () => {
    expect(readVisionBoardDocument("not json")).toBeNull();
    expect(readVisionBoardDocument('{"version":3}')).toBeNull();

    const invalid = createVisionBoardDocument(scene, "My board");
    invalid.canvas.width = -1;
    expect(readVisionBoardDocument(JSON.stringify(invalid))).toBeNull();

    invalid.canvas.width = 1200;
    invalid.elements[0].width = -20;
    expect(readVisionBoardDocument(JSON.stringify(invalid))).toBeNull();

    invalid.elements[0].width = 200;
    invalid.assets["pexels:123"].editable = null as never;
    expect(readVisionBoardDocument(JSON.stringify(invalid))).toBeNull();

    invalid.assets["pexels:123"].editable = { crop: true };
    invalid.assets["pexels:123"].assetUrl = "ftp://example.com/image.jpg";
    expect(readVisionBoardDocument(JSON.stringify(invalid))).toBeNull();
  });

  it("migrates a version 1 companion document", () => {
    const legacy = {
      version: 1,
      id: "page",
      title: "Old",
      elements: [],
      assets: {},
    };
    expect(readVisionBoardDocument(JSON.stringify(legacy))).toMatchObject({
      version: 3,
      id: "page",
      canvas: {
        width: 1200,
        height: 960,
        backgroundColor: "#ffffff",
        texture: "none",
      },
    });
  });
});
