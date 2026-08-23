# V1 Web 测试与验收能力边界

- 服务票据：[Issue #9：定义 V1 测试、可访问性与发布验收矩阵](https://github.com/ygsgdbd/learnui/issues/9)
- 范围：仅 Web；React Aria Components、Tailwind CSS v4、Storybook、Vitest Browser Mode、Testing Library、axe 与 Playwright
- 访问日期：2026-08-23（Asia/Shanghai）
- 仓库约束：[`packages/web/CONTEXT.md`](../../packages/web/CONTEXT.md)、[`DESIGN.md`](../../DESIGN.md)、[ADR-0002](../adr/0002-internal-variant-engine-and-platform-style-entries.md)、[ADR-0003](../adr/0003-external-consumer-contract-and-tarball-fixtures.md)、[ADR-0006](../adr/0006-platform-owned-semantic-tokens-and-theme-modes.md)、[ADR-0007](../adr/0007-composition-first-v1-component-contract.md)、[ADR-0008](../adr/0008-precision-workbench-visual-and-motion-baseline.md)

> 决策优先级：本文保存测试能力研究；ADR-0009、ADR-0010 与 `docs/qa/V1_ACCEPTANCE.md` 是最终合同。V1 的唯一视觉 baseline owner 已固定为固定环境 Playwright screenshots，不使用 Chromatic。

## 结论

V1 Web 应采用三层证据，而不是让一个工具承担所有验收：

1. **Storybook + Vitest Browser Mode（Chromium）**：每个 story 做真实浏览器 smoke render，关键 story 的 `play` 覆盖交互，并以 axe 扫描自动可判定的无障碍问题。
2. **独立 Playwright（Chromium、Firefox、WebKit）**：覆盖不能只由 Storybook 默认 Chromium 代表的键盘、原生表单、主题/媒体偏好和跨浏览器关键路径。
3. **人工浏览器 + screen reader**：验证实际焦点体验、朗读顺序、状态/错误公告、Windows high contrast 和动效体感。axe、ARIA snapshot、DOM role/name 查询都不能代替这一层。

`storybook build` 是发布门槛，但它只证明 stories、配置与资源能编译成静态站点。它不证明 story 在浏览器中运行正确，更不证明交互、视觉或无障碍成立。

## 固定版本与版本地位

当前仓库没有 lockfile，也没有 `packages/web/package.json`；除根目录的 `pnpm@11.9.0` 外，以下测试工具都**尚未被仓库安装或锁定**。表中版本是访问日从 npm registry 取得的建议实现基线，不应写成“当前项目版本”。实施时必须把同一组精确版本写入 manifest 和 lockfile，再重新运行本文 gates。

| 工具 | 建议固定版本 | 版本地位与直接来源 |
| --- | ---: | --- |
| `react-aria-components` | `1.20.0` | 已被现有 Web API 调研固定；[官方源码固定 commit](https://github.com/adobe/react-spectrum/tree/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components) |
| `tailwindcss` | `4.3.3` | 建议实现基线；[npm 固定版本](https://www.npmjs.com/package/tailwindcss/v/4.3.3) |
| `storybook`、`@storybook/addon-vitest`、`@storybook/addon-a11y` | `10.5.10` | 三者必须保持同一 Storybook 版本线；[core](https://www.npmjs.com/package/storybook/v/10.5.10)、[Vitest addon](https://www.npmjs.com/package/@storybook/addon-vitest/v/10.5.10)、[a11y addon](https://www.npmjs.com/package/@storybook/addon-a11y/v/10.5.10) |
| `vitest`、`@vitest/browser-playwright` | `4.1.11` | 必须精确匹配；[Vitest](https://www.npmjs.com/package/vitest/v/4.1.11)、[browser provider](https://www.npmjs.com/package/@vitest/browser-playwright/v/4.1.11) |
| `playwright` | `1.62.1` | 建议实现基线；[npm 固定版本](https://www.npmjs.com/package/playwright/v/1.62.1) |
| `@testing-library/react` / `dom` / `user-event` / `jest-dom` | `16.3.2` / `10.4.1` / `14.6.6` / `7.0.1` | 建议实现基线；[React](https://www.npmjs.com/package/@testing-library/react/v/16.3.2)、[DOM](https://www.npmjs.com/package/@testing-library/dom/v/10.4.1)、[user-event](https://www.npmjs.com/package/@testing-library/user-event/v/14.6.6)、[jest-dom](https://www.npmjs.com/package/@testing-library/jest-dom/v/7.0.1) |
| `axe-core`、`@axe-core/playwright` | `4.13.0` | 建议实现基线；[axe-core](https://www.npmjs.com/package/axe-core/v/4.13.0)、[Playwright integration](https://www.npmjs.com/package/@axe-core/playwright/v/4.13.0) |

Context7 在访问日可解析到 Storybook `10.2.9`、Vitest `4.1.6` 与 Playwright `1.61.0` 的固定索引；本次先按仓库要求逐库 resolve，再按单一概念查询这些固定索引，并以 npm 当前稳定版及相同官方源码补查到上表。版本未进 lockfile 前，任何“已固定”表述都不成立。

## 测试类型、工具与证据边界

| 测试类型 | 主工具与归属 | 可以证明 | 不能证明 |
| --- | --- | --- | --- |
| unit | Vitest Node；仅纯函数、variant/default 映射、token-name contract | 输入到 class/token/输出的确定性逻辑 | DOM、CSS、浏览器事件、React Aria 语义 |
| interaction | Storybook story `play` + Vitest Browser Mode + role/name 查询 | story 在真实 Chromium 中能渲染；pointer/typing 后的 DOM 状态与回调符合断言 | 未写入 `play` 的路径；Firefox/WebKit；AT 体验 |
| keyboard | Storybook `play` 做主路径；Playwright 三引擎做关键路径 | Tab、Shift+Tab、Space、Enter 与焦点/状态结果 | 实际键盘使用体感、完整页面焦点顺序、screen reader 快捷键冲突 |
| form | Browser Mode + Playwright | `name`/`value`、提交数据、disabled/readonly/required 对表单的浏览器行为 | 与所有表单库的兼容；服务端错误策略 |
| validation | Browser Mode；原生 constraint validation 必须 Playwright 三引擎 | `aria` validation、错误关联、native submit 是否被阻止 | screen reader 何时、以何顺序朗读错误 |
| ref | Browser component test | root/part ref 指向公开 contract 的真实 DOM 节点，且可 focus 的节点能被 focus | consumer 自定义 ref 生命周期的所有组合 |
| controlled / uncontrolled | Browser component test | `value`/`isSelected` 的受控回传与 rerender；`default*` 的内部更新；受控切换不自行漂移 | app 级状态管理正确性 |
| theme / dark | Story fixtures + Playwright media/root override + visual baseline | system、`data-theme=light/dark` 的解析优先级；token override 与关键像素差异 | 所有显示器、色彩配置与 OS 组合的观感 |
| high contrast | Playwright `contrast` / `forcedColors` emulation + visual/computed-style 断言；人工 Windows 验证 | 对应 media query 被触发，边框/焦点/文本仍可见 | 真实 Windows High Contrast 与用户代理映射一定一致 |
| reduced motion | Playwright `reducedMotion: reduce` + computed-style/视觉断言；人工观察 | scale/travel/continuous spin 被取消或替换，功能仍完成 | 动效舒适度、快速重复触发的真实体感 |
| visual | 固定环境 Playwright screenshots | 固定浏览器、viewport、字体、数据下的像素回归 | 语义、键盘、回调、可理解性；被误批准的 baseline |
| build | `storybook build` | Storybook 配置、stories、MDX/资源可编译为静态站点 | 浏览器运行、interaction、a11y、视觉、npm tarball consumer |

Testing Library 应优先按可访问语义查询：`getByRole` + accessible name，其次 `getByLabelText`；`data-testid` 只作为无语义节点的最后手段。官方 query priority 见 [Testing Library Queries](https://testing-library.com/docs/queries/about/)，输入交互见 [`user-event` v14](https://testing-library.com/docs/user-event/intro/)。在 Vitest Browser Mode 内优先使用其 browser locators / `userEvent`，因为 Vitest 官方说明这些交互由浏览器 provider 执行，而不是 jsdom 的模拟事件（[固定版本 Browser Mode](https://github.com/vitest-dev/vitest/blob/v4.1.11/docs/guide/browser/index.md)、[interactivity API](https://github.com/vitest-dev/vitest/blob/v4.1.11/docs/api/browser/interactivity.md)）。

## Storybook build 与 test 分别证明什么

### `storybook build`

成功只证明 Storybook 可产出静态 Web application（[Storybook `10.5.10` 固定文档](https://github.com/storybookjs/storybook/blob/v10.5.10/docs/sharing/publish-storybook.mdx)）。它应捕获坏 import、坏配置、无法编译的 story/MDX 和缺失的 build-time asset，但不会打开浏览器执行 `play`，也不会自动运行 axe 或视觉比较。

### Storybook Vitest addon

Vite-based Storybook 的主测试路线应是 `@storybook/addon-vitest`，不是旧 test-runner。官方说明 addon 把 stories 转换为 Vitest component tests，通过 Browser Mode + Playwright Chromium 进行 smoke render，并执行存在的 `play` 断言（[固定版本 addon 文档](https://github.com/storybookjs/storybook/blob/v10.5.10/docs/writing-tests/integrations/vitest-addon/index.mdx)）。因此：

- 每个稳定 story 至少证明“可在这一套 Chromium 环境渲染”；
- 有 `play` 的 story 才证明对应交互路径；
- story coverage 是被 stories 执行到的代码覆盖，不是组件 contract 覆盖率；
- 默认 Chromium 结果不能外推到 Firefox、WebKit 或 screen reader；
- 旧 `@storybook/test-runner` 只保留作非 Vite fallback，不与 addon 重复成为 V1 主门槛。

### a11y addon / axe

Storybook a11y addon 基于 axe-core，可把 stable stories 配置为 violation 阻断。它是自动化第一道防线，不是 WCAG 合规证明。Storybook 官方明确写明 axe 自动发现“最多约 57%”的 WCAG 问题（[固定版本 a11y 文档](https://github.com/storybookjs/storybook/blob/v10.5.10/docs/writing-tests/accessibility-testing.mdx)）；axe 还会把无法自动判定的结果标为 `incomplete` / needs review（[`axe-core@4.13.0` README](https://github.com/dequelabs/axe-core/blob/v4.13.0/README.md)）。V1 要求：

- stable story 的 axe violations 为 release blocker；
- `todo`、`off`、rule disable、selector/context exclude 必须绑定 issue、owner 和到期日；
- `incomplete` 必须人工审计并记录结论；
- 异步内容必须先在 `play` 中等待稳定状态再扫描，不能用过早扫描制造假阴性；
- “0 violation”只能写为“指定 axe 版本下未发现自动可判定问题”。

### visual tests

Storybook Visual Tests/Chromatic 会把 stories 的像素快照与已批准 baseline 比较（[固定版本 visual 文档](https://github.com/storybookjs/storybook/blob/v10.5.10/docs/writing-tests/visual-testing.mdx)）。Playwright 也提供 `toHaveScreenshot`（[固定版本 screenshot 文档](https://github.com/microsoft/playwright/blob/v1.62.1/docs/src/test-snapshots-js.md)）。ADR-0010 已选择固定环境 Playwright screenshots，避免两套快照互相漂移；未经人工 review 的 diff 是 blocker。

## 八组件最小测试矩阵

下面是每个组件在“组件 contract 维度”上的最小集，不要求把每个 variant × size × state 做笛卡尔积。视觉 stories 应用 pairwise/代表态覆盖全部公开轴；行为断言围绕语义与状态转换。

| 组件 | 自动化最小集 | 主题/视觉最小集 | 必须人工确认 |
| --- | --- | --- | --- |
| Button | role/name；pointer 与 Enter/Space 各激活一次；disabled 不激活；pending 阻止重复激活但保持 focus/name；icon-only story 必须能按预期 name 查询；root ref | 5 variants × 3 sizes 至少 pairwise；default/hover/pressed/focus-visible/disabled/pending；light/dark；reduced-motion 下无 scale | focus ring 清晰且不只依赖颜色；pointer-down 即时反馈；pending 公告不产生第二焦点；快速重复操作无卡滞 |
| TextField | Label/Input/Description/ErrorMessage 关系；typing/clear/Tab；controlled/uncontrolled；disabled/readonly/required/invalid；`aria` validation；native validation 阻止提交；form name/value；Input ref | outline/filled × sm/md/lg pairwise；empty/filled/focus/disabled/readonly/invalid；light/dark/high-contrast | VoiceOver/NVDA 对 label、description、required、invalid、error 的实际朗读顺序；浏览器原生 validation UX |
| Checkbox | checkbox role/name/state；label click、Space、pointer；controlled/uncontrolled；indeterminate 激活请求 `true` 且由 caller 清除；disabled/readonly/required/invalid；form value；Root/Control/Indicator refs | sm/md/lg；unchecked/checked/indeterminate/focus-visible/disabled/invalid；light/dark/high-contrast | selected/indeterminate 的朗读；44×44 target；indicator 不能是唯一状态线索 |
| Switch | switch role/name/state；label click、Space、pointer；controlled/uncontrolled；disabled/readonly/required/invalid；form value；Root/Control/Thumb refs | sm/md/lg；off/on/focus-visible/disabled/invalid；light/dark/high-contrast；reduced-motion 下无 thumb travel | on/off 朗读；即时按压与 thumb travel；快速切换可中断且最终状态正确 |
| Card | parts 默认语义与顺序；无隐式 button/selection/disabled；className merge；各 part ref | surface/elevated/outline；内容长短；light/dark/reduced-transparency/high-contrast | 标题层级放入真实页面后合理；内容不被自动错误分组；边界在不同对比模式下可辨 |
| Badge | 非交互；文字提供意义，不以颜色单独表达；decorative 嵌入时意义移到 owner；root ref | 3 variants × 5 colors × 2 sizes pairwise；light/dark/high-contrast | status 意义在上下文中清楚；高对比/色觉差异下仍可区分；不能被误认为可点击 Chip |
| Divider | decorative 默认不暴露 separator；`isDecorative=false` 才有 separator + orientation；root ref | horizontal/vertical × hairline/regular；light/dark/high-contrast | vertical separator 在真实布局中可辨且语义必要；hairline 在目标屏幕缩放下可见 |
| Spinner | standalone 必须 label 且暴露 indeterminate progress/status contract；embedded decorative 从 accessibility tree 隐藏且 owner 持有 busy/name；root ref | 5 colors × 3 sizes pairwise；light/dark/high-contrast；reduced-motion 下无 continuous rotation | 实际公告不过度重复；decorative 与 owner 不双重朗读；静态/opacity fallback 仍表达 busy |

跨组件还必须有两类 contract tests：

- 所有 required `--learnui-*` 公共 token 名在 Web 样式入口存在；组件不以 literal light/dark colors 绕过 semantic tokens；consumer override 能覆盖 presentation。
- 每个公开 root/part 的 ref、`className` merge-last 和 public export 都以公共入口测试，不能从源码相对路径导入来制造假通过。

## 建议 V1 release gates

| Gate | 自动化/人工 | 通过条件 |
| --- | --- | --- |
| G1：确定性 contract | 自动化 | unit、types、token-name、public export、ref、controlled/uncontrolled 全部通过；Node tests 不承担 DOM 结论 |
| G2：Storybook build | 自动化 | `storybook build` 成功；八组件每个公开状态/视觉轴均有可发现 story；产物无缺失资源错误 |
| G3：Storybook tests | 自动化 | Vitest addon 在 Playwright Chromium 执行所有 stable stories；smoke、全部 `play`、axe violations 均为 0；所有 `incomplete`/exclude 有审计记录 |
| G4：跨浏览器关键路径 | 自动化 | Chromium、Firefox、WebKit 均通过 Button/TextField/Checkbox/Switch 的 keyboard、pointer、controlled/uncontrolled、form/validation 关键流；Card/Badge/Divider/Spinner 的语义 contract 至少各一条跨浏览器测试 |
| G5：主题与偏好 | 自动化 + 人工 | system/light/dark 与 `data-theme` 优先级通过；代表 stories 的 light/dark baseline 已 review；`prefers-contrast`/forced-colors、reduced-motion 的功能与 computed style 断言通过；真实 Windows high contrast 与真实 reduced-motion 人工检查通过 |
| G6：人工键盘与 screen reader | 人工，有版本记录 | 完整键盘 checklist 通过；至少 VoiceOver + Safari（macOS）和 NVDA + Chrome（Windows）通过八组件的 role/name/state/value、label/description/error、focus 与动态公告；记录 OS、browser、AT 的精确版本与日期 |
| G7：视觉与动效 review | 人工 | 所有视觉 diff 已批准；44×44 target、focus ring、缩放/200% zoom、长文案无裁切；pointer-down 反馈即时；keyboard 无多余 motion；reduced motion 无 spatial travel/continuous spin；快速重复触发最终状态正确 |

Playwright 官方支持用 projects 配置 Chromium、Firefox、WebKit（[固定版本 projects 文档](https://github.com/microsoft/playwright/blob/v1.62.1/docs/src/best-practices-js.md)），并可模拟 `colorScheme`、`reducedMotion`、`forcedColors` 与 `contrast`（[固定版本 emulation 文档](https://github.com/microsoft/playwright/blob/v1.62.1/docs/src/emulation.md)）。模拟 media feature 只证明浏览器收到该条件，不能代替真实 OS preference/assistive technology。

人工 screen reader 需要验证实际发声，不以 Playwright ARIA snapshot 代替。ARIA snapshot 只能比对浏览器生成的 accessibility tree 结构（[固定版本文档](https://github.com/microsoft/playwright/blob/v1.62.1/docs/src/aria-snapshots.md)）；W3C WAI 也明确说明 evaluation tools 不能自动化全部检查，且结果仍需人工判断（[Evaluation Tools Overview](https://www.w3.org/WAI/test-evaluate/tools/)）。

## 明确不是 release gate 的项目

- 单独的 `storybook build`、typecheck 或 bundle success；它们都是必要条件，但任何一个都不是完成证明。
- 固定的 statement/branch coverage 百分比。覆盖率用于发现遗漏，不替代上面的 component contract matrix。
- DOM implementation snapshot、class string 大快照或 `data-testid` 数量。
- “axe 0 violation”“ARIA snapshot 一致”或“role query 成功”单项结论。
- 只在 Chromium、jsdom/happy-dom 或 Vitest `preview` provider 通过。
- Chromatic 服务。V1 已选择固定环境 Playwright screenshots 作为唯一 baseline owner。
- 每个 variant × size × state × theme 的全笛卡尔像素快照。V1 使用全部轴覆盖 + 代表组合/pairwise，风险态单列。
- 自动化 screen reader。V1 的真实 AT 验收必须由人完成并留下版本化记录。
- 将所有 Storybook controls 组合都变成独立 test；只有 contract、风险态和真实 consumer 场景进入 gate。

## 主要风险

1. **版本仍未落库。** 上表是研究基线，不是已安装事实；实施时若上游版本变化，必须重新核对 Storybook/Vitest/Playwright peer ranges。
2. **Storybook 默认单浏览器。** Vitest addon 的 Chromium 通过容易被误写成“browser tests 已覆盖”；Firefox/WebKit 必须由独立 Playwright gate 补齐。
3. **自动 a11y 假完整。** axe 自动覆盖有限，`incomplete`、disabled rules 和 selector excludes 尤其容易成为永久盲区。
4. **wrapper 回归。** React Aria Components 提供 primitive 语义不代表 LearnUI wrapper 永远正确；parts、ref、class merge、pending、validation 和 decorative 模式都可能破坏上游 contract。
5. **视觉 baseline 治理。** 不稳定字体、动画、随机数据、viewport 或未经审查的 update 会把真正回归吞进 baseline。
6. **media emulation 不等于 OS。** `prefers-contrast`、forced colors 与 reduced motion 的 Playwright 模拟必须保留真实浏览器/OS 人工抽查。
7. **测试 host 不是发布包。** Storybook 可能通过 workspace alias 和源码 CSS；它不能证明 npm tarball exports/style entry。外部 consumer fixture 仍由 ADR-0003 的独立发布验收负责。

## 主要官方来源

以下来源均访问于 2026-08-23：

- [Storybook `10.5.10` Vitest addon](https://github.com/storybookjs/storybook/blob/v10.5.10/docs/writing-tests/integrations/vitest-addon/index.mdx)
- [Storybook `10.5.10` interaction tests](https://github.com/storybookjs/storybook/blob/v10.5.10/docs/writing-tests/interaction-testing.mdx)
- [Storybook `10.5.10` accessibility tests](https://github.com/storybookjs/storybook/blob/v10.5.10/docs/writing-tests/accessibility-testing.mdx)
- [Storybook `10.5.10` visual tests](https://github.com/storybookjs/storybook/blob/v10.5.10/docs/writing-tests/visual-testing.mdx)
- [Vitest `4.1.11` Browser Mode](https://github.com/vitest-dev/vitest/blob/v4.1.11/docs/guide/browser/index.md)
- [Vitest `4.1.11` Browser Mode motivation](https://github.com/vitest-dev/vitest/blob/v4.1.11/docs/guide/browser/why.md)
- [Testing Library query priority](https://testing-library.com/docs/queries/about/)
- [`user-event` v14 introduction](https://testing-library.com/docs/user-event/intro/)
- [`axe-core@4.13.0` official README](https://github.com/dequelabs/axe-core/blob/v4.13.0/README.md)
- [Playwright `1.62.1` accessibility testing](https://github.com/microsoft/playwright/blob/v1.62.1/docs/src/accessibility-testing-js.md)
- [Playwright `1.62.1` actionability](https://github.com/microsoft/playwright/blob/v1.62.1/docs/src/actionability.md)
- [Playwright `1.62.1` screenshots](https://github.com/microsoft/playwright/blob/v1.62.1/docs/src/test-snapshots-js.md)
- [Tailwind CSS v4 dark mode](https://tailwindcss.com/docs/dark-mode)
- [Tailwind CSS v4 states and media variants](https://tailwindcss.com/docs/hover-focus-and-other-states)
- [W3C WAI Evaluation Tools Overview](https://www.w3.org/WAI/test-evaluate/tools/)

## 时效性与未验证范围

本文是能力与验收设计研究，不是实现验证。本次没有安装依赖、生成 lockfile、运行 Storybook、浏览器或 screen reader，也没有修改 Issue。所有“建议版本”均需在实现时以 lockfile、浏览器 binaries 与实际 AT 版本重新固定；所有 gate 只有产生对应测试结果和人工验收记录后才能标为通过。
