import type { IncomingMessage, ServerResponse } from "node:http";
import { telegramTarget } from "./relay-target";

const readBody = async (request: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
};

export default async function handler(request: IncomingMessage & { query?: Record<string, string> }, response: ServerResponse) {
  try {
    const path = request.query?.path;
    const webhook = request.query?.webhook === "1";
    const target = webhook
      ? "https://rpm-rent.ru:8443/api/telegram/webhook"
      : telegramTarget(typeof path === "string" ? path : "");
    const body = request.method === "GET" || request.method === "HEAD" ? undefined : await readBody(request);
    const upstream = await fetch(target, {
      method: request.method,
      headers: {
        "content-type": request.headers["content-type"] ?? "application/json",
        ...(webhook && request.headers["x-telegram-bot-api-secret-token"]
          ? { "x-telegram-bot-api-secret-token": String(request.headers["x-telegram-bot-api-secret-token"]) }
          : {}),
      },
      body,
      signal: AbortSignal.timeout(20_000),
    });
    response.statusCode = upstream.status;
    response.setHeader("content-type", upstream.headers.get("content-type") ?? "application/json");
    response.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    response.statusCode = 502;
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Relay failure" }));
  }
}
