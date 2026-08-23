# Storybook 对 React Native + Expo 的官方支持研究

- 访问日期：2026-08-23（Asia/Shanghai）
- 研究范围：Storybook 官方文档与官方 GitHub 仓库、Expo 官方文档
- 当前 Native 固定快照：[`storybookjs/react-native@v10.5.4`](https://github.com/storybookjs/react-native/releases/tag/v10.5.4)，commit [`9d2b8320`](https://github.com/storybookjs/react-native/tree/9d2b8320c13d7009c729fa985792be0151750ed6)

> 决策优先级：本文保存能力研究和候选架构，Accepted ADR 与已关闭 Issue 的 resolution 优先。LearnUI Native V1 使用 private Expo Router Gallery，不引入 Native Storybook；React Native Storybook 与 React Native Web 均为未来范围。

## 结论先行

1. **能展示真实 React Native / Expo 组件。** `@storybook/react-native` 的 story 在 React Native app runtime 中渲染，可访问 Native API；它不是把 Native 组件截图或转译成普通 Web story。
2. **Native 主路线的 preview 在 app 内。** 也就是 iOS Simulator、Android Emulator、真机，或分发出去的测试 build。它没有 Web Storybook 的 iframe 隔离，Storybook UI 自身也是 React Native UI。
3. **浏览器 remote-control UI 不是 Native renderer。** WebSocket/browser manager 可以选择 story、同步设备、驱动截图或自动化；最终的 Native preview 仍由设备/模拟器中的 app 渲染。只有另外配置 React Native Web，浏览器才会自己渲染一个 Web 版本。
4. **React Native Web 是不同路线。** 当前官方推荐 `@storybook/react-native-web-vite`：用 Vite + React Native Web 在浏览器中渲染，换取完整 Web Storybook 文档、测试和 addon 生态；代价是不能代表原生模块、原生交互和平台行为的真实结果。
5. **LearnUI 应把组件 package 与展示 host 分开。** V1 已确定 `packages/native` 只做可发布的 `@learnui/native`，`apps/native-gallery` 作为 `private: true` 的 Expo Router Gallery 单向消费组件库；Storybook/Expo/app config 不进入发布包。若未来引入 Native Storybook，仍应遵守相同边界。

## 一、确定事实

### 1. Native Storybook 实际渲染在哪里

Storybook 官方比较表明确区分：

| 维度 | React Native Storybook | Web Storybook |
| --- | --- | --- |
| runtime | Native mobile environment，另有基础 Web 支持 | 浏览器 |
| preview | 直接运行在 app 内，隔离有限 | iframe |
| bundler | 主要是 Metro，也支持 Re.Pack | Vite / Webpack |
|平台能力 | Native API | Web API |
|部署方式 | TestFlight 或其他 pre-production app distribution | 静态 Web 部署 |

直接证据：[`Introduction`](https://github.com/storybookjs/react-native/blob/9d2b8320c13d7009c729fa985792be0151750ed6/docs/docs/intro/index.md)。

所以“展示真实组件”的准确含义是：story 导入真实 React Native 组件源码，最终由 React Native app renderer 在 Simulator / Emulator / device 中运行。Expo 是 app 与 Metro 的宿主，不会把组件自动改成 DOM。

Native Storybook UI 包含 story navigator 与 addon panel；`onDeviceUI: false` 可只保留 story canvas，改由 WebSocket 或自定义工具控制。配置证据见 [`Storybook UI Configuration`](https://github.com/storybookjs/react-native/blob/9d2b8320c13d7009c729fa985792be0151750ed6/docs/docs/intro/configuration/storybook-ui-configuration.md)。

### 2. Expo 的当前推荐集成

Storybook v10+ 的推荐入口是：在 Expo app 目录运行 CLI。

```sh
npm create storybook@latest
```

CLI 会包装 Metro config、生成 Storybook entry point，并增加类似脚本：

```json
{
  "scripts": {
    "storybook": "STORYBOOK_ENABLED=true expo start",
    "storybook:ios": "STORYBOOK_ENABLED=true expo start --ios",
    "storybook:android": "STORYBOOK_ENABLED=true expo start --android"
  }
}
```

当前推荐是 **entry-point swapping**：`STORYBOOK_ENABLED=true` 时，bundler 把 app entry 换成 Storybook entry；否则运行正常 app，且生产 bundle 中没有 Storybook code。官方说明与命令见 [`Getting started`](https://github.com/storybookjs/react-native/blob/9d2b8320c13d7009c729fa985792be0151750ed6/docs/docs/intro/getting-started/index.md)。

若必须把 Storybook 放进 Expo Router 导航，可使用 `@storybook/react-native/metro/withStorybook`，再创建 `/storybook` route。官方将此路线标记为 fully supported，但不是 preferred，因为 Storybook 会进入 app bundle 与 navigation；见 [`Expo Router Setup`](https://github.com/storybookjs/react-native/blob/9d2b8320c13d7009c729fa985792be0151750ed6/docs/docs/intro/getting-started/expo-router.md)。

### 3. browser remote control UI 的角色

启用 WebSocket 后，运行 Metro 的主机启动 channel server；设备 app 与外部 client 双向同步。官方列出的能力包括：

- 远程选择 story；
- 多设备同步；
- live story updates；
- 自动截图与自动化；
- 浏览器或自定义工具集成。

`websockets: 'auto'` 会自动检测 LAN IP、启动 server，并把连接信息注入生成的 `storybook.requires`。真机仍需要与开发机网络可达。证据见 [`WebSocket Configuration`](https://github.com/storybookjs/react-native/blob/9d2b8320c13d7009c729fa985792be0151750ed6/docs/docs/intro/configuration/websocket-configuration.md) 与官方文章 [`WebSockets, Auto-Connect, and New Developer Tools`](https://github.com/storybookjs/react-native/blob/9d2b8320c13d7009c729fa985792be0151750ed6/docs/blog/2026-02-18-websockets-and-tooling.mdx)。

官方另有 [`@storybook/addon-react-native-server`](https://github.com/storybookjs/addon-react-native-server)，让一个 Web Storybook manager 通过 WebSocket 与一个或多个 mobile devices 同步。它的作用是 **control/sync plane**，不是把 Native renderer 搬进浏览器。该 addon 的 README 也把“浏览器中渲染 Web 版本”明确交给 React Native Web addon。

因此需要区分两件事：

```text
Browser manager / VS Code / script
                │ WebSocket: select, sync, automate
                ▼
Expo app on simulator/device ── React Native renderer ── real Native preview
```

浏览器 manager 即使显示 story tree、controls 或事件面板，也不能替代真机验证 safe area、keyboard、gesture、haptics、native module 或平台 accessibility。

### 4. React Native Web addon/framework 是另一条路线

当前 Storybook 官方文档把两个选项写得很明确：

- **Native**：在实际 React Native app、Simulator 或 device 内运行，高保真但功能集较小；
- **Web**：使用 React Native Web 在浏览器显示组件，基于成熟的 Web Storybook，文档、测试和 addons 更完整；
- 可以两者都装，但会增加安装与维护体积。

当前 Web 路线的官方 framework 是 [`@storybook/react-native-web-vite`](https://storybook.js.org/docs/get-started/frameworks/react-native-web-vite)，要求 React Native `>=0.72`、React Native Web `>=0.19`、Vite `>=5`。官方文档还明确说明旧 [`@storybook/addon-react-native-web`](https://github.com/storybookjs/addon-react-native-web) 是 Webpack-based precursor，并建议迁移到 Vite framework。

它仍然消费真实组件的 JS/TS 源码，但 renderer 是 React Native Web / DOM，而不是 iOS/Android host views。旧 addon 官方 README 也列出限制：不支持 React Native Web 的 library 不会工作，DOM 版本的组件可能与 mobile device 不同。因此 Web story 只能证明 Web compatibility，不能证明 Native fidelity。

另一个容易混淆的选项是：Native Storybook UI 本身兼容 React Native Web，可通过 Expo Web 导出。这仍是“Native Storybook UI 编译到 Web”的基础功能，不等于 `@storybook/react-native-web-vite` 提供的完整 Web Storybook 能力；见 [`Sharing Storybook: Publishing on the Web`](https://github.com/storybookjs/react-native/blob/9d2b8320c13d7009c729fa985792be0151750ed6/docs/docs/intro/sharing-storybook.md#publishing-on-the-web)。

### 5. 当前官方包与最低必要配置

访问日的 Native 最新 release 是 `v10.5.4`。核心 package [`@storybook/react-native`](https://github.com/storybookjs/react-native/blob/9d2b8320c13d7009c729fa985792be0151750ed6/packages/react-native/package.json) 声明：

- Node `>=20`；
- React Native `>=0.72.0`；
- `storybook` peer 必须为 `^10.5.4`；
- React、React Native、Storybook，以及 Native UI 依赖必须保持兼容版本。

推荐的最小接线不是手抄全部配置，而是让当前 CLI 在 **Expo host workspace** 内初始化，然后审查 diff。最低概念集合为：

1. host app 依赖 `expo`、`react`、`react-native`；
2. Storybook core `storybook` 与 renderer `@storybook/react-native` 使用同一版本线；
3. `.rnstorybook/main.ts` 指定 stories，`.rnstorybook/preview.tsx` 放 decorators/parameters；
4. `withStorybook` 包装 `expo/metro-config`；推荐 bundler-agnostic `@storybook/react-native/withStorybook` 做 entry swapping；
5. 用 `STORYBOOK_ENABLED=true expo start` 启动；
6. CLI/Metro 自动生成 `storybook.requires.ts`，不要手工维护；
7. 需要控件面板时再加入 on-device addons。

官方 manual setup 当前列出的完整依赖包含：

```text
storybook
@storybook/react-native
@react-native-async-storage/async-storage
react-dom
react-native-safe-area-context
react-native-reanimated
react-native-gesture-handler
@gorhom/bottom-sheet
react-native-svg
```

详见 [`Manual Setup`](https://github.com/storybookjs/react-native/blob/9d2b8320c13d7009c729fa985792be0151750ed6/docs/docs/intro/getting-started/manual-setup.md)。不要依据包名猜测哪些可以删除；应以 CLI 为基线，再由实际启用的 UI/addons 和 Expo SDK compatibility 决定。

官方提供的 on-device addons 目前是：

| 能力 | package |
| --- | --- |
| actions | `@storybook/addon-ondevice-actions` |
| backgrounds | `@storybook/addon-ondevice-backgrounds` |
| controls | `@storybook/addon-ondevice-controls` |
| notes | `@storybook/addon-ondevice-notes` |

应放进 `.rnstorybook/main.ts` 的 `deviceAddons`，而不是默认 Web addons 列表。原因是这些包含 React Native runtime code，不能让 Node 在 server-side preset evaluation 中加载。官方解释见 [`Addons`](https://github.com/storybookjs/react-native/blob/9d2b8320c13d7009c729fa985792be0151750ed6/docs/docs/intro/addons/index.md)。

## 二、历史候选：未来引入 Native Storybook 时的架构

以下是研究阶段形成的未来候选，不是 V1 决策，也不是 Storybook 官方强制结构。

### 推荐目标结构

```text
packages/
  native/                    # @learnui/native；可发布组件库
    src/
    package.json
    ...stories.tsx           # 可与组件共置，但不进入发布产物

apps/
  native-storybook/          # private Expo app；Native Storybook host
    .rnstorybook/
    app.json
    metro.config.js
    package.json
```

依赖方向保持单向：

```text
apps/native-storybook ──workspace:*──> @learnui/native
@learnui/native ──X──> Expo app / Storybook / Metro config
```

建议原因：

- `@learnui/native` 的 package metadata、exports、peer dependencies 与发布产物可独立验证；
- Expo app 独有的 app config、development build、Metro 与 Storybook 依赖不会污染消费者安装；
- host 是发布包的真实 workspace consumer，更容易发现 exports、漏文件与重复 React Native；
- 未来可在同一个 host 增加普通 Gallery route，但 Native Storybook 的 entry swapping 仍与生产 app 分离。

stories 可继续与组件源码共置，host 的 `.rnstorybook/main.ts` 跨 workspace glob 读取；发布时通过 `files` / build entry / pack 检查排除 stories。若团队更重视 host 自包含，也可把 stories 放到 host；这属于维护习惯，不影响 runtime 边界。

### 与当前 ADR 的关系

当前 [`ADR-0001`](../adr/0001-two-platform-component-workspaces.md) 规定首版恰好两个 component workspaces，并把 Native 展示面定为 Expo in-app Gallery；根 `pnpm-workspace.yaml` 目前也只包含 `packages/*`。

新增 `apps/native-storybook` 至少需要：

- 扩展 workspace glob；
- 明确它是 private host app，不是第三个 component workspace；
- 修订或补充 ADR，解释 Native Gallery 与 Native Storybook 是替代关系还是并存关系。

在 ADR 未更新前，不应静默把 Storybook 配置和 Expo app 塞进准备发布的 `packages/native` 来绕过 workspace 数量约束。

### 是否应同时建设 Native 与 Web 两套 Storybook

首版建议只采用 Native Storybook，理由是 LearnUI Native 的教学目标包含原生 accessibility、interaction 与 platform behavior。只有出现以下明确需求时，再增加 `@storybook/react-native-web-vite`：

- 需要公开静态网站或丰富 MDX docs；
- 需要成熟的浏览器 visual/a11y/component testing；
- 组件明确承诺支持 React Native Web；
- 团队愿意分别维护 Native 与 Web 的 compatibility expectations。

不要把 Web 路线当作 Native 路线的“远程控制皮肤”；它是第二个 renderer 与第二套验证语义。

## 三、限制与风险

1. **隔离与 addon 能力较弱。** Native preview 直接在 app 内运行，没有 iframe；Web addon panel 不能自动在 Native UI 使用，带 UI 的 addons 通常要重写。
2. **Expo Go 不是可靠的发布前宿主。** Expo Go 只有固定 native libraries；组件或 Storybook 依赖若包含未内置的 native code，必须用 development build。Expo 官方把 Expo Go 定位为学习 playground，把 development build 定位为 production-grade app 的开发环境，见 [`Introduction to development builds`](https://docs.expo.dev/develop/development-builds/introduction/)。Storybook 官方 v10 示例也使用 `expo start --dev-client`，但简单项目能否在 Expo Go 跑通应按实际依赖验证，不能一概而论。
3. **monorepo 版本重复会造成原生错误。** Expo 官方明确说单仓多个 React Native 版本不受支持，重复 React 会产生 runtime error，重复 Turbo/Expo native modules 会导致 build/runtime error。见 [`Work with monorepos`](https://docs.expo.dev/guides/monorepos/)。`@learnui/native` 应把 React/React Native 作为 peer dependencies，host 提供唯一版本。
4. **Metro 不应沿用旧版 monorepo 魔改。** Expo SDK 52+ 在使用 `expo/metro-config` 时自动支持 pnpm workspace；通常应删除旧的 `watchFolders`、`resolver.nodeModulesPaths`、`extraNodeModules` 等手工配置。Storybook wrapper 应链在 Expo 默认 config 之上。
5. **pnpm isolated install 仍可能遇到第三方包问题。** Expo SDK 54+ 支持 isolated dependencies，但官方承认部分 React Native libraries 仍可能失败；本仓现有 `nodeLinker: hoisted` 是官方给出的兼容 fallback 之一，不需要为了 Storybook 先行修改。
6. **Web fidelity 风险。** React Native Web 成功不代表 iOS/Android 成功；反之，依赖原生模块的 Native story 也可能无法在 Web renderer 编译。
7. **版本线更新快。** Context7 访问日仍索引 `v9.1.4`，而官方最新 Native release 已是 `v10.5.4`。实施时必须重新检查 CLI、`storybook`、`@storybook/react-native`、on-device addons 与 Expo SDK 的兼容版本，不能复制旧博客配置。

## 四、建议的验收标准（后续实施时）

本次不实现。若后续决定采用，至少验证：

- host 从 `@learnui/native` 的公开入口导入组件，而不是相对引用内部源码；
- 同一 story 在 iOS Simulator 与 Android Emulator 中运行；涉及原生能力时再加真机；
- `STORYBOOK_ENABLED` 未开启时，生产 bundle 不包含 Storybook；
- `pnpm why --depth=10 react` 与 `react-native` 没有 host 内重复版本；
- `pnpm pack` 的 Native library tarball 不含 Expo app、Storybook runtime 与 stories；
- 如果增加 RN Web，则把 Web 结果明确标为 compatibility preview，并保留 Native 验收。

## 主要官方来源

均访问于 2026-08-23：

- [Storybook React Native 官方仓库](https://github.com/storybookjs/react-native)
- [Storybook React Native v10.5.4 release](https://github.com/storybookjs/react-native/releases/tag/v10.5.4)
- [React Native Storybook Introduction](https://github.com/storybookjs/react-native/blob/9d2b8320c13d7009c729fa985792be0151750ed6/docs/docs/intro/index.md)
- [Getting started / Expo entry-point swapping](https://github.com/storybookjs/react-native/blob/9d2b8320c13d7009c729fa985792be0151750ed6/docs/docs/intro/getting-started/index.md)
- [Expo Router Setup](https://github.com/storybookjs/react-native/blob/9d2b8320c13d7009c729fa985792be0151750ed6/docs/docs/intro/getting-started/expo-router.md)
- [WebSocket Configuration](https://github.com/storybookjs/react-native/blob/9d2b8320c13d7009c729fa985792be0151750ed6/docs/docs/intro/configuration/websocket-configuration.md)
- [React Native Addons](https://github.com/storybookjs/react-native/blob/9d2b8320c13d7009c729fa985792be0151750ed6/docs/docs/intro/addons/index.md)
- [Storybook for React Native Web](https://storybook.js.org/docs/get-started/frameworks/react-native-web-vite)
- [旧 React Native Web addon 官方仓库](https://github.com/storybookjs/addon-react-native-web)
- [React Native server addon 官方仓库](https://github.com/storybookjs/addon-react-native-server)
- [Expo: Work with monorepos](https://docs.expo.dev/guides/monorepos/)
- [Expo: Introduction to development builds](https://docs.expo.dev/develop/development-builds/introduction/)
