## 什么是 glTF？

glTF（**GL Transmission Format**）是用于 3D 模型的「通用传输格式」，由 Khronos Group（开发 OpenGL 的组织）制定。它类似于 2D 图像中的 `.jpg` 或 `.png`，但专为 3D 模型设计。

### 核心组成部分

glTF 文件本质是一个 JSON 文件（`.gltf`），描述 3D 模型的结构，并引用外部资源：

+ JSON 元数据：定义模型的网格（Mesh）、材质（Material）、动画（Animation）、相机（Camera）等。
+ 二进制几何数据（`.bin`）：存储顶点坐标、法线、索引等底层数据。
+ 纹理贴图（`.png/.jpg`）：为模型表面提供颜色、粗糙度、法线等细节。

**示例结构**

```json
{
  "asset": { "version": "2.0" },
  "scenes": [],
  "nodes": [],
  "meshes": [],
  "materials": [],
  "buffers": [ { "uri": "Duck0.bin", "byteLength": 102400 } ],
  "images": [ { "uri": "DuckCM.png" } ]
}
```

### 四种常见格式

根据文件组织方式，glTF 有以下变体：

| 格式类型               | 文件结构                  | 特点与适用场景                                               |
| :--------------------- | :------------------------ | :----------------------------------------------------------- |
| **glTF (ASCII)**       | `.gltf + .bin + textures` | 文本元数据（可编辑） + 外部二进制和纹理。**适合调试**和手动修改。 |
| **glTF-Binary (.glb)** | 单个 `.glb` 文件          | 将 JSON、二进制数据、纹理打包为一个二进制文件。体积小，加载快，**适合网页**直接使用。 |
| **glTF-Draco**         | `.gltf` + 压缩后的 `.bin` | 使用 Draco 压缩几何数据，体积更小（适合网络传输），但**需要解压**后才能渲染。 |
| **glTF-Embedded**      | 单个 `.gltf` 文件         | 所有资源（JSON、二进制、纹理）嵌入**一个文件**。无需外部依赖，但体积大，不便于复用。 |

## 在 Three.js 中加载

Three.js 提供了 `GLTFLoader` 插件来加载 glTF 模型。以下是不同格式的加载方法：

### 加载 .gltf（标准格式）

```js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load(
  '/models/Duck/glTF/Duck.gltf', // 路径指向 .gltf 文件
  (gltf) => {
    scene.add(gltf.scene); // 将模型添加到场景中
  },
  (event) => {
    console.error('模型加载中:', event);
  },
  (error) => {
    console.error('加载模型失败:', error);
  }
);
```

### **加载 `.glb`（二进制格式）**

```js
loader.load(
  '/models/Duck/glTF-Binary/Duck.glb', // 直接指向 .glb 文件
  (gltf) => {
    scene.add(gltf.scene);
  }
);
```

### 加载 Draco 压缩模型

需要额外引入 Draco 解压器：

```js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/third_party/draco/'); // Draco 解码器路径

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load(
  '/models/Duck/glTF-Draco/Duck.gltf',
  (gltf) => {
    scene.add(gltf.scene);
  }
);
```

> **Draco** 是 Google 开发的开源库，专门用于压缩和解压缩 3D 网格（Mesh）和点云（Point Cloud）数据。
>
> - **核心作用**：通过减少几何数据体积（如顶点、法线、索引），优化 3D 模型在网络传输和存储中的效率。
> - **压缩效果**：相比未压缩的 glTF 模型，Draco 可将文件体积缩小 **5-10 倍**（例如从 10MB 压缩到 1-2MB）。

#### 使用 Draco 解码器

在 `threejs@0.174.0` 版本中是内置了 Draco 的，位于 *three/examples/jsm/libs/draco* 路径下：

```plaintext
/draco/
├── draco_decoder.js
├── draco_encoder.js
├── draco_decoder.wasm
├── draco_wasm_wrapper.js
```

使用直接将整个路径复制到项目服务器对于的路径下，如 `/third_party/draco/` 。