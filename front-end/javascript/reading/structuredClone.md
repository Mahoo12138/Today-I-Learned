# 用现代方式深度拷贝 JavaScript 中的对象

JavaScript 中现在有一种原生方法可以对对象进行深度复制。

没错，这个 structuredClone 函数就是内置于 JavaScript 运行时中的：

```js
const calendarEvent = {
   title: "Builder.io Conf",
   date: new Date(123),
   attendees: ["Steve"]
 }

 // 😍
 const copied = structuredClone(calendarEvent)
```

你是否注意到，在上面的示例中，我们不仅复制了对象，还复制了嵌套数组，甚至复制了Date对象？

所有操作都完全符合预期：

```js
 copied.attendees // ["Steve"]
 copied.date // Date: Wed Dec 31 1969 16:00:00
 cocalendarEvent.attendees === copied.attendees // false
```

没错，structuredClone 不仅能实现上述功能，还能实现其他功能：

- 克隆无限嵌套的对象和数组
- 克隆循环引用
- 克隆多种 JavaScript 类型，如 Date、Set、Map、Error、RegExp、ArrayBuffer、Blob、File、ImageData 等。
- 传输任何可传输对象

因此，举例来说，这种疯狂的做法甚至可以达到预期的效果：,

```js
 const kitchenSink = {
   set: new Set([1, 3, 3]),
   map: new Map([[1, 2]]),
   regex: /foo/,
   deep: { array: [ new File(someBlobData, 'file.txt') ] },
   error: new Error('Hello!')
 }
 kitchenSink.circular = kitchenSink

 // ✅ All good, fully and deeply copied!
 const clonedSink = structuredClone(kitchenSink)
```

## 为什么不只是对象传播？

需要注意的是，我们说的是深度复制。如果你只需要进行浅拷贝，也就是不拷贝嵌套对象或数组的拷贝，那么我们可以只进行**对象扩散**：

```js
const simpleEvent = {
   title: "Builder.io Conf",
 }
 // ✅ no problem, there are no nested objects or arrays
 const shallowCopy = {...calendarEvent}
```

如果你愿意，也可以选择这些：

```js
 const shallowCopy = Object.assign({}, simpleEvent)
 const shallowCopy = Object.create(simpleEvent)
```

但是，一旦出现嵌套项，我们就会遇到麻烦：

```
 const calendarEvent = {
   title: "Builder.io Conf",
   date: new Date(123),
   attendees: ["Steve"]
 }

 const shallowCopy = {...calendarEvent}

 // 🚩 oops - we just added "Bob" to both the copy *and* the original event
 shallowCopy.attendees.push("Bob")

 // 🚩 oops - we just updated the date for the copy *and* original event
 shallowCopy.date.setTime(456)
```

正如你所看到的，我们并没有完整复制这个对象。

嵌套的日期和数组仍然是两个对象之间的共享引用，如果我们要编辑这些引用，以为我们只是在更新复制的日历事件对象，这可能会给我们带来很大的麻烦。

## 为什么不使用 JSON.parse (JSON.stringify (x)) 呢？

对了，就是这一招。这其实是一个很好的方法，而且性能出奇的好，但也有一些不足之处，structuredClone 可以解决这些问题。

举个例子：

```js
 const calendarEvent = {
   title: "Builder.io Conf",
   date: new Date(123),
   attendees: ["Steve"]
 }

 // 🚩 JSON.stringify converted the `date` to a string
 const problematicCopy = JSON.parse(JSON.stringify(calendarEvent))
```

如果我们打印 problematicCopy，就会得到：

```js
{
   title: "Builder.io Conf",
   date: "1970-01-01T00:00:00.123Z"
   attendees: ["Steve"]
 }
```

这不是我们想要的！date 应该是一个日期对象，而不是字符串。

出现这种情况是因为 `JSON.stringify` 只能处理基本对象、数组和基础类型。其他类型的处理方式很难预测。例如，日期会被转换为字符串。但集合会被简单地转换为 `{}`。

`JSON.stringify` 甚至会完全忽略某些东西，比如 `undefined` 或 `Function`。

例如，如果我们用这个方法复制 kitchenSink 的示例：

```js
const kitchenSink = {
   set: new Set([1, 3, 3]),
   map: new Map([[1, 2]]),
   regex: /foo/,
   deep: { array: [ new File(someBlobData, 'file.txt') ] },
   error: new Error('Hello!')
 }

 const veryProblematicCopy = JSON.parse(JSON.stringify(kitchenSink))
```

我们会得到:

```json
 {
   "set": {},
   "map": {},
   "regex": {},
   "deep": {
     "array": [
       {}
     ]
   },
   "error": {},
 }
```

Ew！

哦，对了，我们还删除原来为此设置的循环引用，因为 `JSON.stringify` 遇到循环引用时会直接抛出错误。

因此，如果我们的要求符合该方法的功能，那么该方法就会非常棒，但是我们可以使用 `structuredClone`（也就是上面我们没有做到的所有功能）来实现很多该方法无法实现的功能。

## 为什么不使用 `_.cloneDeep`？

迄今为止，Lodash 的 cloneDeep 函数一直是解决这一问题的常用方法。

而事实上，它也确实能达到预期的效果：

```js
 import cloneDeep from 'lodash/cloneDeep'

 const calendarEvent = {
   title: "Builder.io Conf",
   date: new Date(123),
   attendees: ["Steve"]
 }

 const clonedEvent = cloneDeep(calendarEvent)
```

但有一点需要注意。我的集成开发环境中的 "Import Cost" 扩展可以打印我导入任何东西的 kb 成本，根据该扩展，这个函数的最小化成本为 17.4kb（压缩后为 5.3kb）。

这还只是假设你只导入了这个函数。如果你采用了更常见的导入方式，而没有意识到 "tree shaking" 并不总能如你所愿，那么你可能会因为这一个函数而意外导入多达 25kb 的数据 😱 。

虽然这对任何人来说都不会是世界末日，但在我们的情况下根本没有必要，因为浏览器已经内置了 `structuredClone`。

## structuredClone 不能克隆什么

### 函数不能克隆

它们会引发 DataCloneError 异常：

```js
 // 🚩 Error!
 structuredClone({ fn: () => { } })
```

### DOM 节点

也会引发 DataCloneError 异常：

```js
 // 🚩 Error!
 structuredClone({ el: document.body })
```

### descriptor、setter & getter

以及类似元数据的功能不会被克隆。

例如，对于 getter，结果值会被克隆，但 getter 函数本身（或任何其他属性元数据）不会被克隆：

```js
 structuredClone({ get foo() { return 'bar' } })
 // Becomes: { foo: 'bar' }
```

### 对象原型

原型链不会被移动或复制。因此，如果克隆 MyClass 的实例，克隆的对象将不再是该类的实例（但该类的所有有效属性都将被克隆）

```js
 class MyClass {
   foo = 'bar'
   myMethod() { /* ... */ }
 }
 const myClass = new MyClass()

 const cloned = structuredClone(myClass)
 // Becomes: { foo: 'bar' }

 cloned instanceof myClass // false
```

### 受支持类型的完整列表

更简单地说，不在下面列表中的任何内容都不能克隆：

#### JS 内置类型

数组、ArrayBuffer、布尔、DataView、日期、错误类型（下面特别列出的类型）、Map、对象（但仅限普通对象，例如来自对象字面的对象）、原始类型（符号除外）（又称数字、字符串、null、未定义、布尔、BigInt）、RegExp、Set、TypedArray

#### 错误类型

Error, EvalError, RangeError, ReferenceError , SyntaxError, TypeError, URIError

#### 网络 / API 类型

AudioData, Blob, CryptoKey, DOMException, DOMMatrix, DOMMatrixReadOnly, DOMPoint, DomQuad, DomRect, File, FileList, FileSystemDirectoryHandle, FileSystemFileHandle, FileSystemHandle, ImageBitmap, ImageData, RTCCertificate, VideoFrame

#### 浏览器和运行时支持

最棒的是，structuredClone 支持所有主流浏览器，甚至 Node.js 和 Deno。