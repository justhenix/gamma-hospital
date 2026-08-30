import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getItemTypeLabel, type ItemType } from "@/lib/constants";
import type { PrescriptionItem } from "@/db/schema";

import * as m from "@/paraglide/messages.js";

interface PrescriptionItemsTableProps {
  items: PrescriptionItem[];
}

export function PrescriptionItemsTable({ items }: PrescriptionItemsTableProps) {
  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead className="w-28">{m.label_item_type()}</TableHead>
            <TableHead>{m.label_item_name()}</TableHead>
            <TableHead className="w-28 text-right">{m.label_quantity()}</TableHead>
            <TableHead className="w-28">{m.label_dosage()}</TableHead>
            <TableHead>{m.label_signa()}</TableHead>
            <TableHead>{m.label_notes()}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => {
            const isCompounded = item.type === "COMPOUNDED";
            const typeLabel = getItemTypeLabel(item.type);

            return (
              <TableRow
                key={item.id}
                className={isCompounded ? "bg-amber-50/40 dark:bg-amber-950/20" : undefined}
              >
                <TableCell className="text-center font-sans tabular-nums text-xs text-muted-foreground">
                  {idx + 1}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isCompounded ? "default" : "secondary"}
                    className="text-xs font-medium"
                  >
                    {typeLabel}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {item.itemName}
                </TableCell>
                <TableCell className="text-right font-sans tabular-nums text-xs font-semibold text-foreground">
                  {item.quantity} {item.unit}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {item.dosage}
                </TableCell>
                <TableCell className="text-xs font-medium text-foreground">
                  {item.signa}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {item.notes || "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
