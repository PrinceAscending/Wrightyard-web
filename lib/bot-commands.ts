export const publicCommands = [
  {
    name: "/status",
    description: "Bot uptime, websocket ping, members, tickets, and the live site link.",
    scope: "Everyone",
  },
  {
    name: "/stats",
    description: "The yard's member count, channels, roles, boosts, and age.",
    scope: "Everyone",
  },
  {
    name: "/site",
    description: "Links to the studio, dashboard, status page, and Discord.",
    scope: "Everyone",
  },
  {
    name: "/rank",
    description: "Your level, XP progress, message count, and standing.",
    scope: "Everyone",
  },
  {
    name: "/leaderboard",
    description: "The top ten of the yard XP ledger.",
    scope: "Everyone",
  },
  {
    name: "/ask",
    description: "Ask the yard about the studio, services, or process.",
    scope: "Everyone",
  },
  {
    name: "/brief",
    description: "Turn a rough idea into a private project brief.",
    scope: "Everyone",
  },
  {
    name: "/help",
    description: "The command index, written for humans.",
    scope: "Everyone",
  },
  {
    name: "/ticket",
    description: "Open a private ticket with the crew.",
    scope: "Everyone",
  },
];

export const ownerCommands = [
  {
    name: "/admin status",
    description: "Private detailed runtime, memory, heartbeat, and ticket status.",
  },
  {
    name: "/admin announce",
    description: "Post a branded announcement to the front desk.",
  },
  {
    name: "/admin presence",
    description: "Set the bot's rich presence text and online state.",
  },
  {
    name: "/admin maintenance",
    description: "Put the yard into maintenance mode and pause ticket opening.",
  },
  {
    name: "/admin sync",
    description: "Re-register the slash command set immediately.",
  },
  {
    name: "/admin ticketpanel",
    description: "Post the ticket panel in #open-a-ticket.",
  },
];
