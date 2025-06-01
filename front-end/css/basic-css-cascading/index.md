---
title: Cascading 层叠/级联
---
## 什么是级联（Cascading）

**Cascading（级联）** 是指当一个元素同时受到多个样式规则（Cascading Origins）影响时，**浏览器决定哪一个样式最终生效**的过程。

你可以把它想象成一场**样式大战**：多个 CSS 规则都想“控制”一个元素的某个属性（如 `color`），浏览器会根据一定规则来选择“胜者”。

## 级联起源（Cascading Origins）

+ `Author Origin`：网页的作者可以定义文档的样式，这是最常见的样式表。大多数情况下此类型样式表会定义多个，它们构成网站的视觉和体验，即页面主题，可以理解为**页面作者样式**。
+ `User Origin`：作为浏览器的使用者，可以使用自定义样式表定制使用体验，可以理解为**用户样式**。
- `User-Agent Origin`：浏览器会有一个基本的样式表来给任何网页设置默认样式。这些样式统称**用户代理样式**；
- `Animation Origin`：指使用  `@Keyframes` 规则定义状态间的动画，动画序列中定义关键帧的样式来控制 CSS 动画序列。
- `Transition Origin`：过渡，类似于动画。

## 级联顺序（Cascade Sorting Order）

根据 CSS Cascading 4 最新标准 [CSS Cascading 4(Current Work)](https://drafts.csswg.org/css-cascade-4/#cascading)，定义的当前规范下申明的层叠顺序优先级如下（越往下的优先级越高）：

- Normal user agent declarations
- Normal user declarations
- Normal author declarations
- Animation declarations
- Important author declarations
- Important user declarations
- Important user agent declarations
- Transition declarations

按照上述算法，大概是这样：

过渡动画过程中每一帧的样式 > 用户代理、用户、页面作者设置的`!important`样式 > 动画过程中每一帧的样式优先级 > 页面作者、用户、用户代理普通样式。

