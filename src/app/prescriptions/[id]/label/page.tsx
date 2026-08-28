import React from "react";
import { notFound } from "next/navigation";
import { getPrescriptionDetailById } from "@/server/data-access/prescriptions";
import { MedicationLabelPrint } from "@/components/print/medication-label";

export const dynamic = "force-dynamic";

interface LabelPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrescriptionLabelPage({ params }: LabelPageProps) {
  const { id } = await params;
  const prescription = await getPrescriptionDetailById(id);

  if (!prescription) {
    notFound();
  }

  return <MedicationLabelPrint prescription={prescription} />;
}
