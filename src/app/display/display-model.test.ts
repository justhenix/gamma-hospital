import assert from "node:assert/strict";
import test from "node:test";
import * as displayModel from "./display-model";
import { getDisplayPresentation, type DisplayPayload } from "./display-model";

test("uses the newest ready entry as the hero queue and keeps the rest secondary", () => {
  const payload: DisplayPayload = {
    readyForPickup: [
      {
        queueCode: "A-024",
        displayNumber: "24",
        status: "READY_FOR_PICKUP",
        patientName: "Budi Santoso",
      },
      {
        queueCode: "A-023",
        displayNumber: "23",
        status: "READY_FOR_PICKUP",
        patientName: "Siti Rahma",
      },
      {
        queueCode: "A-020",
        displayNumber: "20",
        status: "READY_FOR_PICKUP",
        patientName: "Hasan Basri",
      },
    ],
    preparing: [],
    completed: [],
    timestamp: "2026-08-30T10:00:00.000Z",
  };

  const presentation = getDisplayPresentation(payload);

  assert.equal(presentation.heroReady?.queueCode, "A-024");
  assert.deepEqual(
    presentation.otherReady.map((item) => item.queueCode),
    ["A-023", "A-020"]
  );
});

test("returns an empty hero state when no queue is ready", () => {
  const payload: DisplayPayload = {
    readyForPickup: [],
    preparing: [],
    completed: [],
    timestamp: "2026-08-30T10:00:00.000Z",
  };

  const presentation = getDisplayPresentation(payload);

  assert.equal(presentation.heroReady, null);
  assert.deepEqual(presentation.otherReady, []);
});

test("public display items mask names and omit clinical context", () => {
  const transform = (
    displayModel as unknown as Record<string, unknown>
  ).toPublicDisplayItem;

  assert.equal(typeof transform, "function");
  if (typeof transform !== "function") return;

  const source = {
    queueCode: "A-024",
    displayNumber: "24",
    status: "READY_FOR_PICKUP",
    patientName: "Budi Santoso",
    doctorName: "dr. Example",
    department: "Poli Example",
    hasCompounded: true,
  };

  assert.deepEqual(transform(source), {
    queueCode: "A-024",
    displayNumber: "24",
    status: "READY_FOR_PICKUP",
    patientName: "Bu** Sa*****",
  });
});

test("waiting-room clock renders in Bangkok time", () => {
  const formatClock = (
    displayModel as unknown as Record<string, unknown>
  ).formatDisplayClock;

  assert.equal(typeof formatClock, "function");
  if (typeof formatClock !== "function") return;

  assert.deepEqual(formatClock("2026-08-30T15:02:03.000Z"), {
    time: "22.02.03",
    date: "Minggu, 30 Agustus 2026",
  });
});
