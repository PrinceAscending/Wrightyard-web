import "server-only";
import { z } from "zod";

const guildSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  approximate_member_count: z.number().optional(),
  approximate_presence_count: z.number().optional(),
  premium_subscription_count: z.number().optional(),
  premium_tier: z.number().optional(),
});

export type GuildSnapshot = {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  memberCount: number;
  presenceCount: number;
  boosts: number;
  tier: number;
  channels: number;
  roles: number;
  fetchedAt: number;
};

type CachedGuild = {
  data: GuildSnapshot;
  fetchedAt: number;
};

const GUILD_CACHE_KEY = "discord:guild-snapshot";
const GUILD_CACHE_TTL = 60;

function token() {
  return process.env.DISCORD_TOKEN;
}

function guildId() {
  return process.env.DISCORD_GUILD_ID;
}

export function discordConfigured() {
  return Boolean(token() && guildId());
}

async function discordFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const authToken = token();
  if (!authToken) throw new Error("DISCORD_TOKEN is not configured.");

  const response = await fetch(`https://discord.com/api/v10${path}`, {
    ...init,
    headers: {
      Authorization: `Bot ${authToken}`,
      "User-Agent": "WrightyardSite/1.0",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });

  if (response.status === 429) {
    const body = (await response.json().catch(() => null)) as { retry_after?: number } | null;
    const wait = Math.min(Math.max((body?.retry_after ?? 1) * 1000, 250), 5_000);
    await new Promise((resolve) => setTimeout(resolve, wait));
    return discordFetch<T>(path, init);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Discord API ${response.status}: ${text.slice(0, 240)}`);
  }

  return (await response.json()) as T;
}

export async function getGuildSnapshot(): Promise<GuildSnapshot | null> {
  if (!discordConfigured()) return null;

  const cached = await import("./store").then((mod) =>
    mod.storeGet<CachedGuild>(GUILD_CACHE_KEY),
  );

  if (cached && Date.now() - cached.fetchedAt < GUILD_CACHE_TTL * 1000) {
    return cached.data;
  }

  try {
    const id = guildId()!;
    const [guild, channels, roles] = await Promise.all([
      discordFetch<unknown>(`/guilds/${id}?with_counts=true`),
      discordFetch<unknown[]>(`/guilds/${id}/channels`),
      discordFetch<unknown[]>(`/guilds/${id}/roles`),
    ]);
    const parsed = guildSchema.parse(guild);
    const snapshot: GuildSnapshot = {
      id: parsed.id,
      name: parsed.name,
      icon: parsed.icon ?? null,
      description: parsed.description ?? null,
      memberCount: parsed.approximate_member_count ?? 0,
      presenceCount: parsed.approximate_presence_count ?? 0,
      boosts: parsed.premium_subscription_count ?? 0,
      tier: parsed.premium_tier ?? 0,
      channels: channels.length,
      roles: roles.length,
      fetchedAt: Date.now(),
    };
    await import("./store").then((mod) =>
      mod.storeSet(GUILD_CACHE_KEY, { data: snapshot, fetchedAt: Date.now() }, 180),
    );
    return snapshot;
  } catch (error) {
    console.error("[discord] guild snapshot failed", error);
    return cached?.data ?? null;
  }
}

const memberSchema = z.object({
  nick: z.string().nullable().optional(),
  joined_at: z.string(),
  roles: z.array(z.string()),
});

export type GuildMember = {
  nick: string | null;
  joinedAt: string;
  roles: string[];
};

export async function getGuildMember(userId: string): Promise<GuildMember | null> {
  if (!discordConfigured()) return null;
  try {
    const member = await discordFetch<unknown>(
      `/guilds/${guildId()}/members/${encodeURIComponent(userId)}`,
    );
    const parsed = memberSchema.parse(member);
    return {
      nick: parsed.nick ?? null,
      joinedAt: parsed.joined_at,
      roles: parsed.roles,
    };
  } catch {
    return null;
  }
}

export async function getGuildRoles() {
  if (!discordConfigured()) return [];
  try {
    const roles = await discordFetch<Array<{ id: string; name: string; color: number }>>(
      `/guilds/${guildId()}/roles`,
    );
    return roles;
  } catch {
    return [];
  }
}

export async function sendAnnouncement(title: string, message: string) {
  const channelId = process.env.ANNOUNCEMENTS_CHANNEL_ID;
  if (!channelId) throw new Error("ANNOUNCEMENTS_CHANNEL_ID is not configured.");

  return discordFetch<{ id: string; channel_id: string }>(
    `/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        allowed_mentions: { parse: [] },
        embeds: [
          {
            title: title.slice(0, 100),
            description: message.slice(0, 1800),
            color: 0xc33a2c,
            author: {
              name: "WRIGHTYARD",
              icon_url: "https://cdn.discordapp.com/icons/1566778873985892442/d1699d0c3b91045a9c20f2c60cd56264.png?size=128",
            },
            footer: { text: "Built here. Kept running." },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    },
  );
}
