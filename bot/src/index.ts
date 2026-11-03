import "./env.js";
import { readFileSync } from "node:fs";
import type { Server } from "node:http";
import {
  Client,
  Events,
  GatewayIntentBits,
  type Client as DiscordClient,
} from "discord.js";
import { loadConfig } from "./config.js";
import { CooldownStore } from "./cooldowns.js";
import { handleInteraction } from "./interactions/handler.js";
import { loadCommands } from "./load-commands.js";
import { Logger, serializeError } from "./logger.js";
import { HeartbeatService } from "./services/heartbeat.js";
import { startHealthServer, stopHealthServer } from "./services/health.js";
import { PresenceService } from "./services/presence.js";
import { BotState } from "./state.js";
import { TicketLedger } from "./tickets/ledger.js";
import { TicketService } from "./tickets/service.js";
import { CommandSyncer } from "./services/command-sync.js";
import type { BotContext } from "./types.js";
import { validateGuildConfiguration } from "./validate.js";

function readVersion(): string {
  try {
    const raw = readFileSync(new URL("../package.json", import.meta.url), "utf8");
    const parsed = JSON.parse(raw) as { version?: unknown };
    return typeof parsed.version === "string" ? parsed.version : "0.0.0";
  } catch {
    return "0.0.0";
  }
}

async function main(): Promise<void> {
  const logger = new Logger("bot");
  const loaded = (() => {
    try {
      return loadConfig();
    } catch (error) {
      logger.error("Configuration error", {
        message: error instanceof Error ? error.message : String(error),
      });
      process.exitCode = 1;
      return null;
    }
  })();

  if (!loaded) {
    return;
  }

  for (const warning of loaded.warnings) {
    logger.warn(warning);
  }

  const { config } = loaded;
  const version = readVersion();
  logger.info("Starting Wrightyard bot", {
    version,
    node: process.version,
    environment: config.nodeEnv,
  });

  const state = new BotState();
  const cooldowns = new CooldownStore();
  const client: DiscordClient = new Client({
    intents: [GatewayIntentBits.Guilds],
    allowedMentions: { parse: [] },
  });

  const commands = await loadCommands(new URL("./commands/", import.meta.url));
  logger.info("Commands loaded", { count: commands.size, commands: [...commands.keys()] });

  const presence = new PresenceService(client, config, state, logger.child("presence"));
  const ledger = new TicketLedger({
    uri: config.mongoUri,
    dbName: config.mongoDb,
    logger: logger.child("ledger"),
  });
  if (!ledger.configured) {
    logger.info("Durable ticket ledger is disabled; Discord channel topics remain the recovery source.");
  }
  const tickets = new TicketService({
    client,
    config,
    state,
    cooldowns,
    ledger,
    logger: logger.child("tickets"),
  });
  const syncer = new CommandSyncer(client, config.guildId, commands, logger.child("commands"));
  const heartbeat = new HeartbeatService({
    client,
    config,
    state,
    presence,
    tickets,
    logger: logger.child("heartbeat"),
    version,
    syncCommands: () => syncer.sync("heartbeat"),
  });

  const context: BotContext = {
    client,
    config,
    logger,
    state,
    cooldowns,
    presence,
    heartbeat,
    tickets,
    syncer,
    commands,
    version,
    startedAt: state.startedAt,
  };

  let healthServer: Server | null = await startHealthServer({
    port: config.port,
    client,
    state,
    version,
    logger: logger.child("health"),
  });

  let shuttingDown = false;

  const shutdown = async (signal: string, code = 0): Promise<void> => {
    if (shuttingDown) {
      process.exit(code || 1);
    }
    shuttingDown = true;
    logger.info("Shutting down", { signal });

    const force = setTimeout(() => {
      logger.error("Forced shutdown after timeout.");
      process.exit(1);
    }, 10_000);
    force.unref();

    try {
      heartbeat.stop();
      presence.stop();
      if (healthServer) {
        await stopHealthServer(healthServer);
        healthServer = null;
      }
      await ledger.close();
      await client.destroy();
    } catch (error) {
      logger.error("Shutdown cleanup failed", { error: serializeError(error) });
    }

    clearTimeout(force);
    logger.info("Shutdown complete");
    process.exit(code);
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection", { error: serializeError(reason) });
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", { error: serializeError(error) });
    void shutdown("uncaughtException", 1);
  });

  client.on(Events.Error, (error) => {
    logger.error("Gateway error", { error: serializeError(error) });
  });

  client.on(Events.Warn, (message) => {
    logger.warn("Gateway warning", { message });
  });

  client.on(Events.InteractionCreate, (interaction) => {
    void handleInteraction(interaction, context);
  });

  client.on(Events.ChannelDelete, (channel) => {
    void tickets.handleChannelDelete(channel.id).catch((error: unknown) => {
      logger.warn("Ticket channel cleanup failed", { channelId: channel.id, error: serializeError(error) });
    });
  });

  client.once(Events.ClientReady, (readyClient) => {
    void (async () => {
      logger.info("Gateway ready", {
        user: readyClient.user.tag,
        userId: readyClient.user.id,
        guilds: readyClient.guilds.cache.size,
      });

      await validateGuildConfiguration(readyClient, config, logger);

      try {
        await tickets.initialize();
      } catch (error) {
        logger.error("Ticket ledger rehydration failed", { error: serializeError(error) });
      }

      presence.start();
      heartbeat.start();
    })().catch((error: unknown) => {
      logger.error("Ready handler failed", { error: serializeError(error) });
    });
  });

  try {
    await client.login(config.token);
  } catch (error) {
    logger.error("Login failed. Check DISCORD_TOKEN and the application's gateway intents.", {
      error: serializeError(error),
    });
    await shutdown("login-failed", 1);
  }
}

main().catch((error: unknown) => {
  const logger = new Logger("bot");
  logger.error("Fatal startup error", { error: serializeError(error) });
  process.exitCode = 1;
});
