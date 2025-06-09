# Z-Fighting（Z 轴闪烁）

Z-Fighting 是指：**两个或多个面非常接近或重叠时，深度缓冲区（z-buffer）无法精确区分它们的先后顺序，从而在渲染时“闪烁”或交替出现”**，看起来就像两个面在打架、闪现、颤抖一样。

## 为什么会出现？

Three.js 使用 WebGL 渲染，它的底层靠的是 GPU 的**深度缓冲（Z-Buffer）**来判断哪个像素在“上面”。

问题在于：

- Z-buffer 的精度是有限的（通常 16、24 或 32 位）
- 当两个面非常非常近（或重合）时，它们的 Z 值几乎一样
- GPU 无法判断谁在前，结果就是渲染时“摇摆不定”

## 常见触发场景

| 场景                      | 描述                                                         |
| ------------------------- | ------------------------------------------------------------ |
| 两个面贴得非常近          | 比如一个地板，一个贴图覆盖在上面                             |
| 模型被 clone 一份重叠显示 | 没错，clone 模型没偏移，就等着打架吧 😂                       |
| 模型放在远处              | Z-buffer 精度在远距离处降低，问题更容易发生                  |
| 大 near/far 比例差距      | 相机的 near 很小（比如 0.1），far 很大（比如 10000），导致精度不够 |

## 解决方法

### 1. **避免面重叠**

这是最根本的办法：

```js
mesh2.position.z += 0.001; // 微移一点点，避免重叠
```

### 2. **优化相机 near/far 设置**

让 `near` 和 `far` 尽可能接近（缩小它们的比值）：

```js
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,     // 改小一点
  1000   // 不要设太大，除非你真的很远
);
```

### 3. **使用 `polygonOffset` 属性（针对材质）**

这是 Three.js 针对“深度偏移”的官方解决手段：

```js
const material = new THREE.MeshBasicMaterial({
  map: texture,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1
});
```

这个设置会让这个材质的面在 z-buffer 中轻微“后退”，从而避免跟其它面冲突。

>  `polygonOffsetFactor/Units` 控制偏移的强度