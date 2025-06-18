## 概述

`THREE.Raycaster` 是用来在 3D 空间中发射一条射线，**检测它与哪些物体相交**的工具，常用于实现“点击选中”、“鼠标悬停”、“物体拾取”等功能。

## 创建方式

```js
new THREE.Raycaster(origin, direction, near = 0, far = Infinity)
```

| 参数        | 说明                          |
| ----------- | ----------------------------- |
| `origin`    | 射线起点（Vector3）           |
| `direction` | 射线方向（归一化）            |
| `near`      | 起始检测距离（相对于 origin） |
| `far`       | 最远检测距离                  |

### 归一化

为什么方向向量必须要归一化？

因为射线检测中，**射线方向和长度解耦了**，Three.js 默认假设你的方向向量的长度为 1（单位向量），否则**距离判断就会出错**。

发出一条“探照灯光线”：

```js
origin + direction * t   // t 是距离
```

在 Three.js 的射线检测中会被用来判断：

- 射线从哪里发出（origin）
- 朝哪个方向走（direction）
- 到目标对象的距离是多少（t）

**如果 direction 向量不是单位向量**，那 `t` 就**不是真实的距离**，而是被 direction 的“长度”缩放过的数，导致结果错误。

### 鼠标拾取

```js
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  // 1. 将鼠标坐标从屏幕坐标转换为 -1 ~ 1（NDC）
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // 2. 生成射线（相机发出，穿过鼠标点）
  raycaster.setFromCamera(mouse, camera);

  // 3. 检测相交物体
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const first = intersects[0];
    console.log('你点击了：', first.object.name);
  }
});
```

### 摄像机视线

```js
const origin = camera.position.clone();
const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);

// 射线从相机位置 (0, 0, 0) 朝 +X 方向发出。
const raycaster = new THREE.Raycaster(origin, direction);
const intersects = raycaster.intersectObjects(scene.children, true);
```

### 可视化射线

Raycaster 是“看不见摸不着”的射线逻辑工具，但是 Threejs 中比没有内建的 `RaycasterHelper`，但我们可以**手动用一条可视化的线段来表示射线**：

```js
const arrowHelper = new THREE.ArrowHelper(
  rayDirection, // 方向（必须单位向量）
  rayOrigin,    // 起点
  10,    // 可视长度
  0xff0000   // 颜色
);
scene.add(arrowHelper);
```

## 常用 API & 属性

| 方法/属性                              | 作用                          |
| -------------------------------------- | ----------------------------- |
| `setFromCamera(mouse, camera)`         | 从相机 & 屏幕点构建射线       |
| `intersectObject(object, recursive)`   | 检测单个物体                  |
| `intersectObjects(objects, recursive)` | 检测多个物体                  |
| `far / near`                           | 控制射线检测的最远/最近距离   |
| `params.Mesh.threshold`                | 点精度误差容忍值（针对点/线） |

## 射线命中结果

`THREE.Intersection` 是 Raycaster 返回的命中信息对象，包含“命中物体”“命中点”“命中距离”等关键数据。

```js
const intersects = raycaster.intersectObject(object, true);
```

执行上述代码后，返回的 `intersects` 则是一个`THREE.Intersection`数组。

## 属性详解

| 属性名       | 类型       | 说明                                    |
| ------------ | ---------- | --------------------------------------- |
| `distance`   | `Number`   | 光线起点到命中点的距离                  |
| `point`      | `Vector3`  | 命中的世界坐标位置                      |
| `object`     | `Object3D` | 被命中的物体                            |
| `face`       | `Face3`    | 命中的三角面（包含 normal 和顶点索引）  |
| `faceIndex`  | `Number`   | 几何体中命中的面索引                    |
| `uv`         | `Vector2`  | 命中点的 UV 坐标（贴图采样坐标）        |
| `instanceId` | `Number`   | 如果是 InstancedMesh，返回对应的实例 ID |
| `index`      | `Number`   | 被命中顶点的索引（通常不需要）          |

## 应用场景

+ 点击选中物体：模型拾取、物体信息展示
+ 拾取坐标点：获取点击位置的 3D 坐标
+ FPS 瞄准：玩家相机位置 + 前方向
+ 地面检测：玩家脚下往下发射，判断是否“踩空”