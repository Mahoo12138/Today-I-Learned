## Webpack 解决了什么问题？

**如何在前端项目中更高效地管理和维护项目的每一个资源。**

想要搞明白 Webpack，就必须先对它想要解决的问题或者目标有一个充分的认识。

### 模块化的演进过程

#### Stage 1 - 文件划分方式

以一个 js 脚本文件为模块划分，通过 script 标签引入：

```js
// module-a.js
function foo(){
    console.log("ModuleA#foo")
}

// module-b.js
function bar(){
    console.log("ModuleB#bar")
}
```

```html
<!-- index.html -->
<html>
    <script src="module-a.js" ></script>
    <script src="module-b.js" ></script>
</html>
```

+ 模块直接在全局工作，大量模块成员污染全局作用域；
+ 没有私有空间，所有模块内的成员都可以在模块外部被访问或者修改；
+ 一旦模块增多，容易产生命名冲突；
+ 无法管理模块与模块之间的依赖关系；
+ 在维护的过程中也很难分辨每个成员所属的模块；

#### Stage 2 - 命名空间方式

在每一个 js 文件中，通过在 window 上挂载全局唯一的模块标识变量进行模块导出：

```js
// module-a.js
window.moduleA = {
    foo: function (){
        console.log("ModuleA#foo")
    }
}
```

+ 解决了命名冲突的问题，但是其他问题依旧存在；

#### Stage 3 - IIFE

通过 IIFE 立即执行函数，为模块提供了私有空间，将模块成员声明在 IIFE 的作用域中，需要暴露给外部的成员，即可挂载到 window 全局对象中；这种方式为模块带来了私有成员的概念，私有成员通过闭包的方式进行访问。

```js
;(function (){
    var name = "module-a"
    function foo(){
        console.log("ModuleA#foo")
    }
    window.moduleA = {
        foo: foo
    }
})()
```

+ 实现了模块私有空间；
+ 避免了污染全局作用域即成员命名冲突；

#### Stage 4 - IIFE 依赖参数

在 IIFE 的基础之上，进一步通过传入参数，去声明该模块依赖的模块：

```js
;(function ($){
    var name = "module-a"
    function foo(){
        console.log("ModuleA#foo")
        $('body').animate({margin: "20px"})
    }
    window.moduleA = {
        foo: foo
    }
})(jQuery)
```

+ 强调了模块间的依赖关系；

#### 模块的加载问题

上述的方式都是直接通过 script 标签引入模块，当模块较多，模块依赖复杂时，会变得很难处理以及带来许多不必要的麻烦。

更为理想的方式是**在页面中引入一个 js 入口文件，其余所有用到的模块都可以通过代码去控制，按需加载。**

#### 模块化规范的出现

上述的阶段都是通过约定实现模块化，不同的开发者在实施过程中会出现细微的差别。

为了统一不同开发者、不同项目之间的差异，就需要制定一个行业标准去规范模块化的实现方式

两点需求：

+ 一个统一的模块化标准规范
+ 一个可以自动加载模块的基础库

> **CommonJS 规范**
>
> Node.js 中所遵循的模块规范，该规范约定一个文件就是一个模块，每个模块都有单独的作用域；通过 module.exports 导出成员，再通过 require 函数载入模块。

早期制定前端模块化标准时，并没有直接选择 CommonJS 规范，而是专门为浏览器端重新设计了一个规范——**AMD (Asynchronous Module Definition)**，即异步模块定义规范。

同期推出 Require.js，除了实现了 AMD 模块化规范，本身也是一个非常强大的模块加载器。

```js
// AMD 规范定义一个模块
define(['jquery', './module2.js'], function($, module2) { 
    return {
        start: function(){
            $('body').animate({margin: '20px' }) 
            module2()
        }
    }
})

// AMD 规范载入一个模块
require(['./modules/module1.js'], function (module1) { 
    module1.start()
})
```

#### 模块化的标准规范

JavaScript 的标准逐渐走向完善，模块化规范的最佳实践方式也基本实现了统一：

+ 在 Node.js 环境中，遵循 CommonJS 规范来组织模块；

+ 在浏览器环境中，遵循 ES Modules 规范；

ES Modules 规范是 ECMAScript 2015 （ES6）中才定义的模块系统，是近几年才制定的标准，存在环境兼容的问题。随着Webpack等一系列打包工具的流行，这一规范才开始逐渐被普及，经过多年的迭代， **ES Modules 已发展成为现今最主流的前端模块化标准**。

### 模块打包工具的出现

+ 我们所使用的 ES Modules 模块系统本身就存在环境兼容问题，尽管现如今主流浏览器的最新版本都支持这一特性，但是目前还无法保证用户的浏览器使用情况，所以还需要**解决兼容问题**；
+ 模块化的方式划分出来的**模块文件过多**，而前端应用又运行在浏览器中，每一个文件都需要单独从服务器请求回来零散的模块文件，必然会导致浏览器的频繁发送网络请求，影响应用的工作效率；
+ 随着应用日益复杂，在前端应用开发过程中不仅仅只有JavaScript代码需要模块化，HTML 和 CSS 这些**资源文件**也会面临需要被**模块化**的问题；从宏观角度来看，这些文件也都应该看作前端应用中的一个模块，只不过这些模块的种类和用途跟 JavaScript 不同；

基于以上需求，我们对打包工具做出了对应的设想：

1. 具备代码的编译能力，能将开发时编写的包含新特性或者存在浏览器差异的代码，转化为兼容大多数环境的代码；
2. 能够将众多分散的模块重新打包到一起，解决浏览器频繁请求模块文件的问题；
3. 能够将开发过程中的一系列资源文件都视作模块，打包在一起。

## 如何使用 Webpack 实现模块化打包？

Webpack 4 以后的版本支持零配置的方式直接启动打包，整个过程会按照约定将 *src/index.js* 作为打包入口，最终打包的结果会存放到 *dist/main.js* 中。

### Webpack 的工作模式

Webpack 针对不同环境的三组预设配置：

+ production：启动内置优化插件，自动优化打包结果，打包速度偏慢；
+ development：自动优化打包速度，添加一些调试过程中的辅助插件以便于更好的调试错误；
+ none：运行最原始的打包，不做任何额外处理，这种模式一般需要分析我们模块的打包结果时会用到。

想要修改 Webpack 工作模式的方式有两种：

+ 通过 `CLI --mode` 参数传入；
+ 通过配置文件设置 `mode` 属性；

### 打包结果运行原理

通过设置 mode=none，可查看详细的 webpack 打包产物：

整体生成的代码是一个 IIFE，函数参数为源代码中对于的模块：

```js
(function(modules) {})
([
    (function(module, __webpack_exports__, __webpack_require__) {}),
    (function(module, __webpack_exports__, __webpack_require__) {}),
])
```

在 IIFE 内部，即 Webpack 的入口：

```js
// The module cache
var installedModules = {};
// The require function
function __webpack_require__(moduleId) {}
// expose the modules object (__webpack_modules__)
__webpack_require__.m = modules;
// expose the module cache
__webpack_require__.c = installedModules;
// define getter function for harmony exports
__webpack_require__.d = function(exports, name, getter) {};
// define __esModule on exports
__webpack_require__.r = function(exports) {};

// create a fake namespace object
// mode & 1: value is a module id, require it
// mode & 2: merge all properties of value into the ns
// mode & 4: return value when already ns object
// mode & 8|1: behave like require
__webpack_require__.t = function(value, mode) {};
// getDefaultExport function for compatibility with non-harmony modules
__webpack_require__.n = function(module) {};
// Object.prototype.hasOwnProperty.call
__webpack_require__.o = function(object, property) {};
// __webpack_public_path__
__webpack_require__.p = "";

// Load entry module and return exports
return __webpack_require__(__webpack_require__.s = 0);
```

+ 声明了一个对象 `installedModules`，用于管理已经加载过的模块；
+ 声明了加载模块函数 `__webpack_require__`；
+ 之后在 `__webpack_require__`上挂载了一些数据和一些工具方法；
+ 最后调用  `__webpack_require__(0)`，加载第一个模块，即入口点模块；

#### \_\_webpack_require__

```js
function __webpack_require__(moduleId) {
    // Check if module is in cache
    if(installedModules[moduleId]) {
        return installedModules[moduleId].exports;
    }
    // Create a new module (and put it into the cache)
    var module = installedModules[moduleId] = {
        i: moduleId,
        l: false,
        exports: {}
    };
    // Execute the module function
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

    // Flag the module as loaded
    module.l = true;

    // Return the exports of the module
    return module.exports;
}
```

上述代码清晰地展示了模块是如何被加载的，模块本身是一个函数，使用 `call` 并将 `module.exports` 作为 this ，同时传入一个模块必要的参数进行调用。调用后，标记该模块已加载，并返回模块的导出内容；

#### \_\_webpack_require\_\_.r

```js
__webpack_require__.r = function(exports) {
    if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    }
    Object.defineProperty(exports, '__esModule', { value: true });
};
```

r 函数很简单，只是在模块导出内容对象上做了一个标记，指明这是个 ESModule。

### 如何通过 Loader 加载特殊资源？

Webpack 支持管理前端项目中任意类型的资源文件，只需要添加合适 Loader 进行处理即可。

### 如何加载资源模块？

我们以一个例子来进行了解，修改 Webpack 配置，新建一个 main.css 文件，将其作为入口模块，此时进行打包会报错，因为默认的 Loader 只能处理 js 文件，而对于 CSS 样式会报错不能进行语法解析。

而处理 CSS 文件，可使用 `css-loader `，修改配置文件：

```js
module.exports = {
  entry: "./src/main.css",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: "css-loader"
      }
    ]
  }
}
```

此时则可以进行正常打包了，虽然只有一个 main.css 文件，但是打包后的模块却有两个：

```js
[
  (function (module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var _css_loader_ = __webpack_require__(1);
    var _css_loader__default = __webpack_require__.n(_css_loader_);
    // Imports
    var ___CSS_LOADER_EXPORT___ = _css_loader__default()(function (i) { return i[1] });
    // Module
    ___CSS_LOADER_EXPORT___.push([module.i, "body {\n  margin: 0;\n  padding: 0;\n}", ""]);
    // Exports
    __webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);

  }),
  (function (module, exports, __webpack_require__) {
    "use strict";

    /**
     * MIT License http://www.opensource.org/licenses/mit-license.php
     * Author Tobias Koppers @sokra
     */
    // css base code, injected by the css-loader
    // eslint-disable-next-line func-names
    module.exports = function (cssWithMappingToString) {
      var list = []; // return the list of modules as css string

      list.toString = function toString() {
        return this.map(function (item) {
          var content = cssWithMappingToString(item);

          if (item[2]) {
            return "@media ".concat(item[2], " {").concat(content, "}");
          }

          return content;
        }).join("");
      }; 
      // import a list of modules into the list
      list.i = function (modules, mediaQuery, dedupe) {
        if (typeof modules === "string") {
          modules = [[null, modules, ""]];
        }

        var alreadyImportedModules = {};

        if (dedupe) {
          for (var i = 0; i < this.length; i++) {
            var id = this[i][0];

            if (id != null) {
              alreadyImportedModules[id] = true;
            }
          }
        }

        for (var _i = 0; _i < modules.length; _i++) {
          var item = [].concat(modules[_i]);

          if (dedupe && alreadyImportedModules[item[0]]) {
            continue;
          }

          if (mediaQuery) {
            if (!item[2]) {
              item[2] = mediaQuery;
            } else {
              item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
            }
          }
          list.push(item);
        }
      };
      return list;
    };
  })
]
```

通过注释，可以了解到，第二个模块是 `css_loader` 注入的一个模块，先不管其作用，首先`main.css` 是并没有生效的：

```js
___CSS_LOADER_EXPORT___.push([module.i, "body {\n  margin: 0;\n  padding: 0;\n}", ""]);
__webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);
```

因为代码中，入口模块仅是把 CSS 字符串化，然后放到一个数组中，默认导出了，这也就是 `css-loader` 的主要做的。

也就是说，只是把 CSS 加载到了 js 代码中，并没有进行使用，使其生效的做法是添加 `style-loader`：

```js
{
    test: /\.css$/,
    use: [
        "style-loader",
        "css-loader"
    ]
}
```

> 注意，对同一个模块使用多个 Loader 时，需要注意 Loader 的顺序，因为 Webpack 会从 loader 数组尾部开始对模块进行处理。 

### 为什么在 js 加载资源文件？

假设在开发页面上的某个局部功能时，需要用到一个样式模块和一个图片文件；如果你还是将这些资源文件单独引入到 HTML 中，然后再到 JS 中添加对应的逻辑代码。

试想如果后期这个局部功能不用了，你就需要同时删除 JS 中的代码和 HTML 中的资源文件引入，也就是**需要同时维护两条线**。而如果你遵照 Webpack 的这种设计，所有资源的加载都是由 JS 代码控制，**后期只需要维护 JS 代码这一条线**即可。

如果建立这种依赖关系：

1. 逻辑上比较合理，因为 JS 确实需要这些资源文件配合才能实现整体功能；
2. 配合 Webpack 这类工具的打包能确保在上线时，资源不会缺失，而且都是必要的；

**学习新事物不是说学会它的所有用法，你就能提高，能搞明白新事物为什么这样设计，基本上你就算出道了。**

### 开发一个 Loader

开发一个处理 markdown 的 Loader，进一步了解 Loader 的处理机制：

```js
module.exports = (source) => {
  console.log(source)
  return "hello loader!"
}
```

```js
{
    test: /\.md$/,
    // 使用相对路径导入
    use: './loader/markdown-loader'
}
```

通过这样配置后，直接打包输出，会提示 *You may need an additional loader to handle the result of these loaders.*，这是因为资源文件经过一连串的流水线式的 Loader 处理后，必须返回标准的 JS 代码：

```mermaid
graph LR
S[Any Source] --> Loader1 
Loader1 --> Loader2
Loader2 --> Loader3
Loader3 --> E[JavaScript Code]
```

解决办法：

+ 直接在这个 Loader 的最后返回一段 JS 代码字符串
+ 再找一个合适的加载器，在后面接着处理我们这里得到的结果

 我们尝试着，将 loader 中的返回内容，替换为 js 代码字符串：

```js
module.exports = (source) => {
  console.log(source)
  return "console.log('hello loader!')"
}
```

此时进行打包则不会报错了，而生成的模块中也包含了 loader 返回的内容：

```js
(function(module, exports) {
    console.log('hello loader!')
})
```

#### 实现 Loader 的逻辑

需要安装一个能够将 Markdown 解析为 HTML 的模块 —— *marked*，在 *markdown-loader.js* 中导入这个模块然后使用这个模块去解析 source。

```js
const { marked } = require('marked')

module.exports = source => {
  //1. 将 markdown 转换为 html 字符串
  const html = marked(source)
  //2. 将 html 字符串拼接为一段导出字符串的 JS 代码
  const code = `module.exports = ${JSON.stringify(html)}`
  return code
}
```

再次打包模块内容如下：

```js
(function(module, exports) {
    module.exports = "<h1>About</h1>\n<p>Hello markdown !</p>\n"
})
```

#### 多个 Loader 的配合

另外，我们可以直接让 *markdown-loader* 返回 html 字符串，将其交给其他 Loader 进行处理。

安装一个处理 HTML 的 Loader *html-loader*，安装完成过后，回到配置文件同样把 use 属性修改为一个数组以便依次使用多个 Loader：

```js
{
    test: /\.md$/,
    use: ["html-loader", './loader/markdown.loader']
}
```

*html-loader* 所作的操作等价于我们上面手动处理的操作：

```js
(function(module, exports) {
    // Module
    var code = "<h1>About</h1>\n<p>Hello markdown !</p>\n";
    // Exports
    module.exports = code;
})
```

