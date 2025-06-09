## 概述

`RectAreaLight` 是一个具有**大小和方向的矩形面光源**，它模拟从一个平面上**均匀发出的光线**，效果非常真实柔和，但也对性能要求更高。

## 基本用法

```js
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

const light = new THREE.RectAreaLight(0xffffff, 2, 4, 2);
light.position.set(0, 5, 0);
light.lookAt(0, 0, 0); // 指向目标方向

scene.add(light);

const helper = new RectAreaLightHelper(light);
light.add(helper);
```

## 参数说明

| 参数        | 说明                   |
| ----------- | ---------------------- |
| `color`     | 光的颜色               |
| `intensity` | 强度（和面积乘积有关） |
| `width`     | 光源的宽度             |
| `height`    | 光源的高度             |

> 特别注意：它有方向！你需要用 `.lookAt()` 指向要照的位置。

## 特性与表现

+ 光线从一个矩形面发出，而非点
+ 照亮区域清晰边界，可精准控制	
+ 渲染非常真实（摄影灯效果）	
+ 不支持阴影（不能投射 shadow）	
+ 只对 `MeshStandardMaterial` / `MeshPhysicalMaterial` 有效

## 使用场景举例

| 场景              | 应用                           |
| ----------------- | ------------------------------ |
| 摄影棚/柔光箱照明 | 模拟柔和灯板                   |
| 建筑/室内照明     | 窗户打光、LED 灯、走廊灯       |
| 产品展示          | 柔和打亮产品正面，无眩光高光点 |
| 科幻/氛围感灯光   | 精准区域照明，无指向性阴影     |

## 使用注意

- 只在支持 PBR 的材质上有效（Standard / Physical）
- 无法投射阴影（但能照亮 receiveShadow 的物体）
- 渲染代价稍高，别一次性加太多
- 注意方向（必须 lookAt），否则没效果

