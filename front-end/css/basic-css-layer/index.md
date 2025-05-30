---
title: Layer 级联层
---
## 前言

在日常前端开发中，我们的页面往往会涉及到**多来源样式的混用**，包括：

+ 多个组件库、UI 框架所提供的默认样式；

+ 项目中根据实际场景定义的业务样式；

随着项目结构复杂度的增加，**样式的优先级关系开始变得难以理清**，样式冲突和覆盖问题频繁发生。

当我们试图**覆盖非自身编写的样式**时，常常不得不借助更具体的选择器，或者堆叠更高的权重——这无疑加重了样式维护的负担。而更糟糕的是，在优先级实在无法压制目标样式时，许多开发者会直接使用 `!important` 来“强行覆盖”，从而引发**一连串优先级斗争的连锁反应**。

最终结果是：样式体系变得越来越混乱、难以维护，维护人员战战兢兢，每次改样式都像“拆炸弹”。

为了解决这一痛点，让 CSS 样式具备更可控、结构化的优先级管理方式，**CSS `@layer`（级联层 Cascade Layers）应运而生**。它为我们提供了一个全新的样式组织维度，从根本上缓解了样式优先级混乱的问题，也让样式架构更易规划、更可预期。

## 什么是级联层

级联层在 [CSS Cascading and Inheritance Level 5](https://www.w3.org/TR/css-cascade-5/#layering) 中被定义，如下：

> In the same way that [cascade origins](https://www.w3.org/TR/css-cascade-5/#origin) provide a balance of power between user and author styles, cascade layers provide a structured way to organize and balance concerns within a single origin. Rules within a single [cascade layer](https://www.w3.org/TR/css-cascade-5/#cascade-layers) cascade together, without interleaving with style rules outside the layer.
>
> Authors can create layers to represent element defaults, third-party libraries, themes, components, overrides, and other styling concerns—and are able to re-order the cascade of layers in an explicit way, without altering selectors or specificity within each layer, or relying on source-order to resolve conflicts across layers.

就像[层叠来源](https://www.w3.org/TR/css-cascade-5/#origin)在用户样式和开发者样式之间提供了一种权力平衡一样，级联层提供了一种结构化的方式，用于在单个来源内组织和平衡各种样式考量。单个级联层内的规则级联在一起，不与该层之外的样式规则交织。

开发者可以创建层来表示元素默认值、第三方库、主题、组件、覆盖样式以及其他样式考量，并且能够以一种明确的方式重新排列层叠层的顺序，而无需更改每个层内的选择器或特异性，也无需依赖源顺序来解决层与层之间的冲突。

简单来说，你可以把 `@layer` 想象成 CSS 的“图层系统”，就像在 Photoshop 或 Figma 里一样：

- 每个 `@layer` 是一个**图层**
- 层级顺序决定了**谁覆盖谁**
- **先定义的图层优先级低，后定义的图层优先级高**
- 同一层内部再根据常规规则（选择器权重、顺序、`!important`）来决定样式生效

## 使用级联层

语法也非常简单，看这样一个例子：

```css
@layer utilities {
  /* 创建一个名为 utilities 的级联层 */
}
```

这样，我们就创建一个名为 utilities 的 `@layer`级联层。

### 三种定义与引入方式

#### **1. 内联声明样式**

这是最直观的方式，直接用 `@layer` 创建一个命名图层，并书写对应的样式：

```css
@layer base {
  h1, h2, h3 {
    font-weight: bold;
  }
}
```

#### **2. 导入时指定层（配合 `@import`）**

你可以在 `@import` 时将某个外部样式文件指定为某个 `@layer`，非常适用于引入组件库样式时统一分组管理。

```css
@import url("reset.css") layer(reset);
@import url("library.css") layer(components);
@import url("theme.css") layer(themes);
```

这样即使你没有手动写 `@layer` 包裹这些文件，它们也会被自动归到指定层中。

#### **3. 无样式体的声明：控制层级顺序**

这种方式可以延后补充其中的样式规则，并告诉浏览器有哪些层，以及它们的优先级顺序，越靠后的层优先级越高。

```css
@layer reset, base, components, overrides;
// ...
@layer reset {

}
```

### 匿名层与嵌套层

#### **匿名层**

如果你在样式中使用 `@layer`，但**没有命名**，则该样式会被分配到一个匿名层中。

```css
@layer {
  p {
    color: gray;
  }
}
```

匿名层的**创建后无法向其再添加规则**，更适合放置“通用样式”或“非关键样式”。由于匿名层没有名称，所以没办法像 `@layer a, b, c;` 显式排序层，按原有的声明次序排列优先级，且其优先级始终是低于重排序的命名层的。

#### **嵌套层**

`@layer` 可以嵌套使用，就像模块里的模块，可以进一步细分结构：

```css
@layer components {
  @layer buttons {
    .btn {
      padding: 1rem;
    }
  }

  @layer cards {
    .card {
      box-shadow: 0 0 10px #ccc;
    }
  }
}
```

### 多层嵌套层的优先级规则

级联层的优先级由以下因素组成（从高到低）：

1. **外层声明顺序（最关键）**：先声明的层优先级低，后声明的层优先级高。
2. **嵌套层按出现顺序计算优先级**：嵌套结构中，子层也参与排序，但其优先级被限定在父层内。
3. **选择器权重**：仅在同一层内部起作用。
4. **样式位置顺序**：在同一层 & 相同权重下生效。
5. **`!important`**：依然是最终“终极武器”，能覆盖非 `!important` 的任何样式。

例如，这样的情况：

```CSS
div {
    width: 200px;
    height: 200px;
}
@layer A {
    div {
        background: blue;
    }
    @layer B {
        div {
            background: red;
        }
    }
}
@layer C {
    div {
        background: yellow;
    }
    @layer D {
        div {
            background: green;
        }
    }
}
```

优先级的排序是：`@layer C > @layer C.D > @layer A > @layer A.B`，所以最终 div 的颜色是🟡的。

大杀器 **`!important`** 凌驾于所以非 **`!important`**规则之上，例如我们可以给 `@layer A.B` 来个“逆天改命”，div 直接变成🔴：

```css
@layer B {
    div {
        background: red!important;
    }
}
```

还有更有意思的事情，如果级联层内有多个 `!important` 内，如：

```css
@layer A {
    div {
        background: blue!important;
    }
    @layer B {
        div {
            background: red!important;
        }
    }
}
@layer C {
    div {
        background: yellow!important;
    }
    @layer D {
        div {
            background: green!important;
        }
    }
}
```

实际证明，div 是红色，这是一个非常重要的特性：

1. 在比较正常（非 `!important`）规则时，越是级联靠后的（排序较后的 `@layer`，优先级越低的规则），优先级越低；
2. 反之，在比较 `!important` 规则时，越是级联靠后的（排序较后的 `@layer` ，优先级越低的规则），优先级越高；

