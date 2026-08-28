import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  PRESCRIPTION_STATUS_LABELS,
  type PrescriptionStatus,
} from "@/lib/constants";

interface StatusBadgeProps {
  status: PrescriptionStatus | string;
  showIndonesian?: boolean;
}

export function StatusBadge({
  status,
  showIndonesian = true,
}: StatusBadgeProps) {
  const meta =
    PRESCRIPTION_STATUS_LABELS[status as PrescriptionStatus] || {
      label: status,
      labelId: status,
      variant: "secondary" as const,
    };

  return (
    <Badge variant={meta.variant} className="font-mono text-xs uppercase">
      {meta.label} {showIndonesian && `(${meta.labelId})`}
    </Badge>
  );
}
