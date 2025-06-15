---
title: Margin 塌陷
---
## 什么是 Margin 塌陷

当两个垂直方向的块级元素之间的 margin 相遇时，它们不会相加，而是会“塌陷”为其中较大的那个。

### 三种塌陷情况

**1. 相邻兄弟元素之间的 margin 塌陷**

```html
<div>
  <p style="margin-bottom: 20px;"></p>
  <p style="margin-top: 30px;"></p>
</div>
```

实际效果是两个段落之间的间距是 `30px` 而不是 `20 + 30 = 50px`

**2. 父子元素之间的 margin 塌陷**

```html
<div style="margin-top: 0;">
  <p style="margin-top: 20px;"></p>
</div>
```

如果 `div` 没有 padding 或 border 分隔，它和 `p` 的 margin 会塌陷，如上，表现为 `div` 顶部也出现了 `20px` 的空隙。

**3. 空的块级元素的上下 margin 塌陷**

```html
<div style="margin-top: 30px; margin-bottom: 30px;"></div>
```

如果 div 是空的且没有 border 、padding，则上下 margin 会塌陷，如上，表现为 div 为一个 30px 的间距。

## 如何解决 Margin 塌陷

**1. 使用 Padding 或 Border 分隔**

```css
.parent {
  padding-top: 1px; /* 可用 padding 阻止塌陷 */
}
```

只要父元素在 margin 方向上有非零的 padding 或 border，就能阻止 margin 塌陷。

**2. 添加空的块级元素（hack）**

```css
.clearfix {
  content: '';
  display: table;
  clear: both;
}
```

**3. 设置 `overflow` 触发 BFC（推荐方法）**

```css
.parent {
  overflow: hidden;
}
```



## 什么是 BFC

**BFC （Block Formatting Context）**是一种布局机制，决定了块级盒子的布局规则。它是 Web 中解决很多布局问题（如浮动环绕、margin 塌陷等）的关键概念。

- 同一个 BFC 下的元素垂直方向的 margin 会发生塌陷
- 不同 BFC 之间的 margin 不会塌陷
- BFC 区域不会与浮动元素重叠
- BFC 是一个独立的布局上下文



## 如何触发 BFC

触发 BFC 的常见方式有：

| CSS 属性              | 示例值                               |
| --------------------- | ------------------------------------ |
| `overflow`            | `hidden`, `auto`                     |
| `display`             | `inline-block`, `table`, `flow-root` |
| `float`               | `left`, `right`                      |
| `position`            | `absolute`, `fixed`                  |
| `contain`（现代方案） | `layout`, `strict`                   |
