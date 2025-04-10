## 简介

Three.js 中的相机（`THREE.Camera`）继承自 `Object3D`，所以它也有 `position`、`rotation` 等属性。但相机的核心职责是：

> **将 3D 世界转换为 2D 图像**，也就是把立体场景渲染到屏幕上。

## 相机的两大主角

### 1. **PerspectiveCamera（透视相机）**

```js
const camera = new THREE.PerspectiveCamera(
  75, // 视角 FOV（角度）
  window.innerWidth / window.innerHeight, // 宽高比
  0.1, // 近裁剪面
  1000 // 远裁剪面
);
```

- 像人眼那样看东西，远小近大，真实感强
- 常用于 3D 场景、游戏、可视化

### 2. **OrthographicCamera（正交相机）**

```js
const camera = new THREE.OrthographicCamera(
  -width / 2, width / 2, height / 2, -height / 2,
  0.1, 1000
);
```

- 没有透视效果，所有物体一样大
- 适合 UI、2D 平铺、建筑图纸等

## 相机的视锥体

相机其实构建了一个**视锥体**（Viewing Frustum）：

- **近裁剪面（near）** 和 **远裁剪面（far）** 决定能看到的范围
- 只有在这个范围内的东西才会被渲染
- `fov` 控制视角宽度，越大视角越广

可以加个 `CameraHelper` 来可视化它：

```js
const helper = new THREE.CameraHelper(camera);
scene.add(helper);
```

## 相机的常见操作

- **position.set(x, y, z)**：移动相机
- **lookAt(target)**：让相机朝向一个点
- **OrbitControls**：给相机添加鼠标控制功能
- **camera.updateProjectionMatrix()**：当相机参数变化后记得调用