import PDFDocument from "pdfkit";
import { formatDate, calculateAge } from "@/lib/utils";
import type { Prescription, Patient, PrescriptionItem } from "@/db/schema";
import { recordLabelPrint } from "@/server/data-access/prescriptions";

export interface PrescriptionWithDetails extends Prescription {
  patient: Patient;
  items: PrescriptionItem[];
  queueEntry: { queueCode: string; displayNumber: string } | null;
}

// 1 mm = 2.83465 pt (72 pt / 25.4 mm)
const mmToPt = (mm: number) => (mm * 72) / 25.4;

export async function generatePrescriptionLabelPdf(
  prescription: PrescriptionWithDetails,
  actor = "Staff Farmasi"
): Promise<Buffer> {
  // Record audit print event
  await recordLabelPrint(prescription.id, actor);

  // Standard Indonesian hospital pharmacy thermal sticker: 100mm x 60mm (283.46 pt x 170.08 pt)
  const labelWidth = Math.round(mmToPt(100));
  const labelHeight = Math.round(mmToPt(60));

  const doc = new PDFDocument({
    size: [labelWidth, labelHeight],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    autoFirstPage: false,
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const patientAge = calculateAge(prescription.patient.birthDate);
  const totalItems = prescription.items.length;
  const padX = 8;
  const innerWidth = labelWidth - padX * 2;

  prescription.items.forEach((item, index) => {
    doc.addPage();

    // 1. Outer Border
    doc
      .lineWidth(1)
      .strokeColor("#000000")
      .rect(4, 4, labelWidth - 8, labelHeight - 8)
      .stroke();

    // 2. Header Section
    let currentY = 7;

    // Hospital Name & Subtitle (Left)
    doc
      .fillColor("#000000")
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("RS INDRIATI BOYOLALI", padX, currentY, { width: 170, lineBreak: false });

    doc
      .fontSize(5.5)
      .font("Helvetica")
      .fillColor("#475569")
      .text("Instalasi Farmasi • Telp: (0276) 328-9999", padX, currentY + 10, { width: 170, lineBreak: false });

    // Queue Code & Date (Right)
    const queueCode = prescription.queueEntry?.queueCode || "-";
    doc
      .fillColor("#000000")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(queueCode, labelWidth - padX - 90, currentY, { width: 90, align: "right", lineBreak: false });

    doc
      .fontSize(5.5)
      .font("Helvetica")
      .fillColor("#475569")
      .text(formatDate(prescription.createdAt), labelWidth - padX - 90, currentY + 11, { width: 90, align: "right", lineBreak: false });

    currentY += 21;

    // Divider Line 1
    doc
      .lineWidth(0.5)
      .strokeColor("#000000")
      .moveTo(padX, currentY)
      .lineTo(labelWidth - padX, currentY)
      .stroke();

    currentY += 3;

    // 3. Patient & Doctor Info Row
    // Row 1: Patient Name (left) & MRN (right)
    doc
      .fillColor("#000000")
      .fontSize(6.5)
      .font("Helvetica")
      .text("Pasien: ", padX, currentY, { continued: true, lineBreak: false })
      .font("Helvetica-Bold")
      .text(prescription.patient.name, { lineBreak: false });

    doc
      .fontSize(6.5)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(`No. RM: ${prescription.patient.mrn}`, labelWidth - padX - 90, currentY, {
        width: 90,
        align: "right",
        lineBreak: false,
      });

    currentY += 9;

    // Row 2: Age (left) & Doctor (right)
    doc
      .fontSize(6)
      .font("Helvetica")
      .fillColor("#334155")
      .text(`Umur: ${patientAge} th (${prescription.patient.birthDate})`, padX, currentY, { lineBreak: false });

    doc
      .fontSize(6)
      .font("Helvetica")
      .fillColor("#334155")
      .text(`Dokter: ${prescription.doctorName}`, labelWidth - padX - 140, currentY, {
        width: 140,
        align: "right",
        lineBreak: false,
      });

    currentY += 9;

    // Divider Line 2
    doc
      .lineWidth(0.5)
      .strokeColor("#000000")
      .moveTo(padX, currentY)
      .lineTo(labelWidth - padX, currentY)
      .stroke();

    currentY += 4;

    // 4. Drug Name & Quantity (Dynamic height)
    const qtyText = `${item.quantity} ${item.unit}`;
    const qtyWidth = 60;
    const drugNameWidth = innerWidth - qtyWidth - 4;

    doc.fontSize(8).font("Helvetica-Bold");
    const drugNameHeight = doc.heightOfString(item.itemName, { width: drugNameWidth });

    // Render Drug Name
    doc
      .fillColor("#000000")
      .text(item.itemName, padX, currentY, { width: drugNameWidth });

    // Render Quantity (top-aligned to right)
    doc
      .fontSize(8)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(qtyText, labelWidth - padX - qtyWidth, currentY, {
        width: qtyWidth,
        align: "right",
        lineBreak: false,
      });

    currentY += Math.max(drugNameHeight, 10) + 3;

    // 5. Signa Box (Dynamic sizing based on content)
    const footerHeight = 15;
    const availableSignaHeight = (labelHeight - 4 - footerHeight) - currentY - 2;
    const signaBoxHeight = Math.max(34, Math.min(availableSignaHeight, 46));

    // Background fill & border
    doc
      .fillColor("#F8FAFC")
      .rect(padX, currentY, innerWidth, signaBoxHeight)
      .fill()
      .strokeColor("#CBD5E1")
      .lineWidth(0.5)
      .rect(padX, currentY, innerWidth, signaBoxHeight)
      .stroke();

    // Signa Header
    doc
      .fillColor("#64748B")
      .fontSize(5)
      .font("Helvetica-Bold")
      .text("ATURAN PAKAI / PETUNJUK PENGGUNAAN", padX + 2, currentY + 3, {
        width: innerWidth - 4,
        align: "center",
        lineBreak: false,
      });

    // Signa Main Text
    doc
      .fillColor("#000000")
      .fontSize(8)
      .font("Helvetica-Bold")
      .text(item.signa, padX + 4, currentY + 11, {
        width: innerWidth - 8,
        align: "center",
      });

    // Notes (if any)
    if (item.notes) {
      doc
        .fillColor("#475569")
        .fontSize(5.5)
        .font("Helvetica-Oblique")
        .text(`Catatan: ${item.notes}`, padX + 4, currentY + signaBoxHeight - 8, {
          width: innerWidth - 8,
          align: "center",
          lineBreak: false,
        });
    }

    // 6. Footer (Pinned at bottom)
    const footerY = labelHeight - 16;

    doc
      .strokeColor("#000000")
      .lineWidth(0.5)
      .moveTo(padX, footerY)
      .lineTo(labelWidth - padX, footerY)
      .stroke();

    const itemClassification = item.type === "COMPOUNDED" ? "RACIKAN" : "OBAT JADI";

    doc
      .fillColor("#475569")
      .fontSize(5.5)
      .font("Helvetica")
      .text(`Jenis: ${itemClassification}`, padX, footerY + 4, { lineBreak: false });

    doc
      .text(`Label #${index + 1}/${totalItems}`, labelWidth / 2 - 30, footerY + 4, {
        width: 60,
        align: "center",
        lineBreak: false,
      });

    doc
      .text("Exp: Sesuai Kemasan", labelWidth - padX - 70, footerY + 4, {
        width: 70,
        align: "right",
        lineBreak: false,
      });
  });

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}
