## 概述

`DirectionalLight` 是一种**具有方向的平行光源**，模拟来自无限远处、方向一致的光，比如阳光。它**能产生阴影**，是最常用的主光源类型。

## 创建方式

```js
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10); // 光线来自的位置（方向决定照射方向）
scene.add(light);
```

 `position` 并不是“光源位置”，而是**决定光线方向**（就像阳光从某方向照来）。

## 参数说明

| 参数        | 类型                    | 说明               |
| ----------- | ----------------------- | ------------------ |
| `color`     | Color / Number / String | 光的颜色           |
| `intensity` | Number                  | 光照强度，默认 1.0 |
| `position`  | Vector3                 | 决定光线照射方向   |

## 灯光可视化

```js
scene.add(new THREE.DirectionalLightHelper(light, 1));
```

还能加个 `CameraHelper` 显示它的阴影摄像头：

```js
scene.add(new THREE.CameraHelper(light.shadow.camera));
```

## 阴影支持

`DirectionalLight` 是**唯一支持投影大场景阴影**的光源类型（SpotLight 也支持但更局限）：

```js
light.castShadow = true;

// 可选调参：设置阴影范围、分辨率
light.shadow.mapSize.set(2048, 2048);
light.shadow.camera.near = 1;
light.shadow.camera.far = 50;
light.shadow.camera.left = -10;
light.shadow.camera.right = 10;
light.shadow.camera.top = 10;
light.shadow.camera.bottom = -10;
```

物体上也要打开阴影：

```js
mesh.castShadow = true;
mesh.receiveShadow = true;
```

若没有产生阴影还有可能是**渲染器未启用阴影渲染**：

```js
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.shadowMap.enabled = true;
```

## 应用场景

| 场景              | 说明                                  |
| ----------------- | ------------------------------------- |
| 室外阳光          | 最经典使用：一束强光从天空方向打来    |
| 模型展示主光源    | 给模型打出立体明暗面，有阴影更真实    |
| 搭配 AmbientLight | 主光 + 柔光组合，提升真实感与细节层次 |
| 阴影投射          | 模拟真实世界物体间的遮挡              |

## 注意事项

+ `position` 表示**光线方向**，不是“灯在哪”
+ 阴影范围默认太小，需手动扩大 `.shadow.camera.*`
+ 阴影贴图太小会模糊，建议设置更高 `.shadow.mapSize.set(2048, 2048)`
+ 性能消耗大，不建议多光源同时开阴影

## 小技巧

- 用 `.target` 指定照射目标（默认是原点）：

```js
light.target.position.set(0, 0, 0);
scene.add(light.target);
```

- 可调 `shadow.bias` 解决阴影“锯齿”或“阴影浮空”问题：

```js
light.shadow.bias = -0.001;
```