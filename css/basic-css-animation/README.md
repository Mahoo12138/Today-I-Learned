# 深入浅出 CSS 动画

> 原文链接：[深入浅出 CSS 动画 - iCSS前端趣闻](https://mp.weixin.qq.com/s?__biz=Mzg2MDU4MzU3Nw==&mid=2247489771&idx=1&sn=438d07689194d0f9d553c261e7e04abb&chksm=ce257b1df952f20bc3d90cd9ee43b949dca0853635bf90df89581c88a907b1fe3d155c867e2e&scene=21#wechat_redirect)

## 动画介绍及语法

CSS 动画用于实现元素从一个 CSS 样式配置转换到另一个 CSS 样式配置；

动画包括两个部分：

+ 描述动画的样式规则；
+ 用于指定动画开始、结束以及中间点样式的关键帧；

简单例子：

```css
div {
    animation: change 3s;
}

@keyframes change {
    0% {
        color: #f00;
    }
    100% {
        color: #000;
    }
}
```

+ `animation: change 1s` 部分就是动画的第一部分，用于描述动画的各个规则；

+ `@keyframes change {}` 部分就是动画的第二部分，用于指定动画开始、结束以及中间点样式的关键帧；

## 动画的语法详解

`animation` 的子属性有：

+ `animation-name`：指定由 **@keyframes** 描述的关键帧名称；
+ `animation-duration`：设置动画一个周期的时长；
+ `animation-delay`：设置延时，即从元素加载完成之后到动画序列开始执行的这段时间；
+ `animation-direction`：设置动画在每次运行完后是反向运行还是重新回到开始位置重复运行；
+ `animation-iteration-count`：设置动画重复次数， 可以指定 **infinite** 无限次重复动画；
+ `animation-play-state`：允许暂停和恢复动画；
+ `animation-timing-function`：设置动画速度， 即通过建立加速度曲线，设置动画在关键帧之间是如何变化；
+ `animation-fill-mode`：指定动画执行前后如何为目标元素应用样式；
+ **@keyframes** 规则，当然，一个动画想要运行，还应该包括 @keyframes 规则，在内部设定动画关键帧；

其中，对于一个动画，**必须项**：`animation-name`、`animation-duration` 和 `@keyframes`规则，其余都有默认值。

### name / duration 详解

+ `animation-name` 命名和 CSS 规则命名一样，如支持 emoji 表情；

### delay 详解

+ 设置动画延时，即从元素加载完成之后到动画序列开始执行的这段时间；
+ 延时可为负值，这样可以让动画提前进行；

### duration 和 delay 构建随机效果

利用一定范围内随机的 `animation-duration` 和一定范围内随机的 `animation-delay`，可以有效的构建更为随机的动画效果，让动画更加的自然；

```scss
@for $i from 1 to 11 {
    li:nth-child(#{$i}) {
        animation-duration: #{random(2000)/1000 + 2}s;
        animation-delay: #{random(1000)/1000 + 1}s;
    }
}
```

+ [HuaWei Battery Charging Animation (codepen.io)](https://codepen.io/Chokcoco/pen/vYExwvm)

### timing-function 缓动函数

+ 定义CSS动画在每一动画周期中执行的节奏；
  + cubic-bezier-timing-function
  + step-timing-function
+ cubic-bezier()连续动画：linear、ease、ease-in、ease-out、ease-in-out；
+ steps()功能符可以让动画不连续：step-start、step-end；
+ `steps()`更像是楼梯坡道，`cubic-bezier()`更像是无障碍坡道；

### play-state 详解

控制动画的状态——运行或者暂停：

```css
{
    animation-play-state: paused | running;
}
```

### fill-mode 详解

控制元素在各个阶段的状态：

+ **none**：默认值，当动画未执行状态，动画将不会将任何样式应用于目标，而是使用赋予给该元素的 CSS 规则来显示该元素的状态；
+ **backwards**：动画将在应用于目标时立即应用第一个关键帧中定义的值，并在 `animation-delay` 期间保留此值；
+ **forwards**：目标将保留由执行期间遇到的最后一个关键帧计算值。 最后一个关键帧取决于 `animation-direction` 和 `animation-iteration-count`；
+ **both**：动画将遵循 `forwards` 和 `backwards` 的规则，从而在两个方向上扩展动画属性；

### iteration-count /direction 详解

- `animation-iteration-count` 控制动画运行的次数，可以是数字或者 `infinite`，注意，数字可以是小数；
- `animation-direction` 控制动画的方向，正向、反向、正向交替与反向交替；

动画运行的第一帧和最后一帧的实际状态会受到动画运行方向 `animation-direction` 和 `animation-iteration-count` 的影响：

+ 动画运行的第一帧由 `animation-direction` 决定

+ 动画运行的最后一帧由 `animation-iteration-count` 和 `animation-direction` 决定；

## 动画的分治与复用

`animation` 是可以接收多个动画的，这样做的目的不仅仅只是为了**复用**，同时也是为了**分治**，我们对每一个属性层面的动画能够有着更为精确的控制：

```css
div {
    width: 100px;
    height: 100px;
    background: #000;
    animation: combine 2s;
}
/* 下落的同时产生透明度的变化 */
@keyframes combine {
    100% {
        transform: translate(0, 150px);
        opacity: 0;
    }
}
```

## 动画状态的高优先级性

**在 CSS 中，优先级还需要考虑选择器的层叠（级联）顺序**。只有在层叠顺序相等时，使用哪个值才取决于样式的优先级；

根据 CSS Cascading 4 最新标准：

[CSS Cascading and Inheritance Level 5(Current Work)](https://www.w3.org/TR/css-cascade-5/#cascade-sort)

定义的当前规范下申明的层叠顺序优先级如下（越往下的优先级越高，下面的规则按升序排列）：

- Normal user agent declarations
- Normal user declarations
- Normal author declarations
- Animation declarations
- Important author declarations
- Important user declarations
- Important user agent declarations
- Transition declarations

按照上述算法，大概是这样：

过渡动画过程中每一帧的样式 > 用户代理、用户、页面作者设置的!important样式 > 动画过程中每一帧的样式优先级 > 页面作者、用户、用户代理普通样式；

举个例子，我们可以通过这个特性，覆盖掉行内样式中的 `!important` 样式：

```css
<p class="txt" style="color:red!important">123456789</p>
.txt {
    animation: colorGreen 2s infinite;
}
@keyframes colorGreen {
    0%,
    100% {
        color: green;
    }
}
```

## 动画的优化

**1. 动画元素生成独立的 GraphicsLayer，强制开始 GPU 加速**；

Web 动画很大一部分开销在于层的重绘，以层为基础的复合模型对渲染性能有着深远的影响。当不需要绘制时，复合操作的开销可以忽略不计，因此在试着调试渲染性能问题时，首要目标就是要避免层的重绘。那么这就给动画的性能优化提供了方向，**减少元素的重绘与回流**。

这其中，如何减少页面的回流与重绘呢，这里就会运用到我们常说的 **GPU 加速**。

GPU 加速的本质其实是减少浏览器渲染页面每一帧过程中的 reflow 和 repaint，其根本，就是让需要进行动画的元素，生成自己的 **GraphicsLayer**。

在 Chrome 中，存在有不同类型的层： RenderLayer(负责 DOM 子树)，GraphicsLayer(负责 RenderLayer 的子树)。

GraphicsLayer ，它对于我们的 Web 动画而言非常重要，通常，Chrome 会将一个层的内容在作为纹理上传到 GPU 前先绘制(paint)进一个位图中。如果内容不会改变，那么就没有必要重绘(repaint)层。

而当元素生成了自己的 GraphicsLayer 之后，在动画过程中，Chrome 并不会始终重绘整个层，它会尝试智能地去重绘 DOM 中失效的部分，也就是发生动画的部分，在 Composite 之前，页面是处于一种分层状态，借助 GPU，浏览器仅仅在每一帧对生成了自己独立 GraphicsLayer 元素层进行重绘，如此，大大的降低了整个页面重排重绘的开销，提升了页面渲染的效率。

生成自己的独立的 GraphicsLayer，不仅仅只有 transform3d api，还有非常多的方式。在 CSS 中，包括但不限于（找了很多文档，没有很全面的，需要一个一个去尝试，通过开启 Chrome 的 Layer border 选项）：

- 3D 或透视变换(perspective、transform) CSS 属性
- 使用加速视频解码的
- 拥有 3D (WebGL) 上下文或加速的 2D 上下文的 元素
- 混合插件(如 Flash)
- 对自己的 opacity 做 CSS 动画或使用一个动画变换的元素
- 拥有加速 CSS 过滤器的元素
- 元素有一个包含复合层的后代节点(换句话说，就是一个元素拥有一个子元素，该子元素在自己的层里)
- 元素有一个 z-index 较低且包含一个复合层的兄弟元素(换句话说就是该元素在复合层上面渲染)

对于上述一大段非常绕的内容，你可以再看看这几篇文章：

- [【Web动画】CSS3 3D 行星运转 && 浏览器渲染原理](https://www.cnblogs.com/coco1s/p/5439619.html)
- [Accelerated Rendering in Chrome](https://www.html5rocks.com/zh/tutorials/speed/layers/#disqus_thread)

**2. 减少使用耗性能样式**

不同样式在消耗性能方面是不同的，改变一些属性的开销比改变其他属性要多，因此更可能使动画卡顿。

+ `box-shadow` 属性，从渲染角度来讲十分耗性能，原因是与其他样式相比，它们的绘制代码执行时间过长；
+ 类似的还有 CSS 3D 变换、`mix-blend-mode`、`filter`；
+ 需要针对每一起卡顿的例子，借助开发工具来分辨出性能瓶颈所在，然后设法减少浏览器的工作量；

**3. 使用 will-change 提高页面滚动、动画等渲染性能**

`will-change` 为 Web 开发者提供了一种告知浏览器该元素会有哪些变化的方法，这样浏览器可以在元素属性真正发生变化之前提前做好对应的优化准备工作。 这种优化可以将一部分复杂的计算工作提前准备好，使页面的反应更为快速灵敏。

+ 不要将 `will-change` 应用到太多元素上；
+ 有节制地使用：最佳实践是当元素变化前后通过脚本来切换 `will-change` 的值。；
+ 不要过早应用 `will-change` 优化：不应该被用来预防性能问题；
+ 给它足够的工作时间：尝试找到一些方法提前获知元素可能发生的变化，然后为它加上 `will-change` 属性；
