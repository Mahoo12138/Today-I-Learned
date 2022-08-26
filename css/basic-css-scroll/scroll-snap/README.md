根据 [CSS Scroll Snap Module Level 1](https://www.w3.org/TR/css-scroll-snap-1/) 规范，CSS 新增了一批能够控制滚动的属性，让滚动能够在仅仅通过 CSS 的控制下，得到许多原本需要 JS 脚本介入才能实现的美好交互。

## sroll-snap-type

首先看看 `sroll-snap-type` 可能算得上是新的滚动规范里面最核心的一个属性样式。

**[scroll-snap-type](https://developer.mozilla.org/zh-CN/docs/Web/CSS/scroll-snap-type)**：属性定义在滚动容器中的一个临时点（snap point）如何被严格的执行。

简单而言，这个属性规定了一个容器是否**对内部滚动动作进行捕捉**，并且规定了如何去处理滚动结束状态。

### 语法

```css
{
    scroll-snap-type: none | [ x | y | block | inline | both ] [ mandatory | proximity ]?
}
```

举个例子，假设，我们希望一个横向可滚动容器，每次滚动之后，子元素最终的停留位置不是尴尬的被分割，而是完整的呈现在容器内，可以这样写：

```html
<div class="container">
  <div class="child"></div>
  <div class="child"></div>
  <div class="child"></div>
</div>
```

```css
.container {
  scroll-snap-type: x mandatory;
}

.child {
  scroll-snap-align: start;
}
```

上面 `scroll-snap-type: y mandatory` 中:

+ `y` 表示捕捉 y 轴方向上的滚动；
+ `mandatory` 表示强制将滚动结束后元素的停留位置设置到我们规定的地方。

### mandatory 与 proximity

- `mandatory`： 通常在 CSS 代码中我们都会使用这个，mandatory 的英文意思是**强制性的**，表示滚动结束后，滚动停止点一定会强制停在我们指定的地方；
- `proximity`： 意思是**接近、临近、大约**，在这个属性中的意思是滚动结束后，滚动停止点可能就是滚动停止的地方，也可能会再进行额外移动，停在我们指定的地方；

### both mandatory

当然，还有一种比较特殊的情况是，`scroll-snap-type: both mandatory`，表示横向与竖向的滚动，都会同时进行捕捉，也是可以的；

## scroll-snap-align

使用 `scroll-snap-align` 可以简单的控制将要聚焦的当前滚动子元素在滚动方向上相对于父容器的对齐方式。

其需要作用在父元素上，可选值有三个：

```css
{
    scroll-snap-align: start | center | end;
}
```

如果子元素大小不一，也能有非常好的表现，使用 `scroll-snap-align: center`，使得不规则子元素在每次滚动后居于容器中间；

## scroll-margin / scroll-padding

上述的 `scroll-snap-align` 很好用，可以控制滚动子元素与父容器的对齐方式。然而可选的值只有三个，有的时候我们希望进行一些更精细的控制时，可以使用 `scroll-margin` 或者 `scroll-padding`

其中：

- scroll-padding 是作用于滚动父容器，类似于盒子的 padding
- scroll-margin 是作用于滚动子元素，每个子元素的 scroll-margin 可以设置为不一样的值，类似于盒子的 margin

## 废弃的 scroll-snap-points-x / scroll-snap-points-y

标准的发展过程，早年间的规范如今废除，这个了解一下即可，新标准现在是这几个，并且大部分浏览器已经兼容：

- scroll-snap-type
- scroll-snap-align
- scroll-margin / scroll-padding
- ~~scroll-snap-stop~~

## scroll-snap-stop 

默认情况下，scroll snapping 只在用户滚动停止时才生效，这意味着可以一直滚动，而跳过一些停靠点（snap point）；

而通过在某些子元素上设置 `scroll-snap-stop: always` 可保证容器滚到该子元素时，总是触发 scroll snapping 效果；

目前还没有主流的浏览器支持该属性，尽管在 Chrome 上有一个[tracking bug](https://bugs.chromium.org/p/chromium/issues/detail?id=823998) ；

