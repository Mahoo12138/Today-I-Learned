## Promise 基础

以往的异步编程模式，常使用用回调函数，但是串联多个异步操作时，会出现“回调地狱”；

2010 年， CommonJS 项目实现的 Promises/A 规范日益流行起来； Q 和 Bluebird 等第三方 JavaScript 期约库也在社区中广泛使用；

ECMAScript 6 增加了对 Promises/A+ 规范的完善支持，即 Promise 类型；

---

+ Promise 三种状态，哪种状态都是不可逆的；
+ Promise 的状态是私有的，不能直接通过 JavaScript 检测或修改；
+ `Promise.resolve()` 将任何值包装为一个resolved 的 Promise ，传入 Promise 对象，则是一个幂等操作；
+ `Promise.reject()` 类似于 resolve() ，只不过传入 Promise 会会成为其 rejected 的理由；



`Promise.prototype.then()` 返回一个新的 Promise 实例：

+ 如果没有提供这个处理程序，则 `Promise.resolve()` 就会包装上一个 Promise resolve 之后的值；
+ 如果没有显式的返回语句，则 `Promise.resolve()` 会包装默认的返回值 undefined ；
+ **抛出异常**会返回 rejected 的 Promise ，返回错误对象则会被包装在一个 resolved 的 Promise 中；
+ onRejected 处理程序返回的值也会被 `Promise.resolve()` 包装，在捕获错误后不抛出异常是符合 Promise 的行为，应该返回一个 resolved 的 Promise；

`Promise.prototype.catch() `  用于给 Promise 添加 reject 处理程序：

+ 一个语法糖，调用它就相当于调用 `Promise.prototype.then(null, onRejected)`；

`Promise.prototype.finally()` 用于给 Promise 添加 onFinally 处理程序：

+ 这个处理程序在 Promise 转换为 resolved 或 rejected 状态时都会执行；
+ onFinally 处理程序没有办法知道 Promise 具体状态，所以这个方法主要用于添加清理代码；
+ 如果返回的是一个待定的期约，或者 onFinally 处理程序抛出了错误（显式抛出或返回了一个拒
  绝期约），则会返回相应的期约（待定或拒绝）；
+ 返回 pending 的 Promise 的情形并不常见，这是因为只要内部的 Promise resolve 了，仍然会原样后传初始的Promise；

## 非重入方法 

 当 Promise 状态改变时，与该状态相关的处理程序**会被排期**，而非立即执行；  

这个特性由 JavaScript 运行时保证，被称为“**非重入**”（ non-reentrancy）特性；

```js
let synchronousResolve;

let p = new Promise((resolve) => {
    synchronousResolve = function() {
        console.log('1: invoking resolve()');
        resolve();
        console.log('2: resolve() returns');
    };
});
p.then(() => console.log('4: then() handler executes'));
synchronousResolve();
console.log('3: synchronousResolve() returns');

// 实际的输出：
// 1: invoking resolve()
// 2: resolve() returns
// 3: synchronousResolve() returns
// 4: then() handler executes
```

## 处理程序的执行顺序 

如果给 Promise 添加了多个处理程序，当其状态变化时，相关处理程序会按照添加它们的顺序依次执行；

无论是 `then()`、 `catch()` 还是 `finally()` 添加的处理程序都是如此 ；

```js
let p1 = Promise.resolve();
let p2 = Promise.reject();
p1.then(() => setTimeout(console.log, 0, 1));
p1.then(() => setTimeout(console.log, 0, 2));
// 1
// 2
```

## 错误处理

Promise 可以以任何理由拒绝，包括 undefined，但最好统一使用错误对象。这样做主要是因为创建错误对象可以让浏览器捕获错误对象中的栈追踪信息；

在 Promise 中抛出错误时，错误实际上是从消息队列中异步抛出的，所以并不会阻止运行时继续执行同步指令  ；

异步错误只能通过异步的 onRejected 处理程序捕获；这不包括捕获执行函数中的错误，在 resolve 或 reject Promise 之前，仍然可以使用 try/catch 在执行函数中捕获错误；

then() 和 catch() 的 onRejected 处理程序在语义上相当于 try/catch， onRejected 处理程序的任务应该是在捕获异步错误之后返回一个 resolved 的 Promise；

## 扩展取消和通知

```html
<button id="start">Start</button>
<button id="cancel">Cancel</button>

<script>
    class CancelToken {
        constructor(cancelFn) {
            this.promise = new Promise((resolve, reject) => {
                cancelFn(() => {
                    setTimeout(console.log, 0, "delay cancelled");
                    resolve();
                });
            });
        }
    }
    const startButton = document.querySelector('#start');
    const cancelButton = document.querySelector('#cancel');
    
    function cancellableDelayedResolve(delay) {
        setTimeout(console.log, 0, "set delay");
        return new Promise((resolve, reject) => {
            const id = setTimeout((() => {
                setTimeout(console.log, 0, "delayed resolve");
                resolve();
            }), delay);
            
            const cancelToken = new CancelToken((cancelCallback) =>
                                                cancelButton.addEventListener("click", cancelCallback));
            cancelToken.promise.then(() => clearTimeout(id));
        });
    }
    startButton.addEventListener("click", () => cancellableDelayedResolve(1000));
</script>

```

每次单击“Start”按钮都会开始计时，并实例化一个新的 CancelToken 的实例。

此时，“Cancel” 按钮一旦被点击，就会触发令牌实例中的 Promise resolve。

而解决之后，单击“Start”按钮设置的超时也会被取消；

---

```js
class TrackablePromise extends Promise {
    constructor(executor) {
        const notifyHandlers = [];
        super((resolve, reject) => {
            return executor(resolve, reject, (status) => {
                notifyHandlers.map((handler) => handler(status));
            });
        });
        this.notifyHandlers = notifyHandlers;
    }
    notify(notifyHandler) {
        this.notifyHandlers.push(notifyHandler);
        return this;
    }
}

let p = new TrackablePromise((resolve, reject, notify) => {
    function countdown(x) {
        if (x > 0) {
            notify(`${20 * x}% remaining`);
            setTimeout(() => countdown(x - 1), 1000);
        } else {
            resolve();
        }
    }
    countdown(5);
});

p.notify((x) => setTimeout(console.log, 0, 'progress:', x));
p.then(() => setTimeout(console.log, 0, 'completed'));

// （约 1 秒后） 80% remaining
// （约 2 秒后） 60% remaining
// （约 3 秒后） 40% remaining
// （约 4 秒后） 20% remaining
// （约 5 秒后） completed
```

ES6 不支持取消 Promise 和进度通知，一个主要原因就是过度复杂化了；

连锁的 Promise 和 Promise.all() 中的某一个取消了或者发出了通知，那么接下来应该发生什么完全说不清楚；