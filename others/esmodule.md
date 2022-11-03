# 漫画：深入浅出 ES 模块

ES 模块为 JavaScript 提供了官方标准化的模块系统。然而，这中间经历了一些时间 —— 近 10 年的标准化工作。

但等待已接近尾声。随着 5 月份 Firefox 60 发布（[目前为 beta 版](https://www.mozilla.org/en-US/firefox/developer/)），所有主流浏览器都会支持 ES 模块，并且 Node 模块工作组也正努力在 [Node.js](https://nodejs.org/en/) 中增加 ES 模块支持。同时[用于 WebAssembly 的 ES 模块集成](https://www.youtube.com/watch?v=qR_b5gajwug) 也在进行中。

许多 JavaScript 开发人员都知道 ES 模块一直存在争议。但很少有人真正了解 ES 模块的运行原理。

让我们来看看 ES 模块能解决什么问题，以及它们与其他模块系统中的模块有什么不同。

### 模块要解决什么问题？

你可以仔细回想，JavaScript 的编码都是关于管理变量的。所做的事都是为变量赋值，或者在变量上做加法，或者将两个变量组合在一起并放入另一个变量中。

![Code showing variables being manipulated](https://hacks.mozilla.org/files/2018/03/01_variables.png)

因为你的代码中很多都是关于改变变量的，你如何组织这些变量会对你的编码方式以及代码的可维护性产生很大的影响。

一次只需要考虑少量的变量就可以让我们的工作变得更简单。JavaScript 有一种方法可以帮助你做到这点，称为作用域。由于 JavaScript 中的作用域机制，一个函数无法访问在其他函数中定义的变量。

![Two function scopes with one trying to reach into another but failing](https://hacks.mozilla.org/files/2018/03/02_module_scope_01.png)

这很好。这意味着当你写一个函数时，只需关注这个函数本身。你不必担心其他函数可能会对函数内的变量做些什么。

尽管如此，它仍然存在缺陷。这使得在函数间共享变量变得有点困难。

如果你想在作用域外共享变量，会怎么做呢？一种常见方法是将它放在更外层的作用域里……例如，在全局作用域中。

你可能还记得这个在 jQuery 时代的操作。在加载任何 jQuery 插件之前，你必须确保 jQuery 在全局作用域中。

![Two function scopes in a global, with one putting jQuery into the global](https://hacks.mozilla.org/files/2018/03/02_module_scope_02.png)

这是没问题的，但是会产生一些烦人的问题。

首先，所有的 script 标签都需要按照正确的顺序排列。且你必须谨慎确保那个顺序不被打乱。

如果你打乱了这个顺序，那么在运行的过程中，你的应用程序就会抛出一个错误。当函数寻找它期望的 jQuery 时 —— 在全局作用域里 —— 却没有找到它，它会抛出一个错误并停止运行。

![The top function scope has been removed and now the second function scope can’t find jQuery on the global](https://hacks.mozilla.org/files/2018/03/02_module_scope_03.png)

这使得维护代码非常棘手。这让移除老代码或老 script 标签变成了一场轮盘赌游戏。你不知道会弄坏什么。代码的不同部分之间的依赖关系是隐式的。任何函数都可以获取全局作用域中的任何东西，所以你不知道哪些函数依赖于哪些 script 标签。

第二个问题是，因为这些变量位于全局范围内，所以全局范围内的代码的每个部分都可以更改该变量。恶意代码可能会故意更改该变量，以使你的代码执行某些你并不想要的操作，或者非恶意代码可能会意外地弄乱你的变量。

### 模块是如何提供帮助的？

模块为你提供了更好的方法来组织这些变量和函数。通过模块，你可以将变量和函数更好地分组在一起。

这会将这些函数和变量放入模块作用域。模块作用域能被用于在模块中的函数间共享变量。

但是与函数作用域不同，模块作用域有一种方式使其变量对其他模块可用。它们可以显式地表明了模块中的哪些变量、类或函数是可用的。

当将某些东西对其他模块可用时，这被称为 export ；一旦你声明了一个 export，其他模块就可以显式地说它们依赖于该变量、类或函数。

![Two module scopes, with one reaching into the other to grab an export](https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2018/03/02_module_scope_04.png)

因为这是显式的关系，所以当删除了某个模块时，你可以确定哪些模块会出问题。

一旦你能够在模块之间导出和导入变量，就可以更容易地将代码分解为可独立工作的小块。然后，你可以组合或重组这些代码块（像乐高一样），从同一组模块中创建出各种不同的应用程序。

由于模块非常有用，历史上有多次向 JavaScript 添加模块功能的尝试。如今有两个模块系统正在大范围地使用。CommonJS（CJS）是 Node.js 历史上使用的。ESM（EcmaScript 模块）是一个更新的系统，已被添加到 JavaScript 规范中。浏览器已经支持了 ES 模块，并且 Node 也正在添加支持。

让我们来深入了解这个新模块系统的工作原理。

### ES 模块如何工作

使用模块开发时，会建立一个依赖图。不同依赖项之间的连接来自你使用的所有 import 语句。

浏览器或者 Node 通过 import 语句来确定需要加载什么代码。你给定一个文件来作为依赖图的入口。之后将会随着 import 语句来找到所有剩余的代码。

![A module with two dependencies. The top module is the entry. The other two are related using import statements](https://hacks.mozilla.org/files/2018/03/04_import_graph.png)

但这些文件本身并不能被浏览器直接使用。浏览器需要把这些文件解析成一种叫做**模块记录**（Module Records）的数据结构。这样它就知道了文件中到底是什么情况。

![A module record with various fields, including RequestedModules and ImportEntries](https://hacks.mozilla.org/files/2018/03/05_module_record.png)

之后，模块记录需要转化为**模块实例**（module instance）。一个实例包含两个部分：代码和状态。

代码基本上是一组指令。它像是一个告诉你如何制作某些东西的配方。但仅靠代码本身并不能做任何事情。你需要将原材料和这些指令组合起来使用。

什么是状态？状态就是给你这些原材料的东西。状态是所有变量在任何时间的实际值的集合。当然，这些变量只是内存中保存值的数据块的别名而已。

所以模块实例将代码（指令列表）和状态（所有变量的值）组合在一起。

![A module instance combining code and state](https://hacks.mozilla.org/files/2018/03/06_module_instance.png)

我们需要的是每个模块的模块实例。模块加载就是从此入口文件开始，到生成包含全部模块实例的依赖图的过程。

对于 ES 模块来说，这主要有三个步骤：

1. 构造 —— 查找、下载并解析所有文件到模块记录中。
2. 实例化 —— 在内存中寻找一块区域来存储所有导出的变量（但还没有填充值）。然后让 export 和 import 都指向这些内存块。这个过程叫做链接（linking）。
3. 求值 —— 运行代码，在内存块中填入变量的实际值。

![The three phases. Construction goes from a single JS file to multiple module records. Instantiation links those records. Evaluation executes the code.](https://hacks.mozilla.org/files/2018/03/07_3_phases.png)

人们说 ES 模块是异步的。你可以把它当作时异步的，因为整个过程被分为了三阶段 —— 加载、实例化和求值 —— 这三个阶段可以分开完成。

这意味着 ES 规范确实引入了一种在 CommonJS 中并不存在的异步性。我稍后会再解释，但是在 CJS 中，一个模块和其下的所有依赖会一次性完成加载、实例化和求值，中间没有任何中断。

当然，这些步骤本身并不必须是异步的。它们可以以同步的方式完成。这取决于什么在做加载这个过程。这是因为 ES 模块规范并没有控制所有的事情。实际上有两部分工作，这些工作分别由不同的规范控制。

[ES模块规范](https://tc39.github.io/ecma262/#sec-modules)说明了如何将文件解析到模块记录，以及如何实例化和求值该模块。但是，它并没有说明如何首先获取文件。

是加载器来获取文件。加载器在另一个不同的规范中定义。对于浏览器来说，这个规范是 [HTML 规范](https://html.spec.whatwg.org/#fetch-a-module-script-tree)。但是你可以根据所使用的平台有不同的加载器。

<img src="https://hacks.mozilla.org/files/2018/03/07_loader_vs_es.png" alt="Two cartoon figures. One represents the spec that says how to load modules (i.e., the HTML spec). The other represents the ES module spec."  />

加载器还精确控制模块的加载方式。它调用 ES 模块的方法 —— `ParseModule`、`Module.Instantiate` 和 `Module.Evaluate`。这有点像通过提线来控制 JS 引擎这个木偶。

![The loader figure acting as a puppeteer to the ES module spec figure.](https://hacks.mozilla.org/files/2018/03/08_loader_as_puppeteer.png)

现在让我们更详细地介绍每一步。

#### 构造

在构造阶段，每个模块都会经历三件事情。

1. 找出从哪里下载包含该模块的文件（也称为模块解析）
2. 获取文件（从 URL 下载或从文件系统加载）
3. 将文件解析为模块记录

#### 查找文件并获取

加载器将负责查找文件并下载它。首先它需要找到入口文件。在 HTML 中，你通过使用 script 标记来告诉加载器在哪里找到它。

![A script tag with the type=module attribute and a src URL. The src URL has a file coming from it which is the entry](https://hacks.mozilla.org/files/2018/03/08_script_entry.png)

但它如何找到剩下的一堆模块 —— 那些 `main.js` 直接依赖的模块？

这就要用到 import 语句了。import 语句中的一部分称为**模块标识符**。它告诉加载器哪里可以找到余下的模块。

![An import statement with the URL at the end labeled as the module specifier](https://hacks.mozilla.org/files/2018/03/09_module_specifier.png)

关于模块标识符有一点需要注意：它们有时需要在浏览器和 Node 之间进行不同的处理。每个宿主都有自己的解析模块标识符字符串的方式。要做到这一点，它使用了一种称为模块解析的算法，它在不同平台之间有所不同。目前，在 Node 中可用的一些模块标识符在浏览器中不起作用，但[这个问题正在被修复](https://github.com/domenic/package-name-maps)。

在修复之前，浏览器只接受 URL 作为模块标识符。它们将从该 URL 加载模块文件。但是，这并不是在整个依赖图上同时发生的。在解析文件前，并不知道这个文件的模块中需要再获取哪些依赖……并且在获取文件之前无法解析那个文件。

这意味着我们必须逐层遍历依赖树，解析一个文件，然后找出它的依赖关系，然后查找

并加载这些依赖

![A diagram that shows one file being fetched and then parsed, and then two more files being fetched and then parsed](https://hacks.mozilla.org/files/2018/03/10_construction.png)

如果主线程要等待这些文件的下载，那么很多其他任务将堆积在队列中。

这是就是为什么当你使用浏览器时，下载部分需要很长时间。

![A chart of latencies showing that if a CPU cycle took 1 second, then main memory access would take 6 minutes, and fetching a file from a server across the US would take 4 years](https://hacks.mozilla.org/files/2018/03/11_latency.png)

像这样阻塞主线程会让采用了模块的应用程序速度太慢而无法使用。这是 ES 模块规范将算法分为多个阶段的原因之一。将构造过程单独分离出来，使得浏览器在执行同步的初始化过程前可以自行下载文件并建立自己对于模块图的理解。

这种方法 —— 将算法分解成不同阶段 —— 是 ES 模块和 CommonJS 模块之间的主要区别之一。

CommonJS 可以以不同的方式处理的原因是，从文件系统加载文件比在 Internet 上下载需要少得多的时间。这意味着 Node 可以在加载文件时阻塞主线程。而且既然文件已经加载了，直接实例化和求值（在 CommonJS 中并不区分这两个阶段）就理所当然了。这也意味着在返回模块实例之前，你遍历了整棵树，加载、实例化和求值了所有依赖关系。

![A diagram showing a Node module evaluating up to a require statement, and then Node going to synchronously load and evaluate the module and any of its dependencies](https://hacks.mozilla.org/files/2018/03/12_cjs_require.png)