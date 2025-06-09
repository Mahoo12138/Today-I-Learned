## 概述

`TextGeometry` 是一种几何体类，用于生成具有立体厚度的 3D 字符串，可以像普通 mesh 一样加材质、打光、投影。

它是 `THREE.BufferGeometry` 的子类，内部用的是字体轮廓数据生成网格。

## 使用方式

```js
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const loader = new FontLoader();
loader.load('fonts/helvetiker_regular.typeface.json', (font) => {
  const geometry = new TextGeometry('Hello Three.js', {
    font: font,
    size: 1,
    height: 0.2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelSegments: 3
  });

  const material = new THREE.MeshStandardMaterial({ color: 0xff6600 });
  const textMesh = new THREE.Mesh(geometry, material);
  scene.add(textMesh);
});
```

在 **Three.js r162** 版本中，`TextGeometry` 的参数 `height` 被正式重命名为 `depth`，以更准确地描述文字的“挤出厚度”方向。

```diff
const geometry = new TextGeometry('Hello Three.js', {
  font: font,
  size: 1,
-  height: 0.2,
+  depth: 0.2, 
  bevelEnabled: true,
  bevelThickness: 0.03,
  bevelSize: 0.02,
  bevelSegments: 3
});
```

## 参数说明

| 参数             | 作用                       |
| ---------------- | -------------------------- |
| `font`           | 加载的字体（必须）         |
| `size`           | 字体大小                   |
| `height`         | 厚度（Z轴方向）            |
| `curveSegments`  | 曲线的细分精度，越高越平滑 |
| `bevelEnabled`   | 是否启用斜角（边缘挤出）   |
| `bevelThickness` | 斜角深度                   |
| `bevelSize`      | 斜角大小（边缘缩进）       |
| `bevelSegments`  | 斜角细分段数               |

## 字体资源

Three.js 使用 `.typeface.json` 格式的字体文件，可以：

- 用 [facetype.js](https://gero3.github.io/facetype.js/) 字体转换工具 把 TTF 转成 JSON
- 从 Three.js 自带 fonts 目录里找（如 `helvetiker`, `optimer`, `gentilis`）

## 小贴士

- 渲染 `TextGeometry` 时最好使用 `StandardMaterial` / `MatcapMaterial`，视觉更炫
- 文字默认在左下角对齐，可用 `geometry.center()` 居中对齐
- 可配合 `EdgesGeometry` 或 `OutlinePass` 做描边、发光特效