import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  getStatusLabel,
  STATUS_VARIANTS,
  type PrescriptionStatus,
} from "@/lib/constants";

interface StatusBadgeProps {
  status: PrescriptionStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant =
    STATUS_VARIANTS[status as PrescriptionStatus] || ("secondary" as const);
  const label = getStatusLabel(status);

  return (
    <Badge variant={variant} className="font-mono text-xs uppercase">
      {label}
    </Badge>
  );
}
