## 概述

`Texture` 就是“贴在模型上的图像数据”，它决定了模型的视觉外观，如颜色、光泽、凹凸感、透明度等。

## 常见来源

| 类型     | 类名                | 用途                                 |
| -------- | ------------------- | ------------------------------------ |
| 图像     | `TextureLoader`     | 加载 jpg/png 等贴图                  |
| 视频     | `VideoTexture`      | 用视频做动态贴图                     |
| Canvas   | `CanvasTexture`     | 用 HTML5 Canvas 动态绘制纹理         |
| 数据     | `DataTexture`       | 用原始数据（如高度图、热力图）做纹理 |
| 环境贴图 | `CubeTextureLoader` | 用于反射、天空盒等                   |

## 常见属性和配置

```js
const texture = new THREE.TextureLoader().load('xxx.jpg');

texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;

texture.repeat.set(2, 2);
texture.offset.set(0.5, 0.5);
texture.rotation = Math.PI / 4;

texture.encoding = THREE.sRGBEncoding;
texture.needsUpdate = true;
```



| 属性                    | 含义                           |
| ----------------------- | ------------------------------ |
| `wrapS / wrapT`         | 控制贴图重复方式               |
| `repeat`                | 控制纹理重复倍数               |
| `offset`                | 控制纹理偏移                   |
| `rotation`              | 控制纹理旋转角度               |
| `minFilter / magFilter` | 控制缩放时纹理的模糊度         |
| `flipY`                 | 是否上下颠倒（WebGL 默认行为） |





### minFilter 和 magFilter

| 名称        | 作用                                         | 应用场景         |
| ----------- | -------------------------------------------- | ---------------- |
| `minFilter` | **纹理缩小时**（物体远离、纹理变小）如何采样 | 比如地板远处渐远 |
| `magFilter` | **纹理放大时**（物体靠近、纹理放大）如何采样 | 比如贴图贴在眼前 |

#### 放大时（`magFilter`）

| 选项                  | 说明                             |
| --------------------- | -------------------------------- |
| `THREE.NearestFilter` | 最近邻采样（像素块感强，马赛克） |
| `THREE.LinearFilter`  | 双线性插值采样（平滑）✅ 推荐     |

只能用这两个，没有 mipmap 选项，因为放大时不需要多级贴图。

#### 缩小时（`minFilter`）

| 选项                               | 说明                       | 是否用 Mipmap |
| ---------------------------------- | -------------------------- | ------------- |
| `THREE.NearestFilter`              | 最近邻采样，无 Mipmap      | ❌             |
| `THREE.LinearFilter`               | 双线性插值，无 Mipmap      | ❌             |
| `THREE.NearestMipmapNearestFilter` | 最近 MIP 等级 + 最近邻采样 | ✅             |
| `THREE.LinearMipmapNearestFilter`  | 最近 MIP 等级 + 双线性采样 | ✅             |
| `THREE.NearestMipmapLinearFilter`  | 插值 MIP 等级 + 最近邻采样 | ✅             |
| `THREE.LinearMipmapLinearFilter`   | 插值 MIP 等级 + 插值采样   | ✅             |

## 纹理素材网站

+ poliigon.com
+ 3dtextures.me
+ arroway-textures.ch

