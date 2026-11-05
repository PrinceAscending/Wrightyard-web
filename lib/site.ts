export const site = {
  name: "Wrightyard",
  version: "1.1.0",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Wrightyard is a software studio for Discord and Telegram bots, websites, and managed hosting. Scoped in writing, built by hand, kept running.",
  invite: "https://discord.gg/6m6e5aFkyh",
  guildId: "1566778873985892442",
  rulesChannelId: "1566786873269952562",
  rolesChannelId: "1566786883676147792",
  commandsChannelId: "1567494689941102672",
  nav: [
    { label: "Work", href: "/#work" },
    { label: "Services", href: "/#services" },
    { label: "Process", href: "/#process" },
    { label: "Rates", href: "/#rates" },
    { label: "Yard", href: "/#yard" },
  ],
  facts: [
    { label: "Studio", value: "Wrightyard" },
    { label: "Est.", value: "2026" },
    { label: "Status", value: "Taking work" },
    { label: "Based", value: "Online" },
  ],
  levelRoles: [
    { level: 5, name: "Apprentice", xp: "500 XP" },
    { level: 15, name: "Journeyman", xp: "4,500 XP" },
    { level: 30, name: "Craftsman", xp: "18,000 XP" },
    { level: 50, name: "Master", xp: "50,000 XP" },
  ],
};

export function channelUrl(channelId: string): string {
  return `https://discord.com/channels/${site.guildId}/${channelId}`;
}
