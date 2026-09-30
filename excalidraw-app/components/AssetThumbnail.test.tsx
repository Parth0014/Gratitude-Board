import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AssetThumbnail } from "./AssetThumbnail";

afterEach(cleanup);

describe("AssetThumbnail", () => {
  it("renders the image while the thumbnail loads", () => {
    render(<AssetThumbnail src="https://example.com/photo.jpg" title="Sunset" />);
    const img = document.querySelector("img");
    expect(img?.getAttribute("src")).toBe("https://example.com/photo.jpg");
    expect(
      screen.queryByLabelText("Sunset — preview unavailable"),
    ).toBeNull();
  });

  it("renders a labelled fallback tile when the thumbnail fails", () => {
    render(<AssetThumbnail src="https://example.com/broken.jpg" title="Sunset" />);
    const img = document.querySelector("img");
    expect(img).not.toBeNull();
    fireEvent.error(img as HTMLImageElement);
    expect(
      screen.queryByLabelText("Sunset — preview unavailable"),
    ).not.toBeNull();
    expect(screen.queryByText("Preview unavailable")).not.toBeNull();
    expect(screen.queryByText("Sunset")).not.toBeNull();
    expect(document.querySelector("img")).toBeNull();
  });

  it("renders the fallback tile when no source is provided", () => {
    render(<AssetThumbnail src="" title="Sunset" />);
    expect(
      screen.queryByLabelText("Sunset — preview unavailable"),
    ).not.toBeNull();
    expect(document.querySelector("img")).toBeNull();
  });
});
