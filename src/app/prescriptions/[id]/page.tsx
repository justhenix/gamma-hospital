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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/" className="flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{m.action_back_workbench()}</span>
              </Link>
            </Button>
            <span className="font-mono text-xs text-slate-400">/</span>
            <span className="font-mono text-xs font-bold text-slate-700">
              {prescription.prescriptionNumber}
            </span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <h1 className="text-xl font-bold tracking-tight">
              Prescription: {prescription.prescriptionNumber}
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
        <div className="border rounded-md p-4 bg-white space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            {m.patient_info()}
          </div>
          <div className="text-lg font-bold text-slate-900">
            {prescription.patient.name}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-700">
            <div>
              <span className="text-slate-400">No. RM:</span>{" "}
              <strong>{prescription.patient.mrn}</strong>
            </div>
            <div>
              <span className="text-slate-400">Gender:</span>{" "}
              {prescription.patient.gender === "M" ? "Laki-laki (L)" : "Perempuan (P)"}
            </div>
            <div>
              <span className="text-slate-400">DOB:</span>{" "}
              {prescription.patient.birthDate} ({patientAge} th)
            </div>
            <div>
              <span className="text-slate-400">Phone:</span>{" "}
              {prescription.patient.phone || "-"}
            </div>
          </div>
        </div>

        {/* Clinical / Order Info Card */}
        <div className="border rounded-md p-4 bg-white space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            {m.order_info()}
          </div>
          <div className="text-sm font-semibold text-slate-900">
            {prescription.doctorName}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-700">
            <div>
              <span className="text-slate-400">Department:</span>{" "}
              <strong>{prescription.department}</strong>
            </div>
            <div>
              <span className="text-slate-400">Queue Code:</span>{" "}
              <span className="font-bold text-slate-900">
                {prescription.queueEntry?.queueCode || "-"}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Klasifikasi:</span>{" "}
              <span className={`font-bold ${prescription.classification ? "text-slate-900" : "text-amber-600"}`}>
                {getClassificationLabel(prescription.classification as ClassificationType | null)}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Received:</span>{" "}
              {formatDate(prescription.createdAt)}
            </div>
            <div>
              <span className="text-slate-400">Last Update:</span>{" "}
              {formatDate(prescription.updatedAt)}
            </div>
          </div>
          {prescription.notes && (
            <div className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
              <strong>Clinical Note:</strong> {prescription.notes}
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {m.prescription_items()} ({prescription.items.length})
          </h2>
          <div className="text-xs text-slate-500 font-mono">
            {prescription.items.filter((i) => i.type === "READY").length} {m.item_type_ready()} |{" "}
            {prescription.items.filter((i) => i.type === "COMPOUNDED").length} {m.item_type_compounded()}
          </div>
        </div>
        <PrescriptionItemsTable items={prescription.items} />
      </div>

      {/* Audit Log Timeline */}
      <div className="space-y-2 border-t pt-4">
        <h2 className="text-sm font-bold text-slate-900">
          {m.audit_history()}
        </h2>
        <AuditLogTimeline logs={prescription.auditHistory} />
      </div>
    </div>
  );
}
