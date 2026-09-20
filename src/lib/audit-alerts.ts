/**
 * 风控告警文案（纯展示，不含任何判定逻辑）。
 * 判定一律在服务端完成，这里只负责把 kind 翻成人话。
 */
export type AuditKind = "seq_mismatch" | "fen_mismatch" | "clock_skew" | "move_burst" | string;

export function auditAlertText(kind: AuditKind, lang: "zh" | "en"): { title: string; body: string } {
  const zh = lang === "zh";
  switch (kind) {
    case "seq_mismatch":
      return zh
        ? { title: "走子被拒：棋谱对不上", body: "你提交的着法基于旧棋谱，已按服务端局面追帧。请重新落子。" }
        : { title: "Move rejected: move list mismatch", body: "Your move was based on an outdated move list. The board has been resynced — play again." };
    case "fen_mismatch":
      return zh
        ? { title: "走子被拒：局面对不上", body: "你的棋盘与服务端局面不一致，已强制同步。请重新落子。" }
        : { title: "Move rejected: position mismatch", body: "Your board did not match the server position. It has been resynced — play again." };
    case "clock_skew":
      return zh
        ? { title: "检测到本地时间异常", body: "你的设备时间与服务端相差过大。计时一律以服务端为准，此次已记录。" }
        : { title: "Device clock looks wrong", body: "Your device time is far from server time. The clock always follows the server; this has been logged." };
    case "move_burst":
      return zh
        ? { title: "落子节奏留痕", body: "本次落子间隔极短（预移位属正常玩法），仅作低严重度记录，不影响对局与积分。" }
        : { title: "Move tempo noted", body: "An extremely short interval was logged. Premoves are legitimate play; this is a low-severity note only." };
    default:
      return zh
        ? { title: "检测到异常走子", body: "服务端已记录本次异常，对局结果仍以服务端判定为准。" }
        : { title: "Irregular move detected", body: "The server logged this event. Results are always decided by the server." };
  }
}
