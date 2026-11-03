import "server-only";
import { storeLpush, storeLrange } from "@/lib/store";

export type AuditEntry = {
  at: string;
  actorId: string;
  action: string;
  summary: string;
};

const AUDIT_KEY = "admin:audit";

export async function recordAudit(actorId: string, action: string, summary: string) {
  const entry: AuditEntry = {
    at: new Date().toISOString(),
    actorId,
    action,
    summary: summary.slice(0, 240),
  };
  await storeLpush(AUDIT_KEY, entry, 50);
}

export async function getAuditLog(limit = 12) {
  return storeLrange<AuditEntry>(AUDIT_KEY, 0, Math.max(0, limit - 1));
}
