原文地址：[Promises, Next-Ticks, and Immediates— NodeJS Event Loop Part 3, Deepal Jayasekara, Jul 22, 2017](https://blog.insiderattack.net/promises-next-ticks-and-immediates-nodejs-event-loop-part-3-9226cbe7a6aa)

上篇文章讲述了事件循环中的计时器，immediates 和每个队列如何按顺序执行。

这篇文章将关注事件循环如何处理 resolved/rejected promises (包括原生的 JS promises, Q promises, 和 Bluebird promises) 和 next tick 回调。如果你对 Promises 不熟悉，建议你先对 Promises 进行初步了解。

## 原生 Promises

> Node v11 引入了一些变化，对 `nextTick`，`Promise`，`setImmediate` 和 `setTimeout` 回调的执行顺序有巨大影响。详细介绍见 https://medium.com/@dpjayasekara/new-changes-to-timers-and-microtasks-from-node-v11-0-0-and-above-68d112743eb3

原生 promise 的回调被认为是一种微任务，并被添加到 microtask 队列，并紧接着 next tick 队列被处理。

![4.all-Q](D:\Workbench\每日学习\nodejs\EventLoop\res\4.all-Q.png)

```js
Promise.resolve().then(() => console.log('promise1 resolved'));
Promise.resolve().then(() => console.log('promise2 resolved'));
Promise.resolve().then(() => {
    console.log('promise3 resolved');
    process.nextTick(() => console.log('next tick inside promise resolve handler'));
});
Promise.resolve().then(() => console.log('promise4 resolved'));
Promise.resolve().then(() => console.log('promise5 resolved'));
setImmediate(() => console.log('set immediate1'));
setImmediate(() => console.log('set immediate2'));

process.nextTick(() => console.log('next tick1'));
process.nextTick(() => console.log('next tick2'));
process.nextTick(() => console.log('next tick3'));

setTimeout(() => console.log('set timeout'), 0);
setImmediate(() => console.log('set immediate3'));
setImmediate(() => console.log('set immediate4'));
```

以上代码的执行流程：

1. 5 个处理器添加到 resolved promises 微任务队列
2. 2 个处理器添加到 `setImmediate` 队列
3. 3 个 处理器添加到 `process.nextTick` 队列
4. 1 个 计时器添加到计时器队列
5. 2 个处理器添加到 `setImmediate` 队列

事件循环开始：

1. 发现和处理 `process.nextTick` 队列中 3 个待处理项
2. 发现和处理 promises 微任务队列中 5 个待处理项
3. 处理 promises 微任务队列过程中一个新的待处理项添加到 `process.nextTick` 队列
4. promises 微任务队列处理完后发现 `process.nextTick` 队列有一个待处理项，开始处理
5. `process.nextTick` 队列和 promises 微任务队列都为空后，移动到计时器队列，有 1 个过期计时器待处理，进行处理
6. 无过期计时器待处理后，移动到 I/O 阶段，因为没有挂起的 I/O，继续移动到 `setImmediate` 队列处理 4 个待处理项
7. 最后循环处理完所有事情，程序退出

> 为什么是 “promises microtask” 而不是 “microtask”？resolved/rejected promises 和 `process.nextTick` 都是微任务 microtask。

代码输出如下：

```
next tick1
next tick2
next tick3
promise1 resolved
promise2 resolved
promise3 resolved
promise4 resolved
promise5 resolved
next tick inside promise resolve handler
set timeout
set immediate1
set immediate2
set immediate3
set immediate4
```

## Q 和 Bluebird

我们现在知道 JS 原生 promises 的 resolve/reject 回调会被当作微任务进行调度，并在每个阶段前被处理。Q 和 Bluebird 又是怎样？

NodeJS 实现原生 promises 前，人们使用 Q 和 Bluebird。因为 Q 和 Bluebird 先于原生 promises，它们有与原生 promises 不同的语义。

写这篇文件时， Q (v1.5.0) 使用 `process.nextTick` 队列来调度resolved/rejected promises 的回调。根据 Q 的文档：

> Note that resolution of a promise is always asynchronous: that is, the fulfillment or rejection handler will always be called in the next turn of the event loop (i.e. process.nextTick in Node). This gives you a nice guarantee when mentally tracing the flow of your code, namely that then will always return before either handler is executed.

另一方面，Bluebird (v3.5.0) 默认使用 `setImmediate` 来调度 resolved/rejected promises 的回调，代码见 [这里](https://github.com/petkaantonov/bluebird/blob/master/src/schedule.js#L12)。

为了更清楚地认识，我们以下面的代码为例：

```js
const Q = require('q');
const BlueBird = require('bluebird');

Promise.resolve().then(() => console.log('native promise resolved'));
BlueBird.resolve().then(() => console.log('bluebird promise resolved'));
setImmediate(() => console.log('set immediate'));
Q.resolve().then(() => console.log('q promise resolved'));
process.nextTick(() => console.log('next tick'));
setTimeout(() => console.log('set timeout'), 0);
```

上面的例子中，`BlueBird.resolve().then` 回调与 `setImmediate` 有相同的语义，因此 bluebird 的回调在 immediates 队列中，并在 `setImmediate` 回调之前。而 Q 使用 `process.nextTick` 来调度回调，`Q.resolve().then` 在 `process.nextTick` 队列并在 `process.nextTick` 回调之前。我们可以用如下输出来验证我们的推测：

```
q promise resolved
next tick
native promise resolved
set timeout
bluebird promise resolved
set immediate
```

> 虽然上面的例子只使用了 `resolve` promise，但 `reject` promise 的行为时一样的。文章最后，我会给一个同时有 `resolve` `reject` 的例子。

Bluebird 给我们提供了一个选项，让我们可以选择调度机制。这意味着我们可以在 bluebird 用 `process.nextTick` 而不是 `setImmediate` 来实现 promise。Bluebird 提供 `setScheduler` 这个 API，它接收一个用于替换默认 `setImmediate` 调度方法的函数。

为了在 bluebird 中使用 `process.nextTick` 作为调度器，我们可以这样：

```js
const BlueBird = require('bluebird');
BlueBird.setScheduler(process.nextTick);
```

想使用 `setTimeout` 则可以：

```js
const BlueBird = require('bluebird');
BlueBird.setScheduler((fn) => {
    setTimeout(fn, 0);
});
```

为了防止文章过长，我这里不再赘述各种使用样例。你可以尽情尝试不同的调度器，查看输出结果。

在新版本 node 中使用 `setImmediate` 替代 `process.nextTick` 有它的好处、因为从 NodeJS v0.12 开始，不再有 `process.maxTickDepth`，过多添加事件到 nextTick 队列会导致 I/O 饿死。而 immediates 队列在 I/O 队列之后，因此用 `setImmediate` 替代 `process.nextTick` 能够避免这种情况。

## 最后的例子

以下代码会产生有点复杂难懂的输出：

```js
const Q = require('q');
const BlueBird = require('bluebird');

Promise.resolve().then(() => console.log('native promise resolved'));
BlueBird.resolve().then(() => console.log('bluebird promise resolved'));
setImmediate(() => console.log('set immediate'));
Q.resolve().then(() => console.log('q promise resolved'));
process.nextTick(() => console.log('next tick'));
setTimeout(() => console.log('set timeout'), 0);
Q.reject().catch(() => console.log('q promise rejected'));
BlueBird.reject().catch(() => console.log('bluebird promise rejected'));
Promise.reject().catch(() => console.log('native promise rejected'));
```

```js
q promise resolved
q promise rejected
next tick
native promise resolved
native promise rejected
set timeout
bluebird promise resolved
bluebird promise rejected
set immediate
```

你应该会有两个问题：

1. 如果 Q 使用 `process.nextTick`，为什么 `q promise rejected` 在 `next tick` 之前？
2. 如果 Bluebird 使用 `setImmediate`，为什么 `bluebird promise rejected` 在 `set immediate` 之前？

这是因为两个库**都有一个内部的队列来存放所有 resolved/rejected promise 回调**，然后把这个内部队列添加到事件循环对应的队列中，这样事件循环就会一次性处理内部队列中所有的回调。更详细解释见 [这里](https://medium.com/@dpjayasekara/hi-maxim-1b97f83bcd8f)

让我们以 bluebird 为例。当使用 bluebird resolve 或 rejecte 承诺时，会启动一个队列，并将 resolve/reject 回调添加到已启动队列中。然后计划使用 setImmediation 回调处理该队列。如果有更多的 promise 被 resolve 或 rejecte，它们将被添加到同一个队列中，这个队列已经计划在事件循环启动时立即执行。现在让我们再回顾一下代码；

在这种情况下，bluebird 在 setImmediation 之前调用 resolve。也就是说，一个队列已经启动时，第一个蓝鸟的resolve 已经在队列中，并且计划使用 setimmediation 处理它。此时，setimmediation 队列将如下所示。

1. Process this queue — [ (Log “bluebird promise resolved”) ]
2. Log “set immediate”

一旦执行了所有语句，setimmediation队列将如下所示：

1. Process this queue — [ (Log “bluebird promise resolved”), (Log “bluebird promise rejected”) ]
2. Log “set immediate”

bluebird 没有将新的 promise 回调添加为新的 setImmediation 回调，而是将它插入到上面启动的同一个队列中。

在执行上述所有语句之后，事件循环将启动。在 setImmediation状态时，它将首先处理 promise 回调队列，然后执行我们提供的实际 setImmediation 回调，结果则如上所示。
