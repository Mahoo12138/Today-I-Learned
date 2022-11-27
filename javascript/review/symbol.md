## 是什么

Symbol 是 ES6 新增的基本数据类型——符号，它具有**唯一性、不可变性**。因此能确保对象属性的唯一性，不会发生冲突。

Symbol 和其他基本类型：null、undefined、boolean、number、string的不同是**没有对应的包装类**和 **new** 一起使用。

## 基本用法

```js
// 创建
let s = Symbol()
let name = Symbol('name') // 传入字符串作为符号的描述，主要用于调试代码
let s1 = Symbol()
let s2 = Symbol()

// 比较
s1 == s2 // false

let s3 = Symbol('name')
let s4 = Symbol('name')

s3 == s4 // false
```

之前对象的属性的键只能是字符串类型，现在可以是 Symbol 的实例：

```js
let name = Symbol('name')
let o = {
    [name]:'zhangsan'
}
```

那相对于字符串类型的优点就是唯一性，不会覆盖已有的属性：比如想对第三方的一个对象 people 添加属性时，如果使用字符串作为属性很有可能会覆盖原有的属性，而使用 Symbol 就算属性名相同也不会：

```js
let id = Symbol("id");

people[id] = "新增值";
```

## 全局符号注册表

Symbol 每次创建都是唯一的，那如何复用呢？js 运行时维护了一个 symbol 注册表，`Symbol.for` 就用于向其中注册，可解决共享和重用的问题：

```js
let name = Symbol.for('name') // 第一次时全局注册表不存在则创建并添加到注册表中。

let otherName = Symbol.for('name') // 后续使用相同字符串，先检索全局注册表有就返回，反之创建。

name == otherName // true
```

为防止冲突，常见的技巧是，加上前缀，定义命名空间：

```js
let foo = Symbol.for("ns.foo");
let bar = Symbol.for("ns.bar");
```

我们可以通过 `Symbol.keyFor` 来反查字符串键：

```js
let name = Symbol.for('name')
Symbol.keyFor(name) // 'name'
```

使用普通符号：

```js
let name = Symbol('name')
Symbol.keyFor(name) // undefined
```

## 对象属性遍历

`for...in` 会忽略 Symbol：

```js
let id = Symbol("id");
let user = {
  name: "John",
  age: 30,
  [id]: 123
};

for (let key in user) alert(key); // name, age (no symbols)
Object.keys(usr) // ['name','age']
Object.getOwnPropertyNames(user) // ['name','age']
Object.getOwnPropertySymbols(user) // [Symbol(id)]


let clone = Object.assign({}, user);
clone[id] // 123
```

## 常用使用场景

+ 使用 Symbol 让数据对象的特殊属性私有化；
+ 使用 Symbol 定义类的私有属性或方法；
+ 使用 Symbol 代替常量；

## 内置的 Symbol 值

### Symbol.hasInstance

指向一个内部方法。当其他对象使用 **instanceof** 运算符，判断是否为该对象的实例时，会调用这个方法。

### Symbol.isConcatSpreadable

对象的`Symbol.isConcatSpreadable`属性等于一个布尔值，表示该对象用于`Array.prototype.concat()`时，是否可以展开。

```javascript
let arr1 = ['c', 'd'];
['a', 'b'].concat(arr1, 'e') // ['a', 'b', 'c', 'd', 'e']
arr1[Symbol.isConcatSpreadable] // undefined

let arr2 = ['c', 'd'];
arr2[Symbol.isConcatSpreadable] = false;
['a', 'b'].concat(arr2, 'e') // ['a', 'b', ['c','d'], 'e']
```

### Symbol.species

对象的`Symbol.species`属性，指向一个构造函数。创建衍生对象时，会使用该属性。默认的`Symbol.species`属性等同于下面的写法。

```javascript
static get [Symbol.species]() {
  return this;
}
```

定义`Symbol.species`属性要采用`get`取值器，创建衍生对象如数组调用`map`或`filter`方法返回的数组，可以返回函数，作为构造函数进行实例0化；

### Symbol.match

对象的`Symbol.match`属性，指向一个函数。当执行`str.match(myObject)`时，如果该属性存在，会调用它，返回该方法的返回值。

### Symbol.replace

对象的`Symbol.replace`属性，指向一个方法，当该对象被`String.prototype.replace`方法调用时，会返回该方法的返回值。

### Symbol.search

对象的`Symbol.search`属性，指向一个方法，当该对象被`String.prototype.search`方法调用时，会返回该方法的返回值。

### Symbol.split

对象的`Symbol.split`属性，指向一个方法，当该对象被`String.prototype.split`方法调用时，会返回该方法的返回值。

### Symbol.iterator

对象的`Symbol.iterator`属性，指向该对象的默认遍历器方法。

### Symbol.toPrimitive

对象的`Symbol.toPrimitive`属性，指向一个方法。该对象被转为原始类型的值时，会调用这个方法，返回该对象对应的原始类型值。

### Symbol.toStringTag

对象的`Symbol.toStringTag`属性，指向一个方法。在该对象上面调用`Object.prototype.toString`方法时，如果这个属性存在，它的返回值会出现在`toString`方法返回的字符串之中，表示对象的类型。也就是说，这个属性可以用来定制`[object Object]`或`[object Array]`中`object`后面的那个字符串。

### Symbol.unscopables

对象的`Symbol.unscopables`属性，指向一个对象。该对象指定了使用`with`关键字时，哪些属性会被`with`环境排除。