"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/workbench/status-badge";
import { formatTimeOnly } from "@/lib/utils";
import type { PrescriptionListItem } from "@/server/data-access/prescriptions";
import { getClassificationLabel, type ClassificationType } from "@/lib/constants";
import { ArrowRight } from "lucide-react";
import * as m from "@/paraglide/messages.js";

interface QueueTableProps {
  initialItems: PrescriptionListItem[];
}

export function QueueTable({ initialItems }: QueueTableProps) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Keyboard navigation: J, K, Enter, ArrowUp, ArrowDown
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore key events if the user is typing inside an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "j" || e.key === "J" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < initialItems.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "k" || e.key === "K" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter") {
        if (initialItems[selectedIndex]) {
          e.preventDefault();
          router.push(`/prescriptions/${initialItems[selectedIndex].id}`);
        }
      }
    },
    [initialItems, selectedIndex, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (initialItems.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-300 rounded text-slate-500 font-mono text-sm">
        No prescriptions found in this queue category.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
        <div>
          {m.keyboard_shortcuts_hint()}
        </div>
        <div>
          Dipilih: {selectedIndex + 1} dari {initialItems.length}
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead className="w-24">{m.table_queue()}</TableHead>
              <TableHead>{m.table_patient_mrn()}</TableHead>
              <TableHead>{m.table_dept_doctor()}</TableHead>
              <TableHead>{m.table_items()}</TableHead>
              <TableHead>{m.table_classification()}</TableHead>
              <TableHead>{m.table_status()}</TableHead>
              <TableHead>{m.table_time()}</TableHead>
              <TableHead className="text-right">{m.table_action()}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <TableRow
                  key={item.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-slate-100 dark:bg-slate-800 ring-1 ring-inset ring-foreground font-medium"
                      : "hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <TableCell className="text-center font-sans tabular-nums text-xs text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-sans tabular-nums font-bold text-base text-foreground">
                    {item.queueEntry?.queueCode || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-foreground">{item.patient.name}</div>
                    <div className="font-sans tabular-nums text-xs text-muted-foreground">
                      {item.patient.mrn} • {item.patient.gender === "M" ? "L" : "P"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground">{item.department}</div>
                    <div className="text-xs text-muted-foreground">{item.doctorName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-sans tabular-nums font-medium text-foreground">
                      {item.itemCounts.total} obat
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.itemCounts.ready} {m.item_type_ready()} | {item.itemCounts.compounded} {m.item_type_compounded()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium ${item.classification ? "text-foreground" : "text-amber-600"}`}>
                      {getClassificationLabel(item.classification)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="font-sans tabular-nums text-xs text-slate-500">
                    {formatTimeOnly(item.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/prescriptions/${item.id}`} className="flex items-center gap-1">
                        <span>{m.action_detail()}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
