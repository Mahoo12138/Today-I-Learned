## CSS 实现奇形怪状按钮

### 矩形与圆角按钮

实现简单，宽高和圆角和背景色：

```html
<div class='btn rect'>rect</div>
<div class='btn circle'>circle</div>
```

```css
.btn {
    margin: 8px auto;
    flex-shrink: 0;
    width: 160px;
    height: 64px;
}
.rect {
    background: #f6ed8d;
}

.circle {
    border-radius: 64px;
    background: #7de3c8;
}
```

### 梯形与平行四边形

基于矩形的变形，经常会出现**梯形与平行四边形**的按钮，实现它们主要使用 `transform` 即可；

但是要注意一点，使用了 `transform` 之后，标签内的文字也会同样的变形；

所以，**通常使用元素的伪元素去实现造型**，这样可以做到不影响按钮内的文字。

#### 平行四边形

使用 `transform: skewX()` 即可，注意上述说的，利用元素的伪元素实现平行四边形，做到不影响内部的文字，并且设置伪元素层级为负，防止遮挡文字：

```html
<div class='btn parallelogram'>Parallelogram</div>
```

```css
.parallelogram {
    position: relative;
    width: 160px;
    height: 64px;
}

.parallelogram::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: -1;
    background: #03f463;
    transform: skewX(10deg);
}
```

除了使用伪元素还可以使用平行四边形渐变：

```css
.parallelogram{
    background: linear-gradient(80deg, transparent 12%, 
        #04e6fb 12%, #3f3dcf 30%, #bd73e2 90%, transparent 0);
}
```

#### 梯形

梯形比平行四边形稍微复杂一点，它多借助了 `perspective`，其实是利用了一定的 **3D 变换**。

原理就是一个矩形，绕着 X 轴旋转，使用 `perspective` 和 `transform: rotateX()` 即可：

```html
<div class='btn trapezoid'>Trapezoid</div>
```

```css
.trapezoid {
    position: relative;
    width: 160px;
    height: 64px;

    &::after {
        content:"";
        position: absolute;
        z-index: -1;
        top: 0; right: 0; bottom: 0; left: 0;
        transform: perspective(40px) rotateX(10deg);
        transform-origin: bottom;
        background: #ff9800;
    }
}
```

>  **`perspective`**指定了观察者与 z=0 平面的距离，使具有三维位置变换的元素产生透视效果。z>0 的三维元素比正常大，而 z<0 时则比正常小，大小程度由该属性的值决定。

### 切角 -- 纯色背景与渐变色背景

切角图形，最常见的方法主要是借助渐变 `linear-gradient` 实现，来看这样一个图形：

```html
<div id=“notching-demo”></div>
```

```css
#notching-demo {
    background: linear-gradient(45deg,  #ff1493 20px,transparent 20px,#1a2d98);
    background-repeat: no-repeat;
}
```

基于此，我们只需要利用多重渐变，实现 4 个这样的图形即可，并且，利用 `background-position` 定位到四个角：

```html
<div class="notching">notching</div>
```

```css
.notching {
    background: 
        linear-gradient(135deg, transparent 10px, #ff1493 0) top left,
        linear-gradient(-135deg, transparent 10px, #ff1493 0) top right,
        linear-gradient(-45deg, transparent 10px, #ff1493 0) bottom right,
        linear-gradient(45deg, transparent 10px, #ff1493 0) bottom left;
    background-size: 50% 50%;
    background-repeat: no-repeat;
}
```

### clip-path 实现渐变背景的切角图形

使用渐变技巧制作切角时，若要求底色是渐变色的时候，这个方法就比较笨拙了；

好在，我们还有另外一种方式，借助 `clip-path` 切出一个切角图形，这样，背景色可以是任意定制的颜色，无论是渐变还是纯色都不在话下：

```html
<div class="clip-notching">notching</div>
```

```css
.clip-notching {
    background: linear-gradient(
        45deg,
        #f9d9e7,
        #ff1493
    );
    clip-path: polygon(
        15px 0,
        calc(100% - 15px) 0,
        100% 15px,
        100% calc(100% - 15px),
        calc(100% - 15px) 100%,
        15px 100%,
        0 calc(100% - 15px),
        0 15px
    );
}
```

简单的实现一个渐变背景，接着核心就是，在渐变矩形图形的基础上，利用 `clip-path: polygon()` 切出我们想要的形状（一个 8 边形）；

### 箭头按钮

我们可以利用两重渐变，实现一个单箭头按钮：

```html
<div class="arrow">arrow</div>
```

```css
arrow {
    background: linear-gradient(
        -135deg,
        transparent 22px,
        #04e6fb 22px,
        #65ff9a 100%
    )
        top right,
        linear-gradient(
            -45deg,
            transparent 22px,
            #04e6fb 22px,
            #65ff9a 100%
        )
        bottom right;
    background-size: 100% 50%;
    background-repeat: no-repeat;
}
```

稍微复杂一点的燕尾箭头，也可以是两个渐变的叠加，渐变的颜色是**透明 --> 颜色A --> 颜色B --> 透明**。简便点，可以使用`clip-path`实现：

```css
{
    background: linear-gradient(45deg, #04e6fb, #65ff9a);
    clip-path: polygon(
        0 0,
        30px 50%,
        0 100%,
        calc(100% - 30px) 100%,
        100% 50%,
        calc(100% - 30px) 0
    );
}
```

### 内切圆角

多出现于优惠券，最常见的解法，也是使用渐变，当然，与切角不同，这里使用的径向渐变：

```css
inset-circle {
    background-size: 70% 70%;
    background-image: radial-gradient(
            circle at 100% 100%,
            transparent 0,
            transparent 12px,
            #2179f5 13px
        ),
        radial-gradient(
            circle at 0 0,
            transparent 0,
            transparent 12px,
            #2179f5 13px
        ),
        radial-gradient(
            circle at 100% 0,
            transparent 0,
            transparent 12px,
            #2179f5 13px
        ),
        radial-gradient(
            circle at 0 100%,
            transparent 0,
            transparent 12px,
            #2179f5 13px
        );
    background-repeat: no-repeat;
    background-position: right bottom, left top, right top, left bottom;
}
```

### 渐变的内切圆角

如果背景色要求渐变怎么办呢？

假设我们有一张矩形背景图案，我们只需要使用 `mask` 实现一层遮罩，利用 `mask` 的特性，把 4 个角给遮住即可。

`mask` 的代码和上述的圆角切角代码非常类似，简单改造下即可得到渐变的内切圆角按钮：

```html
<div class="mask-inset-circle">inset-circle</div>
```

```css
.mask-inset-circle {
    background: linear-gradient(45deg, #2179f5, #e91e63);
    mask: radial-gradient(
        circle at 100% 100%,
        transparent 0,
        transparent 12px,
        #2179f5 13px
    ),
        radial-gradient(
            circle at 0 0,
            transparent 0,
            transparent 12px,
            #2179f5 13px
        ),
        radial-gradient(
            circle at 100% 0,
            transparent 0,
            transparent 12px,
            #2179f5 13px
        ),
        radial-gradient(
            circle at 0 100%,
            transparent 0,
            transparent 12px,
            #2179f5 13px
        );
    mask-repeat: no-repeat;
    mask-position: right bottom, left top, right top, left bottom;
    mask-size: 70% 70%;
}
```

### 圆角不规则矩形

一侧是规则的带圆角直角，另外一侧则是带圆角的斜边；其实，它就是由**圆角矩形** + **圆角平行四边形组成**；

所以，**借助两个伪元素**，可以轻松的实现它们：

```html
<div class="skew">Skew</div>
```

```css
.skew {
    position: relative;
    width: 120px;

    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 10px;
        background: orange;
        transform: skewX(15deg);
    }
    &::before {
        content: "";
        position: absolute;
        top: 0;
        right: -13px;
        width: 100px;
        height: 64px;
        border-radius: 10px;
        background: orange;
    }
}
```

### 外圆角按钮

常见于 Tab 页上，对这个按钮形状拆解一下，这里其实是 3 块的叠加：

+ 中间的上圆角矩形
+ 两侧的矩形切弧形成的弧形三角

主要难点是两侧的三角，可用**径向渐变**实现：

```html
<div class="outside-circle">outside-circle</div>
```

```css
.outside-circle {
    position: relative;
    background: #e91e63;
    border-radius: 10px 10px 0 0;

    &::before {
        content: "";
        position: absolute;
        width: 20px;
        height: 20px;
        left: -20px;
        bottom: 0;
        background: #000;
        background:radial-gradient(circle at 0 0, transparent 20px, #e91e63 21px);
    }
    &::after {
        content: "";
        position: absolute;
        width: 20px;
        height: 20px;
        right: -20px;
        bottom: 0;
        background: #000;
        background:radial-gradient(circle at 100% 0, transparent 20px, #e91e63 21px);
    }
}
```

## 总结一下

基于上述的实现，我们不难发现，一些稍微特殊的按钮，无非都通过拼接、障眼法、遮罩等方式实现。

而在其中：

- 渐变（线性渐变 `linear-gradient`、径向渐变 `radial-gradient`、多重渐变）
- 遮罩 `mask`
- 裁剪 `clip-path`
- 变形 `transform`

发挥了重要的作用，熟练使用它们，我们对于这些图形就可以信手拈来，基于它们的变形也能从容面对。

上述的图形，再配合 `filter: drop-shadow()`，基本都能实现不规则阴影。