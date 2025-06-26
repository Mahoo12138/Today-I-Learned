## 实现一个 once 函数，传入函数参数只执行一次

> 实现一个 `once(fn)` 函数，使得传入的函数 `fn` **只执行一次**，后续调用时**返回第一次的执行结果**，不再重复执行。

考察的是对 **高阶函数、闭包、函数状态管理** 的掌握，是面试中的经典题。

### 基础实现（使用闭包）

```js
function once(fn) {
  let called = false
  let result

  return function (...args) {
    if (!called) {
      result = fn.apply(this, args)
      called = true
    }
    return result
  }
}
```

- `called` 是闭包中的私有状态，标记函数是否已执行过
- `result` 用来缓存第一次执行结果
- 使用 `fn.apply(this, args)` 保证 `this` 在类方法等上下文中仍能保持正确
- 每次调用 `once(fn)` 返回一个新的“包装函数”
- 后续调用检查标记：若未执行，则调用原函数；若已执行，则直接返回上次结果

### 增强：状态与原函数绑定

不使用闭包，使用 Symbol 隐藏状态字段：

```js
const _called = Symbol('called')
const _result = Symbol('result')

function once(fn) {
  return function (...args) {
    if (!fn[_called]) {
      fn[_result] = fn.apply(this, args)
      fn[_called] = true
    }
    return fn[_result]
  }
}
```

也可以使用一个  `WeakMap` 容器：

```js
function once(fn) {
  const cache = new WeakMap()

  return function (...args) {
    if (!cache.has(fn)) {
      cache.set(fn, fn.apply(this, args))
    }
    return cache.get(fn)
  }
}
```

### 拓展变种：once + reset

```js
function onceWithReset(fn) {
  let called = false
  let result

  const wrapper = (...args) => {
    if (!called) {
      result = fn.apply(this, args)
      called = true
    }
    return result
  }

  wrapper.reset = () => {
    called = false
    result = undefined
  }

  return wrapper
}
```

### 扩展变种：支持异步函数

```js
function onceAsync(fn) {
  let called = false
  let promise

  return function (...args) {
    if (!called) {
      promise = Promise.resolve().then(() => fn.apply(this, args))
      called = true
    }
    return promise
  }
}
```

