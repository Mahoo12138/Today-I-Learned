## 基本介绍

`vertical-align`用来指定行内元素（inline）或表格单元格（table-cell）元素的垂直对齐方式，且支持很多属性值：

```css
/* 关键字值 */
vertical-align: baseline;
vertical-align: sub;
vertical-align: super;
vertical-align: text-top;
vertical-align: text-bottom;
vertical-align: middle;
vertical-align: top;
vertical-align: bottom;

/* <长度> 值 */
vertical-align: 10em;
vertical-align: 4px;

/* <百分比> 值 */
vertical-align: 10%;
```

> 常见的内联元素有`a`、`span`、`em`、`br`、`strong`、`i`、`img`、`input` 等；

## 断背基友

`vertical-align`的百分比值不是相对于字体大小或者其他什么属性计算的，而是相对于`line-height`计算的。

### 基本现象

举个例子：

```css
{
  line-height: 30px;
  vertical-align: -10%;
}
/* 实际上，等价于 */
{
  line-height: 30px;
  vertical-align: -3px;    /* = 30px * -10% */  
}
```

我们不妨从一个极其简单的现象入手。假设，我们有一个`<div>`标签，然后，里面有一张`<img>`图片：

```xml
<div><img src="img/mahoo.png"></div>
```

如果我们给这个`<div>`元素增加一个背景色，例如淡蓝色：

```xml
<div style="background-color:#e5edff;"><img src="img/mahoo.png"></div>
```

会发现图片下面有一段空白空间，实际上，这段空白间隙就是`vertical-align`和`line-height`携手搞的鬼！

首先，大家一定要意识到这么一点：**对于内联元素，vertical-align与line-height虽然看不见，但实际上「到处都是」！**


因此，对于内联元素各种想得通或者想不通的行为表现，基本上都可以用`vertical-align`和`line-height`来解释。

### 幽灵空白节点

原作者自命名，学习原则： **1.情感化认知**；**2. 具象化思维**。

「幽灵空白节点」是个什么意思呢？

**在HTML5文档声明下，块状元素内部的内联元素的行为表现，就好像块状元素内部还有一个（更有可能两个-前后）看不见摸不着没有宽度没有实体的空白节点，这个假想又似乎存在的空白节点，我称之为“幽灵空白节点”。**

抽象了这个概念，绝对定位与`text-align`的一些行为表现，以及这里的行为表现，就好理解了。

上述的图片下的间隙的例子，实际上，这种行为表现，就跟图片前面或者后面有**一个宽度为0的空格元素表现**是一致的。但是，空格是透明的，为了便于大家理解，我就直接使用**很明显的匿名 inline box**, 也就是字符代替。如下，大家会发现，图片下面的间隙，依旧是那个间隙。

```html
<div style="background-color: #e5edff">
    <img src="img/mahoo.png" />mahoo
</div>
```

下面要解释这个间隙就好解释了。下面，我们让新增的文本inline-block化，然后弄个白色背景，显示其占据的高度。

会发现，图片下面的间隙，依旧是那个间隙。但是，我们的理解就好理解了。回答下面几个问题，我们就知道表现的原因了：

1. `vertical-align`默认的对齐方式是？
2. 后面文字的高度从何而来？

+ `vertical-align`默认值是`baseline`, 也就是基线对齐。而基线是什么，基线就是字母X的下边缘；所以图片的下边缘就和后面文字中的字母`x`下边缘对齐。而字符本身是有高度的，对吧，于是，图片下面就留空了。
+ 文字的高度是由行高决定的。

因此，简单的图片下面留白行为表现，本质上，就是`vertical-align`和`line-height`背地里搞基造成的。

知道了问题的原因，我们就可以对症下药，准确搞定图片下面我们不希望看到的间隙。怎么搞呢？一对基友，`vertical-align`和`line-height`我们随便搞定一个就可以了。

**1. 让vertical-align失效**
图片默认是`inline`水平的，而`vertical-align`对块状水平的元素无感。因此，我们只要让图片`display`水平为`block`就可以了，我们可以直接设置`display`或者浮动、绝对定位等（如果布局允许）。例如：

```css
img { display: block; }
```

**2. 使用其他vertical-align值**
告别`baseline`, 取用其他属性值，比方说`bottom`/`middle`/`top`都是可以的。

**3. 直接修改line-height值**
下面的空隙高度，实际上是文字计算后的行高值和字母x下边缘的距离。因此，只要行高足够小，实际文字占据的高度的底部就会在x的上面，下面没有了高度区域支撑，自然，图片就会有容器底边贴合在一起了。比方说，我们设置行高5像素：

```css
div { line-height: 5px; }
```

**4. line-height为相对单位，font-size间接控制**
如果`line-height`是相对单位，例如`line-height:1.6`或者`line-height:160%`之类，也可以使用`font-size`间接控制，比方说来个狠的，`font-size`设为大鸡蛋`0`, 本质上还是改变`line-height`值.

```css
div { font-size: 0; }
```

**5. 基本现象衍生：垂直居中**

由于「幽灵空白节点」的存在，因此，我们可以进一步衍生，实现其他更实用的效果，比方说任意尺寸的图片（或者内联块状化的多行文字）的垂直居中效果。就是借助本文的两位男主角，`vertical-align`和`line-height`。

你想啊，**图片后面（前面）有个类似空格字符的节点，然后就能响应`line-height`形成高度**，此时，图片再来个`vertical-align:middle`，就可以和这个被行高撑高的「幽灵空白节点」(近似)垂直对齐了。

而这样只是近似居中，那是因为「幽灵空白节点」高度行高撑开，其垂直中心是字符 content area 的中心，而对于字符`x`而言，都是比绝对中心位置要下沉的（不同字体下沉幅度不一样），换句更易懂的描述就是`x`的中心位置都是在字符内容区域高度中心点的下方，而这上下的偏差就是这里图片上下间距的偏差。

换句更简单的话说就是：middle中线位置(字符`x`的中心)并不是字符内容的绝对居中位置。两个位置的偏差就是图片近似居中的偏差。

因此，要想完全垂直居中，最先想到的方法就是让后面的“幽灵字符”也是`vertical-align:middle`，然而，呵呵，既然称之为“幽灵”就表示不会受非继承特性的属性影响，所以，根本没法设置`vertical-align:middle`，除非你自己创建一个显示的内联元素。

我们就没有办法了吗？当然不是，“幽灵字符”可以受具有继承特性的CSS属性影响，于是，我们可以通过其他东西来做调整，让字符的中线和字符内容中心线在一起，或者说在一个位置上就可以了。有人可能要疑问了，这能行吗？啊，是可以的。

怎么搞？**很简单，`font-size:0`,** 因此此时 content area 高度是0，各种乱七八糟的线都在高度为 0 的这条线上，绝对中心线和中线重合，自然全垂直居中。

```css
div { line-height: 240px; font-size: 0; }
img { vertical-align: middle; }
```

### inline-block 和 baseline

CSS2的可视化格式模型文档中有一么一段话：

> The baseline of an ‘inline-block’ is the baseline of its last line box in the normal flow, unless it has either no in-flow line boxes or if its ‘overflow’ property has a computed value other than ‘visible’, in which case the baseline is the bottom margin edge.

英文看得眼睛大，于是我中文直译了下：

> ‘inline-block’的基线是正常流中最后一个line box的基线, 除非，这个line box里面既没有line boxes或者本身’overflow’属性的计算值而不是’visible’, 这种情况下基线是margin底边缘。

这段文档中出现了很多专有名词`line box`, `line boxes`等，这些是内联盒子模型中的概念，是CSS进阶必备知识。