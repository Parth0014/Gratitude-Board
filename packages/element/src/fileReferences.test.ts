import { describe, expect, it } from "vitest";

import { collectReferencedFileIds } from "./fileReferences";

describe("collectReferencedFileIds", () => {
  it("includes original and derivative image dependencies", () => {
    expect(
      collectReferencedFileIds([
        {
          type: "image",
          fileId: "derivative",
          customData: {
            gratitudeImageEdits: {
              originalFileId: "original",
              derivativeFileId: "derivative",
            },
          },
          isDeleted: false,
        },
      ] as any),
    ).toEqual(["derivative", "original"]);
  });
});
