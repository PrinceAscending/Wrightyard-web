import "server-only";
import { randomUUID } from "node:crypto";
import { getMongoDb, mongoConfigured } from "@/lib/mongo";

type DispatchDoc = {
  _id: string;
  title: string;
  message: string;
  messageId: string;
  channelId: string;
  actorId: string;
  sentAt: Date;
};

export type Dispatch = {
  id: string;
  title: string;
  message: string;
  messageId: string;
  sentAt: string;
};

function collection() {
  return getMongoDb().then((db) => db.collection<DispatchDoc>("announcements"));
}

function present(doc: DispatchDoc): Dispatch {
  return {
    id: doc._id,
    title: doc.title,
    message: doc.message,
    messageId: doc.messageId,
    sentAt: doc.sentAt.toISOString(),
  };
}

export async function saveDispatch(input: {
  title: string;
  message: string;
  messageId: string;
  channelId: string;
  actorId: string;
}): Promise<Dispatch> {
  if (!mongoConfigured()) {
    throw new Error("MongoDB is not configured.");
  }

  const doc: DispatchDoc = {
    _id: randomUUID(),
    title: input.title,
    message: input.message,
    messageId: input.messageId,
    channelId: input.channelId,
    actorId: input.actorId,
    sentAt: new Date(),
  };

  const dispatches = await collection();
  await dispatches.insertOne(doc);
  return present(doc);
}

export async function listDispatches(limit = 24): Promise<Dispatch[]> {
  if (!mongoConfigured()) return [];
  const dispatches = await collection();
  const docs = await dispatches.find({}).sort({ sentAt: -1 }).limit(limit).toArray();
  return docs.map(present);
}
