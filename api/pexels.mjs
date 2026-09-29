import { searchPexels } from "../server/pexels.mjs";

export default async function handler(request, response) {
  const result = await searchPexels(
    new URL(request.url, "http://localhost").searchParams,
    process.env.PEXELS_API_KEY,
  );
  response.setHeader("Cache-Control", "private, max-age=60");
  response.status(result.status).json(result.body);
}
