reject 的 Promise 的错误不会被异步函数捕获： 

```js
async function foo() {
    console.log(1);
    Promise.reject(3);
}
// 给返回的期约添加一个拒绝处理程序
foo().catch(console.log);
console.log(2);
// 1
// 2
// Uncaught (in promise): 3
```

而对 reject 的 Promise 使用 await 则会释放（ unwrap）错误值（将 Promise 返回）：  

```js
async function foo() {
    console.log(1);
    await Promise.reject(3);
    console.log(4); // 这行代码不会执行
}
// 给返回的期约添加一个拒绝处理程序
foo().catch(console.log);
console.log(2);
// 1
// 2
// 3
```

### await 的限制

await 关键字必须在异步函数中使用，不能在顶级上下文如 \<script> 标签或模块中使用；不过可以使用立即调用异步函数：

```js
// 立即调用的异步函数表达式
(async function() {
    console.log(await Promise.resolve(3));
})();
// 3
```

### 停止和恢复

JavaScript 运行时在碰到 await 关键字时，会记录在哪里暂停执行。等到 await 右边的值可用了， 运行时会向消息队列中推送一个任务，这个任务会恢复异步函数的执行； 

```js
async function foo() {
    console.log(await Promise.resolve('foo'));
}
async function bar() {
    console.log(await 'bar');
}
async function baz() {
    console.log('baz');
}
foo();
bar();
baz();
// baz
// foo
// bar
```

每次执行到 await 会将其后的 Promise 或立即可用值的包装 Promise resolve 然后向队列中添加一个任务，并在主线程执行完毕后，从队列（先进先出）中取出任务进行处理；

### 实现 sleep()  

```js
async function sleep(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}
async function foo() {
    const t0 = Date.now();
    await sleep(1500); // 暂停约 1500 毫秒
    console.log(Date.now() - t0);
}
foo();
// 1502
```

### 平行执行  

```js
async function randomDelay(id) {
  // 延迟 0~1000 毫秒
  const delay = Math.random() * 1000;
  console.log(`${id} ready`)
  return new Promise((resolve) => {setTimeout(() => {
    console.log(`${id} finished`);
    resolve();
  }, delay);
  console.log(`${id} runing`)
});
}
async function foo() {
  const t0 = Date.now();
  await randomDelay(0);
  console.log("0 over")
  await randomDelay(1);
  console.log("1 over")
  await randomDelay(2);
  console.log("2 over")
  await randomDelay(3);
  console.log("3 over")
  await randomDelay(4);
  console.log("4 over")
  console.log(`${Date.now() - t0}ms elapsed`);
}
foo();
console.log("foo over")
```

这些 Promise 间没有依赖，异步函数也会依次暂停，等待每个超时完成。这样可以保证执行顺序，但总执行时间会变长；

可以先一次性初始化所有期约，然后再分别等待它们的结果：

```js
async function foo() {
  const t0 = Date.now();
  const p0 = randomDelay(0);
  const p1 = randomDelay(1);
  const p2 = randomDelay(2);
  const p3 = randomDelay(3);
  const p4 = randomDelay(4);
  console.log("---- init over ----")
  await p0;
  console.log("0 over")
  await p1;
  console.log("1 over")
  await p2;
  console.log("2 over")
  await p3;
  console.log("3 over")
  await p4;
  console.log("4 over")
  setTimeout(console.log, 0, `---- ${Date.now() - t0}ms elapsed ----`);
}
```

### 串行执行

```js
async function addTwo(x) {return x + 2;}
async function addThree(x) {return x + 3;}
async function addFive(x) {return x + 5;}

async function addTen(x) {
    for (const fn of [addTwo, addThree, addFive]) {
        x = await fn(x);
    }
    return x;
}
addTen(9).then(console.log); // 19
```

### 栈追踪与内存管理  

JavaScript 引擎会在创建 Promise 时尽可能保留完整的调用栈，在抛出错误时，调用栈可以由运行时的错误处理逻辑获取，因而就会出现在栈追踪信息中；

使用异步函数，会将已经返回的函数排除在错误信息中，从而可减少一些计算和存储成本；

JavaScript 运行时可以简单地在嵌套函数中存储指向包含函数的指针，就跟对待同步函数调用栈一样。这个指针实际上存储在内存中，可用于在出错时生成栈追踪信息。