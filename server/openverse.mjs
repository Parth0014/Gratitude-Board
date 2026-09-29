const endpoint = "https://api.openverse.org/v1/images/";

export const searchOpenverse = async (params, fetchImpl = fetch) => {
  const query = (params.get("query") || "").trim().slice(0, 100);
  if (!query) return { status: 200, body: { results: [] } };
  const url = new URL(endpoint);
  url.searchParams.set("q", query);
  url.searchParams.set("license", "cc0,pdm");
  url.searchParams.set("page_size", String(Math.min(Number(params.get("per_page")) || 20, 30)));
  try {
    const upstream = await fetchImpl(url, {
      headers: { "User-Agent": "GratitudeVisionStudio/1.0" },
    });
    if (!upstream.ok) return { status: 502, body: { error: `Openverse request failed: ${upstream.status}` } };
    return { status: 200, body: await upstream.json() };
  } catch {
    return { status: 502, body: { error: "Openverse is temporarily unavailable" } };
  }
};
