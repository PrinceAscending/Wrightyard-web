export const briefServices = [
  "Discord bot",
  "Telegram bot",
  "Website",
  "Managed hosting",
  "Not sure yet",
] as const;

export const briefTimelines = ["Now", "This month", "Exploring"] as const;

export const briefStatuses = ["new", "reviewing", "quoted", "won", "archived"] as const;

export type BriefService = (typeof briefServices)[number];
export type BriefTimeline = (typeof briefTimelines)[number];
export type BriefStatus = (typeof briefStatuses)[number];

export const briefStatusLabels: Record<BriefStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  quoted: "Quoted",
  won: "Won",
  archived: "Archived",
};
