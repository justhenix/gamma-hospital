import { NextRequest, NextResponse } from "next/server";
import { getPrescriptionDetailById } from "@/server/data-access/prescriptions";
import { generatePrescriptionLabelPdf } from "@/lib/label-pdf";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prescription = await getPrescriptionDetailById(id);

    if (!prescription) {
      return NextResponse.json(
        { error: `Prescription with ID "${id}" not found` },
        { status: 404 }
      );
    }

    const pdfBuffer = await generatePrescriptionLabelPdf(
      prescription as any,
      "Staff Farmasi (PDF Export)"
    );

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Label-${prescription.prescriptionNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate label PDF" },
      { status: 500 }
    );
  }
}
