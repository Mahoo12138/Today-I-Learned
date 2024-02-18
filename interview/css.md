## 说说你对盒子模型的理解?

当对一个文档进行布局（layout）的时候，浏览器的渲染引擎会根据标准之一的 CSS 基础框盒模型（CSS basic box model），将所有元素表示为一个个矩形的盒子（box）。

一个盒子由四个部分组成：`content`、`padding`、`border`、`margin`：

![css-box-model](.\_resources\css-box-model.png)

+ `content`，即实际内容，显示文本和图像

+ `boreder`，即边框，围绕元素内容的内边距的一条或多条线，由粗细、样式、颜色三部分组成

+ `padding`，即内边距，清除内容周围的区域，内边距是透明的，取值不能为负，受盒子的`background`属性影响

+ `margin`，即外边距，在元素外创建额外的空白，空白通常指不能放其他元素的区域

上述是一个从二维的角度观察盒子，下面再看看看三维图：

![css-box-model-hierarchy](.\_resources\css-box-model-hierarchy.png)

下面来段代码：

```html
<style>
  .box {
    width: 200px;
    height: 100px;
    padding: 20px;
  }
</style>
<div class="box">
  盒子模型
</div>
```

当我们在浏览器查看元素时，却发现元素的大小变成了`240px`。这是因为，在`CSS`中，盒子模型可以分成：

- W3C 标准盒子模型
- IE 怪异盒子模型

默认情况下，盒子模型为`W3C` 标准盒子模型

### 标准盒子模型

标准盒子模型，是浏览器默认的盒子模型

从上图可以看到：

- 盒子总宽度 = width + padding + border + margin;
- 盒子总高度 = height + padding + border + margin

也就是，`width/height` 只是内容高度，不包含 `padding` 和 `border`值

所以上面问题中，设置`width`为200px，但由于存在`padding`，但实际上盒子的宽度有240px。

### IE 怪异盒子模型

同样看看IE 怪异盒子模型的模型图：

![ie-css-box-model](.\_resources\ie-css-box-model.png)

从上图可以看到：

- 盒子总宽度 = width + margin；
- 盒子总高度 = height + margin；

也就是，`width/height` 包含了 `padding`和 `border`值；

### Box-sizing

CSS 中的 box-sizing 属性定义了引擎应该如何计算一个元素的总宽度和总高度

语法：

```css
box-sizing: content-box|border-box|inherit:
```

- content-box 默认值，元素的 width/height 不包含padding，border，与标准盒子模型表现一致；
- border-box 元素的 width/height 包含 padding，border，与怪异盒子模型表现一致；
- inherit 指定 box-sizing 属性的值，应该从父元素继承；

回到上面的例子里，设置盒子为 border-box 模型

```html
<style>
  .box {
    width: 200px;
    height: 100px;
    padding: 20px;
    box-sizing: border-box;
  }
</style>
<div class="box">
  盒子模型
</div>
```

这时候，就可以发现盒子的所占据的宽度为200px。

## CSS 选择器有哪些？优先级？哪些属性可以继承？

### 选择器

CSS选择器是CSS规则的第一部分，它是元素和其他部分组合起来告诉浏览器哪个HTML元素应当是被选为应用规则中的CSS属性值的方式。选择器所选择的元素，叫做“选择器的对象”。

关于`css`属性选择器常用的有：

- id选择器（#box），选择id为box的元素
- 类选择器（.one），选择类名为one的所有元素
- 标签选择器（div），选择标签为div的所有元素
- 后代选择器（#box div），选择id为box元素内部所有的div元素
- 子选择器（.one>one_1），选择父元素为.one的所有.one_1的元素
- 相邻同胞选择器（.one+.two），选择紧接在.one之后的所有.two元素
- 群组选择器（div,p），选择div、p的所有元素

还有一些使用频率相对没那么多的选择器：

#### 伪类选择器

```css
:link         选择未被访问的链接
:visited      选取已被访问的链接
:active       选择活动链接
:hover        鼠标指针浮动在上面的元素
:focus        选择具有焦点的
:first-child  父元素的首个子元素
```

#### 伪元素选择器

```css
:first-letter  用于选取指定选择器的首字母
:first-line    选取指定选择器的首行
:before        选择器在被选元素的内容前面插入内容
:after         选择器在被选元素的内容后面插入内容
```

#### 属性选择器

```css
[attribute]        选择带有attribute属性的元素
[attribute=value]  选择所有使用attribute=value的元素
[attribute~=value] 选择attribute属性包含value的元素
[attribute|=value] 选择attribute属性以value开头的元素
```

在`CSS3`中新增的选择器有如下：

- 层次选择器（p~ul），选择前面有p元素的每个ul元素
- 伪类选择器

    ```css
    :first-of-type 表示一组同级元素中其类型的第一个元素
    :last-of-type 表示一组同级元素中其类型的最后一个元素
    :only-of-type 表示没有同类型兄弟元素的元素
    :only-child 表示没有任何兄弟的元素
    :nth-child(n) 根据元素在一组同级中的位置匹配元素
    :nth-last-of-type(n) 匹配给定类型的元素，基于它们在一组兄弟元素中的位置，从末尾开始计数
    :last-child 表示一组兄弟元素中的最后一个元素
    :root 设置HTML文档
    :empty 指定空的元素
    :enabled 选择可用元素
    :disabled 选择被禁用元素
    :checked 选择选中的元素
    :not(selector) 选择与 <selector> 不匹配的所有元素
    ```

- 属性选择器

    ```css
    [attribute*=value]：选择attribute属性值包含value的所有元素
    [attribute^=value]：选择attribute属性开头为value的所有元素
    [attribute$=value]：选择attribute属性结尾为value的所有元素
    ```

### 优先级

相信大家对`CSS`选择器的优先级都不陌生：

> 内联 > ID选择器 > 类选择器 > 标签选择器

到具体的计算层⾯，优先级是由 A 、B、C、D 的值来决定的，其中它们的值计算规则如下：

- 如果存在内联样式，那么 A = 1, 否则 A = 0
- B的值等于 ID选择器出现的次数
- C的值等于 类选择器 和 属性选择器 和 伪类 出现的总次数
- D 的值等于 标签选择器 和 伪元素 出现的总次数

这里举个例子：

```css
#nav-global > ul > li > a.nav-link
```

套用上面的算法，依次求出 `A` `B` `C` `D` 的值：

- 因为没有内联样式 ，所以 A = 0
- ID选择器总共出现了1次， B = 1
- 类选择器出现了1次， 属性选择器出现了0次，伪类选择器出现0次，所以 C = (1 + 0 + 0) = 1
- 标签选择器出现了3次， 伪元素出现了0次，所以 D = (3 + 0) = 3

上面算出的`A` 、 `B`、`C`、`D` 可以简记作：`(0, 1, 1, 3)`

知道了优先级是如何计算之后，就来看看比较规则：

- 从左往右依次进行比较 ，较大者优先级更高
- 如果相等，则继续往右移动一位进行比较
- 如果4位全部相等，则后面的会覆盖前面的

经过上面的优先级计算规则，我们知道内联样式的优先级最高，如果外部样式需要覆盖内联样式，就需要使用`!important`。

### 继承属性

在`css`中，继承是指的是给父元素设置一些属性，后代元素会自动拥有这些属性

关于继承属性，可以分成：

- 字体系列属性

```css
font:组合字体
font-family:规定元素的字体系列
font-weight:设置字体的粗细
font-size:设置字体的尺寸
font-style:定义字体的风格
font-variant:偏大或偏小的字体
```

- 文本系列属性

```css
text-indent：文本缩进
text-align：文本水平对刘
line-height：行高
word-spacing：增加或减少单词间的空白
letter-spacing：增加或减少字符间的空白
text-transform：控制文本大小写
direction：规定文本的书写方向
color：文本颜色
```

- 元素可见性

```css
visibility
```

- 表格布局属性

```css
caption-side：定位表格标题位置
border-collapse：合并表格边框
border-spacing：设置相邻单元格的边框间的距离
empty-cells：单元格的边框的出现与消失
table-layout：表格的宽度由什么决定
```

- 列表属性

```css
list-style-type：文字前面的小点点样式
list-style-position：小点点位置
list-style：以上的属性可通过这属性集合
```

- 引用

```css
quotes：设置嵌套引用的引号类型
```

- 光标属性

```css
cursor：箭头可以变成需要的形状
```

继承中比较特殊的几点：

- a 标签的字体颜色不能被继承；
- h1-h6标签字体的大小也是不能被继承的；

#### 无继承的属性

- display
- 文本属性：vertical-align、text-decoration
- 盒子模型的属性：宽度、高度、内外边距、边框等
- 背景属性：背景图片、颜色、位置等
- 定位属性：浮动、清除浮动、定位position等
- 生成内容属性：content、counter-reset、counter-increment
- 轮廓样式属性：outline-style、outline-width、outline-color、outline
- 页面样式属性：size、page-break-before、page-break-after

## 怎么理解回流跟重绘？什么场景下会触发？

### 是什么

在`HTML`中，每个元素都可以理解成一个盒子，在浏览器解析过程中，会涉及到回流与重绘：

- 回流：布局引擎会根据各种样式计算每个盒子在页面上的大小与位置
- 重绘：当计算好盒模型的位置、大小及其他属性后，浏览器根据每个盒子特性进行绘制

具体的浏览器解析渲染机制如下所示：

![painting](.\_resources\painting.png)

- 解析HTML，生成DOM树，解析CSS，生成CSSOM树
- 将DOM树和CSSOM树结合，生成渲染树(Render Tree)
- Layout(回流)：根据生成的渲染树，进行回流(Layout)，得到节点的几何信息（位置，大小）
- Painting(重绘)：根据渲染树以及回流得到的几何信息，得到节点的绝对像素
- Display：将像素发送给GPU，展示在页面上

在页面初始渲染阶段，回流不可避免的触发，可以理解成页面一开始是空白的元素，后面添加了新的元素使页面布局发生改变。

当我们对 `DOM` 的修改引发了 `DOM`几何尺寸的变化（比如修改元素的宽、高或隐藏元素等）时，浏览器需要重新计算元素的几何属性，然后再将计算的结果绘制出来。

当我们对 `DOM`的修改导致了样式的变化（`color`或`background-color`），却并未影响其几何属性时，浏览器不需重新计算元素的几何属性、直接为该元素绘制新的样式，这里就仅仅触发了重绘。

### 如何触发

要想减少回流和重绘的次数，首先要了解回流和重绘是如何触发的

#### 回流触发时机

回流这一阶段主要是计算节点的位置和几何信息，那么当页面布局和几何信息发生变化的时候，就需要回流，如下面情况：

- 添加或删除可见的DOM元素
- 元素的位置发生变化
- 元素的尺寸发生变化（包括外边距、内边框、边框大小、高度和宽度等）
- 内容发生变化，比如文本变化或图片被另一个不同尺寸的图片所替代
- 页面一开始渲染的时候（这避免不了）
- 浏览器的窗口尺寸变化（因为回流是根据视口的大小来计算元素的位置和大小的）

还有一些容易被忽略的操作：获取一些特定属性的值

> offsetTop、offsetLeft、 offsetWidth、offsetHeight、scrollTop、scrollLeft、scrollWidth、scrollHeight、clientTop、clientLeft、clientWidth、clientHeight

这些属性有一个共性，就是需要通过即时计算得到。因此浏览器为了获取这些值，也会进行回流

除此还包括`getComputedStyle`方法，原理是一样的。

#### 重绘触发时机

触发回流一定会触发重绘。可以把页面理解为一个黑板，黑板上有一朵画好的小花。现在我们要把这朵从左边移到了右边，那我们要先确定好右边的具体位置，画好形状（回流），再画上它原有的颜色（重绘）

除此之外还有一些其他引起重绘行为：

- 颜色的修改
- 文本方向的修改
- 阴影的修改

### 浏览器优化机制

由于每次重排都会造成额外的计算消耗，因此大多数浏览器都会通过**队列化修改**并批量执行来优化重排过程。浏览器会将修改操作放入到队列里，直到过了一段时间或者操作达到了一个阈值，才清空队列。

当你获取布局信息的操作的时候，会强制队列刷新，包括前面讲到的`offsetTop`等方法都会返回最新的数据。

因此浏览器不得不清空队列，触发回流重绘来返回正确的值。

### 如何减少

我们了解了如何触发回流和重绘的场景，下面给出避免回流的经验：

- 如果想设定元素的样式，通过改变元素的 `class` 类名 (尽可能在 DOM 树的最里层)
- 避免设置多项内联样式
- 应用元素的动画，使用 `position` 属性的 `fixed` 值或 `absolute` 值(如前文示例所提)
- 避免使用 `table` 布局，`table` 中每个元素的大小以及内容的改动，都会导致整个 `table` 的重新计算
- 对于那些复杂的动画，对其设置 `position: fixed/absolute`，尽可能地使元素脱离文档流，从而减少对其他元素的影响
- 使用 css3 硬件加速，可以让`transform`、`opacity`、`filters`这些动画不会引起回流重绘
- 避免使用 CSS 的 `JavaScript` 表达式

在使用 `JavaScript` 动态插入多个节点时, 可以使用`DocumentFragment`， 创建后一次插入，就能避免多次的渲染性能。

但有时候，我们会无可避免地进行回流或者重绘，我们可以更好使用它们。例如，多次修改一个把元素布局的时候，我们很可能会如下操作：

```js
const el = document.getElementById('el')
for(let i = 0; i < 10 ;i++) {
    el.style.top  = el.offsetTop  + 10 + "px";
    el.style.left = el.offsetLeft + 10 + "px";
}
```

每次循环都需要获取多次`offset`属性，比较糟糕，可以使用变量的形式缓存起来，待计算完毕再提交给浏览器发出重计算请求

```js
// 缓存offsetLeft与offsetTop的值
const el = document.getElementById('el')
let offLeft = el.offsetLeft, offTop = el.offsetTop

// 在JS层面进行计算
for(let i=0;i<10;i++) {
  offLeft += 10
  offTop  += 10
}

// 一次性将计算结果应用到DOM上
el.style.left = offLeft + "px"
el.style.top = offTop  + "px"
```

我们还可避免改变样式，使用类名去合并样式

```js
const container = document.getElementById('container')
container.style.width = '100px'
container.style.height = '200px'
container.style.border = '10px solid red'
container.style.color = 'red'
```

使用类名去合并样式

```html
<style>
    .basic_style {
        width: 100px;
        height: 200px;
        border: 10px solid red;
        color: red;
    }
</style>
<script>
    const container = document.getElementById('container')
    container.classList.add('basic_style')
</script>
```

前者每次单独操作，都去触发一次渲染树更改（新浏览器不会），

都去触发一次渲染树更改，从而导致相应的回流与重绘过程

合并之后，等于我们将所有的更改一次性发出

我们还可以通过通过设置元素属性`display: none`，将其从页面上去掉，然后再进行后续操作，这些后续操作也不会触发回流与重绘，这个过程称为离线操作

```js
const container = document.getElementById('container')
container.style.width = '100px'
container.style.height = '200px'
container.style.border = '10px solid red'
container.style.color = 'red'
```

离线操作后

```js
let container = document.getElementById('container')
container.style.display = 'none'
container.style.width = '100px'
container.style.height = '200px'
container.style.border = '10px solid red'
container.style.color = 'red'
...（省略了许多类似的后续操作）
container.style.display = 'block'
```