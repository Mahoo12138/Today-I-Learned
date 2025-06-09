## 理解

`MeshMatcapMaterial` 是一种**基于环境贴图的“烘焙光照材质”**，用一张 Matcap 贴图（材质捕捉）模拟光照、阴影、高光，无需真实光源，也无需复杂 shader。

> `Matcap = Material Capture`，意思是“捕捉某种材质外观的一张图”。
>
> - 它是一张圆形贴图，记录了一个球在某种材质下的光照效果
> - 渲染时，模型表面会用**法线方向去查这张贴图**，以模拟真实感材质

看图就懂了：

![](matcap.png)

## 优势

| 优点             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| 无需光照         | 材质自带明暗高光，适合静态/卡通/展示类项目                   |
| 渲染快           | 不参与实时光照计算，节省 GPU                                 |
| 艺术风格强       | 你可以用不同风格的 matcap 图做出金属、塑料、陶瓷、卡通等视觉 |
| 支持透明 / alpha | 可以和 `transparent/alphaMap` 等属性组合                     |

## 配置项

```js
const matcap = new THREE.MeshMatcapMaterial({
  matcap: texture,         // 材质贴图
  color: 0xffffff,         // 可以叠加颜色
  flatShading: false,      // 是否平面着色
  transparent: true,       // 是否开启透明
  alphaMap: alphaTexture,  // 局部透明控制
  side: THREE.DoubleSide   // 控制渲染面
});
```

##  Matcap 图资源

- https://github.com/nidorx/matcaps

  