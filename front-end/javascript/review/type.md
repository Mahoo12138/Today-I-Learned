---
title: JavaScript 类型
---
# JavaScript 类型

## [[front-end/interview/company/bytedance/1#js 数据类型有哪些，如何判断？|原始类型]]

JavaScript 中原始类型有六种，原始类型既只保存原始值，**是没有函数可以调用的**。

六种原始类型：string，number，boolean，null，undefined，symbol；

为什么说原始类型没有函数可以调用，但`'1'.toString()`却又可以在浏览器中正确执行？

因为`'1'.toString()`中的字符串`'1'`在这个时候会被封装成其对应的字符串对象，以上代码相当于`new String('1').toString()`，因为`new String('1')`创建的是一个对象，而这个对象里是存在`toString()`方法的。

原始类型本身不具有方法或属性。但为了提供更方便的操作，JavaScript 会在需要时将原始类型临时转换为其对应的对象类型。这种过程称为**自动包装（Autoboxing）**。
 
JavaScript 引擎创建一个临时的对象，临时对象上调用方法，调用结束后，这个临时对象会被销毁，返回结果仍然是一个原始类型。
## 对象类型

除了原始类型，其他的都是对象类型，对象类型存储的是地址，而原始类型存储的是值。


## typeof 和 instanceof

`typeof`能准确判断除`null`以外的原始类型的值，对于对象类型，除了函数会判断成`function`，其他对象类型一律返回`object`；

> 在底层实现中，JavaScript 引擎使用了一种称为 "内部方法" 的机制，这些内部方法可以用于区分不同类型的对象。
> 如果一个对象实现了 `[[Call]]` 内部方法，引擎会将其识别为一个函数，并且 `typeof` 操作符将返回 `"function"`。

 `instanceof` 运算符用于检查对象是否是特定类（构造函数）的实例。**其判断依据是检查对象的原型链**，具体来说是判断对象的原型链中是否包含指定类的原型（或者该类的任何父类的原型）。

 在底层，`instanceof` 通过检查对象的原型链，即 `[[Prototype]]` 链，来确定对象是否是指定类的实例。这可以通过访问对象的 `__proto__` 属性来实现，但需要注意的是，`__proto__` 是非标准的属性（早期的许多 JS 引擎都实现了 `__proto__` 属性，但并没有纳入标准，不同的实现可能存在差异），不建议在生产代码中使用。更推荐使用 `Object.getPrototypeOf` 方法来获取对象的原型。

 ```js
class Animal {}

class Dog extends Animal {}

let myDog = new Dog();

console.log(myDog instanceof Dog); // true，因为 myDog 是 Dog 类的实例
console.log(myDog instanceof Animal); // true，因为 Dog 类继承自 Animal 类
console.log(myDog instanceof Object); // true，所有对象都是 Object 类的实例

let myDog = new Dog();
console.log(myDog.__proto__ === Dog.prototype); // true，不推荐使用 __proto__
console.log(Object.getPrototypeOf(myDog) === Dog.prototype); // 推荐使用 Object.getPrototypeOf
 ```

## == 和 ===

### =\== 严格相等

左右两边不仅值要相等，类型也要相等（也就不会进行隐式类型转换），例如`'1'===1`的结果是`false`，因为一边是`string`，另一边是`number`。

### =\= 不严格相等

对于一般情况，只要值相等，就返回`true`，但`==`还涉及一些类型转换，它的转换规则如下：
+ 其中一个操作数是对象，另一个是基本类型，按此顺序使用对象的 [`@@toPrimitive()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive)（以 `"default"` 作为提示），[`valueOf()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf) 和 [`toString()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/toString) 方法将对象转换为基本类型。
+ 两个操作时都是基本类型时：
	+ 如果其中一个操作数是 `Symbol` 而另一个不是，返回 `false`。
	+ 如果其中一个操作数是布尔型而另一个不是，则将布尔型转换为数字：`true` 转换为 1，`false` 转换为 0；然后继续不严格相等判断。
	+ 操作数是`String`和 `Number`/`BigInt`，把`String`类型转换成`Number`/`BigInt`，再进行比较；

**不严格相等是对称的**：`A == B` 对于 `A` 和 `B` 的任何值总是具有与 `B == A` 相同的语义（应用转换的顺序除外）。

来看一道经典的面试题：

```js
console.log([]==![]); // true
```

左侧对象（数组）`[]`，右侧为布尔值`false`；根据转换规则，对象先转为原始类型，即空字符串`""`，继续按照规则，存在布尔值，即 `false ==> 0`；接着是 `String`和`Number`，则会将空字符串转为 0，最后是`0 == 0`，即为 `true`。

> `typeof document.all === 'undefined'` 是检测中的一个特例，`document.all` 被标准委员会认为是一个不符合标准的特性，并逐渐被现代浏览器所摒弃。
> 在处理 `typeof document.all` 时，浏览器引擎会检测到操作数是 `document.all`，并直接返回 `'undefined'`，而不是对其进行通常的类型检测。


