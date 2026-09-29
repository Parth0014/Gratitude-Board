import { searchRijksmuseum } from "../server/rijksmuseum.mjs";
export default async function handler(request, response) {
  const result = await searchRijksmuseum(new URL(request.url, "http://localhost").searchParams);
  response.setHeader("Cache-Control", "private, max-age=600");
  response.status(result.status).json(result.body);
}
