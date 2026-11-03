import "server-only";
import { site } from "@/lib/site";
import {
  storeBackend,
  storeGet,
  storeLrange,
  type StoreBackend,
} from "@/lib/store";
import { discordConfigured, getGuildSnapshot, type GuildSnapshot } from "@/lib/discord";

export type Heartbeat = {
  botId: string;
  version: string;
  startedAt: string;
  uptimeSeconds: number;
  ping: number;
  guilds: number;
  members: number;
  commandsServed: number;
  openTickets: number;
  presence: string;
  maintenance: boolean;
  memoryMb: number;
  lastCommandAt: string | null;
  receivedAt: number;
};

export type HistoryPoint = {
  t: number;
  ping: number;
  members: number;
};

export type ServiceStatus = "operational" | "degraded" | "offline" | "unknown";

export type ServiceRow = {
  name: string;
  status: ServiceStatus;
  detail: string;
};

export type StatusPayload = {
  generatedAt: string;
  overall: "operational" | "degraded" | "outage";
  site: {
    name: string;
    version: string;
    status: "operational";
  };
  bot: {
    online: boolean;
    stale: boolean;
    lastSeen: string | null;
    startedAt: string | null;
    uptimeSeconds: number;
    ping: number;
    guilds: number;
    members: number;
    commandsServed: number;
    openTickets: number;
    presence: string;
    maintenance: boolean;
    version: string | null;
    memoryMb: number;
  };
  guild: GuildSnapshot | null;
  services: ServiceRow[];
  history: HistoryPoint[];
  store: {
    durable: boolean;
    backend: StoreBackend;
  };
};

const HEARTBEAT_KEY = "bot:heartbeat";
const HISTORY_KEY = "bot:history";

export async function getStatus(): Promise<StatusPayload> {
  const [heartbeat, guild, historyRaw, maintenanceOverride] = await Promise.all([
    storeGet<Heartbeat>(HEARTBEAT_KEY).catch(() => null),
    getGuildSnapshot().catch(() => null),
    storeLrange<HistoryPoint>(HISTORY_KEY, 0, 59).catch(() => []),
    storeGet<boolean>("bot:maintenance").catch(() => null),
  ]);

  const now = Date.now();
  const age = heartbeat ? now - heartbeat.receivedAt : Infinity;
  const online = Boolean(heartbeat && age < 90_000);
  const stale = Boolean(heartbeat && !online);
  const maintenance = Boolean(maintenanceOverride ?? heartbeat?.maintenance ?? false);
  const history = [...historyRaw].sort((a, b) => a.t - b.t);
  const backend = storeBackend();
  const durable = backend !== "memory";
  const hasDiscord = discordConfigured();

  const services: ServiceRow[] = [
    {
      name: "Website",
      status: "operational",
      detail: "Vercel edge, static pages, signed APIs.",
    },
    {
      name: "Discord API",
      status: guild ? "operational" : hasDiscord ? "degraded" : "unknown",
      detail: guild
        ? `Connected to ${guild.name}`
        : hasDiscord
          ? "Bot credentials configured, guild snapshot unavailable."
          : "Bot credentials are not configured on this deployment.",
    },
    {
      name: "Bot gateway",
      status: online ? (maintenance ? "degraded" : "operational") : "offline",
      detail: online
        ? `Heartbeat received ${Math.max(1, Math.round(age / 1000))}s ago.`
        : stale
          ? "Heartbeat is stale. The gateway process may be restarting."
          : "Waiting for the first signed heartbeat.",
    },
    {
      name: "Live state",
      status: durable ? "operational" : "degraded",
      detail:
        backend === "mongodb"
          ? "MongoDB Atlas is keeping shared state across instances."
          : backend === "upstash"
            ? "Upstash Redis is keeping shared state across instances."
            : "In-memory fallback. Add MongoDB Atlas for durable multi-instance stats.",
    },
  ];

  const botOffline = services.some(
    (service) => service.name === "Bot gateway" && service.status === "offline",
  );
  const hasDegraded = services.some(
    (service) => service.status === "degraded" || service.status === "offline",
  );

  let overall: StatusPayload["overall"] = "operational";
  if (botOffline && !guild) overall = "outage";
  else if (hasDegraded) overall = "degraded";
  if (!guild && hasDiscord && overall === "operational") overall = "degraded";
  if (!hasDiscord && !heartbeat && overall === "operational") overall = "degraded";

  return {
    generatedAt: new Date(now).toISOString(),
    overall,
    site: {
      name: site.name,
      version: site.version,
      status: "operational",
    },
    bot: {
      online,
      stale,
      lastSeen: heartbeat ? new Date(heartbeat.receivedAt).toISOString() : null,
      startedAt: heartbeat?.startedAt ?? null,
      uptimeSeconds: heartbeat?.uptimeSeconds ?? 0,
      ping: heartbeat?.ping ?? 0,
      guilds: heartbeat?.guilds ?? 0,
      members: heartbeat?.members ?? guild?.memberCount ?? 0,
      commandsServed: heartbeat?.commandsServed ?? 0,
      openTickets: heartbeat?.openTickets ?? 0,
      presence: heartbeat?.presence ?? "Not connected",
      maintenance,
      version: heartbeat?.version ?? null,
      memoryMb: heartbeat?.memoryMb ?? 0,
    },
    guild,
    services,
    history,
    store: { durable, backend },
  };
}
