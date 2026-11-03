import "server-only";
import type { WithId } from "mongodb";
import { getMongoDb, mongoConfigured } from "@/lib/mongo";

export type TicketStatus = "open" | "closed" | "deleted";

type TicketDoc = {
  _id: string;
  guildId: string;
  number: number;
  openerId: string;
  openerTag: string | null;
  claimedById: string | null;
  status: TicketStatus;
  channelName: string | null;
  openedAt: Date;
  closedAt: Date | null;
  closedById: string | null;
  deletedAt: Date | null;
  deletedById: string | null;
  updatedAt: Date;
};

export type Ticket = {
  channelId: string;
  guildId: string;
  number: number;
  openerId: string;
  openerTag: string | null;
  claimedById: string | null;
  status: TicketStatus;
  channelName: string | null;
  openedAt: string;
  closedAt: string | null;
  closedById: string | null;
  deletedAt: string | null;
  deletedById: string | null;
  updatedAt: string;
};

export type TicketStats = {
  total: number;
  open: number;
  closed: number;
  deleted: number;
  recent: number;
};

function collection() {
  return getMongoDb().then((db) => db.collection<TicketDoc>("tickets"));
}

function present(doc: WithId<TicketDoc>): Ticket {
  return {
    channelId: doc._id,
    guildId: doc.guildId,
    number: doc.number,
    openerId: doc.openerId,
    openerTag: doc.openerTag,
    claimedById: doc.claimedById,
    status: doc.status,
    channelName: doc.channelName,
    openedAt: doc.openedAt.toISOString(),
    closedAt: doc.closedAt?.toISOString() ?? null,
    closedById: doc.closedById,
    deletedAt: doc.deletedAt?.toISOString() ?? null,
    deletedById: doc.deletedById,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function listTickets(limit = 30): Promise<Ticket[]> {
  if (!mongoConfigured()) return [];
  const tickets = await collection();
  const docs = await tickets.find({}).sort({ openedAt: -1 }).limit(limit).toArray();
  return docs.map(present);
}

export async function listTicketsForUser(userId: string, limit = 6): Promise<Ticket[]> {
  if (!mongoConfigured()) return [];
  const tickets = await collection();
  const docs = await tickets
    .find({ openerId: userId })
    .sort({ openedAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(present);
}

export async function getTicketStats(): Promise<TicketStats> {
  if (!mongoConfigured()) {
    return { total: 0, open: 0, closed: 0, deleted: 0, recent: 0 };
  }

  const tickets = await collection();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [total, open, closed, deleted, recent] = await Promise.all([
    tickets.countDocuments({}),
    tickets.countDocuments({ status: "open" }),
    tickets.countDocuments({ status: "closed" }),
    tickets.countDocuments({ status: "deleted" }),
    tickets.countDocuments({ openedAt: { $gte: weekAgo } }),
  ]);

  return { total, open, closed, deleted, recent };
}
