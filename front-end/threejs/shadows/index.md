---
title: 阴影
---

## 概述

Three.js 中的阴影系统是通过光源渲染深度图（shadow map），然后在主渲染时用它来判断像素是否“被遮挡”，从而呈现阴影区域。

## 基本原理

1. 光源先从自己的角度「渲染一次」场景 → 得到一个深度贴图（Shadow Map）
2. 主相机渲染时，每个像素拿自己的世界坐标 → 转换到光源视角 → 看它是否比 shadow map 上“更远”
3. 如果更远，就说明它“被别的东西挡住了” → 是阴影区域！

所以阴影是**额外多做一次渲染+判断**，性能成本高，默认不开，需要你手动启用

## 开启阴影

### 1. 打开渲染器的阴影支持

```js
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 推荐
```

### 2. 设置光源支持阴影

只有 **`DirectionalLight`**、**`SpotLight`** 和 **`PointLight`** 支持阴影：

```js
light.castShadow = true;
```

可以调整光源的阴影参数（视锥体、模糊度）：

```js
light.shadow.mapSize.set(2048, 2048); // 越大越清晰，越耗性能
light.shadow.bias = -0.001;           // 修正“阴影浮空”
```

### 3. 控制物体是否投/接阴影

```js
mesh.castShadow = true;    // 能投影
mesh.receiveShadow = true; // 能接收阴影
```

地面通常设置 `receiveShadow = true`，而不是 `castShadow`。

## 阴影类型

```js
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

| 类型               | 效果                         | 推荐指数 |
| ------------------ | ---------------------------- | -------- |
| `BasicShadowMap`   | 阴影块状生硬，性能最低       | ❌        |
| `PCFShadowMap`     | 平滑边缘，默认值             | ✅        |
| `PCFSoftShadowMap` | 更柔和边缘，更逼真           | ✅✅✅      |
| `VSMShadowMap`     | 支持更大贴图范围，兼容差异大 | 进阶使用 |

## 光源支持

| 光源类型           | 阴影支持         |
| ------------------ | ---------------- |
| `DirectionalLight` | ✅ 推荐使用       |
| `SpotLight`        | ✅ 适合聚光灯效果 |
| `PointLight`       | ✅ 但性能开销大   |
| `AmbientLight`     | ❌ 不支持         |
| `HemisphereLight`  | ❌ 不支持         |
| `RectAreaLight`    | ❌ 不支持         |

## 常见问题排查

| 问题               | 原因                                                         | 解决方式                       |
| ------------------ | ------------------------------------------------------------ | ------------------------------ |
| 阴影锯齿感强       | mapSize 太小                                                 | 提高 mapSize                   |
| 阴影浮空、错位     | 深度精度问题                                                 | 调整 `light.shadow.bias`       |
| 没有阴影           | 忘了开启 `renderer.shadowMap` / 没开 `castShadow` / `receiveShadow` |                                |
| 阴影范围太小       | `light.shadow.camera` 的范围不够                             | 调整 near / far / left / right |
| 模型太远没阴影     | 超出阴影摄像机范围                                           | 同上                           |
| 某些材质不显示阴影 | 某些材质如 Basic 不受光照影响                                | 用 Standard / Phong 材质       |
