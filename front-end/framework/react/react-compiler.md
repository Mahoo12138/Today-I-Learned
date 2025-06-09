## 介绍 React Compiler

自从从它第一次在 React Conf 2021 亮相。到现在 React Conf 2024 正式开源，我已经苦等了三年之久。盼星星盼月亮，终于把他给盼来了。

> 以前叫 React Forget，现改名为 React Compiler

要了解 React Compiler，这还需要从 React 的更新机制说起。**React 项目中的任何一个组件发生 state 状态的变更，React 更新机制都会从最顶层的根节点开始往下递归对比，通过双缓存机制判断出哪些节点发生了变化，然后更新节点**。这样的更新机制成本并不小，因为在判断过程中，如果 React 发现 `props、state、context` 任意一个不同，那么就认为该节点被更新了。因此，冗余的 `re-render` 在这个过程中会**大量发生**。

> [!Tip] 
> **对比的成本非常小，但是 re-render 的成本偏高**，当我们在短时间之内快速更改 state 时，程序大概率会存在性能问题。因此在以往的开发方式中，掌握性能优化的手段是高级 React 开发者的必备能力

一个组件节点在 React 中很难被判断为没有发生过更新。因为 props 的比较总是不同的。它的比较方式如下：

```js
{} === {} // false
```

因此，高级 React 开发者需要非常了解 React 的默认优化机制，让 props 的比较不发生，因为一旦发生，那么结果必定是 false。

> 事实上，对 React 默认优化机制了解的开发者非常少，我们在开发过程中也不会为了优化这个性能去重新调整组件的分布。更多的还是使用 memo 与 useMemo/useCallback 暴力缓存节点

在这样的背景之下，冗余的 `re-render` 在大量的项目中发生。这也是为什么 React 总是被吐槽性能不好的主要原因。当然，大多数项目并没有频繁更新 state 的需求，因此这一点性能问题表现得并不是很明显。

如果我们要解决冗余 re-render 的问题，需要对 React 默认优化技能有非常深刻的理解，需要对 `memo、useCallback、useMemo` 有准确的理解。但是普通的 React 开发者很难理解他们，有的开发者虽然在项目中大量使用了，但是未必就达到了理想的效果。React Compiler 则是为了解决这个问题，它可以自动帮助我们记忆已经存在、并且没有发生更新的组件，从而解决组件冗余 `re-render` 的问题。

从使用结果的体验来看，React Compiler 被集成在代码自动编译中，因此只要我们在项目中引入成功，就不再需要关注它的存在。**我们的开发方式不会发生任何改变。**它不会更改 React 现有的开发范式和更新方式，侵入性非常弱。

## 检测你的项目是否适合使用 Compiler

并非所有的组件都能被优化。因此早在 React 18 的版本中，React 官方团队就提前发布了严格模式。在顶层根节点中，套一层 `StrictMode` 即可。

```jsx
<StrictMode>  
	<BrowserRouter>    
		<App />  
	</BrowserRouter>
</StrictMode>
```

遵循严格模式的规范，我们的组件更容易符合 React Compiler 的优化规则。

我们可以使用如下方式首先检测代码库是否兼容。在项目根目录下执行如下指令。

```bash
npx react-compiler-healthcheck
```

> 该脚本主要用于检测：
> 
> 1、项目中有多少组件可以成功优化**：越多越好**
> 2、是否使用严格模式，使用了优化成功率更高
> 3、是否使用了与 Compiler 不兼容的三方库

## 如何在不同的项目中使用 Compiler

官方文档中已经明确表示，由于 JavaScript 的灵活性，Compiler 无法捕获所有可能的意外行为，甚至编译之后还会出现错误。因此，目前而言，Compiler 依然可能会有他粗糙的一面。因此，我们可以通过配置，在具体的某一个小目录中运行 Compiler。

```js
const ReactCompilerConfig = {  
	sources: (filename) => {    
		return filename.indexOf('src/path/to/dir') !== -1;  
	},
};
```

React Compiler 还支持对应的 eslint 插件。该插件可以独立运行。不用非得与 Compiler 一起运行。

可以使用如下指令安装该插件

```
npm i eslint-plugin-react-compiler
```

然后在 eslint 的配置中添加：

```js
module.exports = {  
	plugins: [    
		'eslint-plugin-react-compiler',  
	],  
	rules: {    
		'react-compiler/react-compiler': 2,  
	},
}
```

Compiler 目前结合 Babel 插件一起使用，因此，我们首先需要在项目中引入该插件：

```bash
npm i babel-plugin-react-compiler
```

然后，在不同的项目中，有不同的配置。

**添加到 `Babel` 的配置中**，如下所示

```js
module.exports = function () {  
	return {    
		plugins: [
			[
				// must run first! 
				'babel-plugin-react-compiler', ReactCompilerConfig
			],      
			// ...    
		],  
	};
};
```

 > 注意，该插件应该在其他 Babel 插件之前运行

 **在 vite 中使用**

首先，我们需要安装 `vite-plugin-react`，注意不用搞错了，群里有的同学使用了 `vite-plugin-react-swc` 结果搞了很久没配置成功。然后在 vite.config.js 中，添加如下配置：

```js
export default defineConfig(() => {
  return {
    plugins: [
      react({
        babel: {
          plugins: [
            ["babel-plugin-react-compiler", ReactCompilerConfig],
          ],
        },
      }),
    ],
    // ...
  };
});
```
**在 Next.js 中使用**

创建 `babel.config.js` 并添加上面 Babel 同样的配置即可。

**在 Remix 中使用**

安装如下插件，并且添加对应的配置项目。

```bash
npm i vite-plugin-babel
```

```js
// vite.config.js
import babel from "vite-plugin-babel";

const ReactCompilerConfig = { /* ... */ };

export default defineConfig({
  plugins: [
    remix({ /* ... */}),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ["@babel/preset-typescript"], // if you use TypeScript
        plugins: [
          ["babel-plugin-react-compiler", ReactCompilerConfig],
        ],
      },
    }),
  ],
});
```

**在 Webpack 中使用**

我们可以单独为 Compiler 创建一个 Loader。代码如下所示：

```js
const ReactCompilerConfig = { /* ... */ };
const BabelPluginReactCompiler = require('babel-plugin-react-compiler');

function reactCompilerLoader(sourceCode, sourceMap) {
  // ...
  const result = transformSync(sourceCode, {
    // ...
    plugins: [
      [BabelPluginReactCompiler, ReactCompilerConfig],
    ],
  // ...
  });

  if (result === null) {
    this.callback(
      Error(
        `Failed to transform "${options.filename}"`
      )
    );
    return;
  }

  this.callback(
    null,
    result.code
    result.map === null ? undefined : result.map
  );
}

module.exports = reactCompilerLoader;
```

可以在 React 官方了解到更多关于 [React Compiler](https://react.dev/learn/react-compiler) 的介绍与注意事项。目前我已经在 vite 项目中引入，并将项目成功启动。接下来，就谈谈我的使用体验。

## 真实项目使用体验

当项目成功启动，之后，我们可以在 React Devtools v5.x 的版本中，看到被优化过的组件旁边都有一个 `Memo` 标识。如果我们要运行 React Devtools，安装成功之后，需要将如下代码加入到 html 文件中。这样我们就可以利用它来调试 React 项目了。

如果我们要运行 React Devtools，安装成功之后，需要将如下代码加入到 html 文件中。这样我们就可以利用它来调试 React 项目了。

```html
<script src="http://localhost:8097"></script>
```

如果是已有的老项目，我们最好删除 `node_modules` 并重新安装以来。不然项目运行起来可能会报各种奇怪的错误。如果还是不行，可以把 React 版本升级到 19 试试。

总之折腾了一会儿，我成功运行了一个项目。我目前就写了一个简单的组件来测试他的优化效果。代码如下：

```jsx
function Index() {
  const [counter, setCounter] = useState(0)

  function p() {
    console.log('函数执行 ')
  }

  return (
    <div>
      <button onClick={() => setCounter(counter + 1)}>
        点击修改 counter：{counter}
      </button>
      <Children a={1} b={2} c={p} />
    </div>
  )
}
```

我们先来分析一下这段代码。首先，在父组件中，我们设计了一个数字递增的状态。当点击发生时，状态递增。此时父组件会重新 `render`。因此，在以往的逻辑中，子组件 `Children` 由于没有使用任何优化手段，因此，在父组件重新渲染时，子组件由于 props 的比较结果为 false，也会重新执行。

并且其中一个 props 属性还是一个引用对象，因此我们需要使用 `useCallback + memo` 才能确保子组件 Children 不会冗余 `re-render`。

但是此时，我们的组件已经被 React Compiler 优化过，因此，理论上来说，冗余 `re-render` 的事情应该不会发生，尝试了一下，确实如此。如图，我点击了很多次按钮，counter 递增，但是 Children 并没有冗余执行。

这里需要注意的是，引入了 Compiler 插件之后，它会自动工作，我们完全不用关注它的存在。因此，如果程序不出问题，对于开发者来说，编译工作是无感的。所以开发体验非常棒。

> **不过有一些美中不足的是，当我尝试验证其他已经写好的组件被编译之后是否存在问题时，发现有一个组件的运行逻辑发生了变化。目前我还没有深究具体是什么原因导致的，不过通过对比，这个组件的独特之处在与，我在该组件中使用了 `useDeferredValue` 来处理异步请求**.

另外，Compiler 也不能阻止 context 组件的 `re-render`。例如我在一个组件中使用了 `use(context)` ，哪怕我并没有使用具体的值。如下所示：

```jsx
import {use} from 'react'
import {Context} from './context'

export default function Card() {
  const value = use(Context)
  console.log('xxxxx context')
  return (
    <>
      <div className='_06_card'>
        <div className="title">Canary</div>
        <p>The test page</p>
      </div>
    </>
  )
}
```

理想情况是这种情况可以不用发生 re-render。因此总体来说，Compiler 目前确实还不能完全信任。也有可能我还没掌握正确的姿势，还需要对他有更进一步的了解才可以。

不过值得高兴的是，**新项目可以放心使用 Compiler**，因为运行结果我们都能实时感知、调试、调整，能最大程度的避免问题的出现。



## React Compiler 原理

React Compiler 编译之后的代码并非是在合适的时机使用 `useMemo/memo` 等 API 来缓存组件。而是使用了一个名为 **useMemoCache** （代码中为 `_c`） 的 hook 来缓存代码片段：

```jsx
export default function MyApp() {
  return <div>Hello World</div>;
}
```

```jsx
function MyApp() {
  const $ = _c(1);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = <div>Hello World</div>;
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
}
```

```js
const $empty = Symbol.for('react.memo_cache_sentinel');
/**
 * DANGER: this hook is NEVER meant to be called directly!
 **/
export function c(size: number) {
  return React.useState(() => {
    const $ = new Array(size);
    for (let ii = 0; ii < size; ii++) {
      $[ii] = $empty;
    }
    // This symbol is added to tell the react devtools that this array is from
    // useMemoCache.
    // @ts-ignore
    $[$empty] = true;
    return $;
  })[0];
}
```

Compiler 会分析所有可能存在的返回结果，并把每个返回结果都存储在 `useMemoCache` 中。如上所示，他打破了原有的链表存储结果，而选择把缓存结构存储在数组上。因此在执行效率上，Compiler 之后的代码会高不少。每一个渲染结果都会被存储在 `useMemoCache` 的某一项中，如果判断之后发现该结果可以复用，则直接通过读取序列的方式使用即可。

初次感受下来，虽然感觉还不错。但是依然会有一种自己写的代码被魔改的不适感。特别是遇到问题的时候，还不知道到底编译器干了什么事情让最终运行结果与预想的完全不同。

## 如何查看编译之后的代码

+ 可以直接在 Sources 面板中查看；
+ React Compiler Playground：**https://playground.react.dev/**

## 实现原理详细分析

我本来最初的想法是看懂编译之后的代码不是很有必要。但是有的时候会出现一些情况，程序运行的结果跟我预想的不一样。

出现这种迷惑行为的时候就感觉贼困惑，为啥会这样呢？布吉岛 ～，如何调整我自己的写法呢？也不知道。我很不喜欢这种一脸懵逼的感觉。

在 Compiler 编译后的代码中，组件依赖 `useMemoCache` 来缓存所有运算表达式，包括组件、函数等。在下面的例子中，`useMemoCache` 传入参数为 12，说明在该组件中，有 12 个单位需要被缓存。

在初始化时，会默认给所有的缓存变量初始一个值。

```js
$ = useMemoCache(12)

for (let $i = 0; $i < 12; $i += 1) {
  $[$i] = Symbol.for("react.memo_cache_sentinel");
}
```

那么，组件就可以根据缓存值是否等于 `Symbol.for` 的初始值，来判断某一段内容是否被初始化过。**如果相等，则没有被初始化。**

如下：

```js
let t1;

if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
  t1 = <div id="tips">Tab 切换</div>;
  $[1] = t1;
} else {
  t1 = $[1];
}
```

我们需要重新详细解读一下上面那段代码。这是整个编译原理的核心理论。对于每一段可缓存内容，这里以一个元素为例：

```jsx
<div id="tips">Tab 切换</div>
```

我们会先声明一个中间变量，用于接收元素对象。

```js
let t1
```

但是在接收之前，我们需要判断一下是否已经初始化过。如果没有初始化，那么则执行如下逻辑，创建该元素对象。创建完成之后，赋值给 t1，并缓存在 `$[1]` 中。

```js
if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
  t1 = <div id="tips">Tab 切换</div>;
  $[1] = t1;
}
```

如果已经初始化过，那么就直接读取之前缓存在 `$[1]` 中的值即可。

```js
...
} else {
  t1 = $[1];
}
```

这样，当函数组件多次执行时，该元素组件就永远只会创建一次，而不会多次创建。

> 这里需要注意的是，**判断成本非常低**，但是创建元素的成本会偏高，因此这种置换是非常划算的，我们后续会明确用数据告诉大家判断的成本。

对于一个函数组件中声明的函数而言，缓存的逻辑会根据情况不同有所变化。这里主要分为两种情况，一种情况是函数内部不依赖外部状态，例如：

```js
function __clickHanler(index) {
  tabRef.current[index].appeared = true
  setCurrent(index)
}
```

那么编译缓存逻辑与上面的元素是完全一致的，代码如下

```js
let t0;

if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
  t0 = function __clickHanler(index) {
    tabRef.current[index].appeared = true;
    setCurrent(index);
  };

  $[0] = t0;
} else {
  t0 = $[0];
}
```

另外一种情况是有依赖外部状态，例如

```
const [counter, setCounter] = useState(0)

// 此时依赖 counter，注意区分他们的细微差别
function __clickHanler() {
  console.log(counter)
  setCounter(counter + 1)
}
```

那么编译结果，则只需要把是否重新初始化的判断条件调整一下即可

```js
let t0;

if ($[0] !== counter) {
  t0 = function __clickHanler() {
    console.log(counter);
    setCounter(counter + 1);
  };

  $[0] = counter;
  $[1] = t0;
} else {
  t0 = $[1];
}
```

这样，当 counter 发生变化，t0 就会重新赋值，而不会采用缓存值，从而完美的绕开了闭包问题。

除此之外，无论是函数、还是组件元素的缓存判断条件，都会优先考虑外部条件，使用 `Symbol.for` 来判断时，则表示没有其他任何值的变化会影响到该缓存结果。

例如，一个组件元素如下所示

```
<button onClick={__clickHanler}>counter++</button>
```

此时它的渲染结果受到 `__clickHanler` 的影响，因此，判断条件则不会使用 `Symbol.for`，编译结果如下

```js
let t2;

if ($[3] !== __clickHanler) {
  t2 = <button onClick={__clickHanler}>counter++</button>;
  $[3] = __clickHanler;
  $[4] = t2;
} else {
  t2 = $[4];
}
```

又例如下面这个元素组件，他的渲染结果受到 `counter` 的影响。

```jsx
<div className="counter">
  counter: {counter}
</div>
```

因此，它的编译结果为：

```js
let t3;

if ($[5] !== counter) {
  t3 = <div className="counter">counter: {counter}</div>;
  $[5] = counter;
  $[6] = t3;
} else {
  t3 = $[6];
}
```

对于这样的编译细节的理解至关重要。在以后的开发中，我们就可以完全不用担心闭包问题而导致程序出现你意想不到的结果了。

所有的可缓存对象，全部都是这个类似的逻辑。他的粒度细到每一个函数，每一个元素。这一点意义非凡，它具体代表着什么，我们在后续聊性能优化的时候再来明确。

不过需要注意的是，对于 map 的循环语法，在编译结果中，缓存的是整个结果，而不是渲染出来的每一个元素。

```jsx
{tabs.map((item, index) => {
  return (
    <item.component
      appearder={item.appeared}
      key={item.title}
      selected={current === index}
    />
  )
})}
```

编译结果表现如下：

```js
let t4;

if ($[7] !== current) {
  t4 = tabs.map((item_0, index_1) => (
    <item_0.component
      appearder={item_0.appeared}
      key={item_0.title}
      selected={current === index_1}
    />
  ));
  $[7] = current;
  $[8] = t4;
} else {
  t4 = $[8];
}
```

> 对这种情况的了解非常重要，因为有的时候我们需要做更极限的性能优化时，map 循环可能无法满足我们的需求。因为此时循环依然在执行，后面的案例中我们会更具体的分析 Map 的表现。

目前这个阶段，我们最主要的是关心程序执行逻辑与预想的要保持一致，因此接下来，我们利用三个案例，来分析编译之后的执行过程。



## 实践案例一：counter 递增

通过上面对 Compiler 渲染结果的理解，我们应该已经大概知道下面这段代码最终会渲染成什么样。我们目前要思考的问题就是，这个例子，编译之后，**收益表现在哪里？**

```jsx
function Index() {
  const [counter, setCounter] = useState(0)

  function __clickHanler() {
    console.log(counter)
    setCounter(counter + 1)
  }

  return (
    <div>
      <div id='tips'>基础案例，state 递增</div>
      <button onClick={__clickHanler}>counter++</button>
      <div className="counter">counter: {counter}</div>
    </div>
  )
}
```

一起来分析一下，当我们点击按钮时，此时 `counter` 增加，因此 `__clickHanler` 无法缓存，需要重新创建，那么 button 按钮和 counter 标签都无法缓存。

此时，只有 `tips` 元素可以被缓存。但是 `tips` 元素本身是一个基础元素，在原本的逻辑中，经历一个简单的判断就能知道不需要重新创建节点，因此本案例的编译之后收益非常有限。

编译代码结果如下

```js
function Index() {
  const $ = _c(10);

  const [counter, setCounter] = useState(0);
  let t0;

  if ($[0] !== counter) {
    t0 = function __clickHanler() {
      console.log(counter);
      setCounter(counter + 1);
    };

    $[0] = counter;
    $[1] = t0;
  } else {
    t0 = $[1];
  }

  const __clickHanler = t0;
  let t1;

  if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = <div id="tips">基础案例，state 递增</div>;
    $[2] = t1;
  } else {
    t1 = $[2];
  }

  let t2;

  if ($[3] !== __clickHanler) {
    t2 = <button onClick={__clickHanler}>counter++</button>;
    $[3] = __clickHanler;
    $[4] = t2;
  } else {
    t2 = $[4];
  }

  let t3;

  if ($[5] !== counter) {
    t3 = <div className="counter">counter: {counter}</div>;
    $[5] = counter;
    $[6] = t3;
  } else {
    t3 = $[6];
  }

  let t4;

  if ($[7] !== t2 || $[8] !== t3) {
    t4 = (
      <div>
        {t1}
        {t2}
        {t3}
      </div>
    );
    $[7] = t2;
    $[8] = t3;
    $[9] = t4;
  } else {
    t4 = $[9];
  }

  return t4;
}
```



## 实践案例二：渲染成本昂贵的子组件

在上面一个例子的基础之上，我们新增一个子组件。该子组件的渲染非常耗时。

```jsx
function Expensive() {
  var cur = performance.now()
  while (performance.now() - cur < 1000) {
    // block 1000ms
  }
  console.log('hellow')
  return (
    <div>我是一个耗时组件</div>
  )
}
```

父组件中引入该子组件，其他逻辑完全一致。

```diff
function Index() {
  const [counter, setCounter] = useState(0)

  function __clickHanler() {
    setCounter(counter + 1)
  }

  return (
    <div>
      <div id='tips'>基础案例，state 递增</div>
      <button onClick={__clickHanler}>counter++</button>
      <div className="counter">counter: {counter}</div>
+      <Expensive />
    </div>
  )
}
```

在这种情况之下，由于父组件的状态发生了变化，导致子组件 `Expensive` 会在 counter 递增时重复执行。从而导致页面渲染时非常卡顿。

编译之后，针对这一段逻辑的优化代码如下

```js
let t4;

if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
  t4 = <Expensive />;
  $[7] = t4;
} else {
  t4 = $[7];
}
```

正如代码所表达的一样，由于这一个组件，并没有依赖任何外部状态，因此只需要在初始化时赋值一次即可。后续直接使用缓存值。

因此，在这个案例中，Compiler 编译之后的**优化效果非常明显，收益巨大**。

## 实践案例三：Tab 切换

一个普通的 tab 切换。但是我希望能实现极限的性能优化：

+ 我希望首次渲染时，页面渲染更少的内容，因此此时，只能先渲染默认的 Panel。其他 Panel 需要在点击对应的按钮时，才渲染出来。
+ 在切换过程中，我希望能够缓存已经渲染好的 Panel，只需要在样式上做隐藏，而不需要在后续的交互中重复渲染内容；
+ 当四个页面都渲染出来之后，再做切换时，此时只会有两个页面会发生变化，上一个选中的页面与下一个选中的页面。另外的页面不参与交互，则不应该 re-render。

> 这个案例和要求不算特别难，但是对综合能力的要求还是蛮高的，大家有空可以自己尝试实现一下，看看能不能完全达到要求。

这里，我主要想跟大家分享的就是 map 方法的小细节。有如下代码

```jsx
{tabs.map((item, index) => {
  return (
    <item.component
      appearder={item.appeared}
      key={item.title}
      selected={current === index}
    />
  )
})}
```

它的编译结果表现如下：

```jsx
let t4;

if ($[7] !== current) {
  t4 = tabs.map((item_0, index_1) => (
    <item_0.component
      appearder={item_0.appeared}
      key={item_0.title}
      selected={current === index_1}
    />
  ));
  $[7] = current;
  $[8] = t4;
} else {
  t4 = $[8];
}
```

但是实际上，我们可以观察到，我们有 4 个 Panel，点击切换的交互发生时，实际上只有两个 Pannel 发生了变化。因此，最极限的优化是，只有这两个组件对应的函数需要重新 `re-render`，那么我们的代码应该怎么写呢？

其实非常简单，那就是不用 map，将数组拆开直接手写，代码如下

```jsx
let c1 = tabRef.current[0]
let c2 = tabRef.current[1]
let c3 = tabRef.current[2]
let c4 = tabRef.current[3];
<c1.component appearder={c1.appeared} selected={current === 0}/>
<c2.component appearder={c2.appeared} selected={current === 1}/>
<c3.component appearder={c3.appeared} selected={current === 2}/>
<c4.component appearder={c4.appeared} selected={current === 3}/>
```

然后，我们就会发现，在编译结果中，不再缓存 map 表达式的结果，而是缓存每一个组件

```jsx
let t5;

if ($[7] !== c1.component || $[8] !== c1.appeared || $[9] !== t4) {
  t5 = <c1.component appearder={c1.appeared} selected={t4} />;
  $[7] = c1.component;
  $[8] = c1.appeared;
  $[9] = t4;
  $[10] = t5;
} else {
  t5 = $[10];
}
```

> 这样做的收益在特定场景下的收益将会非常高。



## 强悍的性能表现：超细粒度缓存式/记忆化更新

接下来，我们就需要分析一下，这样的记忆化更新机制，到底有多强。

首先明确一点，和 Vue 等其他框架的依赖收集不同，React Compiler 依然不做依赖收集。

React 依然通过从根节点自上而下的 diff 来找出需要更新的节点。在这个过程中，我们会通过大量的判断来决定使用缓存值。可以明确的是，Compiler 编译之后的代码，缓存命中的概率非常高，几乎所有应该缓存的元素和函数都会被缓存起来。

**因此，React Compiler 也能够在不做依赖收集的情况下，做到元素级别的超级细粒度更细。**但是，这样做的代价就是，React 需要经历大量的判断来决定是否需要使用缓存结果。

所以这个时候，我们就需要明确，我所谓的大量判断的时间成本，到底有多少？它会不会导致新的性能问题？

可以看到，Compiler 编译之后的代码中，几乎所有的比较都是使用了全等比较，因此，我们可以写一个例子来感知一下，超大量的全等比较到底需要花费多少时间。

测试代码如下：

```js
var cur = performance.now()

for(let i = 0; i < 1000000; i++) {
  'xxx' == 'xx'
}
var now = performance.now()
console.log(now - cur)
```

执行结果，比较 100 万次，只需要花费不到 **1.3 毫秒**。卧槽(¬д¬。)，这太强了啊。我们很难有项目能够达到 1000,000 次的比较级别，甚至许多达到 10000 都难。那也就意味着，这里大量的比较成本，落实到你的项目中，几乎可以忽略不计。

为了对比具体的效果，我们可以判断一下依赖收集的时间成本。

```js
for(let i = 0; i < 1000000; i++) {
  a.push('xxx')
}
```

首先是使用数组来收集依赖。依然是 100 万次收集，具体执行结果如下。耗时 8 毫秒。

```js
for(let i = 0; i < 1000000; i++) {
  a.set(i, 'xxx')
}
```

使用 Map 来收集依赖。100 万次依赖收集耗时 54 ms。若使用 WeakMap 来收集依赖，那就更慢了。100万次依赖收集耗时 200 毫秒。

数据展示给大家了，具体强不强，大家自行判断。

> 这里我要明确的是，这样的性能表现，在之前版本的项目中，合理运用 `useCallback/memo` 也能做到。只是由于对 React 底层默认命中规则不理解，导致大多数人不知道如何优化到这种程度。React Compiler 极大的简化了这个过程。



## 项目开发中，最佳实践应该怎么做

有许多骚操作，React Compiler 并不支持，例如下面这种写法。

```jsx
{[1, 2, 3, 4, 5].map((counter) => {
  const [number, setNumber] = useState(0)
  return (
    <div key={`hello${counter}`} onClick={() => setNumber(number + 1)}>
      number: {number}
    </div>
  )
})}
```

这个操作骚归骚，但是真的有大佬想要这样写。React 之前的版本依然不支持这种写法。不过好消息是，React 19 支持了...

但是 React Compiler 并不支持。对于这些不支持的语法，React Compiler 的做法就是直接跳过不编译，而直接沿用原组件写法。

因此，React Compiler 的最佳实践我总结了几条

- 不再使用 useCallback、useMemo、Memo 等缓存函数
- 丢掉闭包的心智负担，放心使用即可
- 引入严格模式
- 在你不熟悉的时候引入 eslint-plugin-react-compiler
- 当你熟练之后，弃用它，因为有的时候我们就是不想让它编译我们的组件
- 更多的使用 use 与 Action 来处理异步逻辑
- 尽可能少地使用 useEffect

这里，一个小小的彩蛋就是，当你不希望你的组件被 Compiler 编译时，你只需要使用 `var` 来声明状态即可。因为这不符合它的语法规范

```js
var [counter, setCounter] = useState(0)
```

而你改成 `const/let`，它就会又重新编译该组件。可控性与自由度非常高。