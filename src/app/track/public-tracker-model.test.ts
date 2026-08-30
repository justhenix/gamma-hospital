import assert from "node:assert/strict";
import test from "node:test";
import { toPublicTrackerPayload } from "./public-tracker-model";

test("public tracker payload exposes only queue progress and a masked patient name", () => {
  const payload = toPublicTrackerPayload({
    queueCode: "B-002",
    status: "READY_FOR_PICKUP",
    updatedAt: new Date("2026-08-30T15:02:03.000Z"),
    patientName: "Rina Kartini",
  });

  assert.deepEqual(payload, {
    queueCode: "B-002",
    status: "READY_FOR_PICKUP",
    updatedAt: "2026-08-30T15:02:03.000Z",
    patientName: "Ri** Ka*****",
  });

  assert.equal("mrn" in payload, false);
  assert.equal("department" in payload, false);
  assert.equal("doctorName" in payload, false);
  assert.equal("prescriptionNumber" in payload, false);
  assert.equal("hasCompounded" in payload, false);
});
