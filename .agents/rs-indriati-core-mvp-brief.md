# RS Indriati Pharmacy Workbench
## Core MVP Product + Implementation Brief

**Client:** RS Indriati Boyolali  
**Client Contact:** Abdul Rokhim, IT Manager  
**Project Type:** Candidate operational software / competition MVP  
**Current Priority:** Core MVP functionality first. Extensive frontend polish comes later.

---

## 1. Product Thesis

Do **not** replace SIMRS Khanza.

Build a lightweight pharmacy operations layer that starts **after a doctor saves a prescription in Khanza and the prescription reaches Pharmacy**.

The product should make a narrow, high-frequency pharmacy workflow:

- faster,
- easier to learn,
- less tiring,
- easier to monitor,
- easier for patients to understand,
- and easier for hospital IT to maintain.

The six-month goal is not simply for the prototype to still exist.

The goal is for pharmacy staff to prefer keeping the tool because returning to the previous workflow feels more cumbersome.

---

## 2. Known Client Context

The hospital already uses **SIMRS Khanza**.

Known complaints from the client:

### P0 — Maintenance and tedious operation
The existing system is considered troublesome to maintain and some workflows feel tedious.

### P1 — Mixed staff sentiment
Doctors and staff can both like and dislike the current system. It is familiar and useful, but also creates friction.

### P2 — Aging UI and architecture
The system uses an older desktop interaction model and architecture.

These complaints are the basis for the prototype.

Do not turn them into unsupported claims such as exact time loss, exact error rates, or exact financial loss unless those numbers are separately measured.

---

## 3. Existing Khanza Boundary

Known upstream flow:

```text
Doctor
↓
Open Rawat Inap
↓
Select patient
↓
Input Resep
↓
Search medicine
↓
Set quantity + directions
↓
Save
↓
Prescription appears in Pharmacy
```

The candidate software starts **after this point**.

```text
KHANZA
Doctor saves prescription
↓
Prescription reaches Pharmacy
================================
CANDIDATE SOFTWARE STARTS HERE
================================
Pharmacy Workbench
```

Do not rebuild doctor prescribing in the MVP.

---

## 4. Assumed Pharmacy Workflow

Further client interviews are unavailable, so the pharmacy-side workflow is a **reasonable product assumption**, not a claim of exact RS Indriati SOP.

Working assumption:

```text
Incoming Prescription
↓
Review
↓
Classify
├── Obat Jadi
└── Racikan
↓
Prepare
↓
Print Label
↓
Final Check
↓
Mark Ready
↓
Patient Pickup
```

The MVP should remain flexible enough to adjust this flow later.

---

## 5. Core Users

### Primary
**Pharmacist / Apothecary**

Needs to quickly inspect, verify, and progress prescriptions under shift pressure.

### Secondary
**TTK / Pharmacy Technician**

Needs a low-friction preparation workflow with minimal navigation.

### Supporting
**Hospital IT**

Needs a small application that is easy to understand, restart, audit, and maintain without creating a second giant SIMRS.

### Patient
Only consumes queue/readiness information.

The patient does **not** operate the staff application.

---

## 6. Core MVP Scope

Build only the operational core first.

### 6.1 Staff Workbench

Route:

`/`

Purpose:

Show incoming and active prescriptions in one focused work area.

Minimum information:

- queue code,
- patient,
- current status,
- prescription type,
- medication summary,
- preparation state.

Primary interactions:

- `J` → next prescription,
- `K` → previous prescription,
- `Enter` → primary action / open / confirm.

Mouse interaction should still work.

Do not spend time building a complex dashboard.

---

### 6.2 Prescription Detail

Route:

`/prescriptions/[id]`

Show:

- patient identity,
- prescription items,
- quantity,
- directions,
- current workflow status,
- prescription classification.

Minimum status model:

```text
incoming
↓
verified
↓
preparing
↓
ready
↓
collected
```

Keep mutations simple and auditable.

---

### 6.3 Obat Jadi / Racikan Classification

A prescription can be classified as:

- `obat_jadi`
- `racikan`

This exists to help staff distinguish preparation paths.

Treat this as a prototype workflow assumption.

Do not implement complex compounding logic yet.

---

### 6.4 Label Generation

Route:

`/prescriptions/[id]/label`

Generate a printer-friendly label from prescription data.

Current requirement:

- readable,
- minimal,
- printable,
- no complicated print configuration.

---

### 6.5 Patient Tracker

Route:

`/track/[queueCode]`

Show only safe queue/readiness information.

Example states:

```text
Prescription Received
Preparing
Ready for Pickup
```

Do not expose sensitive prescription details.

No patient authentication is required for the MVP unless later needed.

---

### 6.6 TV Queue Display

Route:

`/display`

Large-screen queue display.

Example:

```text
A021    Preparing
A022    Ready
A023    Ready
```

Purpose:

Reduce repeated patient questions about whether medication is ready.

Keep it visually simple for now.

---

### 6.7 Audit Log

Record important mutations such as:

- prescription status changes,
- classification changes,
- label generation,
- ready status,
- collected status.

This is operational accountability, not enterprise compliance infrastructure.

---

## 7. Current Data Model

Keep the current five-table model:

```text
patients
prescriptions
prescription_items
queue_entries
audit_logs
```

For the competition MVP, these tables may contain representative or sanitized data.

Conceptually:

```text
Khanza
├── patient data
├── prescription data
└── prescription items
        ↓
Candidate Pharmacy Layer
├── queue state
├── workflow state
├── label generation
└── audit
```

Long term, Khanza should remain the **system of record**.

Do not design a production future where hospital staff must manually maintain the same patient or prescription data in two separate systems.

---

## 8. Technical Base

Current locked stack:

- Next.js 15 App Router
- SQLite / Turso
- Drizzle ORM
- Zod
- Paraglide JS
- Lucide Icons
- Vercel for prototype deployment

UI component libraries may be used, but extensive visual design is **not** part of the current milestone.

---

## 9. Current Engineering Priority

The current milestone is:

# Make the complete core workflow function correctly.

Prioritize:

1. schema and seed data,
2. read/write prescription flow,
3. queue state transitions,
4. keyboard navigation,
5. label generation,
6. tracker state,
7. TV queue state,
8. audit logging,
9. basic failure handling.

Frontend styling beyond basic usability comes later.

---

## 10. Frontend Scope for This Milestone

Build only enough UI to make the workflow testable.

Required:

- readable layout,
- clear current selection,
- obvious primary action,
- keyboard shortcuts,
- usable forms/buttons,
- responsive enough not to break,
- basic loading/error/empty states.

Not required yet:

- polished visual identity,
- animation,
- complex dashboard cards,
- elaborate design system,
- marketing landing page,
- advanced accessibility polish,
- extensive mobile optimization for staff UI,
- premium micro-interactions,
- visual storytelling,
- competition presentation styling.

The patient tracker and TV display only need functional visual clarity at this stage.

---

## 11. Non-Goals

Do **not** build:

- a Khanza replacement,
- doctor prescription entry,
- medical records,
- billing,
- BPJS integration,
- SATUSEHAT integration,
- full inventory management,
- procurement,
- hospital accounting,
- AI diagnosis,
- AI prescribing,
- chatbot,
- hospital-wide analytics,
- enterprise dashboard,
- complete authentication/SSO platform,
- complex permissions system,
- real-time distributed architecture unless genuinely necessary.

Avoid scope creep.

---

## 12. Product Rules

### Rule 1
If Khanza already performs a function adequately, do not rebuild it.

### Rule 2
The candidate application should remove friction from a narrow workflow, not create a second hospital platform.

### Rule 3
Common staff tasks should favor direct keyboard interaction.

### Rule 4
A first-time user should understand the core workflow without training material.

### Rule 5
Do not add AI merely because it sounds innovative.

### Rule 6
Do not fabricate hospital performance data.

### Rule 7
When assumptions are used, state them as assumptions.

### Rule 8
The old workflow must remain a fallback if the candidate application is unavailable.

---

## 13. Failure Model

The prototype should have a simple operational failure story.

If the candidate application fails:

```text
Candidate app unavailable
↓
Khanza remains operational
↓
Hospital continues existing workflow
```

For the MVP:

- database errors should fail visibly,
- mutations should not silently disappear,
- audit-relevant actions should be recorded,
- the application should be restartable without a specialist procedure,
- basic recovery instructions should be documentable.

The candidate application must not become a new single point of failure.

---

## 14. Demo Target

Do **not** build the demo as a product tour.

Demo one complete task:

```text
Prescription arrives
↓
Staff opens it
↓
Reviews
↓
Classifies
↓
Processes
↓
Prints label
↓
Marks ready
↓
Patient tracker updates
↓
TV queue updates
```

The demo should communicate:

- fewer interactions,
- lower cognitive load,
- clear status,
- immediate patient-facing effect.

Use measured prototype metrics where possible.

Examples:

```text
11 interactions → 4 interactions
```

or:

```text
Task completion: 42 sec → 15 sec
```

Only use numbers actually measured from the prototype or explicitly label them as simulation benchmarks.

---

## 15. MVP Acceptance Criteria

The core MVP is ready for the next phase when:

- seeded prescriptions appear correctly,
- staff can navigate prescriptions without using the mouse,
- prescription detail is readable,
- prescription status can progress through the full workflow,
- obat jadi / racikan classification works,
- label view is printable,
- patient tracker reflects queue state,
- TV display reflects ready/active queue state,
- important mutations create audit logs,
- invalid state transitions are prevented,
- basic error and empty states exist,
- the full workflow can be demonstrated from start to finish without manually editing the database.

---

## 16. Later Phase: Extensive FE

Only after the core MVP works end-to-end:

- refine information hierarchy,
- improve staff ergonomics,
- test first-use usability,
- improve keyboard-first interaction,
- create final visual identity,
- optimize typography and density,
- polish queue display,
- polish patient tracker,
- add final competition demo visuals,
- test the interface with non-technical users,
- measure task completion time,
- reduce unnecessary interaction count.

Frontend polish must improve adoption and speed, not merely make screenshots look modern.

---

## 17. Six-Month Direction

Competition MVP:

```text
Representative data
+
Working pharmacy workflow
```

Then:

```text
Validate assumed workflow
↓
Map actual Khanza integration points
↓
Read real prescription data
↓
Pilot with limited pharmacy workflow
↓
Measure staff time and friction
↓
Adjust to actual SOP
↓
Limited operational deployment
```

Long-term success:

> Pharmacy staff voluntarily continue using the workbench because it makes routine work easier than using the previous workflow alone.

---

## 18. One-Line Build Directive

> Build the smallest reliable pharmacy workflow layer that can receive a Khanza-originated prescription, move it from incoming to collected, generate a label, expose queue status, and record the important actions. Do not spend the current milestone on extensive frontend design.
