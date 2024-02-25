## 修改鼠标样式

在 CSS 中，我们可以通过 `cursor` 样式，对鼠标指针形状进行修改

```css
cursor: auto;
cursor: pointer;
...
cursor: zoom-out;

/* 使用图片 */
cursor: url(hand.cur)

/* 使用图片，并且设置 fallback 兜底 */
cursor: url(hand.cur), pointer;
```

## 隐藏鼠标光标

可通过 `cursor: none` 隐藏页面的鼠标指针：

```
body {
    cursor: none;
}
```

首先实现一个 `10px x 10px` 的圆形 **div**，设置为基于 `<body>` 绝对定位：

```
<div id="g-pointer"></div>

#g-pointer {
    position: absolute;
    top: 0;
    left: 0;
    width: 10px;
    height: 10px;
    background: #000;
    border-radius: 50%;
}
```

那么，在页面上，我们就得到了一个圆形黑点，再通过事件监听，监听 body 上的 `mousemove`，将小圆形的位置与实时鼠标指针位置重合：

```js
const body = document.querySelector("body");
const element = document.getElementById("g-pointer-1");
const element2 = document.getElementById("g-pointer-2");

// offsetWidth 只读属性，返回一个元素的布局宽度
const halfAlementWidth = element.offsetWidth / 2;
const halfAlementWidth2 = element2.offsetWidth / 2;
// 做一个相对的位移
function setPosition(x, y) { 
    element.style.transform  = `translate(${x - halfAlementWidth}px, ${y - halfAlementWidth}px)`;       
    element2.style.transform  = `translate(${x - halfAlementWidth2}px, ${y - halfAlementWidth2}px)`;
}

body.addEventListener('mousemove', (e) => {
  // 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。
  // 该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行
  window.requestAnimationFrame(function(){
    setPosition(e.clientX, e.clientY);
  });
});
```

之后可以借助混合模式 `mix-blend-mode: exclusion`，能够实现让模拟的鼠标指针能够智能地在不同背景色下改变自己的颜色；

```css
{
    background: #999;
    background-color: #fff;
    mix-blend-mode: exclusion;
    z-index: 1;
}
```

