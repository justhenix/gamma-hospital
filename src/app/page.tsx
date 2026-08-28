import React from "react";
import Link from "next/link";
import { getPrescriptionsList } from "@/server/data-access/prescriptions";
import { QueueTable } from "@/components/workbench/queue-table";
import { PRESCRIPTION_STATUSES, type PrescriptionStatus } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface WorkbenchPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function WorkbenchPage({ searchParams }: WorkbenchPageProps) {
  const { status } = await searchParams;
  const currentStatus: PrescriptionStatus | "ALL" =
    status && PRESCRIPTION_STATUSES.includes(status as any)
      ? (status as PrescriptionStatus)
      : "ALL";

  const allItems = await getPrescriptionsList("ALL");
  const filteredItems =
    currentStatus === "ALL"
      ? allItems
      : allItems.filter((i) => i.status === currentStatus);

  // Counts for tabs
  const counts: Record<string, number> = {
    ALL: allItems.length,
  };
  PRESCRIPTION_STATUSES.forEach((st) => {
    counts[st] = allItems.filter((i) => i.status === st).length;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Pharmacy Workbench Queue
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Operational queue for hospital pharmacy dispensing and compounding.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/display" target="_blank">
              Open TV Display Board ↗
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b pb-2">
        <Button
          asChild
          size="sm"
          variant={currentStatus === "ALL" ? "default" : "outline"}
          className="text-xs h-8"
        >
          <Link href="/">
            All Prescriptions ({counts["ALL"] || 0})
          </Link>
        </Button>

        {PRESCRIPTION_STATUSES.map((st) => {
          const isActive = currentStatus === st;
          const count = counts[st] || 0;
          return (
            <Button
              key={st}
              asChild
              size="sm"
              variant={isActive ? "default" : "outline"}
              className="text-xs h-8 font-mono"
            >
              <Link href={`/?status=${st}`}>
                {st} ({count})
              </Link>
            </Button>
          );
        })}
      </div>

      {/* Queue Table with Keyboard Navigation */}
      <QueueTable initialItems={filteredItems} />
    </div>
  );
}
