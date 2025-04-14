## 简介

`THREE.OrbitControls` 是 Three.js 中**使用最广泛的控制器之一**，`OrbitControls` 允许你用鼠标/手指围绕一个目标点**旋转、缩放、平移**相机，非常适合静态观察、交互浏览等场景。

## 基本用法

```js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0); // 观察点
controls.update();            // 每帧调用，更新相机状态
```

## 核心功能

| 功能               | 描述                       | 默认操作方式        |
| ------------------ | -------------------------- | ------------------- |
| 旋转（orbit）      | 围绕目标点旋转相机         | 鼠标左键 / 一指拖动 |
| 缩放（zoom/dolly） | 缩放视角（透视为移动相机） | 鼠标滚轮 / 双指捏合 |
| 平移（pan）        | 水平方向移动相机目标点     | 鼠标右键 / 三指拖动 |

## 常用属性 & 技巧

### 平滑惯性（阻尼）

```js
controls.enableDamping = true;
controls.dampingFactor = 0.05;
```

启用后一定要在 `render` 循环中调用 `controls.update()`：

```js
const tick = () => {
    // Update Controls
    orbitControls.update()
    // Render
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()
```

### 缩放范围限制

```js
controls.minDistance = 2;
controls.maxDistance = 50;
```

或者用 `minZoom` / `maxZoom`（正交相机）

### 垂直角度限制（防止翻转）

```js
controls.minPolarAngle = Math.PI / 4; // 最小仰角
controls.maxPolarAngle = Math.PI / 2; // 最大仰角
```

### 限制水平旋转范围（比如只能旋转一个侧面）

```js
controls.minAzimuthAngle = -Math.PI / 2;
controls.maxAzimuthAngle = Math.PI / 2;
```

### 禁用某些交互

```js
controls.enableZoom = false;   // 禁用滚轮缩放
controls.enableRotate = false; // 禁用旋转
controls.enablePan = false;    // 禁用平移
```

### 配合窗口大小变化

```js
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  controls.update(); // 别忘了更新控制器
});
```

## 高阶用法

- 可监听 `controls.addEventListener('change', callback)` 实时响应变化
- 可与 `Raycaster` 结合实现点击物体
- 可用 `controls.autoRotate = true` 做自动旋转查看器