## 什么是材质（Material）？

在 Three.js 中，材质（`Material`）是用于控制模型表面视觉效果的类。你可以把它理解为“怎么让这个物体看起来像某种材质”。

它配合 `geometry` 和 `mesh` 使用：

```js
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(geometry, material);
```

## 常用材质分类

### 基础类材质（不受光照影响）

| 材质                | 用途            | 特点                 |
| ------------------- | --------------- | -------------------- |
| `MeshBasicMaterial` | 纯颜色/贴图展示 | 不受光照影响，性能高 |
| `PointsMaterial`    | 点渲染          | 用于粒子系统         |
| `LineBasicMaterial` | 线渲染          | 用于边框、辅助线     |

### 受光照影响材质（真实感提升）

| 材质                   | 用途         | 特点                   |
| ---------------------- | ------------ | ---------------------- |
| `MeshLambertMaterial`  | 漫反射材质   | 支持基本光照，柔和     |
| `MeshPhongMaterial`    | 高光材质     | 支持镜面反射，高光控制 |
| `MeshStandardMaterial` | PBR 材质     | 支持金属/粗糙度，推荐  |
| `MeshPhysicalMaterial` | 更高级的 PBR | 玻璃、透明、水、折射等 |

### 特殊类材质（非表面渲染）

| 材质                 | 用途                           |
| -------------------- | ------------------------------ |
| `ShaderMaterial`     | 自定义 GLSL shader（终极玩法） |
| `RawShaderMaterial`  | 原始更自由的 Shader            |
| `MeshDepthMaterial`  | 渲染深度信息                   |
| `MeshNormalMaterial` | 可视化法线方向                 |
| `ShadowMaterial`     | 专门用于只接收阴影但不渲染本身 |

## 常见通用属性

| 属性          | 说明                         |
| ------------- | ---------------------------- |
| `color`       | 材质颜色                     |
| `map`         | 颜色贴图                     |
| `transparent` | 是否开启透明通道             |
| `opacity`     | 不透明度（0~1）              |
| `side`        | 设置渲染面：正面、背面、双面 |
| `alphaMap`    | 透明度贴图                   |
| `wireframe`   | 是否线框显示                 |

## 进阶贴图通道支持

> 以下多用于 `StandardMaterial` 或 `PhysicalMaterial`

| 属性           | 作用         | 用途                       |
| -------------- | ------------ | -------------------------- |
| `normalMap`    | 法线扰动     | 模拟高频细节（砖块、皱褶） |
| `roughnessMap` | 粗糙度控制   | 决定表面磨砂/光滑程度      |
| `metalnessMap` | 金属控制     | 决定是否反光               |
| `envMap`       | 环境贴图     | 用于反射环境（天空盒）     |
| `emissiveMap`  | 自发光贴图   | 像灯管/霓虹                |
| `aoMap`        | 环境遮蔽贴图 | 增强阴影细节（AO效果）     |

## 材质优化技巧

- 使用贴图时，尽量尺寸为 2 的幂（提升性能）
- 同类材质尽量共享实例，避免重复创建
- 调试用 `MeshNormalMaterial` 或 `MeshDepthMaterial` 非常有用
- 不透明时关闭 `transparent` 会提升性能