# Web 字体渲染之 line-height

Web 文字排印中的另一个重要参数是 `line-height`，中文译作行高，它用来调整多行文本中行与行之间的距离，通常也被称为 _leading_。在金属活字排印时代，行高是由插入到两行之间的不同高度的铅条决定的，_leading_ 这一名称正是由此而来。

不同的排版引擎对行高的处理细节各不相同，这些细节包括空白被添加到一行之上还是一行之下、首行之前及尾行之后是否添加空白等等。CSS 对行距的处理比较简单：将行距平分为两半（称为 _half-leading_），一半添加到一行之前，一半添加到一行之后，首行及尾行不做特殊处理。

虽然 `line-height` 的定义很简单，但在实际使用中还是有很多问题需要注意。

## 块级元素的 line-height 与行内元素的 line-height

`line-height` 属性可以用于块级元素或行内元素。一个块级元素可以包含多个行内元素，如果行内元素拥有不同的行高，块级元素的行高如何计算呢？这就涉及到 IFC（Inline formatting context，行内格式化上下文）。

在一个 IFC 中，每一行会根据其内容计算自身的高度，我们可以简单的认为某一行的行高是由这一行所容纳内元素中行高最高的那个决定的。例如：

```html
<style>
  #hello {
    line-height: 20px;
  }
  #world {
    line-height: 40px;
  }
</style>

<p><span>Hello</span> <span>world</span></p>
```

会得到一个 40px 高的段落：

![](inline-element-line-height.png)

若在块级元素上设置 `line-height`，则表示块级元素中每行的行高最小值。比如上面的例子中，如果设置为 `p` 元素添加样式 `line-height: 50px`，那么段落的高度则是 50px，而如果设置 `line-height: 30px`，段落的高度仍会维持 40px。

## `line-height: 1;` 可以完美裁切文字上下边缘空白吗？

在某些布局场景下，为了实现文字边缘与图片等其他元素对齐，我们往往会将 `line-height` 设置为 `1`。不难理解，这时我们希望行高等于文字高度，文字上下边缘都不要有额外的空白。不过很遗憾，这样设置并不能实现预期的效果，反而会造成文字渲染问题。

[[font-size |上文]]中提到，文字实际渲染的高度与 `font-size` 属性的值并不相同。而倍数行高的计算基准是 `font-size` 的值而不是文字实际渲染高。（在 Web 场景这样的设计是符合逻辑的，字体作为外部资源可能无法在排版时加载完成，因此无法相对于文字的实际高度计算行高。）这就导致设置单倍行高时，文字的实际渲染高度有可能超出行高被裁切，也有可能不足行高引入额外的空白。

如下图，单倍行高下文字实际渲染的高度会溢出：

![](line-height-1.png)

由于可能导致文字溢出或多行文本渲染重叠，所以**不建议在任何情况下设置 `line-height: 1`**。至于上面提到的布局需求，目前确实没有完美的解决方案，不过在提案阶段的 [`text-box-trim` 属性](https://github.com/jantimon/text-box-trim-examples)就是为了解决这个问题提出的，可以期待浏览器实现。

## 1.5、1.5em 与 150% 究竟该使用哪个？

`line-height` 的属性值可以是无单位数字（如 `1.5`）、有单位数字（如 `20px` 或 `1.5em`）或百分比（如 `150%`）。它们三者都可以根据当前字体定义行高，但却并不等价，三者的区别发生在样式继承的场景。具体来说，无单位数字会继承声明值，而 `em` 和百分比~~指~~值则会继承计算值（后代元素继承）。考虑以下代码：

```html
<style>
  div {
    overflow: hidden;
    font-size: 12px;
  }

  #parent-1 {
    line-height: 1.5;
  }

  #parent-2 {
    line-height: 1.5em;
  }

  #parent-3 {
    line-height: 150%;
  }

  p {
    margin: 0;
    font-size: 48px;
  }
</style>

<div id="parent-1"><p>Hello</p></div>
<div id="parent-2"><p>Hello</p></div>
<div id="parent-3"><p>Hello</p></div>
```

我们只针对 `div` 元素声明了 `line-height` 属性，而 `p` 元素则会从 `div` 继承 `line-height`。在这个过程中，无单位数字形式直接继承声明值，即 `line-height` 继承得到 `1.5`；而有单位数字和百分比两种形式则会继承计算值，`div` 元素的 `line-height` 计算为 12px * 1.5 = 18px，因此 `parent-2` 和 `parent-3` 中的 `p` 元素最终继承得到的 `line-height` 为 18px。在浏览器中的实际效果如下：

![](inherit-difference.png)

因此，在实际开发中**建议始终使用无单位数字形式定义 `line-height`**。