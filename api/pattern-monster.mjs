import { patternMonsterRequest } from "../server/patternMonster.mjs";
export default async function handler(request, response) {
  const result = await patternMonsterRequest(new URL(request.url, "http://localhost").searchParams, process.env.PATTERN_MONSTER_API_KEY);
  response.setHeader("Content-Type", result.contentType);
  response.setHeader("Cache-Control", "private, max-age=600");
  response.status(result.status).send(typeof result.body === "string" ? result.body : JSON.stringify(result.body));
}
