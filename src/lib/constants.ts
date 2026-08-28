export const PRESCRIPTION_STATUSES = [
  "WAITING",
  "VERIFIED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "NEEDS_CLARIFICATION",
] as const;

export type PrescriptionStatus = (typeof PRESCRIPTION_STATUSES)[number];

export const PRESCRIPTION_STATUS_LABELS: Record<
  PrescriptionStatus,
  { label: string; labelId: string; description: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  WAITING: {
    label: "Waiting",
    labelId: "Menunggu",
    description: "Resep baru masuk ke antrean farmasi",
    variant: "secondary",
  },
  VERIFIED: {
    label: "Verified",
    labelId: "Diverifikasi",
    description: "Resep telah diperiksa kelengkapan & dosis oleh apoteker",
    variant: "outline",
  },
  PREPARING: {
    label: "Preparing",
    labelId: "Diracik / Disiapkan",
    description: "Obat sedang disiapkan atau diracik di meja farmasi",
    variant: "default",
  },
  READY_FOR_PICKUP: {
    label: "Ready for Pickup",
    labelId: "Siap Diambil",
    description: "Obat selesai dikemas dan siap diserahkan ke pasien",
    variant: "default",
  },
  COMPLETED: {
    label: "Completed",
    labelId: "Selesai",
    description: "Obat telah diserahkan dan diedukasi kepada pasien",
    variant: "outline",
  },
  NEEDS_CLARIFICATION: {
    label: "Needs Clarification",
    labelId: "Butuh Klarifikasi",
    description: "Ada kendala dosis/stok/interaksi yang perlu konfirmasi dokter",
    variant: "destructive",
  },
};

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

export const ITEM_TYPE_LABELS: Record<ItemType, { label: string; labelId: string }> = {
  READY: {
    label: "Ready-made",
    labelId: "Obat Jadi",
  },
  COMPOUNDED: {
    label: "Compounded",
    labelId: "Racikan",
  },
};
