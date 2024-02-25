#### linear-gradient 线性渐变

线性渐变由一个轴 (梯度线) 定义，其上的每个点具有两种或多种的颜色，且轴上的每个点都具有独立的颜色。

渐变线由包含渐变图形的容器的中心点和一个角度来定义的，默认 0 度为竖轴，顺时针旋转；

渐变线上的颜色值是由不同的点来定义，包括起始点，终点，以及两者之间的可选的中间点（中间点可以有多个）；

默认情况下，从一个颜色的终止点平滑的过渡到另一个颜色的终止点，颜色之间的中点是两个颜色颜色转换的中点；

可以将中点移动到这两个颜色之间的任意位置，方法是在两个颜色之间未添加颜色标记的 %，以指示颜色的中转位置；

颜色终止列表中颜色的**终止点应该是依次递增的**。如果后面的颜色终止点小于前面颜色的终止点，则**后面的会被覆盖，从而创建一个硬转换**。

允许多个包含颜色终止位置。通过在 CSS 声明中包含两个位置，可以将一个颜色声明为两个相邻的颜色终止。

```css
.demo {
    /* 渐变轴为45度，从蓝色渐变到红色 */
    background: linear-gradient(45deg, blue, red);
}
.demo {
    /* 从右下到左上、从蓝色渐变到红色 */
    background: linear-gradient(to left top, blue, red);
  }
.demo{
    background: repeating-linear-gradient(45deg, blue, red);
}
```

#### radial-gradient 径向渐变

径向渐变 (Radial gradients) 由其*中心点*、*边缘形状*轮廓、*两个或多个色值结束点（color stops）*定义而成。  

在不指定渐变类型以及位置的情况下，其渐变距离和位置是由容器的尺寸决定的；若指定渐变的形状是一个圆形，形状不受外部容器尺寸影响，可以使用`circle`关键字；

当渐变的 `<ending-shape>` 被指定为`circle`时，可以为其指定渐变范围的大小（即渐变圆形的半径）：

```css
.demo {
    background: radial-gradient(50px circle, yellow, red);
}
```

如果没有指定`circle`关键字，那么渐变的范围可有四个关键字指定：

+ `closest-side`    渐变中心距离容器最近的边作为终止位置；
+  `closest-corner`：渐变中心距离容器最近的角作为终止位置；
+  `farthest-side` ：渐变中心距离容器最远的边作为终止位置；
+ `farthest-corner`： 渐变中心距离容器最远的角作为终止位置；

起始点位置可以通过`at`来指定，例如：

```css
.demo{
    background: radial-gradient(circle at 50px 50px, yellow, red);
}
.demo{   
    background: radial-gradient(circle at top, yellow, red);
}
```

如果指定多个颜色，但未指定具体断点的位置，则这些颜色会**均匀分配** 0%~100% 的渐变区域：

```css
.demo {
    background: radial-gradient(circle, yellow, red,green, orange);
}
```

除了`circle`关键字，还有椭圆 `ellipse`，区别在于，椭圆需要指定横轴和纵轴，而不是一个半径了；

且在指定颜色的终止点和中间点时，指定的长度则是以横轴为基准的：

```css
.demo {
    background: radial-gradient(50px 30px ellipse, yellow 10px,30px, black);
}
/* 二者效果一致 */
.demo {
    background: radial-gradient(50px 30px ellipse, yellow 20%,60%, black);
}
```

可以把多个径向渐变累加在一起实现某些效果，配合`background-size`的尺寸控制和背景重复特性，还可以实现渐变式的复杂纹理效果，例如：

```css
.demo{
    background: 
        radial-gradient(25% 25% at 25% 25%,red 80%,#0000 81%),
        radial-gradient(25% 25% at 75% 75%,red 80%,#0000 81%);
}
.demo{
    background: 
        radial-gradient(10px circle at 25% 25%,red 80%,#0000 81%),
        radial-gradient(10px 10px at 75% 75%,red 80%,#0000 81%);
    background-size: 35px 35px;
}
```

`repeating-radial-gradient()`会在所有方向上重复颜色，以覆盖整个容器：

```css
.demo{
    background-image: repeating-radial-gradient(#0000 0% 12%,#c39f76 13% 26% );
}
.demo{
    background-image: repeating-radial-gradient(#0000 0% 12%,#c39f76 13% 26% );
    background-size:20px 20px;
}
```

#### conic-gradient 角向渐变

锥形渐变定义一个围绕一个中心点旋转颜色渐变图像；

```css
.demo {
    background: conic-gradient(deeppink, yellowgreen);
}
```

- `linear-gradient` 线性渐变的方向是一条直线，可以是任何角度
- `radial-gradient`径向渐变是从圆心点以椭圆形状向外扩散
- 而`conic-gradient`是以图形中心为**起始点**，然后以**顺时针方向**绕中心实现渐变效果；

实现一个取色板：

```
{
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: conic-gradient(red, orange, yellow, green, teal, blue, purple);
}
```

但这样处理，一是颜色不够丰富不够明亮，二是起始处与结尾处衔接不够自然：

> `hsl()` 被定义为色相-饱和度-明度（Hue-saturation-lightness）

- 色相（H）是色彩的基本属性，就是平常所说的颜色名称，如红色、黄色等。
- 饱和度（S）是指色彩的纯度，越高色彩越纯，低则逐渐变灰，取0-100%的数值。
- 明度（V），亮度（L），取0-100%。

```scss
$colors: ();
$totalStops:20;

@for $i from 0 through $totalStops{
    $colors: append($colors, hsl($i *(360deg/$totalStops), 100%, 50%), comma);
}

.colors {
    width: 200px;
    height: 200px;
    background: conic-gradient($colors);
    border-radius: 50%;
}
```

我们可以更加具体的指定角向渐变每一段的比例，**配合百分比**，可以很轻松的实现饼图。

假设我们有如下 CSS：

```css
{
    width: 200px;
    height: 200px;
    background: conic-gradient(deeppink 0, deeppink 30%, yellowgreen 30%, yellowgreen 70%, teal 70%, teal 100%);
    border-radius: 50%;
}
```

当然，上面只是百分比的第一种写法，还有另一种写法也能实现：

```
{
    background: conic-gradient(deeppink 0 30%, yellowgreen 0 70%, teal 0 100%);
}
```

这里表示 ：

1. 0-30% 的区间使用 `deeppink`
2. 0-70% 的区间使用 `yellowgreen`
3. 0-100% 的区间使用 `teal`

而且，先定义的颜色的层叠在后定义的颜色之上。

使用了百分比控制了区间，再配合使用 `background-size` 就可以实现各种贴图啦。

我们首先实现一个基础角向渐变图形如下：

```css
background: conic-gradient(#000 12.5%, #fff 0 37.5%, #000 0 62.5%, #fff 0 87.5%, #000 0);
```

与线性渐变及径向渐变一样，角向渐变也是存在重复角向渐变 `repaet-conic-gradient` 的。

我们假设希望不断重复的片段是 0~30° 的一个片段，它的 CSS 代码是 `conic-gradient(deeppink 0 15deg, yellowgreen 0 30deg)` ：

```css
background: repeating-conic-gradient(deeppink 0 15deg, yellowgreen 0 30deg);
```
