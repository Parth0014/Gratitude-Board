const searchEndpoint = "https://data.rijksmuseum.nl/search/collection";

const findImageUrl = (value) => {
  if (typeof value === "string" && /^https:\/\/[^\s]+\.(?:jpe?g|png|webp)(?:\?|$)/i.test(value)) return value;
  if (Array.isArray(value)) {
    for (const item of value) { const found = findImageUrl(item); if (found) return found; }
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) { const found = findImageUrl(item); if (found) return found; }
  }
  return undefined;
};
const label = (record) => record?._label || record?.label || record?.identified_by?.find?.((item) => item?.content)?.content;

export const searchRijksmuseum = async (params, fetchImpl = fetch) => {
  const query = (params.get("query") || "").trim().slice(0, 100);
  if (!query) return { status: 200, body: { items: [] } };
  try {
    const url = new URL(searchEndpoint);
    url.searchParams.set("description", query);
    url.searchParams.set("imageAvailable", "true");
    const search = await fetchImpl(url, { headers: { Accept: "application/json", "User-Agent": "GratitudeVisionStudio/1.0" } });
    if (!search.ok) return { status: 502, body: { error: `Rijksmuseum request failed: ${search.status}` } };
    const page = await search.json();
    const ids = (Array.isArray(page.orderedItems) ? page.orderedItems : []).slice(0, Math.min(Number(params.get("limit")) || 8, 12));
    const records = await Promise.all(ids.map(async (item) => {
      if (typeof item?.id !== "string") return null;
      const recordUrl = item.id.replace("https://id.rijksmuseum.nl/", "https://data.rijksmuseum.nl/") + "?_profile=la-framed";
      const response = await fetchImpl(recordUrl, { headers: { Accept: "application/json", "User-Agent": "GratitudeVisionStudio/1.0" } });
      if (!response.ok) return null;
      const record = await response.json();
      const image = findImageUrl(record.representation || record);
      return image ? { id: item.id, title: label(record), image, creator: label(record.produced_by?.carried_out_by?.[0]) } : null;
    }));
    return { status: 200, body: { items: records.filter(Boolean) } };
  } catch {
    return { status: 502, body: { error: "Rijksmuseum is temporarily unavailable" } };
  }
};
