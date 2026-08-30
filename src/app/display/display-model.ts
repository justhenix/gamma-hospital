import type { PrescriptionStatus } from "@/lib/constants";

export interface DisplayItem {
  queueCode: string;
  displayNumber: string;
  status: PrescriptionStatus;
  patientName: string;
  doctorName?: string;
  department?: string;
  calledAt?: string | null;
  hasCompounded?: boolean;
}

export interface DisplayPayload {
  preparing: DisplayItem[];
  readyForPickup: DisplayItem[];
  completed: DisplayItem[];
  timestamp: string;
}

export function getDisplayPresentation(data: DisplayPayload | null) {
  if (!data) {
    return {
      heroReady: null,
      otherReady: [] as DisplayItem[],
      preparing: [] as DisplayItem[],
    };
  }

  return {
    heroReady: data.readyForPickup[0] ?? null,
    otherReady: data.readyForPickup.slice(1, 5),
    preparing: data.preparing.slice(0, 7),
  };
}
