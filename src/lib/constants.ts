import * as m from "@/paraglide/messages.js";

export const PRESCRIPTION_STATUSES = [
  "WAITING",
  "VERIFIED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "NEEDS_CLARIFICATION",
] as const;

export type PrescriptionStatus = (typeof PRESCRIPTION_STATUSES)[number];

export const STATUS_VARIANTS: Record<
  PrescriptionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  WAITING: "secondary",
  VERIFIED: "outline",
  PREPARING: "default",
  READY_FOR_PICKUP: "default",
  COMPLETED: "outline",
  NEEDS_CLARIFICATION: "destructive",
};

export function getStatusLabel(status: PrescriptionStatus | string): string {
  switch (status) {
    case "WAITING":
      return m.status_waiting();
    case "VERIFIED":
      return m.status_verified();
    case "PREPARING":
      return m.status_preparing();
    case "READY_FOR_PICKUP":
      return m.status_ready_for_pickup();
    case "COMPLETED":
      return m.status_completed();
    case "NEEDS_CLARIFICATION":
      return m.status_needs_clarification();
    default:
      return status;
  }
}

export const ALLOWED_STATUS_TRANSITIONS: Record<PrescriptionStatus, PrescriptionStatus[]> = {
  WAITING: ["VERIFIED", "NEEDS_CLARIFICATION"],
  VERIFIED: ["PREPARING", "NEEDS_CLARIFICATION"],
  PREPARING: ["READY_FOR_PICKUP", "NEEDS_CLARIFICATION"],
  READY_FOR_PICKUP: ["COMPLETED", "NEEDS_CLARIFICATION"],
  NEEDS_CLARIFICATION: ["WAITING", "VERIFIED", "PREPARING"],
  COMPLETED: [],
};

export const ITEM_TYPES = ["READY", "COMPOUNDED"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export function getItemTypeLabel(type: ItemType | string): string {
  switch (type) {
    case "READY":
      return m.item_type_ready();
    case "COMPOUNDED":
      return m.item_type_compounded();
    default:
      return type;
  }
}
