### 数量级对背景图形的影响

什么是**数量级对背景图形**呢？我们来看这样一种有意思的现象：

我们使用 `repeating-conic-gradient` 多重角向渐变实现一个图形，代码非常的简单：

```HTML
<div></div>
```

```css
div {
    width: 100vw;
    height: 100vh;
    background: repeating-conic-gradient(#fff, #000, #fff 30deg);
}
```

然后，我们用一个非常小的值去替换上述代码中的 `30deg`，不可思议，出现了一个很特别的图像。这里 `0.1deg` 非常关键，这里的角度越小（小于 1deg 为佳），图形越酷炫，也就是我们说的**数量级对背景图形的影响**。

### 借助 CSS [@Property](https://github.com/Property) 观察变化过程

如果我们编写如下的过度代码，是无法得到补间过渡动画的，只有逐帧过渡动画：

```css
div{
    background: repeating-conic-gradient(#fff, #000, #fff 0.1deg);
    transition: background 1s;
}

div:hover {
    background: repeating-conic-gradient(#fff, #000, #fff 30deg);
}
```

原因在于 **CSS 不支持对这种复杂的渐变进行直接的过渡动画**；

运用  CSS @property 自定义属性，可观察一下它们两种状态变化的过程：

```css
@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0.1deg;
}
div{
    background: repeating-conic-gradient(#fff, #000, #fff var(--angle));
    transition: --angle 2s;
}
html:hover {
    --angle: 30deg;
}
```

通过 `CSS @property` 实现的补间过渡动画，看到从 `30deg` 到 `0.1deg` 的变化过程，我们大致可以看出小单位 `0.1deg` 是如何去影响图形的；

### 多重径向渐变 & 多重角向渐变

利用上述的一些小技巧，我们利用多重径向渐变(repeating-radial-gradient)、多重角向渐变(repeating-conic-gradient)就可以生成一些非常有意思的背景图片：

```css
.demo {
    width: 30vw;
    height: 30vh;
    background-image: repeating-radial-gradient(
        circle at center center,
        rgb(241, 43, 239),
        rgb(239, 246, 244) 3px
    );
}
```

### 最小可以小到什么程度？

以下述代码为例子，其中的单次绘制图形的终止点 `1px`，也就是本文的重点，它究竟可以小到什么程度呢？

```css
:root {
    --length: 1px
}
{
    background-image: repeating-radial-gradient(
        circle at 17% 32%,
        rgb(4, 4, 0),
        rgb(52, 72, 197),
        rgb(115, 252, 224),
        rgb(116, 71, 5),
        rgb(223, 46, 169),
        rgb(0, 160, 56),
        rgb(234, 255, 0) var(--length)
    );
}
```

在 `0.001px` 到 `0.0001px` 这个区间段，基本上图形已经退化为粒子图形，见不到径向渐变的轮廓了，而到了 `0.00001px` 这个级别，居然退化为了一张纯色图片！

### 使用 repeating-radial-gradient 实现电视雪花噪声动画

在上述 DEMO 中，我们发现，当在 `0.001px` 到 `0.0001px` 这个区间段，`repeating-radial-gradient` 基本退化为了粒子图形：

```css
@property --snow-length {
  syntax: '<length>';
  inherits: false;
  initial-value: 0.0085px;
}
.demo {
    background-image: repeating-radial-gradient(
        circle at 17% 32%,
        rgb(4, 4, 0),
        rgb(52, 72, 197),
        rgb(115, 252, 224),
        rgb(116, 71, 5),
        rgb(223, 46, 169),
        rgb(0, 160, 56),
        rgb(234, 255, 0) var(--snow-length)
    );
    animation: change 1s infinite alternate;
}
@keyframes change {
    100% {
      --snow-length: 0.009px;
    }
}
```
