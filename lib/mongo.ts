import "server-only";
import { MongoClient, type Db } from "mongodb";

type MongoCache = {
  client: MongoClient;
  db: Promise<Db>;
};

const globalForMongo = globalThis as typeof globalThis & {
  __wrightyardMongo?: MongoCache;
};

let indexPromise: Promise<void> | null = null;

function databaseName() {
  return process.env.MONGODB_DB?.trim() || "wrightyard";
}

export function mongoConfigured() {
  return Boolean(process.env.MONGODB_URI?.trim());
}

function createCache(): MongoCache {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const client = new MongoClient(uri, {
    appName: "Wrightyard",
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 8_000,
    connectTimeoutMS: 8_000,
    retryWrites: true,
  });

  const db = client.connect().then(() => client.db(databaseName()));
  return { client, db };
}

/**
 * Vercel and the bot both reconnect often. Cache the client on globalThis so
 * hot reload and serverless invocations reuse the same pool.
 */
export async function getMongoDb(): Promise<Db> {
  if (!globalForMongo.__wrightyardMongo) {
    globalForMongo.__wrightyardMongo = createCache();
  }

  const cache = globalForMongo.__wrightyardMongo;

  try {
    const db = await cache.db;
    await ensureMongoIndexes(db);
    return db;
  } catch (error) {
    globalForMongo.__wrightyardMongo = undefined;
    await cache.client.close().catch(() => undefined);
    throw error;
  }
}

export function ensureMongoIndexes(db: Db) {
  indexPromise ??= (async () => {
    await Promise.all([
      db
        .collection("key_values")
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "ttl_key_values" }),
      db
        .collection("counters")
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "ttl_counters" }),
      db
        .collection("announcements")
        .createIndex({ sentAt: -1 }, { name: "announcements_recent" }),
      db.collection("briefs").createIndex({ createdAt: -1 }, { name: "briefs_recent" }),
      db
        .collection("briefs")
        .createIndex({ status: 1, createdAt: -1 }, { name: "briefs_status_recent" }),
      db.collection("tickets").createIndex({ openedAt: -1 }, { name: "tickets_recent" }),
      db
        .collection("tickets")
        .createIndex({ openerId: 1, openedAt: -1 }, { name: "tickets_opener_recent" }),
    ]);
  })().catch((error: unknown) => {
    indexPromise = null;
    throw error;
  });

  return indexPromise;
}
