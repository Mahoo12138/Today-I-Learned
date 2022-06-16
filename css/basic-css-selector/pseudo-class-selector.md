## 几个特殊且实用的伪类选择器

以下是 4 个基本的结构性伪类选择器，结构性伪类选择器的共同特征是允许开发者根据文档树中的结构来指定元素的样式；

### `:root` 伪类

`:root` 伪类匹配文档树的根元素。应用到HTML，`:root` 即表示为`<html>`元素，除了优先级更高外，相当于html标签选择器：

```css
:root { 样式属性 }
```

由于属于 CSS3 新增的伪类，所以也可以作为一种 HACK 元素，只对 IE9+ 生效；声明全局 CSS 自定义属性时 `:root` 很有用。

### `:empty` 伪类

`:empty` 伪类，代表没有子元素的元素；

这里说的子元素，只计算元素结点及文本（包括空格），注释、运行指令不考虑在内。

```css
div{
  height:20px;
  background:#ffcc00;
}
div:empty{
  display:none;
}

<div>1</div>
<div> </div>
<div></div>
```

如上述的例子，第三个 `div`会被隐藏；

### `:not` 伪类

CSS 否定伪类，`:not(X)`，可以选择除某个元素之外的所有元素；X 中**不能包含另外一个否定选择器**；

- `:not` 伪类不像其它伪类，它不会增加选择器的优先级。它的优先级即为它参数选择器的优先级。

  > 伪类选择的权重与类选择器（class selectors，例如 `.example`），属性选择器（attributes selectors，例如 `[type="radio"]`）的权重相同；
  >
  >  `:not()`是个特例：其在优先级计算中不会被看作是伪类，但是在计算选择器数量时还是会把其中的选择器当做普通选择器进行计数；

- 提高规则的优先级；例如， `#foo:not(#bar)` 和 `#foo` 会匹配相同的元素，但是前者优先级更高；

- 使用 `:not(*)` 将匹配任何非元素的元素，因此这个规则将永远不会被应用；

- 这个选择器只会应用在一个元素上，无法用它来排除所有父元素。比如， `body :not(table) a` 依旧会应用到 table 内部的 a 上，因为 将会被 `:not(table)` 这部分选择器匹配。

### `:target` 伪类

`:target` 代表一个特殊的元素，指定那些包含片段标识符的 URI 的目标元素；

URL 末尾带有锚名称 **#**，就可以指向文档内某个具体的元素。这个被链接的元素就是目标元素(target element)。它需要一个 id 去匹配文档中的 target ；

`:target` 选择器的出现，让 CSS 也能够接受到用户的点击事件，并进行反馈。（另一个可以接收点击事件的 CSS 选择器是 `:checked`）。

```html
<style>
  :target {
    font-size: 60px;
  }
  h1:target{
    color: red;
  }
</style>

<body>
  <h1 id="one">First</h1>
  <h2 id="two">Second</h2>
  <h3 id="three">Third</h3>

  <a href="#one">First</a>
  <a href="#two">Second</a>
  <a href="#three">Third</a>
</body>
```

如上面的例子中，点击每一个链接都会激活一个锚点，锚点绑定的元素字体大小将会变为 60px；而当 id 为 `#one`的 h1 元素活动时，字体还会变成红色；