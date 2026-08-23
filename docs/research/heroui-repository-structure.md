# HeroUI 官方仓库的 Web 组件库、Storybook 与文档边界

- 调研日期：2026-08-23
- 官方仓库：[heroui-inc/heroui](https://github.com/heroui-inc/heroui)
- 核验分支：仓库当日[默认分支](https://api.github.com/repos/heroui-inc/heroui) `v3`
- 固定快照：[`1d2164e7b9a60221e39501081f0fe4f6c564bccf`](https://github.com/heroui-inc/heroui/tree/1d2164e7b9a60221e39501081f0fe4f6c564bccf)
- 范围：只讨论 HeroUI v3 的 React Web 包、Storybook、文档与示例组织，不把旧分支或 HeroUI Native 的结构混入结论。

> 决策优先级：本文保存 HeroUI 证据和早期建议，Accepted ADR 与已关闭 Issue 的 resolution 优先。LearnUI V1 已确定使用独立 private `apps/web-storybook` host；组件 stories 与 `packages/web` 源码共置、从 `@learnui/web` 公共入口导入，并由 host 跨 workspace 扫描；stories 不进入 tarball。

## 核心结论

HeroUI 采用的是“同一个 PNPM monorepo、多个独立 workspace project”的结构，而不是把 npm 组件库、Storybook 和文档塞进同一个 `package.json`：

- `packages/react` 是公开发布的 `@heroui/react`。
- `packages/styles` 是公开发布的 `@heroui/styles`，由 React 包通过 `workspace:*` 依赖。
- `packages/storybook` 是 `private: true` 的 `@heroui/storybook`，作为独立 Storybook 应用依赖 `@heroui/react` 和 `@heroui/styles`。
- `apps/docs` 是 `private: true` 的 `@heroui/docs`，作为独立 Next.js/Fumadocs 应用依赖 `@heroui/react`。

因此，如果“同一 workspace”指同一 PNPM workspace graph，答案是“是”；如果指同一个 workspace package，答案是“否”。官方 [`pnpm-workspace.yaml`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/pnpm-workspace.yaml#L1-L3) 同时纳入 `apps/**/**` 和 `packages/**/**`，但每个目录有自己的 `package.json` 和私有/发布边界。

还有一个容易遗漏的混合点：**Storybook 运行器独立，但组件 story 与组件源码共置**。组件的 `*.stories.tsx` 位于 `packages/react/src/components/**`，独立的 Storybook workspace 通过 [`../../react/src/**/*.stories.@(ts|tsx)`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/storybook/.storybook/main.ts#L15-L29) 跨 workspace 读取它们。也就是说，HeroUI 分离的是应用、工具链和依赖，不是强制把每个组件的 story 从组件目录搬走。

## Workspace 地图

| 路径 | 包名 | 是否发布 | 主要职责 | 对内部包的依赖 |
| --- | --- | --- | --- | --- |
| `packages/react` | `@heroui/react` | 是，`publishConfig.access: public` | React 组件源码、单元/浏览器测试、与组件共置的 stories | `@heroui/styles` 为 `workspace:*` dependency；测试和规范包为 dev dependency |
| [`packages/styles`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/styles/package.json#L1-L53) | `@heroui/styles` | 是，public | CSS、组件样式和 Tailwind 相关样式入口 | 不依赖 React 组件包 |
| `packages/storybook` | `@heroui/storybook` | 否，`private: true` | Storybook 配置、addons、主题、组件目录展示和额外 showcase demos | 单向依赖 `@heroui/react`、`@heroui/styles` |
| `apps/docs` | `@heroui/docs` | 否，`private: true` | 官方文档站、MDX 内容、可运行文档 demos | 单向依赖 `@heroui/react`；开发期使用 `@heroui/styles` |
| [`packages/testing`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/testing/package.json#L1-L5) | `@heroui/testing` | 否，`private: true` | 测试配置、setup 和 helpers | 被 React 包作为 dev dependency 使用 |
| [`packages/standard`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/standard/package.json#L1-L5) | `@heroui/standard` | 否，`private: true` | 共享 lint/TypeScript 规范 | 被其他 workspace 作为 dev dependency 使用 |

这些边界直接记录在 [`packages/react/package.json`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/package.json#L1-L27)、[`packages/storybook/package.json`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/storybook/package.json#L1-L42) 和 [`apps/docs/package.json`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/package.json#L1-L31) 中。

## Story、文档与示例放在哪里

HeroUI v3 的[官方固定快照目录树](https://api.github.com/repos/heroui-inc/heroui/git/trees/1d2164e7b9a60221e39501081f0fe4f6c564bccf?recursive=1)中没有单独的 `examples` workspace。示例按用途跟着消费面放置：

1. 组件级 story 与组件源文件共置，例如 [`button.stories.tsx`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/src/components/button/button.stories.tsx)。Storybook 应用只负责发现和渲染这些 story。
2. Storybook 自身的跨组件 showcase/demo 放在 [`packages/storybook/.storybook/stories`](https://github.com/heroui-inc/heroui/tree/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/storybook/.storybook/stories)，属于 Storybook workspace。
3. 文档页位于 [`apps/docs/content/docs`](https://github.com/heroui-inc/heroui/tree/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/content/docs)，文档可运行示例位于 [`apps/docs/src/demos`](https://github.com/heroui-inc/heroui/tree/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/src/demos)，属于 docs workspace；例如 Button 文档用 `ComponentPreview` 引用命名 demo，而 demo 直接从 `@heroui/react` 导入 `Button`。

所以“示例是否分离”不能只给一个布尔答案：发布包中的组件 stories 共置；文档 demos 和 Storybook showcase demos 则分别属于各自私有消费应用。

## 构建与发布边界

### 1. 根脚本把包构建和应用构建分开

根 [`package.json`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/package.json#L15-L45) 的默认 `build` 只筛选 `@heroui/styles` 与 `@heroui/react`；文档和 Storybook 分别由 `build:docs`、`build:storybook` 驱动。发布包构建不会顺带要求 Next.js 文档站或 Storybook 静态站完成构建。

Turbo 的 [`build.dependsOn: ["^build"]`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/turbo.json#L11-L19) 让消费应用在构建时先构建其 workspace 依赖，并分别缓存 `.next/**`、`dist/**`、`storybook-static/**` 等不同产物。

### 2. 依赖方向是“应用消费库”，没有反向耦合

- `@heroui/react` 的运行时内部依赖指向 `@heroui/styles`；React、React Aria、Tailwind 等宿主集成依赖声明为 peer dependencies（[`packages/react/package.json`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/package.json#L63-L104)）。
- `@heroui/storybook` 通过 `workspace:*` 消费 React 和 styles（[`packages/storybook/package.json`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/storybook/package.json#L13-L24)）。
- `@heroui/docs` 通过 `workspace:*` 消费 React，并在开发依赖中使用 styles（[`apps/docs/package.json`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/package.json#L22-L31)、[L69-L72](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/package.json#L69-L72)）。

这使 Storybook/文档成为发布包的真实 monorepo 消费者，而不会把 Storybook、Next.js 或 Fumadocs 变成组件库的生产依赖。

### 3. Story 共置，但不会进入 npm 产物

`@heroui/react` 的 `files` 仅包含 `dist`（[`packages/react/package.json`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/package.json#L22-L27)）。其 Rollup 配置只以 `src/index.ts` 和每个组件目录的 `index.ts` 为入口，并把 dependencies 与 peerDependencies externalize（[`rollup.config.mjs`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/rollup.config.mjs#L24-L57)）；TypeScript 配置也显式排除 `**/*.stories.*`（[`tsconfig.json`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/tsconfig.json#L1-L12)）。共置 story 是开发资产，不是 npm 交付内容。

### 4. 发布工作流只发布两个 public 包

官方 [release workflow](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/.github/workflows/release.yml#L33-L69) 先执行根 `pnpm build`，再明确进入 `packages/styles` 和 `packages/react` 执行 `pnpm pack` / `npm publish`。Storybook、docs、testing、standard 都不在发布步骤中。

官方 [Quick Start](https://www.heroui.com/docs/react/getting-started/quick-start) 也只让用户安装 `@heroui/styles` 与 `@heroui/react`；对应的固定版本文档源见 [`quick-start.mdx`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/content/docs/en/react/getting-started/%28overview%29/quick-start.mdx#L40-L78)。

## 对 LearnUI 的含义

HeroUI 的结构提供的是边界原则，不必按目录数量照搬。LearnUI 当前 ADR-0001 明确第一版“恰好两个组件 workspace”，且 `packages/web/CONTEXT.md` 已把 Storybook 定义为 Web 的文档与手工测试面。结合当前规模，更合适的解释是：

1. **Storybook 使用独立 private host。** `apps/web-storybook` 拥有 Storybook 工具链；组件 stories 仍与 `packages/web` 源码共置，由 host 跨 workspace 读取。
2. **现在就应复制发布隔离原则。** 若 `@learnui/web` 将发布 npm，应设清楚 `private`/`publishConfig`、`files`/exports、peer dependencies，并验证 `pnpm pack` 中没有 stories、测试、Storybook 配置或站点依赖。
3. **保持依赖单向。** 生产组件代码不导入 Storybook；stories 和未来 docs/example app 从 `@learnui/web` 的公开入口导入组件，避免依赖内部实现路径。
4. **保持 story 共置但发布隔离。** `apps/web-storybook` 跨 workspace glob 读取 `packages/web/src/**/*.stories.*`；构建入口、声明配置和 tarball allowlist 排除 stories。
5. **不要额外创建 `examples` workspace，除非示例本身成为独立产品。** 小型组件示例适合与 stories 共置；长篇文档 demo 适合归属于未来 docs app。

换言之，LearnUI 当前最值得借鉴的是“发布包与消费应用的依赖/发布边界”，而不是 HeroUI 成熟仓库的 workspace 数量。

## 证据清单

以下来源均为 HeroUI 官方仓库或官方站点，访问日期均为 **2026-08-23**：

| 证据 | 直接链接 | 支持的判断 |
| --- | --- | --- |
| PNPM workspace 配置 | [`pnpm-workspace.yaml`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/pnpm-workspace.yaml#L1-L3) | apps 与 packages 同属一个 monorepo workspace graph |
| 根脚本 | [`package.json`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/package.json#L15-L45) | React/styles、Storybook、docs 各自按 filter 构建 |
| React 包清单 | [`packages/react/package.json`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/package.json#L1-L104) | public npm 包、产物范围、内部与 peer 依赖 |
| Storybook 包清单 | [`packages/storybook/package.json`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/storybook/package.json#L1-L42) | private 独立 workspace，消费 React/styles |
| Storybook story discovery | [`main.ts`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/storybook/.storybook/main.ts#L15-L56) | 独立运行器跨 workspace 读取共置 stories |
| Docs 包清单 | [`apps/docs/package.json`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/package.json#L1-L31) | private 独立文档 app，消费 React 包 |
| Turbo task graph | [`turbo.json`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/turbo.json#L11-L22) | 构建先执行 workspace 依赖并隔离不同产物 |
| React Rollup 配置 | [`rollup.config.mjs`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/rollup.config.mjs#L24-L104) | 明确入口、external 与 `dist` 输出 |
| npm 发布工作流 | [`release.yml`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/.github/workflows/release.yml#L33-L69) | 仅发布 styles 与 React 包 |
| 官方安装文档 | [HeroUI Quick Start](https://www.heroui.com/docs/react/getting-started/quick-start) | 用户只安装 `@heroui/styles` 与 `@heroui/react` |

## 时效性说明

HeroUI 仓库默认分支与目录可能继续变化。本文的“当前”只表示 2026-08-23 访问时的 `v3` 默认分支，并用固定 commit 链接保证结论可复现；后续架构决策若依赖最新状态，应重新检查默认分支及 release workflow。
