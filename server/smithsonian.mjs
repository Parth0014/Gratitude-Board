const endpoint = "https://api.si.edu/openaccess/api/v1.0/search";

export const searchSmithsonian = async (params, apiKey, fetchImpl = fetch) => {
  const query = (params.get("query") || "").trim().slice(0, 100);
  if (!query) {
    return { status: 200, body: { response: { rows: [] } } };
  }
  if (!apiKey) {
    return {
      status: 503,
      body: { error: "Smithsonian search needs SMITHSONIAN_API_KEY" },
    };
  }
  const url = new URL(endpoint);
  url.searchParams.set("q", `${query} online_media_type:Images`);
  url.searchParams.set(
    "rows",
    String(Math.min(Number(params.get("limit")) || 10, 20)),
  );
  url.searchParams.set("api_key", apiKey);
  try {
    const upstream = await fetchImpl(url, {
      headers: { "User-Agent": "GratitudeVisionStudio/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) {
      return {
        status: 502,
        body: { error: `Smithsonian request failed: ${upstream.status}` },
      };
    }
    return { status: 200, body: await upstream.json() };
  } catch {
    return {
      status: 502,
      body: { error: "Smithsonian is temporarily unavailable" },
    };
  }
};
