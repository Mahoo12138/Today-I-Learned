> [谈谈一些有趣的CSS题目（18）-- 使用 position:sticky 实现粘性布局 · Issue #8 · chokcoco/iCSS (github.com)](https://github.com/chokcoco/iCSS/issues/8)

## 初窥  `position:sticky`

这是一个结合了 `position:relative` 和 `position:fixed` 两种定位功能于一体的特殊定位，适用于一些特殊场景。

什么是结合两种定位功能于一体呢？

元素先按照普通文档流定位，然后相对于该元素在流中的 flow root（BFC）和 containing block（最近的块级祖先元素）定位。

而后，元素定位表现为在**跨越特定阈值前为相对定位**，**之后为固定定位**。

这个特定阈值指的是 top, right, bottom 或 left 之一，换言之，指定 top, right, bottom 或 left 四个阈值其中之一，才可使粘性定位生效。否则其行为与相对定位相同。

## `position:sticky` 示例

例如，有如下的 HTML 结构和 CSS 代码：

```html
<div class="container">
    <div class="sticky-box">内容1</div>
    <div class="sticky-box">内容2</div>
    <div class="sticky-box">内容3</div>
    <div class="sticky-box">内容4</div>
</div>
```

```css
.container {
    background: #eee;
    width: 600px;
    height: 1000px;
    margin: 100px auto;
}

.sticky-box {
    position: -webkit-sticky;
    position: sticky;
    height: 60px;
    margin-bottom: 30px;
    background: #ff7300;
    top: 80px;
}

div {
    font-size: 30px;
    text-align: center;
    color: #fff;
    line-height: 60px;
}
```

简单描述下生效过程，因为设定的阈值是 `top: 0` ，这个值表示当元素距离页面视口（**Viewport，也就是fixed定位的参照**）顶部距离大于 0px 时，元素以 relative 定位表现，而当元素距离页面视口小于 0px 时，元素表现为 fixed 定位，也就会固定在顶部。

## 生效规则

`position:sticky` 的生效是有一定的限制的，总结如下：

1. 须指定 top, right, bottom 或 left 四个阈值其中之一，才可使粘性定位生效。否则其行为与相对定位相同。
   - 并且 `top` 和 `bottom` 同时设置时，`top` 生效的优先级高，`left` 和 `right` 同时设置时，`left` 的优先级高。
2. 设定为 `position:sticky` 元素的**任意父节点的 overflow 属性必须是 visible**，否则 `position:sticky` 不会生效。这里需要解释一下：
   - 如果 `position:sticky` 元素的任意父节点设置为 `overflow: hidden`，则父容器无法进行滚动，所以 `position:sticky` 元素也不会有滚动然后固定的情况。
3. 在满足上述情况下，设定了 position: sticky 的元素的**父容器的高度必须大于当前元素**，否则也会失效。（当然，此时，sticky 吸附的基准元素就会变成父元素）

