# Hospital Pharmacy Workbench MVP Scaffold

A raw, high-throughput MVP prototype for hospital pharmacy dispensing, queue management, and label printing tailored for **RS Indriati Boyolali** operations.

Built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, minimal **shadcn/ui** functional components, **Drizzle ORM**, **Turso / SQLite**, **Zod**, and **npm**.

---

## 🎯 Scope & Features

- **Staff Pharmacy Workbench (`/`)**:
  - Operational prescription queue with status filtering (`ALL`, `WAITING`, `VERIFIED`, `PREPARING`, `READY_FOR_PICKUP`, `NEEDS_CLARIFICATION`, `COMPLETED`).
  - **Keyboard Navigation**:
    - `J` or `↓`: Select next queue row
    - `K` or `↑`: Select previous queue row
    - `Enter`: Open prescription detail view
- **Prescription Detail (`/prescriptions/[id]`)**:
  - Patient demographics (Name, MRN, Age, Gender, Phone).
  - Prescription breakdown separating **Ready-made** (`READY` / Obat Jadi) and **Compounded** (`COMPOUNDED` / Racikan) items with dosage and signa.
  - Step-by-step status transitions with validation rules.
  - Action to flag for doctor clarification (`NEEDS_CLARIFICATION`).
  - Real-time audit log timeline tracking all status changes and label printing events.
- **Medication Label Print Route (`/prescriptions/[id]/label`)**:
  - Browser-native printable thermal stickers (`@media print` formatted).
  - Contains pharmacy branding, patient MRN, drug details, prominent signa instructions, and dispensing timestamps.
- **Patient Queue Tracker (`/track/[queueCode]`)**:
  - Patient-facing lightweight mobile page.
  - Real-time polling (every 4 seconds, zero WebSockets overhead).
  - Masked patient names for privacy compliance.
- **Public TV Queue Display (`/display`)**:
  - Waiting room TV board with active clock and 3-second polling.
  - Distinct panels for *Siap Diambil (Ready for Pickup)*, *Sedang Disiapkan (Preparing)*, and *Selesai (Completed)*.

---

## 🗄️ Database Architecture (5 Tables Only)

1. `patients` — Patient master records (MRN, name, birth date, gender, phone).
2. `prescriptions` — Clinical prescription orders (doctor, department, status, notes).
3. `prescription_items` — Medication line items (`READY` vs `COMPOUNDED`, quantity, unit, dosage, signa).
4. `queue_entries` — Pharmacy queue tokens (`A-001`, `B-001`, display numbers, timestamps).
5. `audit_logs` — Immutable audit trail of every status transition and label print action.

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+
- **npm**: v9+ or v10+

### 2. Installation
```bash
# Clone and enter repository
git clone https://github.com/justhenix/gamma-hospital.git
cd hospital

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration uses local SQLite:
```env
DATABASE_URL="file:local.db"
```

*(Optional: For remote Turso database, provide `DATABASE_URL="libsql://..."` and `DATABASE_AUTH_TOKEN="..."`)*

### 4. Database Migration & Synthetic Seeding
```bash
# Push Drizzle schema to SQLite database
npm run db:push

# Seed realistic hospital pharmacy test data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Key Routes

| Route | Description |
|---|---|
| `/` | Staff Pharmacy Workbench & Keyboard Queue |
| `/prescriptions/[id]` | Prescription Detail, Workflow Actions, & Audit Log |
| `/prescriptions/[id]/label` | Printable Medication Labels (Browser Print) |
| `/track/[queueCode]` | Patient Queue Status Tracker (e.g. `/track/A-002`) |
| `/display` | Public TV Waiting Room Queue Display Board |
| `/api/display` | Polling endpoint for TV Display |
| `/api/track/[queueCode]` | Polling endpoint for Patient Tracker |

---

## 🏥 Hospital System Integration Boundary

This repository is strictly scoped as a raw, modular workbench scaffold. Integration with existing hospital information systems (e.g., SIMRS Khanza, HL7/FHIR, or legacy Java backends) is structured to connect via the server data-access layer in `src/server/data-access/` without altering the core workbench interface.
