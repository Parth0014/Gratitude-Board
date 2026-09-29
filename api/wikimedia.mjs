import { searchWikimedia } from "../server/wikimedia.mjs";

export default async function handler(request, response) {
  const result = await searchWikimedia(new URL(request.url, "http://localhost").searchParams);
  response.setHeader("Cache-Control", "private, max-age=300");
  response.status(result.status).json(result.body);
}
