import { describe, expect, it, vi } from "vitest";

import { builtinProvider } from "./providers/builtin";
import { iconifyProvider } from "./providers/iconify";
import { pexelsProvider } from "./providers/pexels";
import { openverseProvider } from "./providers/openverse";
import { searchAssetsWithStatus } from "./registry";
import { sanitizeSvg } from "./sanitizeSvg";

describe("asset providers", () => {
  it("filters the built-in collection without a network request", async () => {
    const results = await builtinProvider.search({ search: "love" }, window);
    expect(results.items.map((item) => item.id)).toEqual(["gratitude:heart"]);
    expect(results.items[0].license.attributionRequired).toBe(false);
  });

  it("accepts only the approved Iconify collection", async () => {
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        icons: ["tabler:heart", "mdi:heart", "tabler:star"],
      }),
    }));
    const ownerWindow = { URL, fetch } as unknown as Window & typeof globalThis;
    const results = await iconifyProvider.search(
      { search: "heart" },
      ownerWindow,
    );
    expect(results.items.map((item) => item.externalId)).toEqual([
      "tabler:heart",
      "tabler:star",
    ]);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("prefix=tabler"),
    );
    expect(results.items[0].license.id).toBe("MIT");
  });

  it("normalizes only valid Pexels photos and preserves credit", async () => {
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        page: 2,
        next_page: "https://api.pexels.com/v1/search?page=3",
        photos: [
          {
            id: 123,
            alt: "Garden",
            url: "https://www.pexels.com/photo/garden-123/",
            src: {
              medium: "https://images.pexels.com/photos/123/medium.jpeg",
              large2x: "https://images.pexels.com/photos/123/large.jpeg",
            },
            photographer: "Alex",
          },
          {
            id: 456,
            url: "https://www.pexels.com/photo/unsafe-456/",
            src: {
              medium: "https://evil.example/image.jpg",
              large2x: "https://evil.example/image.jpg",
            },
          },
        ],
      }),
    }));
    const ownerWindow = {
      URL,
      fetch,
      location: { href: "http://localhost:3000/" },
    } as unknown as Window & typeof globalThis;
    const results = await pexelsProvider.search(
      { search: "garden", type: "photo" },
      ownerWindow,
    );
    expect(results.items.map((item) => item.id)).toEqual(["pexels:123"]);
    expect(results.items[0].license.author).toBe("Alex");
    expect(results.nextCursor).toBe("3");
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("query=garden"));
  });

  it("accepts only CC0 and public-domain Openverse images", async () => {
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        page_count: 4,
        results: [
          {
            id: "safe",
            title: "Wildflowers",
            creator: "Archive",
            foreign_landing_url: "https://example.org/work/safe",
            url: "https://images.example.org/safe.jpg",
            thumbnail: "https://images.example.org/safe-thumb.jpg",
            license: "cc0",
            license_url: "https://creativecommons.org/publicdomain/zero/1.0/",
          },
          {
            id: "attribution",
            foreign_landing_url: "https://example.org/work/by",
            url: "https://images.example.org/by.jpg",
            thumbnail: "https://images.example.org/by-thumb.jpg",
            license: "by",
          },
        ],
      }),
    }));
    const ownerWindow = {
      URL,
      fetch,
      location: { href: "http://localhost:3000/" },
    } as unknown as Window & typeof globalThis;
    const results = await openverseProvider.search(
      { search: "wildflowers", type: "photo" },
      ownerWindow,
    );
    expect(results.items.map(({ id }) => id)).toEqual(["openverse:safe"]);
    expect(results.items[0].license).toMatchObject({ tier: "A", id: "cc0" });
    expect(results.nextCursor).toBe("2");
  });
});

describe("asset registry", () => {
  it("combines local and remote providers into one normalized result", async () => {
    const fetch = vi
      .spyOn(window, "fetch")
      .mockImplementation(async (input) => {
        const url = String(input);
        return {
          ok: true,
          json: async () =>
            url.includes("api.iconify.design")
              ? { icons: ["tabler:heart"] }
              : {
                  photos: [
                    {
                      id: 99,
                      alt: "Heart shaped light",
                      url: "https://www.pexels.com/photo/heart-99/",
                      src: {
                        medium:
                          "https://images.pexels.com/photos/99/medium.jpeg",
                        large2x:
                          "https://images.pexels.com/photos/99/large.jpeg",
                      },
                    },
                  ],
                },
        } as Response;
      });

    const result = await searchAssetsWithStatus(
      { search: "heart", limit: 20 },
      window,
    );
    const fetchesAfterFirstSearch = fetch.mock.calls.length;
    const cached = await searchAssetsWithStatus(
      { search: "heart", limit: 20 },
      window,
    );
    expect(result.items.map(({ provider }) => provider)).toEqual(
      expect.arrayContaining(["builtin", "iconify", "pexels"]),
    );
    expect(result.items.every(({ license }) => license.tier === "A")).toBe(
      true,
    );
    expect(result.failures).toEqual([]);
    expect(cached.items.map(({ id }) => id)).toEqual(
      result.items.map(({ id }) => id),
    );
    expect(fetch.mock.calls.length).toBe(fetchesAfterFirstSearch);
    fetch.mockRestore();
  });

  it("keeps local results when remote providers fail", async () => {
    const fetch = vi
      .spyOn(window, "fetch")
      .mockRejectedValue(new Error("offline"));
    const result = await searchAssetsWithStatus(
      { search: "relationship", limit: 20 },
      window,
    );
    expect(result.items.map(({ id }) => id)).toContain("gratitude:heart");
    expect(result.failures.map(({ provider }) => provider)).toEqual(
      expect.arrayContaining(["iconify", "pexels"]),
    );
    fetch.mockRestore();
  });
});

describe("SVG sanitization", () => {
  it("keeps drawing primitives and removes executable markup", () => {
    const source = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><script>alert(1)</script><path d="M0 0h24" onload="alert(2)"/><foreignObject><div>bad</div></foreignObject></svg>`;
    const clean = sanitizeSvg(source, window.document);
    expect(clean).toContain("M0 0h24");
    expect(clean).not.toMatch(/script|onload|foreignObject|bad/);
  });

  it("rejects an SVG with no supported artwork", () => {
    expect(() =>
      sanitizeSvg(
        `<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`,
        window.document,
      ),
    ).toThrow();
  });
});
