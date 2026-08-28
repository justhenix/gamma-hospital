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
    <div className="border rounded-md p-4 bg-slate-50 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
        <div className="text-sm font-semibold text-slate-800">
          Workflow Actions & Status Transitions
        </div>
        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="actor-input" className="text-slate-600 font-mono">
            Actor:
          </label>
          <input
            id="actor-input"
            type="text"
            value={actorName}
            onChange={(e) => setActorName(e.target.value)}
            className="border rounded px-2 py-0.5 text-xs font-mono bg-white w-36"
            placeholder="Apoteker / Staff"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded">
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
                className="flex items-center gap-1.5"
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
              className="flex items-center gap-1.5"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>{m.advance_to({ status: label })}</span>
            </Button>
          );
        })}

        {allowedNext.length === 0 && (
          <div className="text-xs text-slate-500 font-mono italic">
            This prescription has reached terminal status ({currentStatus}).
          </div>
        )}
      </div>

      {showClarificationInput && (
        <div className="border-t pt-3 space-y-2">
          <label className="text-xs font-medium text-slate-700 block">
            Reason for Clarification (will be logged in audit trail):
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g. Dosis melebihi standar / konfirmasi dokter..."
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
            >
              Submit Flag
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
