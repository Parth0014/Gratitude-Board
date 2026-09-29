import { searchSmithsonian } from "../server/smithsonian.mjs";

export default async function handler(request, response) {
  const result = await searchSmithsonian(new URL(request.url, "http://localhost").searchParams, process.env.SMITHSONIAN_API_KEY);
  response.setHeader("Cache-Control", "private, max-age=300");
  response.status(result.status).json(result.body);
}
