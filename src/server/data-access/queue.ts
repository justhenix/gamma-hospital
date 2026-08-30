import { db } from "@/db";
import { queueEntries } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { type PrescriptionStatus } from "@/lib/constants";
import { toPublicTrackerPayload } from "@/app/track/public-tracker-model";
import { toPublicDisplayItem } from "@/app/display/display-model";

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
    columns: {
      queueCode: true,
      displayNumber: true,
      status: true,
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
    orderBy: [desc(queueEntries.updatedAt)],
  });

  const preparing = entries.filter(
    (e) => e.status === "PREPARING" || e.status === "VERIFIED" || e.status === "WAITING"
  );

  const readyForPickup = entries.filter((e) => e.status === "READY_FOR_PICKUP");

  const completed = entries.filter((e) => e.status === "COMPLETED").slice(0, 5);

  return {
    preparing: preparing.map((e) => toPublicDisplayItem({
      queueCode: e.queueCode,
      displayNumber: e.displayNumber,
      status: e.status as PrescriptionStatus,
      patientName: e.prescription.patient.name,
    })),
    readyForPickup: readyForPickup.map((e) => toPublicDisplayItem({
      queueCode: e.queueCode,
      displayNumber: e.displayNumber,
      status: e.status as PrescriptionStatus,
      patientName: e.prescription.patient.name,
    })),
    completed: completed.map((e) => toPublicDisplayItem({
      queueCode: e.queueCode,
      displayNumber: e.displayNumber,
      status: e.status as PrescriptionStatus,
      patientName: e.prescription.patient.name,
    })),
    timestamp: new Date().toISOString(),
  };
}
