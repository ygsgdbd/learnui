# V1 Web 组件 API 能力：React Aria Components 与 HeroUI v3 证据

- 服务票据：[Issue #6：定义首批八个组合式组件的跨平台 API 与状态矩阵](https://github.com/ygsgdbd/learnui/issues/6)
- 调研范围：仅 Web；Button、TextField、Checkbox、Switch、Card、Badge、Divider、Spinner
- 调研日期与访问日期：2026-08-23（Asia/Shanghai）
- React Aria Components 固定源码：[`react-aria-components@1.20.0`，commit `5d191ab94472daa8fa53d02e3c425639c2f381a7`](https://github.com/adobe/react-spectrum/tree/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components)
- HeroUI Web 固定源码：[`v3` HEAD `1d2164e7b9a60221e39501081f0fe4f6c564bccf`](https://github.com/heroui-inc/heroui/tree/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react)，该快照 packages 版本为 `3.2.4`；稳定 release [`v3.2.4`](https://github.com/heroui-inc/heroui/releases/tag/v3.2.4) 对应 `21b1e8e53fd147284f7a19325db40330b84d0684`。八个目标组件在 release commit 到该 HEAD 间未变。
- Context7：先解析 `React Aria Components`，选中高信誉官方文档索引 `/websites/react-aria_adobe`；按 Button、TextField、selection controls 三个单一概念查询。下列结论再用 Adobe 官方文档和固定源码核验，Context7 不是唯一证据。

## 边界与读法

本文记录上游和浏览器**能够支持什么**，并提供倾向性的 API 形态，不替 Issue #6 做最终跨平台决策。尤其是 part 名称、共享 variant 值、Badge 的产品含义和 Spinner 的无障碍语义，仍需与 Native 证据合并后决定。

仓库约束已经确定：Web 行为与浏览器语义由 React Aria Components 所有；简单组件可单 root，多部件组件优先 named parts；有限的 `variant`、`size`、`color` 可公开，但 `tv`、slots 和 compound rules 保持内部；每个公开 part 单独接受 `className`。见 [`packages/web/CONTEXT.md`](../../packages/web/CONTEXT.md)、[`DESIGN.md`](../../DESIGN.md)、[ADR-0002](../adr/0002-internal-variant-engine-and-platform-style-entries.md) 和 [ADR-0006](../adr/0006-platform-owned-semantic-tokens-and-theme-modes.md)。

## 紧凑能力矩阵

| 组件 | React Aria primitive | Web API 形态倾向 | 受控 / 非受控与 validation | 行为与状态能力 | Web vocabulary 候选（不是最终合同） |
| --- | --- | --- | --- | --- | --- |
| Button | 有：`Button` | 单 root | 无 value state；`isPending` / `isDisabled` 由调用方控制；支持 HTML form `type` / `form*` | 原生 button；mouse/touch/keyboard 统一 `onPress`；hover/pressed/focus/focus-visible/disabled/pending | `size: sm/md/lg`；视觉 variant 可从 `primary/secondary/tertiary/outline/ghost/danger/danger-soft` 收敛；state 使用上游词汇 |
| TextField | 有：`TextField` + `Label` + `Input`/`TextArea` + `Text` + `FieldError` | compound | `value` / `defaultValue` / `onChange`；`isInvalid`、`isRequired`、`validate`；`validationBehavior: native/aria`，RAC 组件默认 `native` | label/help/error 自动关联；input hover/focus/focus-visible/disabled/invalid；root disabled/invalid/readonly/required | 不应因 Button 有 size 就自动添加 size；HeroUI 只有 `variant: primary/secondary` 与 `fullWidth`；state 与上游同名 |
| Checkbox | 有：当前推荐 `CheckboxField` + `CheckboxButton`；旧 `Checkbox` deprecated | compound | `isSelected` / `defaultSelected` / `onChange`；`isIndeterminate` 仅展示；Field 支持 required/invalid/validate/native-vs-aria | 隐藏原生 checkbox input；Space/label press；focus-visible；selected/indeterminate/pressed/hovered/disabled/readonly/invalid/required | parts 候选 `Root/Content(or Label)/Control/Indicator/Description/ErrorMessage`；HeroUI variant `primary/secondary` |
| Switch | 有：当前推荐 `SwitchField` + `SwitchButton`；旧 `Switch` deprecated | compound | `isSelected` / `defaultSelected` / `onChange`；只有 Field 形态完整支持 validation | 隐藏 `type=checkbox` input 并加 `role=switch`；Space/label press；focus-visible；selected/pressed/hovered/disabled/readonly/invalid/required | parts 候选 `Root/Content(or Label)/Control/Thumb/Description/ErrorMessage`；HeroUI size `sm/md/lg` |
| Card | 无 | compound 展示容器 | 无受控 state / validation | 默认不应凭空增加交互 role、键盘或 focus；语义来自组合内容与选择的 DOM element | parts 候选 `Root/Header/Title/Description/Content/Footer`；HeroUI variant `default/secondary/tertiary/transparent` |
| Badge | 无 | 取决于含义；HeroUI 是 `Anchor + Root + Label` compound | 无受控 state / validation | 默认 `span`、无 role/键盘；不能把颜色或位置当作无障碍语义 | HeroUI `size: sm/md/lg`、`color: default/accent/danger/success/warning`、`variant: primary/secondary/soft`、四向 placement；是否共享须先定义 Badge 是 inline label 还是 anchored overlay |
| Divider | 有：名称为 `Separator` | 单 root | 无 state / validation | 默认 `<hr>`；vertical 时可用 `<div role="separator" aria-orientation="vertical">`；无键盘/focus | `orientation: horizontal/vertical`；HeroUI variant `default/secondary/tertiary` |
| Spinner | **没有名为 Spinner 的 primitive**；可用 indeterminate `ProgressBar` | 单 root | 无 uncontrolled state；`isIndeterminate` 或任务状态由调用方控制；若复用 ProgressBar 还支持 value/min/max | `ProgressBar` 是 `role=progressbar` 且 indeterminate 时省略 `aria-valuenow`；HeroUI 自实现 `role=status`。装饰性 spinner 应与可感知 loading 状态分开处理 | HeroUI `size: sm/md/lg/xl`、`color: accent/current/danger/success/warning`；`xl` 是否跨平台共享需核验 Native |

HeroUI v3 的关键差异可压缩为五点：所有组件都提供 callable root 与 `.Root` 别名，但真正多 part 的只有 Checkbox、Switch、Card、Badge；TextField 的 Label/Input/Description/FieldError 是独立导入而不是 dot parts；Checkbox/Switch 已采用 RAC Field + Button 双 primitive；旧 Divider 已更名为 Separator；Button 固定源码有 `danger-soft`，而稳定文档 API 表仍只列到 `danger`，精确能力应以固定源码类型为准。

## 1. Button

### Primitive、结构与原生 props

React Aria Components 有单根 [`Button`](https://react-aria.adobe.com/Button)。固定源码的 [`ButtonProps` 与 render props](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components/src/Button.tsx#L36-L98) 暴露 `isHovered`、`isPressed`、`isFocused`、`isFocusVisible`、`isDisabled`、`isPending`，并接受函数型 `children`、`className`、`style`。它最终渲染原生 `<button>`（[实现](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components/src/Button.tsx#L105-L194)）。

可透传的 Web 原生能力包括：

- `type: button | submit | reset`，默认 `button`；`form`、`formAction`、`formEncType`、`formMethod`、`formNoValidate`、`formTarget`、`name`、`value`；
- `aria-expanded`、`aria-haspopup`、`aria-controls`、`aria-pressed`、`aria-current`；
- `autoFocus`、`excludeFromTabOrder`、focus/key handlers；
- `onPress*` 优先于兼容性的 `onClick`，`PressEvent.pointerType` 区分 mouse/touch/keyboard/virtual。底层 `useButton` 的完整 form 与 ARIA 映射见[固定源码](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria/src/button/useButton.ts#L31-L227)。

Button 没有 controlled/uncontrolled value。`isPending` 是受调用方控制的状态：仍可聚焦，但 press/大部分交互被禁用，`aria-disabled=true`，pending 变化在按钮聚焦时由 live announcer 宣告；submit button 在 pending 时临时改成 `type=button`，阻止输入框 Enter 导致隐式提交。官方文档同时要求 pending 的 `ProgressBar` 进入 accessibility tree（[`Pending` 文档](https://react-aria.adobe.com/Button#pending)）。

### 上游组合与 vocabulary

Button 是明确的单 root。HeroUI v3 也直接包裹 RAC `Button`（[`button.tsx`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/src/components/button/button.tsx#L14-L69)），variant 为 `primary | secondary | tertiary | outline | ghost | danger | danger-soft`，size 为 `sm | md | lg`，另有 `fullWidth` 与 `isIconOnly`（[`button.styles.ts`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/styles/src/components/button/button.styles.ts)）。这些值证明 Web 可实现，不代表 LearnUI 必须全部公开。

Web-only extension 应保留 RAC render props、`onPress` 事件族、HTML form props、`render` DOM override 和 `slot`；跨平台核心只适合讨论 `variant`、`size`、disabled/loading 意图与 content children。

## 2. TextField

### Primitive、compound parts 与值状态

React Aria 官方 anatomy 是 [`TextField > Label + Input/TextArea + Text[description] + FieldError`](https://react-aria.adobe.com/TextField#api)。固定源码的 root [`TextFieldProps`](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components/src/TextField.tsx#L42-L94) 提供 `isDisabled`、`isInvalid`、`isReadOnly`、`isRequired` render/data state；root 通过 contexts 把 label、input、description、error props 分发到命名 children（[实现](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components/src/TextField.tsx#L101-L183)）。`Input` 自身再提供 hovered/focused/focus-visible/disabled/invalid（[`Input.tsx`](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components/src/Input.tsx#L28-L127)）。

值 API 是 `value`（controlled）、`defaultValue`（uncontrolled）和 `onChange(value: string)`。浏览器输入能力包括 `name`、`form`、`type`、`pattern`、`minLength`、`maxLength`、`placeholder`、`autoComplete`、`autoCapitalize`、`inputMode`、`enterKeyHint`、`autoCorrect`、`spellCheck`，以及 clipboard/composition/input/key/focus events。官方值与 forms 示例见 [`TextField` 文档](https://react-aria.adobe.com/TextField#value)。

### Validation、键盘、焦点与 ARIA

- `isRequired`、`isInvalid` 和 `validate(value)` 是 field validation；`FieldError` 仅在 invalid 时渲染，并可接收 `ValidationResult`（[`FieldError.tsx`](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components/src/FieldError.tsx#L23-L85)）。
- `validationBehavior="native"` 使用 required/constraint validation 阻止表单提交；`"aria"` 只设置 ARIA required/invalid，便于外部 form library 接管。虽然底层 hook 默认 `aria`，RAC `TextField` 组件显式默认 `native`（[`TextField.tsx`](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components/src/TextField.tsx#L106-L121)）。
- label、description、error message 的 id/ARIA 关系由 React Aria 生成；文本输入与 Tab、编辑、selection、IME 等继续使用原生 input/textarea 行为。

因此能力上应是 compound。共享 part 候选是 `Root/Label/Input(or Control)/Description/ErrorMessage`；Web 的 `Input`、`TextArea`、`FieldError` 名称和所有 browser-only attributes 可作为平台 extension。HeroUI v3 也将 TextField root 与 Input 分开（[`textfield.tsx`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/src/components/textfield/textfield.tsx)、[`input.tsx`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/src/components/input/input.tsx)），目前只给 Input `primary | secondary` 和 `fullWidth`，没有 size。这是不要强造全组件统一 size 的反证。

## 3. Checkbox

### Primitive 与当前推荐结构

`react-aria-components@1.20.0` 已把旧单根 `Checkbox` 标为 deprecated，明确要求使用 `CheckboxField + CheckboxButton`（[源码](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components/src/Checkbox.tsx#L462-L488)）。官方 anatomy 还在 Field 下组合 description 与 error（[`Checkbox` 文档](https://react-aria.adobe.com/Checkbox#api)）。

当前 Field/Button 能力支持：

- `isSelected` / `defaultSelected` / `onChange(boolean)`；HTML form `name`、`value`、`form`；form reset 回到 default selection；
- `isIndeterminate` 只影响展示，并且在用户交互后仍保持，直到调用方改 prop；它不会形成第三种 selection value（[`useCheckbox`](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria/src/checkbox/useCheckbox.ts#L25-L100)）；
- Field 支持 `isRequired`、`isInvalid`、`validate(boolean)`、`validationBehavior` 与 error message；RAC compound 默认 `native`；
- render/data state 为 selected、indeterminate、hovered、pressed、focused、focus-visible、disabled、readonly、invalid、required（[`CheckboxRenderProps`](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components/src/Checkbox.tsx#L161-L245)）。

`CheckboxButton` 渲染 `<label>`，内部保留 visually hidden 的原生 `<input type="checkbox">`（[实现](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components/src/Checkbox.tsx#L489-L550)），因此 Space、label click/press、focus 与 form submission 继续遵循原生 checkbox；React Aria 统一 pointer/keyboard press state。disabled 不可交互/不可 Tab 聚焦；readonly 保持 focusable 但 state setter 不改变 selection。

HeroUI v3 已跟随 compound primitive，公开 `Root(Field) + Content(Button) + Control + Indicator`，并要求 Description/FieldError 作为 Content 的 sibling（[`checkbox.tsx`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/src/components/checkbox/checkbox.tsx#L28-L181)）；只有 `variant: primary | secondary`（[`checkbox.styles.ts`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/styles/src/components/checkbox/checkbox.styles.ts)）。能力证据支持 compound，但 `Content` 还是 `Label` 作为共享 part 名需等 Native 一起决定。

## 4. Switch

### Primitive、状态与 ARIA

与 Checkbox 相同，RAC `1.20.0` 将旧单根 `Switch` 标为 deprecated，推荐 `SwitchField + SwitchButton`（[源码](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components/src/Switch.tsx#L219-L272)）。新 Field/Button anatomy 见[官方文档](https://react-aria.adobe.com/Switch#api)。

受控状态是 `isSelected` / `defaultSelected` / `onChange(boolean)`；支持 `name`、`value`、`form` 和 form reset。Field 形态支持 `isRequired`、`isInvalid`、`validate(boolean)`、`validationBehavior`、description 与 error。一个易错边界是：deprecated 的旧 `SwitchProps` 已主动 omit `isRequired`、`isInvalid`、`validate`，不能以旧单 root 形态推导完整 validation API（[`SwitchProps`](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components/src/Switch.tsx#L43-L69)）。

底层仍是 visually hidden `<input type="checkbox">`，但 React Aria 添加 `role="switch"` 和 `checked`，让 assistive technology 宣告 on/off 而不是勾选项（[`useSwitch`](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria/src/switch/useSwitch.ts#L23-L78)）。Space、label press、disabled/readonly/focus 行为与 toggle 基础一致。Field/Button render state 包括 selected、hovered、pressed、focused、focus-visible、disabled、readonly、invalid、required（[`Switch.tsx`](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components/src/Switch.tsx#L106-L199)）。

HeroUI v3 组合 `Root(Field) + Content(Button) + Control + Thumb + Icon`（[`switch.tsx`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/src/components/switch/switch.tsx#L24-L166)），只提供 `size: sm | md | lg`（[`switch.styles.ts`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/styles/src/components/switch/switch.styles.ts)）。`Icon` 是展示扩展，不是 RAC 语义 part；是否跨平台共享应另议。

## 5. Card

React Aria Components 没有 `Card` export，也没有对应 behavior primitive。Card 默认是展示型内容容器：无 controlled state、validation、keyboard、focus 或 ARIA role。若 Card 后续要可点击/可选择，应组合 Button、Link 或 collection primitive，而不是给展示 root 临时补 `onClick` 后声称可访问。

HeroUI v3 纯 DOM 实现 `Root + Header + Title + Description + Content + Footer`，各 part 可换合适的 HTML element（[`card.tsx`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/src/components/card/card.tsx#L23-L211)）；variant 是 `default | secondary | tertiary | transparent`（[`card.styles.ts`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/styles/src/components/card/card.styles.ts)）。这支持 compound 倾向，也表明语义应来自 `Title` 默认 heading、内容结构和 consumer 选择的 DOM，而不是 Card primitive。

Web-only extension 是每个 part 的 DOM `render`/element polymorphism 和原生 attributes。跨平台可共享的是 part 意图和有限 surface variant，不是 DOM tag。

## 6. Badge

React Aria Components 没有 `Badge` primitive。它默认没有 state、validation、keyboard、focus 或 ARIA role；数字、状态或告警若需要被读出，必须由使用场景提供可访问名称/文本或 live-region 策略，不能只依赖颜色。

这里存在产品含义歧义：Badge 可能指独立 inline status label，也可能指附着在 avatar/icon 上的 overlay。HeroUI v3 明确选择后者，使用 `Anchor + Root + Label`（[`badge.tsx`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/src/components/badge/badge.tsx#L22-L134)），同时支持：

- `size: sm | md | lg`；
- `color: default | accent | danger | success | warning`；
- `variant: primary | secondary | soft`；
- `placement: top-left | top-right | bottom-left | bottom-right`。

见固定 [`badge.styles.ts`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/styles/src/components/badge/badge.styles.ts)。在确定 LearnUI Badge 的含义前，不能把 placement 或 `Anchor` 直接写成共享合同。

## 7. Divider

React Aria 中对应名称是 [`Separator`](https://react-aria.adobe.com/Separator)，不是 Divider。它适合单 root，无 controlled state、validation、keyboard 或 focus。

默认 element 是 `<hr>`，横向时依靠原生 implicit `role=separator`；vertical `<hr>` 会改成 `<div>`，`useSeparator` 添加 `role="separator"` 与 `aria-orientation="vertical"`（[`Separator.tsx`](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components/src/Separator.tsx#L23-L105)、[`useSeparator`](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria/src/separator/useSeparator.ts#L20-L64)）。Web extension 包括 `orientation`、`elementType`、DOM `render` override、ARIA labeling 和 HTML attributes。

HeroUI v3 也是单 root RAC wrapper（[`separator.tsx`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/src/components/separator/separator.tsx#L12-L42)），提供 `orientation: horizontal | vertical` 与 `variant: default | secondary | tertiary`（[`separator.styles.ts`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/styles/src/components/separator/separator.styles.ts)）。LearnUI 可以继续使用产品名 Divider，但 Web 实现应映射到 Separator primitive。

## 8. Spinner

React Aria Components 没有名为 `Spinner` 的 export。官方在 [`ProgressBar` 的 ProgressCircle 示例](https://react-aria.adobe.com/ProgressBar#progresscircle) 中用 SVG + `ProgressBar isIndeterminate` 构建 spinner。`ProgressBar` 提供 `value/minValue/maxValue/valueLabel/formatOptions/isIndeterminate`；render props 是 `percentage`、`valueText`、`isIndeterminate`（[`ProgressBar.tsx`](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components/src/ProgressBar.tsx#L31-L119)）。

无障碍行为是 `role="progressbar"`；indeterminate 时省略 `aria-valuenow` 与 `aria-valuetext`，但仍需可访问 label（[`useProgressBar`](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria/src/progress/useProgressBar.ts#L70-L119)）。Button pending 文档进一步要求 spinner/progress indicator 在 accessibility tree 中及时存在。

HeroUI v3 没有使用 RAC ProgressBar，而是纯 DOM/SVG 单 root，默认 `aria-label="Loading" role="status"`（[`spinner.tsx`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/src/components/spinner/spinner.tsx#L62-L103)），size 为 `sm | md | lg | xl`，color 为 `accent | current | danger | success | warning`（[`spinner.styles.ts`](https://github.com/heroui-inc/heroui/blob/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/styles/src/components/spinner/spinner.styles.ts)）。

`progressbar` 与 `status` 是两种不同语义，不能简单照抄上游之一。另需区分：

1. **表达未知时长任务进度**：indeterminate ProgressBar 能提供已定义的 progressbar 语义；
2. **表达状态消息**：status/live region 可能宣告状态文本；
3. **纯装饰 spinner**：若相邻文案或父组件已经提供 loading 语义，应避免重复宣告，并把 SVG `aria-hidden`。

视觉 motion 必须满足仓库 reduced-motion 约束；这是 Web CSS/animation extension，不应进入共享受控状态 API。

## 跨组件 vocabulary：哪些可以共享，哪些不能先假定

### 可进入跨平台讨论的稳定意图

- `size`: HeroUI 反复使用 `sm | md | lg`，适用于 Button、Switch、Badge、Spinner；但 TextField 与 Checkbox 当前没有 size，Spinner 额外 `xl`。因此它是**按组件选用的共同枚举**，不是八组件强制 prop。
- `color`: `accent | danger | success | warning` 在 Badge/Spinner 有复用价值；`current` 是 Web CSS `currentColor` 倾向，未证明可共享；DESIGN 的正式语义使用 `destructive` 而 HeroUI 使用 `danger`，命名需决策。
- `variant`: 应表达组件视觉层级，不宜强造一个全局 enum。HeroUI 对不同组件使用 button intent、surface layer、soft/outline 等不同集合。
- state：上游的 `isDisabled`、`isReadOnly`、`isRequired`、`isInvalid`、`isSelected`、`isIndeterminate`、`isPending` 语义清晰；hovered/pressed/focused/focus-visible 属于 Web render state，其中 hover 与 focus-visible 不应假装 Native 完全对称。
- orientation：Divider 的 `horizontal | vertical` 是明确可共享的布局意图。

### 仅 Web 或应作为 platform extension

- 函数型 `children`、`className`、`style` render props；`data-*` state selectors；RAC `slot`/context；DOM `render` override；具体 HTML element polymorphism；
- `onPress*` 的 Web `PressEvent`、hover、focus-visible、key handlers；
- HTML forms：`name`、`value`、`form`、Button `type/form*`、native constraint validation；
- TextField 的 input/textarea attributes、IME/composition、clipboard、browser autofill；
- Checkbox/Switch 的 `inputRef` 与 visually hidden native input；
- Divider 的 `<hr>` / `aria-orientation` 映射；
- Spinner 的 CSS/SVG animation 与 browser reduced-motion handling。

## 最重要的未决风险

1. **RAC API 正在迁移。** `1.20.0` 的 Checkbox/Switch 已从单 root 转向 Field/Button compound；若 LearnUI 包装旧单 root，会在第一版就绑定 deprecated surface。
2. **Spinner 语义不是视觉问题。** RAC 的 indeterminate `progressbar` 与 HeroUI 的 `status` 不等价；还要避免与 Button pending 文案重复宣告。
3. **Badge 定义不清。** standalone status label 与 anchored overlay 会导向完全不同的 parts、placement 和 ARIA 责任；HeroUI 只能证明后一种可行。
4. **不要追求伪统一。** TextField/Checkbox 没有来自 HeroUI 的 size，Switch 没有视觉 variant；给所有组件统一加 `size/variant/color` 会扩大未被证据支持的合同。
5. **part 名需要跨平台协调。** RAC 使用 `Field/Button/FieldError`，HeroUI 使用 `Root/Content/Control/Indicator`，仓库示例偏向 `Root/Label/Control/Description/ErrorMessage`；Web 能力无法单独决定最终公开命名。
6. **展示组件不能自动变成交互组件。** Card/Badge 无 behavior primitive；若未来加入 press/selection，必须组合正确的 Button/Link/collection semantics，而不是只加 click handler、tabIndex 或 role。
7. **validation default 容易误读。** React Aria hooks 多数默认 `aria`，但 React Aria Components Field wrappers 在本快照默认 `native`。对外文档和测试必须以实际 wrapper 为准。

## 官方来源索引

所有来源访问于 2026-08-23：

- [React Aria Components 官方文档](https://react-aria.adobe.com/)
- [React Aria Components `1.20.0` 固定源码](https://github.com/adobe/react-spectrum/tree/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria-components)
- [React Aria hooks 固定源码](https://github.com/adobe/react-spectrum/tree/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria/src)
- [官方 starter：Button pending 组合](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/starters/docs/src/Button.tsx)
- [官方 starter：TextField compound wrapper](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/starters/docs/src/TextField.tsx)
- [官方 starter：Checkbox Field/Button wrapper](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/starters/docs/src/Checkbox.tsx)
- [官方 starter：Switch Field/Button wrapper](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/starters/docs/src/Switch.tsx)
- [官方 starter：ProgressCircle/Spinner pattern](https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/starters/docs/src/ProgressCircle.tsx)
- [HeroUI v3 React 固定源码](https://github.com/heroui-inc/heroui/tree/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/react/src/components)
- [HeroUI v3 styles 固定源码](https://github.com/heroui-inc/heroui/tree/1d2164e7b9a60221e39501081f0fe4f6c564bccf/packages/styles/src/components)

## 时效性与未验证范围

“当前”仅指上述版本与 commit。本文核验了 Context7 当前索引、官方文档、TypeScript 源码和官方 starter/HeroUI 源码；未安装 npm tarball、未运行 browser tests，也未做视觉或 screen-reader 实测。实现前应固定实际依赖版本，并用 keyboard、browser form validation、screen reader 与 reduced-motion stories/fixtures 验收。
