## 单侧投影

关于 `box-shadow`，大部分时候，我们使用它都是用来生成一个两侧的投影，或者一个四侧的投影。如果要生成一个单侧的投影呢？

我们来看看 box-shadow 的用法定义：

```
{
    box-shadow: none | [inset? && [ <offset-x> <offset-y> <blur-radius>? <spread-radius>? <color>? ] ]#
}
```

以 `box-shadow: 1px 2px 3px 4px #333` 为例，4 个数值的含义分别是，x 方向偏移值、y 方向偏移值 、模糊半径、扩张半径。

这里有一个小技巧，**扩张半径可以为负值**。

继续，如果阴影的模糊半径，与**负的**扩张半径一致，那么我们将看不到任何阴影，**因为生成的阴影将被包含在原来的元素之下**，除非给它设定一个方向的偏移量。

所以这个时候，我们给定一个方向的偏移值，即可实现单侧投影：

```css
box-shadow: -7px 0 5px -5px #333;	/* 左 */

box-shadow: 7px 0 5px -5px #333;	/* 右 */

box-shadow: 0 -7px 5px -5px #333;	/* 上 */
	
box-shadow: 0 7px 5px -5px #333;	/* 下 */
```

## 使用 scale(-1) 实现翻转

要实现一个元素的 180° 翻转，我们会使用 `transform: rotate(180deg)`，这里有个小技巧，使用 `transform: scale(-1)` 可以达到同样的效果：

```css
<p class="scale">CSS Nagative Scale(-1)</p>

.scale {
    transform: scale(1);
    animation: scale 10s infinite linear;
}

@keyframes scale{
    50% {
        transform: scale(-1);
    }  
    100% {
        transform: scale(-1);
    }
}
```

## 使用负 letter-spacing 倒序排列文字

与上面 scale(-1) 有异曲同工之妙的是负的 `letter-spacing`。

`letter-spacing` 属性明确了文字的间距行为，通常而言，除了关键字 `normal`，我们还可以指定一个大小，表示文字的间距。像这样：

```css
<p class="letter_spacing">倒序排列文字</p>

.letter_spacing {
    font-size: 36px;
    letter-spacing: 0px;
    animation: move 10s infinite;
}

@keyframes move {
    40% {
        letter-spacing: 36px;
    }
    80% {
        letter-spacing: -72px;
    }
    100% {
        letter-spacing: -72px;
    }
}
```

## transition-delay 及 animation-delay 的负值使用，立刻开始动画

我们知道，CSS 动画及过渡提供了一个 delay 属性，可以延迟动画的进行；

简单的代码大概是这样：

```css
<div class="g-container">
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
</div>
.item {
    transform: rotate(0) translate(-80px, 0) ;
}

.item:nth-child(1) {
    animation: rotate 3s infinite linear;
}

.item:nth-child(2) {
    animation: rotate 3s infinite 1s linear;
}

.item:nth-child(3) {
    animation: rotate 3s infinite 2s linear;
}


@keyframes rotate {
    100% {
        transform: rotate(360deg) translate(-80px, 0) ;
    }
}
```

如果，我们想去掉这个延迟，希望在一进入页面的时候，**3 个球就是同时运动的**。这个时候，只需要把正向的 animation-delay 改成负向的即可。

```css
.item:nth-child(1) {
    animation: rotate 3s infinite linear;
}

.item:nth-child(2) {
    animation: rotate 3s infinite -1s linear;
}

.item:nth-child(3) {
    animation: rotate 3s infinite -2s linear;
}
```

这里，有个小技巧，**被设置了 `animation-dealy` 为负值的动画会立刻执行，开始的位置是其动画阶段中的一个阶段**。

## 负值 margin

负值 margin 在 CSS 中算是运用的比较多的，元素的外边距可以设置为负值。

在 flexbox 布局规范还没流行之前，实现多行等高布局还是需要下一番功夫的。其中一种方法便是**使用正 padding 负 margin 相消的方法**。

例如一个左右栏的布局分布，左右两栏的内容都是不确定的，也就是高度未知。但是希望无论左侧内容较多还是右侧内容较多，两栏的高度始终保持一致；

其中一种 Hack 办法便是**使用一个很大的正 padding 和相同的负 margin 相消**的方法填充左右两栏：

```css
.g-left {
  ...
  padding-bottom: 9999px;
  margin-bottom: -9999px;
}

.g-right {
  ...
  padding-bottom: 9999px;
  margin-bottom: -9999px;
}
```

可以做到无论左右两栏高度如何变化，高度较低的那一栏都会随着另外一栏变化。

## 总结一下

另外，还有一些大家熟知的没有单独列出来的，譬如：

- 使用负 marign 实现元素的水平垂直居中
- 使用负 marign隐藏列表 li 首尾多余的边框
- 使用负 text-indent 实现文字的隐藏
- 使用负的 z-index 参与层叠上下文排序

还有一些很深奥的，譬如张鑫旭大大在今年的 CSS 大会上分享的，利用负的 opacity 在 CSS 中实现了伪条件判断，配合 CSS 自定义属性，使用纯 CSS 实现 360° 的饼图效果：

- [第五届CSS大会主题分享之CSS创意与视觉表现](https://www.zhangxinxu.com/wordpress/2019/06/cssconf-css-idea/)
