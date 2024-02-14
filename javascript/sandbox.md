# 实现 JavaScript 沙箱的几种方式

沙箱(sandbox)是一种安全机制， 为运行中的程序提供的隔离环境。通常是作为一些来源不可信、具破坏力或无法判定程序意图的程序提供实验之用。沙盒通常严格控制其中的程序所能访问的资源，比如，沙盒可以提供用后即回收的磁盘及内存空间。

## JS 中沙箱的使用场景

前端 JS 中也会有应用到沙箱的时候，毕竟有时候你要获取到的是第三方的 JS 文件或数据？而这数据又是不一定可信的时候，创建沙箱，做好保险工作尤为重要

- jsonp：解析服务器所返回的 jsonp 请求时，如果不信任 jsonp 中的数据，可以通过创建沙箱的方式来解析获取数据；（TSW 中处理 jsonp 请求时，创建沙箱来处理和解析数据）；
- 执行第三方 js：当你有必要执行第三方 js 的时候，而这份 js 文件又不一定可信的时候；
- 在线代码编辑器：相信大家都有使用过一些在线代码编辑器，而这些代码的执行，基本都会放置在沙箱中，防止对页面本身造成影响；（例如：<https://codesandbox.io/s/new>）
- vue 模板中表达式计算：vue 模板中表达式的计算被放在沙盒中，只能访问全局变量的一个白名单，如 Math 和 Date 。你不能够在模板表达式中试图访问用户定义的全局变量

总而言之：当你要解析或执行不可信的 JS 的时候，当你要隔离被执行代码的执行环境的时候，当你要对执行代码中可访问对象进行限制的时候，沙箱就派上用场了。

## JS 沙箱实现

### [eval](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval)

eval 大家都非常熟系，可以将一个 JavaScript 字符作为代码片段来执行:

```javascript
const str = `
    var a = 0
    a = 1 + 1;
    console.log('total a', a);
`;
eval(str)
```

> eval 在运行时提供了一个编译器，可快速将字符串转换为代码

但 eval 具有诸多安全隐患，比如代码注入：

```javascript
global.name = 'x1_debug'

eval('console.log(name') // x1_debug
```

除此以外，eval 的编译过程对性能有一定影响。代码复杂时，会极大增加调试的难度。

### vm.runInContext

在 Node.js 中，我们可以通过 **VM** 模块来创建一个独立的执行上下文，我们熟知的 common.js 的规范，便采用了这种方式执行 require 的代码片段, 下面是 vm 沙箱的一个简单是示例：

```js
const vm = require('vm');

const script = new vm.Script('a + b')
const sandbox = { a: 1, b: 2 };
context = vm.createContext(sandbox)

console.log(script.runInContext(context)) // 3
```

通过 Node vm 模块可以快速创建一个与外界隔离的执行环境，但是确可以通过一些方式来完成沙箱的「逃逸」， node 官网对 vm 模块也标记了 「**vm 模块不是安全的机制。 不要使用它来运行不受信任的代码。** 」：

```js
const vm = require("vm");
const env = vm.runInNewContext(`
   this.constructor.constructor('return this.process.env')()`
);
console.log(env); // process.env
```

> 可以看到，我们通过 runInNewContext 可以访问到外层 node 环境的 process 对象，完成了沙箱的逃逸

**为何会这样呢？**

这是因为 JS 基于原型链，js 对象通过 **proto** 指向 Object.prototype，通过 Object.prototype 向上查找到 Function，最终完成沙盒逃逸并执行代码:

```js
const vm = require("vm");
const env = vm.runInNewContext(`
  this.constructor.constructor
`);
console.log(env); // [Function: Function]
```

当然，如果在 node.js 环境中有这种安全述求，可以使用 vm2 更安全的 vm 模块：

```js
const { VM } = require('vm2');
const vm = new VM();

vm.run(`process.exit()`); // TypeError: process.exit is not a function
```

通过上述原因，可以进一步推测下 VM2 模块中对于「沙箱逃逸」阻隔的实现：

```js
class Vm2 {
 constructor() {
  ...
  Object.defineProperties(this, {
   __proto__: null,
   _runScript: {
    __proto__: null, 
    value: runScript
   },
   ...
  });
  ...
 }

 run(script) { this._runScript(script) } 
}
```

### iframe

iframe 是一个非常安全的隔离环境，在浏览器中，我们也可以利用 iframe 来实现沙箱的效果：

```html
<iframe
  id="sandbox"
  sandbox="”allow-forms"
  allow-same-origin
  allow-scripts”
  src="./iframe.html"
></iframe>

<script>
const iframe = document.getElementById('sandbox')
iframe.contentWindow.postMessage("a + b", '*')
</script>
```

iframe.html

```html
<!--iframe.html-->
<script>
  var a = 1;
  var b = 2;
  var _this = this
  window.addEventListener('message', function(e) {
    const result = eval(e.data)
    _this.postMessage(result, e.origin) // 沙箱执行完毕，通知外部执行结果
  })
</script>
```

可以看到通过这种方式，可以有效完成作用域的隔离。并且 iframe 为我们提供了多个安全参数，比如`allow-scripts`、`allow-forms`、`allow-same-origin` 方便我们对沙箱进行安全控制。

但这种方式过于臃肿，还需要考虑浏览器的兼容性，也不是最好的解决方案

### [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

`Function` 构造函数创建一个新的 `Function` 对象。直接调用此构造函数可用动态创建函数，但会遇到和 [`eval`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/eval) 类似的的安全问题和(相对较小的)性能问题。然而，与 `eval` 不同的是，`Function` 创建的函数只能在全局作用域中运行。

```js
var x = 10;

function createFunction1() {
    var x = 20;
    return new Function('return x;'); // 这里的 x 指向最上面全局作用域内的 x
}

function createFunction2() {
    var x = 20;
    function f() {
        return x; // 这里的 x 指向上方本地作用域内的 x
    }
    return f;
}

var f1 = createFunction1();
console.log(f1());          // 10
var f2 = createFunction2();
console.log(f2());          // 20
```

使用 new Function 的方式来创建沙箱：

```js
globalThis.name = 'hello'

function sandbox() {
 const a = 1
  const ctx = "console.log('name', name, 'varA', a);"
  return new Function(ctx)()
}

sandbox() //  name hello varA a-a
```

可以配合 `with` 关键字解决上面的问题，我们稍加改造

```js
globalThis.name = 'hello'

function compileCode(expose) {
    const code = `with(context) { return ${expose} }`
    return new Function('context', code)
  }

compileCode("console.log('name', name, 'varA', a)").call(this, { a: 'xx' })

// name hello varA xx
```

> 如上代码，`expose` 执行时，首先会寻找 `context` 中的变量，如果不存在，会往上追溯 `global` 对象，虽然有一道防火墙，但是依然不能阻止 fn 访问全局作用域。Vue 在早期也曾使用这种方式来编译运行时的表达式

似乎在 ECMAScript 5 中，无法解决变量访问「逃逸」的问题了，但是 ES6 中未我们提供了解决方案。

### ES6 Proxy

ES6 中提供了一个 Proxy 函数，他会给对象架设一层拦截器，代理了对对象的各种操作, 我们可以使用 Proxy 对上面的案列在做下修改：

```typescript
class SandBox<T extends { [key: string]: unknown }> {
  scope: T

  constructor(context: T) {
    const proxy = new Proxy<T>(context, {
      get(target, p: string) {
        return target[p]
      },
      has(target, key: string) {
  if (!target[key]) return false
        return true // 通过 has 拦截器，我们可以过滤掉不受信息的 key
      }
    })

    this.scope = proxy
  }
}
```

通过这种方式, 我们可以拦截或过滤外界对于对象的访问，并且可以控制属性查找的方式，但是 es6 当中有些方法是不会被 with scope 所影响，主要是通过`Symbol.unscopables` 来检测。

### Symbol.unscopables

`Symbol` 能够产生的一个唯一的值，具备一些内建的特性，这些属性可以进行一定程度的”元编程“，通过 `symbol.unscopables` 可以影响 `with` 的行为：

```javascript
var name = () => 'global name'
const Sandbox = {
  property1: 42,
  name() { return 'Sandbox name'; }
};

Sandbox[Symbol.unscopables] = {
  property: false,
  name: true
};

with (Sandbox) {
  console.log(property); // 42
  console.log(name()); // 'global name'
}
```

对象 `Symbol.unscopables` 指用对象自身和继承的属性，通过返回 boolean 来改变 `with` 环境下排除的属性。

## 微前端的沙箱方式

微前端架构中，不同的微前端场景里，快照的方式也不同：

#### 快照沙箱 - Snapshot Sandbox

单应用（实例）的微前端场景中，我们可以采用 ”快照” 的方式创建沙箱，不同的实例共享一个全局变量：

```js
class SnapshotSandbox {
    constructor() {
        this.proxy = window;
        this.dirtyProps = {};
        this.active();
    }

    active() {
        this.snapshot = {};
        for (const prop in window) {
            if (hasOwnProperty(window, prop)) {
                this.snapshot[prop] = window[prop];
            }
        }
        Object.keys(this.dirtyProps).forEach(p => {
            window[p] = this.dirtyProps[p];
        });
    }
    a
    inactive() {
        for (const prop in window) {
            if (hasOwnProperty(window, prop)) {
                // 将快照变量 和 当前 window 属性做对比
                if (window[prop] !== this.snapshot[prop]) {
                    this.dirtyProps[prop] = window[prop];
                    window[prop] = this.snapshot[prop]; // 根据 快照 还原上一次变量
                }
            }
        }
    }
}

```

#### 代理沙箱 - Proxy Sandbox

```js
class ProxySandBox<T extends { [key: string]: unknown }> {
  scope: T

  constructor(context: T) {
    const proxy = new Proxy<T>(context, {
      get(target, p: string) {
        return target[p]
      },
      has(target, key: string) {
		if (!target[key]) return false
        return true // 通过 has 拦截器，我们可以过滤掉不受信息的 key
      }
    })

    this.scope = proxy
  }

  protected compileCode(expose: string) {
    const code = `with(context) { return ${expose} }`
    return new Function('context', code)
  }

  // eslint-disable-next-line
  public runInContext(exp: string): void {
      return this.compileCode(exp).call(this.scope, this.scope)
  }
}

let sandbox1 = new ProxySandBox();
let sandbox2 = new ProxySandBox();
```

## 沙箱在小程序的作用

在小程序里，逻辑层（Service）和渲染层（Render）分别用于处理不同的逻辑运算。

我们知道小程序**渲染层**负责页面 UI 渲染，而逻辑层负责 JS 脚本的执行与计算。但在一些交互场景下，为了提高小程序的执行效率，我们可以采用 WXS / SJS 等脚本能力来提高性能。这类 xml 脚本通过自建脚本执行环境，限制脚本的能力来让业务的代码可以安全、高效的运行时在小程序的**渲染层**。

通过环境注入的 Api，可完成与**逻辑层**的通讯与 api 调用:

以下是一个简单的 xml 脚本使用示例：

```js
// index.xjs 
module.exports.getName = function() { return 'test-name' }

// index.xml
<import-xjs from="./template.xjs" module="scopeName" />
<view>hello, i am scope from {{ scopeName.getName() }}</view> 

// hello, i am scope from test-name
```

在渲染层，我们可以使用 **沙箱** 来完成这类能力：

```js
class ProxySandBox<T extends { [key: string]: unknown }> {
    scope: T

    constructor(context: T) {
        const proxy = new Proxy<T>(context, {
            get(target, p: string) {
                if (p in xjsModuleName) { // 如果访问的 key 在 xjs 文件模块内
                    const m = Module._Load(xjsModuleName[p]) // 拿到 xjs 模块
                    return m[p]
                }
            },
            has(target, key: string) {
                if (!target[key]) return false
                return true // 通过 has 拦截器，我们可以过滤掉不受信息的 key
            }
        })

        this.scope = proxy
    }
```

