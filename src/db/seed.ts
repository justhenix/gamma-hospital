import { db } from "./index";
import {
  patients,
  prescriptions,
  prescriptionItems,
  queueEntries,
  auditLogs,
} from "./schema";
import { nanoid } from "nanoid";

async function seed() {
  console.log("🌱 Starting database seeding...");

  // Clean existing tables
  await db.delete(auditLogs);
  await db.delete(queueEntries);
  await db.delete(prescriptionItems);
  await db.delete(prescriptions);
  await db.delete(patients);

  console.log("🧹 Cleaned existing data.");

  const now = Date.now();
  const minute = 60 * 1000;

  // 1. Seed Patients
  const mockPatients = [
    {
      id: "pat_01",
      mrn: "RM-082901",
      name: "Budi Santoso",
      birthDate: "1980-05-14",
      gender: "M",
      phone: "081234567890",
      createdAt: new Date(now - 120 * minute),
      updatedAt: new Date(now - 120 * minute),
    },
    {
      id: "pat_02",
      mrn: "RM-082902",
      name: "Siti Rahayu",
      birthDate: "1992-11-23",
      gender: "F",
      phone: "082345678901",
      createdAt: new Date(now - 90 * minute),
      updatedAt: new Date(now - 90 * minute),
    },
    {
      id: "pat_03",
      mrn: "RM-082903",
      name: "Bambang Sutrisno",
      birthDate: "1965-02-10",
      gender: "M",
      phone: "081398765432",
      createdAt: new Date(now - 60 * minute),
      updatedAt: new Date(now - 60 * minute),
    },
    {
      id: "pat_04",
      mrn: "RM-082904",
      name: "Dewi Lestari",
      birthDate: "2018-07-09",
      gender: "F",
      phone: "085612345678",
      createdAt: new Date(now - 45 * minute),
      updatedAt: new Date(now - 45 * minute),
    },
    {
      id: "pat_05",
      mrn: "RM-082905",
      name: "Agus Setiawan",
      birthDate: "1975-09-30",
      gender: "M",
      phone: "087812348765",
      createdAt: new Date(now - 30 * minute),
      updatedAt: new Date(now - 30 * minute),
    },
    {
      id: "pat_06",
      mrn: "RM-082906",
      name: "Sri Wahyuni",
      birthDate: "1988-12-04",
      gender: "F",
      phone: "089612349999",
      createdAt: new Date(now - 15 * minute),
      updatedAt: new Date(now - 15 * minute),
    },
  ];

  await db.insert(patients).values(mockPatients);
  console.log(`✅ Seeded ${mockPatients.length} patients.`);

  // 2. Seed Prescriptions & Queue Entries
  const mockPrescriptions = [
    {
      id: "rx_01",
      prescriptionNumber: "RX-2026-001",
      patientId: "pat_01",
      doctorName: "dr. Hendra Wijaya, Sp.PD",
      department: "Poli Penyakit Dalam",
      status: "COMPLETED" as const,
      notes: "Pasien riwayat gastritis ringan.",
      createdAt: new Date(now - 110 * minute),
      updatedAt: new Date(now - 20 * minute),
    },
    {
      id: "rx_02",
      prescriptionNumber: "RX-2026-002",
      patientId: "pat_02",
      doctorName: "dr. Nurul Hidayah, Sp.OG",
      department: "Poli Kebidanan & Kandungan",
      status: "READY_FOR_PICKUP" as const,
      notes: "Suplemen kehamilan trimester kedua.",
      createdAt: new Date(now - 80 * minute),
      updatedAt: new Date(now - 10 * minute),
    },
    {
      id: "rx_03",
      prescriptionNumber: "RX-2026-003",
      patientId: "pat_03",
      doctorName: "dr. Agus Prasetyo, Sp.JP",
      department: "Poli Jantung & Pembuluh Darah",
      status: "PREPARING" as const,
      notes: "Obat rutin hipertensi dan racikan kapsul penurun kolesterol.",
      createdAt: new Date(now - 55 * minute),
      updatedAt: new Date(now - 15 * minute),
    },
    {
      id: "rx_04",
      prescriptionNumber: "RX-2026-004",
      patientId: "pat_04",
      doctorName: "dr. Maya Kartika, Sp.A",
      department: "Poli Anak",
      status: "PREPARING" as const,
      notes: "Racikan puyer batuk pilek anak (BB: 16 kg).",
      createdAt: new Date(now - 40 * minute),
      updatedAt: new Date(now - 12 * minute),
    },
    {
      id: "rx_05",
      prescriptionNumber: "RX-2026-005",
      patientId: "pat_05",
      doctorName: "dr. Rizki Pratama, Sp.P",
      department: "Poli Paru",
      status: "VERIFIED" as const,
      notes: "Antibiotik oral + inhaler.",
      createdAt: new Date(now - 25 * minute),
      updatedAt: new Date(now - 5 * minute),
    },
    {
      id: "rx_06",
      prescriptionNumber: "RX-2026-006",
      patientId: "pat_06",
      doctorName: "dr. Eko Wardoyo, Sp.B",
      department: "Instalasi Gawat Darurat (IGD)",
      status: "NEEDS_CLARIFICATION" as const,
      notes: "Konfirmasi ulang dosis analgesik injeksi ke dokter jaga IGD.",
      createdAt: new Date(now - 10 * minute),
      updatedAt: new Date(now - 2 * minute),
    },
  ];

  await db.insert(prescriptions).values(mockPrescriptions);
  console.log(`✅ Seeded ${mockPrescriptions.length} prescriptions.`);

  // 3. Seed Queue Entries
  const mockQueueEntries = [
    {
      id: "q_01",
      prescriptionId: "rx_01",
      queueCode: "A-001",
      displayNumber: "001",
      status: "COMPLETED" as const,
      calledAt: new Date(now - 25 * minute),
      completedAt: new Date(now - 20 * minute),
      createdAt: new Date(now - 110 * minute),
      updatedAt: new Date(now - 20 * minute),
    },
    {
      id: "q_02",
      prescriptionId: "rx_02",
      queueCode: "A-002",
      displayNumber: "002",
      status: "READY_FOR_PICKUP" as const,
      calledAt: new Date(now - 10 * minute),
      completedAt: null,
      createdAt: new Date(now - 80 * minute),
      updatedAt: new Date(now - 10 * minute),
    },
    {
      id: "q_03",
      prescriptionId: "rx_03",
      queueCode: "A-003",
      displayNumber: "003",
      status: "PREPARING" as const,
      calledAt: null,
      completedAt: null,
      createdAt: new Date(now - 55 * minute),
      updatedAt: new Date(now - 15 * minute),
    },
    {
      id: "q_04",
      prescriptionId: "rx_04",
      queueCode: "B-001", // B for compounded
      displayNumber: "001",
      status: "PREPARING" as const,
      calledAt: null,
      completedAt: null,
      createdAt: new Date(now - 40 * minute),
      updatedAt: new Date(now - 12 * minute),
    },
    {
      id: "q_05",
      prescriptionId: "rx_05",
      queueCode: "A-004",
      displayNumber: "004",
      status: "VERIFIED" as const,
      calledAt: null,
      completedAt: null,
      createdAt: new Date(now - 25 * minute),
      updatedAt: new Date(now - 5 * minute),
    },
    {
      id: "q_06",
      prescriptionId: "rx_06",
      queueCode: "A-005",
      displayNumber: "005",
      status: "NEEDS_CLARIFICATION" as const,
      calledAt: null,
      completedAt: null,
      createdAt: new Date(now - 10 * minute),
      updatedAt: new Date(now - 2 * minute),
    },
  ];

  await db.insert(queueEntries).values(mockQueueEntries);
  console.log(`✅ Seeded ${mockQueueEntries.length} queue entries.`);

  // 4. Seed Prescription Items (Ready & Compounded)
  const mockItems = [
    // rx_01 items (Ready)
    {
      id: "item_01",
      prescriptionId: "rx_01",
      itemName: "Omeprazole 20mg Kapsul",
      type: "READY" as const,
      quantity: 14,
      unit: "kapsul",
      dosage: "20 mg",
      signa: "1 x 1 kapsul 30 menit sebelum makan pagi",
      notes: "Habiskan sesuai anjuran",
      createdAt: new Date(now - 110 * minute),
    },
    {
      id: "item_02",
      prescriptionId: "rx_01",
      itemName: "Sucralfate Suspensi 500mg/5ml",
      type: "READY" as const,
      quantity: 1,
      unit: "botol (100ml)",
      dosage: "500 mg / 5 ml",
      signa: "3 x 1 sendok makan (15ml) 1 jam sebelum makan",
      notes: "Kocok dahulu sebelum diminum",
      createdAt: new Date(now - 110 * minute),
    },

    // rx_02 items (Ready)
    {
      id: "item_03",
      prescriptionId: "rx_02",
      itemName: "Folavit 400mcg Tablet",
      type: "READY" as const,
      quantity: 30,
      unit: "tablet",
      dosage: "400 mcg",
      signa: "1 x 1 tablet sehari sesudah makan",
      notes: "Suplemen asam folat",
      createdAt: new Date(now - 80 * minute),
    },
    {
      id: "item_04",
      prescriptionId: "rx_02",
      itemName: "Calcium Lactate 500mg",
      type: "READY" as const,
      quantity: 30,
      unit: "tablet",
      dosage: "500 mg",
      signa: "1 x 1 tablet sehari sesudah makan pagi",
      notes: "Kalsium",
      createdAt: new Date(now - 80 * minute),
    },

    // rx_03 items (Ready & Compounded)
    {
      id: "item_05",
      prescriptionId: "rx_03",
      itemName: "Amlodipine 10mg Tablet",
      type: "READY" as const,
      quantity: 30,
      unit: "tablet",
      dosage: "10 mg",
      signa: "1 x 1 tablet sehari malam hari",
      notes: "Antihipertensi",
      createdAt: new Date(now - 55 * minute),
    },
    {
      id: "item_06",
      prescriptionId: "rx_03",
      itemName: "Racikan Kapsul Statin + CoQ10 (Simvastatin 20mg + CoQ10 50mg)",
      type: "COMPOUNDED" as const,
      quantity: 30,
      unit: "kapsul",
      dosage: "1 kapsul racikan",
      signa: "1 x 1 kapsul sehari malam hari sebelum tidur",
      notes: "Racikan khusus kapsul nomor 1",
      createdAt: new Date(now - 55 * minute),
    },

    // rx_04 items (Compounded Puyer Anak)
    {
      id: "item_07",
      prescriptionId: "rx_04",
      itemName: "Racikan Puyer Batuk Pilek (Paracetamol 150mg + Cetirizine 2.5mg + Ambroxol 10mg + GG 50mg)",
      type: "COMPOUNDED" as const,
      quantity: 15,
      unit: "bungkus puyer",
      dosage: "1 bungkus",
      signa: "3 x 1 bungkus puyer sehari sesudah makan (prn demam/batuk)",
      notes: "Simpan di tempat kering dan sejuk, hindari cahaya langsung",
      createdAt: new Date(now - 40 * minute),
    },

    // rx_05 items (Ready)
    {
      id: "item_08",
      prescriptionId: "rx_05",
      itemName: "Azithromycin 500mg Tablet",
      type: "READY" as const,
      quantity: 5,
      unit: "tablet",
      dosage: "500 mg",
      signa: "1 x 1 tablet sehari diminum pada jam yang sama",
      notes: "Antibiotik: Harus dihabiskan",
      createdAt: new Date(now - 25 * minute),
    },
    {
      id: "item_09",
      prescriptionId: "rx_05",
      itemName: "Salbutamol Inhaler 100mcg/puff",
      type: "READY" as const,
      quantity: 1,
      unit: "canister",
      dosage: "100 mcg / semprot",
      signa: "2 semprot bila sesak nafas (maksimal 4 kali sehari)",
      notes: "Kocok inhaler sebelum digunakan",
      createdAt: new Date(now - 25 * minute),
    },

    // rx_06 items (Ready - Needs Clarification)
    {
      id: "item_10",
      prescriptionId: "rx_06",
      itemName: "Ketorolac 30mg/ml Ampul Injeksi",
      type: "READY" as const,
      quantity: 2,
      unit: "ampul",
      dosage: "30 mg",
      signa: "Injeksi IV/IM sesuai instruksi dokter IGD",
      notes: "Perlu konfirmasi ulang durasi pemberian",
      createdAt: new Date(now - 10 * minute),
    },
  ];

  await db.insert(prescriptionItems).values(mockItems);
  console.log(`✅ Seeded ${mockItems.length} prescription items.`);

  // 5. Seed Audit Logs
  const mockAuditLogs = [
    {
      id: "aud_01",
      entityType: "prescription",
      entityId: "rx_01",
      action: "CREATE",
      fromStatus: null,
      toStatus: "WAITING",
      actor: "HIS Bridge Mock",
      notes: "Resep diterima dari Poli Penyakit Dalam",
      createdAt: new Date(now - 110 * minute),
    },
    {
      id: "aud_02",
      entityType: "prescription",
      entityId: "rx_01",
      action: "STATUS_CHANGE",
      fromStatus: "WAITING",
      toStatus: "VERIFIED",
      actor: "Apt. Nuraini, S.Farm",
      notes: "Screening administrasi & klinis valid",
      createdAt: new Date(now - 95 * minute),
    },
    {
      id: "aud_03",
      entityType: "prescription",
      entityId: "rx_01",
      action: "STATUS_CHANGE",
      fromStatus: "VERIFIED",
      toStatus: "PREPARING",
      actor: "TTK Slamet",
      notes: "Menyiapkan obat paten",
      createdAt: new Date(now - 80 * minute),
    },
    {
      id: "aud_04",
      entityType: "prescription",
      entityId: "rx_01",
      action: "PRINT_LABEL",
      fromStatus: null,
      toStatus: null,
      actor: "TTK Slamet",
      notes: "Medication label printed",
      createdAt: new Date(now - 75 * minute),
    },
    {
      id: "aud_05",
      entityType: "prescription",
      entityId: "rx_01",
      action: "STATUS_CHANGE",
      fromStatus: "PREPARING",
      toStatus: "READY_FOR_PICKUP",
      actor: "TTK Slamet",
      notes: "Obat selesai dikemas & dimasukkan ke loker pickup",
      createdAt: new Date(now - 25 * minute),
    },
    {
      id: "aud_06",
      entityType: "prescription",
      entityId: "rx_01",
      action: "STATUS_CHANGE",
      fromStatus: "READY_FOR_PICKUP",
      toStatus: "COMPLETED",
      actor: "Apt. Nuraini, S.Farm",
      notes: "Obat diserahkan ke Tn. Budi Santoso dengan konseling singkat",
      createdAt: new Date(now - 20 * minute),
    },

    // rx_02 audit logs
    {
      id: "aud_07",
      entityType: "prescription",
      entityId: "rx_02",
      action: "CREATE",
      fromStatus: null,
      toStatus: "WAITING",
      actor: "HIS Bridge Mock",
      notes: "Resep diterima dari Poli Obgyn",
      createdAt: new Date(now - 80 * minute),
    },
    {
      id: "aud_08",
      entityType: "prescription",
      entityId: "rx_02",
      action: "STATUS_CHANGE",
      fromStatus: "WAITING",
      toStatus: "VERIFIED",
      actor: "Apt. Nuraini, S.Farm",
      notes: "Verifikasi resep suplemen bumil",
      createdAt: new Date(now - 60 * minute),
    },
    {
      id: "aud_09",
      entityType: "prescription",
      entityId: "rx_02",
      action: "STATUS_CHANGE",
      fromStatus: "VERIFIED",
      toStatus: "PREPARING",
      actor: "TTK Dewi",
      notes: "Pengemasan obat",
      createdAt: new Date(now - 40 * minute),
    },
    {
      id: "aud_10",
      entityType: "prescription",
      entityId: "rx_02",
      action: "STATUS_CHANGE",
      fromStatus: "PREPARING",
      toStatus: "READY_FOR_PICKUP",
      actor: "TTK Dewi",
      notes: "Siap diserahkan, panggil nomor A-002",
      createdAt: new Date(now - 10 * minute),
    },

    // rx_06 audit logs
    {
      id: "aud_11",
      entityType: "prescription",
      entityId: "rx_06",
      action: "STATUS_CHANGE",
      fromStatus: "WAITING",
      toStatus: "NEEDS_CLARIFICATION",
      actor: "Apt. Nuraini, S.Farm",
      notes: "Konfirmasi ke dr. Eko (IGD) mengenai dosis & interval ketorolac",
      createdAt: new Date(now - 2 * minute),
    },
  ];

  await db.insert(auditLogs).values(mockAuditLogs);
  console.log(`✅ Seeded ${mockAuditLogs.length} audit logs.`);

  console.log("🎉 Database seeding completed successfully!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
