import { db } from "@/db";
import { auditLogs, type NewAuditLog } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function createAuditLog(params: {
  entityType: "prescription" | "queue";
  entityId: string;
  action: "STATUS_CHANGE" | "CREATE" | "NOTE_UPDATE" | "PRINT_LABEL" | "CLASSIFICATION_CHANGE";
  fromStatus?: string | null;
  toStatus?: string | null;
  actor?: string;
  notes?: string | null;
}) {
  const newLog: NewAuditLog = {
    id: `aud_${nanoid(10)}`,
    entityType: params.entityType,
    entityId: params.entityId,
    action: params.action,
    fromStatus: params.fromStatus || null,
    toStatus: params.toStatus || null,
    actor: params.actor || "Staff Farmasi",
    notes: params.notes || null,
    createdAt: new Date(),
  };

  await db.insert(auditLogs).values(newLog);
  return newLog;
}

export async function getAuditLogsForEntity(entityId: string) {
  return db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.entityId, entityId))
    .orderBy(desc(auditLogs.createdAt));
}
