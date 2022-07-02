## 利用 filter: blur() 及 transform: sacle() 获取图片主题色

> [小技巧！CSS 提取图片主题色功能探索 · Issue #114 · chokcoco/iCSS (github.com)](https://github.com/chokcoco/iCSS/issues/114)

利用模糊滤镜以及放大效果，可以近似的拿到图片的主题色。例如，一张这样一张图片：

![img](https://user-images.githubusercontent.com/8554143/116405419-34247d00-a862-11eb-8053-4b2e90f673bb.png)

利用模糊滤镜作用给图片：

```css
div {
    background: url("https://i0.wp.com/airlinkalaska.com/wp-content/uploads//aurora-2.jpg?resize=1024%2C683&ssl=1");
    background-size: cover;
    filter: blur(50px);
}
```

看看效果，我们通过比较大的一个模糊滤镜，将图片 blur(50px)，模糊之后的图片有点那感觉了，不过存在一些模糊边缘，尝试利用 overflow 进行裁剪。

接下来，我们需要去掉模糊的边边，以及通过 `transform: scale()` 放大效果，将颜色再聚焦下，稍微改造下代码：

```css
div {
    position: relative;
    width: 320px;
    height: 200px;
    overflow: hidden;
}

div::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("https://i0.wp.com/airlinkalaska.com/wp-content/uploads//aurora-2.jpg?resize=1024%2C683&ssl=1");
    background-size: cover;
    // 核心代码：
    filter: blur(50px);
    transform: scale(3);
}
```

这样，我们就利用 CSS，拿到了图片的主色调，并且效果还是不错的！

当然，该方案也是存在一定的小问题的：

1. 只能是大致拿到图片的主色调，**无法非常精确**，并且 `filter: blur(50px)` 这个 `50px` 需要进行一定的调试
2. 模糊滤镜本身是**比较消耗性能**的，如果一个页面存在多个这种方法获取到的背景，可能对性能会造成一定的影响，实际使用的时候需要进行一定的取舍