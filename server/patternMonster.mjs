const endpoint = "https://api.pattern.monster/v1";
export const patternMonsterRequest = async (params, apiKey, fetchImpl = fetch) => {
  if (!apiKey) return { status: 503, body: { error: "Pattern Monster needs PATTERN_MONSTER_API_KEY" }, contentType: "application/json" };
  const slug = (params.get("slug") || "").replace(/[^a-z0-9-]/gi, "");
  const render = params.get("render") === "1";
  const url = new URL(render && slug ? `${endpoint}/patterns/${slug}/svg` : `${endpoint}/patterns`);
  if (render) url.searchParams.set("tile", "true");
  else { url.searchParams.set("q", (params.get("query") || "").slice(0, 80)); url.searchParams.set("limit", String(Math.min(Number(params.get("limit")) || 16, 30))); }
  try {
    const upstream = await fetchImpl(url, { headers: { "x-api-key": apiKey, "User-Agent": "GratitudeVisionStudio/1.0" } });
    if (!upstream.ok) return { status: 502, body: { error: `Pattern Monster request failed: ${upstream.status}` }, contentType: "application/json" };
    return render
      ? { status: 200, body: await upstream.text(), contentType: "image/svg+xml" }
      : { status: 200, body: await upstream.json(), contentType: "application/json" };
  } catch { return { status: 502, body: { error: "Pattern Monster is temporarily unavailable" }, contentType: "application/json" }; }
};
