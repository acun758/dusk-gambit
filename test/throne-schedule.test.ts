import { strict as assert } from "node:assert";
import { test } from "node:test";
import { throneSeason, THRONE_SETTLEMENT_AT, THRONE_CYCLE_END } from "../src/lib/throne-schedule";

test("the inaugural cycle retains 2026 records throughout the extension", () => {
  assert.equal(throneSeason(new Date("2026-12-31T23:59:59Z")), 2026);
  assert.equal(throneSeason(new Date("2027-01-01T00:00:00Z")), 2026);
  assert.equal(throneSeason(new Date(THRONE_SETTLEMENT_AT)), 2026);
});
test("settlement includes October 1 in China time", () => {
  assert.equal(new Date(THRONE_CYCLE_END).toISOString(), "2027-10-01T16:00:00.000Z");
  assert.equal(throneSeason(new Date(THRONE_CYCLE_END)), 2027);
});