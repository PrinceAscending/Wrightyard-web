import { z } from "zod";
import {
  briefServices,
  briefStatuses,
  briefTimelines,
} from "@/lib/brief-options";

export const heartbeatInput = z.object({
  botId: z.string().min(1).max(32),
  version: z.string().min(1).max(32),
  startedAt: z.string().datetime(),
  uptimeSeconds: z.number().finite().nonnegative().max(31_536_000),
  ping: z.number().finite().nonnegative().max(60_000),
  guilds: z.number().int().nonnegative().max(1_000_000),
  members: z.number().int().nonnegative().max(100_000_000),
  commandsServed: z.number().int().nonnegative().max(1_000_000_000),
  openTickets: z.number().int().nonnegative().max(1_000_000),
  presence: z.string().max(160),
  maintenance: z.boolean(),
  memoryMb: z.number().finite().nonnegative().max(1_000_000),
  lastCommandAt: z.string().datetime().nullable(),
});

export const presenceInput = z.object({
  text: z.string().trim().min(1).max(128),
  status: z.enum(["online", "idle", "dnd", "invisible"]),
});

export const announcementInput = z.object({
  title: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1).max(1800),
});

export const maintenanceInput = z.object({
  enabled: z.boolean(),
});

export const briefInput = z.object({
  name: z.string().trim().min(2, "A name is required.").max(80),
  contact: z.string().trim().max(120).optional().default(""),
  service: z.enum(briefServices),
  timeline: z.enum(briefTimelines),
  notes: z.string().trim().min(10, "Tell us a little more.").max(2_000),
  trap: z.string().max(200).optional().default(""),
});

export const briefUpdateInput = z.object({
  id: z.string().uuid(),
  status: z.enum(briefStatuses),
});

export const discordUserSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
  global_name: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  discriminator: z.string().nullable().optional(),
});
