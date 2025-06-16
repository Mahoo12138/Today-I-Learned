## 概述

`MeshToonMaterial` 是一种实现卡通风格渲染的材质，它通过**明暗分级（色带）+ 可控边缘色带**来模拟插画/漫画风的高光阴影。

## 效果特征

- 没有真实感渐变高光，而是**硬切换的明暗区域**
- 像“用马克笔涂出来”的效果，有色块分明的质感
- 非真实，但视觉冲击力强、风格化强烈

## 基本用法

```js
const material = new THREE.MeshToonMaterial({
  color: 0x0099ff,         // 主色
  gradientMap: gradientTex // 控制明暗层级的贴图
});
```

## 属性说明

| 属性          | 说明                           |
| ------------- | ------------------------------ |
| `gradientMap` | 用一张灰度贴图控制明暗过渡分级 |
| `color`       | 主体颜色                       |
| `map`         | 颜色贴图（可选）               |
| `lightMap`    | 可选环境贴图                   |

### 什么是 gradientMap？

- 是一张横向的灰度图（通常很小，比如 4x1）
- 控制“从亮到暗”的过渡方式，比如：
  - 全渐变 → 比较自然
  - 分 2~3 阶 → 就很卡通、块面感很强
- 多用 `NearestFilter` + `generateMipmaps = false` 保证清晰边界

```js
gradientTex.minFilter = THREE.NearestFilter;
gradientTex.magFilter = THREE.NearestFilter;
gradientTex.generateMipmaps = false;
```

## 应用场景

| 应用          | 描述                                       |
| ------------- | ------------------------------------------ |
| 动漫人物      | 赛璐璐风人物、怪物、角色头身像             |
| 卡通游戏风格  | 像《塞尔达：旷野之息》《喷射战士》那种风格 |
| 海报/展示风格 | 非写实扁平风模型渲染                       |
| 概念设计视觉  | 给建模加个 toon 材质，秒变“手绘质感”       |
