"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateClassificationAction } from "@/server/actions/prescription-actions";
import {
  CLASSIFICATION_TYPES,
  getClassificationLabel,
  type ClassificationType,
} from "@/lib/constants";

interface ClassificationSelectorProps {
  prescriptionId: string;
  currentClassification: ClassificationType | null;
}

export function ClassificationSelector({
  prescriptionId,
  currentClassification,
}: ClassificationSelectorProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClassify = (classification: ClassificationType) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await updateClassificationAction({
        prescriptionId,
        classification,
      });

      if (!res.success) {
        setErrorMessage(
          typeof res.error === "string" ? res.error : "Failed to update classification"
        );
      }
    });
  };

  return (
    <div className="border rounded-md p-3 bg-white space-y-2">
      <div className="text-sm font-semibold text-foreground">
        Klasifikasi Resep
      </div>

      {errorMessage && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-2">
        {currentClassification && (
          <span className="text-xs font-sans text-slate-600">
            Saat ini: <strong>{getClassificationLabel(currentClassification)}</strong>
          </span>
        )}
        {!currentClassification && (
          <span className="text-xs font-sans text-amber-600 font-semibold">
            Belum diklasifikasi
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {CLASSIFICATION_TYPES.map((type) => {
          const isActive = currentClassification === type;
          return (
            <Button
              key={type}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              disabled={isPending || isActive}
              onClick={() => handleClassify(type)}
              className="text-xs"
            >
              {getClassificationLabel(type)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
