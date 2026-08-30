import assert from "node:assert/strict";
import test from "node:test";
import { formatDate, formatTimeOnly } from "./utils";

test("pharmacy timestamps render in Bangkok time regardless of host timezone", () => {
  const timestamp = "2026-08-30T15:02:03.000Z";

  assert.equal(formatTimeOnly(timestamp), "22.02");
  assert.equal(formatDate(timestamp), "30 Agu 2026, 22.02");
});
