## 概述

`SpotLight` 是一种从一个点向某个方向发出锥形光束的聚光灯，支持阴影、角度衰减和软边，是舞台灯光、聚焦照明的理想选择。

## 基本用法

```js
const light = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 6, 0.3, 2);

light.position.set(5, 10, 5);
light.target.position.set(0, 0, 0); // 照射目标
scene.add(light);
scene.add(light.target);

const helper = new THREE.SpotLightHelper(light);
scene.add(helper);
```

## 参数详解

| 参数名      | 类型   | 说明                               |
| ----------- | ------ | ---------------------------------- |
| `color`     | Color  | 灯光颜色                           |
| `intensity` | Number | 灯光强度                           |
| `distance`  | Number | 光照最大范围（超出后光为 0）       |
| `angle`     | Radian | 聚光锥角度（范围 0 ~ Math.PI/2）   |
| `penumbra`  | 0~1    | 光束边缘的软化程度（0 = 硬边）     |
| `decay`     | Number | 衰减指数（一般为 2，符合物理规律） |

## 阴影支持

```js
light.castShadow = true;
light.shadow.mapSize.set(1024, 1024);
light.shadow.bias = -0.0001;
```

SpotLight 的阴影投射是一个**锥形投影相机**，适合局部区域投影，非常适合角色、场景中的重点照明。

## 应用场景

| 场景           | 描述                                     |
| -------------- | ---------------------------------------- |
| 舞台灯光       | 主角打光，突出主体                       |
| 手电筒/聚焦灯  | 第一人称视角照明                         |
| 商场灯、展示柜 | 局部打亮，突出商品                       |
| 氛围照明       | 柔和扫光、聚焦暗影，制造戏剧感或恐怖氛围 |

## 使用建议

- 搭配 `.target` 控制照射方向
- 使用 GUI 控制 `angle` 和 `penumbra`，调出你想要的“聚光感”
- 如果灯移动了，记得更新 `helper.update()`

## 高级技巧

- 用多个 `SpotLight` 打亮不同区域
- 用来做“手电筒效果”：光源 + camera 绑定 + angle 动态变
- 与 `RectAreaLight` 互补使用：一个聚焦，一个柔光