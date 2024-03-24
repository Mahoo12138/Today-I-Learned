# 理解 CSS3 max/min-content 及 fit-content 等 width 值

### 一、为何要蹦出这些新玩意？

在CSS3的世界里，`width`属性又多了几个关键字成员，`fill-available`, `max-content`, `min-content`, 以及`fit-content`。

虽然，作为名词`fill-available`, `max-content`, `min-content`, 以及`fit-content`都是新鲜面孔，但是，实际上，在CSS2.1的时候，就有类似的尺寸概念……

### 二、CSS2.1的尺寸体系

在CSS2.1的世界中，常见的尺寸分为这几类：
**1. 充分利用可用空间**
例如，一些`div`元素默认宽度100%父元素，这种充分利用可用空间的行为就称为“`fill-available`”。

**2. 收缩与包裹**
典型代表就是浮动，绝对定位以及`inline-block`，英文称为“shrink-to-fit”，直译为“收缩到合适”，这种直译往往都是不准确的，这种行为表现确实很难描述，有些只可意会不能言传的感觉，而我自己一直以“包裹性”作为理解。在CSS3中有个专有的关键名称，`fit-content`。

**3. 收缩到最小**
这个基本上就出现在`table-layout`为`auto`的表格中，空间都不够的时候，文字能断的就断，中文是随便断的，英文单词不能断。于是乎，第一列被无情地每个字都断掉，形成一柱擎天。这种行为称之为“preferred minimum width”或者“minimum content width”。

即本文的重点内容之一的`min-content`，换了一个更加规范好听的名字了。实际上，大家也看到了，`min-content`这种尺寸特性，`display:table-cell`实际上就有，但是，由于没有明确的名词或概念，大家都不知道，都是稀里糊涂有此表现，究其根本就不清楚了。

**4. 超出容器限制**
上面1~3情况，除非有明确的`width`相关设置，否则尺寸都不会主动超过容器宽度的，但是，存在一些特殊情况，例如，连续的英文数字，好长好长；或者内联元素被设置了`white-space:nowrap`，则会超出容器。

`max-content`的表现与之有些类似，具有收缩特性，同时最大内容宽度。

至此，大家会发现，`fill-available`, `max-content`, `min-content`, 以及`fit-content`确实在CSS2.1的时候，就有类似概念。

### 三、理解width:fill-available

`width:fill-available`比较好理解，比方说，我们在页面中扔一个没有其他样式的`<div>`元素，则，此时，该`<div>`元素的`width`表现就是`fill-available`自动填满剩余的空间。也就是我们平常所说的盒模型的`margin`,`border`,`padding`的尺寸填充。

出现`fill-available`关键字值的价值在于，**我们可以让元素的100%自动填充特性不仅仅在`block`水平元素上，其他元素，例如，我们一直认为的包裹收缩的`inline-block`元素上**：

```css
div { 
    display:inline-block; 
    width:fill-available; 
}
```

### 四、理解width:max-content

同样，从字面意思上理解max-content就是使用 **最大的内容**，实际上这样讲是远远不够的，max-content的真正定义是：**采用子元素中最大空间尺寸的那个元素的尺寸大小**。

```html
<style>
.box {
    background-color: #f0f3f9;
    padding: 10px;
    margin: 10px auto 20px;
    overflow: hidden;
}

.inline-block {
    display: inline-block;
}
.max-content {
    width: -webkit-max-content;
    width: -moz-max-content;
    width: max-content;    
}
</style>

<strong>display:inline-block;</strong>
<div class="box inline-block">
    <p>display:inline-block具有收缩特性</p>
    <p>display:inline-block具有收缩特性，但是，当（例如这里的）描述文字超过一行显示的时候，其会这行，不会让自身的宽度超过父级容器的可用空间的，但是，width:max-content就不是酱样子哦咯！表现得好像设置了white-space:nowrap一样，科科！</p>
</div>

<strong>width: max-content;</strong>
<div class="box max-content">
    <p>display:inline-block具有收缩特性</p>
    <p>display:inline-block具有收缩特性，但是，当（例如这里的）描述文字超过一行显示的时候，其会这行，不会让自身的宽度超过父级容器的可用空间的，但是，width:max-content就不是酱样子哦咯！表现得好像设置了white-space:nowrap一样，科科！</p>
</div>
```



### 五、理解width:min-content

`min-content`宽度表示的并不是内部那个宽度小就是那个宽度，而是，**采用内部元素最小宽度值最大的那个元素的宽度作为最终容器的宽度。**

首先，我们要明白这里的“最小宽度值”是什么意思。定义上为**缩放到极限的最小宽度**，例如图片的最小宽度值就是图片呈现的宽度，对于文本元素，如果全部是中文，则最小宽度值就是一个中文的宽度值；如果包含英文，因为默认英文单词不换行，所以，最小宽度可能就是里面最长的英文单词的宽度。

```html
<style>
.box {
    background-color: #f0f3f9;
    padding: 10px;
    margin: 10px 0 20px;
    overflow: hidden;
}

.inline-block {
    display: inline-block;
}
.min-content {
    width: -webkit-min-content;
    width: -moz-min-content;
    width: min-content;    
}
</style>
<strong>display:inline-block;</strong>
<div class="box inline-block">
    <img src="mm1.jpg">
    <p>display:inline-block具有收缩特性，但这里宽度随文字。而width:min-content随图片。</p>
</div>

<strong>width: min-content;</strong>
<div class="box min-content">
    <img src="mm1.jpg">
    <p>display:inline-block具有收缩特性，但这里宽度随文字。而width:min-content随图片。</p>
</div>
```

`display:inline-block`虽然也具有收缩特性，但宽度随最大长度长的那一个（同时不超过可用宽度），上例中，图片的宽度最小值是256像素，而文字的最小宽度值为 `display:inline-` 的宽度，显然是小于 256像素的，即在第一个 box 中取的是文字的宽度，第二个 box 取的图片的宽度；

### 六、理解width:fit-content

`width:fit-content`可以实现元素收缩效果的同时，保持原本的block水平状态，于是，就可以直接使用`margin:auto`实现元素向内自适应同时的居中效果了。

```html
<style>
.box {
    background-color: #f0f3f9;
    padding: 10px;
    /* 这里左右方向是auto */
    margin: 10px auto 20px;
    overflow: hidden;
}

.inline-block {
    display: inline-block;
}
.fit-content {
    width: -webkit-fit-content;
    width: -moz-fit-content;
    width: fit-content;    
}
</style>
<strong>display:inline-block;</strong>
<div class="box inline-block">
    <img src="mm1.jpg">
    <p>display:inline-block居中要靠父元素，而width:fit-content直接margin:auto.</p>
</div>

<strong>width: fit-content;</strong>
<div class="box fit-content">
    <img src="mm1.jpg">
    <p>display:inline-block居中要靠父元素，而width:fit-content直接margin:auto.</p>
</div>
```

取以下两种值中的较大值：

- 固有的最小宽度
- 固有首选宽度（max-content）和可用宽度（available）两者中的较小值

可表示为：`min(max-content, max(min-content, <length-percentage>))`

+ fill-available 外部尺寸
+ max-content 内部尺寸
+ min-content 内部尺寸
+ fit-content 外部尺寸+内部尺寸
