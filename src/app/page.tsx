import React from "react";
import Link from "next/link";
import { getPrescriptionsList } from "@/server/data-access/prescriptions";
import { PharmacyWorkbench } from "@/components/workbench/pharmacy-workbench";
import { PRESCRIPTION_STATUSES, getStatusLabel, type PrescriptionStatus } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import * as m from "@/paraglide/messages.js";

export const dynamic = "force-dynamic";

interface WorkbenchPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function WorkbenchPage({ searchParams }: WorkbenchPageProps) {
  const { status } = await searchParams;
  const currentStatus: PrescriptionStatus | "ALL" =
    status && (PRESCRIPTION_STATUSES as readonly string[]).includes(status)
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            {m.workbench_title()}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {m.workbench_desc()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/display" target="_blank" className="flex items-center gap-1.5">
              <span>{m.display_title()}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <Button
          asChild
          size="sm"
          variant={currentStatus === "ALL" ? "default" : "outline"}
          className="text-xs font-medium h-8"
        >
          <Link href="/">
            {m.all_prescriptions()} ({counts["ALL"] || 0})
          </Link>
        </Button>

        {PRESCRIPTION_STATUSES.map((st) => {
          const isActive = currentStatus === st;
          const count = counts[st] || 0;
          const label = getStatusLabel(st);
          return (
            <Button
              key={st}
              asChild
              size="sm"
              variant={isActive ? "default" : "outline"}
              className="text-xs font-medium h-8"
            >
              <Link href={`/?status=${st}`}>
                {label} ({count})
              </Link>
            </Button>
          );
        })}
      </div>

      <PharmacyWorkbench initialItems={filteredItems} />
    </div>
  );
}
