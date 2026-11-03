import "server-only";
import { Redis } from "@upstash/redis";
import { getMongoDb, mongoConfigured } from "@/lib/mongo";

type MemoryEntry = {
  value: unknown;
  expiresAt: number | null;
};

type MemoryStore = {
  values: Map<string, MemoryEntry>;
  lists: Map<string, unknown[]>;
};

type KeyValueDoc = {
  _id: string;
  value?: unknown;
  expiresAt?: Date;
  updatedAt?: Date;
};

type ListDoc = {
  _id: string;
  items: unknown[];
  updatedAt?: Date;
};

type CounterDoc = {
  _id: string;
  count: number;
  expiresAt: Date;
  updatedAt: Date;
};

export type StoreBackend = "mongodb" | "upstash" | "memory";

const globalForStore = globalThis as typeof globalThis & {
  __wrightyardStore?: MemoryStore;
  __wrightyardMongoDownUntil?: number;
};

function memory(): MemoryStore {
  if (!globalForStore.__wrightyardStore) {
    globalForStore.__wrightyardStore = {
      values: new Map(),
      lists: new Map(),
    };
  }
  return globalForStore.__wrightyardStore;
}

function redisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function mongoUsable() {
  return mongoConfigured() && Date.now() >= (globalForStore.__wrightyardMongoDownUntil ?? 0);
}

function noteMongoFailure(error: unknown) {
  globalForStore.__wrightyardMongoDownUntil = Date.now() + 30_000;
  console.warn(
    "[store] MongoDB is unavailable; using the local fallback for 30 seconds.",
    error instanceof Error ? error.message : error,
  );
}

async function viaMongo<T>(
  operation: (db: Awaited<ReturnType<typeof getMongoDb>>) => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  if (!mongoUsable()) return fallback();

  try {
    const db = await getMongoDb();
    const result = await operation(db);
    globalForStore.__wrightyardMongoDownUntil = 0;
    return result;
  } catch (error) {
    noteMongoFailure(error);
    return fallback();
  }
}

export function storeBackend(): StoreBackend {
  if (mongoUsable()) return "mongodb";
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return "upstash";
  }
  return "memory";
}

export function isStoreDurable() {
  return storeBackend() !== "memory";
}

function liveEntry(entry: MemoryEntry | undefined): MemoryEntry | null {
  if (!entry) return null;
  if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) return null;
  return entry;
}

async function fallbackGet<T>(key: string): Promise<T | null> {
  const redis = redisClient();
  if (redis) return (await redis.get<T>(key)) ?? null;

  const entry = liveEntry(memory().values.get(key));
  return entry ? (entry.value as T) : null;
}

async function fallbackSet(key: string, value: unknown, ttlSeconds?: number) {
  const redis = redisClient();
  if (redis) {
    if (ttlSeconds) await redis.set(key, value, { ex: ttlSeconds });
    else await redis.set(key, value);
    return;
  }

  memory().values.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
  });
}

async function fallbackDel(key: string) {
  const redis = redisClient();
  if (redis) {
    await redis.del(key);
    return;
  }
  memory().values.delete(key);
  memory().lists.delete(key);
}

async function fallbackIncr(key: string, ttlSeconds: number): Promise<number> {
  const redis = redisClient();
  if (redis) {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, ttlSeconds);
    return count;
  }

  const entry = liveEntry(memory().values.get(key));
  const current = typeof entry?.value === "number" ? entry.value : 0;
  const next = current + 1;
  memory().values.set(key, {
    value: next,
    expiresAt: entry?.expiresAt ?? Date.now() + ttlSeconds * 1000,
  });
  return next;
}

async function fallbackLpush(key: string, value: unknown, maxLength = 60) {
  const redis = redisClient();
  if (redis) {
    await redis.lpush(key, value);
    await redis.ltrim(key, 0, maxLength - 1);
    return;
  }

  const list = memory().lists.get(key) ?? [];
  list.unshift(value);
  memory().lists.set(key, list.slice(0, maxLength));
}

async function fallbackLrange<T>(key: string, start = 0, stop = 59): Promise<T[]> {
  const redis = redisClient();
  if (redis) return (await redis.lrange<T>(key, start, stop)) ?? [];

  const list = memory().lists.get(key) ?? [];
  return list.slice(start, stop + 1) as T[];
}

export async function storeGet<T>(key: string): Promise<T | null> {
  return viaMongo(async (db) => {
    const collection = db.collection<KeyValueDoc>("key_values");
    const doc = await collection.findOne({ _id: key });
    if (!doc) return null;
    if (doc.expiresAt && doc.expiresAt.getTime() <= Date.now()) {
      await collection.deleteOne({ _id: key });
      return null;
    }
    return (doc.value ?? null) as T | null;
  }, () => fallbackGet<T>(key));
}

export async function storeSet(key: string, value: unknown, ttlSeconds?: number) {
  return viaMongo(async (db) => {
    const update = {
      $set: {
        value,
        updatedAt: new Date(),
        ...(ttlSeconds ? { expiresAt: new Date(Date.now() + ttlSeconds * 1000) } : {}),
      },
      ...(ttlSeconds ? {} : { $unset: { expiresAt: 1 as const } }),
    };
    await db
      .collection<KeyValueDoc>("key_values")
      .updateOne({ _id: key }, update, { upsert: true });
  }, () => fallbackSet(key, value, ttlSeconds));
}

export async function storeDel(key: string) {
  return viaMongo(async (db) => {
    await Promise.all([
      db.collection<KeyValueDoc>("key_values").deleteOne({ _id: key }),
      db.collection<ListDoc>("lists").deleteOne({ _id: key }),
    ]);
  }, () => fallbackDel(key));
}

export async function storeIncr(key: string, ttlSeconds: number): Promise<number> {
  return viaMongo(async (db) => {
    const collection = db.collection<CounterDoc>("counters");
    const now = new Date();
    const existing = await collection.findOne({ _id: key });
    if (existing && existing.expiresAt.getTime() <= now.getTime()) {
      await collection.deleteOne({ _id: key });
    }

    const updated = await collection.findOneAndUpdate(
      { _id: key },
      {
        $inc: { count: 1 },
        $setOnInsert: {
          expiresAt: new Date(now.getTime() + ttlSeconds * 1000),
        },
        $set: { updatedAt: now },
      },
      { upsert: true, returnDocument: "after" },
    );

    return updated?.count ?? 1;
  }, () => fallbackIncr(key, ttlSeconds));
}

export async function storeLpush(key: string, value: unknown, maxLength = 60) {
  return viaMongo(async (db) => {
    await db.collection<ListDoc>("lists").updateOne(
      { _id: key },
      {
        $push: {
          items: {
            $each: [value],
            $position: 0,
            $slice: maxLength,
          },
        },
        $set: { updatedAt: new Date() },
      },
      { upsert: true },
    );
  }, () => fallbackLpush(key, value, maxLength));
}

export async function storeLrange<T>(key: string, start = 0, stop = 59): Promise<T[]> {
  return viaMongo(async (db) => {
    const doc = await db.collection<ListDoc>("lists").findOne(
      { _id: key },
      { projection: { items: { $slice: [start, Math.max(1, stop - start + 1)] } } },
    );
    return (doc?.items ?? []) as T[];
  }, () => fallbackLrange<T>(key, start, stop));
}
