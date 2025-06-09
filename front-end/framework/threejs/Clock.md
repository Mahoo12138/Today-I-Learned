`Clock` 是一个时间管理类，用来追踪程序运行的时间或每帧之间的时间差。

```js
const clock = new THREE.Clock();
```

## 常用 API 一览

```js
clock.getDelta();     // 返回距离上一次调用的秒数（秒），自动重置
clock.getElapsedTime(); // 返回从 Clock 创建以来的总时间（秒）

clock.start();        // 重新启动
clock.stop();         // 停止（不再更新时间）
clock.running;        // 是否在运行

clock.elapsedTime;    // 总时间，等价于 getElapsedTime()
```

## 使用场景

### 1. **驱动动画（最常用）**

```js
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta(); // 每帧间隔时间（单位：秒）
  mesh.rotation.y += delta;       // 帧率独立的旋转动画

  renderer.render(scene, camera);
}
```

👉 不用关心帧率高低，动画总是**以时间为单位平滑推进**

------

### 2. **模拟物理、粒子系统**

```js
velocity += acceleration * delta;
position += velocity * delta;
```

- 物理模拟需要**基于时间的积分**
- 用 `getDelta()` 就可以实现帧率独立的计算

------

### 3. **计时器/倒计时/节奏控制**

```js
if (clock.getElapsedTime() > 5) {
  triggerBoom();
}
```