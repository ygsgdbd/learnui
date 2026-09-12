# Issue #22 — 双端 Button 验收记录

- Issue: https://github.com/ygsgdbd/learnui/issues/22 （本记录不是 release sign-off）
- 日期：2026-09-12，Asia/Shanghai；执行者：Codex。
- 基线：`ceb0d830de258b90e3f56d9bee0b828c7af0d411`，已包含 #17 Spinner；开始时与最新 `origin/main` 一致，无开放 PR，#22 无评论/实现认领。分支：`codex/issue-22-button`。
- 代码标识：最终提交见 Git 历史；本记录与 Button 实现一同提交，关键运行源码 SHA-256 见 [source-sha256.txt](evidence/issue-22-button/source-sha256.txt)。Native Debug binary 通过本 worktree Metro `8089` 加载 JS，不能仅用 binary 时间代表 JS 版本。
- 用户原有 `.codegraph/`、`.codex/` 未纳入改动。自动生成的 iOS/Android 工程只用于本地构建，不是发布源码。

## 契约与实现

两个 public roots 均导出 `Button`、`ButtonProps`、`ButtonVariant`、`ButtonSize`。五 variants、三 sizes；`onPress`、`isDisabled`、`isPending`；平台 ref 与 consumer class/style。文本 children 自动提供动作名称，复杂 children 的类型需要显式平台名称；开发期空名称有反馈。Pending 保留根与动作名称，Spinner 为装饰，busy 属于根。Native 的辅助功能激活回调也被 unavailable 状态守卫。

press down 立即开始反馈，目标 scale 0.98，150ms；reduced motion 不缩放，保留 opacity。Native consumer transform 与内部 scale 组合。背景/前景使用语义 token 派生色保证默认按压态对比度；消费者自行覆盖的颜色仍需自行验收。

## TDD 与 review

公开 consumer seam 已由父规格 #11 和本任务确定。

- Web：未导出 Button 时 TS2305；缺按压样式和 `aria-busy` 的真实浏览器 RED；实现后 GREEN。RAC 会过滤 `aria-busy`，内部 render 将它放回同一个 DOM root。
- Native：public pending/name/ref 测试 RED → GREEN；轴/样式/动画偏好逐片验证；辅助功能激活绕过 pending 的新增公共回归测试 RED → GREEN。
- 真实 iOS 曾出现透明黑字、无圆角。外部 registry 缺样式证明旧 `bg-[--var]` 语法未生成规则。修复为明确 `var(...)` 语法，再检查实际生成 registry；这也是为何 bundle 成功不代表视觉通过。

### Standards

发现外部 fixture 只搜源码字符串不足以证明样式生成。已补 Web 默认44px/inline-flex/150ms、consumer22px/30px CSS规则，以及 Native registry 中实际 backgroundColor/color/minHeight/borderRadius/paddingLeft/Right 规则。复核关闭；不把静态产物校验当作运行时证据。

### Spec

发现 Native 辅助功能回调可绕过 pending，以及浅色 pressed 对比度不足。分别加 unavailable 守卫/公共测试和私有派生色；复核关闭。真实读屏、真机和性能证据仍独立未验证。

## 最终集成复审

以 `ceb0d83...HEAD` 分别执行 Standards / Spec 复审。两轴均发现 Native 内部 Text 未消费公共 `--learnui-font-sans`，已显式应用字体变量 utility 并保留字重，公共入口测试 RED → GREEN。实际 tarball consumer 双平台 registry 已验证生成 `fontFamily` 对该 token 的引用，fixture 的 Avenir Next 覆盖保留；两轴复核关闭该 finding。

字体修复后 Native 全量 **38/38**、Button **16/16**、pack/Publint、全仓 typecheck、真实 Native tarball 外部安装与双平台 export 通过。对应日志 `/tmp/learnui-button-integration-native.log`、`/tmp/learnui-button-integration-typecheck.log`、`/tmp/learnui-button-font-tarball.log`。[最终自动化摘录](evidence/issue-22-button/integration-verification.txt)。iOS 原 development build 重新加载字体修复后的 JS，Button 正常显示且无字体报错，见[截图](evidence/issue-22-button/ios-font-final.png)和[AX](evidence/issue-22-button/ios-font-final.txt)；此次增量复查不重复签署真人读屏或性能。初次运行源码标识保留为 [source-initial-sha256.txt](evidence/issue-22-button/source-initial-sha256.txt)，字体增量运行源码保留为 [source-font-sha256.txt](evidence/issue-22-button/source-font-sha256.txt)，主分支整合后的源码使用 `source-sha256.txt`。

## Card / Badge 主分支整合

已本地整合 `origin/main` 的 Badge merge `24c2ad5f86499a60f58c2737118785feacb7883e`（包含 Card merge `18c4ffe`）。按意图合并双端 exports、Gallery 入口、两个真实 consumer 示例与 smoke 检查；三组件功能均保留。Native 使用主分支 `assertCompiledClass` 统一解析实际生成 registry，Button 六项断言完整迁移。独立只读复核未发现误删、遗漏或减弱断言。

整合后：Web **4 × 24 + forced-colors 1 = 97/97**；96 份 axe 报告 **0 violations、0 incomplete**；Native **59/59**；Foundation **12/12**。双端 package builds、pack/Publint、全仓 typecheck、Storybook static build、工作区外真实 Web/Native tarball consumer、Gallery 双平台 production export 和 public import 扫描通过。Card 三浏览器高对比/主题/200%文字重排回归通过。最终外部 Web tarball 在 Chromium/Firefox/WebKit 实际 pointer/Enter/Space、pending focus/name/busy、disabled、22px/30px覆盖、动态 reduced-motion 和 Card/Badge 示例共存复验通过，无页面异常；[行为与产物哈希](evidence/issue-22-button/merged-external-browser.json)。[整合验证摘录](evidence/issue-22-button/merged-verification.txt)与[完整 axe 统计](evidence/issue-22-button/merged-web-axe-summary.json)。CI 工作流尚属 #26，本 PR 无远程 checks，以上是实际本地验证结果，不声称 CI 已运行。

最终整合版仍使用已编译 development binary，由重启后的本 worktree Metro 加载整合源码：iOS [首页五入口](evidence/issue-22-button/ios-merged-home.txt)与 [Button](evidence/issue-22-button/ios-merged.png)，Android [首页五入口](evidence/issue-22-button/android-runtime/integrated-home.png)与 [Button](evidence/issue-22-button/android-runtime/integrated-button.png)均实际复查通过。源码对应本次合并提交内容及 `source-sha256.txt`，未再次改动原生依赖。Android API36、density420，三尺寸实际AX高度换算均不少于44dp；动画三项设置恢复为1，见[读回结果](evidence/issue-22-button/android-runtime/animation-restored.json)。

## 自动化与 package/bundle

最终复验结果如下；完整本地日志在本节列出，关键截图/AX结果保存在 `evidence/issue-22-button/`。执行环境沿用锁文件；`pnpm_config_verify_deps_before_run=false` 仅用于已安装依赖后的检查，避免 PNPM 并发自动安装重建输出。

- Web Storybook：全量15稳定stories × Chromium/Firefox/WebKit/Chromium reduced-motion = **60/60通过**（其中Button28项）。串行复跑未改配置/断言/超时；WebKit15份完整axe报告均0 violations、0 incomplete。
- Web 外部真实 tarball：安装、类型负例/正例、生产构建、默认及覆盖 CSS、单 React/ReactDOM runtime 检查通过。Chrome/Firefox/WebKit 实际 pointer、Enter/Space、pending focus/busy 和 override 通过；Firefox/WebKit 动态 reduced motion 通过。仅 favicon 404，无应用异常。
- Native 外部 fixture：RN 0.86.2 的传递 Metro ^0.84.3 当天会解析到不完整的0.84.6发布，fixture 将相关依赖限定到仓库锁文件已验证0.84.5；Expo/Uniwind直接Metro0.87保持不变。此限制只在外部fixture，未修改公共package peer契约。
- Foundation 12 tests通过；Native完整37 tests通过，最后transform改动后的受影响Button15 tests再次通过。
- 最终全仓typecheck、Storybook静态build、Web/Native package build、Publint/pack manifest通过。构建均多次从clean输出执行，Native prepack也再次执行clean Bob。
- 最后transform修复的真实Native tarball已重新安装：类型正/负例、双平台export、实际生成registry、runtime去重通过。外部安装解析Uniwind1.12.0；Gallery锁文件使用1.11.0，两个consumer环境分别验证。
- Gallery iOS/Android production export及public-import扫描通过；自动生成native/依赖目录排除在host源码import扫描之外。
- 顶层`pnpm test`曾因高负载导致Firefox握手超时、未执行断言。随后将Web全suite按4引擎串行、Native链串行完成；不是把失败的顶层命令写成成功。
- 日志：`/tmp/learnui-button-web-full-tests.log`、`/tmp/learnui-button-native-final-tests.log`、`/tmp/learnui-button-final-typecheck.log`、`/tmp/learnui-button-storybook-build.log`、`/tmp/learnui-button-final-tarball.log`、`/tmp/learnui-button-native-final-export.log`。
- Export 仅证明打包，不证明安装、流畅度、读屏或真机。

## 实际 Native development builds

### iOS Simulator

- Xcode 26.5 (17F42)，iPhone 17 Simulator / iOS 26.5，UDID `1A01053A-461C-4524-8DFB-2C8CD2E6EBF4`。
- Expo57 / RN0.86.2，Debug development client `dev.learnui.gallery`。
- `expo prebuild --no-install`；`expo run:ios --device <UDID> --no-bundler` 实际编译成功、安装和启动，0 errors/2构建脚本警告。
- Expo自动启动地址198.18.0.1:8081触发ATS错误；随后显式development URL连接127.0.0.1:8089，正常进入本worktree Gallery/Button页。旧错误不算组件错误或验收通过。
- pending触发1次后再点击5次，保存计数仍1；快速点击20次，计数20。AX快照保留 `Save lesson` Button，没有第二个Spinner节点。此为AX结构证据，不是VoiceOver口播或真实读屏焦点证据。
- disabled/pending固定样本各点击3次，共享计数仍为0，见[计数AX记录](evidence/issue-22-button/ios-disabled-count.txt)。
- token语法修复后实际显示蓝色填充、圆角及白色文字。
- 实际系统Reduce Motion开启后修复版正常渲染，页面确认偏好为enabled；20次快速点击计数20，pending连续5次保存计数1。默认截图中名称/Spinner结构正确。
- 显式dark、显式light、system跟随OS dark实际通过；[深色](evidence/issue-22-button/ios-dark.png)、[跟随系统深色](evidence/issue-22-button/ios-system-dark.png)、[系统浅色](evidence/issue-22-button/ios-system-light.png)。
- 五种variants、sm/md/lg、disabled/pending/disabled+pending、命名图标和consumer override/长文本重排已在实际页面查看，[variants/sizes截图](evidence/issue-22-button/ios-variants-sizes.png)与[状态AX](evidence/issue-22-button/ios-sizes-states.txt)。无额外Spinner AX节点；真人读屏焦点仍未签署。
- 最后transform修复后同一Gallery实例从OS reduce off切on，页面收到enabled且无原崩溃，[AX证据](evidence/issue-22-button/ios-live-reduced-after-fix.txt)。
- iOS原生大标题遮挡了Button页主题控制，按RN文档加入ScrollView `contentInsetAdjustmentBehavior="automatic"`，实际页面复核可见可点，Gallery typecheck再次通过。
- 实际验证受高负载影响，部分短tap/合成scroll没有效果；使用200ms触摸/坐标拖动并检查实际状态后才记通过。

### Android Emulator

- AVD `Medium_Phone_API_36.0`，serial `emulator-5554`。
- JBR25因Prefab子进程native-access warning失败；所谓JDK23路径实际指向26，不能当作兼容版本。临时下载官方Temurin21.0.12.1+1后真实Gradle build成功（455tasks，约27分钟）。不是Expo Go。
- 首轮因内存不足离线、package service未就绪而安装失败，历史排障保留在[首次 Android 记录](evidence/issue-22-button/android-acceptance.md)。
- 本轮内存恢复后原AVD成功启动，复用同一APK实际 `adb install` Success，启动并进入Button；**compile/install/launch 已 VERIFIED**。矩阵运行对应字体修复提交 `25e1a25`，使用本 worktree Metro8089加载JS。
- 实际验证：五variants、三sizes、system/light/dark预览、disabled状态及5次点击阻断、pending五次重复保持保存计数1、rapid20次计数0→20、命名图标、系统减少动画开启后仍可激活且恢复设置无崩溃。AX保留Save lesson子文本且无Spinner节点，不能据此声称真人TalkBack口播已验证。
- [运行补验与环境记录](evidence/issue-22-button/android-runtime/android-runtime-resume.md)、[快速点击](evidence/issue-22-button/android-runtime/rapid20.txt)、[pending](evidence/issue-22-button/android-runtime/pending-repeat.txt)、[减少动画](evidence/issue-22-button/android-runtime/reduced-all-on-ax.json)。

## 运行中发现并修复的缺陷

1. Native旧token class不生成背景/文字/圆角：显式var语法修复，实际registry + iOS渲染复核。
2. 真实iOS Reduce Motion从false切true时，Animated transform由数组移除为空值触发RN `processTransform`异常：改为合法静态`[{scale:1}]`，实时切换公共回归RED→GREEN；运行复验单列。
3. Gallery disabled/pending样本绑定同一个真实计数回调，避免无回调样本无法证明阻断。

## 证据与环境清理

- [自动化结果摘录](evidence/issue-22-button/verification.txt)、[Web axe完整结果摘要](evidence/issue-22-button/web-axe-summary.json)、[关键源码SHA-256](evidence/issue-22-button/source-sha256.txt)。
- Android APK保留 `/tmp/learnui-button-android-evidence/app-debug.apk`，SHA-256见 [binary记录](evidence/issue-22-button/android-binary-sha256.txt)；只关闭本任务emulator-5554及其独立daemon，未wipe数据、未触碰其他模拟器/物理设备。
- 本地Metro8089与iOS验收session已关闭；iOS系统外观和Reduce Motion恢复到最初浅色/关闭。
- 生成的本地原生工程移入 `/tmp/learnui-button-native-projects/` 保留，不进入git提交。

## 留待 #27 的 RC 门槛（unverified）

- 支持范围内的物理 iPhone / Android phone 验收；iPad / Android tablet 的 RC 验收可用 Simulator / Emulator，本次仍未签署。
- VoiceOver/Safari、NVDA/Chrome、真实iOS VoiceOver/Android TalkBack口播、焦点顺序及无重复焦点的人类确认。
- 最大字体/显示大小的完整验收，真实键盘/触摸体验、人类批准的视觉baseline diff。
- production-like release/profile的帧节奏和流畅度；开发模式、高负载模拟器、Jest动画目标与截图都不能证明性能。

以上真人读屏、人工视觉基线批准、真机及 production-like 性能验收依 ADR-0009 和矩阵 Gate cadence 留待 [#27](https://github.com/ygsgdbd/learnui/issues/27)，不是自动阻塞组件 PR 的理由。Android development build 的 compile/install/launch 属于每个相关 PR 的独立门槛，本轮已补齐，未转移到 RC。未发布 npm、未声明 V1 可发布。
