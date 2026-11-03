import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { storeIncr } from "@/lib/store";
import { site } from "@/lib/site";

export function clientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function hashedIp(request: NextRequest) {
  return createHash("sha256").update(clientIp(request)).digest("hex").slice(0, 32);
}

export async function rateLimit(
  request: NextRequest,
  bucket: string,
  limit: number,
  windowSeconds: number,
) {
  const key = `rate:${bucket}:${hashedIp(request)}`;
  const count = await storeIncr(key, windowSeconds);
  return {
    allowed: count <= limit,
    count,
    remaining: Math.max(0, limit - count),
    retryAfter: windowSeconds,
  };
}

function allowedOrigins() {
  const origins = new Set<string>();
  for (const value of [site.url, process.env.NEXT_PUBLIC_SITE_URL, process.env.SITE_URL]) {
    if (!value) continue;
    try {
      origins.add(new URL(value).origin);
    } catch {
      // Ignore malformed env values.
    }
  }
  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`);
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }
  return origins;
}

export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return allowedOrigins().has(new URL(origin).origin);
  } catch {
    return false;
  }
}

export function verifyHeartbeatSignature(rawBody: string, signature: string | null) {
  const secret = process.env.BOT_HEARTBEAT_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  let received: Buffer;
  try {
    received = Buffer.from(signature.trim(), "hex");
  } catch {
    return false;
  }
  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}
