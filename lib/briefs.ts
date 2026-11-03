import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import type { WithId } from "mongodb";
import { getMongoDb, mongoConfigured } from "@/lib/mongo";
import type {
  BriefService,
  BriefStatus,
  BriefTimeline,
} from "@/lib/brief-options";

type BriefDoc = {
  _id: string;
  reference: string;
  name: string;
  contact: string;
  service: BriefService;
  timeline: BriefTimeline;
  notes: string;
  status: BriefStatus;
  userId: string | null;
  username: string | null;
  source: "site";
  createdAt: Date;
  updatedAt: Date;
};

export type Brief = {
  id: string;
  reference: string;
  name: string;
  contact: string;
  service: BriefService;
  timeline: BriefTimeline;
  notes: string;
  status: BriefStatus;
  userId: string | null;
  username: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BriefStats = Record<BriefStatus, number> & { total: number };

export type NewBrief = {
  name: string;
  contact: string;
  service: BriefService;
  timeline: BriefTimeline;
  notes: string;
  userId: string | null;
  username: string | null;
};

function collection() {
  return getMongoDb().then((db) => db.collection<BriefDoc>("briefs"));
}

function reference() {
  const year = new Date().getUTCFullYear().toString().slice(-2);
  return `WY-${year}-${randomBytes(2).toString("hex").toUpperCase()}`;
}

function present(doc: WithId<BriefDoc>): Brief {
  return {
    id: doc._id,
    reference: doc.reference,
    name: doc.name,
    contact: doc.contact,
    service: doc.service,
    timeline: doc.timeline,
    notes: doc.notes,
    status: doc.status,
    userId: doc.userId,
    username: doc.username,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function briefsConfigured() {
  return mongoConfigured();
}

export async function createBrief(input: NewBrief): Promise<Brief> {
  if (!mongoConfigured()) {
    throw new Error("The job book is not connected.");
  }

  const now = new Date();
  const doc: BriefDoc = {
    _id: randomUUID(),
    reference: reference(),
    name: input.name,
    contact: input.contact,
    service: input.service,
    timeline: input.timeline,
    notes: input.notes,
    status: "new",
    userId: input.userId,
    username: input.username,
    source: "site",
    createdAt: now,
    updatedAt: now,
  };

  const briefs = await collection();
  await briefs.insertOne(doc);
  return present(doc);
}

export async function listBriefs(limit = 40): Promise<Brief[]> {
  if (!mongoConfigured()) return [];
  const briefs = await collection();
  const docs = await briefs.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  return docs.map(present);
}

export async function listBriefsForUser(userId: string, limit = 5): Promise<Brief[]> {
  if (!mongoConfigured()) return [];
  const briefs = await collection();
  const docs = await briefs
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(present);
}

export async function getBriefStats(): Promise<BriefStats> {
  const stats: BriefStats = {
    total: 0,
    new: 0,
    reviewing: 0,
    quoted: 0,
    won: 0,
    archived: 0,
  };
  if (!mongoConfigured()) return stats;

  const briefs = await collection();
  const rows = await briefs
    .aggregate<{ _id: BriefStatus; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])
    .toArray();

  for (const row of rows) {
    if (row._id in stats) {
      stats[row._id] = row.count;
      stats.total += row.count;
    }
  }
  return stats;
}

export async function setBriefStatus(id: string, status: BriefStatus): Promise<Brief | null> {
  const briefs = await collection();
  const doc = await briefs.findOneAndUpdate(
    { _id: id },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  return doc ? present(doc) : null;
}
