## 基本用法

CSS 属性 `filter` 将模糊或颜色偏移等图形效果应用于元素。滤镜通常用于调整图像、背景和边框的渲染；

本文所描述的滤镜，指的是 CSS3 出来后的滤镜，不是 IE 系列时代的滤镜，语法如下：

```css
/* URL to SVG filter */
filter: url("filters.svg#filter-id");

/* <filter-function> values */
filter: blur(5px);
filter: brightness(0.4);
filter: contrast(200%);
filter: drop-shadow(16px 16px 20px blue);
filter: grayscale(50%);
filter: hue-rotate(90deg);
filter: invert(75%);
filter: opacity(25%);
filter: saturate(30%);
filter: sepia(60%);

/* Multiple filters */
filter: contrast(175%) brightness(3%);

/* Use no filter */
filter: none;

/* Global values */
filter: inherit;
filter: initial;
filter: revert;
filter: unset;

```

## `contrast/brightness` -- hover 增亮图片

通常页面上的按钮，都会有 hover/active 的颜色变化，以增强与用户的交互。但是一些图片展示，则很少有 hover 的交互，运用 `filter: contrast()` 或者 `filter: brightness()` 可以在 hover 图片的时候，调整图片的对比图或者亮度，达到聚焦用户视野的目的。

当然，这个方法同样适用于按钮，简单的 CSS 代码如下：

```css
.btn:hover,
.img:hover {
    transition: filter .3s;
    filter: brightness(1.1) contrast(110%);
}
```

## `blur` -- 生成图像阴影

通常而言，我们生成阴影的方式大多是 `box-shadow` 、`filter: drop-shadow()` 、`text-shadow` 。但是，使用它们生成阴影是阴影只能是单色的；

通过巧妙的利用 `filter: blur` 模糊滤镜，我们可以假装生成渐变色或者说是颜色丰富的阴影效果：

```css
.avator {
    position: relative;
    background: url($img) no-repeat center center;
    background-size: 100% 100%;
    
    &::after {
        content: "";
        position: absolute;
        top: 10%;
        width: 100%;
        height: 100%;
        background: inherit;
        background-size: 100% 100%;
        filter: blur(10px) brightness(80%) opacity(.8);
        z-index: -1;
    }
}
```

简单的原理就是，**利用伪元素，生成一个与原图一样大小的新图叠加在原图之下**，然后利用滤镜模糊 `filter: blur()` 配合其他的亮度/对比度，透明度等滤镜，制作出一个虚幻的影子，伪装成原图的阴影效果。

嗯，最重要的就是这一句 `filter: blur(10px) brightness(80%) opacity(.8);`

## `blur` 混合 `contrast` 产生融合效果

**模糊滤镜叠加对比度滤镜产生的融合效果**。让你知道什么是 CSS 黑科技：

单独将两个滤镜拿出来，它们的作用分别是：

1. `filter: blur()`： 给图像设置高斯模糊效果；
2. `filter: contrast()`： 调整图像的对比度；

但是，当他们“合体”的时候，产生了奇妙的融合现象：

两圆相交时，在边与边接触的时候，会产生一种边界融合的效果，**通过对比度滤镜把高斯模糊的模糊边缘给干掉**，利用高斯模糊实现融合效果；

上述效果的实现基于两点：

1. 图形是在被设置了 `filter: contrast()` 的画布背景上进行动画的
2. 进行动画的图形被设置了 `filter: blur()`（ 进行动画的图形的父元素需要是被设置了 `filter: contrast()` 的画布）

意思是，两圆相融的背后，其实是叠加了一张设置了 `filter: contrast()` 的大**白色**背景，而两个圆形则被设置了 `filter: blur()` ，两个条件缺一不可。

## 文字融合动画

可以在动画的过程中，动态改变元素滤镜的 `filter: blur()` 的值。

利用这个方法，还可以设计一些文字融合的效果：

```css
h2 {
    color: grey;
    font-size: 4rem;
    text-transform: uppercase;
    line-height: 1;
    animation: letterspacing 5s infinite alternate ease-in-out;
    display: block;
    letter-spacing: -2.2rem;
}

@keyframes letterspacing {
    0% {
        letter-spacing: -2.2rem;
        filter: blur(.3rem);
    }

    50% {
        filter: blur(.5rem);
    }

    100% {
        letter-spacing: .5rem;
        filter: blur(0rem);
        color: grey;
    }
}
```

主要是通过动画同时改变文字的间距和模糊度；

## 总结

1. CSS 滤镜可以给同个元素同时定义多个，例如 `filter: contrast(150%) brightness(1.5)` ，但是滤镜的**先后顺序**不同产生的效果也是不一样的；

   > 也就是说，使用 `filter: contrast(150%) brightness(1.5)` 和 `filter: brightness(1.5) contrast(150%)` 处理同一张图片，得到的效果是不一样的，原因在于滤镜的色值处理算法对图片处理的先后顺序。

2. 滤镜动画需要大量的计算，不断的重绘页面，属于非常**消耗性能**的动画，使用时要注意使用场景。记得开启硬件加速及合理使用分层技术；
3. `blur()` 混合 `contrast()` 滤镜效果，设置不同的颜色会产生不同的效果，这个颜色叠加的具体算法本文作者暂时也不是很清楚，使用时比较好的方法是多尝试不同颜色，观察取最好的效果；
4. SS3 filter 兼容性不算太好，但是在移动端已经可以比较正常的使用，更为精确的兼容性列表，查询 [Can i Use](http://caniuse.com/#search=filter)。