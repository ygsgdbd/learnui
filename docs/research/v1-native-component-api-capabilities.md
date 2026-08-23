# V1 Native 八组件 API 能力研究

- 研究范围：iOS / Android；Button、TextField、Checkbox、Switch、Card、Badge、Divider、Spinner
- 访问日期：2026-08-23（Asia/Shanghai）
- React Native 文档版本：0.87；源码 tag `v0.87.0` 固定 commit [`4bc2473`](https://github.com/facebook/react-native/tree/4bc2473f5d0233ea5384c1ef24f6a55615de2220)
- React Native 文档固定快照：[`1091ab7`](https://github.com/react/react-native-website/tree/1091ab72a15e729db03a92dec8deaaebc454954e/website/versioned_docs/version-0.87)
- Expo Checkbox：SDK 56；固定 commit [`3f6d20a`](https://github.com/expo/expo/tree/3f6d20acf462f530679ba2bfc10eeb556fc08d1c/packages/expo-checkbox)
- Uniwind 固定快照：[`0f8bdcd`](https://github.com/uni-stack/uniwind/tree/0f8bdcd7134e93b5f4c33decc25984520181d99c)
- HeroUI Native 固定快照：[`0858b02`](https://github.com/heroui-inc/heroui-native/tree/0858b020ca1cb0f5ecd935b9675244d12c3cd338)

本文给 Wayfinder 提供能力边界和可选 API 形状，不替 Issue #6 做最终产品决策。建议仍需与 Web 研究合并后逐项确认。

## 结论矩阵

| 组件 | 推荐 Native primitives | 单 root / compound 可选形状 | state 能力 | 共享 vocabulary 候选 | 主要 Native-only 扩展 |
| --- | --- | --- | --- | --- | --- |
| Button | `Pressable` + `Text`；loading 时可含 `ActivityIndicator` | 简单内容可单 root；需要独立覆盖文字/图标/加载器样式时可 `Root` + `Label` | 无业务受控值；`pressed` 由 `Pressable` 管理；`isDisabled` / `isLoading` 为外部状态 | `variant`、`size: sm/md/lg`、`disabled/loading/pressed` | `android_ripple`、`android_disableSound`、`hitSlop`、`pressRetentionOffset`、`delayLongPress` |
| TextField | `View` + `Text` + `TextInput` | 应优先 compound：`Root`、`Label`、`Input`（或跨平台统一为 `Control`）、`Description`、`ErrorMessage` | `value` + `onChangeText` 受控；`defaultValue` 非受控；invalid/disabled/required 由 root context 下发 | `variant`、`size`、`disabled/invalid/required/focused` | `keyboardType` / `inputMode`、autofill、return key、secure input，以及下文列出的 iOS/Android 专属 props |
| Checkbox | 定制外观：`Pressable` + `View` + `Text`；系统外观备选 `expo-checkbox` | 定制版适合 `Root`、`Control`、`Indicator`、`Label`、`Description`；系统版只能单 root | wrapper 可同时提供 `isSelected` / `onSelectedChange` 与 `defaultSelected`；`expo-checkbox` 的 `value` 是受控输入 | `variant`、`size`、`selected/mixed/disabled/invalid/pressed` | 定制版继承 `Pressable` props；`expo-checkbox` 只有 `value`、`onValueChange`、`disabled`、`color` 等有限表面 |
| Switch | 最大原生性：core `Switch`；最大可组合性：`Pressable` + `View` | core `Switch` 单 root；定制版可 `Root` + `Thumb`，Start/EndContent 仅在确有教学价值时加入 | core `Switch` 明确是受控组件；定制 wrapper 才能另加 `defaultSelected` | `size`、`selected/disabled/pressed`；是否暴露视觉 `variant` 待跨平台决定 | core：`trackColor`、`thumbColor`、`ios_backgroundColor`；Uniwind 对 core `Switch` 不提供普通 `className` |
| Card | `View` + `Text`；只有整体可点击时 root 换 `Pressable` | 推荐 compound：`Root`、`Header`、`Body`、`Footer`、`Title`、`Description` | 静态 Card 无受控状态；交互 Card 只有瞬时 pressed/disabled | `variant: surface/elevated/outline` 候选、`size` 或 padding density、interactive/disabled | 交互版继承 `Pressable` 的 Android feedback 与 hit target props；静态版只继承 `ViewProps` |
| Badge | `View` + `Text` | 默认单 root；只有图标/label 必须分别覆盖时再考虑 `Root` + `Label` | 无内部 state；count/status 是外部内容；动态公告是宿主行为 | `color: neutral/accent/success/warning/destructive`、`variant: solid/soft/outline`、`size: sm/md` | `maxFontSizeMultiplier` 等 `TextProps`；嵌入可访问父控件时需要隐藏 Badge 自身并合并父级 label |
| Divider | `View` | 单 root | 无 | `orientation: horizontal/vertical`、`variant: thin/thick` 或 `thickness`；避免同时暴露重复轴 | 语义分隔可用新 `role="separator"`；装饰线默认 `accessible={false}`；旧 `accessibilityRole` 没有 separator |
| Spinner | core `ActivityIndicator`；需要自定义轨迹时 `View`/SVG + Reanimated | core 能力适合单 root；若允许替换图形，可选 `Root` + `Indicator` | `animating` / `isLoading` 为受控显示状态；无非受控需求 | `size: sm/md/lg`、`color`、`loading` | `hidesWhenStopped` 为 iOS-only；数值 `size` 需按 Android 能力验证；Uniwind 用 `colorClassName` 而非普通文字色 class |

## 逐组件能力与语义

### Button

- `Pressable` 提供 `onPressIn`、`onPressOut`、`onPress`、`onLongPress`、`disabled`、render-function children，以及根据 `{ pressed }` 返回样式的 `style`；按下反馈不需要进入公开受控 API。见 [Pressable 0.87](https://github.com/react/react-native-website/blob/1091ab72a15e729db03a92dec8deaaebc454954e/website/versioned_docs/version-0.87/pressable.md)。
- root 应为单一 accessibility element：`accessibilityRole="button"`，`accessibilityState={{ disabled, busy: isLoading }}`。有可见文字时 React Native 会由 Text descendants 生成默认 label；icon-only 必须要求 `accessibilityLabel`。`accessibilityHint` 只描述点击后不明显的结果，不重复 label。
- loading indicator 若只服务于 Button，应从 accessibility tree 隐藏，由 Button 自身的 `busy` 和保留的动作 label 表达状态，避免同时聚焦 Button 与 Spinner。
- `variant`、`size`、disabled/loading 是共享 API 候选；`android_ripple` 等平台 props 可透传，但 pressed scale、opacity、ripple 具体参数不宜自动升级为共享 variant vocabulary。

### TextField

- `TextInput` 的 `value` 是受控值；`defaultValue` 明确用于“不监听事件并保持 value 同步”的非受控用法。`editable={false}` / `readOnly` 控制不可编辑。证据见 [TextInput `value` / `defaultValue` 0.87](https://github.com/react/react-native-website/blob/1091ab72a15e729db03a92dec8deaaebc454954e/website/versioned_docs/version-0.87/textinput.md#value)。
- `TextInput` 自身已有原生输入语义，不应把它覆写成 `accessibilityRole="text"`。搜索框可按明确意图使用 `role="searchbox"` 或旧 `accessibilityRole="search"`。
- Android 可让 `Label.nativeID` 与 Input 的 `accessibilityLabelledBy` / `aria-labelledby` 建立关系；React Native 0.87 把这两个 API 都标为 Android-only。iOS 没有等价 labelled-by prop，需在 compound context 中同步纯文本 label 到 Input 的 `accessibilityLabel`，或要求 consumer 显式提供该 label。任意 ReactNode label 无法可靠无损地自动变成可读字符串，这是待 Wayfinder 决定的 API 缝隙。见 [Accessibility 文档](https://github.com/react/react-native-website/blob/1091ab72a15e729db03a92dec8deaaebc454954e/website/versioned_docs/version-0.87/accessibility.md#accessibilitylabelledby-android)。
- `accessibilityState` 只有 disabled、selected、checked、busy、expanded，没有 invalid / required。invalid、required 与错误文字不能假装塞进 state；应通过 label/辅助文字和状态变化公告表达。Android 动态错误可用 `accessibilityLiveRegion="polite"`；该 prop 是 Android-only。iOS 需要在确有必要时由宿主通过 `AccessibilityInfo.announceForAccessibility` 主动公告，且不能在每次输入时打断 VoiceOver。
- `Description` / `ErrorMessage` 需要稳定 `nativeID` 以便未来关联，但 React Native 0.87 的公开 View 文档和类型未提供跨平台 `accessibilityDescribedBy` / `aria-describedby` contract；V1 不能照搬 Web 的 `aria-describedby` 并声称两端等价。
- 适合保留的 Native props 包括跨平台 `inputMode`、`keyboardType`、`autoComplete`、`secureTextEntry`、`returnKeyType`、`submitBehavior`、`multiline`、`numberOfLines`。iOS-only 包括 `clearButtonMode`、`inputAccessoryViewID`、`keyboardAppearance`、`textContentType` 等；Android-only 包括 `importantForAutofill`、`rows`、`returnKeyLabel`、`selectionHandleColor`、`underlineColorAndroid` 等。它们应通过 `TextInputProps` 透传，而不是逐个复制成 LearnUI 自有 props。

### Checkbox

- React Native core 没有 Checkbox。若 LearnUI 要完全控制形状、mixed indicator 和 compound parts，基础应是一个负责交互的 `Pressable` 加视觉 `View`；Indicator/图标必须 `role="presentation"` 或从 accessibility tree 隐藏，只让 root 获得焦点。
- root 使用 `role="checkbox"`（或 `accessibilityRole="checkbox"`）和 `accessibilityState={{ checked: boolean | 'mixed', disabled }}`。label/hint 策略与 TextField 相同：Android 可 labelled-by，iOS 需要 root 自有 `accessibilityLabel`。
- 自建 wrapper 可以同时支持受控 `isSelected` / `onSelectedChange` 与非受控 `defaultSelected`。若支持 mixed，必须另行决定用户点击 mixed 后转为 true 还是 false；这是交互产品决策，不是 primitive 能力。
- Expo SDK 56 的 [`expo-checkbox`](https://github.com/expo/expo/blob/6c40f4bc42075bf68726346678599f67e83e52b6/docs/pages/versions/v56.0.0/sdk/checkbox.mdx) 是系统外观备选，支持 iOS / Android / tvOS / Web / Expo Go；其固定类型只有 `value`、`disabled`、`color`、`onChange`、`onValueChange` 与 `ViewProps`，不提供 mixed、defaultValue 或 compound indicator。见 [`Checkbox.types.ts`](https://github.com/expo/expo/blob/3f6d20acf462f530679ba2bfc10eeb556fc08d1c/packages/expo-checkbox/src/Checkbox.types.ts)。

### Switch

- core [`Switch`](https://github.com/react/react-native-website/blob/1091ab72a15e729db03a92dec8deaaebc454954e/website/versioned_docs/version-0.87/switch.md) 明确是受控组件：consumer 必须在 `onValueChange` 后更新 `value`，否则视觉值不会改变。
- core Switch 最接近平台原生交互与语义，但公开定制仅有 `trackColor`、`thumbColor`、`ios_backgroundColor` 等，不能自然支持 `Thumb` compound part。若 LearnUI 要教学可替换 Thumb、轨迹内图标或自定尺寸，只能改用 `Pressable` + `View` 并自行维护 `role="switch"`、`accessibilityState.checked/disabled` 和动画。
- custom root 可提供 `isSelected` / `onSelectedChange` 与 `defaultSelected`；core root 则应保持 `value` / `onValueChange` 的 React Native vocabulary。两种 API 不能在未决定 rendering primitive 前假定等价。
- `accessibilityValue.text` 可在业务确需自定义“开/关”措辞时使用；默认状态应交给 switch role + checked state 本地化，不要硬编码英文 `on/off`。

### Card

- 结构 primitive 是 `View` / `Text`，适合 `Root`、`Header`、`Body`、`Footer`、`Title`、`Description`。这些 parts 只负责布局与排版，不应自动把 Card 变成一个 accessibility group。
- 静态 Card 默认没有 role；不要使用 `summary`，React Native 把它定义为“应用启动时提供当前状况概览”的特殊角色，并非通用卡片。
- 只有“整个卡片是一个动作”时才把 root 换为 `Pressable` + button/link role。此时要避免子级又包含独立 Button/Link，避免嵌套动作与重复焦点。
- `Title` 只有在它真的是内容 section heading 时才使用 `accessibilityRole="header"`；视觉上像标题不自动等于语义 heading。

### Badge

- 非交互 Badge 只需 `View` + `Text` 单 root；Badge 与可操作 Chip/Tag 应是不同组件，不应仅因外形相似就继承 `PressableProps`。
- 独立状态文字可作为普通 Text 被读取；纯装饰 Badge 应 `accessible={false}`。Badge 放在 Button/Icon 内时，优先隐藏 Badge 自身并把“3 条未读”等信息合并到父控件 `accessibilityLabel`，避免两个焦点。
- Android 上动态 count/status 可在承载文字的 Text 上使用 `accessibilityLiveRegion="polite"`；iOS 没有该 prop 的等价声明，只有确实需要即时通知的变化才由宿主调用公告 API。
- Badge 没有受控/非受控 state；`count`、status、children 都是 render input。若需要最大值折叠（如 `99+`），它属于内容格式 API，不能与可访问完整值混为一谈。

### Divider

- 装饰线默认应从 accessibility tree 排除。若内容结构确实需要分隔语义，React Native 0.87 的新 `role` 联合类型包含 `separator`，但旧 `AccessibilityRole` 不包含，所以应使用 `role="separator"` 而不是 `accessibilityRole="separator"`。证据见 [`ViewAccessibility.d.ts`](https://github.com/facebook/react-native/blob/4bc2473f5d0233ea5384c1ef24f6a55615de2220/packages/react-native/Libraries/Components/View/ViewAccessibility.d.ts#L385-L419)。
- Native role contract 未暴露与 Web 完全对称的 separator orientation state；`orientation` 主要是视觉/布局 prop，不能声称屏幕阅读器必然播报水平或垂直。
- `variant: thin/thick` 与自由 `thickness` 同时公开会形成两条重叠样式轴；primitive 两者都能实现，但 Wayfinder 应决定保留哪种稳定 API。

### Spinner

- core [`ActivityIndicator`](https://github.com/react/react-native-website/blob/1091ab72a15e729db03a92dec8deaaebc454954e/website/versioned_docs/version-0.87/activityindicator.md) 提供 `animating`、`color`、`size`；`hidesWhenStopped` 是 iOS-only。
- standalone Spinner root 使用 `accessibilityRole="progressbar"`、`accessibilityState={{ busy: isLoading }}` 和业务 `accessibilityLabel`。无确定百分比的 spinner 不应伪造 `accessibilityValue.now/min/max`。
- 持续旋转的 Indicator 只负责视觉，不应自己成为第二个 accessibility element。Spinner 嵌入 Button/TextField 时同样隐藏 Indicator，把 busy/error 状态放到真正的交互 root。
- `isLoading=false` 时是返回 `null`、保留空 root、还是仅停止动画，会影响 layout 和 accessibility tree；三种 primitive 均能实现，属于需要明确的 public contract。

## iOS / Android 关键差异

| 能力 | iOS | Android | API 影响 |
| --- | --- | --- | --- |
| 可见 Label 与控件关联 | 无 `accessibilityLabelledBy` contract | `accessibilityLabelledBy` / `aria-labelledby` 可引用 `nativeID` | TextField / Checkbox / Switch 需要 cross-platform label fallback，不能只生成 ID |
| live region | `accessibilityLiveRegion` 不可用；必要时使用显式 announce API | `none/polite/assertive`，API 19+ | ErrorMessage、Badge、异步状态不能用同一 prop 声称完全对称 |
| separator | 新 `role="separator"` 的跨平台实际播报仍需设备验收 | 同左 | V1 应有 VoiceOver + TalkBack acceptance，不回退到不存在的旧 `accessibilityRole` 值 |
| TextInput 平台 props | `clearButtonMode`、`inputAccessoryViewID`、`keyboardAppearance`、`textContentType` 等 | `importantForAutofill`、`rows`、`returnKeyLabel`、`selectionHandleColor`、`underlineColorAndroid` 等 | 继承 `TextInputProps` 比复制封装稳定 |
| Switch styling | `ios_backgroundColor`；设置 `thumbColor` 会失去系统 thumb shadow | 主要通过 `trackColor` / `thumbColor` | shared variant 只能表达视觉意图，不保证解析成同一原生 prop |
| Spinner | `hidesWhenStopped` | 无该 prop；数值 size 需要 Android 路线验证 | shared `size` 应映射而不是裸透传平台数值 |
| feedback | 无 Android ripple | `android_ripple` / `android_disableSound` | Android feedback 可作为 Native-only props，不应反推 Web API |

## Uniwind `className`、`style` 与 motion 边界

1. Uniwind 当前官方指南说明 core `View`、`Text`、`Pressable`、`TextInput`、`ActivityIndicator` 及 Reanimated components 已支持 `className`，不要再用 `withUniwind` 包装。第三方 primitive 才使用 `withUniwind`。固定证据：[`SKILL.md`](https://github.com/uni-stack/uniwind/blob/0f8bdcd7134e93b5f4c33decc25984520181d99c/skills/uniwind/SKILL.md) 与 [`component-bindings.md`](https://github.com/uni-stack/uniwind/blob/0f8bdcd7134e93b5f4c33decc25984520181d99c/skills/uniwind/references/component-bindings.md)。
2. core `Switch` 是例外：没有普通 `className`，Uniwind 只提供 `thumbColorClassName`、`trackColorOnClassName`、`trackColorOffClassName`、`ios_backgroundColorClassName`；`ActivityIndicator.color`、TextInput placeholder/selection/cursor 等非-style 颜色同样使用专属 `*ColorClassName` + `accent-` vocabulary。
3. 每个简单 root、每个公开 compound part 接受自己的 `className`；consumer class 合并最后。Native `style` 仍应透传且最后生效，用于 platform object、测量结果和调用方 Animated style。不要增加平行 `classNames` map，符合 ADR-0002。
4. class 字符串必须是完整静态 token；不能运行时拼接 `bg-${color}`。`tailwind-variants` 只组合完整字符串，variant engine 不进入 public API。固定证据：[`styling-patterns.md`](https://github.com/uni-stack/uniwind/blob/0f8bdcd7134e93b5f4c33decc25984520181d99c/skills/uniwind/references/styling-patterns.md)。
5. V1 baseline 不应依赖 Uniwind Pro animation classes：Pro 需要 native module、Reanimated v4 且不能运行于 Expo Go。pressed、selection、thumb travel、spinner rotation、enter/exit 等连续或可中断 motion 留给 React Native Animated/Reanimated；utility classes负责静态 layout/color/typography/state style。即使直接使用 Reanimated，官方也允许 Animated components 继续接收 `className`。见 [`pro.md`](https://github.com/uni-stack/uniwind/blob/0f8bdcd7134e93b5f4c33decc25984520181d99c/skills/uniwind/references/pro.md#using-reanimated-directly)。
6. motion 必须读取 React Native `AccessibilityInfo.isReduceMotionEnabled()` 并监听 `reduceMotionChanged`；reduced motion 下用静态状态或短 opacity/color feedback，避免 scale、travel、continuous rotation 成为唯一状态线索。见 [`AccessibilityInfo 0.87`](https://github.com/react/react-native-website/blob/1091ab72a15e729db03a92dec8deaaebc454954e/website/versioned_docs/version-0.87/accessibilityinfo.md)。

## HeroUI Native 固定源码交叉核验

| LearnUI 范围 | HeroUI Native `0858b02` 做法 | 对 Wayfinder 的意义 |
| --- | --- | --- |
| Button | compound `Button` + `Label` + `Background`；`PressableFeedback` 公开 `feedbackVariant` 与深层 animation config；root 默认 button role/state | 证明 compound label、root class/style 与 Native feedback 可行；LearnUI 不必复制其较大的动画 public API |
| TextField | `TextField` 只是 context root；`Label`、`Input`、`Description`、`FieldError` 是独立 imports，不是附着 parts | 结构可组合，但 parts 是否挂在 `TextField.*` 仍是 LearnUI 的跨平台命名决策；源码没有自动完成 iOS label association |
| Checkbox | custom `Pressable` primitive + `Indicator` / `Background`；root 设置 checkbox role 与 checked/disabled state | 源码虽注释“controlled and uncontrolled”，实际没有内部 state 或 `defaultSelected`，`isSelected` 不更新时不会持久切换；不能把注释当能力证据 |
| Switch | custom `Pressable` + `Thumb` / `StartContent` / `EndContent` / `Background`；手工 switch role/state + Reanimated travel | 同样没有内部 state / `defaultSelected`；证明可组合性与原生 core Switch 的样式限制存在明确取舍 |
| Card | `Root`、`Header`、`Body`、`Footer`、`Title`、`Description` compound，root 基于 `Surface` | 与 LearnUI 组合优先原则一致；其源码没有为普通 Card 强加 role |
| Badge | 固定快照没有 `Badge`；最接近的是 compound `Chip`，但 root 是 `Pressable` | Badge 不应直接复制 Chip，否则会把非交互状态标签错误升级成操作控件 |
| Divider | 名称为单 root `Separator`，支持 horizontal/vertical、thin/thick 与 `thickness` | 证明 primitive 和样式轴可行；源码未设置 separator accessibility role，LearnUI 需要独立做语义决定 |
| Spinner | custom `Root` + `Indicator`，root role=progressbar/state.busy，内部 Indicator 隐藏；自绘图标 + Reanimated rotation | accessibility 分层值得复用；是否需要公开 `Indicator` 与 animation config 仍应按 V1 教学目标裁剪 |

固定源码入口：[`Button`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/src/components/button/button.tsx)、[`TextField`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/src/components/text-field/text-field.tsx)、[`Checkbox primitive`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/src/primitives/checkbox/checkbox.tsx)、[`Switch primitive`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/src/primitives/switch/switch.tsx)、[`Card`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/src/components/card/card.tsx)、[`Chip`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/src/components/chip/chip.tsx)、[`Separator`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/src/components/separator/separator.tsx)、[`Spinner`](https://github.com/heroui-inc/heroui-native/blob/0858b020ca1cb0f5ecd935b9675244d12c3cd338/src/components/spinner/spinner.tsx)。

## 提交给 Wayfinder 的历史问题

以下问题已由 ADR-0007、ADR-0008 与 ADR-0010 解决，保留本节仅用于追溯研究到决策的过程。

1. Button 是单 root + 自动文字包装，还是公开 `Button.Label`；loading 是否总是阻止二次 press。
2. TextField 的输入 part 跨平台叫 `Input` 还是 `Control`；iOS label fallback 是由 context 提取纯文本，还是要求显式 `accessibilityLabel`。
3. Checkbox / Switch 是否承诺 uncontrolled `defaultSelected`；Checkbox 是否支持 `mixed`，以及 mixed 的点击转换规则。
4. Switch 选 core 原生 control，还是选可组合 custom Pressable；这会直接决定 parts、sizes、motion 与 Uniwind contract。
5. Badge 是否永远非交互；若需要可操作 compact item，应另用 Chip/Tag 而不是给 Badge 加 `onPress`。
6. Divider 保留 `variant` 还是自由 `thickness`；semantic separator 是 opt-in 还是默认。
7. Spinner 是只包装 core `ActivityIndicator`，还是公开 `Indicator` slot；`isLoading=false` 的 layout contract 是什么。

## 研究限制

本次核对的是官方文档与固定源码快照，没有在 iOS Simulator、Android Emulator、VoiceOver 或 TalkBack 上执行验收。尤其 `role="separator"`、动态错误公告、最大字体缩放、Switch 自绘语义和 reduced-motion fallback，必须在后续 Gallery development build 中做双平台设备验证。
