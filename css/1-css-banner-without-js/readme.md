## CSS 实现轮播效果，根本不需要 JS

> 原文链接：[文字轮播与图片轮播？CSS 不在话下 · Issue #184 · chokcoco/iCSS (github.com)](https://github.com/chokcoco/iCSS/issues/184)

实现原理： **巧用逐帧动画，配合补间动画实现一个无限循环的轮播效果**

难点：

1. 这是个无限轮播的效果，动画需要支持任意多个元素的无限轮播切换；
2. 因为是轮播，所以，运行到最后一个的时候，需要动画切到第一个元素；

```html
<div class="g-container">
  <ul>
    <li>Lorem ipsum 1111111</li>
    <li>Lorem ipsum 2222222</li>
    <li>Lorem ipsum 3333333</li>
    <li>Lorem ipsum 4444444</li>
    <li>Lorem ipsum 5555555</li>
    <li>Lorem ipsum 6666666</li>
  </ul>
</div>
```

### 逐帧动画控制整体切换

逐帧动画效果，也被称为**步骤缓动函数**，即`animation-timing-function`：

```css
:root {
  // 轮播的个数
  --s: 6;
  // 单个 li 容器的高度
  --h: 36;
  // 单次动画的时长
  --speed: 1.5s;
}
.g-container {
  width: 300px;
  height: calc(var(--h) * 1px);
  line-height: calc(var(--h) * 1px);
}
ul {
  display: flex;
  flex-direction: column;
  animation: move calc(var(--speed) * var(--s)) steps(var(--s)) infinite;
}
ul li {
  width: 100%;
}
@keyframes move {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(0, calc(var(--s) * var(--h) * -1px));
  }
}
```

在上述的`move`动画中，

1. `calc(var(--speed) * var(--s))`：单次动画的耗时 * 轮播的个数，也就是**总动画时长**
2. `steps(var(--s))` 就是逐帧动画的**帧数**，这里也就是 `steps(6)`，很好理解
3. `calc(var(--s) * var(--h) * -1px))` 单个 li 容器的高度 * 轮播的个数，其实就是 ul 的总体高度，用于设置逐帧动画的终点值

最后，给容器添加`overflow: hidden`即有了基本的效果。

### 利用补间动画实现两组数据间的切换

利用补间动画，实现动态的切换效果，就是将一组数据，利用 `transform`，从状态 A 位移到状态 B；

```css
ul li {
  width: 100%;
  animation: liMove calc(var(--speed)) infinite;
}

@keyframes liMove {
  0% {
    transform: translate(0, 0);
  }
  80%,
  100%  {
    transform: translate(0, calc(var(--h) * -1px));
  }
}
```

### 末尾填充头部第一组数据

有一点瑕疵，可以看到，最后一组数据，是从第六组数据 transform 移动向了一组空数据；

实际开发过轮播的同学肯定知道，这里，其实也很好处理，我们只需要在末尾，补一组头部的第一个数据即可；

### 横向轮播和图片轮播

类似；

### 总结

1. 利用 **逐帧动画**，实现整体的轮播的循环效果
2. 利用 **补间动画**，实现具体的 **状态A* 向 **状态B** 的动画效果
3. **逐帧动画** 配合 **补间动画** 构成整体轮播的效果
4. 通过向 HTML 结构末尾补充一组头部数据，实现整体动画的衔接
5. 通过 HTML 元素的 style 标签，利用 CSS 变量，填入实际的参与循环的 DOM 个数，可以实现 JavaScript 与 CSS 的打通