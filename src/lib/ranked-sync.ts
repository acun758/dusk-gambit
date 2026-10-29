/** Only confirmed server settlement may be displayed as a completed rating update. */
export function hasRankedSettlement(
  transport: string,
  status: string,
  ratingDelta: number | null | undefined,
): boolean {
  return transport === "cloud" && status === "over" && typeof ratingDelta === "number";
}