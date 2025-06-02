---
title: at-rules (@) 规则
---
## 概述

**At 规则**是一个 CSS 语句，用来指示 CSS 如何运行。以 at 符号开头，'@'（U+0040 COMMERCIAL AT），后跟一个标识符，并包括直到下一个分号的所有内容，';'（U+003B SEMICOLON），或下一个 CSS 块，以先到者为准。

## 常见规则

| 规则               | 用途简述                               |
| ------------------ | -------------------------------------- |
| `@import`          | 导入外部 CSS 文件                      |
| `@font-face`       | 自定义字体加载                         |
| `@keyframes`       | 定义 CSS 动画关键帧                    |
| `@namespace`       | 用于 XML 中定义命名空间（很少见）      |
| `@page`            | 用于设置打印页面的样式                 |
| ``@counter-style`` | 定义不属于预定义样式集的特定计数器样式 |
### @charset

指定样式表中使用的字符编码，如 UTF-8、ISO-8859-1 等。它必须是样式表中的第一个元素，而前面不得有任何字符，且必须是双引号，不能用单引号；有多个 `@charset` 规则被声明，只有第一个会生效。 

```css
@charset "UTF-8";
```

该规则主要针对 CSS 文件中的非 ASCII 文本，例如**字体名称**，伪元素的 **content** 属性值、选择器等中的非 ASCII 字符（中文和 emoji 等），确保 CSS 解析器知道如何转换字节正确转换为字符，以便它理解 CSS 代码。

### @import

用于从其他样式表导入样式规则，这些规则必须先于所有其他类型的规则，`@charset` 规则除外。

`@import` 有两种语法：

1. url() 内包含 style sheet 的 URI
2. 直接写 style sheet 的 URI 的字符串

还可以直接在后面定义媒体查询规则，像是这样：

```css
@import 'custom.css';
@import url('landscape.css');
@import url('landscape.css') screen and (orientation:landscape);
```
#### 页面性能

由于 `@import` 的加载方式是**串行的、阻塞的**，在一个 css 文件中，会阻塞当前 CSS 文件的解析流程，等所有 `@import` 文件加载完再继续解析当前文件后续的样式；

而且浏览器的渲染机制是“渐进式”的，不会等待把所有 @import 都加载完才渲染首屏，它是“边下载边渲染边修正”，每次有新 CSS 到达，就触发 **重新计算样式 + 重新渲染**，所以有同一个元素，多个样式来源，不在同一解析上下文中，且带有 `@import` 文件时，则会产生 [[fouc|FOUC]]。

### @keyframes



### @font-face



### @namespace

用来定义使用在 CSS 样式表中的 XML 或 SVG 等非 HTML 命名空间（上下文）的 @ 规则。定义的命名空间可以把通配、元素和属性选择器限制在指定命名空间里的元素。

并且，任何 `@namespace` 规则都必须在所有的 `@charset` 和 `@import`规则之后，并且在样式表中，位于其他任何样式声明之前。

#### 解决了什么问题

SVG 与 HTML、XML 和 HTML 共享一些常见元素（例如`<a>`）和 CSS 属性。如果对 HTML 和 SVG 文档使用相同的样式表，那么最好将 SVG 和 HTML 的样式分开，以防止任何重叠。

```html
<!-- HTML -->
<a href="#">普通链接</a>

<!-- SVG -->
<svg>
  <a xlink:href="...">
    <text>SVG 链接</text>
  </a>
</svg>
```

同一个 `<a>` 标签，但：

- HTML 中 `<a>` 是超链接
- SVG 中 `<a>` 是图形元素的链接容器，完全不同

如果你在 CSS 里写：

```css
a {
  color: red;
  text-decoration: underline;
}
```

这个规则会影响**两个 `<a>`**，很可能不是你想要的。

#### 语法格式

```css
@namespace prefix "namespace-url";
```

- `prefix` 是自定义的命名空间前缀
- `namespace-url` 是 XML 中定义的实际命名空间 URI

你也可以不指定前缀，那它就成为默认命名空间。

#### 典型例子

```css
@namespace html "http://www.w3.org/1999/xhtml";
@namespace svg "http://www.w3.org/2000/svg";

/* 只影响 HTML 中的 <a> */
html|a {
  color: red;
  text-decoration: underline;
}

/* 只影响 SVG 中的 <a> */
svg|a {
  fill: blue;
  cursor: pointer;
}
```

#### 为什么很少用

| 原因                                   | 描述                                     |
| -------------------------------------- | ---------------------------------------- |
| HTML 不使用                            | HTML 是默认命名空间，不需要写            |
| 现代 Web 更少用 XML 命名空间文档       | 比如 XHTML、MathML、SVG 不再混用那么频繁 |
| JavaScript 更常用于动态控制 SVG 或 XML | CSS 的命名空间控制显得笨重               |
| 不支持样式作用域的增强                 | 没有像 Shadow DOM 那样实用的封装能力     |

### @counter-style

允许开发者可以自定义 counter 的样式。一个 `@counter-style` 规则定义了如何把一个计数器的值转化为字符串表示。

在 `@counter-style` 之前，CSS 还有一种实现简单计数器的规范，它由如下几个属性共同构成：

- `counter-reset`： 初始化计数器的值
- `counter-increment`：在初始化之后，计数器的值就可以使用 counter-increment 来指定其为递增或递减
- `counter()`：计数器的值可以使用 counter() 或 counters() 函数以在 CSS 伪元素的 content 属性中显示

```html
<ul>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
</ul>
<style>
ul {
  display: flex;
  justify-content: space-around;
  counter-reset: stepCount;
}
li {
  position: relative;
}
li::before {
  position: absolute;
  counter-increment: stepCount 1;
  content: counter(stepCount); 
}
</style>
```

解释一下：

1. 在 `ul` 的样式中，每次都会初始化一个 CSS 计数器 `stepCount`，默认值为 0
2. 在 `li::before` 中的 `counter-increment: stepCount 1` 表示每次调用到这里，stepCount 的值加 1
3. 最后通过 `counter(stepCount)` 将当前具体的计数值通过伪元素的 content 显现出来

这一套规则比较局限，更多的是生成的数字类型的计数器。`@counter-style` 规则用一种开放的方式弥补了这一缺点，在预定义的样式不能满足需求时，它可以更灵活地自定义计数器。

使用 MDN 上的例子作为示例：

```html
<ul>
    <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. </li>
    <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. </li>
    <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. </li>
    <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. </li>
</ul>

<style>
@counter-style counter-emoji {
  system: fixed;
  symbols: 😀 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨;
  suffix: " ";
}
li {
   list-style: counter-emoji;
}
</style>
```

### @property

`@property` 是 CSS Houdini API 的一部分, 它允许开发者显式地定义他们的 CSS 自定义属性，允许进行属性类型检查、设定默认值以及定义该自定义属性是否可以被继承。

正常而言，我们定义和使用一个 CSS 自定义属性的方法是这样的：

```css
:root {
    --whiteColor: #fff;
}

p {
    color: (--whiteColor);
}
```

而有了 `@property` 规则之后，我们还可以像下述代码这样去定义个 CSS 自定义属性：

```html
<style>
@property --property-name {
  syntax: '<color>';
  inherits: false;
  initial-value: #fff;
}

p {
    color: var(--property-name);
}
</style>
```

### @layer

 [[front-end/css/basic-css-layer/index|@layer]] 声明了一个 级联层， 同一层内的规则将级联在一起， 这给予了开发者对层叠机制的更多控制。
## 条件规则组

CSS 中的**条件规则组**（Conditional Group Rules）是指：只有在某些条件满足时才生效的一组样式规则，常见的有：

| 规则         | 功能                                         |
| ------------ | -------------------------------------------- |
| `@media`     | 媒体条件匹配，根据屏幕尺寸、分辨率等设置样式 |
| `@supports`  | 检测浏览器是否支持特性，仅在支持时生效       |
| `@container` | 父容器尺寸判断，类似 `@media` 针对容器）     |

这些规则的特点是——它们**包裹一个规则块（ruleset block）**：

```css
@media (max-width: 600px) {
  .card {
    display: block;
  }
}
```

### @media

`@media` 是一个 **条件规则组**，用于根据**设备或环境条件**应用不同的样式。简单理解就是：**“当设备满足某个条件时，才启用这组样式”**。

#### 基本语法结构

```css
@media media-type and (condition) {
  /* CSS rules */
}

/* 在“屏幕”类型设备 且 宽度 ≤ 768px 时，启用该样式 */
@media screen and (max-width: 768px) {
  body {
    background: lightblue;
  }
}
```

#### 媒体类型

| 类型     | 描述                         |
| -------- | ---------------------------- |
| `all`    | 默认值，所有设备都适用       |
| `screen` | 屏幕显示设备，如手机、显示器 |
| `print`  | 打印预览和打印纸张设备       |
| `speech` | 屏幕阅读器等语音设备         |

#### 媒体特性

配合 `@media` 使用的“条件”部分，例如设备宽度、方向、分辨率等。

#### 常用媒体特性

| 特性                           | 示例                                   | 描述                   |
| ------------------------------ | -------------------------------------- | ---------------------- |
| `width` / `height`             | `(max-width: 600px)`                   | 视口宽度/高度          |
| `orientation`                  | `(orientation: portrait)`              | 是否为竖屏             |
| `aspect-ratio`                 | `(aspect-ratio: 16/9)`                 | 屏幕宽高比             |
| `resolution`                   | `(min-resolution: 2dppx)`              | 屏幕像素密度（高清屏） |
| `hover`                        | `(hover: none)`                        | 是否支持鼠标 hover     |
| `pointer`                      | `(pointer: coarse)`                    | 指针精度（粗/细）      |
| `prefers-color-scheme`         | `(prefers-color-scheme: dark | light)` | 深色模式               |
| `prefers-reduced-motion`       | `(prefers-reduced-motion: reduce)`     | 减弱动画效果           |
| `prefers-contrast`             | `(prefers-contrast: more | less)`      | 调整内容色彩对比度     |
| `prefers-reduced-transparency` | `(prefers-contrast: reduce)`           | 减少透明元素           |
| `prefers-reduced-data`         | `(prefers-reduced-data: reduce)`       | 减少数据传输           |

#### 组合语法

```css
/* and：两个条件同时满足 */
@media screen and (min-width: 600px) and (orientation: landscape) {
  ...
}

/* or：多个条件满足其一（用逗号） */
@media screen and (max-width: 500px), (hover: none) {
  ...
}

/* not：逻辑取反 */
@media not screen {
  ...
}
```

### @supports

CSS 中的**特性检测语法**，允许**判断浏览器是否支持某项 CSS 属性或值**，然后再有条件地应用样式，类似于 JavaScript 中的 `if ("CSSProperty" in element.style)`。

#### 基本语法

```css
@supports (property: value) {
  /* 只有在支持这个属性时才执行这里的样式 */
}

div {
    position: fixed;
}

@supports (position:sticky) {
    div {
        position:sticky;
    }
}
```

#### 逻辑组合语法

| 操作符   | 示例                                 | 含义               |
| -------- | ------------------------------------ | ------------------ |
| `and`    | `(display: grid) and (gap: 10px)`    | 同时满足两个条件   |
| `or`     | `(display: grid) or (display: flex)` | 任意一个满足即可   |
| `not`    | `not (display: grid)`                | 不支持这个时执行   |
| 括号组合 | `((a) and (b)) or (c)`               | 复杂条件时分组使用 |

```css
.container {
  translate: 50% 10%;
  rotate: 80deg;
  scale: 1.5;
}

/* 如果不支持上述的语法，则 supports 内的语法生效 */
@supports not (scale: 1) {
  .container {
    transform: translate(50%, 10%) rotate(80deg) scale(1.5);
  }
}
```

### @container

`@container` 是 CSS 中用来 **根据父容器尺寸变化动态调整样式** 的规则。它和 `@media` 类似，但不是根据“视口大小”响应，而是根据“容器（元素）的大小”来响应。

#### 基础语法

```css
@container (min-width: 600px) {
  .selector {
    /* 样式 */
  }
}
```

但前提是：**父元素必须声明容器角色**：

```css
.container {
  container-type: inline-size;
}
```

| 属性                          | 含义                              |
| ----------------------------- | --------------------------------- |
| `container-type: inline-size` | 开启宽度监听（最常用）            |
| `container-type: size`        | 同时监听宽度 + 高度（性能开销大） |
| `container-name: name`        | 给容器命名，供多容器选择使用      |

#### 容器查询条件

| 条件           | 示例                             |
| -------------- | -------------------------------- |
| `width`        | `(min-width: 400px)`             |
| `height`       | `(max-height: 300px)`            |
| `aspect-ratio` | `(aspect-ratio: 1/1)`            |
| `inline-size`  | 等价于 width，用得最多           |
| `style()`      | 检查父元素的自定义样式（新特性） |

## 嵌套

嵌套 at 规则，是嵌套语句的子集，除了选择器规则可以嵌套外，条件规则组也能进行嵌套。

```css
@supports (display: grid) {
  @media (max-width: 800px) {
    .wrapper {
      display: grid;

      .item {
        grid-column: span 2;
      }
    }
  }
}
```