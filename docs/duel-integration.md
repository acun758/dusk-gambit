# 对弈实时对接文档 v1（给鲲）

范围：对弈页（`/battle`）的**引擎调用协议**、**WebSocket 消息**、**断线追帧字段**。
前端已按本文档实现（`src/lib/duel-protocol.ts` / `src/lib/duel-client.ts`）。
未配置服务端时前端使用同协议的本地仲裁器兜底；配置环境变量
`VITE_DUEL_WS_URL=wss://<host>/duel` 后自动切换到真实服务端，UI 无需改动。

首个上线赛制：**3+2 快棋**（base 180000ms，increment 2000ms）。

---

## 1. 引擎调用协议（端内 WASM，深度 4~6）

本地引擎跑在 Worker 里，主线程只发消息、不阻塞渲染。

请求：
```jsonc
{ "id": "req-17", "cmd": "search", "fen": "<FEN>", "depth": 5, "movetimeMs": 400, "skill": 12 }
{ "id": "req-18", "cmd": "legal",  "fen": "<FEN>" }          // 合法着法列表，用于落子高亮
{ "cmd": "stop" }  { "cmd": "newgame" }
```
响应：
```jsonc
{ "id": "req-17", "type": "bestmove", "uci": "g1f3", "san": "Nf3", "cp": 31, "depth": 5, "nodes": 48211, "ms": 380 }
{ "id": "req-17", "type": "info", "depth": 4, "cp": 24, "pv": ["g1f3","d7d6"] }   // 可选，流式
{ "id": "req-18", "type": "legal", "moves": ["e2e4","e2e3", "..."] }
```
约定：
- 深度上限 6；`movetimeMs` 硬上限 600ms，保证手机零延迟感。
- 云端只做**复盘深算**（depth ≥ 28）与**天梯校验**，不参与实时对局。
- 引擎结果永远不作为对局仲裁依据，仲裁只认服务端。

---

## 2. WebSocket 消息

连接：`wss://<host>/duel?match=<matchId>`，鉴权 token 走首帧 `join`。
所有服务端帧带单调递增 `seq`（每个 match 内唯一，从 1 开始）。

### 客户端 → 服务端
| t | 字段 | 说明 |
|---|---|---|
| `join` | `matchId, token, lastSeq?` | 首次连接或重连；带 `lastSeq` 即请求追帧 |
| `move` | `matchId, ply, uci, san?, clientTs` | 提交着法，服务端裁决合法性与时钟 |
| `resign` | `matchId` | 认输 |
| `draw_offer` | `matchId` | 和棋提议 |
| `resync` | `matchId, lastSeq` | 显式追帧 |
| `ping` | `ts` | 每 5s 一次，用于 RTT 与时钟补偿 |

### 服务端 → 客户端
| t | 字段 | 说明 |
|---|---|---|
| `state` | `seq` + 完整 `DuelState` | 权威快照（join / 追帧缺口过大时下发） |
| `move` | `seq, move, turn, serverTs` | 着法被接受；`move.clock` 是**加完补时后的**权威剩余时间 |
| `clock` | `seq, w, b, turn, serverTs` | 时钟心跳，建议 250ms 一帧；客户端只做插值，不自行扣时 |
| `eval` | `seq, cp, depth, mind?` | 评估分与心智指标（0~100） |
| `over` | `seq, outcome, reason, ratingDelta?` | `reason`: mate/resign/timeout/draw/abort |
| `rejected` | `seq, ply, code, fen` | `code`: illegal / not_your_turn / stale，附权威 FEN 供回滚 |
| `resync` | `seq, frames[]` | 缺失帧按序回放 |
| `pong` | `ts, serverTs` | 回显客户端 ts |

`DuelState`：`matchId, you, turn, fen, tc{base,inc,label}, clock{w,b}, moves[], cp, depth, mind{}, players{w,b}, status, outcome?, reason?`
`MoveFrame`：`ply, uci, san, by, cp?, zh?, clock{w,b}`

### 时钟规则（服务端权威）
1. 服务端在收到 `move` 时以 `serverTs` 结算走子方用时，再加 `inc`。
2. 客户端本地只做视觉插值；每收到 `clock`/`move` 帧即校正，误差 > 300ms 直接硬跳。
3. 超时判定只在服务端，客户端显示 00:00 后仍等待 `over` 帧。
4. 网络补偿：服务端对每方每步扣除 `min(RTT/2, 200ms)` 的宽容值。

---

## 3. 断线自动追帧

1. 客户端记录收到的最大 `seq`（`lastSeq`）。
2. 断线后按 1.2s / 2.4s / 4.8s（上限 10s）退避重连，`join` 携带 `lastSeq`。
3. 服务端保留每个 match 最近 **300 帧**（不含 `clock` 心跳）：
   - 缺口在缓冲区内 → 回 `resync{frames:[...]}`，客户端按 `seq` 顺序重放。
   - 缺口过大或 match 已重启 → 回完整 `state` 快照，客户端整屏重建。
4. 断线期间时钟继续在服务端走；重连后以第一帧 `clock` 为准。
5. 断线宽限 60s，超过判负（`over.reason = "timeout"`）。
6. 客户端 UI 状态：`connecting / live / resyncing / offline`，对应对弈页右上角连接指示灯。

---

## 4. 玩家档案接口（首页仪表盘）

首页展示玩家名、钻石、段位、胜场、胜率，目前走本地存储 `bs.profile.v1`。
服务端就绪后请提供：

```
GET  /api/public/profile/:uid  ->
{ "name":"Adiamond","diamonds":1280,"elo":2480,"tier":"Grandmaster","tierZh":"宗师",
  "wins":148,"losses":62,"draws":19,"streak":5 }

POST /api/public/match/result  ->
{ "matchId":"...", "outcome":"win|loss|draw", "eloDelta":8 }   // 返回更新后的 profile
```
段位阈值：≥2600 血誓君主 / ≥2500 神圣大宗师 / ≥2400 宗师 / ≥2200 大师 / 其余 骑士。
