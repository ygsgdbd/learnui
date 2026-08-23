# Web 与 Native 包的构建和 package exports 工具链

- 调研日期：2026-08-23（Asia/Shanghai）
- 对应问题：[Issue #8：选择 Web 与 Native 包的构建和 exports 工具链](https://github.com/ygsgdbd/learnui/issues/8)
- 仓库约束：遵守 [`ADR-0001`](../adr/0001-two-platform-component-workspaces.md)、[`packages/web/CONTEXT.md`](../../packages/web/CONTEXT.md) 与 [`packages/native/CONTEXT.md`](../../packages/native/CONTEXT.md)；组件包可发布，Storybook 与 Expo gallery 是私有 host。
- 调研性质：只给出后续实现依据，不修改 package 配置，不构建或发布包。

> 决策优先级：本文保存研究证据与候选草图，Accepted ADR 与已关闭 Issue 的 resolution 优先。当前 V1 只导出 root 与 `./styles`；Web JavaScript 不隐式导入 CSS；两端都不导出 `./package.json`；Native 直接使用 Reanimated，因此 `react-native-reanimated` 是非 optional peer + dev dependency，`react-native-worklets` 仅在 LearnUI 源码直接 import 时才成为直接 peer。

## 结论先行

推荐第一版采用两条不同的发布链路：

1. **`@learnui/web`：Vite 8 library mode + `@tailwindcss/vite` + `tsc --emitDeclarationOnly`。** Vite 负责 ESM、Tailwind/CSS 与 JavaScript source maps，`tsc` 只负责 `.d.ts` / declaration maps；`package.json` 手工维护 exports。Vite 官方 library mode 已明确覆盖 external dependencies、单一 CSS 产物与 CSS subpath export（[Vite 8.0.10 固定文档](https://github.com/vitejs/vite/blob/v8.0.10/docs/guide/build.md#library-mode)），而 Vite 本身不生成 TypeScript declarations，因此保留一个职责单一的 `tsc` 步骤。
2. **`@learnui/native`：`react-native-builder-bob` 的 ESM `module` target + `typescript` target。** Bob 面向 React Native library，默认生成 JS source maps，保留 ESM，生成 `.d.ts`，并把 CSS 等非 JS 资源复制到 `lib/module`；源码、编译后 ESM 和类型都进入 tarball。它的固定实现可直接验证非代码文件复制和默认 `sourceMaps: true`（[`compile.ts`](https://github.com/callstack/react-native-builder-bob/blob/5c418a630d732a7f309dc86781ad59d736d04d9f/packages/react-native-builder-bob/src/utils/compile.ts)）。
3. **两包都用 `files` allowlist 控制 npm tarball，不依赖仓库根 `.gitignore`。** Web 只发布 `dist`；Native 只发布经过排除规则清理的 `src` 与 `lib`。`apps/web-storybook`、`apps/native-gallery` 本来就在 package root 外，allowlist 又构成第二层隔离。npm 官方说明 `files` 是反向 ignore 的包含列表，省略时才默认 `['*']`（[npm v11 固定文档](https://github.com/npm/documentation/blob/404e183ea0c1f0b5d0b479175a291f70e216ade3/content/cli/v11/configuring-npm/package-json.mdx#files)）。
4. **不要在第一版选 tsup、tsdown、原生 Rollup 或“仅 tsc”作为统一工具。** tsup 官方仓库已明确“不再积极维护”并建议迁移 tsdown（[固定 README](https://github.com/egoist/tsup/blob/b6bcae8504d018cfc94203f50f15a3ce43943332/README.md#L1-L4)）；tsdown 的声明、external 与 exports 很完整，但 CSS 插件仍明确标为 experimental（[固定 CSS 文档](https://github.com/rolldown/tsdown/blob/81d10e56e9e14362e53877ea7273e70997ba7796/docs/options/css.md#L1-L10)）；Rollup 能做但需要更多自定义 glue；仅 tsc 不负责 Tailwind/CSS，也不是 React Native package 资产和 Metro 兼容发布方案。

最终选择是：**Web 用 Vite + declaration-only tsc，Native 用 Bob；exports、peerDependencies 和 tarball 边界都显式手工声明并用真实 tarball 验证。**

## 一、候选方案比较

| 工具 | ESM | `.d.ts` | CSS | source maps | peer/external | exports | 本项目判断 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vite 8 library mode | 是 | 否，另跑 `tsc` | 成熟；library mode 可输出单独 CSS，Tailwind v4 由官方 Vite plugin 处理 | `build.sourcemap` | 手工 `external` | 手工维护 | **Web 推荐**；职责清楚，CSS 路径稳定 |
| tsdown | 是 | 内建；支持 declaration maps | 需 `@tsdown/css`，当前仍为 experimental | 内建 | 默认 externalize dependencies/peers/optional deps | 可自动生成 | 以后可重评；第一版不把发布 CSS 建在 experimental API 上 |
| tsup | 是 | 支持 | 官方仍标为 experimental | 支持 | 支持 | 手工 | **不选**；官方已声明不积极维护 |
| Rollup | 是 | 需 plugin 或额外 `tsc` | 需 PostCSS/Tailwind plugin | 支持 | 完全可控 | 手工 | 能做，但第一版不需要承担直接 Rollup 配置成本 |
| react-native-builder-bob | 是 | 内建 `typescript` target | module target 会复制非代码文件；不替 consumer 运行 Uniwind | 默认开启 | 不 bundle library peers；由 package manifest 决定 consumer contract | 手工，Bob 会校验 entry | **Native 推荐** |
| 仅 `tsc` | 是 | 是 | 不处理/复制 CSS contract | JS 与 declaration maps 可配 | 不 bundle，无法校验 runtime external contract | 手工 | 只适合作为 Web declarations 子步骤，不作为完整发布链 |

### 为什么 Web 不直接照抄 HeroUI 的 Rollup

HeroUI Web 当前固定源码确实用 Rollup：它以 root 和每个组件为多个 entry，externalize dependencies/peerDependencies，并用 `preserveModules` 维持组件子路径（[`rollup.config.mjs`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/rollup.config.mjs)）。其 prepack 脚本再动态把源码 exports 改写成 `dist` exports（[`update-exports.mjs`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/scripts/update-exports.mjs)）。

这是成熟大包为“每组件 subpath + preserveModules + 动态 exports”付出的复杂度，不是 LearnUI 第一版的最低必要复杂度。当前如果只有一个 root JS entry 与一个 styles entry，Vite library mode 已覆盖需要；等出现下列任一条件时再考虑直接 Rollup或 Vite/Rolldown 的 preserve-modules 配置：

- 要公开 `@learnui/web/button` 一类逐组件 subpath；
- 必须按源目录保留大量 chunks；
- 需要逐文件处理 `"use client"` 等 directive；
- Vite library preset 无法表达稳定的文件名或 tree-shaking contract。

同时不要照抄 HeroUI 的 `sourcemap: false`；Issue #8 明确要求 source maps，LearnUI 应开启 JS 与 declaration maps。

### 为什么暂不选 tsdown

tsdown 是当前比 tsup 更合理的通用 TypeScript bundler：

- `dts` 可生成 declarations 与 declaration maps（[固定文档](https://github.com/rolldown/tsdown/blob/81d10e56e9e14362e53877ea7273e70997ba7796/docs/options/dts.md)）；
- `sourcemap: true` 可生成外置 `.map`（[固定文档](https://github.com/rolldown/tsdown/blob/81d10e56e9e14362e53877ea7273e70997ba7796/docs/options/sourcemap.md)）；
- `dependencies`、`peerDependencies`、`optionalDependencies` 默认 external（[固定文档](https://github.com/rolldown/tsdown/blob/81d10e56e9e14362e53877ea7273e70997ba7796/docs/options/dependencies.md#default-behavior)）；
- 能自动生成 exports，但官方要求发布前审查或启用 publint（[固定文档](https://github.com/rolldown/tsdown/blob/81d10e56e9e14362e53877ea7273e70997ba7796/docs/options/package-exports.md#enabling-auto-exports)）。

问题只在当前 Web contract 的关键路径：`@tsdown/css` 仍是 experimental，API 与行为可能变化。它适合在 CSS 稳定后作为“单工具替代 Vite + tsc”的候选，但现在没有足够收益抵消发布 CSS 的漂移风险。其 `devExports` 还依赖 `publishConfig` 覆盖，而固定文档明确说该覆盖不被 npm 支持，因此不应拿它实现 npm source-vs-dist 切换（[固定说明](https://github.com/rolldown/tsdown/blob/81d10e56e9e14362e53877ea7273e70997ba7796/docs/options/package-exports.md#dev-exports)）。

## 二、`@learnui/web` 推荐 contract

### 构建职责

- Vite library entry：`src/index.ts`；JavaScript entry 不导入包级 CSS，consumer 通过 `@learnui/web/styles` 显式引入样式。
- `@tailwindcss/vite`：编译 Tailwind CSS v4 与 CSS variables；Tailwind 官方把该 plugin 作为 Vite 集成方式（[固定安装文档](https://github.com/tailwindlabs/tailwindcss.com/blob/bd868a314bd05ca78acd047e3da289274dd6ccd7/src/app/%28docs%29/docs/installation/%28tabs%29/using-vite/page.tsx)）。设置稳定的 `cssFileName`，不要依赖 package name 推导。
- Vite：只产 ESM，开启外置 JS source maps；不产 UMD/CJS，因为仓库根已是 ESM、目标是现代 React/Storybook consumer，Issue 没有 CJS 要求。
- `tsc -p tsconfig.build.json --emitDeclarationOnly`：把 `.d.ts` 与 `.d.ts.map` 写入同一 `dist` contract；build config 排除 Storybook、stories、tests、fixtures。
- `react`、`react-dom`、`react-aria-components` 与其 subpaths 必须 external；不要把 host 的 React 或 React Aria runtime 打进 bundle。

Vite 官方文档要求 library build externalize 不应打包的依赖，并说明导入的 CSS 会形成单独 CSS 文件，可作为 package subpath export（[Vite 8.0.10 固定文档](https://github.com/vitejs/vite/blob/v8.0.10/docs/guide/build.md#library-mode)）。`build.sourcemap: true` 生成单独 map 文件（[固定 build options](https://github.com/vitejs/vite/blob/v8.0.10/docs/config/build-options.md#build-sourcemap)）。

### 建议 exports 形状

下面是 contract 草图，不是本次要写入 `package.json` 的实现：

```json
{
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "style": "./dist/styles.css",
  "sideEffects": ["**/*.css"],
  "files": ["dist"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./styles": {
      "style": "./dist/styles.css",
      "default": "./dist/styles.css"
    }
  }
}
```

关键点：

- `types` 条件放在运行时条件前；Node 社区条件文档也要求 typing systems 的 `types` 条件优先（[Node 固定 packages 规范](https://github.com/nodejs/node/blob/82e7ff4f84525ba8a54c686275ef88e6c79021e2/doc/api/packages.md#community-conditions-definitions)）。
- `import` 与 `default` 同指 ESM，`main` / `module` 只是旧工具兼容，不额外产 CJS。
- CSS 同时提供稳定 subpath `@learnui/web/styles` 与 legacy `style` hint；`default` 让不认识 `style` condition 的 bundler 仍能解析。
- CSS 标记为 side effect，避免 consumer bundler 因 tree shaking 丢掉显式 style import。
- 第一版只暴露 root 与 styles；不导出 package manifest，也不用 `./*` 暴露内部目录。

### peer 与 external

| 包 | manifest | bundler | 原因 |
| --- | --- | --- | --- |
| `react`、`react-dom` | peer + dev | external（含 `react/*`、`react-dom/*`） | host 单例与 renderer 版本由 consumer 控制 |
| `react-aria-components` | peer + dev | external（含 subpaths） | public component 行为层，避免包内重复版本；HeroUI Web 也把它列为 peer（[固定 package.json](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/package.json)） |
| `tailwindcss` | peer + dev | 不进入 JS bundle | consumer 拥有 Tailwind v4 build/theme；与已有 styling research 的 contract 一致 |
| 内部直接 import 的纯 JS helpers | dependency | 默认 external；确需私有内联时逐个决定 | manifest 必须与发出的 runtime imports 一致，不能形成 phantom dependency |

## 三、`@learnui/native` 推荐 contract

### 构建职责

Bob 配置只需两类 target：

```json
{
  "source": "src",
  "output": "lib",
  "targets": [
    ["module", { "esm": true }],
    ["typescript", { "project": "tsconfig.build.json" }]
  ]
}
```

- `module` 产 `lib/module/**` ESM，并为 Node/现代工具补全 import extension。
- `typescript` 产 `lib/typescript/src/**.d.ts`；build tsconfig 排除 gallery、stories、tests 与生成目录。
- Bob 的 `module` target source maps 默认开启；无须另设为 true，但建议显式写出以固定意图。
- Bob 遍历 source 中所有文件：JS/TS 经 Babel，CSS 等非代码文件原样复制到对应 `lib/module` 路径；因此 `./styles` 可以稳定指向复制后的 CSS（[固定实现](https://github.com/callstack/react-native-builder-bob/blob/5c418a630d732a7f309dc86781ad59d736d04d9f/packages/react-native-builder-bob/src/utils/compile.ts)）。
- Bob 官方 manual setup 同样推荐 ESM module + TypeScript targets、`main`/`types`/`exports`/`files` 和 publish lifecycle build（[固定 build 文档](https://github.com/callstack/react-native-builder-bob/blob/5c418a630d732a7f309dc86781ad59d736d04d9f/docs/pages/build.md)）。

HeroUI Native 当前 `1.0.8` 正使用 Bob `module { esm: true }` + `typescript`，发布 `src`、`lib` 与 styles subpaths（[固定 package.json](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/package.json)）。这证明该形状能服务真实的 Uniwind/Tailwind v4 Native 组件库；但 LearnUI 不应照抄其所有 peer 范围或动态 exports 脚本。

### source 与 React Native 条件不能混为一谈

- 顶层 `source` 是部分 library tooling 读取的 legacy/convention field，不是 Node 的标准默认 condition。
- Bob 的新模板使用 package-specific source condition，并要求 Metro 与 TypeScript 显式声明该 condition（[固定 ESM 文档](https://github.com/callstack/react-native-builder-bob/blob/5c418a630d732a7f309dc86781ad59d736d04d9f/docs/pages/esm.md)）。通用名称 `source` 不会被 Metro 自动断言。
- Metro 自 0.82（React Native 0.79）起默认启用 package exports；React Native 默认断言 `react-native`，并建议 package maintainer 把 `react-native` 放在 `import` / `require` / `default` 之前（[Metro 固定文档](https://github.com/facebook/metro/blob/404e5bce0c1ca0a5ed10a81edc9515066f6de843/docs/PackageExports.md)）。

由于 LearnUI Native 的发布目标就是 iOS/Android，第一版可让 `react-native` condition 直接指已发布 TS source，让 Metro 使用 source；非 Metro/非 RN 工具则使用 Bob 产出的 ESM fallback。这样不需要 gallery host 额外引入自定义 source condition。若以后需要让非 RN monorepo 工具也直读 source，再增加 package-specific `learnui-native-source`，并同时配置 Metro/TypeScript；不要依赖模糊的通用 `source` condition。

### 建议 exports 形状

```json
{
  "source": "./src/index.ts",
  "react-native": "./src/index.ts",
  "main": "./lib/module/index.js",
  "module": "./lib/module/index.js",
  "types": "./lib/typescript/src/index.d.ts",
  "sideEffects": ["**/*.css"],
  "files": [
    "src",
    "lib",
    "!src/**/__tests__/**",
    "!src/**/__fixtures__/**",
    "!src/**/__mocks__/**",
    "!src/**/*.stories.*",
    "!src/**/*.test.*",
    "!src/**/*.spec.*"
  ],
  "exports": {
    ".": {
      "react-native": {
        "types": "./lib/typescript/src/index.d.ts",
        "default": "./src/index.ts"
      },
      "types": "./lib/typescript/src/index.d.ts",
      "import": "./lib/module/index.js",
      "default": "./lib/module/index.js"
    },
    "./styles": {
      "react-native": "./src/styles/index.css",
      "default": "./lib/module/styles/index.css"
    }
  }
}
```

需要注意：

- 顶层 `react-native` 只服务 exports 尚未启用的旧 Metro；现代 Metro 在 exports 存在时优先使用 exports。
- `react-native` target 是精确路径。Metro 对命中的 exports target 不再补 `.native` / `.ios` / `.android` extension；公开 root 应是明确文件，内部相对 import 才继续按正常 platform resolution 工作（[Metro 固定迁移说明](https://github.com/facebook/metro/blob/404e5bce0c1ca0a5ed10a81edc9515066f6de843/docs/PackageExports.md#replacing-platform-specific-extensions)）。
- `src/styles/index.css` 与复制后的 `lib/module/styles/index.css` 都必须在 tarball。Native styling research 已要求 styles 内用相对 `@source` 自注册实际发布目录；exports 与 `@source` 路径要在真实 tarball 中一起验收。
- 不要增加 CJS target，除非出现经验证的旧 consumer。Metro 已能按 import 解析 ESM，额外 CJS 会增加双包与双 declarations 的测试面。

### peer 与 external

| 包 | 建议 | 原因 |
| --- | --- | --- |
| `react`、`react-native` | peer + dev | 必须由 Expo/RN host 提供，不能复制 runtime |
| `uniwind` | peer + dev | 组件源码直接使用它，且 consumer 必须配置 Metro/CSS entry；把它只放 devDependency 会隐藏缺失 contract |
| `tailwindcss` | peer + dev | consumer 的 global CSS 与 theme 编译由 app 拥有 |
| `tailwind-variants` / `tailwind-merge` | 依公开 API 决定；默认直接 runtime dependency | 内部纯 class composition 可由包正常依赖；若公开共享 merge/tv 单例 contract，再改为 peer |
| `react-native-reanimated` | non-optional peer + dev | Native Switch 的正式实现直接 import Reanimated；Gallery 与 fixture 安装兼容版本 |
| `react-native-worklets` | 不作直接 peer，除非 LearnUI 源码直接 import | 默认由 Reanimated 的上游 contract 管理，避免重复声明间接依赖 |
| 其他 RN runtime | 只有组件真实 import 时才声明 peer；可选集成才使用 `peerDependenciesMeta.optional` | 不要从 HeroUI Native 的完整组件集复制未使用 peers |

Bob 不做依赖 bundling，发出的 ESM import 会保留；因此 peer/dependency 的准确性就是运行时正确性。Expo 官方也提醒 monorepo 中重复 React、React Native 与 native modules 会导致 runtime 或 native build 冲突（[固定 monorepo 文档](https://github.com/expo/expo/blob/6c40f4bc42075bf68726346678599f67e83e52b6/docs/pages/guides/monorepos.mdx#duplicate-native-packages-within-monorepos)）。

## 四、npm tarball 如何排除 hosts、stories 与 tests

### 目录边界

`npm pack` 在每个 package directory 建 tarball，而不是从 monorepo root 任意抓文件：

- `apps/web-storybook` 与 `apps/native-gallery` 在 `packages/web` / `packages/native` 外，不会自然进入这两个包的 tarball。
- `files` allowlist 再把 Web 限定为 `dist`，Native 限定为 `src` + `lib`。
- Storybook/Expo dependencies 只能存在于 private host 的 manifest；它们不能出现在 public package 的 `dependencies` 或 `peerDependencies`。

### Web 双层排除

1. Vite 只从 public entry graph 构建；story/test 不允许被 `src/index.ts` 导入。
2. `tsconfig.build.json` 排除 `*.stories.*`、`*.test.*`、`*.spec.*`、`__tests__`、fixtures 与 Storybook config。
3. `files: ['dist']` 阻止 package source 和 package-local `.storybook` 进入 tarball。

如果 story/test 最终出现在 `dist`，说明 build graph 或 declaration build 已泄漏；不能指望 `.npmignore` 在最后掩盖，应先修 build inputs。

### Native 三层排除

1. Bob `exclude` 排除 `__tests__`、fixtures、mocks、stories 与 `*.test/spec.*`，避免它们被编译/复制到 `lib/module`。Bob 默认只覆盖前三类目录，不自动覆盖共置 stories/tests（[固定 build options](https://github.com/callstack/react-native-builder-bob/blob/5c418a630d732a7f309dc86781ad59d736d04d9f/docs/pages/build.md#exclude)）。
2. `tsconfig.build.json` 同样排除这些文件，避免 `.d.ts` 泄漏。
3. `files` 中的负 patterns 清理必须发布的 `src`，并防止旧构建残留进入 tarball。

不要用根 `.npmignore` 代替 package `files`。npm 官方说明 root `.npmignore` 不会覆盖 `files` allowlist；包内子目录 `.npmignore` 又更难审计（[npm v11 固定文档](https://github.com/npm/documentation/blob/404e183ea0c1f0b5d0b479175a291f70e216ade3/content/cli/v11/configuring-npm/package-json.mdx#files)）。

## 五、发布前必须通过的验证

本次仓库尚无可构建包，因此以下是实现后的验收门，而不是本次已运行结果：

1. 在两个 package directory 分别执行 `npm pack --dry-run --json`，保存并审查文件清单；npm pack 支持 dry-run（[npm v11 固定命令文档](https://github.com/npm/documentation/blob/404e183ea0c1f0b5d0b479175a291f70e216ade3/content/cli/v11/commands/npm-pack.mdx)）。
2. 断言 Web tarball 只有 `dist/**`、package manifest 与 npm 强制包含的 README/LICENSE；Native 只有清理后的 `src/**`、`lib/**` 与 manifest/README/LICENSE。
3. 对清单做负断言：不得出现 `.storybook`、`*.stories.*`、`*.test.*`、`*.spec.*`、`__tests__`、`apps/`、Expo config、Metro config 或 host-only dependencies。
4. 对每个 exports target 做存在性检查；用 `publint` 检查 package entry/conditions，再用 TypeScript fixture 验证 types resolution。
5. 把生成的 `.tgz` 安装到仓库外的最小 consumer，而不是继续用 workspace link：
   - Web fixture 验证 `import { ... } from '@learnui/web'`、`import '@learnui/web/styles'`、浏览器 source map 与类型跳转；
   - Expo fixture 验证 `@learnui/native` 命中 `react-native` source、非 Metro 工具命中 ESM fallback、`@learnui/native/styles` 能被 Uniwind/Tailwind 编译、iOS/Android 均无重复 React/RN。
6. 在 clean checkout 执行 build → pack 两次并比较文件清单，避免 stale `dist/lib` 被误打包。

只有这些 tarball consumer tests 通过，才能说 exports 和发布边界完成。monorepo 内 Storybook/Expo host 能运行，只证明 workspace source resolution 正常，不能证明 npm 包可用。

## 六、固定证据与时效性

本次通过 Context7 选择并查询了 `/vitejs/vite/v8.0.10`、`/rolldown/tsdown` 与 `/callstack/react-native-builder-bob` 的当前文档，再用以下官方固定源码交叉验证：

- [Vite 8.0.10 library mode 与 CSS exports](https://github.com/vitejs/vite/blob/v8.0.10/docs/guide/build.md#library-mode)
- [tsdown 固定快照 `81d10e5`](https://github.com/rolldown/tsdown/tree/81d10e56e9e14362e53877ea7273e70997ba7796)
- [react-native-builder-bob 固定快照 `5c418a6`](https://github.com/callstack/react-native-builder-bob/tree/5c418a630d732a7f309dc86781ad59d736d04d9f)
- [Metro 固定 package exports 文档](https://github.com/facebook/metro/blob/404e5bce0c1ca0a5ed10a81edc9515066f6de843/docs/PackageExports.md)
- [Node.js 固定 packages 规范](https://github.com/nodejs/node/blob/82e7ff4f84525ba8a54c686275ef88e6c79021e2/doc/api/packages.md)
- [npm v11 固定 package.json 文档](https://github.com/npm/documentation/blob/404e183ea0c1f0b5d0b479175a291f70e216ade3/content/cli/v11/configuring-npm/package-json.mdx)
- [Expo 固定 monorepo 文档](https://github.com/expo/expo/blob/6c40f4bc42075bf68726346678599f67e83e52b6/docs/pages/guides/monorepos.mdx) 与 [`expo` 当前 source/default/types exports](https://github.com/expo/expo/blob/6c40f4bc42075bf68726346678599f67e83e52b6/packages/expo/package.json)
- [HeroUI Web 固定快照 `1d2164e`](https://github.com/heroui-inc/heroui/tree/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react)
- [HeroUI Native 固定快照 `0858b02`](https://github.com/heroui-inc/heroui-native/tree/0858b020ca1cb0f5ecd935b9675244d12c3cd338)

本文的“当前”只表示 2026-08-23 的上述版本/commits。特别是 tsdown CSS、Metro condition 以及 React Native/Expo 版本会继续变化；真正实施前应重新检查最新 release，并以 tarball fixture 结果而不是文档示例作为最终验收。
