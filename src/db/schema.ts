import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const patients = sqliteTable("patients", {
  id: text("id").primaryKey(),
  mrn: text("mrn").notNull().unique(), // Medical Record Number
  name: text("name").notNull(),
  birthDate: text("birth_date").notNull(), // YYYY-MM-DD
  gender: text("gender").notNull(), // 'M' | 'F'
  phone: text("phone"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const prescriptions = sqliteTable("prescriptions", {
  id: text("id").primaryKey(),
  prescriptionNumber: text("prescription_number").notNull().unique(),
  patientId: text("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  doctorName: text("doctor_name").notNull(),
  department: text("department").notNull(),
  status: text("status", {
    enum: [
      "WAITING",
      "VERIFIED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "COMPLETED",
      "NEEDS_CLARIFICATION",
    ],
  })
    .notNull()
    .default("WAITING"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const prescriptionItems = sqliteTable("prescription_items", {
  id: text("id").primaryKey(),
  prescriptionId: text("prescription_id")
    .notNull()
    .references(() => prescriptions.id, { onDelete: "cascade" }),
  itemName: text("item_name").notNull(),
  type: text("type", { enum: ["READY", "COMPOUNDED"] }).notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  dosage: text("dosage").notNull(),
  signa: text("signa").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const queueEntries = sqliteTable("queue_entries", {
  id: text("id").primaryKey(),
  prescriptionId: text("prescription_id")
    .notNull()
    .references(() => prescriptions.id, { onDelete: "cascade" }),
  queueCode: text("queue_code").notNull().unique(), // e.g. "A-012"
  displayNumber: text("display_number").notNull(), // e.g. "012"
  status: text("status", {
    enum: [
      "WAITING",
      "VERIFIED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "COMPLETED",
      "NEEDS_CLARIFICATION",
    ],
  })
    .notNull()
    .default("WAITING"),
  calledAt: integer("called_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(), // 'prescription' | 'queue'
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(), // 'STATUS_CHANGE' | 'CREATE' | 'NOTE_UPDATE' | 'PRINT_LABEL'
  fromStatus: text("from_status"),
  toStatus: text("to_status"),
  actor: text("actor").notNull().default("Staff Farmasi"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Relations
export const patientsRelations = relations(patients, ({ many }) => ({
  prescriptions: many(prescriptions),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one, many }) => ({
  patient: one(patients, {
    fields: [prescriptions.patientId],
    references: [patients.id],
  }),
  items: many(prescriptionItems),
  queueEntry: one(queueEntries, {
    fields: [prescriptions.id],
    references: [queueEntries.prescriptionId],
  }),
}));

export const prescriptionItemsRelations = relations(prescriptionItems, ({ one }) => ({
  prescription: one(prescriptions, {
    fields: [prescriptionItems.prescriptionId],
    references: [prescriptions.id],
  }),
}));

export const queueEntriesRelations = relations(queueEntries, ({ one }) => ({
  prescription: one(prescriptions, {
    fields: [queueEntries.prescriptionId],
    references: [prescriptions.id],
  }),
}));

// Export Types
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;

export type PrescriptionItem = typeof prescriptionItems.$inferSelect;
export type NewPrescriptionItem = typeof prescriptionItems.$inferInsert;

export type QueueEntry = typeof queueEntries.$inferSelect;
export type NewQueueEntry = typeof queueEntries.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
