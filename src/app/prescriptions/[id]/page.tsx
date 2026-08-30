import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrescriptionDetailById } from "@/server/data-access/prescriptions";
import { StatusBadge } from "@/components/workbench/status-badge";
import { StatusActionButtons } from "@/components/prescription/status-action-buttons";
import { ClassificationSelector } from "@/components/prescription/classification-selector";
import { PrescriptionItemsTable } from "@/components/prescription/prescription-items-table";
import { AuditLogTimeline } from "@/components/prescription/audit-log-timeline";
import { Button } from "@/components/ui/button";
import { formatDate, calculateAge } from "@/lib/utils";
import { getClassificationLabel, type ClassificationType } from "@/lib/constants";
import { ArrowLeft, Printer, ExternalLink } from "lucide-react";
import * as m from "@/paraglide/messages.js";

export const dynamic = "force-dynamic";

interface PrescriptionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrescriptionDetailPage({
  params,
}: PrescriptionDetailPageProps) {
  const { id } = await params;
  const prescription = await getPrescriptionDetailById(id);

  if (!prescription) {
    notFound();
  }

  const patientAge = calculateAge(prescription.patient.birthDate);

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/" className="flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{m.action_back_workbench()}</span>
              </Link>
            </Button>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-semibold text-foreground font-sans tabular-nums">
              {prescription.prescriptionNumber}
            </span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              Resep: {prescription.prescriptionNumber}
            </h1>
            <StatusBadge status={prescription.status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {prescription.queueEntry && (
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/track/${prescription.queueEntry.queueCode}`}
                target="_blank"
                className="flex items-center gap-1.5"
              >
                <span>{m.action_track_queue()} ({prescription.queueEntry.queueCode})</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
          <Button asChild size="sm">
            <Link href={`/prescriptions/${prescription.id}/label`} className="flex items-center gap-1.5">
              <Printer className="h-3.5 w-3.5" />
              <span>{m.action_print_labels()}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Patient & Prescription Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Patient Card */}
        <div className="border border-border rounded-lg p-5 bg-card space-y-2.5 shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground">
            {m.patient_info()}
          </div>
          <div className="text-lg font-bold text-foreground">
            {prescription.patient.name}
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-xs text-foreground">
            <div>
              <span className="text-muted-foreground">{m.table_patient_mrn().split(" / ")[1] || "No. RM"}:</span>{" "}
              <strong className="font-sans tabular-nums">{prescription.patient.mrn}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">{m.field_gender()}:</span>{" "}
              {prescription.patient.gender === "M" ? "Laki-laki (L)" : "Perempuan (P)"}
            </div>
            <div>
              <span className="text-muted-foreground">{m.field_dob()}:</span>{" "}
              <span className="font-sans tabular-nums">{prescription.patient.birthDate} ({patientAge} th)</span>
            </div>
            <div>
              <span className="text-muted-foreground">{m.field_phone()}:</span>{" "}
              <span className="font-sans tabular-nums">{prescription.patient.phone || "-"}</span>
            </div>
          </div>
        </div>

        {/* Clinical / Order Info Card */}
        <div className="border border-border rounded-lg p-5 bg-card space-y-2.5 shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground">
            {m.order_info()}
          </div>
          <div className="text-sm font-semibold text-foreground">
            {prescription.doctorName}
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-xs text-foreground">
            <div>
              <span className="text-muted-foreground">{m.field_department()}:</span>{" "}
              <strong>{prescription.department}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">{m.field_queue_code()}:</span>{" "}
              <span className="font-bold text-foreground font-sans tabular-nums">
                {prescription.queueEntry?.queueCode || "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">{m.field_classification()}:</span>{" "}
              <span className={`font-semibold ${prescription.classification ? "text-foreground" : "text-amber-600"}`}>
                {getClassificationLabel(prescription.classification as ClassificationType | null)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">{m.field_received()}:</span>{" "}
              <span className="font-sans tabular-nums">{formatDate(prescription.createdAt)}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">{m.field_last_update()}:</span>{" "}
              <span className="font-sans tabular-nums">{formatDate(prescription.updatedAt)}</span>
            </div>
          </div>
          {prescription.notes && (
            <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-md border border-amber-200">
              <strong>{m.field_clinical_note()}:</strong> {prescription.notes}
            </div>
          )}
        </div>
      </div>

      {/* Classification Selector */}
      <ClassificationSelector
        prescriptionId={prescription.id}
        currentClassification={prescription.classification as ClassificationType | null}
      />

      {/* Status Action Transitions */}
      <StatusActionButtons
        prescriptionId={prescription.id}
        currentStatus={prescription.status}
      />

      {/* Prescription Items (Medications & Formulas) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-foreground">
            {m.prescription_items()} ({prescription.items.length})
          </h2>
          <div className="text-xs text-muted-foreground">
            {prescription.items.filter((i) => i.type === "READY").length} {m.item_type_ready()} |{" "}
            {prescription.items.filter((i) => i.type === "COMPOUNDED").length} {m.item_type_compounded()}
          </div>
        </div>
        <PrescriptionItemsTable items={prescription.items} />
      </div>

      {/* Audit Log Timeline */}
      <div className="space-y-3 border-t border-border pt-5">
        <h2 className="font-heading text-base font-bold text-foreground">
          {m.audit_history()}
        </h2>
        <AuditLogTimeline logs={prescription.auditHistory} />
      </div>
    </div>
  );
}
