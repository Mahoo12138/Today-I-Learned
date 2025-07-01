## useMemo 数据缓存时，对小数据就有点浪费，为什么呢？

`useMemo` 自身是有成本的，每次 render 阶段，`useMemo` 都会：

1. 找到对应的 hook 索引（一个 fiber 上的 hook 链表）
2. 浅比较 `deps`
3. 若不同则执行 `fn()`
4. 更新 `memoizedState`（hook 的内部状态）

即使依赖不变，**浅比较本身也要进行**，而这不是 0 成本的。每次 render 做这些浅比较、hook 状态维护等操作，本身的开销 **不比直接执行轻量函数更小**；

在 Concurrent Mode 下，即使 `deps` 不变，render 被中断或重试，仍可能执行 memo 的 `fn()`。

React 团队曾在 RFC 和 issue 中多次提醒开发者不要滥用 `useMemo`，它只是个 **微优化工具**，不是性能提升的万金油。

###  **源码核心逻辑（简化版）**

```js
function useMemo(nextCreate, deps) {
  const hook = updateWorkInProgressHook()

  const nextDeps = deps
  const prevState = hook.memoizedState

  if (prevState !== null) {
    if (areHookInputsEqual(nextDeps, prevState[1])) {
      return prevState[0]
    }
  }

  const nextValue = nextCreate()
  hook.memoizedState = [nextValue, nextDeps]
  return nextValue
}
```

+ `updateWorkInProgressHook()` 会返回当前 fiber 上对应的 hook 节点

+ `areHookInputsEqual()` 做的是 **浅比较**
+ 如果依赖项没有变化，则返回上一次的值
+ 否则执行 `nextCreate()`，重新计算，并缓存 `[value, deps]`
