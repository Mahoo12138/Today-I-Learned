## Service Worker 和  Web Worker，说说这两个的区别

### 基本定义

### Web Worker

- **作用**：用于在浏览器中创建后台线程，执行一些不阻塞 UI 的计算密集型任务。
- **运行环境**：浏览器线程（非主线程），但不具备 DOM 操作能力。
- **用途场景**：大数据计算、复杂逻辑处理（如加密、图像处理）等，防止主线程卡顿。

### Service Worker

- **作用**：是浏览器在后台运行的代理线程，拦截并控制网络请求，缓存资源，实现离线支持。
- **运行环境**：独立于网页的线程，生命周期与页面分离。
- **用途场景**：离线缓存、推送通知、网络代理、后台同步 —— 是 PWA（渐进式 Web 应用）核心组件。

## 核心区别对比

| 特性     | Web Worker                      | Service Worker                                               |
| -------- | ------------------------------- | ------------------------------------------------------------ |
| 启动方式 | 显式创建（`new Worker()`）      | 注册并由浏览器在合适时机启动（`navigator.serviceWorker.register()`） |
| 生命周期 | 与页面关联，页面关闭即销毁      | 独立于页面，生命周期受浏览器控制（install → activate）       |
| 线程角色 | 执行计算任务                    | 拦截网络请求、管理缓存，类似 HTTP 代理                       |
| DOM 访问 | ❌ 不可访问 DOM                  | ❌ 不可访问 DOM                                               |
| 网络拦截 | ❌ 无法拦截请求                  | ✅ 可通过 `fetch` 事件拦截、响应请求                          |
| 缓存能力 | ❌ 没有                          | ✅ 可使用 Cache API 缓存资源                                  |
| 通信方式 | 与主线程通过 `postMessage` 通信 | 与页面、其他 SW 客户端通过 `postMessage`                     |
| 常用场景 | 密集计算、多线程处理            | 离线应用、消息推送、请求缓存优化                             |

## 使用示例

### Web Worker 示例

```js
// worker.js
self.onmessage = function(e) {
  const result = heavyComputation(e.data)
  self.postMessage(result)
}

// main.js
const worker = new Worker('worker.js')
worker.postMessage(data)
worker.onmessage = e => {
  console.log('Result:', e.data)
}
```

### Service Worker 示例

```js
// sw.js
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request)
    })
  )
})

// 注册
navigator.serviceWorker.register('/sw.js')
```

## 总结语义化对比

| 分类         | Web Worker     | Service Worker             |
| ------------ | -------------- | -------------------------- |
| 「线程」     | 多线程计算工人 | 网络代理守卫者             |
| 「适合干啥」 | 背景中干体力活 | 控制网络流量、增强离线体验 |
| 「谁来启动」 | 你手动调用     | 浏览器控制启动与生命周期   |

如果在实际项目中用到过 Service Worker，比如用 Workbox 做离线缓存，或者用 Web Worker 优化过长时间运行的逻辑（如图像压缩或 WebAssembly 运算），可以顺便提一下，这会是很加分的点。