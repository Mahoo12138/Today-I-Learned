## 常规相机控制器

| 控制器                | 简介                      | 常见用途         |
| --------------------- | ------------------------- | ---------------- |
| `OrbitControls`       | 鼠标围绕目标旋转相机      | 编辑器、产品浏览 |
| `TrackballControls`   | 类似轨迹球，自由旋转+缩放 | 自然、流畅体验   |
| `FlyControls`         | 像飞行模拟器那样飞行      | 大场景/飞行穿越  |
| `FirstPersonControls` | 第一人称视角控制          | 漫游、沉浸式体验 |
| `PointerLockControls` | 鼠标锁定 + FPS 视角       | 游戏、FPS 场景   |

## 物体控制器

| 控制器                      | 说明                               | 应用               |
| --------------------------- | ---------------------------------- | ------------------ |
| `TransformControls`         | 可视化拖拽物体（平移、旋转、缩放） | 编辑器、开发调试   |
| `DragControls`              | 用鼠标拖动物体位置                 | 拖放交互、编辑工具 |
| `DeviceOrientationControls` | 移动端陀螺仪控制                   | VR、手机体验       |
| `MapControls`               | 类似地图导航的方式控制相机         | 俯视图场景         |

###  VR/AR 相关控制器

| 控制器                     | 用途                         |
| -------------------------- | ---------------------------- |
| `VRControls`（已废弃）     | WebVR 时代使用，现在用 WebXR |
| `XRControllerModelFactory` | 生成手柄模型                 |
| `XRControllerGrip`         | 抓取控制器                   |
| `WebXRManager`             | 集成 WebXR 的入口            |