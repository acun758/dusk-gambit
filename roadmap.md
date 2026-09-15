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
- [ ] 真人对弈双方实时显示段位、头像与已装备棋子套装
- [ ] 注册登录账号持久保存段位、头像与装备
- [ ] 暗黑龙语残局通关后保存评分、解锁下一级并新增高难残局

## 小游戏移植准备
- [x] 接入军师端内引擎到 src/core/engine/ 并跑通 15 项回归测试
- [x] Worker 分包就位（Vite 独立 chunk + 降级分批让出主线程 + “复盘计算中 x%” 进度）
- [x] 对弈 AI 与复盘 review 改用统一引擎（ACPL / 失误标记 / 准确率）
- [x] 逻辑分离验收：core 内 0 React/0 DOM/0 硬编码规则数（已 grep 验证）
- [ ] 图片动工前先交 160 张外链图资产清单（来源/授权/建议处理，按版权风险排序）
- [ ] 四步完成后交军师终验（core 纯净性、复盘一致性、断网与外域请求）
- [x] 逻辑与画面分离：core/rules(chess.js 薄封装)、clock、settle（仅显示计算）、review、score
- [x] 数据访问收敛到 src/lib/db.ts（领域名词、无 supabase 字样），实时帧独立 realtime.ts，厂商 SDK 只在 src/lib/backend.ts
- [x] 字体砍到 2 套并自托管：Cinzel 标题（28KB）+ 思源黑/宋常用字子集（约 2MB，GB2312 一级 4544 字），正文走系统字体栈，昵称用 --font-ugc 系统字体；页面零外部字体请求
- [ ] 外链图片分批本地化，按页面分包

