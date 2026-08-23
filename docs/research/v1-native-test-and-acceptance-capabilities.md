# Native V1 测试与发布验收能力

- 对应问题：[Issue #9：定义 V1 测试、可访问性与发布验收矩阵](https://github.com/ygsgdbd/learnui/issues/9)
- 范围：`@learnui/native`、Expo Router Gallery、iOS、Android
- 研究日期：2026-08-23
- 约束依据：`packages/native/CONTEXT.md`、`DESIGN.md`、ADR-0002/0003/0005/0006/0007/0008

## 结论

Native V1 需要三层互不替代的证据：

1. **Jest + React Native Testing Library（RNTL）**证明 React 层 API、受控/非受控状态、回调、公开 parts、accessibility props 和 reduced-motion 分支符合合同。
2. **Bob build、`pnpm pack` 外部 consumer fixture、iOS/Android `expo export` 与 Expo development build**分别证明发布物、Metro 解析/生产 JS bundle，以及原生依赖编译、安装和启动。
3. **iOS 与 Android 真机人工验收**证明 VoiceOver/TalkBack 实际播报与焦点、动态字体、触摸、主题、系统辅助功能、动效手感和 frame pacing。

Production bundle 只证明“可打包”，不能证明原生 binary 能编译、screen reader 正确、布局在字体放大后不裁切或动画在真机流畅。Xcode/Android 工具链缺失不能降低 release gate。

**V1 不引入 Maestro 或 Detox 作为阻塞 gate。** 若团队需要一条非阻塞 Gallery smoke，可在 V1 后优先采用 Maestro；Detox 暂不采用，因为其官方当前只明确测试 React Native `0.77.x–0.84.x`，低于本仓库 RN `0.87`，且 Detox 明确说明 Expo 集成没有专门官方支持。

## 固定证据版本

| 项目 | 本研究固定版本/快照 | 直接官方证据 |
| --- | --- | --- |
| React Native | `0.87`；文档快照 `1091ab7` | [Testing Overview](https://github.com/react/react-native-website/blob/1091ab72a15e729db03a92dec8deaaebc454954e/website/versioned_docs/version-0.87/testing-overview.md)、[Accessibility](https://github.com/react/react-native-website/blob/1091ab72a15e729db03a92dec8deaaebc454954e/website/versioned_docs/version-0.87/accessibility.md)、[AccessibilityInfo](https://github.com/react/react-native-website/blob/1091ab72a15e729db03a92dec8deaaebc454954e/website/versioned_docs/version-0.87/accessibilityinfo.md)、[Performance](https://github.com/react/react-native-website/blob/1091ab72a15e729db03a92dec8deaaebc454954e/website/versioned_docs/version-0.87/performance.md) |
| Expo | SDK `56` branch，commit `3f6d20a` | [development build 与 Expo Go 边界](https://github.com/expo/expo/blob/3f6d20acf462f530679ba2bfc10eeb556fc08d1c/docs/pages/develop/development-builds/introduction.mdx)、[本地 native build](https://github.com/expo/expo/blob/3f6d20acf462f530679ba2bfc10eeb556fc08d1c/docs/pages/workflow/continuous-native-generation.mdx)、[`expo export` CLI](https://github.com/expo/expo/blob/3f6d20acf462f530679ba2bfc10eeb556fc08d1c/packages/%40expo/cli/src/export/index.ts) |
| RNTL | `13.3.3` | [测试环境](https://github.com/callstack/react-native-testing-library/blob/v13.3.3/website/docs/13.x/docs/advanced/testing-env.mdx)、[queries](https://github.com/callstack/react-native-testing-library/blob/v13.3.3/website/docs/13.x/docs/api/queries.mdx)、[`userEvent`](https://github.com/callstack/react-native-testing-library/blob/v13.3.3/website/docs/13.x/docs/api/events/user-event.mdx) |
| Jest | `30.0` 文档线 | [coverage threshold](https://jestjs.io/docs/30.0/configuration#coveragethreshold-object)、[snapshot testing](https://jestjs.io/docs/30.0/snapshot-testing)、[timer mocks](https://jestjs.io/docs/30.0/timer-mocks) |
| Reanimated | `4.1.5` | [reduced motion](https://github.com/software-mansion/react-native-reanimated/blob/4.1.5/packages/docs-reanimated/docs/guides/accessibility.mdx)、[Jest testing](https://github.com/software-mansion/react-native-reanimated/blob/4.1.5/packages/docs-reanimated/docs/guides/testing-with-jest.mdx) |
| Uniwind | commit `0f8bdcd` | [theme](https://github.com/uni-stack/uniwind/blob/0f8bdcd7134e93b5f4c33decc25984520181d99c/skills/uniwind/references/theming.md)、[Metro setup](https://github.com/uni-stack/uniwind/blob/0f8bdcd7134e93b5f4c33decc25984520181d99c/skills/uniwind/references/setup.md) |
| 可选 Maestro | CLI `2.8.0`；docs `da0a832` | [React Native selectors](https://github.com/mobile-dev-inc/maestro-docs/blob/da0a832f96e76f394fbfb2550d44f8618aa4d2eb/introduction/get-started/supported-platform/react-native.md)、[release](https://github.com/mobile-dev-inc/Maestro/releases/tag/cli-2.8.0) |
| 可选 Detox | release `20.51.3`；docs snapshot `d80a574` | [React Native support range](https://github.com/wix/Detox/blob/d80a57405142839dfe47ae95de6a191c42c3a7be/docs/introduction/partials/_getting-started-rn.md)、[Expo support status](https://github.com/wix/Detox/blob/d80a57405142839dfe47ae95de6a191c42c3a7be/docs/introduction/partials/_getting-started-expo.md) |

仓库当前固定 `pnpm@11.9.0`，但组件、Gallery 和测试 package 尚未实现，所以这里固定的是研究证据版本，不擅自替未来 manifest 选择依赖范围。Context7 MCP 未在当前运行环境暴露；本次按相同的 `resolve library -> 单一概念 query` 流程使用 `ctx7 0.5.8` 查询了 React Native、Expo、RNTL、Jest、Reanimated、Uniwind、Maestro 与 Detox，并以以上官方固定链接复核。

## 每层证据能证明什么

| 检查 | 可自动化 | 能证明 | 不能证明 / 必须人工补齐 |
| --- | --- | --- | --- |
| 纯 unit tests | 是 | state helper、variant 映射、class 合并、token 名称和 reduced-motion 分支 | React Native host、原生 accessibility tree、布局与帧表现 |
| RNTL component tests | 是 | 公共 API 渲染、ref/part 结构、role/name/state props、callback、disabled/pending、受控/非受控 React 状态 | VoiceOver/TalkBack 的真实措辞、焦点顺序、手势、native label relation、视觉布局 |
| Jest/Reanimated mock | 是 | 动画目标 style、计时分支、取消/重触发代码路径、reduced-motion 选项 | UI-thread 调度、spring 手感、掉帧、真机中断与 retarget |
| Uniwind theme/token tests | 是 | 必需 `--learnui-*` 名称、light/dark class/token 分支、Gallery override 状态 | 系统主题实时切换、真实 resolved color、对比度和过渡外观 |
| `expo export --platform ios/android` | 是 | Metro 能解析 public package entry、Uniwind CSS/source、JS 与 assets 能生成生产 bundle | native module 编译/链接、binary 安装/启动、平台行为 |
| Bob build + `pnpm pack` 外部 fixture | 是 | tarball allowlist、exports/types/source/styles、无 workspace alias、外部 Expo consumer 可 typecheck/bundle、无重复 React/RN runtime | Gallery 与真实设备交互质量 |
| Expo development build | 可在有工具链的 CI/本机自动构建；安装后 smoke 可部分自动化 | native dependency/config plugin 编译、binary 安装启动、Gallery 使用 public exports | 不会自动证明 screen reader、动态字体、reduced motion 或性能合格 |
| VoiceOver / TalkBack | 否，V1 必须人工 | 实际可聚焦元素、播报 label/role/state、顺序、激活手势、无重复焦点、动态状态是否打断 | RNTL 或 E2E 只能检查树和 labels，不能替代真实语音与导航体验 |
| Dynamic Type / font scale | 可静态检查未禁用 scaling；最终必须人工 | 真机最大字体下 label、description/error、Button/Badge 文字不裁切且布局可回流 | Jest 没有原生排版与测量；截图也不能证明可操作性 |
| real-device theme/preferences | 最终必须人工 | system/light/dark、iOS reduced transparency、Android high text contrast、reduced motion 的系统传播与视觉结果 | simulator/emulator 适合日常回归，不替代两端物理设备 |
| frame pacing | 最终必须在物理设备、production-like release/profile build 测 | touch-down 响应、UI/JS frame、快速重触发和 transform/opacity 路径在目标硬件上的表现 | development mode 有额外开销；bundle、Jest 和 Reanimated mock 都不测 FPS |

Android 官方要求把人工 screen-reader 测试作为可访问性测试的一部分，见 [Test your app's accessibility](https://developer.android.com/guide/topics/ui/accessibility/testing)。iOS 最终验收使用真实 VoiceOver，辅以 Apple 的 [Performing accessibility testing for your app](https://developer.apple.com/documentation/accessibility/performing-accessibility-testing-for-your-app)；静态 inspector/audit 只能发现部分问题。

## 受控 / 非受控的最小自动化合同

只有 TextField、Checkbox 与 Switch 具有该合同：

| 组件 | controlled 必测 | uncontrolled 必测 |
| --- | --- | --- |
| TextField | 输入触发 `onChange(nextValue)`；调用方未 rerender 新 `value` 前显示值不自行漂移；rerender 后同步 | 从 `defaultValue` 初始化；输入后内部值更新且 callback 正确；父级无关 rerender 不重置 |
| Checkbox | press 触发 `onSelectedChange(next)`；未更新 `isSelected` 前 checked 不持久改变；`isIndeterminate` press 请求 `true`，由调用方清除 mixed | 从 `defaultSelected` 初始化并在 press 后持久切换；disabled 不变也不 callback |
| Switch | 与 Checkbox 相同；快速连续 press 的最终请求序列正确，controlled prop 始终是视觉事实来源 | 从 `defaultSelected` 初始化并持久切换；disabled 不变也不 callback |

Button 的 `isPending` 是受调用方控制的 busy 状态但不是 controlled/uncontrolled value；Card、Badge、Divider、Spinner 没有非受控 state。

## 八组件 V1 最小矩阵

下表每一行都必须同时通过：RNTL/Jest、Gallery light/dark、iOS 真机、Android 真机。所有 public root/part 另有共同门槛：ref forwarding、consumer `className`/`style` 顺序、44×44 交互目标（适用时）、最大字体、public entry import。

| 组件 | RNTL/Jest 最小自动化 | 真机人工最小验收 |
| --- | --- | --- |
| Button | variants/sizes；press；disabled；pending 阻止重复 press、保留 name 且 root `busy`；内部 Spinner decorative；icon-only fixture 必须能按 role + name 查询 | touch-down 即时反馈；VoiceOver/TalkBack 读 button/name/disabled/busy；pending 不产生第二焦点；reduced motion 无 scale |
| TextField | controlled/uncontrolled；Label/Input/Description/ErrorMessage；disabled/readOnly/required/invalid；纯文本 label fallback；复杂 label 要求显式 Input label | 键盘输入与提交；label/error 实际播报与焦点；最大字体不裁切；错误变化不反复打断；两端平台输入差异 |
| Checkbox | controlled/uncontrolled；checked/mixed/disabled；mixed press 请求 `true`；仅 Root 是 accessibility element | label、checkbox 与 checked/mixed/disabled 播报；整行 hit target；快速触摸；最大字体与 error/description |
| Switch | controlled/uncontrolled；checked/disabled；仅 Root 可访问；Reanimated 目标和 reduced-motion 分支 | switch 状态播报；快速重复切换从 live position retarget、无跳变；reduced motion 无 thumb travel；双端 frame pacing |
| Card | 六个 parts、variants、refs；默认非交互且不自动 accessibility grouping | 最大字体内容回流；reading order 自然；light/dark surface/border；不出现多余容器焦点 |
| Badge | variants/colors/sizes；意义有文字；嵌入控件时 decorative 且含义并入父 label；无 press API | 最大字体不裁切；颜色不是唯一信息；Android high text contrast 与 light/dark 可读；无多余焦点 |
| Divider | 默认从 tree 隐藏；`isDecorative={false}` 才有 separator role；orientation/weight 映射 | decorative 时跳过；semantic 时确认两端实际播报可接受；hairline 在不同 scale/device 可见 |
| Spinner | standalone 必须 `label`、progressbar/busy；embedded decorative 且 busy 留在 owner；reduced-motion static/opacity fallback | standalone 播报一次且无重复 indicator 焦点；Button 内只聚焦 Button；reduced motion 不持续旋转；持续运行无可见掉帧 |

### Theme 与 motion 的横向抽样

- **Theme 不是只抽一个组件。** Gallery 的八个 component pages 都要在 system/light/dark 中展示主要状态；自动化检查 token/class contract，人工检查真实颜色、边框、disabled/invalid 和系统模式实时更新。
- **Motion 集中在 Button、Switch、Spinner。** Button 验证 touch-down immediate feedback；Switch 验证 critically damped、可中断和对称路径；Spinner 验证持续动效与 reduced-motion fallback。其他组件若只做 opacity/color state change，不额外扩张 V1 motion matrix。
- **Frame pacing 使用 production-like build。** React Native 官方明确 development mode 会影响 JS thread 表现；development build 仍是功能验收入口，但性能结论必须来自关闭开发开销的 release/profile 配置与物理设备。

## V1 release gates

### Gate A — 每个 PR 的自动化合同

- Native package typecheck、Jest/RNTL 全绿。
- 上述八组件最小自动化行为全部有测试；不以一个任意全局 coverage 百分比替代行为清单。Jest coverage 可设“不得低于已提交 baseline”，关键 state helper/controlled-uncontrolled 分支必须全覆盖。
- light/dark public token 名称合同、consumer override merge 顺序、root/part refs、无 private import 通过。
- Reanimated Jest setup 可断言目标 style 与 reduced-motion 分支，但测试名称必须避免声称“流畅”或“无掉帧”。

### Gate B — 发布物与 bundle

- Bob ESM/TypeScript build 连续两次从干净输出成功；pack manifest 只包含 ADR-0003 allowlist。
- 将真实 tarball 安装到 workspace 外的 Native consumer fixture；只用 public root 与 `./styles`；typecheck 通过。
- fixture 分别执行 iOS、Android production `expo export`；验证内部 default、slot、compound variant 与 consumer override styles 被 Uniwind 收集；检查无重复 React/React Native runtime。
- 这层失败阻止发布；这层成功仍不能签署设备验收。

### Gate C — Gallery development build

- iOS Simulator 与 Android Emulator 的 development build 均能编译、安装、启动，Gallery 只从 `@learnui/native` public entries 导入。
- Components 区覆盖八组件的 variants/sizes/states/parts/accessibility；Showcases 覆盖 composition、theme、motion。
- Expo Go 仅 best-effort，不是兼容 gate。只有 `expo export` 而没有 native development build，Gate C 未通过。

### Gate D — 每次 Native release candidate 的人工设备签署

- 至少一台受支持 iPhone/iPad 类 iOS 物理设备与一台受支持 Android 物理设备；记录 device、OS、build SHA、主题/辅助功能设置和验收人。
- 两端逐行执行八组件矩阵；iOS 打开 VoiceOver、最大 Dynamic Type、dark mode、Reduce Motion；Android 打开 TalkBack、最大 font size/display size、dark mode、Remove animations/Reduce Motion、high text contrast。
- Switch 连续快速切换、Button 高频 press、Spinner 持续运行；确认即时反馈、中断/retarget、reduced-motion fallback 与无可重复可见 hitch。需要定量定位时使用平台 profiler/Perf Monitor；最终 frame pacing 以 production-like build 为准。
- 任一 screen-reader 重复焦点、错误 role/state、字体裁切、不可点击、系统主题不同步、reduced-motion 仍有空间移动、或可重复掉帧都阻止发布。
- Simulator/Emulator 可作日常回归，但不能替代本 gate；工具链或设备缺失时状态是“未验收”，不是“通过”。

## V1 是否引入 Maestro / Detox

| 选择 | 能新增的证据 | 仍不能替代 | V1 决定 |
| --- | --- | --- | --- |
| Maestro `2.8.0` | 安装后的 Gallery 导航、按压、输入、主题切换、基于 visible text/`testID` 的双端 smoke | VoiceOver/TalkBack 实际语音与焦点体验、Dynamic Type 可用性、动效手感、frame pacing | **不做阻塞 gate。** 若团队已有 device CI，可后续加一条非阻塞 smoke；八组件 pages 稳定后再评估升级 |
| Detox `20.51.3` | 更深的 native E2E 与自动同步、`testID`/label assertions | 同上，且接入成本更高 | **V1 不引入。** RN `0.87` 超出其官方明确测试范围，Expo 集成无专门官方支持；先避免把工具兼容性变成组件发布 blocker |

当前八个基础组件的主要风险是语义、状态、排版、主题和真机 motion，不是长业务流程。RNTL + packed external fixture + development build + 两端真机人工签署已经覆盖这些 load-bearing risks；E2E 只能减少 Gallery smoke 的人工重复，不能关闭 Issue #9 的核心人工门槛。

## 研究限制

本次是能力与门槛研究，没有实现组件、运行 Gallery、构建 binary 或操作物理设备。因此本文定义的是后续可验证的 release gates，不是当前仓库已经通过的验收报告。
