import { describe, expect, it } from "vitest";

import { rescaleImageCrop } from "./imageCrop";

describe("image crop scaling", () => {
  it("keeps the crop proportions when a derivative is downsampled", () => {
    expect(
      rescaleImageCrop(
        {
          x: 1000,
          y: 0,
          width: 4000,
          height: 4000,
          naturalWidth: 6000,
          naturalHeight: 4000,
        },
        2048,
        1365,
      ),
    ).toEqual({
      x: 341.3333333333333,
      y: 0,
      width: 1365.3333333333333,
      height: 1365,
      naturalWidth: 2048,
      naturalHeight: 1365,
    });
  });
});
