## 前言

我们知道，使用 CSS，我们可以非常轻松的实现动态旋转的动画效果：

```css
<div></div>
div {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top: 2px solid #000;
    border-left: 2px solid #000;
    animation: rotate 3s infinite linear;
}
@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}
```

与要求的线条 loading 动画相比，上述动画缺少了比较核心的一点在于：

**线条在旋转运动的过程中，长短是会发生变化的**；

所以，这里的的难点也就转变为了，如何**动态的实现弧形线段的长短变化**？解决了这个问题，也就基本上解决了上述的线条变换 Loading 动画。

本文将介绍 CSS 当中，几种有意思的，可能可以动态改变弧形线条长短的方式：

## 方法一：使用遮罩实现

第一种方法，也是比较容易想到的方式，使用遮罩的方式实现。

我们实现**两个半圆线条**，一个是实际能看到的颜色，另外一个则是和背景色相同的，相对更为粗一点的半圆线条，当两条线条运动的速率不一致时，我们从视觉上，也就能看到动态变化的弧形线条。

```css
<div></div>
div {
    width: 200px;
    height: 200px;
}
div::before {
    position: absolute;
    content: "";
    top: 0px; left: 0px; right: 0px; bottom: 0px;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top: 3px solid #000;
    border-left: 3px solid #000;
    animation: rotate 3s infinite ease-out;
}
div::after {
    position: absolute;
    content: "";
    top: -2px; left: -2px; right: -2px; bottom: -2px;
    border-radius: 50%;
    border: 7px solid transparent;
    border-bottom: 7px solid #fff;
    border-right: 7px solid #fff;
    animation: rotate 4s infinite ease-in-out;
}
@keyframes rotate {
    100% {
        transform: rotate(0deg);
    }
}
```

核心就是实现两条半圆线条，一条黑色，一条背景色，两段线条以不同的速率运动（通过动画时间及缓动控制）

上述方案最大的 2 个问题在于：

+ 如果背景色不是纯色，会露馅
+ 如果要求能展现的线段长度大于半个圆，无法完成

基于此，我们只能另辟蹊径。

## 方法二：借助 SVG 的 stroke-* 能力

我们只需要一个简单的 SVG 标签 \<circle>，配合其 CSS 样式 `stroke-dasharray` 和 `stroke-dashoffset` 即可轻松完成上述效果：

```html
<svg class="circular" viewbox="25 25 50 50">
  <circle class="path" cx="50" cy="50" r="20" fill="none" />
</svg>
```

```css
.circular {
  width: 100px;
  height: 100px;
  animation: rotate 2s linear infinite;
}
.path {
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  stroke: #000;
  animation: dash 1.5s ease-in-out infinite
}
@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}
@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124px;
  }
}
```

简单解释下：

+ **stroke**：类比 css 中的 border-color，给 svg 图形设定边框颜色；
+ **stroke-dasharray**：值是一组数组，没数量上限，每个数字交替表示划线与间隔的宽度;
+ **stroke-dashoffset**：dash 模式到路径开始的距离。

我们利用 `stroke-dasharray` 将原本完整的线条切割成多段，例如 `stroke-dasharray: 10, 10` 表示线段每段长 `10px`且间隔也是`10px`，

而在动画中：

+ `stroke-dasharray: 1, 200;`：则会显示为一个点；
+ `stroke-dasharray: 89, 200;`：显示为 89px 长的圆弧；

通过 animation，让线段在这两种状态之间补间变换。而 `stroke-dashoffset` 的作用则是**将线段向前推移**，配合父容器的 transform: rotate() 旋转动画，使得视觉效果，线段是在一直在向一个方向旋转。

OK，还会有同学说了，我不想引入 SVG 标签，我只想使用纯 CSS 方案。这里，还有一种利用 CSS @Property 的纯 CSS 方案。

## 方法三：使用 CSS @Property 让 conic-gradient 动起来

这里我们需要借助 CSS @Property 的能力，使得本来无法实现动画效果的角向渐变，动起来。

正常来说，渐变是无法进行动画效果的，如下所示：

```css
<div></div>

.normal {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: conic-gradient(
        yellowgreen, yellowgreen 25%, 
        transparent 25%, transparent 100%
    ); 
    transition: background 300ms;
    
    &:hover {
        background: conic-gradient(
            yellowgreen, yellowgreen 60%, 
            transparent 60.1%, transparent 100%
        ); 
    }

}
```

将会得到这样一种效果，由于 `conic-gradient` 是不支持过渡动画的，得到的是一帧向另外一帧的直接变化；

好，使用 CSS @Property 自定义变量改造一下：

```css
@property --per {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 25%;
}

div {
    background: conic-gradient(
        yellowgreen, yellowgreen var(--per), 
        transparent var(--per), transparent 100%
    ); 
    transition: --per 300ms linear;
    
    &:hover {
        --per: 60%;
    }
}

```

在这里，我们可以让渐变动态的动起来，赋予了动画的能力。

我们只需要再引入 mask，将中间部分裁切掉，即可实现上述线条 Loading 动画，伪代码如下：

```css
<div></div>
@property --per {
    syntax: "<percentage>";
    inherits: false;
    initial-value: 10%;
}

div {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    animation: rotate 11s infinite ease-in-out;

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 50%;
        background: conic-gradient(transparent, transparent var(--per), #fa7 var(--per), #fa7);
        mask: radial-gradient(transparent, transparent 47.5px, #000 48px, #000);
        animation: change 3s infinite cubic-bezier(0.57, 0.29, 0.49, 0.76);
    }
}

@keyframes change {
    50% {
        transform: rotate(270deg);
        --per: 98%;
    }
    100% {
        transform: rotate(720deg);
    }
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
        filter: hue-rotate(360deg);
    }
}

```

这里，我顺便加上了 filter: hue-rotate()，让线条在旋转的同时，颜色也跟着变化，最终效果如下，这是一个纯 CSS 解决方案；