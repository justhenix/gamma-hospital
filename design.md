# Design System & Frontend Specification (`design.md`)

## 1. Core Principles & Anti-Slop Rules

1. **No LEDs / Pulsing Bulbs:** No glowing neon dots, pulsing green lights, or decorative indicator animations. Use solid, readable badges with clear semantic text labels.
2. **No Eyebrows:** No tiny, spaced-out uppercase overhead micro-labels (`TRACKING / SUBTITLE`). Use direct, clear hierarchy.
3. **No Monofonts in UI:** Monospace is prohibited for regular UI text, patient names, departments, status labels, dates, and times. Monospace is reserved exclusively for technical codes/identifiers if strictly needed.
4. **No Micro-Fonts (< 12px):** Minimum text size across the entire application is `12px` (`text-xs`). Body, data rows, and interactive controls must be `14px` (`text-sm`) or larger.
5. **No Random Fragmented Cards:** Avoid scattering UI into disconnected card boxes. Use cohesive panels, tables, and structured data grids.
6. **No Buggy / Heavy Transitions:** Interactions must be instant, crisp, and predictable. No sluggish CSS transitions or layout-shifting animations.
7. **Shadcn-First:** Standard shadcn primitives (`Button`, `Table`, `Badge`, `Input`, `Card`, `Tabs`, `Dialog`) configured with consistent tokens.

---

## 2. Color Palette (OKLCH Tokens)

All interface colors must derive from these exact theme tokens:

### Light Mode (`data-theme="light"`)
```css
:root[data-theme="light"], :root {
  --text: oklch(19.05% 0.015 162.96);
  --background: oklch(93.79% 0.006 239.82);
  --primary: oklch(68.95% 0.114 176.42);
  --secondary: oklch(70.86% 0.082 127.22);
  --accent: oklch(70.75% 0.044 264.24);

  /* Semantic Derivations */
  --card: oklch(98% 0.003 239.82);
  --card-foreground: var(--text);
  --border: oklch(85% 0.01 239.82);
  --input: oklch(88% 0.01 239.82);
  --muted: oklch(88% 0.01 239.82);
  --muted-foreground: oklch(45% 0.02 162.96);
  --destructive: oklch(62% 0.22 28);
  --destructive-foreground: oklch(98% 0 0);
}
```

### Dark Mode (`data-theme="dark"`)
```css
:root[data-theme="dark"] {
  --text: oklch(95.10% 0.010 164.87);
  --background: oklch(19.28% 0.009 240.39);
  --primary: oklch(76.55% 0.117 177.46);
  --secondary: oklch(60.71% 0.084 127.62);
  --accent: oklch(43.12% 0.050 263.83);

  /* Semantic Derivations */
  --card: oklch(24% 0.01 240.39);
  --card-foreground: var(--text);
  --border: oklch(32% 0.015 240.39);
  --input: oklch(28% 0.015 240.39);
  --muted: oklch(28% 0.015 240.39);
  --muted-foreground: oklch(72% 0.015 164.87);
  --destructive: oklch(65% 0.20 25);
  --destructive-foreground: oklch(98% 0 0);
}
```

---

## 3. Typography Hierarchy

### Font Families
- **Headings, Display, & Brand:** `Plus Jakarta Sans`, sans-serif
- **Body, Table Cells, Form Controls, & UI:** `Inter`, sans-serif
- **Number Displays (Big Queue Codes, Clocks, Counters, Timestamps):** `Plus Jakarta Sans` / `Inter` + `tabular-nums` (`font-sans tabular-nums`)
- **Code / Raw Tokens Only:** `ui-monospace`, monospace (strictly for code syntax, forbidden for regular numbers)

### Scale & Hierarchy

| Role | Font Family | Size | Weight | Line Height | Tracking / Features |
|---|---|---|---|---|---|
| Display / TV Board (Big Numbers) | Plus Jakarta Sans | 48px - 64px (`text-5xl` - `text-6xl`) | 800 (Bold) | 1.1 | `tabular-nums`, -0.02em |
| Page Heading (H1) | Plus Jakarta Sans | 24px (`text-2xl`) | 700 (Bold) | 32px | -0.015em |
| Section Heading (H2) | Plus Jakarta Sans | 18px (`text-lg`) | 600 (Semibold) | 24px | -0.01em |
| Subheading (H3) | Plus Jakarta Sans | 15px (`text-base`) | 600 (Semibold) | 22px | normal |
| Body / Data Cells | Inter | 14px (`text-sm`) | 400 / 500 | 20px | normal |
| Table Queue Codes & Numbers | Inter | 14px - 16px (`text-sm` - `text-base`) | 700 (Bold) | 20px | `tabular-nums` |
| Metadata / Small | Inter | 12px (`text-xs`) | 500 (Medium) | 16px | normal |

> **Strict Rules:**
> 1. No font size below `12px` (`0.75rem`). Every label, helper note, or timestamp must be at least `12px` for clinical legibility.
> 2. **Number Display:** All numerical values, queue codes (e.g. `A-001`), clocks, counts, and timers must use **Sans-Serif with Tabular Figures** (`font-sans tabular-nums`) to maintain fixed column widths and crisp geometry without clumsy monospace fonts.

---

## 4. Spacing & Component Layout

- **Page Container:** Max width `1280px` (`max-w-7xl`), horizontal padding `1.5rem` (24px).
- **Surface Elevation:** Subtle 1px solid border (`var(--border)`) on `var(--card)` background with soft shadow (`shadow-sm`).
- **Radius:** Consistent `0.375rem` (`rounded-md`).
- **Interactive Focus:** Clear outline ring with 2px offset (`focus-visible:ring-2 focus-visible:ring-[var(--primary)]`).

---

## 5. View Specific Rules

### 5.1 Staff Workbench (`/`)
- Single unified table with keyboard focus highlight (`J`/`K`/`Enter`).
- Tab filters with item count badges in `Inter` font.
- Clean rows: Queue code, Patient Name, Doctor/Department, Items, Classification, Status, Time, Action.

### 5.2 Prescription Detail (`/prescriptions/[id]`)
- Two-column info panel: Patient Demographics & Order Clinical Data.
- Distinct Classification Selector (`Obat Jadi` vs `Racikan`) with instant audit recording.
- Clear status transition buttons without destructive confusion.
- Prescription items table with clear dosage and signa instructions.
- Full chronological audit history.

### 5.3 Medication Label (`/prescriptions/[id]/label`)
- Format: Standard 100mm x 60mm thermal sticker roll.
- High-contrast black/white print view.
- Prominent boxed signa with ample padding and zero text overlapping.
- Download PDF streaming option alongside browser print.

### 5.4 TV Display (`/display`)
- High-contrast 2-column layout: Ready for Pickup (prominent) vs Preparing.
- Bold queue codes readable at 5-10 meters distance.
- Masked patient names (`Si** Ra****`) for privacy.
- Clean digital clock with 3-second live refresh.

### 5.5 Patient Tracker (`/track/[queueCode]`)
- Single focused status card for mobile and desktop.
- 5-step clear progress pipeline with checkmarks.
- Clarification banner when doctor confirmation is in progress.
- Ready for pickup banner directing patient to counter.
- Zero clinical or sensitive medical data exposed to unauthenticated viewers.
