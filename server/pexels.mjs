export async function searchPexels(params, key) {
  if (!key) {
    return {
      status: 503,
      body: { error: "Pexels API key is not configured." },
    };
  }
  const query = String(params.get("query") || "")
    .trim()
    .slice(0, 100);
  const id = String(params.get("id") || "");
  const featured = params.get("featured") === "1";
  if (id && !/^\d{1,15}$/.test(id)) {
    return { status: 400, body: { error: "Invalid photo ID." } };
  }
  if (!query && !id && !featured) {
    return { status: 400, body: { error: "A search term is required." } };
  }
  const perPage = Math.min(
    Math.max(Number(params.get("per_page")) || 20, 1),
    30,
  );
  const page = Math.min(Math.max(Number(params.get("page")) || 1, 1), 1000);
  const url = new URL(
    id
      ? `https://api.pexels.com/v1/photos/${id}`
      : featured
      ? "https://api.pexels.com/v1/curated"
      : "https://api.pexels.com/v1/search",
  );
  if (!id) {
    if (!featured) {
      url.searchParams.set("query", query);
    }
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));
  }
  try {
    const response = await fetch(url, {
      headers: { Authorization: key },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      return {
        status: response.status,
        body: { error: "Pexels search failed." },
      };
    }
    return { status: 200, body: await response.json() };
  } catch {
    return {
      status: 502,
      body: { error: "Pexels is temporarily unavailable." },
    };
  }
}
