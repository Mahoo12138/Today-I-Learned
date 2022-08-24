For reference, here's how HTML defines the event loop for renderer threads and worker threads: https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model. Definition wise, a "task" in HTML parlance is a "macrotask" unless specified otherwise. A quick summary:

> 1. Dequeue a task from one of the task queues. This allows the browser to prioritize different types of tasks. For example, a `requestAnimationFrame` task put into their own task queue might be higher priority than a timer task when appropriate, while a `requestIdleCallback` task might be lower priority.
> 2. Run that task.
> 3. While the microtask queue is not empty, dequeue and run the earliest-queued microtask. (HTML calls this [perform a microtask checkpoint](https://html.spec.whatwg.org/multipage/webappapis.html#perform-a-microtask-checkpoint).)
> 4. If this is a renderer thread, update the page rendering.
> 5. If this is a worker thread, and there are no more tasks left in any task queues, exit the worker.

The way [`setTimeout()`](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-settimeout) works is roughly:

> 1. In another thread, run these steps:
>    1. Wait for some time, usually based on but could differ slightly from the provided timeout.
>    2. Queue a task to run the provided callback.
> 2. Return a number that could be passed to `clearTimeout()`.

In comparison, the way Node.js timers run is this:

> 1. Add the provided callback to the timer queue.
> 2. If the timer thread hasn't been started, then run these steps in another thread:
>    1. Wait for some time, usually the shortest timeout of a registered callback in the timer queue.
>    2. Queue a task to run these steps:
>       1. [Run *all* callbacks with this timeout, one by one.](https://github.com/nodejs/node/blob/e0395247c899af101f8a1f76a8554be1ff14040a/src/env.cc#L532-L539).
>       2. [If there are remaining callbacks in the timer, then redo step 2 "If the timer thread…" again.](https://github.com/nodejs/node/blob/e0395247c899af101f8a1f76a8554be1ff14040a/src/env.cc#L565)
>       3. [Run all microtasks.](https://github.com/nodejs/node/blob/e0395247c899af101f8a1f76a8554be1ff14040a/src/env.cc#L527) It's actually run in the destructor of `InternalCallbackScope` [here (when there are no `process.nextTick()` callbacks scheduled)](https://github.com/nodejs/node/blob/bfcf5b01bb4112b833a936a8266879b58ed391db/src/callback_scope.cc#L97-L99) or [here (when there are)](https://github.com/nodejs/node/blob/bfcf5b01bb4112b833a936a8266879b58ed391db/src/callback_scope.cc#L116).
>       4. Otherwise, terminate this thread.

(The "thread" here is idealized; libuv may or may not use threads to implement timers.)

This results in all timers of a specific timeout being run together rather than having microtasks run after each timer callback.

BTW, I realize that people who have commented here already probably knows how everything works already, but in case a summary is needed by anyone for context.

## JavaScript Event Loop vs Node JS Event Loop

原文地址：[JavaScript Event Loop vs Node JS Event Loop | by Deepal Jayasekara | Deepal’s Blog](https://blog.insiderattack.net/javascript-event-loop-vs-node-js-event-loop-aea2b1b85f5c)

事件循环对于新手来说是一个非常令人困惑的话题，并且通常不能完全理解。更让人困惑的是，有两个术语叫做“NodeJS事件循环”和“JavaScript事件循环”，后者指的是浏览器中的事件循环。这种区别导致了如下问题:

+ 这两者在行为上是相同的，相似的，还是完全不同的?

+ 如果不同，区别是什么?

+ 如果它们是相同的，为什么我们要消除“NodeJS事件循环”和“JavaScript事件循环”的歧义?

简而言之，是的，它们在某些方面是相似的。是的，它们在某些实现方面也是不同的。

因此，在本文中，我将通过几个例子来讨论这种消除歧义的方法，以澄清您可能对该主题存在的一些迫切的问题。

### 什么是“事件循环”?

术语“事件循环”是一种通用编程模式。它描述了一个简单的循环，迭代完成事件的结果，并处理它们。JavaScript/NodeJS 的事件循环也不例外。

当JavaScript 应用程序运行时，它们会触发各种事件，这些事件将导致相应的事件处理程序进入队列进行处理。事件循环持续监视任何排队的事件处理程序，并相应地处理它们。

### “事件循环”——根据HTML5规范

[HTML5 Spec](https://html.spec.whatwg.org/) 描述了一套标准指南，供应商可以用来开发浏览器/JavaScript 运行时或其他相关库。它还描述了一组实现事件循环模型的[准则](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)，以及其他可能与事件循环相关的JavaScript特性，如[计时器](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers)。

大多数浏览器和JS运行时都倾向于遵循这些准则，以便更好地在万维网上兼容。然而，在某些情况下，它们会稍微偏离这一单一的真相来源，从而导致有趣的结果

在本文中，我将讨论一些这样的情况，特别是 NodeJS 对比 Browser。我可能不会深入研究各个浏览器的实现细节，因为它们随时都可能发生变化。

### 客户端 vs 服务器端 JavaScript

多年来，JavaScript 一直局限于客户端应用程序，比如运行在浏览器上的交互式web应用程序。使用 NodeJS, JavaScript 也可以用于开发服务器端应用程序。虽然在两个用例中使用的是相同的编程语言，但客户端和服务器端有不同的需求。

浏览器是一个沙箱环境，浏览器中的 JavaScript 没有执行服务器端 JavaScript 可以执行的某些任务的自由，如文件系统操作，某些网络操作等。这就需要服务器端JavaScript (NodeJS)中的事件循环来满足这些额外的需求。

浏览器和 NodeJS 都用 JavaScript 实现了异步事件驱动模式。然而，“事件”，在浏览器的上下文中，是用户在网页上的交互(例如，点击，鼠标移动，键盘事件等)，但在 Node 的上下文中，事件是异步服务器端操作(例如，文件 I/O 访问，网络 I/O 等)。由于这种需求的差异，Chrome 和 Node 有不同的事件循环实现，尽管它们共享相同的 V8 JavaScript引擎来运行 JavaScript。

由于“事件循环”只是一种编程模式，V8 允许插入一个外部事件循环实现来配合它的 JavaScript 运行时。利用这种灵活性，Chrome 浏览器使用 [**libevent**](https://libevent.org/) 作为其事件循环实现，而NodeJS使用 [**libuv**](https://libuv.org/) 实现事件循环。因此，chrome的事件循环和 NodeJS 的事件循环是基于两个不同的库，它们有不同之处，但它们也有共同的“事件循环”编程模式的相似之处。

### 浏览器 vs Node-有什么不同?

#### 微观任务与宏观任务的区别

> 什么是微观任务和宏观任务？
>
> 简言之，宏任务和微任务是两种类型的异步任务。然而，微任务比宏任务具有更高的优先级。微任务的一个例子是 promise 回调。setTimeout 回调就是一个宏任务的例子。

浏览器和Node之间的一个显著区别是它们如何优先处理微任务和宏任务。尽管 ≥ v11.0.0 的 NodeJS 版本在这方面与浏览器的行为一致，但 v11.0.0 之前的NodeJS版本有显著的差异，我在之前的文章中也讨论过。

是时候尝试一下了！考虑下面的例子。

在本例中，我们将调度一组承诺回调(微任务)和计时器回调(宏任务)，以了解每个 JavaScript 运行时是如何执行它的。

```js
Promise.resolve().then(() => console.log('promise1 resolved'));
Promise.resolve().then(() => console.log('promise2 resolved'));
setTimeout(() => {
    console.log('set timeout3')
    Promise.resolve().then(() => console.log('inner promise3 resolved'));
}, 0);
setTimeout(() => console.log('set timeout1'), 0);
setTimeout(() => console.log('set timeout2'), 0);
Promise.resolve().then(() => console.log('promise4 resolved'));
Promise.resolve().then(() => {
    console.log('promise5 resolved')
    Promise.resolve().then(() => console.log('inner promise6 resolved'));
});
Promise.resolve().then(() => console.log('promise7 resolved'));
```

> 你也可以使用 `queuemmicrotask `在浏览器和Node中调度微任务。但对于本例，我将使用 Promise 回调，因为 `queuemmicrotask` 仅在 Node v11.0.0 及以上版本可用。

根据HTML5事件循环规范指南，事件循环在处理宏任务队列中的一个宏任务之后，应该完全处理微任务队列。在我们的例子中，当执行 `setTimeout3` 回调时，它调度了一个 `promise` 回调。根据 HTML5 规范，在移动到计时器回调队列中的任何其他回调之前，事件循环必须确保微任务队列为空。因此，它必须执行新添加的 promise 回调，该回调记录内部 `promise3` 的解析。处理完之后，微任务队列变为空，事件循环可以向前处理计时器回调队列中剩余的 `setTimeout1` 和 `setTimeout2` 回调函数。

但是在 v11.0.0 之前的 NodeJS 版本中，微任务队列只在事件循环的两个阶段之间被清空。因此，内部的 promis3 回调直到执行了所有的 `setTimeout3`、`setTimeout1` 和 `setTimeout2` 回调，并且事件循环试图移动到下一个阶段(即I/O回调阶段)才有机会。

#### 嵌套计时器的行为

不同的 NodeJS 和浏览器，以及不同的浏览器供应商/版本，计时器的行为是不同的。其中最有趣的两个事实是他延时为 0 的计时器的行为和嵌套计时器的行为。

> 提示：可以通过显式地将超时设置为0或省略 timeout 参数来创建延时为0的计时器。

作为理解这两种行为的实验，让我们在 Node v10.19.0、Node v11.0.0、Chrome、Firefox 和 Safari 中运行以下代码。这个代码片段将安排 8 个嵌套计时器：

```js
const startHrTime = () => {
  if (typeof window !== 'undefined') return performance.now();
  return process.hrtime();
}

const getHrTimeDiff = (start) => {
  if (typeof window !== 'undefined') return performance.now() - start;
  const [ts, tns] = (process.hrtime(start));
  return ts * 1e3 + tns / 1e6;
}

console.log('start')
const start1 = startHrTime();
const outerTimer = setTimeout(() => {
  const start2 = startHrTime();
  console.log(`timer1: ${getHrTimeDiff(start1)}`)
  setTimeout(() => {
      const start3 = startHrTime();
      console.log(`timer2: ${getHrTimeDiff(start2)}`)
      setTimeout(() => {
          const start4 = startHrTime();
          console.log(`timer3: ${getHrTimeDiff(start3)}`)
          setTimeout(() => {
              const start5 = startHrTime();
              console.log(`timer4: ${getHrTimeDiff(start4)}`)
              setTimeout(() => {
                  const start6 = startHrTime();
                  console.log(`timer5: ${getHrTimeDiff(start5)}`)
                  setTimeout(() => {
                      const start7 = startHrTime();
                      console.log(`timer6: ${getHrTimeDiff(start6)}`)
                      setTimeout(() => {
                          const start8 = startHrTime();
                          console.log(`timer7: ${getHrTimeDiff(start7)}`)
                          setTimeout(() => {
                              console.log(`timer8: ${getHrTimeDiff(start8)}`)
                          })
                      })
                  })
              })
          })
      })
  })
})
```

> 重要提示！为了精确地计算回调需要多长时间，我们在浏览器中使用了 `performance.now()`，在 NodeJS中使用了 `process.hrtime()`，使用了高分辨率计时器。为了便于分析，这些计算时间被四舍五入到两个小数中。此外，这些值不能 100% 保证在多次运行时是固定的，因为根据 CPU 的繁忙程度，触发 `setTimeout` 回调所需的时间将略高于提供的超时值。

我们的实验结果有几个重要的观察结果:

+ 即使你将超时设置为 0，所有的 NodeJS 计时器似乎至少在 1ms 后触发。

+ Chrome 似乎将前4个嵌套计时器的最小超时时间限制为 1ms。但之后，上限似乎增加到4毫秒。

+ 不像Chrome，Firefox 似乎没有限制前 4 个计时器的超时时间。但类似的 Chrome，它的上限最小超时 4ms 从第五个嵌套计时器开始。

+ Safari 似乎没有限制前 5 个定时器的超时时间。但它只从第 6 个嵌套计时器开始引入了 4ms 的上限。

那么，浏览器中的4ms超时上限是从哪里来的呢?

嵌套计时器的 4ms 上限实际上在HTML标准中有描述。根据标准：

> *“Timers can be nested; after five such nested timers, however, the interval is forced to be at least four milliseconds.”*

根据这个规则，这个上限将从嵌套的第 5 个计时器开始应用，正如我们在实验中观察到的 Chrome 和 Firefox。然而，虽然原因不清楚，Safari 似乎并没有严格遵守规则，因为它应用了第 6 嵌套计时器的上限，而不是第 5。

极客时间！在 Firefox 中，这个上限可以使用 **about:config** 中的 *dom.min_timeout_value*属性进行配置。默认情况下，根据HTML标准，这被设置为 4ms。喜欢调整和试验它！

如果我们把浏览器放在一边，观察Node的结果，我们可以清楚地看到Node似乎并不关心基于嵌套级别的超时限制。相反，Node 和Chrome 都分享了另一个有趣的行为。

#### 最小超时在所有的 Node 和 Chrome 的计时器

NodeJS 和 Chrome 都强制所有计时器的最小超时时间为 1ms，即使它们没有嵌套。但与 Chrome 不同的是，在NodeJS中，这 1ms 的延迟是固定的，与嵌套级别无关。

下面是 NodeJS `Timeout` 类的相应代码片段，其中对所有计时器强制执行最小 1ms 超时(并附有解释原因的注释)：

```js
// Enforcing minimum expiry (‘after’ parameter) of 1ms in Node if the expiry is less than 1ms.
function Timeout(callback, after, args, isRepeat, isRefed) {
  after *= 1; // Coalesce to number or NaN
  if (!(after >= 1 && after <= TIMEOUT_MAX)) {
    if (after > TIMEOUT_MAX) {
      process.emitWarning(`${after} does not fit into` +
                          ' a 32-bit signed integer.' +
                          '\nTimeout duration was set to 1.',
                          'TimeoutOverflowWarning');
    }
    after = 1; // Schedule on next tick, follows browser behavior
  }
  
  // ....redacted
}
```

Chrome 在 `DOMTimer` 类中做了类似的工作。(您还可以看到当 `maxTimerNestingLevel` 达到时施加的 4ms 上限。)

```cpp
DOMTimer::DOMTimer(ExecutionContext* context, PassOwnPtrWillBeRawPtr<ScheduledAction> action, int interval, bool singleShot, int timeoutID)
    : SuspendableTimer(context)
    , m_timeoutID(timeoutID)
    , m_nestingLevel(context->timers()->timerNestingLevel() + 1)
    , m_action(action)
{
    // ... redacted ...
    double intervalMilliseconds = std::max(oneMillisecond, interval * oneMillisecond);
    if (intervalMilliseconds < minimumInterval && m_nestingLevel >= maxTimerNestingLevel)
        intervalMilliseconds = minimumInterval;
    if (singleShot)
        startOneShot(intervalMilliseconds, FROM_HERE);
    else
        startRepeating(intervalMilliseconds, FROM_HERE);
}
```

正如您所看到的，不同的 JavaScript 运行时都有自己独特的实现，包括嵌套计时器和 0 超时计时器。在开发JavaScript应用程序/库，并且不严格依赖于运行时特定的行为以获得更好的兼容性时，记住这一点很重要。

#### process.nextTick 和 setImmediate

浏览器和NodeJS之间的另一个主要区别是 process.nextTick 和 setImmediate。

process.nextTick 严格来说只存在于 NodeJS 中，目前还没有对应的浏览器 API。虽然 nextTick 回调不一定是 NodeJS的 libuv 事件循环的一部分，但 nextTick 回调是 NodeJS 在事件循环期间跨越 C++ / JS 边界的结果。所以它可以被认为在某种程度上与事件循环有关。

`setImmediation` 也是一个特定于 nodejs 的 API。根据 [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate) and [caniuse.com](https://caniuse.com/#search=setImmediate) ，`setImmediation` 在IE 10、IE 11 和 Edge 的一些早期版本中都可以使用，目前还不清楚其他浏览器供应商是否会在某一天实现这个端点。然而，在撰写本文时，它还不是所有浏览器的标准特性，不应该在所有浏览器中使用。

## 相关链接

- [HTML Standard — Timers spec](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers)
- [Event loop: microtasks and macrotasks](https://javascript.info/event-loop)
- [WindowOrWorkerGlobalScope.setTimeout() — Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout)
- [libevent vs libuv · GitHub](https://gist.github.com/eddieh/c385193cf250aa51c9b1)
- [libevent](https://libevent.org/)
- [Event loop: microtasks and macrotasks](https://javascript.info/event-loop#)
- [HTML Standard — Event Loop](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)
- [ECMAScript® 2021 Language Specification](https://tc39.es/ecma262/#sec-jobs)
- [Source/core/frame/DOMTimer.cpp - chromium/blink - Git at Google](https://chromium.googlesource.com/chromium/blink/+/master/Source/core/frame/DOMTimer.cpp#93)
- Notes on setTimeout [WindowOrWorkerGlobalScope.setTimeout() — Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout#Notes)
- Removal of libev from libuv https://github.com/joyent/libuv/issues/485

+ https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model
+ https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-settimeout