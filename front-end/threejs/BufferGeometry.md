## 简介

`BufferGeometry` 是一种高效的几何数据容器，用于存储和描述 3D 模型的顶点、法线、UV、颜色等信息。它取代了旧的 `Geometry` 类（已废弃），以更贴近底层 GPU 的方式组织数据，速度更快、控制更灵活。

## 构成结构

一个 `BufferGeometry` 本质上就是一组属性（attributes）组成的数据表格，每个属性都是 `BufferAttribute` 或 `InterleavedBufferAttribute`。

常见属性：

| 属性名     | 说明                         |
| ---------- | ---------------------------- |
| `position` | 顶点位置（必须）             |
| `normal`   | 法线，用于光照               |
| `uv`       | UV 坐标，用于贴图            |
| `color`    | 顶点颜色                     |
| `index`    | 索引，表示顶点复用（三角面） |

## 自定义几何体

```js
const geometry = new THREE.BufferGeometry();

// 顶点坐标（每3个为一个点）
const vertices = new Float32Array([
  0, 0, 0,
  1, 0, 0,
  0, 1, 0
]);

geometry.setAttribute(
    'position', 
	new THREE.BufferAttribute(vertices, 3)
);

```

`BufferAttribute` 第二个参数 3 表示每组数据是 3 个一组，对应 x, y, z 。

## 索引 vs 非索引

- 默认是“非索引”模式：每个三角形独立顶点
- 添加 `index` 可以复用顶点，提高效率：

```js
const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
geometry.setIndex(new THREE.BufferAttribute(indices, 1));
```

## 自定义形状

```js
// 平面矩形
const geometry = new THREE.BufferGeometry();

const vertices = new Float32Array([
  -1, -1, 0,
   1, -1, 0,
   1,  1, 0,
  -1,  1, 0
]);

const indices = new Uint16Array([
  0, 1, 2,
  2, 3, 0
]);

geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.setIndex(new THREE.BufferAttribute(indices, 1));
```

## 原理浅析

`BufferGeometry` 是一个**为 WebGL 服务的数据封装器**，它的任务是把**顶点、法线、UV 等属性以结构化的方式上传到 GPU 的 buffer（缓存区）中**，供后续 shader 使用。

可以把它理解成 ：

```
BufferGeometry
 ├── attributes.position → Float32Array → GPU buffer (顶点位置)
 ├── attributes.normal   → Float32Array → GPU buffer (法线)
 ├── attributes.uv       → Float32Array → GPU buffer (UV坐标)
 └── index               → Uint16Array  → GPU element index buffer
```

### 创建时

```js
geometry.setAttribute('position', new THREE.BufferAttribute(data, 3));
```

- `BufferAttribute` 持有一个 `TypedArray`（比如 `Float32Array`）
- 3 代表每三个 float 是一个顶点（`x, y, z`）

`BufferGeometry` 存起来（CPU 内存中），它并不会立刻上传到 GPU，而是在渲染时，Three.js 会自动检测哪些属性有变化，然后再上传。

### 渲染时

```js
renderer.render(scene, camera);
```

Three.js 渲染管线会：

+ 找到 mesh 的 `geometry` 和 `material`
+ 为每个 attribute 创建 `WebGLBuffer`
+ 把 TypedArray 上传到 GPU （`gl.bufferData()`）
+ 如果设置了 `geometry.index`，也会作为 `ELEMENT_ARRAY_BUFFER` 上传
+ 绑定 shader 中的 attribute location
+ 走完一整套 vertex → fragment shader 渲染流程

### 关键点

| 操作                  | 对应 WebGL 行为                                              |
| --------------------- | ------------------------------------------------------------ |
| `.setAttribute()`     | 建立 typed array 缓存（CPU）                                 |
| `.needsUpdate = true` | 标记为 dirty，下次 render 自动上传                           |
| `renderer.render()`   | 触发 `gl.bindBuffer()` / `gl.bufferData()` / `gl.vertexAttribPointer()` 等 |
| `.dispose()`          | 手动清理 GPU buffer                                          |