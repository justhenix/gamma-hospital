import assert from "node:assert/strict";
import test from "node:test";
import {
  getNextSelectionIndex,
  getWorkbenchPrimaryTransition,
  getWorkbenchStatusLabel,
} from "./pharmacy-workbench-model";

test("moves selection down without passing the last queue item", () => {
  assert.equal(getNextSelectionIndex(0, "next", 3), 1);
  assert.equal(getNextSelectionIndex(2, "next", 3), 2);
});

test("moves selection up without passing the first queue item", () => {
  assert.equal(getNextSelectionIndex(2, "previous", 3), 1);
  assert.equal(getNextSelectionIndex(0, "previous", 3), 0);
});

test("returns zero when the queue is empty", () => {
  assert.equal(getNextSelectionIndex(4, "next", 0), 0);
});

test("uses stable Indonesian status labels in the client workbench", () => {
  assert.equal(getWorkbenchStatusLabel("WAITING"), "Menunggu");
  assert.equal(getWorkbenchStatusLabel("NEEDS_CLARIFICATION"), "Butuh Klarifikasi");
  assert.equal(getWorkbenchStatusLabel("READY_FOR_PICKUP"), "Siap Diambil");
});

test("returns the single primary pharmacy transition for the common workflow", () => {
  assert.deepEqual(getWorkbenchPrimaryTransition("WAITING"), {
    status: "VERIFIED",
    label: "Verifikasi resep",
  });
  assert.deepEqual(getWorkbenchPrimaryTransition("VERIFIED"), {
    status: "PREPARING",
    label: "Mulai siapkan",
  });
  assert.deepEqual(getWorkbenchPrimaryTransition("PREPARING"), {
    status: "READY_FOR_PICKUP",
    label: "Tandai siap diambil",
  });
  assert.deepEqual(getWorkbenchPrimaryTransition("READY_FOR_PICKUP"), {
    status: "COMPLETED",
    label: "Selesaikan",
  });
  assert.equal(getWorkbenchPrimaryTransition("NEEDS_CLARIFICATION"), null);
  assert.equal(getWorkbenchPrimaryTransition("COMPLETED"), null);
});
