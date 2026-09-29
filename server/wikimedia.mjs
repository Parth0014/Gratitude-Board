const endpoint = "https://commons.wikimedia.org/w/api.php";

export const searchWikimedia = async (params, fetchImpl = fetch) => {
  const query = (params.get("query") || "").trim().slice(0, 100);
  if (!query) return { status: 200, body: { query: { pages: [] } } };
  const url = new URL(endpoint);
  url.search = new URLSearchParams({
    action: "query", format: "json", formatversion: "2",
    generator: "search", gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: "6", gsrlimit: String(Math.min(Number(params.get("limit")) || 12, 20)),
    prop: "imageinfo", iiprop: "url|extmetadata|mime|size", iiurlwidth: "480", origin: "*",
  }).toString();
  try {
    const upstream = await fetchImpl(url, { headers: { "User-Agent": "GratitudeVisionStudio/1.0" } });
    if (!upstream.ok) return { status: 502, body: { error: `Wikimedia request failed: ${upstream.status}` } };
    return { status: 200, body: await upstream.json() };
  } catch {
    return { status: 502, body: { error: "Wikimedia is temporarily unavailable" } };
  }
};
