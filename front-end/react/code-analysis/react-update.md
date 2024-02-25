## Update

### 位置

在`render`函数中调用了`updateContainer()`：

+ `updateContainer()` 函数中计算出 `expirationTime`；
+ 传入`updateContainerAtExpirationTime()`函数；
+ 再调用了`scheduleRootUpdate()`函数；
+ 最后传入`expirationTime`调用`createUpdate()`；

### 作用

+ 用来记录组件的状态变化，并存放在`UpdateQueue`中；
+ 多个`Update`可以同时存在；

例如创建了三个`setState()`，`React`是不会立即更新的，而是放到`UpdateQueue`中，再去更新；

### 数据结构

```js
export function createUpdate(expirationTime: ExpirationTime): Update<*> {
  return {
    // 更新的过期时间
    expirationTime: expirationTime,
    //0: 更新 1: 替换 2: 强制更新 3: 捕获性的更新
    tag: UpdateState,
    // 更新内容和对应的回调，比如 setState({}, callback)
    payload: null,
    callback: null,
	// 指向下一个更新
    next: null,
    // 指向下一个side effect
    nextEffect: null,
  };
}
```

### 源码解析

```js
export function updateContainer(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function,
): ExpirationTime {
  const current = container.current;
  const currentTime = requestCurrentTime();
  const expirationTime = computeExpirationForFiber(currentTime, current);
  return updateContainerAtExpirationTime(
    element,
    container,
    parentComponent,
    expirationTime,
    callback,
  );
}
```

在`updateContainer`函数中，先拿到了`container`上的`current`对象，即`rootFiber`上的`Fiber`对象；然后根据`requestCurrentTime`取得一个`currentTime`，即当前时间到 js 加载完时间的时间差值；最后通过`computeExpirationForFiber`计算出`expirationTime `，然后使用`updateContainerAtExpirationTime`更新`container`。

```js
// react\packages\react-reconciler\src\ReactFiberExpirationTime.js
export const NoWork = 0;
export const Sync = 1;
// Math.pow(2, 30) - 1
// 0b111111111111111111111111111111
export const Never = MAX_SIGNED_31_BIT_INT;

// react\packages\react-reconciler\src\ReactFiberScheduler.js
let currentRendererTime: ExpirationTime = msToExpirationTime(
  originalStartTimeMs,
);
let currentSchedulerTime: ExpirationTime = currentRendererTime;

function requestCurrentTime() {
  if (isRendering) {
    // We're already rendering. Return the most recently read time.
    return currentSchedulerTime;
  }
  // Check if there's pending work.
  findHighestPriorityRoot();
  if (
    nextFlushedExpirationTime === NoWork ||
    nextFlushedExpirationTime === Never
  ) {
    recomputeCurrentRendererTime();
    currentSchedulerTime = currentRendererTime;
    return currentSchedulerTime;
  }
  return currentSchedulerTime;
}
```

## UpdateQueue

```js
function scheduleRootUpdate(
  current: Fiber,
  element: ReactNodeList,
  expirationTime: ExpirationTime,
  callback: ?Function,
) {
  const update = createUpdate(expirationTime);
  update.payload = {element};
  // ...
  enqueueUpdate(current, update);
  scheduleWork(current, expirationTime);
  return expirationTime;
}
```

在 `createUpdate`之后，则会调用`enqueueUpdate`将新创建出来的`update`入队；`UpdateQueue`的主要作用则是依次执行队列内部的`update`；

### 数据结构

```js
export function createUpdateQueue<State>(baseState: State): UpdateQueue<State> {
    const queue: UpdateQueue<State> = {
        baseState,					// 更新后的 state
        firstUpdate: null,			// 队列中的第一个 update
        lastUpdate: null,			// 队列中的最后一个 update
        firstCapturedUpdate: null,	// 队列中第一个捕获类型的 update
        lastCapturedUpdate: null,	// 队列中最后一个捕获类型的 update
        firstEffect: null,			// 第一个 side effect
        lastEffect: null,			// 最后一个 side effect
        firstCapturedEffect: null,
        lastCapturedEffect: null,
	};
	return queue;
}
```

### 源码解析

```js
export function enqueueUpdate<State>(fiber: Fiber, update: Update<State>) {
  // Update queues are created lazily.
  const alternate = fiber.alternate;	// alternate 即 workInProgress
  let queue1;	// current的队列
  let queue2;	// alternate的队列
  if (alternate === null) {
    // There's only one fiber.
    queue1 = fiber.updateQueue;
    queue2 = null;
    if (queue1 === null) {
      // 初始化更新队列
      queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
    }
  } else {
    // There are two owners. 如果 alternate 不为空，则取各自的更新队列
    queue1 = fiber.updateQueue;
    queue2 = alternate.updateQueue;
    if (queue1 === null) {
      if (queue2 === null) {
        // Neither fiber has an update queue. Create new ones. 初始化
        queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
        queue2 = alternate.updateQueue = createUpdateQueue(
          alternate.memoizedState,
        );
      } else {
        // Only one fiber has an update queue. Clone to create a new one.
        queue1 = fiber.updateQueue = cloneUpdateQueue(queue2);
      }
    } else {
      if (queue2 === null) {
        // Only one fiber has an update queue. Clone to create a new one.
        queue2 = alternate.updateQueue = cloneUpdateQueue(queue1);
      } else {
        // Both owners have an update queue.
      }
    }
  }
  if (queue2 === null || queue1 === queue2) {
    // There's only a single queue.
    appendUpdateToQueue(queue1, update);
  } else {
    // There are two queues. We need to append the update to both queues,
    // while accounting for the persistent structure of the list — we don't
    // want the same update to be added multiple times.
    if (queue1.lastUpdate === null || queue2.lastUpdate === null) {
      // One of the queues is not empty. We must add the update to both queues.
      appendUpdateToQueue(queue1, update);
      appendUpdateToQueue(queue2, update);
    } else {
      // Both queues are non-empty. The last update is the same in both lists,
      // because of structural sharing. So, only append to one of the lists.
      appendUpdateToQueue(queue1, update);
      // But we still need to update the `lastUpdate` pointer of queue2.
      queue2.lastUpdate = update;
    }
  }
}
```

`queue1`取的是`fiber.updateQueue`；`queue2`取的是`alternate.updateQueue`；

+ 如果两者均为`null`，则调用`createUpdateQueue()`获取初始队列；
+ 如果两者之一为`null`，则调用`cloneUpdateQueue()`从对方中获取队列；
+ 如果两者均不为`null`，则将`update`作为`lastUpdate`；







