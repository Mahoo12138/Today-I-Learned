## 说说你对盒子模型的理解?

当对一个文档进行布局（layout）的时候，浏览器的渲染引擎会根据标准之一的 CSS 基础框盒模型（CSS basic box model），将所有元素表示为一个个矩形的盒子（box）。

一个盒子由四个部分组成：`content`、`padding`、`border`、`margin`：

![css-box-model](assets/css-box-model.png)

+ `content`，即实际内容，显示文本和图像

+ `boreder`，即边框，围绕元素内容的内边距的一条或多条线，由粗细、样式、颜色三部分组成

+ `padding`，即内边距，清除内容周围的区域，内边距是透明的，取值不能为负，受盒子的`background`属性影响

+ `margin`，即外边距，在元素外创建额外的空白，空白通常指不能放其他元素的区域

上述是一个从二维的角度观察盒子，下面再看看看三维图：

![css-box-model-hierarchy](assets/css-box-model-hierarchy.png)

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

同样看看 IE 怪异盒子模型的模型图：

![ie-css-box-model](assets/ie-css-box-model.png)

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

- content-box 默认值，元素的 width/height 不包含 padding，border，与标准盒子模型表现一致；
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