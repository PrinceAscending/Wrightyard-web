import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type Guild,
} from "discord.js";
import { BRAND, siteUrl } from "../brand.js";
import { formatCount, formatDuration, formatTimestamp } from "../format.js";

export interface StatusView {
  readonly maintenance: boolean;
  readonly uptimeSeconds: number;
  readonly ping: number;
  readonly memberCount: number;
  readonly openTickets: number;
  readonly commandsServed: number;
}

export function buildStatusEmbed(status: StatusView): EmbedBuilder {
  const ping = status.ping >= 0 ? `${Math.round(status.ping)} ms` : "—";

  return new EmbedBuilder()
    .setAuthor({ name: "WRIGHTYARD / THE YARD" })
    .setTitle(status.maintenance ? "The yard is closed for maintenance." : "The yard is open.")
    .setDescription(
      status.maintenance
        ? "The machinery is being tended. The gate is shut until the work is done; the lights come back on shortly."
        : "Software, built here. Kept running. A live reading from the yard, taken at the moment you asked.",
    )
    .setColor(status.maintenance ? BRAND.colors.red : BRAND.colors.blue)
    .addFields(
      {
        name: "State",
        value: status.maintenance ? "Maintenance" : "Online",
        inline: true,
      },
      { name: "Gateway", value: ping, inline: true },
      { name: "Uptime", value: formatDuration(status.uptimeSeconds), inline: true },
      { name: "In the yard", value: `${formatCount(status.memberCount)} members`, inline: true },
      { name: "Open tickets", value: formatCount(status.openTickets), inline: true },
      { name: "Commands served", value: formatCount(status.commandsServed), inline: true },
    )
    .setFooter({ text: BRAND.footer })
    .setTimestamp();
}

export function siteButtonRows(base: string | null): ActionRowBuilder<ButtonBuilder>[] {
  const site = siteUrl(base);
  const dashboard = siteUrl(base, BRAND.paths.dashboard);
  const status = siteUrl(base, BRAND.paths.status);

  const buttons: ButtonBuilder[] = [];
  if (site) {
    buttons.push(new ButtonBuilder().setLabel("Website").setStyle(ButtonStyle.Link).setURL(site));
  }
  if (dashboard) {
    buttons.push(new ButtonBuilder().setLabel("Dashboard").setStyle(ButtonStyle.Link).setURL(dashboard));
  }
  if (status) {
    buttons.push(new ButtonBuilder().setLabel("Status page").setStyle(ButtonStyle.Link).setURL(status));
  }

  if (buttons.length === 0) {
    return [];
  }

  return [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)];
}

export interface StatsView {
  readonly guild: Guild;
  readonly presenceCount: number | null;
  readonly openTickets: number;
}

export function buildStatsEmbed(view: StatsView): EmbedBuilder {
  const { guild } = view;
  const boosts = guild.premiumSubscriptionCount ?? 0;
  const members =
    view.presenceCount === null
      ? `${formatCount(guild.memberCount)} on the books`
      : `${formatCount(guild.memberCount)} on the books · ${formatCount(view.presenceCount)} around now`;

  return new EmbedBuilder()
    .setAuthor({ name: "WRIGHTYARD / THE LEDGER" })
    .setTitle("The yard, by the numbers.")
    .setDescription("A reading from the ledger: who is here, what is open, and how long the lights have been on.")
    .setColor(BRAND.colors.brass)
    .addFields(
      { name: "Members", value: members, inline: false },
      { name: "Channels", value: formatCount(guild.channels.cache.size), inline: true },
      { name: "Roles", value: formatCount(guild.roles.cache.size), inline: true },
      { name: "Boosts", value: `${formatCount(boosts)} · Tier ${guild.premiumTier}`, inline: true },
      { name: "Established", value: formatTimestamp(guild.createdAt, "D"), inline: true },
      { name: "Open tickets", value: formatCount(view.openTickets), inline: true },
    )
    .setFooter({ text: BRAND.footer })
    .setTimestamp();
}

export function buildHelpEmbed(isOwner: boolean): EmbedBuilder {
  const yard = [
    "**/status** — a live reading from the yard.",
    "**/stats** — the ledger: members, rooms, roles, boosts.",
    "**/site** — the studio, dashboard, and status page.",
    "**/help** — this index.",
  ].join("\n");

  const bench = [
    "**/ask** — ask the yard about the studio, services, or process.",
    "**/brief** — turn a rough idea into a short project brief.",
    "AI answers are drafts. A person confirms the details.",
  ].join("\n");

  const gate = [
    "**/ticket** — open a private room with the studio.",
    "The public door lives in the ticket channel; one ticket at a time.",
  ].join("\n");

  const embed = new EmbedBuilder()
    .setAuthor({ name: "WRIGHTYARD / THE INDEX" })
    .setTitle("The yard, in brief.")
    .setDescription("Everything the bot can do, kept short. The gate is staffed when the studio is awake.")
    .setColor(BRAND.colors.ink)
    .addFields(
      { name: "The Yard", value: yard },
      { name: "The Bench", value: bench },
      { name: "The Gate", value: gate },
    )
    .setFooter({ text: BRAND.footer })
    .setTimestamp();

  if (isOwner) {
    embed.addFields({
      name: "Owner only",
      value: [
        "**/admin status** — private process and heartbeat readings.",
        "**/admin announce** — post a notice in the announcements channel.",
        "**/admin presence** — set a local presence override.",
        "**/admin maintenance** — shut the gate and mark the yard idle.",
        "**/admin sync** — re-register commands in this guild.",
        "**/admin ticketpanel** — repost the ticket panel.",
      ].join("\n"),
    });
  }

  return embed;
}

export function buildSiteEmbed(base: string): EmbedBuilder {
  return new EmbedBuilder()
    .setAuthor({ name: "WRIGHTYARD / ELSEWHERE" })
    .setTitle("The same work, on the web.")
    .setDescription(
      "The site carries the full register: what we build, how a job is scoped, and what it costs. The dashboard and status page keep the lights honest.",
    )
    .setColor(BRAND.colors.brass)
    .addFields(
      { name: "The studio", value: base, inline: false },
      { name: "The lights", value: "Uptime, gateway health, and the current state of the yard.", inline: false },
    )
    .setFooter({ text: BRAND.footer })
    .setTimestamp();
}
