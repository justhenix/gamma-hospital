import type { PrescriptionStatus } from "@/lib/constants";

export type SelectionDirection = "next" | "previous";

export function getNextSelectionIndex(
  currentIndex: number,
  direction: SelectionDirection,
  itemCount: number
) {
  if (itemCount <= 0) return 0;

  const lastIndex = itemCount - 1;
  if (direction === "next") return Math.min(currentIndex + 1, lastIndex);
  return Math.max(currentIndex - 1, 0);
}

const WORKBENCH_STATUS_LABELS: Record<PrescriptionStatus, string> = {
  WAITING: "Menunggu",
  VERIFIED: "Diverifikasi",
  PREPARING: "Disiapkan",
  READY_FOR_PICKUP: "Siap Diambil",
  COMPLETED: "Selesai",
  NEEDS_CLARIFICATION: "Butuh Klarifikasi",
};

export function getWorkbenchStatusLabel(status: PrescriptionStatus) {
  return WORKBENCH_STATUS_LABELS[status];
}

export function getWorkbenchPrimaryTransition(
  status: PrescriptionStatus
): { status: PrescriptionStatus; label: string } | null {
  switch (status) {
    case "WAITING":
      return { status: "VERIFIED", label: "Verifikasi resep" };
    case "VERIFIED":
      return { status: "PREPARING", label: "Mulai siapkan" };
    case "PREPARING":
      return { status: "READY_FOR_PICKUP", label: "Tandai siap diambil" };
    case "READY_FOR_PICKUP":
      return { status: "COMPLETED", label: "Selesaikan" };
    case "NEEDS_CLARIFICATION":
    case "COMPLETED":
      return null;
  }
}
