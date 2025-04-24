## 概述

**MIP Mapping** 是一种为纹理生成不同分辨率“缩略图”的技术，目的是提升渲染质量和性能，尤其是在纹理很远、很小时。

## 为什么需要 MIP Mapping？

我们渲染场景时，纹理会出现在**远处或斜角**，屏幕上它只占几个像素，而纹理本身可能是 1024x1024 的高分图。

如果直接采样原图：

- 会出现**锯齿、摩尔纹、闪烁**
- 性能浪费严重（花大量算力去渲染几个像素）

🎯 **解决方案：提前准备多个小版本贴图，在合适距离使用对应清晰度版本。**

## MIP Map 的结构（视觉理解）

```text
1024x1024（原始贴图）
↓
512x512
↓
256x256
↓
128x128
↓
...
↓
1x1
```

每一级都是上一层的一半，每层提前预处理好，GPU 会根据相机距离自动选择合适等级。

## Three.js 中怎么处理 MIP Maps？

默认情况下，**只要你的纹理尺寸是 2 的幂次方（power of 2）**，Three.js 就会自动生成 MIP Maps。

```js
const texture = new THREE.TextureLoader().load('xxx.jpg');
// 如果图像尺寸是 1024x1024，Three.js 会自动生成 MIP maps
```

非 power-of-two（非 2 的幂）纹理默认**不会启用 MIP Mapping**，需处理： 

 ```js
 texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
 texture.minFilter = THREE.LinearFilter;
 ```

### 强制关闭

```js
texture.generateMipmaps = false;
texture.minFilter = THREE.LinearFilter; // 不使用 mipmap 过滤器
```

## 常见过滤器

| 属性         | 含义                           | 推荐                                 |
| ------------ | ------------------------------ | ------------------------------------ |
| `minFilter`  | 缩小时的采样方式               | 用 `LinearMipmapLinearFilter` 最平滑 |
| `magFilter`  | 放大时的采样方式               | 一般用 `LinearFilter`                |
| `anisotropy` | 各向异性过滤，提升斜角纹理质量 | 可配合 MIP 更进一步优化              |

```js
texture.minFilter = THREE.LinearMipmapLinearFilter;
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
```

