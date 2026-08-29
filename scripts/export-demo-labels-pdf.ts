import fs from "fs";
import path from "path";
import { getPrescriptionDetailById } from "../src/server/data-access/prescriptions";
import { generatePrescriptionLabelPdf } from "../src/lib/label-pdf";

async function main() {
  const outputDir = path.resolve(process.cwd(), "demo-pdf-labels");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const demoRxIds = ["rx_01", "rx_03", "rx_07"];

  for (const rxId of demoRxIds) {
    const detail = await getPrescriptionDetailById(rxId);
    if (!detail) {
      console.error(`Prescription ${rxId} not found`);
      continue;
    }

    const pdfBuffer = await generatePrescriptionLabelPdf(
      detail as any,
      "CLI Demo Export"
    );

    const filename = `Label-${detail.prescriptionNumber}-${detail.patient.name.replace(/\s+/g, "_")}.pdf`;
    const targetPath = path.join(outputDir, filename);
    fs.writeFileSync(targetPath, pdfBuffer);
    console.log(`✅ Generated PDF label: ${targetPath} (${pdfBuffer.length} bytes)`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("PDF export failed:", err);
    process.exit(1);
  });
