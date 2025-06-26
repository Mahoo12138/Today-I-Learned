## 实现一个私有变量，用 `get`/`set` 方法访问，不能直接访问

### 解法一：使用闭包模拟私有变量

```js
function createCounter() {
  let _value = 0  // 私有变量，作用域封闭

  return {
    get() {
      return _value
    },
    set(val) {
      if (typeof val === 'number') _value = val
    }
  }
}

const counter = createCounter()
counter.set(42)
console.log(counter.get()) // 42
console.log(counter._value) // undefined，无法直接访问
```

#### 原理说明

- `_value` 是 `createCounter` 函数的局部变量，外部无法直接访问
- `get`/`set` 方法通过闭包引用 `_value`，实现访问控制

#### 缺点

- 封装依赖函数作用域，不适用于 `class` 结构
- 暴露的对象可以被篡改访问方法，封装性易被破坏
- 不具备结构性私有（例如不能真正防止调试器查看内部状态）

### 解法二：使用 `WeakMap` 实现结构化私有变量

```js
const _private = new WeakMap()

class Counter {
  constructor() {
    _private.set(this, { value: 0 })
  }

  get() {
    return _private.get(this).value
  }

  set(val) {
    if (typeof val === 'number') {
      _private.get(this).value = val
    }
  }
}
```

#### 优点

- 与类实例绑定，不暴露私有字段到实例对象
- 无法通过 `Object.keys()`、`Reflect.ownKeys()`、枚举访问私有字段
- 结构更清晰，适合扩展/继承/原型方法封装

#### 注意

- `WeakMap` 本身如果暴露在模块作用域，仍然可以被访问到（非绝对私有）
- 方法仍可被重写绕过封装逻辑（安全性依赖调用者行为）

### 解法三：ES2022 私有字段（真正语言级私有）

```js
class Counter {
  #value = 0  // 真·私有字段，语法隔离

  get() {
    return this.#value
  }

  set(val) {
    if (typeof val === 'number') this.#value = val
  }
}
```

#### 优点

- 私有字段完全隐藏，外部无法以任何形式访问或代理
- 无法通过 `Reflect`、`Proxy`、调试器访问私有值
- 是 JavaScript 语言标准支持的真正私有变量机制