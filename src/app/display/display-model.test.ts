import assert from "node:assert/strict";
import test from "node:test";
import { getDisplayPresentation, type DisplayPayload } from "./display-model";

test("uses the newest ready entry as the hero queue and keeps the rest secondary", () => {
  const payload: DisplayPayload = {
    readyForPickup: [
      {
        queueCode: "A-024",
        displayNumber: "24",
        status: "READY_FOR_PICKUP",
        patientName: "Budi Santoso",
        department: "Farmasi Rawat Jalan",
      },
      {
        queueCode: "A-023",
        displayNumber: "23",
        status: "READY_FOR_PICKUP",
        patientName: "Siti Rahma",
        department: "Farmasi Rawat Jalan",
      },
      {
        queueCode: "A-020",
        displayNumber: "20",
        status: "READY_FOR_PICKUP",
        patientName: "Hasan Basri",
        department: "Farmasi Rawat Jalan",
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
