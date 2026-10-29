/** Award-cycle selectors only; scores remain authoritative on the server. */
export const THRONE_SETTLEMENT_AT = "2027-10-01T23:59:59.999+08:00";
export const THRONE_CYCLE_END = "2027-10-02T00:00:00+08:00";
export function throneSeason(now = new Date()): number {
  if (now.getTime() < Date.parse(THRONE_CYCLE_END)) return 2026;
  return now.getUTCFullYear();
}