/**
 * Worker 入口：process shim + 原生 /api 路由 + TanStack SSR 兜底。
 * 不用 createServerFn —— 服务端逻辑放 fetch handler 里，client 只调 JSON。
 */
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import { env as cfEnv } from "cloudflare:workers";

try {
  if (typeof globalThis.process === "undefined") {
    (globalThis as unknown as { process: unknown }).process = { env: {} };
  }
  const proc = globalThis.process as { env: Record<string, string | undefined> };
  for (const [key, value] of Object.entries(cfEnv)) {
    if (typeof value === "string" && proc.env[key] === undefined) proc.env[key] = value;
  }
} catch {
  /* dev */
}

const startFetch = createStartHandler(defaultStreamHandler);

const isDev =
  typeof import.meta !== "undefined" && (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true;

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...(init.headers as Record<string, string>) },
  });
}

function withSecurityHeaders(res: Response): Response {
  const headers = new Headers(res.headers);
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (!isDev) {
    headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "connect-src 'self'",
      ].join("; "),
    );
  }
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/health" && request.method === "GET") {
      return json({ ok: true, ts: new Date().toISOString() });
    }

    return withSecurityHeaders(await startFetch(request));
  },
};