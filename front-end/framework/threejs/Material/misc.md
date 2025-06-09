当使用需要额外 UV 通道的特性时（如 `aoMap` 环境遮挡贴图），Three.js 要求几何体必须包含 `uv2` 属性。通常可以通过复用原始 UV 数据来满足这一要求：

```js
plane.geometry.setAttribute(
    'uv2',
    plane.geometry.attributes.uv.clone()
)

plane.geometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2)
)
```

---
