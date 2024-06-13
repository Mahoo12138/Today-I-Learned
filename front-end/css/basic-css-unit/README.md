# CSS 单位指南： em、rem、vh、vw 等详解

许多 CSS 属性如 `width`、`margin`、`padding` 和 `font-size` 都需要一个长度，而 CSS 有许多不同的方法来表达长度。

在 CSS 中，长度是一个数字，一个没有空格的单位。例如，`5px`、`0.9em`，等等。

在 CSS 中，一般有两种用于长度和尺寸的单位：绝对单位和相对单位。

## 绝对长度单位

绝对长度单位是基于一个实际的物理单位，通常被认为是跨设备的相同尺寸。但是，根据你的屏幕尺寸和质量，或者你的浏览器或操作系统的设置，可能会有一些例外。

下面是 CSS 中一些常见的绝对长度单位：
### px

像素，或 `px`，是 CSS 中最常见的长度单位之一。

在 CSS 中，1px 被[正式定义](https://drafts.csswg.org/css-values/#reference-pixel)为 1/96 英寸。所有其他的绝对长度单位都是基于这个像素的定义。

但是，在最初制定这一标准时，大多数显示器的分辨率为 1024×768，DPI（Dots Per Inch，每英寸点数）为 96。

现代设备的屏幕具有更高的分辨率和 DPI，所以 96px 长的线可能无法精确测量到 1 英寸，这取决于设备的情况。

> **辨析 DPI 和 PPI** 
>
> DPI 是每英寸点数，通常用于描述打印机的分辨率。它表示在一英寸的长度内，打印机可以喷出或打印的点的数量。DPI 值越高，打印输出的细节和清晰度就越好。
> 
> PPI 是每英寸像素数，用于描述数字显示器（如计算机屏幕、手机屏幕）或图像的分辨率。它表示在一英寸的长度内，屏幕或图像所包含的像素数量。PPI 值越高，图像或显示屏的细节和清晰度就越好。

尽管以像素为单位的尺寸在不同的设备上会有所不同，但一般认为在屏幕上使用像素更好。

如果你知道你的页面将在高质量的打印机上打印，那么你可以考虑使用另一个单位，比如 `cm` 或 `mm`。

可以在[这篇文章](https://www.smashingmagazine.com/2021/07/css-absolute-units/)中了解更多关于像素单位的历史，以及为什么 CSS 英寸并不总是与物理英寸相匹配。

### cm

厘米，在 CSS 中，`1cm` 大约是 37.8 个像素，或约为 25.2/64 英寸。

### mm

毫米，在 CSS 中，`1mm` 大约是 3.78 像素，或 1/10 厘米。

### in

英寸，在 CSS 中，1 英寸大约是 96 个像素，或大约 2.54 厘米。
### pt

磅（points），在 CSS 中，`1pt` 大约是 1.3333 像素，或 1/72 英寸。

### pc

派卡（picas），在 CSS 中，`1pc` 大约是 16 个像素，或 1/6 英寸。


## 相对长度单位

相对长度单位是相对于另一个元素的大小或设置。例如，一个元素的相对字体大小可以用父元素的字体大小来计算。

下面是一些常见的相对长度单位：

### em

CSS 的 `em` 单位的名字来自于一个排版单位。在字体排印学中，em 这个词“[最初是指所使用的字体和尺寸中大写字母 M 的宽度](https://www.wikiwand.com/zh/Em_(%E5%AD%97%E4%BD%93%E6%8E%92%E5%8D%B0%E5%AD%A6))”。

当与 `font-size` 属性一起使用时，`em` 继承其父元素的 `font-size` 大小：

```css
.container {
  font-size: 16px;
}

.container p {
  font-size: 1em;
}

.container h2 {
  font-size: 3em;
}

.container h3 {
  font-size: 2em;
}
```

在这个例子中，`p` 的 `font-size` 是 `16px`_（16 * 1）_。同时，`h2` 的 `font-size` 为 `48px`_（16 * 3）_，`h3` 为 `32px`_（16 * 2）_。

> 基于这种特性，比较直观的一个例子是，可以用来编写嵌套的菜单项：
> ```html
> <div class="menu">
>   <div class="menu-item">
>     Home
>   </div>
>   <div class="menu-item">
>     About
>     <div class="menu-item">
>       Projects
>       <div class="menu-item">Professional Projects</div>
>       <div class="menu-item">Hobby Projects</div>
>     </div>
>     <div class="menu-item">Portfolio</div>
>   </div>
>   <div class="menu-item">
>     Services
>   </div>
>   <div class="menu-item">
>     Contact
>   </div>
> </div>
> 
> <style>
> /* Parent */
> .menu {
>   font-size: 25px;
> }
> 
> /* Child */
> .menu-item {
>   font-size: 0.9em;
>   padding-left: 12px;
> }
> </style>
> ```
>
> 根据菜单的层级的增大，字体按比例进行缩小。

如果 `em` 与另一个属性（如 `width`）一起使用，`em` 是用目标元素的大小来计算的。

也就是说，子元素可以覆盖父元素的  `font-size`  属性，也就是说 **`em` 的值基于当前元素的 `font-size` 进行计算的。**
### rem

根 `em`。这种相对单位不受父元素的大小或设置的影响，而是以文档的根为基准。对于网站来说，文档的根是 `html` 元素。

```css
p {
  font-size: 1.25rem;
}
```

在大多数浏览器中，默认的字体大小是 16，所以 `html` 元素的 `font-size` 是 `16px`。所以在这种情况下，`p` 是 `20px`（16 * 1.25）。

但是如果用户改变了他们浏览器的默认字体大小，那么 `p` 的 `font-size` 就会相应地放大或缩小。

### %

百分比，或相对于父级大小的百分比大小：

```css
div {
  width: 400px;
}

div p {
  width: 75%;
}
```

由于父级的宽度是 `400px`，所以内部段落的宽度是 `300px`（400 * .75）。

### vw

视图宽度，`1vw` 是视口宽度的 1%。比如说：

```css
body {
  width: 100vw;
}
```

由于 `body` 元素被设置为 `100vw`，即视口宽度的 100%，所以它将占用它所能获得的全部宽度。因此，如果你把浏览器的大小调整为 690px 宽，那么 `body` 就会占据所有 690px 的宽度。

### vh

视图高度，`1vh` 是视口高度的 1%。例如：

```css
div {
  height: 50vh;
}
```

该 `div` 将填充视口高度的 50%。因此，如果浏览器窗口的高度是 900px，那么该 `div` 的高度将是 450px 。

### ex

CSS `ex` 单位的名称来自于字体排印学中的 x-字高，即“[字体中字母 x 的高度](https://www.wikiwand.com/zh/X%E5%AD%97%E9%AB%98)”。在许多字体中，小写的 x 字符通常是最大字符高度的一半。

在 CSS 中，`1ex` 是字体的 x-字高，或 `1em` 的一半（因为许多字体设计中小写字母 "x" 的高度大约占字体高度的一半）。

但是，由于小写字母 x 的大小可以根据字体的不同而有很大的变化，因此 CSS 的 `ex` 单位很少被使用。

![Common typographic metrics](Typography_Line_Terms.svg)

### ch

字符单位，CSS 的 `ch` 单位被定义为字体的 0（零，或U+0030）字符的宽度。

虽然 `ch` 单位对于像 Courier 这样的单行线/固定宽度的字体来说是一种精确的测量，但对于像 Arial 这样的比例字体来说，它可能是不可预测的。

例如，如果你的字体是 Courier，而你把一个元素的宽度设置为 `60ch`，那么这个元素的宽度就正好是 60 个字符。

但是，如果你的字体是 Arial，而你把一个元素的宽度设置为 `60ch`，那么就不知道这个元素会有多宽——字符可能会溢出容器，也可能不够。

![](ch-unit-monospaced-and-proportional-fonts.png)

请看[这篇文章](https://meyerweb.com/eric/thoughts/2018/06/28/what-is-the-css-ch-unit/)，了解对 `ch` 单位的深入解释，并看一些例子。

### vmin 和 vmax

视口最小（`vmin`）和视口最大（`vmax`）的单位是基于 `vw` 和 `vh` 的值。

`1vmin` 是视口最小尺寸的 1%，而 `1vmax` 是视口最大尺寸的 1%。

例如，想象一个宽 1200 像素、高 600 像素的浏览器窗口。在这种情况下，`1vmin` 是 `6px`（`vh` 的 1%，即 600 像素是较小值）。同时，`1vmax` 是 `12px`（`vh` 的 1%，即 1200 像素是较大值）。