原文地址：[Timers, Immediates and Process.nextTick— NodeJS Event Loop Part 2, Deepal Jayasekara, May 11, 2017](https://blog.insiderattack.net/timers-immediates-and-process-nexttick-nodejs-event-loop-part-2-2c53fd511bb3)

在上篇文章中，我讲述了 NodeJS 事件循环的总体图景。这篇文章中，我将详细讨论三个重要的队列：timers, immediates and process.nextTick 回调。

## Next Tick Queue

![4.all-Q](D:\Workbench\每日学习\nodejs\EventLoop\res\4.all-Q.png)

Next tick 队列与其他 4 个主要队列分隔开，是因为它不是 libuv 原生提供的，而是 Node 自己实现的。

事件循环中要移动到一个阶段前（timers queue, IO events queue, immediates queue, close handlers queue 是 4 个主要的阶段），Node 会检查 `nextTick` 队列是否为空。如果不为空，Node 会一直处理该队列直到不为空。

> Node v11 引入了一些变化，导致巨大的行为差异。详细介绍见: https://medium.com/@dpjayasekara/new-changes-to-timers-and-microtasks-from-node-v11-0-0-and-above-68d112743eb3

这引入了一个问题：通过 `process.nextTick` 递归或重复添加事件到 `nextTick` 队列会导致 I/O 和其他队列一直无法被处理。以下代码为例：

```js
const fs = require('fs');

function addNextTickRecurs(count) {
    let self = this;
    if (self.id === undefined) {
        self.id = 0;
    }

    if (self.id === count) return;

    process.nextTick(() => {
        console.log(`process.nextTick call ${++self.id}`);
        addNextTickRecurs.call(self, count);
    });
}

addNextTickRecurs(Infinity);
setTimeout(console.log.bind(console, 'omg! setTimeout was called'), 10);
setImmediate(console.log.bind(console, 'omg! setImmediate also was called'));
fs.readFile(__filename, () => {
    console.log('omg! file read complete callback was called!');
});

console.log('started');
```

你将看到输出中没有 ‘omg!…’， 全是 `nextTick` 回调的无限循环，而 `setTimeout`, `setImmediate` 和 `fs.readFile` 回调永远不会被调用；

> Node v0.12 之前，有一个属性 `process.maxTickDepth` 用于限制 `process.nextTick` 队列的长度。当它被手动设置后，Node 一次只会处理 next tick queue 中不多于 `maxTickDepth` 的回调。但这个属性在 Node v0.12 中被移除。因此，在更新版本的 Node 中，应避免重复添加事件到 next tick queue。

## Timers queue

当你使用 `setTimeout` 或 `setInterval` 时，Node 将会添加计时器到 libuv 的计时器堆。事件循环中轮到计时器阶段时，Node 将会检查计时器堆中过期的计时器，并按它们设置的先后顺序依次调用它们的回调。

计时器**并不能**精确保证回调会在过期时间到时被执行。计时器回调的执行时机取决于操作系统（Node 必须在执行回调前检查计时器的过期时间，而这一过程会消耗一定的 CPU 时间）和事件循环中当前进程的表现。更准确地说，计时器保证的是回调不会在过期时间未到前被执行。我们可以用以下代码来模拟这种情况

```js
const start = process.hrtime();

setTimeout(() => {
    const end = process.hrtime(start);
    console.log(`timeout callback executed after ${end[0]}s and ${end[1]/Math.pow(10,9)}ms`);
}, 1000);
```

上述代码在程序开始时设置一个过期时间为 1 秒的计时器，并打印到实际执行回调用了多长时间。如果你多次运行这段代码，你将注意到它每次都会打印不同的结果，并且永远不会打印 `timeout callback executed after 1s and 0ms`。你将看到类似下面的结果。

```
timeout callback executed after 1s and 0.006058353ms
timeout callback executed after 1s and 0.004489878ms
timeout callback executed after 1s and 0.004307132ms
...
```

这种超时的本质导致当 `setTimeout` 与 `setImmediate` 一起使用时会有意想不到的结果。我将在后面章节详细讲述。

### Immediates Queue

虽然 immediates 队列和计时器过期的行为非常相似，但它有自己的特点。不像计时器我们无法保证它的回调什么时候被执行（即使把过期时间设为 0），immediates 队列保证了它会在事件循环的 **I/O 阶段后立即被处理。**通过 `setImmediate` 可以向 immediates 队列添加事件。

```js
setImmediate(() => {
   console.log('Hi, this is an immediate');
});
```

## setTimeout vs setImmediate ?

让我们看看文章开头的事件循环图，你会看到当程序开始时 Node 从处理计时器队列开始，处理完 I/O 后再轮到 immediates 队列。根据图上的逻辑，我们可以推测以下代码的输出。

```js
setTimeout(function() {
    console.log('setTimeout')
}, 0);
setImmediate(function() {
    console.log('setImmediate')
});
```

你会推测上面的代码总是会先打印 `setTimeout` 再打印 `setImmediate`，因为过期计时器队列比 immediates 先处理。但实际这段代码无法保证这样的输出结果。你多次运行这段代码，会得到不同的输出结果。

这是因为 NodeJS 为了对齐 [Chrome’s timers cap](https://chromium.googlesource.com/chromium/blink/+/master/Source/core/frame/DOMTimer.cpp#93)，把最小过期时间定为 `1ms`。所以即使你把过期时间设为 `0ms`，会被覆盖为 `1ms`。

> 如果你想知道更多这一点上 Node 和不同浏览器的行为差异，请看 [javascript-event-loop-vs-node-js-event-loop](https://blog.insiderattack.net/javascript-event-loop-vs-node-js-event-loop-aea2b1b85f5c)

每次新的事件循环开始时，NodeJS 通过系统调用获得当前时钟。根据 CPU 的繁忙情况，获取当前时钟的操作耗时可能不超过也可能超过 `1ms`。如果少于 `1ms`，NodeJS 将认为这个计时器还没过期，因为过期时间是 `1ms`，这时事件循环会移动到 I/O 阶段再到 immediates 队列，然后发现队列中有一个事件并进行处理，也就意味着 `setImmediate` 比 `setTimeout` 先执行。但如果耗时超过 `1ms`，计时器就会被认为已过期，执行顺序结果相反。

下面中代码保证了 immediate 一定会比计时器的先执行。

```js
const fs = require('fs');

fs.readFile(__filename, () => {
    setTimeout(() => {
        console.log('timeout')
    }, 0);
    setImmediate(() => {
        console.log('immediate')
    })
});
```

让我们看看上述代码的执行流程

1. 开始，程序异步读取文件，并提供一个处理文件读取完毕的回调。
2. 事件循环开始
3. 当文件读取完毕，执行回调作为一个事件添加到 I/O 队列
4. 因为没有其他事件，Node 会一直等待 I/O 事件，然后发现 I/O 队列有一个事件，开始执行回调
5. 执行回调过程中，一个计时器添加到计时器堆，一个 immediate 添加到 immediate 队列
6. 现在事件循环正处在 I/O 阶段，因为没有要处理的 I/O 事件，事件循环会移动到 immediate 阶段，发现有一个 immediate 回调，然后 immediate 回调被执行
7. 下一轮事件循环发现有一个过期的计时器，然后执行计时器回调

## 结论

看看事件循环中不同阶段 / 队列如何一起工作，以下面的代码为例

```js
setImmediate(() => console.log('this is set immediate 1'));
setImmediate(() => console.log('this is set immediate 2'));
setImmediate(() => console.log('this is set immediate 3'));

setTimeout(() => console.log('this is set timeout 1'), 0);
setTimeout(() => {
    console.log('this is set timeout 2');
    process.nextTick(() => console.log('this is process.nextTick added inside setTimeout'));
}, 0);
setTimeout(() => console.log('this is set timeout 3'), 0);
setTimeout(() => console.log('this is set timeout 4'), 0);
setTimeout(() => console.log('this is set timeout 5'), 0);

process.nextTick(() => console.log('this is process.nextTick 1'));
process.nextTick(() => {
    process.nextTick(console.log.bind(console, 'this is the inner next tick inside next tick'));
});
process.nextTick(() => console.log('this is process.nextTick 2'));
process.nextTick(() => console.log('this is process.nextTick 3'));
process.nextTick(() => console.log('this is process.nextTick 4'));
```

执行上面的代码后，以下事件被添加到对应的事件循环队列

- 3 immediates
- 5 timer callbacks
- 5 next tick callbacks

执行流程是这样：

1. 事件循环开始，发现 next tick 队列不为空，开始处理 next tick callbacks。执行第二个 next tick callback 时一个新的 next tick callback 添加到队列末尾，并在最后被执行。
2. 执行计时器队列中过期的计时器。执行第二个计时器回调时，一个新的 next tick callback 添加到 next tick 队列。
3. 当所有过期计时器执行完，事件循环检查 next tick 队列有一个事件并执行。
4. 因为没有 I/O 事件，事件循环移动到 immediates 阶段开始处理 immediates 队列。

代码运行结果如下

```
this is process.nextTick 1
this is process.nextTick 2
this is process.nextTick 3
this is process.nextTick 4
this is the inner next tick inside next tick
this is set timeout 1
this is set timeout 2
this is set timeout 3
this is set timeout 4
this is set timeout 5
this is process.nextTick added inside setTimeout
this is set immediate 1
this is set immediate 2
this is set immediate 3
```