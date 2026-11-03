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
    name: "/ticket",
    description: "Open a private ticket with the crew.",
    scope: "Everyone",
  },
  {
    name: "/site",
    description: "Links to the site, dashboard, and public status page.",
    scope: "Everyone",
  },
  {
    name: "/help",
    description: "The command index, written for humans.",
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
