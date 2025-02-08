# 逻辑组合伪类 :not() :is() :where() :has()
## 否定伪类 :not()

`:not()` 伪类用于否定选择器，可以接受一个或多个选择器作为参数，如果元素不匹配参数中的任何一个选择器，则匹配该伪类，它也被称为反选伪类（negation pseudo-class）。

举个例子，HTML 结构如下：

```html
<div class="a">div.a</div>
<div class="b">div.b</div>
<div class="c">div.c</div>
<div class="d">div.d</div>
```

```css
div:not(.b) {
    color: red;
}
```

`div:not(.b)` 它可以选择除了 class 为 `.b` 元素之外的所有 div 元素：

![](not-example-1.png)

### :not 的范围问题

`:not()` 与后代组合器一起使用时，结果可能与预期不符。例如，`body :not(table) a` 仍然会应用于 `<table>` 内的链接，因为 `<tr>`、`<tbody>`、`<th>`、`<td>`、`<caption>` 等都可以匹配选择器的 `:not(table)` 部分。

为了避免这种情况，可以使用 `body a:not(table a)`，它只应用于不是 `table` 后代的链接。

同样的，对于可继承的样式属性，例如：
```css
:not(p) {
  color: blue;
}
```

`:not(p)` 即选择任何不是 `<p>` 标签的元素，但实测下列 html 是仍然能选中 p 元素的：

```html
<p>p</p>
<div>div</div>
<span>span</span>
<h1>h1</h1>
```

因为 `:not(p)` 同样能够选中 `<body>`，那么 `<body>` 的 color 即变成了 `blue`，由于 `color` 是一个可继承属性，`<p>` 标签继承了 `<body>` 的 color 属性，导致看到的 `<p>` 也是蓝色。
### :not 的优先级问题

`:not`、`:is`、`:where` 这几个伪类不像其它伪类，它不会增加选择器的优先级（即优先级为 0）。所以其优先级是它括号内表达式的参数选择器的优先级。

并且，在 [CSS Selectors Level 3](https://www.w3.org/TR/selectors-3/)，`:not()` 内只支持单个选择器，而从 [CSS Selectors Level 4](https://www.w3.org/TR/selectors-4/) 开始，`:not()` 内部支持多个选择器，像是这样：

```css
/* CSS Selectors Level 3，:not 内部如果有多个值需要分开 */
p:not(:first-of-type):not(.special) {
}
/* CSS Selectors Level 4 支持使用逗号分隔*/
p:not(:first-of-type, .special) {
}
```

### :not(\*) 问题

使用 `:not(*)` 将匹配任何非元素的元素，因此这个规则将永远不会被应用。相当于一段没有任何意义的代码。

### :not() 嵌套问题

禁止套娃，`:not` 伪类不允许嵌套，这意味着 `:not(:not(...))` 是无效的。

## 任意匹配伪类 :is()

2018 年 10 月底，`:matches ()` 伪类改名为 `:is()` 伪类 ([[selectors-4] Rename :matches() to :is() · Issue #3258 · w3c/csswg-drafts](https://github.com/w3c/csswg-drafts/issues/3258))，因为 `:is()` 的名称更简短，且其语义正好和 `:not()` 相反。

`:is()` 伪类函数将选择器列表作为参数，并选择该列表中任意一个选择器可以选择的元素。

在之前，对于多个不同父容器的同个子元素的一些共性样式设置，可能会出现如下 CSS 代码：

```css
header p:hover,
main p:hover,
footer p:hover {
  color: red;
  cursor: pointer;
}
```

而如今有了 `:is()` 伪类，上述代码可以改写成：

```css
:is(header, main, footer) p:hover {
  color: red;
  cursor: pointer;
}
```

### 支持多层层叠连用

```css
div span,
div i,
p span,
p i {
    color: red;
}
```

有了 `:is()` 后，代码可以简化为：

```css
:is(div, p) :is(span, i) {
    color: red;
}
```
### 不支持伪元素

不能用 `:is()` 来选取 `::before` 和 `::after` 两个伪元素，如：

> 注意，仅仅是不支持伪元素，伪类，如 `:focus`、`:hover` 是支持的。

```css
div p::before,
div p::after {
    content: "";
    //...
}
```

不能写成：

```css
div p:is(::before, ::after) {
    content: "";
    //...
}
```

### 优先级

看这样一种有意思的情况：

```html
<div>
    <p class="test-class" id="test-id">where & is test</p>
</div>
<div>
    <p class="test-class">where & is test</p>
</div>
```

我们给带有 `.test-class` 的元素，设置一个默认的颜色：

```css
div .test-class {
    color: red;
}
```

如果，这个时候，我们引入 `:is()` 进行匹配：

```css
div :is(p) {
    color: blue;
}
```

此时，由于 `div :is(p)` 可以看成 `div p`，优先级是没有 `div .test-class` 高的，因此，被选中的文本的颜色是不会发生变化的。

但是，如果，我们在 `:is()` 选择器中，加上一个 `#test-id`，情况就不一样了。

```css
div :is(p, #text-id) {
    color: blue;
}
```

按照理解，如果把上述选择器拆分，上述代码可以拆分成：

```css
div p {
    color: blue;
}
div #text-id {
    color: blue;
}
```

那么，我们有理由猜想，带有 `#text-id` 的 `<p>` 元素由于有了更高优先级的选择器，颜色将会变成 `blue`，而另外一个 `div p` 由于优先级不够高的问题，导致第一段文本依旧是 `green`。

但是，这里，神奇的是，两段文本都变成了 `blue`，这是由于，`:is()` 的优先级是由它的选择器列表中优先级最高的选择器决定的。我们不能把它们割裂开来看。

对于 `div :is(p, #text-id)`，`is:()` 内部有一个 id 选择器，因此，被该条规则匹配中的元素，全部都会应用 `div #id` 这一级别的选择器优先级。

对于 `:is()` 选择器的优先级，我们不能把它们割裂开来看，它们是一个整体，优先级取决于**选择器列表中优先级最高的选择器**。


## 任意匹配伪类 :where()

从语法上，`:is` 和 `:where` 是一模一样的。它们的核心区别点在于 **优先级**。

`:where()` 的优先级**总是为 0** ，但是 `:is()` 的优先级是由它的选择器列表中优先级最高的选择器决定的。

```html
<div id="container">
    <p>where & is test</p>
</div>
```

```css
:is(div) p {
    color: red;
}
:where(#container) p {
    color: green;
}
```

由于 `:where(#container)` 的优先级为 0，因此文字的颜色为红色 red。

## 关联伪类 :has()

`:has` 伪类接受一个选择器组作为参数，该参数相对于该元素的 [:scope](https://developer.mozilla.org/zh-CN/docs/Web/CSS/:scope) 至少匹配一个元素。

```html
<div>
    <p>div -- p</p>
</div>
<div>
    <p class="g-test-has">div -- p.has</p>
</div>
<div>
    <p>div -- p</p>
</div>
```

```css
div:has(.g-test-has) {
    border: 1px solid #000;
} 
```

我们通过 `div:has(.g-test-has)` 选择器，意思是，选择 div 下存在 class 为 `.g-test-has` 的 div 元素。

注意，这里选择的不是 `:has()` 内包裹的选择器选中的元素，**而是使用 `:has()` 伪类的宿主元素**。

只有第二个 div 下存在 class 为 `.g-test-has` 的元素，因此第二个 div 被加上了 border。

### 嵌套结构的父元素选择

```html
<div>
    <span>div span</span>
</div>

<div>
    <ul>
        <li>
            <h2><span>div ul li h2 span</span></h2>
        </li>
    </ul>
</div>

<div>
    <h2><span>div h2 span</span></h2>
</div>
```

```css
div:has(>h2>span) {
    margin-left: 24px;
    border: 1px solid #000;
}
```

这里要求准确选择 div 下直接子元素是 h2，且 h2 下直接子元素有 span 的 div 元素。注意，选择的是最上层使用`:has()` 的父元素 div 。

### 同级结构的兄元素选择

```html
<div class="has-test">div + p</div>
<p>p</p>

<div class="has-test">div + h1</div>
<h1>h1</h1>

<div class="has-test">div + h2</div>
<h2>h2</h2>

<div class="has-test">div + ul</div>
<ul>ul</ul>
```

想找到兄弟层级关系中，后面接了 `<h2>` 元素的 `.has-test` 元素，可以这样写：

```css
.has-test:has(+ h2) {
    margin-left: 24px;
    border: 1px solid #000;
}
```