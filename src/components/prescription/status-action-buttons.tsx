"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { directUpdateStatusAction } from "@/server/actions/prescription-actions";
import {
  ALLOWED_STATUS_TRANSITIONS,
  getStatusLabel,
  STATUS_VARIANTS,
  type PrescriptionStatus,
} from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ArrowRight } from "lucide-react";
import * as m from "@/paraglide/messages.js";

interface StatusActionButtonsProps {
  prescriptionId: string;
  currentStatus: PrescriptionStatus;
}

export function StatusActionButtons({
  prescriptionId,
  currentStatus,
}: StatusActionButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [actorName, setActorName] = useState("Staff Farmasi");
  const [showClarificationInput, setShowClarificationInput] = useState(false);
  const [clarificationNotes, setClarificationNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

  const handleTransition = (targetStatus: PrescriptionStatus, notes?: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await directUpdateStatusAction({
        prescriptionId,
        newStatus: targetStatus,
        actor: actorName,
        notes: notes || undefined,
      });

      if (!res.success) {
        setErrorMessage(typeof res.error === "string" ? res.error : "Failed to update status");
      } else {
        setShowClarificationInput(false);
        setClarificationNotes("");
      }
    });
  };

  return (
    <div className="border border-border rounded-lg p-5 bg-card space-y-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="text-sm font-semibold text-foreground">
          {m.workflow_actions_title()}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="actor-input" className="text-muted-foreground font-medium">
            {m.field_actor()}:
          </label>
          <input
            id="actor-input"
            type="text"
            value={actorName}
            onChange={(e) => setActorName(e.target.value)}
            className="border border-input rounded-md px-2.5 py-1 text-xs bg-background text-foreground w-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Apoteker / Petugas"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-md">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        {allowedNext.map((nextStatus) => {
          const label = getStatusLabel(nextStatus);
          const variant = STATUS_VARIANTS[nextStatus];

          if (nextStatus === "NEEDS_CLARIFICATION") {
            return (
              <Button
                key={nextStatus}
                type="button"
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={() => setShowClarificationInput((prev) => !prev)}
                className="flex items-center gap-1.5 text-xs"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{m.flag_clarification()}</span>
              </Button>
            );
          }

          return (
            <Button
              key={nextStatus}
              type="button"
              variant={variant === "default" ? "default" : "outline"}
              size="sm"
              disabled={isPending}
              onClick={() => handleTransition(nextStatus)}
              className="flex items-center gap-1.5 text-xs"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>{m.advance_to({ status: label })}</span>
            </Button>
          );
        })}

        {allowedNext.length === 0 && (
          <div className="text-xs text-muted-foreground italic">
            {m.terminal_status_notice({ status: currentStatus })}
          </div>
        )}
      </div>

      {showClarificationInput && (
        <div className="border-t border-border pt-4 space-y-2">
          <label className="text-xs font-medium text-foreground block">
            {m.clarification_reason_label()}
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={m.clarification_placeholder()}
              value={clarificationNotes}
              onChange={(e) => setClarificationNotes(e.target.value)}
              className="text-xs"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending || !clarificationNotes.trim()}
              onClick={() =>
                handleTransition("NEEDS_CLARIFICATION", clarificationNotes)
              }
              className="text-xs"
            >
              {m.submit_clarification()}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
