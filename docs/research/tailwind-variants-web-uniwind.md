# `tailwind-variants` 在 Tailwind CSS v4 Web 与 Uniwind Native 组件库中的边界

- 调研日期：2026-08-23（Asia/Shanghai）
- `tailwind-variants` 固定快照：[`e087a829e588d3406aff0473acbfc38d1d628d4a`](https://github.com/heroui-inc/tailwind-variants/tree/e087a829e588d3406aff0473acbfc38d1d628d4a)，版本 `3.3.1`
- HeroUI Web 固定快照：[`1d2164e7b9a60221e39501081f0fe4f6c564bccf`](https://github.com/heroui-inc/heroui/tree/1d2164e7b9a60221e39501081f0fe4f6c564bccf)，`@heroui/react` / `@heroui/styles` 版本 `3.2.4`
- HeroUI Native 固定快照：[`0858b020ca1cb0f5ecd935b9675244d12c3cd338`](https://github.com/heroui-inc/heroui-native/tree/0858b020ca1cb0f5ecd935b9675244d12c3cd338)，版本 `1.0.8`
- Uniwind 固定快照：[`0f8bdcd7134e93b5f4c33decc25984520181d99c`](https://github.com/uni-stack/uniwind/tree/0f8bdcd7134e93b5f4c33decc25984520181d99c)，版本 `1.11.0`
- Tailwind CSS 文档固定快照：[`bd868a314bd05ca78acd047e3da289274dd6ccd7`](https://github.com/tailwindlabs/tailwindcss.com/tree/bd868a314bd05ca78acd047e3da289274dd6ccd7)

## 结论先行

1. **`tailwind-variants` 可以同时用于 Web 与 React Native，但它不是样式编译器。** 它是 framework-agnostic 的、带类型的 class string 组合器；`tv()` 根据 `variants`、`defaultVariants`、`compoundVariants` 和 `slots` 选择并合并字符串。Tailwind CSS 或 Uniwind 是否认识并生成这些 class，属于下一层工具链的责任。
2. **HeroUI Web 与 HeroUI Native 当前都实际使用了 `tailwind-variants`。** Web 的 `@heroui/styles` 用它组合 BEM 风格语义 class；Native 用本地 `tv` wrapper 组合语义 class、Tailwind utilities 与自定义 tokens，并把结果直接传给 React Native 组件的 `className`。
3. **Native 的兼容机制是“字符串协议”，不是 `tailwind-variants` 原生支持 React Native。** Uniwind 以 Tailwind CSS v4 编译 consumer 的 CSS entry 和注册的 sources；其 Metro resolver 将普通 `react-native` import 重定向到带 `className` 解析能力的 `uniwind/components` wrapper，wrapper 再把 class 对应的 style 交给原生组件。
4. **发布 npm 包时，最大风险是 consumer 扫描不到包内 class。** Tailwind v4 默认忽略 `node_modules`。最稳妥的包设计是像 HeroUI Native 1.0.8 一样，在发布的 CSS 入口内用相对路径 `@source` 自注册已发布 JS/source；要求 consumer 硬编码 `./node_modules/...` 路径在 pnpm/Yarn/Bun hoist 或 isolated linker 下会静默失效。
5. **对 LearnUI，Web 与 Native 不应共用同一份 CSS 交付策略。** Web 可以采用 HeroUI Web 的“预置语义 class + 已发布组件 CSS”模式；Native 则必须让 consumer 的 Uniwind/Tailwind v4 编译过程看到包内完整 class 字符串，并由 consumer 配置 Metro 和全局 CSS entry。

## 一、已确认事实

### 1. `tailwind-variants` 当前能力与 Tailwind v4 边界

当前官方包为 `3.3.1`（[`package.json`](https://github.com/heroui-inc/tailwind-variants/blob/e087a829e588d3406aff0473acbfc38d1d628d4a/package.json#L1-L45)）。官方 README 明确标注 fully typed、framework agnostic 和 Tailwind CSS v4 support（[`README.md`](https://github.com/heroui-inc/tailwind-variants/blob/e087a829e588d3406aff0473acbfc38d1d628d4a/README.md#L22-L29)）。当前与组件库直接相关的能力包括：

- `base`、`variants`、boolean variants、`defaultVariants`；
- 多条件 `compoundVariants`，条件值可为数组；
- `slots`：一次 variant selection 返回多个 slot function；variant 值可以只作用于特定 slot；
- `compoundSlots`：一次条件组合向多个 slot 加 class；
- `extend`：继承和扩展 base component 的 slots、variants、defaults 与 compound rules；
- `VariantProps` 类型提取；
- 默认入口的 Tailwind class conflict resolution，以及无 conflict resolution 的 [`tailwind-variants/lite`](https://github.com/heroui-inc/tailwind-variants/blob/e087a829e588d3406aff0473acbfc38d1d628d4a/package.json#L37-L50)。

基础 `variants` / `compoundVariants` 示例见官方固定 README（[`README.md`](https://github.com/heroui-inc/tailwind-variants/blob/e087a829e588d3406aff0473acbfc38d1d628d4a/README.md#L45-L79)）；slots、compoundSlots 和多层 extend 均有当前源码测试覆盖（[`tv-compound-slots.test.ts`](https://github.com/heroui-inc/tailwind-variants/blob/e087a829e588d3406aff0473acbfc38d1d628d4a/src/__tests__/tv-compound-slots.test.ts)、[`tv-extend-slots.test.ts`](https://github.com/heroui-inc/tailwind-variants/blob/e087a829e588d3406aff0473acbfc38d1d628d4a/src/__tests__/tv-extend-slots.test.ts)）。

一个重要边界是：旧 responsive variants API 已移除。官方说明原因是 Tailwind CSS v4 不再支持 `config.content.transform`；应把 `sm:` / `md:` 等完整 responsive class 直接写进 variant class 字符串（[`README.md`](https://github.com/heroui-inc/tailwind-variants/blob/e087a829e588d3406aff0473acbfc38d1d628d4a/README.md#L81-L82)）。这并不阻止 Uniwind 使用 breakpoint；只是 breakpoint 由 class token 和 Uniwind/Tailwind 处理，而不是由 `tailwind-variants` 自动生成。

### 2. HeroUI Web 确实使用 `tailwind-variants`

HeroUI v3 的 [`@heroui/react`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/package.json#L65-L73) 与 [`@heroui/styles`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/styles/package.json#L52-L58) 都把 `tailwind-variants@3.3.1` 声明为 runtime dependency，而不是只在文档或 story 中使用。

当前实际组织方式是：

- 单节点组件用 `base + variants + defaultVariants`，例如 [`buttonVariants`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/styles/src/components/button/button.styles.ts) 返回 `button`、`button--lg`、`button--primary` 等语义 class。
- 多部件组件用 `slots`，variant 值返回 slot-to-class object，例如 [`alertDialogVariants`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/styles/src/components/alert-dialog/alert-dialog.styles.ts#L5-L65) 将 size 只施加给 `dialog`，status 只施加给 `icon`，variant 只施加给 `backdrop`。
- React 组件从 `@heroui/styles` 取得 variant function，再把返回字符串传给 React Aria Component 的 `className`；例如 [`ButtonRoot`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/src/components/button/button.tsx)。
- React package 还导出自己的 [`tv` wrapper](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/src/utils/tv.ts)，默认关闭 `twMerge`。

在该固定快照的 `packages/styles/src/components` 中，未发现 `compoundVariants`、`compoundSlots` 或 `extend` 的实际使用。换言之，`tailwind-variants` 支持这些能力，但不能据此声称 HeroUI Web v3 当前依赖了全部能力。

HeroUI Web 也没有要求 consumer 扫描 `@heroui/styles` 的 TypeScript。其组件 variant 返回预先定义的 BEM class，实际规则随 [`@heroui/styles` CSS entry](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/styles/index.css) 交付；官方 Quick Start 要求 consumer 依次导入 `tailwindcss` 和 `@heroui/styles`（[`quick-start.mdx`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/content/docs/en/react/getting-started/%28overview%29/quick-start.mdx#L62-L72)）。这是“class 选择运行时 + 已发布 CSS”的模式，而不是“consumer 扫描 package TS 后生成所有组件 CSS”的模式。

### 3. HeroUI Native 确实使用 `tailwind-variants`，并直接传 `className`

HeroUI Native `1.0.8` 将 `tailwind-variants` 与 `tailwind-merge` 同时列为 peer dependencies（[`package.json`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/package.json#L112-L126)）。它定义了一个本地 [`tv` / `cn` wrapper](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/src/helpers/external/utils/cn.ts)：

- 用自定义 `classGroups` 教 conflict resolver 识别 HeroUI Native tokens；
- `tv` 默认开启 merge；
- `cn` 通过共享 `tailwind-merge` 配置解决 class 冲突。

实际 styles 同时使用了 `variants`、`compoundVariants` 与 `slots`。例如 [`avatar.styles.ts`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/src/components/avatar/avatar.styles.ts#L8-L128) 用 compoundVariants 表达 `variant × color`，并为 fallback 返回 `container` / `text` slots；[`slider.styles.ts`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/src/components/slider/slider.styles.ts) 用 slots 表达 output 与 thumb 的多部件样式。

这些 variant function 的结果是普通字符串。组件把结果直接传给 React Native primitive 的 `className`，例如 [`button.tsx`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/src/components/button/button.tsx#L280-L333) 的 `rootClassName` 与 `labelClassName`。因此可以确认：Native 端不是把 `tv()` 结果转成 `StyleSheet`；它依赖 Uniwind 接管 `className`。

### 4. Uniwind 如何让这些字符串在 Native 上生效

Uniwind `1.11.0` 的实际链路是：

1. Consumer 用 `withUniwindConfig(config, { cssEntryFile })` 指定唯一 CSS entry；缺少 `cssEntryFile` 会直接报错（[`config.ts`](https://github.com/uni-stack/uniwind/blob/0f8bdcd7134e93b5f4c33decc25984520181d99c/packages/uniwind/src/bundler/config.ts#L24-L41)）。
2. Uniwind 调用 `@tailwindcss/node` 的 `compile()`，再把 CSS 中解析出的 `compiler.sources` 与 CSS entry 所在目录交给 `@tailwindcss/oxide` `Scanner`，最后用扫描到的 candidates 构建 CSS/artifacts（[`compileTailwind.ts`](https://github.com/uni-stack/uniwind/blob/0f8bdcd7134e93b5f4c33decc25984520181d99c/packages/uniwind/src/bundler/css-compiler/compileTailwind.ts#L1-L24)）。因此 CSS 中的 `@source` 同样参与 Uniwind 的构建。
3. Native Metro resolver 遇到应用或组件库对 `react-native` 的 import 时，将其解析到 `uniwind/components`（[`resolvers.ts`](https://github.com/uni-stack/uniwind/blob/0f8bdcd7134e93b5f4c33decc25984520181d99c/packages/uniwind/src/bundler/adapters/metro/resolvers.ts#L68-L104)）。
4. Uniwind wrapper 读取 `props.className`，通过 `useStyle` 从已生成的 store 取得 React Native style，再与 consumer 的 `style` 合并；[`View.tsx`](https://github.com/uni-stack/uniwind/blob/0f8bdcd7134e93b5f4c33decc25984520181d99c/packages/uniwind/src/components/native/View.tsx) 是最小例子。

所以“`tailwind-variants` 支持 Uniwind”的准确表述是：它输出 Uniwind 可以消费的完整 class string；真正的 class discovery、Tailwind v4 编译、Metro import replacement 与 runtime style resolution 都由 Uniwind 完成。

### 5. npm component package 的 source scanning 与 styles import

Tailwind CSS v4 官方文档明确说明默认不扫描 `node_modules`；外部组件库需要用相对 stylesheet 的 `@source` 显式注册（[`detecting-classes-in-source-files.mdx`](https://github.com/tailwindlabs/tailwindcss.com/blob/bd868a314bd05ca78acd047e3da289274dd6ccd7/src/docs/detecting-classes-in-source-files.mdx#L133-L157)）。Tailwind 只把 source 当普通文本扫描，class 必须以完整字符串存在；动态拼出 `bg-${color}-500` 一类 token 不会被识别（[同一官方文档](https://github.com/tailwindlabs/tailwindcss.com/blob/bd868a314bd05ca78acd047e3da289274dd6ccd7/src/docs/detecting-classes-in-source-files.mdx#L60-L131)）。`tv()` 的静态 variant map 满足这个要求。

HeroUI Native `1.0.8` 已把这项责任放回 package：其发布的 `heroui-native/styles` 指向 `lib/module/styles/index.css`，源码 CSS 内含 [`@source ".."`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/src/styles/index.css#L1-L6)。固定版本 release note 解释，该路径在发布包中相对解析为 `lib/module`，避免 consumer 写死 `node_modules` 位置（[`v1.0.8 release note`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/content/docs/en/native/releases/v1-0-8.mdx#L128-L153)）。

官方 Native Quick Start 要求 consumer 的 global CSS 导入 `tailwindcss`、`uniwind` 与 `heroui-native/styles`（[`quick-start.mdx`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/content/docs/en/native/getting-started/%28overview%29/quick-start.mdx#L144-L169)）。该页面仍保留了旧 `@source './node_modules/heroui-native/lib'` 示例，但注释明确说从 `1.0.8` 起不再需要；同一 commit 的 `v1.0.8` release note 则说应删除。这是官方文档内部的残留不一致，不能把 app-level 路径当作 `1.0.8+` 推荐做法。

## 二、对 LearnUI 的建议（不是上游强制要求）

### Web：优先采用已发布 CSS，不把扫描路径甩给 consumer

推荐 `@learnui/web`：

- 组件内用 `tailwind-variants` 组织 `variants`；多部件组件使用 `slots`，只有真正跨 variant 条件时才增加 `compoundVariants`，不要为展示 API 而使用。
- 若采用 HeroUI Web 的语义 class 模式，则发布完整 `styles.css`，通过 package exports 暴露 `./styles`；consumer 只需在自己的 CSS entry 中按文档顺序导入 Tailwind 与 `@learnui/web/styles`，无需扫描 package JS。
- 若 variant map 直接保存 Tailwind utilities，则在包自己的 CSS entry 中加入指向**发布产物**的相对 `@source`，并保证该路径进入 npm tarball。不要默认要求 consumer 写死 `node_modules/@learnui/web/...`。
- 组件允许 consumer 传入任意 `className` 时，consumer 自己源码里的完整 class 会由其正常 app scan 发现；这与扫描 LearnUI 内部 defaults 是两件事。

### Native：让 package 自注册 source，但让 app 拥有 Uniwind 配置

推荐 `@learnui/native` 的 consumer contract：

```css
/* consumer global.css */
@import "tailwindcss";
@import "uniwind";
@import "@learnui/native/styles";
```

- `@learnui/native/styles` 内部导入 tokens/component CSS，并用相对自身的 `@source` 注册发布后的 JS/source 目录。
- Consumer 在自己的 Metro config 上调用 `withUniwindConfig(..., { cssEntryFile: "./global.css" })`，并在 app entry 只导入一次 `global.css`。组件 package 不应发布或接管 consumer 的 Metro config。
- npm `files` 与 exports 必须同时包含实际被 `@source` 指向的 compiled JS/source 和 CSS；只发布 `.d.ts` 或把 source path 指向未进 tarball 的目录会导致静默缺样式。
- variant map 中保留完整 class token；不要运行时拼接 token 片段。自定义 utilities/tokens 若会与标准 Tailwind group 冲突，要给 `tailwind-merge` / `tailwind-variants` 明确 `classGroups`。
- Animated style、gesture state 或平台属性仍用 React Native/Reanimated；不能因为 `className` 可用就假设所有 Native style 都适合进入 Tailwind。HeroUI Native 源码也为动画属性保留 `StyleSheet` / Reanimated 边界。

### peerDependencies / dependencies 建议

以下是 LearnUI 的建议声明，不是 HeroUI 的原样复制：

| 包 | Web | Native | 理由 |
| --- | --- | --- | --- |
| `react` / `react-dom` | peer | `react` peer | 由 host 提供，避免重复 runtime |
| `react-native` | 不适用 | peer | 由 app/Expo SDK 提供 |
| `tailwindcss` | peer `>=4` | peer `>=4` | consumer 拥有构建器、主题与扫描入口 |
| `uniwind` | 不适用 | peer | consumer 必须配置 Metro、CSS entry 和运行时；package 不能替 host 配置 |
| `tailwind-variants` | 默认 regular dependency | 默认 regular dependency；若公开导出共享 `tv/cn` 或依赖单例 config，则 peer | 纯 class composition 的内部实现不应无故要求 consumer 手装；公开共享配置时才需要版本/实例协商 |
| `tailwind-merge` | 仅在实际直接使用时 dependency | 若 Native wrapper 直接 import 且公开共享 merge semantics，可 peer；否则 dependency | 不要仅因 `tailwind-variants` 存在就重复声明 |

HeroUI Native 本身把 `tailwind-variants` / `tailwind-merge` 设为 peer，但当前源码 `package.json` 只把 `uniwind` 放在 devDependencies，尽管 runtime source 直接 import `uniwind`。其 Quick Start 通过文档要求 consumer 安装/配置 Uniwind。LearnUI 不应照抄这个隐式 contract；把 `uniwind` 声明为 peer 能让 package manager 更早暴露缺失依赖。

## 三、主要风险与验收点

1. **静默漏扫。** 错误的 `@source` 通常不报错，只表现为包内默认 class 消失。必须对安装后的 npm tarball 做真实 consumer fixture 测试，而不只是 monorepo source alias 测试。
2. **开发成功、发布失败。** Workspace host 自动扫描 `packages/native/src`，不代表 npm consumer 能扫描 `node_modules/@learnui/native/dist`。
3. **两层兼容不是一层保证。** `tailwind-variants` 能输出字符串，不代表 Uniwind 支持字符串所代表的全部 CSS utility/variant。每个新增 token 仍需按 Uniwind 支持面在 iOS/Android 验证。
4. **merge 误删。** 自定义 utilities 若落入错误的 Tailwind conflict group，后写 class 可能让必要 class 被丢弃；HeroUI Native 已因 `border-field` 类冲突增加自定义 merge config。
5. **官方安装文档漂移。** HeroUI Native 的 Quick Start 与 `v1.0.8` release note 对冗余 `@source` 的文字仍不完全一致；LearnUI 应把 package self-registration 作为单一 contract，并用 fixture 固化。

后续实施至少应验证：`pnpm pack` 后在临时 Expo consumer 中安装 tarball，consumer 只按公开说明导入 CSS 与设置 `withUniwindConfig`，不添加仓库相对路径；随后检查一个 class 仅存在于包内部的 default variant、一个 consumer override、一个 slot variant 和一个 compound variant 在 iOS 与 Android 均生效。Web 端同样用 tarball consumer 验证 CSS import、default variant 和 consumer `className` override。

## 主要官方来源

以下来源均访问于 2026-08-23：

- [`tailwind-variants` 官方仓库固定快照](https://github.com/heroui-inc/tailwind-variants/tree/e087a829e588d3406aff0473acbfc38d1d628d4a)
- [HeroUI Web `@heroui/styles` 固定快照](https://github.com/heroui-inc/heroui/tree/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/styles)
- [HeroUI Web `@heroui/react` 固定快照](https://github.com/heroui-inc/heroui/tree/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react)
- [HeroUI Native 官方仓库固定快照](https://github.com/heroui-inc/heroui-native/tree/0858b020ca1cb0f5ecd935b9675244d12c3cd338)
- [Uniwind 官方仓库固定快照](https://github.com/uni-stack/uniwind/tree/0f8bdcd7134e93b5f4c33decc25984520181d99c)
- [Tailwind CSS v4：Detecting classes in source files](https://github.com/tailwindlabs/tailwindcss.com/blob/bd868a314bd05ca78acd047e3da289274dd6ccd7/src/docs/detecting-classes-in-source-files.mdx)
- [HeroUI Native v1.0.8 release note：self-declared `@source`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/apps/docs/content/docs/en/native/releases/v1-0-8.mdx#L128-L153)

## 时效性与未验证范围

本文的“当前”只指上述 2026-08-23 固定 commits。源码与官方文档已核验，但本次未安装 npm tarball、未运行 Tailwind/Uniwind build，也未在 iOS/Android 执行组件；因此对实际发布包的结论是源码 contract 审计，不是运行验证。正式实现时仍需用真实 tarball consumer fixture 验收。
