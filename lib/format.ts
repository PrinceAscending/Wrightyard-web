export function formatUptime(seconds: number) {
  if (!seconds || seconds < 1) return "—";
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatClock(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toISOString().slice(11, 19)} UTC`;
}

export function formatDate(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toISOString().slice(0, 10);
}

export function formatPing(ping: number) {
  if (!ping) return "—";
  return `${Math.round(ping)}ms`;
}

export function durationSince(iso: string | null) {
  if (!iso) return "—";
  const started = new Date(iso).getTime();
  if (Number.isNaN(started)) return "—";
  return formatUptime(Math.max(0, Math.round((Date.now() - started) / 1000)));
}
