---
title: 读取元素导致重排
---
## 获取 div 尺寸或位置会不会引发重排？

获取 DOM 的尺寸或位置（如 `offsetWidth`、`getBoundingClientRect`）在某些情况下会触发浏览器的强制重排，主要是是前面修改了 DOM 或样式后再读取这些属性。

```js
// 页面加载后，读取某个元素尺寸，不修改 DOM
console.log(div.offsetWidth); // 不会触发重排（layout 已完成）

div.style.height = '100px';   // 修改布局（异步排队）
console.log(div.offsetHeight); // 强制重排
```

为了避免性能问题，建议在实际开发中采用读写分离策略，或使用 `requestAnimationFrame` 将 DOM 操作合并到同一帧，避免**布局抖动** （*layout thrashing*）。

```js
// 非推荐，读写交错：每次循环都触发 reflow
for (const el of elements) {
  el.style.height = '100px';
  console.log(el.offsetHeight);
}

// 推荐做法：先批量读，再批量写
const heights = elements.map(el => el.offsetHeight);
elements.forEach((el, i) => {
  el.style.height = heights[i] + 'px';
});
```
### 读写分离

```js
requestAnimationFrame(() => {
  // 第一步：批量读取 DOM
  for (const el of items) {
    heights.push(el.offsetHeight);
  }

  // 第二步：批量写入 DOM（修改样式）
  requestAnimationFrame(() => {
    for (let i = 0; i < items.length; i++) {
      items[i].style.height = heights[i] + 10 + 'px';
    }
  });
});
```

|步骤|操作类型|放在哪一帧|
|---|---|---|
|第一次 `requestAnimationFrame`|**读取 DOM（offsetHeight）**|第 N 帧|
|第二次 `requestAnimationFrame`|**写入 DOM（style 设置）**|第 N+1 帧|

这样，读和写分别集中在两个渲染帧中处理，浏览器可以优化重排流程，**只触发一次 reflow**。