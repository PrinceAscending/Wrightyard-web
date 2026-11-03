export const site = {
  name: "Wrightyard",
  version: "1.0.0",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Wrightyard is a software studio for Discord and Telegram bots, websites, and managed hosting. Scoped in writing, built by hand, kept running.",
  invite: "https://discord.gg/6m6e5aFkyh",
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
};
