## Concurrent Mode

> [深入剖析 React Concurrent - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/60307571)

这是一个实验性的功能，且是`React`渐进升级策略中的产物，在 React 18 中，已经整合为 Concurrent Feature 了；

Concurrent Mode 是 Async Mode 的[重新定义](https://github.com/facebook/react/pull/13732)，来凸显出 React 在不同优先级上的执行能力，与其它的异步渲染方式进行区分；以下是 React 官方对 Concurrent Mode 的描述：

> *... a set of new features that help React apps stay responsive and gracefully adjust to the user’s device capabilities and network speed*

对该模式的一个感知，可体验 Dan Abramov  在 JSConf Iceland 上演示的 [Demo](https://link.zhihu.com/?target=https%3A//codesandbox.io/s/koyz664q35) ，Concurrent  能使 React 在长时间渲染的场景下依旧保持良好的交互性，能优先执行高优先级变更，不会使页面处于卡顿或无响应状态，从而提升应用的用户体验。

### 浏览器原理

众所周知，JS 是单线程的，浏览器是多线程的，除了 JS 线程以外，还包括 UI 渲染线程、事件线程、定时器触发线程、HTTP 请求线程等等。

JS 线程是可以操作 DOM 的，如果在操作 DOM 的同时 UI 线程也在进行渲染的话，就会发生不可预期的展示结果，因此 **JS 线程与 UI 渲染线程是互斥的**，每当 JS 线程执行时，UI 渲染线程会挂起，UI 更新会被保存在队列中，等待 JS 线程空闲后立即被执行。

对于事件线程而言，当一个事件被触发时该线程会把事件添加到队列末尾，等待 JS 线程空闲后处理。因此，长时间的 JS 持续执行，就会造成 UI 渲染线程长时间地挂起，触发的事件也得不到响应，用户层面就会感知到页面卡顿甚至卡死了，Sync 模式下的问题就由此引起。

大多数的设备帧率是 60，即每帧 16.67 ms，其中浏览器每一帧的过程如图：

![[IMG-20250301171006056.png]]

保证流畅，在一帧中，需要将 JS 执行时间控制在合理的范围内，不影响后续 Layout 与 Paint 的过程。

`requestIdleCallback` 就能够充分利用帧与帧之间的空闲时间来执行 JS，可以根据 callback 传入的 dealine 判断当前是否还有空闲时间（timeRemaining）用于执行。由于浏览器可能始终处于繁忙的状态，导致 callback 一直无法执行，它还能够设置超时时间（timeout），一旦超过时间（didTimeout）能使任务被强制执行。

> **`window.requestIdleCallback()`**方法插入一个函数，这个函数将在浏览器空闲时期被调用。
>
> 这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应。函数一般会按先进先调用的顺序执行，然而，如果回调函数指定了执行超时时间`timeout`，则有可能为了在超时前执行函数而打乱执行顺序。

![[IMG-20250303204545137.png]]

上图可知， `requestIdleCallback` 是在 Layout 与 Paint 之后执行的，也就是说，`requestIdleCallback `中适合做 JS 计算，不建议进行 DOM 更新，因为会重新出发 Layout 和Paint，导致帧的时间不可控；

`requestIdleCallback` 的兼容性也比较差：

+ ["requestAnimationFrame" | Can I use... Support tables for HTML5, CSS3, etc](https://caniuse.com/?search=requestAnimationFrame )
+ ["requestIdleCallback" | Can I use... Support tables for HTML5, CSS3, etc](https://caniuse.com/?search=requestIdleCallback )

在 React 内部采用 `requestAnimationFrame` 作为 [ployfill](https://link.zhihu.com/?target=https%3A//github.com/facebook/react/blob/v16.8.0/packages/scheduler/src/Scheduler.js%23L455)，通过 [帧率动态调整](https://link.zhihu.com/?target=https%3A//github.com/facebook/react/blob/v16.8.0/packages/scheduler/src/Scheduler.js%23L649)，计算 timeRemaining，模拟 `requestIdleCallback`，从而实现时间分片（Time Slicing），一个时间片就是一个渲染帧内 JS 能获得的最大执行时间。`requestAnimationFrame` 触发在 Layout 与 Paint 之前，更方便做 DOM 变更。

> react 对于 `requestIdleCallback` 的 polyfill 并不是通过 `requestAnimationFrame` 实现的，而是通过 `setTImeout`(no-DOM environment) / `postMessage` (Dom environment) 实现的。只是说如果某些操作（比如动画）需要帧同步，则推荐使用 `requestAnimationFrame`。

**注意：**这里把卡顿问题都归结于 JS 长时间执行，这针对 **Concurrent 模式**所解决的问题而言，卡顿也有可能是大量 Layout 或是 Paint 造成的。

### 源码解析

```js
if (enableStableConcurrentModeAPIs) {
  React.ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
  React.Profiler = REACT_PROFILER_TYPE;
} else {
  React.unstable_ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
  React.unstable_Profiler = REACT_PROFILER_TYPE;
}

export const REACT_CONCURRENT_MODE_TYPE = hasSymbol
  ? Symbol.for('react.concurrent_mode')
  : 0xeacf;
```

## flushSync

强制使用同步更新的新 API，

- flushSync 内部的 setState 依然会合并成一次同步更新
- flushSync 会优于同级的 setState 先更新（同步更新，肯定比异步快）

```js
function flushSync<A, R>(fn: (a: A) => R, a: A): R {
  invariant(
    !isRendering,
    'flushSync was called from inside a lifecycle method. It cannot be ' +
      'called when React is already rendering.',
  );
  const previousIsBatchingUpdates = isBatchingUpdates;
  isBatchingUpdates = true;
  try {
    return syncUpdates(fn, a);
  } finally {
    isBatchingUpdates = previousIsBatchingUpdates;
    performSyncWork();
  }
}
```

