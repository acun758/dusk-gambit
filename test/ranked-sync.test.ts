import { strict as assert } from "node:assert";
import { test } from "node:test";
import { hasRankedSettlement } from "../src/lib/ranked-sync";

test("only server-confirmed finished ranked games expose a rating update", () => {
  assert.equal(hasRankedSettlement("cloud", "over", 32), true);
  assert.equal(hasRankedSettlement("cloud", "over", null), false);
  assert.equal(hasRankedSettlement("cloud", "live", 32), false);
});
test("AI practice never counts as ranked settlement", () => {
  assert.equal(hasRankedSettlement("local", "over", 32), false);
});
test("a confirmed zero delta remains a valid settlement", () => {
  assert.equal(hasRankedSettlement("cloud", "over", 0), true);
});