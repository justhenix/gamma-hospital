import { db } from "@/db";
import { queueEntries, prescriptions, patients, prescriptionItems } from "@/db/schema";
import { eq, desc, inArray, or } from "drizzle-orm";
import { type PrescriptionStatus } from "@/lib/constants";
import { toPublicTrackerPayload } from "@/app/track/public-tracker-model";

export async function getQueueByCode(queueCode: string) {
  const queue = await db.query.queueEntries.findFirst({
    where: eq(queueEntries.queueCode, queueCode.toUpperCase()),
    columns: {
      queueCode: true,
      status: true,
      updatedAt: true,
    },
    with: {
      prescription: {
        columns: {},
        with: {
          patient: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!queue) return null;

  return toPublicTrackerPayload({
    queueCode: queue.queueCode,
    status: queue.status as PrescriptionStatus,
    updatedAt: queue.updatedAt,
    patientName: queue.prescription.patient.name,
  });
}

export async function getDisplayBoardData() {
  const entries = await db.query.queueEntries.findMany({
    where: inArray(queueEntries.status, [
      "WAITING",
      "VERIFIED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "COMPLETED",
    ]),
    with: {
      prescription: {
        with: {
          patient: true,
          items: true,
        },
      },
    },
    orderBy: [desc(queueEntries.updatedAt)],
  });

  const preparing = entries.filter(
    (e) => e.status === "PREPARING" || e.status === "VERIFIED" || e.status === "WAITING"
  );

  const readyForPickup = entries.filter((e) => e.status === "READY_FOR_PICKUP");

  const completed = entries.filter((e) => e.status === "COMPLETED").slice(0, 5);

  return {
    preparing: preparing.map((e) => ({
      queueCode: e.queueCode,
      displayNumber: e.displayNumber,
      status: e.status as PrescriptionStatus,
      patientName: e.prescription.patient.name,
      doctorName: e.prescription.doctorName,
      department: e.prescription.department,
      hasCompounded: e.prescription.items.some((i) => i.type === "COMPOUNDED"),
    })),
    readyForPickup: readyForPickup.map((e) => ({
      queueCode: e.queueCode,
      displayNumber: e.displayNumber,
      status: e.status as PrescriptionStatus,
      patientName: e.prescription.patient.name,
      calledAt: e.calledAt,
      doctorName: e.prescription.doctorName,
      department: e.prescription.department,
    })),
    completed: completed.map((e) => ({
      queueCode: e.queueCode,
      displayNumber: e.displayNumber,
      status: e.status as PrescriptionStatus,
      patientName: e.prescription.patient.name,
      completedAt: e.completedAt,
    })),
    timestamp: new Date().toISOString(),
  };
}
