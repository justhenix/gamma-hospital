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
import { ITEM_TYPE_LABELS, type ItemType } from "@/lib/constants";
import type { PrescriptionItem } from "@/db/schema";

interface PrescriptionItemsTableProps {
  items: PrescriptionItem[];
}

export function PrescriptionItemsTable({ items }: PrescriptionItemsTableProps) {
  return (
    <div className="border rounded-md bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead className="w-28">Type</TableHead>
            <TableHead>Medication / Formula</TableHead>
            <TableHead className="w-24 text-right">Qty</TableHead>
            <TableHead className="w-28">Dosage</TableHead>
            <TableHead>Signa (Instructions)</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => {
            const isCompounded = item.type === "COMPOUNDED";
            const typeMeta = ITEM_TYPE_LABELS[item.type as ItemType] || {
              label: item.type,
              labelId: item.type,
            };

            return (
              <TableRow
                key={item.id}
                className={isCompounded ? "bg-amber-50/40" : undefined}
              >
                <TableCell className="text-center font-mono text-xs text-slate-400">
                  {idx + 1}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isCompounded ? "default" : "secondary"}
                    className="font-mono text-[10px]"
                  >
                    {typeMeta.labelId}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-slate-900">
                  {item.itemName}
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {item.quantity} {item.unit}
                </TableCell>
                <TableCell className="text-xs font-mono text-slate-600">
                  {item.dosage}
                </TableCell>
                <TableCell className="text-xs font-medium text-slate-800">
                  {item.signa}
                </TableCell>
                <TableCell className="text-xs text-slate-500">
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
