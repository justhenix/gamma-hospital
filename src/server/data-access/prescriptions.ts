import { db } from "@/db";
import {
  prescriptions,
  patients,
  prescriptionItems,
  queueEntries,
  auditLogs,
  type Prescription,
  type PrescriptionItem,
  type Patient,
  type QueueEntry,
} from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { createAuditLog } from "./audit";
import { ALLOWED_STATUS_TRANSITIONS, type PrescriptionStatus, type ClassificationType } from "@/lib/constants";

export interface PrescriptionListItem {
  id: string;
  prescriptionNumber: string;
  doctorName: string;
  department: string;
  status: PrescriptionStatus;
  classification: ClassificationType | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  patient: {
    id: string;
    mrn: string;
    name: string;
    birthDate: string;
    gender: string;
  };
  queueEntry: {
    id: string;
    queueCode: string;
    displayNumber: string;
    status: string;
  } | null;
  itemCounts: {
    total: number;
    ready: number;
    compounded: number;
  };
}

export async function getPrescriptionsList(
  statusFilter?: PrescriptionStatus | "ALL"
): Promise<PrescriptionListItem[]> {
  const query = db.query.prescriptions.findMany({
    where:
      statusFilter && statusFilter !== "ALL"
        ? eq(prescriptions.status, statusFilter)
        : undefined,
    with: {
      patient: true,
      queueEntry: true,
      items: true,
    },
    orderBy: [desc(prescriptions.createdAt)],
  });

  const rows = await query;

  return rows.map((row) => {
    const readyCount = row.items.filter((item) => item.type === "READY").length;
    const compoundedCount = row.items.filter((item) => item.type === "COMPOUNDED").length;

    return {
      id: row.id,
      prescriptionNumber: row.prescriptionNumber,
      doctorName: row.doctorName,
      department: row.department,
      status: row.status as PrescriptionStatus,
      classification: (row.classification as ClassificationType | null) || null,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      patient: {
        id: row.patient.id,
        mrn: row.patient.mrn,
        name: row.patient.name,
        birthDate: row.patient.birthDate,
        gender: row.patient.gender,
      },
      queueEntry: row.queueEntry
        ? {
            id: row.queueEntry.id,
            queueCode: row.queueEntry.queueCode,
            displayNumber: row.queueEntry.displayNumber,
            status: row.queueEntry.status,
          }
        : null,
      itemCounts: {
        total: row.items.length,
        ready: readyCount,
        compounded: compoundedCount,
      },
    };
  });
}

export async function getPrescriptionDetailById(id: string) {
  const prescription = await db.query.prescriptions.findFirst({
    where: eq(prescriptions.id, id),
    with: {
      patient: true,
      queueEntry: true,
      items: true,
    },
  });

  if (!prescription) return null;

  const auditHistory = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.entityId, id))
    .orderBy(desc(auditLogs.createdAt));

  return {
    ...prescription,
    status: prescription.status as PrescriptionStatus,
    auditHistory,
  };
}

export async function updatePrescriptionStatus(
  prescriptionId: string,
  newStatus: PrescriptionStatus,
  actor = "Staff Farmasi",
  notes?: string
) {
  const current = await db.query.prescriptions.findFirst({
    where: eq(prescriptions.id, prescriptionId),
    with: {
      queueEntry: true,
    },
  });

  if (!current) {
    throw new Error(`Prescription with ID ${prescriptionId} not found`);
  }

  const previousStatus = current.status as PrescriptionStatus;

  // Verify transition is permitted
  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[previousStatus] || [];
  if (!allowedTransitions.includes(newStatus) && previousStatus !== newStatus) {
    throw new Error(
      `Status transition from ${previousStatus} to ${newStatus} is not allowed`
    );
  }

  const now = new Date();

  // Update prescription record
  await db
    .update(prescriptions)
    .set({
      status: newStatus,
      updatedAt: now,
      ...(notes ? { notes } : {}),
    })
    .where(eq(prescriptions.id, prescriptionId));

  // Sync queue entry if exists
  if (current.queueEntry) {
    await db
      .update(queueEntries)
      .set({
        status: newStatus,
        updatedAt: now,
        ...(newStatus === "READY_FOR_PICKUP" ? { calledAt: now } : {}),
        ...(newStatus === "COMPLETED" ? { completedAt: now } : {}),
      })
      .where(eq(queueEntries.id, current.queueEntry.id));
  }

  // Create audit log entry
  await createAuditLog({
    entityType: "prescription",
    entityId: prescriptionId,
    action: "STATUS_CHANGE",
    fromStatus: previousStatus,
    toStatus: newStatus,
    actor,
    notes: notes || `Status updated from ${previousStatus} to ${newStatus}`,
  });

  return { success: true, fromStatus: previousStatus, toStatus: newStatus };
}

export async function recordLabelPrint(prescriptionId: string, actor = "Staff Farmasi") {
  await createAuditLog({
    entityType: "prescription",
    entityId: prescriptionId,
    action: "PRINT_LABEL",
    actor,
    notes: "Medication label printed",
  });
  return { success: true };
}

export async function updatePrescriptionClassification(
  prescriptionId: string,
  newClassification: ClassificationType,
  actor = "Staff Farmasi"
) {
  const current = await db.query.prescriptions.findFirst({
    where: eq(prescriptions.id, prescriptionId),
  });

  if (!current) {
    throw new Error(`Prescription with ID ${prescriptionId} not found`);
  }

  const previousClassification = current.classification;

  await db
    .update(prescriptions)
    .set({
      classification: newClassification,
      updatedAt: new Date(),
    })
    .where(eq(prescriptions.id, prescriptionId));

  await createAuditLog({
    entityType: "prescription",
    entityId: prescriptionId,
    action: "CLASSIFICATION_CHANGE",
    fromStatus: previousClassification || null,
    toStatus: newClassification,
    actor,
    notes: `Classification changed from ${previousClassification || "unset"} to ${newClassification}`,
  });

  return { success: true, from: previousClassification, to: newClassification };
}
