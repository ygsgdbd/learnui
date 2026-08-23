# HeroUI Native 官方仓库与展示体系研究

访问日期：2026-08-23（Asia/Shanghai）

## 结论先行

用户所说的 “HeroNative” 对应的官方项目应为 **HeroUI Native**，官方仓库是 [`heroui-inc/heroui-native`](https://github.com/heroui-inc/heroui-native)。GitHub 搜索中同名相关结果里，该仓库由 `heroui-inc` 组织维护，仓库元数据指向官方文档 `https://heroui.com/docs/native/getting-started`；本次核对的 `main` 快照为 [`0858b020ca1cb0f5ecd935b9675244d12c3cd338`](https://github.com/heroui-inc/heroui-native/tree/0858b020ca1cb0f5ecd935b9675244d12c3cd338)。

核心事实：

1. **组件库是可独立发布的 package。** `heroui-native` 本身位于组件仓库根目录，不是 `packages/*` 下的子包；它有公开 npm `publishConfig`、构建产物/类型/exports 和 React Native Builder Bob 配置。
2. **组件仓库内有独立的私有 Expo workspace。** 根 Yarn workspace 只包含 `example/`；`example` 是 `private: true` 的 Expo Router + Uniwind 展示应用，通过 alias 直接消费组件库源码。
3. **官方还维护了一个仓库级独立的 showcase app。** [`heroui-inc/heroui-native-example`](https://github.com/heroui-inc/heroui-native-example) 不属于组件仓库 workspace；它消费 npm 上的 `heroui-native`，用于验证已发布包，也可作为独立起步项目。
4. **Native 流程未使用 Storybook。** 在上述两个 Native 仓库的当前快照中，未发现 `.storybook`、`*.stories.*`、Storybook scripts 或 dependencies。组件状态展示由 Expo Router app 内的组件路由完成。
5. **官网文档又是另一套 workspace。** Native MDX 文档位于 [`heroui-inc/heroui`](https://github.com/heroui-inc/heroui)；其中 Next.js workspace `@heroui/docs` 标记为 `private: true`，不是组件库仓库里的 Expo workspace，也不是 Storybook。
6. **官网的“扫码预览”不是在浏览器中运行 Expo Gallery。** 当前文档生成 Universal Link / custom scheme，尝试打开已安装的 HeroUI Native 商店 App；未安装时落到静态下载页。它与本地 `example/` 的 `expo start` 是两条不同链路。

## 真实组织方式

| 表面 | 位置 | 是否独立 workspace/package | 消费组件方式 | 主要用途 |
| --- | --- | --- | --- | --- |
| 组件库 | `heroui-inc/heroui-native` 根目录 | 是，可公开发布的 npm package | 自身源码构建为 `lib` | 组件实现、测试、发布 |
| 内嵌 Gallery / example | `heroui-native/example/` | 是，根 Yarn workspace 中唯一子 workspace；`private: true` | Babel alias 到根 `src/index.tsx` | 联调源码、快速查看全部组件和 showcase |
| Standalone showcase | `heroui-inc/heroui-native-example` | 是独立 GitHub repo；不是前者 workspace；`private: true` | npm dependency `heroui-native` | 起步项目、验证已发布 package、对外展示 |
| 官网 docs | `heroui-inc/heroui/apps/docs` | `heroui` PNPM monorepo 内的私有 Next.js workspace | MDX + Web 组件；不直接运行 RN 组件 | 文档、视频/图片预览、QR/deep link |
| 商店 Preview App | App Store / Google Play | 公开源码对应关系无法从现有官方公开仓库证实 | 文档通过 Universal Link / scheme 打开 | 真机组件预览 |

### 1. 组件库 package：已证实可独立发布

根 [`package.json`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/package.json#L2-L16) 直接声明：

- package 名为 `heroui-native`，当前版本 `1.0.8`；
- JS 入口、类型入口、source 与 exports 均指向库自身；
- `prepare` 使用 `bob build`，并配置 ESM module 与 TypeScript 产物（[scripts 与构建配置](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/package.json#L37-L47)、[Bob targets](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/package.json#L170-L188)）；
- `publishConfig.access` 为 `public`，registry 是 npm（[发布配置](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/package.json#L66-L69)）；
- CONTRIBUTING 明确给出 `yarn release` 发布流程（[publishing to npm](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/CONTRIBUTING.md#L135-L143)）。

因此，“组件库只是 Expo app 内部代码、不能独立发布”与当前官方源码不符。

### 2. 内嵌 Expo Gallery：独立 workspace，但与库同仓

根 [`package.json`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/package.json#L137-L140) 的 Yarn workspaces 只有 `example`。官方 CONTRIBUTING 也明确将结构描述为“根目录 library package + `example/` app”（[开发结构](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/CONTRIBUTING.md#L42-L59)）。

[`example/package.json`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/example/package.json#L1-L71) 证实它是：

- `heroui-native-example`；
- `private: true`，不会作为 npm package 发布；
- `main: expo-router/entry`；
- Expo SDK 57、React Native 0.86、Expo Router 57、Uniwind 1.10；
- `start/android/ios/web` 全部基于 `expo start`。

它不是普通的远端 package consumer。Babel 把 `heroui-native` alias 到根 package 的 `source`（[`example/babel.config.js`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/example/babel.config.js#L1-L20)），Metro watch 根目录并锁定 peer dependency 的单实例解析，避免 React/Reanimated 重复副本（[`example/metro.config.js`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/example/metro.config.js#L9-L65)）。

这意味着它承担的是“组件源码开发夹具 + 真机 Gallery”，并能在不发布 package 的情况下热更新 JS 源码。

### 3. Standalone showcase：独立 repo，不是同一 workspace

组件仓库 README 将 [`heroui-inc/heroui-native-example`](https://github.com/heroui-inc/heroui-native-example) 明确列为 standalone example app（[官方入口](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/README.md#L40-L53)）。本次核对快照为 [`bd20b798258a76f3d1d7806af14cd09c0b204de5`](https://github.com/heroui-inc/heroui-native-example/tree/bd20b798258a76f3d1d7806af14cd09c0b204de5)。

该 repo 的 [`AGENTS.md`](https://github.com/heroui-inc/heroui-native-example/blob/bd20b798258a76f3d1d7806af14cd09c0b204de5/AGENTS.md#L1-L29) 直接说明：

- `src/` 与 `themes/` 从组件仓库的 `example/` 镜像；
- standalone 版本消费 **published npm package**，而不是组件源码；
- 它有自己的 Expo/Metro/Uniwind/app 配置。

其 [`package.json`](https://github.com/heroui-inc/heroui-native-example/blob/bd20b798258a76f3d1d7806af14cd09c0b204de5/package.json#L1-L70) 进一步证实 `heroui-native` 是常规 dependency、app 为 `private: true`，并通过 `expo export --platform all` 验证三端 bundle。官方说明称这种验证能发现“源码联调 app 看不见、但发布包存在”的 exports/漏文件问题（[`AGENTS.md`](https://github.com/heroui-inc/heroui-native-example/blob/bd20b798258a76f3d1d7806af14cd09c0b204de5/AGENTS.md#L44-L53)）。访问日该 repo 的 dependency 仍为 `heroui-native: ^1.0.7`，而组件仓库已是 `1.0.8`；因此它的结构证据有效，但不能把它当成与组件仓库每个 commit 实时同步的镜像。

## Expo Gallery 如何运行

官方源码没有把 app 正式命名为 “Expo Gallery”；更准确的称呼是 `example app` 或 `showcase app`。如果这里的 Gallery 指组件列表与状态演示，应区分两种运行方式。

### A. 组件仓库内联调

在 `heroui-native` 根目录：

```bash
yarn
yarn example start
```

也可以使用：

```bash
yarn example ios
yarn example android
yarn example web
```

这些是官方 CONTRIBUTING 给出的命令（[运行命令](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/CONTRIBUTING.md#L63-L93)）。

### B. 独立 showcase / 起步项目

在 `heroui-native-example` repo：

```bash
npm install
npx expo start
```

官方 README 给出了完整步骤，并说明它使用 Expo Router 文件路由（[Get started](https://github.com/heroui-inc/heroui-native-example/blob/bd20b798258a76f3d1d7806af14cd09c0b204de5/README.md#L5-L35)）。Expo 官方文档说明 `npx expo start` 会启动开发服务器并显示 QR code；`--go` 明确指定 Expo Go，`--dev-client` 明确指定 development build（[Expo: Start developing](https://docs.expo.dev/get-started/start-developing/)）。

边界：当前 showcase manifests 没有 `expo-dev-client`，官方运行命令也没有 `--dev-client`；这支持“默认从 Expo CLI/Expo Go 链路运行”的判断。但本次没有实际安装依赖并在真机逐组件验证，因此不把“所有展示页面在任意 Expo Go 版本均可运行”写成已证实事实。

### C. 官网扫码预览不是上述本地启动命令

组件仓库 README 另有一个商店 Preview App（[Preview App](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/README.md#L31-L38)）。官网 docs 的 QR code 使用 `/docs/native-showcase/components/{slug}` Universal Link，并在移动端转换为 `herouinative://components/{slug}`（[`deep-link-qr-code.tsx`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/src/components/native/deep-link-qr-code.tsx#L11-L49)）。未安装 App 时，Next.js 路由只显示静态下载页（[`native-showcase` fallback](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/src/app/docs/native-showcase/components/%5B%5B...slug%5D%5D/page.tsx#L39-L53)）。

因此不应把官网 QR 预览描述为“浏览器内嵌 Expo/Storybook”。它是 docs 到已安装 Native App 的 deep-link bridge。

## Uniwind 的真实位置

已证实：

- 官方介绍将 HeroUI Native 定义为基于 Tailwind v4 via Uniwind 的 RN 组件库；Quick Start 的新项目模板会预配置 Expo、Uniwind/Tailwind、`global.css` 和 Provider（[Quick Start](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/content/docs/en/native/getting-started/%28overview%29/quick-start.mdx#L7-L50)）。
- 组件库开发依赖包含 `uniwind` 与 Tailwind v4，但发布 package 的 `peerDependencies` 中没有 `uniwind`（[`package.json`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/package.json#L95-L125)）。
- 使用方仍需按官方 Quick Start 配置 Uniwind，并在 `global.css` 导入 `tailwindcss`、`uniwind`、`heroui-native/styles`（[Uniwind 与 CSS 设置](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/content/docs/en/native/getting-started/%28overview%29/quick-start.mdx#L142-L166)）。
- 内嵌 Gallery 通过 `withUniwindConfig` 包装 Metro，指定 CSS entry、类型文件和额外主题（[`example/metro.config.js`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/example/metro.config.js#L54-L65)）。

结论：Uniwind 同时参与组件样式约定与 app bundling，但 Metro/`global.css` 接线属于宿主 Expo app；不是 Storybook 提供的样式运行时。

## Docs 与 Storybook

### 已证实：官网 docs 是单独的 Next.js workspace

Native 官网 MDX 位于 `heroui-inc/heroui`。其 [`pnpm-workspace.yaml`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/pnpm-workspace.yaml#L1-L3) 纳入 `apps/**/**` 和 `packages/**/**`，而 [`apps/docs/package.json`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/package.json#L1-L20) 声明私有 Next.js app `@heroui/docs`。文档 app 使用 MDX/Fumadocs，并通过 Web 端 QR UI 与 Native App 联动；它没有在 Next.js 内直接渲染 React Native 组件。

### 已证实：Native 当前不用 Storybook

对下列固定快照执行了 `storybook` 文本搜索，并查找 `.storybook`、`*.stories.*` 与文件名含 `storybook` 的路径，均无命中：

- `heroui-inc/heroui-native@0858b020`
- `heroui-inc/heroui-native-example@bd20b798`
- `heroui-inc/heroui@1d2164e7` 的 Native docs / docs app 路径

同时，相关 `package.json` 没有 Storybook scripts/dependencies。该结论限定在上述访问日期与快照，不代表 HeroUI 组织历史上或其他 Web package 从未使用 Storybook。

## 对 LearnUI 的建议

LearnUI 当前 ADR-0001 指定“恰好两个 component workspaces”：`packages/web` 与 `packages/native`；Web 用 Storybook，Native 用 Expo in-app Gallery。HeroUI Native 的官方结构支持 **“Web Storybook、Native Expo Gallery”** 这个方向，但对 Native 是否可发布提出了一个需要显式决策的分叉。

### 建议保留

1. **Storybook 继续只服务 Web。** Native 组件状态、手势、键盘、safe area、haptics 和原生 overlay 更适合在 Expo Router Gallery 中验证。没有证据表明 LearnUI 需要为了“对齐官方”而给 Native 加 Storybook。
2. **Gallery 使用真实路由组织组件页。** 可采用 `components/<slug>` + `showcases/<slug>` 的 in-app 信息架构，分别覆盖原子状态和组合场景；这是 HeroUI 当前 example 的实际形态。
3. **Uniwind 配置留在 Expo 宿主边界。** 组件导出样式约定，Gallery 负责 Metro wrapper、`global.css`、主题和字体配置，避免把 app-only 配置伪装成组件 API。

### 需要新增 ADR 后才能做的结构调整

如果 `@learnui/native` 最终要作为独立 npm package 发布，建议改为：

```text
packages/native/       # 可发布组件库
apps/native-gallery/   # private Expo Router app，workspace 依赖 @learnui/native
```

这会新增第三个 workspace 并要求修改当前 `pnpm-workspace.yaml` 与 ADR-0001，不能在现有 ADR 下静默实施。若暂时只以“学习仓库 + Gallery”为目标，继续把 `packages/native` 作为 private Expo app 也成立，但应明确它**不是**可独立发布组件包的形态。

### 发布前的双层验证值得借鉴

HeroUI 同时保留：

- 同仓 source-linked example：反馈快；
- 独立 npm-consumer showcase：能发现 package exports / 漏文件问题。

LearnUI 初期无需立即复制一个外部 repo。更轻量的做法是先用 workspace Gallery 联调，再在 CI 中通过 `pnpm pack` 产物或临时 consumer 验证真实发布边界；只有需要独立上架、OTA 或公开模板时，再拆出 standalone showcase repo。

## 已证实与尚不能确认

### 已证实

- 官方组件仓库身份、当前版本与 commit；
- 根组件库公开发布配置；
- 内嵌 `example` 是 private Yarn workspace；
- standalone showcase 是独立 repo 且消费已发布 package；
- Expo Router、Expo/React Native/Uniwind 版本与运行 scripts；
- docs 是 `heroui` monorepo 内标记为 `private: true` 的 Next.js workspace；
- 当前三个相关源码范围内无 Native Storybook；
- 官网 QR/deep-link 打开商店 Native App，而非内嵌 Expo Web runtime。

### 尚不能确认 / 不应过度推断

- 当前 App Store / Play Store Preview App 的完整源码是否就是某个未公开 repo，或由公开 example 经私有发布配置派生。公开代码能证实 deep-link 与商店配置，不能证实完整源码归属。
- 所有 showcase 页面在所有 Expo Go/设备组合中的运行结果；本次研究未安装和真机执行。
- “没有 Storybook”只针对访问日固定快照，不是永久产品承诺。

## 主要来源

均访问于 2026-08-23：

- [HeroUI Native 官方仓库](https://github.com/heroui-inc/heroui-native)
- [HeroUI Native package.json 固定快照](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/package.json)
- [HeroUI Native CONTRIBUTING 固定快照](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/CONTRIBUTING.md)
- [HeroUI Native standalone example 官方仓库](https://github.com/heroui-inc/heroui-native-example)
- [Standalone example AGENTS 固定快照](https://github.com/heroui-inc/heroui-native-example/blob/bd20b798258a76f3d1d7806af14cd09c0b204de5/AGENTS.md)
- [HeroUI 官网仓库中的 Native docs](https://github.com/heroui-inc/heroui/tree/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/content/docs/en/native)
- [HeroUI docs Native app bridge 配置](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/src/config/native-app.ts)
- [Expo 官方开发启动文档](https://docs.expo.dev/get-started/start-developing/)
- [Uniwind 官方 Quick Start](https://docs.uniwind.dev/quickstart)
