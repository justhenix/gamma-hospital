import { z } from "zod";
import { PRESCRIPTION_STATUSES } from "@/lib/constants";

export const updatePrescriptionStatusSchema = z.object({
  prescriptionId: z.string().min(1, "Prescription ID is required"),
  newStatus: z.enum(PRESCRIPTION_STATUSES),
  actor: z.string().min(1).default("Staff Farmasi"),
  notes: z.string().optional(),
});

export const updatePrescriptionNotesSchema = z.object({
  prescriptionId: z.string().min(1, "Prescription ID is required"),
  notes: z.string().max(1000, "Notes maximum 1000 characters"),
  actor: z.string().min(1).default("Staff Farmasi"),
});

export const recordLabelPrintSchema = z.object({
  prescriptionId: z.string().min(1, "Prescription ID is required"),
  actor: z.string().min(1).default("Staff Farmasi"),
});

export type UpdatePrescriptionStatusInput = z.infer<typeof updatePrescriptionStatusSchema>;
export type UpdatePrescriptionNotesInput = z.infer<typeof updatePrescriptionNotesSchema>;
export type RecordLabelPrintInput = z.infer<typeof recordLabelPrintSchema>;
