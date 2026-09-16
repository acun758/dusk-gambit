## Current request
- [x] Unify highlighted controls with the global button corner-radius standard.
- [x] Audit and fix whole-app click/interaction latency; verify key pages and gameplay.

## 竞技品质升级（2026-09 评审，按阶段落地）
- [x] 第一阶段·公平性：和棋按期望分结算 + 分段 K 值（rank_k 16/24/32）
- [x] 第一阶段·公平性：起步分 2480 → 1200，前 10 局定级赛（K×2、无连胜加成）
- [x] 第一阶段·公平性：超时判负遵循 FIDE 6.9，胜方无成杀子力时判和（side_can_win）
- [x] 第一阶段·公平性：残局通关改加训练点+钻石，不再污染天梯分
- [x] 第二阶段·体验：预走子 premove、PGN 导出分享、求和/认输确认、悔棋（仅陪练）、再战一局
- [x] 第二阶段·UI：定级赛中段位暂不公开的展示（首页/页眉/残局/邀战卡）
- [x] 验收 B：matches.black_delta 双方各存加减分，黑方战报读真实 delta
- [x] 验收 D：服务端 chess.js 校验着法合法性（已在 submitMove），客户端 cp 入库前 clamp ±1500
- [x] 验收 E：AI 档位诚实化 800/1100/1400/1700
- [x] 验收 F：删除死代码 eloDelta()（K=24 旧版）
- [x] 第三阶段·内容：战术谜题（每日一题+四档闯关，64 题）；多赛制（1+0/3+2/10+0/15+10、好友对战）
- [x] 第三阶段·引擎：置换表+着法排序+评估补强；AI 已用 Stockfish 锚点重测，标称 900/1450/1750/1900
- [x] 第三阶段·引擎：AI 档位锚定改为报区间（终审 E 项交付）
- [ ] 第三阶段·复盘：云端深搜复核大漏着，端内只做快评
- [ ] 第四阶段·上线前：赛季与软重置、每日任务、观战、反作弊（引擎检测+每手用时记录）

## Current tasks
- [x] 将首页污渍纸浮窗标准统一到其余全部页面与共享面板
- [x] 统一全站页眉、按钮、媒体框、卡片圆角与浮层层级
- [x] 完整检查八个页面的浏览链路、空态、交互与代码疏漏
- [x] 修复检查中确认的高优先级运行问题并完成多端验证
- [x] 入口照片移除暗网格，改用旧报纸凸版印刷色调、网点与暖旧纸染色
- [x] 使用低饱和暗网格海报新增全屏游戏进入页，进入后保留原首页与导航
- [x] 替换入口页为电脑/iPad 横竖版/iPhone 横竖版五张专用构图图
- [x] 五张入口图完整套用统一旧报纸凸版色调、3px 网点与暖旧染色
- [x] 增大天梯页当前段位图标（宗师徽章）尺寸
- [x] 统一天梯页页眉、当前段位和段位榜层级
- [x] 统一全站名称、页面页眉与内容边线
- [x] 收拢首页重复约战入口并补齐军械典藏入口
- [x] 修复军械库、典藏的旧英文页眉和无效控件
- [x] 验证八个页面四类视口与关键交互链路
- [x] Verify real-name login/logout and live profile synchronization
- [x] Verify closest-rank matchmaking and ranked settlement
- [x] Complete promotion challenge UI and ceremony
- [x] Normalize top spacing across entry pages
- [x] Validate end-to-end flows and responsive layouts
- [x] 统一全站字体层级、中文间距与内容左右基线
- [x] 重排对弈页实名、搜索与对战码表单
- [x] 验证八个页面四类视口的字号、边线与表单

- [x] 头像上传（注册页与天梯档案区）、实名认证徽章替换金冠、约战认证门槛、页眉中英双语常显
- [x] 新增“暗黑龙语”棋子套装并接入军械典藏与全棋盘换装
- [x] 用新 12 枚透明徽章替换注册头像，并扩大 iPad 登录注册面板
- [x] 军械典藏所有套装统一为单枚棋子完整特写展示
- [x] 真人对弈双方实时显示段位、头像与已装备棋子套装（battle.tsx PlayerBar + pieceSetId 已核实）
- [x] 注册登录账号持久保存段位、头像与装备（profiles 已核实）
- [ ] 暗黑龙语残局新增高难残局关卡（保存评分与解锁链路已在）

## 小游戏移植准备
- [x] 接入军师端内引擎到 src/core/engine/ 并跑通 15 项回归测试
- [x] Worker 分包就位（Vite 独立 chunk + 降级分批让出主线程 + “复盘计算中 x%” 进度）
- [x] 对弈 AI 与复盘 review 改用统一引擎（ACPL / 失误标记 / 准确率）
- [x] 逻辑分离验收：core 内 0 React/0 DOM/0 硬编码规则数（已 grep 验证）
- [x] 图片动工前交付 292 项资产清单与 206 张用户上传缩略图核对册；189–206 主题背景按用户要求剔除
- [x] 军师终验通过：core 纯净、同局面 loss/标签一致、32 个四端页面检查无错误、无视觉外域请求
- [x] 逻辑与画面分离：core/rules(chess.js 薄封装)、clock、settle（仅显示计算）、review、score
- [x] 数据访问收敛到 src/lib/db.ts（领域名词、无 supabase 字样），实时帧独立 realtime.ts，厂商 SDK 只在 src/lib/backend.ts
- [x] 字体砍到 2 套并自托管：Cinzel 标题（28KB）+ 思源黑/宋常用字子集（约 2MB，GB2312 一级 4544 字），正文走系统字体栈，昵称用 --font-ugc 系统字体；页面零外部字体请求
- [x] 已确认的 194 项 CDN 图片/视频全部本地化；项目内视觉素材无外域请求
- [x] 用户补充六张主题背景，已按桌面、iPad、iPhone 比例裁切并接入六套页面主题
- [x] realtime.ts 实装链路状态 + 落子发件箱：断网可继续下，恢复后按原序补传（已验证 2 条排队→恢复→清空）
- [x] 后端适配层 src/lib/backend/：默认网关与云开发网关同签名，换云只改此目录，db.ts 接口（submitMove/claimTimeout/settle）不变
- [x] 对弈 AI 搬进 Worker：chooseMove/evaluatePosition 异步化（offloaded=true，主线程不卡），保留同步兜底
- [x] 用户提供的六套新画面已压缩为入口一套、内页五套，并适配电脑、iPad、iPhone 横竖屏
- [x] 使用入口页 1/2/3 三张定版图替换入口画面，并适配电脑、iPad、iPhone 横竖屏
- [x] 军械典藏页套装图与战盘图统一旧报纸凸版印刷效果
- [x] 修复手机登录表单图标与输入文字重叠错位


- [x] 页眉品牌名与进入页统一为「玄弈 · DUSK GAMBIT」（手机竖排不截断，桌面双语横排；桌面侧栏品牌同步更新）
- [x] 修复手机页眉标题显示不全（原「王座殿堂」小字英文被截断，已随品牌改版消除）
- [x] Add wooden move/capture/check/countdown/game-end sounds with a header mute toggle.

## 第 25 号回执追问
- [x] 七条追问逐条作答 + 代码包交终审（2026-09-16 已交付）

## 27 号终审报告（鲲 2026-09-16）整改项
- [x] G3 三尺寸截图入档（/mnt/documents/终审归档/三尺寸截图-2026-09-16/）
- [ ] G1 迁移链补全：残局门槛 UPDATE + 58 题全量 INSERT 快照迁移（FIDE 榜单开工前置）
- [x] G2 脚本参数化完成；58 题校验 0 非法/0 解法断裂；锚定每对 20 局重跑（结果存 reports/anchor-benchmark-2026-09-16.json）
- [ ] 依锚定结果复核 AI 四档标称（专家/宗师实测重合，需拉开难度差）
- [ ] 未声明变更流程教训：范围外变更必须在答复中声明；数学断言标注前提（定级期 K=64 而非 32）
- [ ] 待鹏拍板：付费套装门槛 猩红女帝 1600 / 圣堂裁决 2200
- [x] 残局明视棋盘棋子改用与对弈棋盘一致的线条（空心）符号
- [x] 区分两处残局命名：对弈页「残局实战」/ 残局页「残局试炼 · 心算」
- [ ] FIDE 名人堂开工（表结构照 09:59 迁移版本，含四排名索引），顺带完成 G1/G2
