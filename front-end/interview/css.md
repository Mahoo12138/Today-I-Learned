

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

![painting](painting.png)

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

## 伪类和伪元素有什么区别？

伪类（Pseudo-classes）和伪元素（Pseudo-elements）是 CSS 中的两个不同概念，它们用于向选择器添加特殊的样式规则，以实现一些特定的效果，但它们之间有一些区别：

### 伪类（Pseudo-classes）

- 伪类用于向选择器添加特殊的样式规则，以根据**元素的状态或位置**来选择元素。
- 伪类通常以冒号（`:`）开头，如 `:hover`、`:active`、`:focus` 等。
- 伪类表示元素的特定状态，例如鼠标悬停、元素处于激活状态、元素获得焦点等。
- 伪类可以用于任何 CSS 选择器中，包括类选择器、ID 选择器、标签选择器等。

### 伪元素（Pseudo-elements）

- 伪元素用于向选择器添加额外的元素，以在选定的元素上创建虚拟的元素。
- 伪元素通常以双冒号（`::`）开头，如 `::before`、`::after`、`::first-line` 等。
- 伪元素用于在选定的元素的特定位置插入内容，例如在元素的前面、后面、第一行等位置。
- 伪元素不能用于任何 CSS 选择器中，只能用于部分选择器，如类选择器、ID 选择器、标签选择器等。

## 你知道哪些实现元素居中的方案？

### 文本或内联元素水平居中

使用`text-align: center;`属性可以实现文本或内联元素（如链接）的水平居中。

```css
css.container {
  text-align: center;
}
```

**适用场景**：适用于文本、链接或其他内联元素的水平居中。

### 块级元素水平居中

使用`margin: 0 auto;`可以实现块级元素（如`<div>`）的水平居中。

```css
css.child {
  width: 50%; /* 必须指定宽度 */
  margin: 0 auto;
}
```

**适用场景**：适用于需要水平居中的块级元素，元素宽度需预先定义。

### Flexbox居中

#### 水平居中

在父元素上使用`display: flex;`和`justify-content: center;`实现子元素的水平居中。

```css
css.container {
  display: flex;
  justify-content: center;
}
```

#### 垂直居中

在父元素上使用`display: flex;`和`align-items: center;`实现子元素的垂直居中。

```css
css.container {
  display: flex;
  align-items: center;
}
```

**适用场景**：适用于需要在容器内部水平或垂直居中一个或多个元素的情况。Flexbox还支持响应式布局。

### Grid居中

使用CSS Grid布局，可以通过`display: grid;`和`place-items: center;`在两个方向上同时居中元素。

```css
css.container {
  display: grid;
  place-items: center;
}
```

**适用场景**：适用于需要在容器内部水平和垂直同时居中一个或多个元素的情况。Grid 布局提供了更为强大和灵活的布局控制。

### 绝对定位与负边距/Transform居中

通过设置父元素`position: relative;`，子元素`position: absolute;`和`top: 50%; left: 50%;`配合`transform: translate(-50%, -50%);`可以实现元素的完全居中。

```css
.container {
  position: relative;
}
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**适用场景**：适用于需要完全居中一个元素，且元素大小未知或动态变化的情况。

总结，CSS提供了多种方法实现元素的居中，选择哪种方法取决于具体的需求和场景。Flexbox和Grid布局因其灵活性和强大的布局能力，成为现代Web开发中推荐的居中方案。

## 为什么要做样式初始化？

因为**浏览器有默认样式**，而且不同浏览器默认样式不一样，为了让样式显示一致，要去掉这些默认样式。

常见的方案有：

1. `reset.css`：将所有元素的样式都设置为相同的初始值，以消除不同浏览器之间的差异。这种方式需要注意的是，一些元素的样式可能与开发者所期望的有所不同，因此需要进行特殊处理。
2. `Normalize.css`：只重置一部分元素的样式，而不是重置所有元素。这种方式可以避免一些样式上的问题，同时还可以保留一些元素的默认样式，提高代码的可维护性和可读性。

## 什么是BFC，有什么作用？

CSS中的BFC（Block Formatting Context，块级格式化上下文）是Web页面的可视CSS渲染的一部分，它决定了元素如何对其内容进行布局，以及与其他元素的关系和相互作用。

一个元素形成了BFC之后，那么它内部元素产生的布局不会影响到外部元素，外部元素的布局也不会影响到BFC中的内部元素。一个BFC就像是一个隔离区域，和其他区域互不影响。

BFC的作用主要包括以下几点：

1. **包含浮动元素（清除浮动）**：传统的布局问题之一是浮动元素不会影响其容器的高度，因为浮动元素脱离了文档流。通过创建BFC，可以使得容器包含其内部的浮动元素，从而解决高度塌陷问题。
2. **阻止外边距折叠**：在BFC中，块级元素的垂直外边距不会与其BFC内的兄弟元素发生折叠。这是因为BFC为这些元素提供了一个隔离的环境，使得它们的布局不会相互影响。
3. **防止文本环绕**：在BFC中，浮动元素不会影响到BFC内部的元素布局。这意味着，如果不希望文本环绕在浮动元素周围，可以通过创建BFC来避免这种情况。
4. **创建独立的布局环境**：BFC提供了一个独立的布局环境，其中的元素布局不会影响到外部元素。这对于实现某些布局效果非常有用，比如网页的侧边栏和内容区域的布局。

创建 BFC 的方法有多种，包括：

- 应用`overflow`属性（不是`visible`值）到一个块级元素上。
- 将元素设置为浮动（使用`float`属性，不是`none`）。
- 将元素设置为绝对定位（使用`position`属性为`absolute`或`fixed`）。
- 以及其他一些方法，如使用`display`属性的`inline-block`、`table-cell`、`table-caption`、`flex`、`grid`等值。

## 怎么做移动端适配？

常用的移动端适配方案有以下几种：

1. rem方案：淘宝的移动端适配方案，使用相对单位rem结合JS动态计算rem值来实现移动端适配，将页面在不同尺寸的屏幕小按照宽度等比例缩放。
2. vw方案：和rem方案原理类似，只是单位换成了vw。
3. px方案：rem和vw方案都是等比例缩放，但是对于一些对UI要求特别高的大厂项目，缩放的显示效果并不是最佳，这时候也可以和UI配合采取px绝对像素。
4. 媒体查询：对于一些具体的场景，可以根据不同设备的像素区间来针对性地编写样式，这时候就使用媒体查询。
5. 百分比布局：将元素的宽度和高度设置为百分比，使得页面可以根据不同的屏幕尺寸进行等比例缩放，这种方案和rem、vw原理类似，但是计算比较困难，而且百分比相对的元素不固定，容易使问题变得复杂。
6. 响应式布局：对于一些定制化程度要求不高，但是需要PC和移动两端共用一套代码的场景，可以使用一些响应式布局的样式库，比如Bootstrap和Tailwind。

我在项目里一般使用vw方案，结合自动化工具，如postcss-px-to-viewport和flexible.js进行自动的转换适配。然后对于一些特殊的场景，采用媒体查询作为辅助来实现。

## 移动端 1px 边框问题怎么解决？

由于不同的设备屏幕像素密度的不同，一些边框、线条等细节元素的显示可能会出现“1px问题”，即在某些设备上，本应该显示为1像素的边框或者线条，实际上却被放大成了2像素或者更多像素，导致显示效果不佳。

常见的解决方案：

1. 使用 border-image：使用border-image可以将图片作为边框来显示，避免了使用CSS边框样式时的1px问题。

2. 使用box-shadow：使用box-shadow代替边框，然后将边框设为透明，可以避免1px问题。

   ```css
   .border {
       box-shadow: 0 0 0 1px #ccc;
   }
   ```

3. border + transform：使用transform将边框缩小一半。

   ```css
   .border {
       border: 1px solid #ccc;
       transform: scaleY(0.5);
   }
   ```

4. 伪元素 + transform：与3类似，不同的是用伪元素来实现，在父元素上添加一个伪元素，然后给伪元素设置一个边框，并将其缩小为0.5倍。这样就可以实现1px的边框效果了。

   ```css
   .border:before{
       content: "";
       display: block;
       position: absolute;
       left: 0;
       top: 0;
       bottom: 0;
       right: 0;
       border: 1px solid #ccc;
       transform-origin: 0 0;
       transform: scaleY(0.5);
   }
   ```

5. 使用viewport单位：使用viewport相关的单位（如vw、vh、vmin和vmax）来设置边框或者线条的大小，可以让元素的大小自适应不同的设备像素密度。



## 怎么实现换肤？

### 使用CSS变量

可以定义一个`theme-color`变量来存储主题色：

```css
:root {
  --theme-color: #007bff; /* 定义主题色 */
}
```

然后在需要使用主题色的地方使用var()函数来引用这个变量：

```css
.button {
  background-color: var(--theme-color); /* 使用主题色 */
}
```

再通过JS动态更改这个CSS变量的值，从而实现换肤的效果：

```js
// 获取根元素（即:root）
const root = document.documentElement;

// 修改主题色变量的值
root.style.setProperty('--theme-color', '#ff0000');
```

### 使用 class 切换

通过添加或移除不同的class来改变元素的样式，从而实现换肤。比如，可以定义多个class来表示不同的主题样式：

```css
.theme-blue {
  /* 定义蓝色主题样式 */
  background-color: #007bff;
  color: #fff;
}

.theme-red {
  /* 定义红色主题样式 */
  background-color: #dc3545;
  color: #fff;
}
```

然后在需要换肤的元素上添加对应的 class：

```html
<button class="theme-blue">蓝色主题</button>
<button class="theme-red">红色主题</button>
```

最后再通过JS动态添加或移除这些class来改变元素的样式，来实现换肤的效果。



## 有没有了解过CSS命名规范？

常见的CSS命名规范有：BEM规范、SMACSS规范、OOCSS规范。

### BEM规范

BEM （Block, Element, Modifier）将CSS类名分为块、元素和修饰符三个部分，举个例子：

```html
<div class="block">
  <h2 class="block__title">标题</h2>
  <ul class="block__list">
    <li class="block__list-item">列表项1</li>
    <li class="block__list-item block__list-item--highlighted">列表项2</li>
  </ul>
</div>
```

其中block代表一个组件或UI部件，`block__title`和`block__list`代表块的子元素，`block__list-item`代表列表项。`block__list-item--highlighted`是一个修饰符，表示该列表项被突出显示。

### SMACSS规范

SMACSS ([Scalable and Modular Architecture for CSS](https://link.juejin.cn/?target=http%3A%2F%2Fsmacss.com%2F)) 不仅仅是命名规范，还包括CSS文件结构的组织规范。SMACSS主要是将样式分成五大类，分别是Base、Layout、Module、State、Theme。其中：

- Base类主要是基本样式规则，例如重置浏览器默认样式、设置全局的基本样式等。这些样式通常以选择器（标签选择器、通用选择器）为基础，并且适用于整个项目；
- Layout类用于创建页面布局和网格系统，它定义了页面的整体结构、栏目布局、容器和网格样式等；
- Module类用于定义可重复使用的模块样式；
- State类用于定义组件的状态样式，如`.btn`和`.btn-primary`的样式；
- Theme 类主要是主题相关的样式，如`.site-title`和`.module-title`的样式；

### OOCSS规范

OOCSS (Object-oriented CSS) 规范主要遵循结构（Structure）与外观（Skin）分离的原则：

```html
<div class="box box-red">你好</div>
<div class="box box-blue">OOCSS规范</div>
```

其中结构部分（可复用样式）用`.box`，外观部分（不同样式）用`.box-red`来命名。

### ACSS 规范

ACSS（Atomic CSS），原子化 CSS，它将样式属性分解成小的、可重用的单元（原子），每个原子只包含一个样式属性和它的值，以实现更高程度的样式复用和代码压缩。

ACSS 的核心理念是将样式属性分解成最小的可重用单元，然后根据需要组合这些单元来构建页面样式。

```css
.m-0 {
  margin: 0;
}
.text-red {
  color: red;
}
```

通常会使用成熟的CSS 框架，如 [Tailwind CSS](https://tailwindcss.com/) ， [UnoCSS](https://unocss.dev/) 等。

## 什么是CSS工程化？

CSS 工程化是指在开发和维护大型 Web 项目时，采用一系列规范化、模块化、自动化的工具和方法来提高 CSS 开发效率、代码可维护性和项目的整体质量。CSS 工程化的目标是通过规范化的工具链和工作流，解决 CSS 开发中的一些常见问题，例如命名冲突、样式复用、代码兼容性、性能优化等，从而提升项目的开发效率和质量。

CSS 工程化通常包括以下几个方面的内容：

1. **规范化：** 包括制定 CSS 编码规范、命名规范、组织规范等，统一团队的代码风格，降低团队成员之间的沟通成本。
2. **模块化：** 将 CSS 代码分割成多个模块，每个模块负责管理特定功能或样式，使用模块化的方式可以提高代码的可维护性和复用性。
3. **预处理器和后处理器：** 使用 CSS 预处理器（如 Sass、Less、Stylus 等）来编写更加灵活和可维护的 CSS 代码，通过变量、混合、嵌套、函数等功能来提高 CSS 开发效率。同时，还可以使用后处理器（如 PostCSS）来对生成的 CSS 进行优化、压缩、自动添加浏览器前缀等操作。
4. **模块打包和构建工具：** 使用模块打包工具（如 webpack、Parcel 等）来处理 CSS 文件之间的依赖关系、打包、压缩、代码分割等操作，提高项目的性能和加载速度。
5. **组件化：** 将页面拆分成多个组件，每个组件都有自己的 CSS 样式文件，通过组件化的方式来管理 CSS，降低样式的耦合性，提高代码的可维护性。
6. **代码检查和测试：** 使用 CSS 静态分析工具（如 Stylelint）对 CSS 代码进行规范检查，确保代码符合规范，同时可以编写单元测试和集成测试来验证 CSS 样式的正确性。

通过实施 CSS 工程化，可以有效地提高团队的协作效率、降低项目维护成本，同时提高项目的可扩展性和可维护性，是现代 Web 开发中不可或缺的一部分。