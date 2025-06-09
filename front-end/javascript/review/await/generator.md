## ES6 系列之 Babel 将 Generator 编译成了什么样子

## Generator

```js
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}
```

我们打印下执行的结果：

```js
var hw = helloWorldGenerator();

console.log(hw.next()); // {value: "hello", done: false}
console.log(hw.next()); // {value: "world", done: false}
console.log(hw.next()); // {value: "ending", done: true}
console.log(hw.next()); // {value: undefined, done: true}
```

## Babel

具体的执行过程就不说了，我们直接在 Babel 官网的 [Try it out](https://babeljs.io/repl) 粘贴上述代码，然后查看代码被编译成了什么样子：

> 需要在 `ENV PRESET` 中开启 **FORCE ALL TRANSFORMS** 选项；

```js
/**
 * 省略了 regeneratorRuntime 部分代码
 */
var _marked = /*#__PURE__*/ regeneratorRuntime.mark(helloWorldGenerator);

function helloWorldGenerator() {
  return regeneratorRuntime.wrap(
    function helloWorldGenerator$(_context) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            _context.next = 2;
            return "hello";

          case 2:
            _context.next = 4;
            return "world";

          case 4:
            return _context.abrupt("return", "ending");

          case 5:
          case "end":
            return _context.stop();
        }
      }
    },
    _marked,
    this
  );
}
```

上述代码中省略了运行时部分，源代码是 Facebook 编写的一个工具：[regenerator/runtime.js at main · facebook/regenerator](https://github.com/facebook/regenerator/blob/main/packages/runtime/runtime.js)。

## mark 函数

编译后的代码第一段是这样的：

```js
var _marked = /*#__PURE__*/ regeneratorRuntime.mark(helloWorldGenerator);
```

我们查看源码中中 `mark` 函数的源码：

```js
exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
};

```

这其中又涉及了 `GeneratorFunctionPrototype` ，`Gp` 等变量及`define`函数，我们也查看下对应的代码：

```js
var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

function Generator() {}
function GeneratorFunction() {}
function GeneratorFunctionPrototype() {}

var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
GeneratorFunction.prototype = GeneratorFunctionPrototype;

function define(obj, key, value) {
    Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
    });
    return obj[key];
}
```

这段代码构建了一堆看起来很复杂的关系链，其实这是参照着 [ES6 规范 ](https://www.ecma-international.org/ecma-262/6.0/#sec-generatorfunction-constructor)构建的关系链：

![regenerator](assets/generator.png)

图中 `+@@toStringTag:s = 'Generator'` 的就是 Gp，`+@@toStringTag:s = 'GeneratorFunction'` 的就是 GeneratorFunctionPrototype。

构建关系链的目的在于判断关系的时候能够跟原生的保持一致，就比如：

```js
function* f() {}
var g = f();
console.log(g.__proto__ === f.prototype); // true
console.log(g.__proto__.__proto__ === f.__proto__.prototype); // true
```

为了简化起见，我们可以把 Gp 先设置为一个空对象，不过正如你在上图中看到的，next()、 throw()、return() 函数都是挂载在 Gp 对象上，实际上，在完整的编译代码中，确实有为 Gp 添加这三个函数的方法：

```js
// Helper for defining the .next, .throw, and .return methods of the
// Iterator interface in terms of a single ._invoke method.
function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
        define(prototype, method, function(arg) {
            return this._invoke(method, arg);
        });
    });
}
// Define Generator.prototype.{next,throw,return} in terms of the
// unified ._invoke helper method.
defineIteratorMethods(Gp);
```

归纳起来，`mark` 即是改变生成器函数的原型为 Gp，简单起见，我们将整个 mark 函数简化为：

```js
mark = function(genFun) {
    var generator = Object.create({
        next: function(arg) {
            return this._invoke('next', arg)
        }
    });
    genFun.prototype = generator;
    return genFun;
};
```

## wrap 函数

除了设置关系链之外，mark 函数的返回值 genFun 还作为了 wrap 函数的第二个参数传入：

```js
function helloWorldGenerator() {
    return regeneratorRuntime.wrap(
        function helloWorldGenerator$(_context) {
            //...
        },
        _marked,
        this
    );
}
```

我们再看下 wrap 函数：

```js
function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, 
    // then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) });

    return generator;
}
exports.wrap = wrap;
```

当执行 `var hw = helloWorldGenerator();` 的时候，其实执行的是 `wrap` 函数，`wrap`  函数返回了 generator，generator 是一个对象，原型是 `outerFn.prototype`, `outerFn.prototype` 其实就是 `genFun.prototype`， `genFun.prototype` 是一个空对象，原型上有 `next()` 方法。

所以当你执行 `hw.next()` 的时候，执行的其实是 hw 原型的原型上的 next 函数，next 函数执行的又是 hw 的 _invoke 函数：

```js
defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) });
```

`innerFn` 就是 wrap 包裹的那个函数，其实就是 `helloWordGenerato$` 函数，呐，就是这个函数：

```js
helloWorldGenerator$(_context) {
    while (1)
        switch ((_context.prev = _context.next)) {
            case 0:
                _context.next = 2;
                return "hello";
            case 2:
                _context.next = 4;
                return "world";
            case 4:
                return _context.abrupt("return", "ending");
            case 5:
            case "end":
                return _context.stop();
        }
}
```

而 context 你可以直接理解为这样一个全局对象：

```js
var ContinueSentinel = {};

var context = {
  done: false,
  method: "next",
  next: 0,
  prev: 0,
  abrupt: function(type, arg) {
    var record = {};
    record.type = type;
    record.arg = arg;

    return this.complete(record);
  },
  complete: function(record, afterLoc) {
    if (record.type === "return") {
      this.rval = this.arg = record.arg;
      this.method = "return";
      this.next = "end";
    }

    return ContinueSentinel;
  },
  stop: function() {
    this.done = true;
    return this.rval;
  }
};
```

每次 `hw.next` 的时候，就会修改 next 和 prev 属性的值，当在 generator 函数中 return 的时候会执行 abrupt，abrupt 中又会执行 complete，执行完 complete，因为 `this.next = end` 的缘故，再执行就会执行 stop 函数。

我们来看下 makeInvokeMethod 函数：

```js
  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }
```

基本的执行过程就不分析了，我们重点看第三次执行 `hw.next()` 的时候:

第三次执行 `hw.next()` 的时候，其实执行了

```js
this._invoke("next", undefined);
```

我们在 invoke 函数中构建了一个 record 对象：

```js
var record = tryCatch(innerFn, self, context);

// Try/catch helper to minimize deoptimizations. Returns a completion
// record like context.tryEntries[i].completion. This interface could
// have been (and was previously) designed to take a closure to be
// invoked without arguments, but in all the cases we care about we
// already have an existing method we want to call, so there's no need
// to create a new function object. We can even get away with assuming
// the method takes exactly one argument, since that happens to be true
// in every case, so we don't have to touch the arguments object. The
// only additional allocation required is the completion record, which
// has a stable shape and so hopefully should be cheap to allocate.
function tryCatch(fn, obj, arg) {
    try {
        return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
        return { type: "throw", arg: err };
    }
}
```

而在 `innerFn.call(self, context)` 中，因为 _context.next 为 4 的缘故，其实执行了:

```js
_context.abrupt("return", 'ending');
```

而在 abrupt 中，我们又构建了一个 record 对象：

```js
var record = finallyEntry ? finallyEntry.completion : {};
record.type = type;
record.arg = arg;
```

然后执行了 `this.complete(record)`，在 complete 中，因为 `record.type === "return"`

```js
this.rval = this.arg = record.arg;
this.method = "return";
this.next = "end";
```

然后返回了全局对象 ContinueSentinel，其实就是一个全局空对象。

然后在 invoke 函数中，因为 `record.arg === ContinueSentinel` 的缘故，没有执行后面的 return 语句，就直接进入下一个循环。

于是又执行了一遍 `innerFn.call(self, context)`，此时 `_context.next` 为 end, 执行了 `_context.stop()`, 在 stop 函数中：

```js
stop: function() {
    this.done = true;

    var rootEntry = this.tryEntries[0];
    var rootRecord = rootEntry.completion;
    if (rootRecord.type === "throw") {
        throw rootRecord.arg;
    }

    return this.rval; // this.rval 其实就是 `ending`
},
```

所以最终返回的值为:

```json
{
    value: 'ending',
    done: true
};
```

之后，我们再执行 hw.next() 的时候，因为 state 已经是 'completed' 的缘故，直接就返回 `{ value: undefined, done: true}`


+ https://github.com/facebook/regenerator/blob/main/packages/transform/src/index.js