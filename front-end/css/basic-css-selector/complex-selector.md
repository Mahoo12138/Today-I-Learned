## 复杂选择器

### 五花八门的伪类叠加

在单个选择器中，叠加各种伪元素，例如：

```css
a:not(main *:not(:is(h2, h3) > *)) {
    color: red;
}
```

其中混入了比较新的两个伪类选择器：

- `:not()`：用来匹配不符合一组选择器的元素。由于它的作用是**防止特定的元素被选中**，它也被称为*反选伪类*（negation pseudo-class）
- `:is()`：将选择器列表作为参数，并选择该列表中任意一个选择器可以选择的元素。

对于它的拆解：

1. `a:not(main *)`：选择不是 `<main>` 标签下的所有 a 标签
2. `main *:not(:is(h2, h3) > *)`：选择 `<main>` 标签下所有不是 `<h2>`、`<h3>` 子元素的元素

> + `>` 组合器选择前一个元素的直接子代的节点；
> + `~` 组合器选择兄弟元素，即后一个节点在前一个节点后面的任意位置，并且共享同一个父节点；
> + `+` 组合器选择相邻元素，即后一个元素紧跟在前一个之后，并且共享同一个父节点；
> + ` `(Space)组合器选择前一个元素的后代节点，即前一个节点内的任意位置的后一个节点；

所以合起来就是：选择所有不是 `<main>` 标签下的 `<a>` 标签以及所有 `<main>` 下面不是 `<h2>`、`<h3>` 下的子 `<a>` 以外的所有 `<a>` 标签。

若有以下 html 代码：

```html
<main>
    <a href="">1. main>a</a>
    <h1><a href="">2. main>h1>a</a></h1>
    <h2><a href="">3. main>h2>a</a></h2>
    <h2><p><a href="">4. main>h2>p>a</a></p></h2>
    <h3><a href="">5. main>h3>a</a></h3>
</main>
<h1><a href="">6. h1>a</a></h1>
<h2><a href="">7. h2>a</a></h2>
<h3><a href="">8. h3>a</a></h3>
<a href="">9. a</a>
```

那么只有 1，2，4 项没被选中，其余呈现红色；

### 神奇的特殊字符

```css
#\~\!\@\$\%\^\&\*\(\)\_\+-\=\,\.\/\'\;\:\?\>\<\\\[\]\{\}\|\`\# {
    color: red;
}
```

它还真能生效，CSS 中的 CSS 类名中允许使用除 `NUL` 之外的任何字符，

> 感兴趣可以看看这个：[Which characters are valid in CSS class names/selectors?](https://stackoverflow.com/questions/448981/which-characters-are-valid-in-css-class-names-selectors/449000#449000)

所以，上述的选择器，是可以匹配这样的标签的：

```
<div id="~!@$%^&*()_+-=,./';:?><\[]{}|`#">Lorem</div>
```

那么可以有如下牛啤的操作：

```html
<style>
#💉💧🐂🍺 {
    padding: 10px;
    color: red;
}
</style>

<div id="💉💧🐂🍺">真滴牛啤</div>
```

### 自身的多重重叠

```css
div.g-text-color.g-text-color.g-text-color.g-text-color.g-text-color {
    color: red;
}
```

这类选择器大部分情况是为了提升优先级；例如，引入了组件库后，使用了其中一个按钮，但想改变其中的某些样式。给它加了一个类名，在对应类名新增了覆盖样式后发现没有生效。

**原因就在于定义样式的选择器优先级不够高**；

此时就可以通过自己叠加自己的方式，提升选择器的权重。

`div.g-text-color.g-text-color.g-text-color` 的权重，就会比 `div.g-text-color.g-text-color` 更高。所以某些极端情况下，就出现了上述的选择器。