"use server";

import { revalidatePath } from "next/cache";
import {
  updatePrescriptionStatus,
  recordLabelPrint,
  updatePrescriptionClassification,
} from "@/server/data-access/prescriptions";
import {
  updatePrescriptionStatusSchema,
  recordLabelPrintSchema,
  updateClassificationSchema,
} from "@/server/schemas/prescription-schemas";

export async function updateStatusAction(formData: FormData) {
  const rawData = {
    prescriptionId: formData.get("prescriptionId"),
    newStatus: formData.get("newStatus"),
    actor: formData.get("actor") || "Staff Farmasi",
    notes: formData.get("notes") || undefined,
  };

  const parsed = updatePrescriptionStatusSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.format() };
  }

  try {
    const result = await updatePrescriptionStatus(
      parsed.data.prescriptionId,
      parsed.data.newStatus,
      parsed.data.actor,
      parsed.data.notes
    );

    revalidatePath("/");
    revalidatePath(`/prescriptions/${parsed.data.prescriptionId}`);
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}

export async function directUpdateStatusAction(input: {
  prescriptionId: string;
  newStatus: any;
  actor?: string;
  notes?: string;
}) {
  const parsed = updatePrescriptionStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.format() };
  }

  try {
    const result = await updatePrescriptionStatus(
      parsed.data.prescriptionId,
      parsed.data.newStatus,
      parsed.data.actor,
      parsed.data.notes
    );

    revalidatePath("/");
    revalidatePath(`/prescriptions/${parsed.data.prescriptionId}`);
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}

export async function recordPrintAction(prescriptionId: string, actor = "Staff Farmasi") {
  const parsed = recordLabelPrintSchema.safeParse({ prescriptionId, actor });
  if (!parsed.success) {
    return { success: false, error: parsed.error.format() };
  }

  try {
    const result = await recordLabelPrint(parsed.data.prescriptionId, parsed.data.actor);
    revalidatePath(`/prescriptions/${prescriptionId}`);
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record print",
    };
  }
}

export async function updateClassificationAction(input: {
  prescriptionId: string;
  classification: string;
  actor?: string;
}) {
  const parsed = updateClassificationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.format() };
  }

  try {
    const result = await updatePrescriptionClassification(
      parsed.data.prescriptionId,
      parsed.data.classification,
      parsed.data.actor
    );

    revalidatePath("/");
    revalidatePath(`/prescriptions/${parsed.data.prescriptionId}`);
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update classification",
    };
  }
}
