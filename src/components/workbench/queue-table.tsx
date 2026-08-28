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
import { ArrowRight } from "lucide-react";

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
          Keyboard shortcuts: <kbd className="px-1.5 py-0.5 border rounded bg-slate-100 font-bold">J</kbd> Down /{" "}
          <kbd className="px-1.5 py-0.5 border rounded bg-slate-100 font-bold">K</kbd> Up /{" "}
          <kbd className="px-1.5 py-0.5 border rounded bg-slate-100 font-bold">Enter</kbd> Open Detail
        </div>
        <div>
          Selected: {selectedIndex + 1} of {initialItems.length}
        </div>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead className="w-24">Queue</TableHead>
              <TableHead>Patient / MRN</TableHead>
              <TableHead>Department / Doctor</TableHead>
              <TableHead>Items (Ready / Racik)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <TableRow
                  key={item.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-100 ring-2 ring-inset ring-slate-900 font-medium"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <TableCell className="text-center font-mono text-xs text-slate-400">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-base">
                    {item.queueEntry?.queueCode || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{item.patient.name}</div>
                    <div className="font-mono text-xs text-slate-500">
                      {item.patient.mrn} • {item.patient.gender === "M" ? "Laki-laki" : "Perempuan"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-900">{item.department}</div>
                    <div className="text-xs text-slate-500">{item.doctorName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-mono">
                      {item.itemCounts.total} items
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {item.itemCounts.ready} Jadi | {item.itemCounts.compounded} Racik
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {formatTimeOnly(item.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/prescriptions/${item.id}`} className="flex items-center gap-1">
                        <span>Detail</span>
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
