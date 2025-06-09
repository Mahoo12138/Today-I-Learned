---
title: Points
---
## 概述

`THREE.Points` 是一种几何体渲染方式，它将每个顶点当作一个独立的点（粒子）进行渲染，常用于创建高性能的大规模粒子效果。

## 构成方式

粒子系统的基础就是：

```js
const geometry = new THREE.BufferGeometry();
const material = new THREE.PointsMaterial();
const points = new THREE.Points(geometry, material);
scene.add(points);
```

## 粒子位置

要把每个粒子的位置，作为 `position` 属性塞进去：

```js
const count = 1000;
const positions = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
```

## 粒子材质

```js
const material = new THREE.PointsMaterial({
  size: 0.1,             // 每个粒子的大小
  color: 0xff00ff,       // 粒子颜色
  sizeAttenuation: true, // 粒子随距离缩放
  transparent: true,     // 支持透明通道
  alphaMap: texture,     // 粒子贴图（如圆形、星形等）
  depthWrite: false      // 防止粒子彼此遮挡（建议加）
});
```

 `alphaMap` 通常用一个圆形的 PNG 来表现「发光点点」的感觉。

### alphaTest

`material.alphaTest` 控制了**像素透明裁剪的阈值**：如果像素的透明度小于这个值，就**完全丢弃这个像素**，不会渲染它（也不会写入深度缓冲）。

假设你有一张 PNG 贴图，比如一片**叶子**、**栅栏**、**铁丝网**，你不想建复杂几何，只想用 alpha 贴图遮掉空白区域：

```js
const material = new THREE.MeshStandardMaterial({
  map: colorTexture,
  alphaMap: alphaTexture,
  transparent: true,  // 可选（也可以不写）
  alphaTest: 0.5      // 小于0.5的像素会被完全剔除
});
```

+ `alphaTest = 0.5` → 意思是：“只渲染透明度 >= 0.5 的像素”

+ 剩下的像素会被**直接丢弃**（不是 0 透明，而是根本不画了！）

+ 被丢弃的像素也**不会阻挡其他物体**（不会进深度缓冲）

这样透明区域就会被**像素级裁切掉**，完全不可见、不会干扰深度测试，也不会参与渲染。

### depthTest

`depthTest` 控制了材质是否**参与深度测试（Z-buffer）**：如果为 `false`，该材质的像素会**跳过遮挡比较**，**总是被画出来**（无视深度遮挡，即使它“应该”在后面）。

想象你在画画，Z-buffer 就像一个“谁先来的谁在前”的规则。如果你设置：

```js
material.depthTest = false;
```

就相当于告诉 Three.js：「别管这玩意儿在后面还是前面，反正你就画它，它必须出现！」

#### 使用场景

| 场景                        | 为什么用 `depthTest: false`              |
| --------------------------- | ---------------------------------------- |
| **UI / HUD / 提示牌**       | 保证始终显示在最上层（比如健康条、光标） |
| **透明图层叠加效果**        | 像某些后处理叠加材质，需要无视遮挡       |
| **发光材质（glow sprite）** | 希望亮片浮在表面而不被遮住               |
| **指示线、轮廓线**          | 比如用线框包围物体，不能被挡掉           |
| **可视化辅助物体**          | 比如调试器用的 helper 线、标记点等       |

### blending

`blending` 控制当前材质的像素颜色，如何与已绘制的像素“混合合成”。

粒子系统中几乎必配 `AdditiveBlending`可以让多个粒子颜色 **叠加变亮**，越重叠越亮，超炫。

#### 常见模式

| 常量                        | 效果                                         | 用途               |
| --------------------------- | -------------------------------------------- | ------------------ |
| `THREE.NoBlending`          | 不混合（默认）                               | 不透明物体         |
| `THREE.NormalBlending`      | 透明混合（默认在 transparent = true 时启用） | 一般透明玻璃       |
| `THREE.AdditiveBlending`    | 加色混合（像素变亮）                         | 发光粒子、火焰     |
| `THREE.SubtractiveBlending` | 减色混合（像素变暗）                         | 特殊滤镜/模糊特效  |
| `THREE.MultiplyBlending`    | 相乘混合（颜色叠深）                         | 烟雾、雾气、暗角   |
| `THREE.CustomBlending`      | 自定义（进阶）                               | 多通道高级混合效果 |

## 粒子动效

更新的 `position`，可以实现让粒子动起来：

```js
const posAttr = geometry.attributes.position;

for (let i = 0; i < count; i++) {
  const y = posAttr.getY(i);
  posAttr.setY(i, y - 0.01); // 模拟粒子下落
}

posAttr.needsUpdate = true;
```

也可以通过 shader 动态控制（[[ShaderMaterial]]）。

## 使用场景

| 应用     | 描述                               |
| -------- | ---------------------------------- |
| 星空     | 随机分布白色粒子，高度渐变         |
| 雨雪     | 粒子下落 + 重置                    |
| 爆炸     | 粒子向四周扩散                     |
| 魔法     | 粒子旋转环绕、颜色渐变             |
| 数字艺术 | 粒子组成字、图、logo（用图像采样） |