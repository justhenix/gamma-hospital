import type { PrescriptionStatus } from "@/lib/constants";
import { maskName } from "@/lib/utils";

export interface DisplayItem {
  queueCode: string;
  displayNumber: string;
  status: PrescriptionStatus;
  patientName: string;
}

export interface DisplaySourceItem extends DisplayItem {
  [key: string]: unknown;
}

export interface DisplayPayload {
  preparing: DisplayItem[];
  readyForPickup: DisplayItem[];
  completed: DisplayItem[];
  timestamp: string;
}

export function toPublicDisplayItem(source: DisplaySourceItem): DisplayItem {
  return {
    queueCode: source.queueCode,
    displayNumber: source.displayNumber,
    status: source.status,
    patientName: maskName(source.patientName),
  };
}

export function formatDisplayClock(value: Date | string | number) {
  const date = value instanceof Date ? value : new Date(value);

  return {
    time: date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Bangkok",
    }),
    date: date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Bangkok",
    }),
  };
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
