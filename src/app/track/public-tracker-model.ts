import type { PrescriptionStatus } from "@/lib/constants";
import { maskName } from "@/lib/utils";

interface PublicTrackerSource {
  queueCode: string;
  status: PrescriptionStatus;
  updatedAt: Date | string;
  patientName: string;
}

export interface PublicTrackerPayload {
  queueCode: string;
  status: PrescriptionStatus;
  updatedAt: string;
  patientName: string;
}

export function toPublicTrackerPayload(
  source: PublicTrackerSource
): PublicTrackerPayload {
  return {
    queueCode: source.queueCode,
    status: source.status,
    updatedAt:
      source.updatedAt instanceof Date
        ? source.updatedAt.toISOString()
        : new Date(source.updatedAt).toISOString(),
    patientName: maskName(source.patientName),
  };
}
