## Google Font

在写各种 DEMO 的时候，有的时候一些特殊的字体能更好的体现动画的效果。这里讲一个快速引入不同格式字体的小技巧。

就是 [Google Font](https://fonts.google.com/) 这个网站，上面有非常多的不同的开源字体；

当我们相中了一个我们喜欢的字体，它也提供了非常快速的便捷的引入方式。选中对应的字体，选择 `+Select this style`，便可以通过 `link` 和 `@import` 两种方式引入：

使用 `link` 标签引入：

```css
<link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@200&display=swap" rel="stylesheet">
```

OR，在 CSS 代码中，使用 `@import` 引入：

```css
<style>
@import url('https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@200&display=swap');
</style>
```

上述两种方式内部其实都是使用的 `@font-face` 进行了字体的定义。

我们可以通过 [@font-face](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@font-face) 快速声明指定一个自定义字体。类似这样：

```css
@font-face {
  font-family: "Open Sans";
  src: url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"),
       url("/fonts/OpenSans-Regular-webfont.woff") format("woff");
}
```

这样，利用 Google Font，我们就可以便捷的享受各种字体了。接下来，就会分门别类的看看，文字在 CSS 中，和不同属性相结合，能够鼓捣出什么样的效果。

### 长阴影文字效果

通过多层次，颜色逐渐变化（透明）的阴影变化，可以生成长阴影：

```css
div {
  text-shadow: 0px 0px #992400, 1px 1px rgba(152, 36, 1, 0.98), 2px 2px rgba(151, 37, 2, 0.96), 3px 3px rgba(151, 37, 2, 0.94), 4px 4px rgba(150, 37, 3, 0.92), 5px 5px rgba(149, 38, 4, 0.9), 6px 6px rgba(148, 38, 5, 0.88), 7px 7px rgba(148, 39, 5, 0.86), 8px 8px rgba(147, 39, 6, 0.84), 9px 9px rgba(146, 39, 7, 0.82), 10px 10px rgba(145, 40, 8, 0.8), 11px 11px rgba(145, 40, 8, 0.78), 12px 12px rgba(144, 41, 9, 0.76), 13px 13px rgba(143, 41, 10, 0.74), 14px 14px rgba(142, 41, 11, 0.72), 15px 15px rgba(142, 42, 11, 0.7), 16px 16px rgba(141, 42, 12, 0.68), 17px 17px rgba(140, 43, 13, 0.66), 18px 18px rgba(139, 43, 14, 0.64), 19px 19px rgba(138, 43, 15, 0.62), 20px 20px rgba(138, 44, 15, 0.6), 21px 21px rgba(137, 44, 16, 0.58), 22px 22px rgba(136, 45, 17, 0.56), 23px 23px rgba(135, 45, 18, 0.54), 24px 24px rgba(135, 45, 18, 0.52), 25px 25px rgba(134, 46, 19, 0.5), 26px 26px rgba(133, 46, 20, 0.48), 27px 27px rgba(132, 47, 21, 0.46), 28px 28px rgba(132, 47, 21, 0.44), 29px 29px rgba(131, 48, 22, 0.42), 30px 30px rgba(130, 48, 23, 0.4), 31px 31px rgba(129, 48, 24, 0.38), 32px 32px rgba(129, 49, 24, 0.36), 33px 33px rgba(128, 49, 25, 0.34), 34px 34px rgba(127, 50, 26, 0.32), 35px 35px rgba(126, 50, 27, 0.3), 36px 36px rgba(125, 50, 28, 0.28), 37px 37px rgba(125, 51, 28, 0.26), 38px 38px rgba(124, 51, 29, 0.24), 39px 39px rgba(123, 52, 30, 0.22), 40px 40px rgba(122, 52, 31, 0.2), 41px 41px rgba(122, 52, 31, 0.18), 42px 42px rgba(121, 53, 32, 0.16), 43px 43px rgba(120, 53, 33, 0.14), 44px 44px rgba(119, 54, 34, 0.12), 45px 45px rgba(119, 54, 34, 0.1), 46px 46px rgba(118, 54, 35, 0.08), 47px 47px rgba(117, 55, 36, 0.06), 48px 48px rgba(116, 55, 37, 0.04), 49px 49px rgba(116, 56, 37, 0.02), 50px 50px rgba(115, 56, 38, 0);
}
```

当然，多重阴影以及每重的颜色我们很难一个一个手动去写，在写长阴影的时候通常需要借助 `SASS`、`LESS` 去帮助节省时间：

```scss
@function makelongrightshadow($color) {
    $val: 0px 0px $color;

    @for $i from 1 through 50 {
        $color: fade-out(desaturate($color, 1%), .02);
        $val: #{$val}, #{$i}px #{$i}px #{$color};
    }

    @return $val;
}
div {
    text-shadow: makeLongShadow(hsl(14, 100%, 30%));
}
```

### 内嵌阴影文字效果

合理的阴影颜色和背景底色搭配，搭配，可以实现类似内嵌效果的阴影。

```css
div {
  color: #202020;
  background-color: #2d2d2d;
  letter-spacing: .1em;
  text-shadow: -1px -1px 1px #111111, 2px 2px 1px #363636;
}
```

### 氖光效果（Neon）

氖光效果，英文名叫 Neon，是我在 Codepen 上看到的最多的效果之一。它的原理非常简单，却可以产生非常酷炫的效果。

我们只需要设置 3~n 层阴影效果，每一层的模糊半径（文字阴影的第三个参数）间隔较大，并且每一层的阴影颜色相同即可。

```css
p {
    color: #fff;
    text-shadow: 
        0 0 10px #0ebeff,
        0 0 20px #0ebeff,
        0 0 50px #0ebeff,
        0 0 100px #0ebeff,
        0 0 200px #0ebeff
}
```

合理运用 Neon 效果，就可以制作非常多有意思的动效。譬如作用于鼠标 hover 上去的效果：

```css
p {
    transition: .2s;
    &:hover {
        text-shadow: 
            0 0 10px #0ebeff, 
            0 0 20px #0ebeff, 
            0 0 50px #0ebeff, 
            0 0 100px #0ebeff, 
            0 0 200px #0ebeff;
    }
}
```

## 文字与背景

CSS 中的背景 background，也提供了一些属性用于增强文字的效果。

### background-clip 与文字

背景中有个属性为 `background-clip`， 其作用就是**设置元素的背景（背景图片或颜色）的填充规则**。

与 `box-sizing` 的取值非常类似，通常而言，它有 3 个取值，`border-box`，`padding-box`，`content-box`，后面规范新增了一个 `background-clip`。时至今日，部分浏览器仍需要添加前缀 webkit 进行使用 `-webkit-background-clip`。

使用了这个属性的意思是，以区块内的文字作为裁剪区域向外裁剪，文字的背景即为区块的背景，文字之外的区域都将被裁剪掉。

看个最简单的 Demo ，没有使用 `background-clip:text` :

```css
<div>Clip</div>

<style>
div {
  font-size: 180px;
  font-weight: bold;
  color: deeppink;
  background: url($img) no-repeat center center;
  background-size: cover;
}
</style>
```

看到这里，可能有人就纳闷了，这不就是文字设置 `color` 属性嘛。

别急，由于文字设置了颜色，挡住了 div 块的背景，如果将文字设置为透明呢？文字是可以设置为透明的 `color: transparent` 。

```css
div {
  color: transparent;
  background-clip: text;
}
```

通过将文字设置为透明，原本 div 的背景就显现出来了，而文字以外的区域全部被裁剪了，这就是 `background-clip:text` 的作用。

### 利用 `background-clip` 实现渐变文字

再者，利用这个属性，也可以轻松的实现渐变色的文字：

```css
{
    background: linear-gradient(45deg, #009688, yellowgreen, pink, #03a9f4, #9c27b0, #8bc34a);
    background-clip: text;
}
```

配合 `background-position` 或者 `filter: hue-rotate()`，让渐变动起来：

```css
{
    background: linear-gradient(45deg, #009688, yellowgreen, pink, #03a9f4, #9c27b0, #8bc34a);
    background-clip: text;
    animation: huerotate 5s infinite;
}

@keyframes huerotate {
    100% {
        filter: hue-rotate(360deg);
    }
}
```

### 利用 `background-clip` 给文字增加高光动画

利用 `background-clip`， 我们还可以轻松的给文字增加高光动画。

其本质也是利用了 `background-clip`，伪代码如下：

```css
<p data-text="Lorem ipsum dolor"> Lorem ipsum dolor </p>
p {
    position: relative;
    color: transparent;
    background-color: #E8A95B;
    background-clip: text;
}
p::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(120deg, transparent 0%, transparent 6rem, white 11rem, transparent 11.15rem, transparent 15rem, rgba(255, 255, 255, 0.3) 20rem, transparent 25rem, transparent 27rem, rgba(255, 255, 255, 0.6) 32rem, white 33rem, rgba(255, 255, 255, 0.3) 33.15rem, transparent 38rem, transparent 40rem, rgba(255, 255, 255, 0.3) 45rem, transparent 50rem, transparent 100%);
    background-clip: text;
    background-size: 150% 100%;
    background-repeat: no-repeat;
    animation: shine 5s infinite linear;
}
@keyframes shine {
	0% {
		background-position: 50% 0;
	}
	100% {
		background-position: -190% 0;
	}
}
```

去掉伪元素的 `background-clip: text`，就能看懂原理；

### `mask` 与文字

还有一个与背景相关的属性 -- `mask` 。

只需要记住核心的，使用 `mask` 最重要结论就是：**添加了 mask 属性的元素，其内容会与 mask 表示的渐变的 transparent 的重叠部分，并且重叠部分将会变得透明。**

利用 `mask`，我们可以实现各种文字的出场特效：

```css
<div>
    <p>Hello MASK</p>
</div>
```

核心的 CSS 代码：

```css
div {
    mask: radial-gradient(circle at 50% 0%, #000, transparent 30%);
    animation: scale 6s infinite;
}
@keyframes scale {
    0% {
        mask-size: 100% 100%;
    }
    60%,
    100% {
        mask-size: 150% 800%;
    }
}
```