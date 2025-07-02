---
title: 为什么箭头函数不能 new 操作？
---
## 概述

箭头函数是为了解决 `this` 指向问题而设计的轻量函数，没有 `prototype` 属性，也没有构造能力（即缺少 `[[Construct]]` 方法），因此不能用 `new` 调用。试图用 `new` 会直接抛出 `TypeError`。

## 普通函数 vs 箭头函数 的本质差异

| 特性                    | 普通函数（Function Declaration / Expression） | 箭头函数                      |
| ----------------------- | --------------------------------------------- | ----------------------------- |
| 是否可 `new` 调用       | ✅有构造能力（`[[Construct]]`）                | ❌ 没有构造能力                |
| 是否有 `prototype` 属性 | ✅                                             | ❌                             |
| 是否绑定自己的 `this`   | ✅ 动态绑定                                    | ❌ 继承自定义时作用域的 `this` |
| 是否有 `arguments` 对象 | ✅                                             | ❌                             |
| 是否可作为构造器使用    | ✅                                             | ❌ 报错                        |

## 尝试 `new` 一个箭头函数时会报错

```js
const Arrow = () => {}

const obj = new Arrow() 
// ❌ Uncaught TypeError: Arrow is not a constructor
```

原因在于：

+ 箭头函数内部并没有构造签名（即没有 `[[Construct]] ` 内部方法）

+ 它也没有 `prototype` 属性，无法为实例对象设置原型链

## 从规范角度理解（ECMAScript Spec）

按照 ECMAScript 规范：

> An object is a constructor if it has a `[[Construct]]` internal method.

- 普通函数（function）具备 `[[Call]]` 和 `[[Construct]]` 两种内部方法
- 箭头函数只具备 `[[Call]]`，**没有 `[[Construct]]`**

这在引擎层就是底层行为的差异。

## 常见的内部方法列表

| Internal Slot     | 用途                              |
| ----------------- | --------------------------------- |
| `[[Call]]`        | 表示函数是否可以被调用（即 `()`） |
| `[[Construct]]`   | 表示是否能使用 `new` 实例化       |
| `[[Prototype]]`   | 实现 `__proto__`、原型链查找      |
| `[[HomeObject]]`  | `super` 调用时使用的隐式上下文    |
| `[[Environment]]` | 函数闭包所绑定的环境              |
| `[[Scopes]]`      | 引擎维护的作用域链                |
