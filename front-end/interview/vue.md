
# Vue 面试题

## Vue3.0 里为什么要用 Proxy API 替代 defineProperty API ？

### Object.defineProperty

在一个对象上通过属性描述对象，定义一个新属性，或者修改一个对象的现有属性，并返回此对象。

**如何实现响应式？**

通过`defineProperty` 两个属性`get` 及 `set`，一个示例：

```js
function update() {
  app.innerText = obj.foo;
}

function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    get() {
      console.log(`get ${key}:${val}`);
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        val = newVal;
        update();
      }
    },
  });
}
```

基于此原理，对一个对象进行删除与添加属性操作，是无法无法劫持到的。

此外，也不能劫持数组的数据读写，因为数组的数据读写是通过索引来进行的，而不是通过属性名。

还有一个问题则是，如果存在深层的嵌套对象关系，需要深层的进行监听，造成了性能的极大问题。

### proxy

Proxy 的监听是针对一个对象的，那么对这个对象的所有操作会进入监听操作，这就完全可以代理所有属性了。

```js
function reactive(obj) {
  if (typeof obj !== "object" && obj != null) {
    return obj;
  }
  // Proxy 相当于在对象外层加拦截
  const observed = new Proxy(obj, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      console.log(`获取${key}:${res}`);
      return res;
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);
      console.log(`设置${key}:${value}`);
      return res;
    },
    deleteProperty(target, key) {
      const res = Reflect.deleteProperty(target, key);
      console.log(`删除${key}:${res}`);
      return res;
    },
  });
  return observed;
}
```

`Proxy`可以直接监听数组的变化（`push`、`shift`、`splice`），且有多达 13 种拦截方法，不限于`apply`、`ownKeys`、`deleteProperty`、`has`等等，这是`Object.defineProperty`不具备的。

`Proxy` 不兼容 IE，也没有 `polyfill`, `defineProperty` 能支持到 IE9。

## Vue3.0 所采用的 Composition Api 与 Vue2.x 使用的 Options Api 有什么不同？

1. **组织代码的方式：**
   - Options API：Options API 是基于**选项的方式**来组织组件的代码。一个组件通常包含一个选项对象，其中包含了诸如 data、methods、computed、watch 等属性，这些属性用于定义组件的状态和行为。
   - Composition API：Composition API 是基于**函数的方式**来组织组件的代码。一个组件可以由多个功能相关的逻辑块（composition functions）组成，每个逻辑块都可以包含自己的状态、计算属性、方法等，并且可以根据需要进行复用。
2. **逻辑复用性：**
   - Options API：在 Options API 中，逻辑的复用通常依赖于 **mixins 和高阶组件**等方式，这可能会导致代码结构的不清晰和难以维护。
   - Composition API：Composition API 提供了更灵活和精确的逻辑复用方式。通过将功能相关的代码组织成独立的逻辑块，并在组件中根据需要组合使用这些逻辑块，可以实现更好的代码复用和组织。
3. **逻辑关联性：**
   - Options API：在 Options API 中，组件的状态和行为通常是**通过选项对象中的属性来关联的**，这可能导致相关**逻辑的分散和耦合度较高**。
   - Composition API：Composition API 允许将相关的状态和行为组织在一起，从而提高了代码的可读性和可维护性。通过将相关逻辑放置在同一个逻辑块中，可以更容易地理解和修改代码。
4. **TypeScript 支持：**
   - Options API：在 Vue 2.x 中，对于 TypeScript 的支持相对有限，需要使用额外的注解来声明组件的类型。
   - Composition API：Composition API 明确支持 TypeScript，并且提供了更好的类型推断和类型安全性。通过使用 TypeScript，可以更轻松地编写和维护类型安全的 Vue 组件。

总的来说，Composition API 提供了一种更灵活、更可复用、更易于维护的方式来组织和编写 Vue 组件的代码，尤其适用于大型项目或需要复杂逻辑的场景。与 Options API 相比，Composition API 在代码组织、逻辑复用、逻辑关联性和 TypeScript 支持等方面具有明显的优势。

## vue2 代码打包时为什么很难处理 Tree shaking ？

在大多数 Vue 项目中，通常会创建一个根 Vue 实例，并在整个应用中共享该实例。这意味着该根实例及其所依赖的组件和模块在整个项目中都会被引用和使用。Tree shaking 时即使某些组件或模块在项目中并未直接使用，但它们可能仍然会被 Vue 实例间接引用，因此无法被完全移除。

Vue 2 的代码在打包时难以进行 Tree shaking 的另一原因是因为 Vue 2 使用了对象字面量作为组件配置，而不是 ES6 的类。这导致了一些挑战，因为对象字面量在编译时不容易静态分析。这使得 Webpack 在进行 Tree shaking 时难以确定哪些代码是可以安全移除的。

> 对象字面量是在运行时动态创建的，因为它们的属性和方法可以在任何时候添加、修改或删除。
>
> 相比之下，ES6 的类在定义时就具有了明确定义的结构，并且不容易在运行时动态修改。类的结构在编译时就已经确定，因此静态分析工具可以更容易地识别和优化类的使用。

另一个问题是 Vue 2 中模板的编译方式。Vue 2 模板编译成了一个包含多个嵌套的函数调用的 render 函数，这些函数在编译时难以静态确定。这使得在打包时很难确定哪些代码可以安全地移除。

## Vue 中的 $nextTick 有什么作用？

### NextTick 是什么

官方对其的定义：

> 在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM

什么意思呢？

我们可以理解成，Vue 在更新 DOM 时是异步执行的。当数据发生变化，Vue 将开启一个异步更新队列，视图需要等队列中所有数据变化完成之后，再统一进行更新。

`Html`结构

```html
<div id="app">{{ message }}</div>
```

构建一个`vue`实例

```js
const vm = new Vue({
  el: "#app",
  data: {
    message: "原始值",
  },
});
```

修改`message`

```js
this.message = "修改后的值1";
this.message = "修改后的值2";
this.message = "修改后的值3";
```

这时候想获取页面最新的`DOM`节点，却发现获取到的是旧值

```js
console.log(vm.$el.textContent); // 原始值
```

这是因为`message`数据在发现变化的时候，`vue`并不会立刻去更新`Dom`，而是将修改数据的操作放在了一个异步操作队列中。如果我们一直修改相同数据，异步操作队列还会进行去重。

等待同一事件循环中的所有数据变化完成之后，会将队列中的事件拿来进行处理，进行`DOM`的更新。

### 使用场景

如果想要在修改数据后立刻得到更新后的`DOM`结构，可以使用`Vue.nextTick()`

- 第一个参数为：回调函数（可以获取最近的`DOM`结构）

- 第二个参数为：执行函数上下文

```js
// 修改数据
vm.message = "修改后的值";
// DOM 还没有更新
console.log(vm.$el.textContent); // 原始的值
Vue.nextTick(function () {
  // DOM 更新了
  console.log(vm.$el.textContent); // 修改后的值
});
```

组件内使用 `vm.$nextTick()` 实例方法只需要通过`this.$nextTick()`，并且回调函数中的 `this` 将自动绑定到当前的 `Vue` 实例上。

`$nextTick()` 会返回一个 `Promise` 对象，可以是用`async/await`完成相同作用的事情

```js
this.message = "修改后的值";
console.log(this.$el.textContent); // => '原始的值'
await this.$nextTick();
console.log(this.$el.textContent); // => '修改后的值'
```

### 实现原理

`allbacks`也就是异步操作队列

`callbacks`新增回调函数后又执行了`timerFunc`函数，`pending`是用来标识同一个时间只能执行一次

```js
export function nextTick(cb?: Function, ctx?: Object) {
  let _resolve;

  // cb 回调函数会经统一处理压入 callbacks 数组
  callbacks.push(() => {
    if (cb) {
      // 给 cb 回调函数执行加上了 try-catch 错误处理
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, "nextTick");
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });

  // 执行异步延迟函数 timerFunc
  if (!pending) {
    pending = true;
    timerFunc();
  }

  // 当 nextTick 没有传入函数参数的时候，返回一个 Promise 化的调用
  if (!cb && typeof Promise !== "undefined") {
    return new Promise((resolve) => {
      _resolve = resolve;
    });
  }
}
```

`timerFunc`函数定义，这里是根据当前环境支持什么方法则确定调用哪个，分别有：`Promise.then`、`MutationObserver`、`setImmediate`、`setTimeout`

通过上面任意一种方法，进行降级操作

```js
export let isUsingMicroTask = false;
if (typeof Promise !== "undefined" && isNative(Promise)) {
  //判断1：是否原生支持Promise
  const p = Promise.resolve();
  timerFunc = () => {
    p.then(flushCallbacks);
    if (isIOS) setTimeout(noop);
  };
  isUsingMicroTask = true;
} else if (
  !isIE &&
  typeof MutationObserver !== "undefined" &&
  (isNative(MutationObserver) ||
    MutationObserver.toString() === "[object MutationObserverConstructor]")
) {
  //判断2：是否原生支持 MutationObserver
  let counter = 1;
  const observer = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
  isUsingMicroTask = true;
} else if (typeof setImmediate !== "undefined" && isNative(setImmediate)) {
  //判断3：是否原生支持setImmediate
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else {
  //判断4：上面都不行，直接用setTimeout
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}
```

无论是微任务还是宏任务，都会放到`flushCallbacks`使用

这里将`callbacks`里面的函数复制一份，同时`callbacks`置空

依次执行`callbacks`里面的函数

```js
function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}
```

**小结：**

1. 把回调函数放入 callbacks 等待执行
2. 将执行函数放到微任务或者宏任务中
3. 事件循环到了微任务或者宏任务，执行函数依次执行 callbacks 中的回调

## Vue的 data 为什么必须是函数？

组件是用来复用的，且 Vue 组件和Vue实例之间是通过原型链来继承的。如果data是一个对象，那么在组件复用时，多个组件将共享一个data对象，这样一个组件的状态改变会影响到其他组件。

这显然不是我们想要的结果，因为通常情况下，每个组件实例都应该维护自己的独立状态。将data选项定义为函数，因为函数每次调用返回的都是一个全新的对象，从而避免状态影响。

此外，这种设计还有助于节省内存。在一些框架中，比如Angular 2或者在某些情况下的React，每个组件实例都是一个独立的对象，这意味着每个组件需要初始化它所需的一切。而Vue通过让`data`属性为一个函数，避免了这个问题，因为方法、计算属性定义和生命周期钩子只会被创建和存储一次，然后在每个组件实例中运行。

## computed 和 watch 使用场景有什么不同，实现原理呢？

**computed**：

1. computed是值，依赖于其它的状态。比如购物车的总价格，可以根据其它几个价格算得。
2. computed有缓存特性，只要依赖的状态没有改变，computed的值就会被缓存起来。当依赖发生变化时，才会重新计算。

**watch**：

1. watch用于监听状态的变化，比方说监听路由，一旦监听的状态发生变化，就执行某个函数。
2. watch有两个参数也是面试常考点，
   - immediate：当我们希望在组件初始化时执行一次watch函数，就可以开启immediate选项
   - deep：深度监听，开启此选项当监听的对象的某个属性值发生变化，也会触发watch监听函数

**实现原理**：

1. computed和watch都是基于Vue响应式原理，首先通过initWatcher和initComputed来解析watch和computed选项，然后遍历，给每个watch和computed添加Watcher对象。
2. 不同的是给computed添加的Watcher对象是lazy Watcher，默认不执行，取值的时候才执行。
3. computed的缓存特性是通过Watcher对象的dirty属性来实现的。

## 谈一谈对MVVM的理解？Vue实现双向数据绑定原理是什么？

MVVM（Model-View-ViewModel）是一种软件架构模式，它将应用程序分为三个主要部分：模型（Model）、视图（View）和视图模型（ViewModel）。MVVM 主要用于构建交互式的用户界面，并且在前端开发中得到广泛应用。

- **模型（Model）：** 模型代表应用程序的数据和业务逻辑。它负责管理数据的获取、存储和操作，与服务器进行通信，并处理应用程序的业务逻辑。
- **视图（View）：** 视图是用户界面的可视部分，负责将数据呈现给用户，并接收用户的输入。视图通常是通过 HTML、CSS 和 JavaScript 来构建的。
- **视图模型（ViewModel）：** 视图模型是视图的抽象表示，它负责将模型的数据转换为视图可以使用的格式，并处理视图的用户交互。视图模型通过双向数据绑定将视图和模型连接起来，使得视图的状态可以自动更新，从而实现了视图和模型之间的解耦。

Vue是双向绑定的，数据更改时，视图自动更改。在表单应用中，当用户输入引起页面变更的时候，v-model的数据也会自动发生更新。在 Vue 中，双向绑定的实现分为两层：数据 -> 视图、视图 -> 数据：

- 从数据到视图的绑定，就是Vue实现响应式那一套，利用数据劫持和观察者模式对数据进行监听，当数据变更时，通知视图更新。
- 从视图到数据的绑定实现原理比较简单，是通过监听输入框地input事件，将输入框的值赋给绑定的数据对象属性。

双向数据绑定是通过以下几个步骤实现的：

1. **数据劫持（Data Observation）：** Vue 会对 data 对象进行递归遍历，将每个属性转换为 getter/setter，并且在适当的时候触发更新。
2. **模板编译（Template Compilation）：** Vue 将模板解析为抽象语法树（AST），然后将 AST 转换为渲染函数。在编译过程中，遇到绑定的数据，会生成对应的 watcher 对象。
3. **Watcher 机制（Watcher）：** 每个组件实例都会创建一个 watcher 实例对象，它会在组件渲染过程中建立依赖关系，并在数据变化时触发更新。
4. **响应式更新（Reactivity）：** 当数据发生变化时，会触发相应属性的 setter，setter 会通知所有依赖该属性的 watcher 对象进行更新，从而更新视图。

## 什么是虚拟DOM，有什么作用？有了解过diff算法吗？

所谓虚拟DOM，简单点说就是个JS对象，它是比DOM更轻量级的对UI的描述。在Vue中，就是由VNode节点构成的树形对象。

**虚拟DOM的作用**：

1. 跨平台：因为是纯JS对象，所以可以在任意能运行JS的地方运行，比如SSR和混合开发。
2. 相对还不错的渲染性能：虚拟DOM可以将DOM操作转换为JS对象操作，通过对比新旧虚拟DOM树的差异（也就是diff算法），只更新发生变化的部分，从而减少不必要的DOM操作，提高渲染性能。但是这种性能提升只是相对的，因为Svelte已经证明了不用虚拟Dom性能也可以很好。

**Vue diff算法相关知识点**：

1. 基于 Snabbdom：Vue的diff算法是基于三方库Snabbdom的diff算法基础上优化得来的。
2. 采用双端比较：Vue的diff算法采用了双端比较的方式，即同时对新旧两个vnode进行比较。这种方式可以最大限度地复用已有的DOM元素，减少不必要的DOM操作，从而提高更新性能。
3. 使用 key 进行原地复用：当 diff 算法比较两个vnode时，会先按照 key 值进行比较，如果 key 值相同，则认为这两个vnode是同一个节点，可以进行复用。否则，Vue会将旧节点从DOM中删除，重新创建新节点并插入到DOM中。
4. 静态节点优化：Vue的diff算法对静态节点进行了优化，即对不需要更新的节点进行缓存，减少不必要的比较和更新操作。
5. 当比较两个节点时，会首先比较它们的节点类型，如果不同，则直接替换。如果类型相同，则会继续比较节点的key、数据和子节点等属性，找出它们之间的差异，从而更新DOM。

## Vue模板编译原理了解吗？

**模板编译流程**：

模板编译的目标是要把 template 模板转换成渲染函数，主要分成3个步骤，parse -> optimize -> generate ：

1. parse(解析模板)：首先会用正则等方式将模板解析为 AST（抽象语法树），这个过程包括词法分析和语法分析两个过程。在这个过程中，模板会被分解成一些列的节点，包括普通元素节点、文本节点、注释节点等，同时也会解析出这些节点的标签名、属性、指令等信息。
2. optimize(静态分析)：静态分析是指分析模板中的所有节点，找出其中的静态节点和静态属性，并将其标记出来。所谓**静态节点是指节点的内容不会发生变化的节点**，例如纯文本节点、含有静态属性的节点等，而静态属性则是指节点上的属性值不会改变的属性，例如 class 和 style 属性。标记静态节点和静态属性可以帮助 Vue 在后续的更新中跳过这些节点的比对和更新过程，从而提高应用的性能。
3. generate(代码生成)：将 AST 转换为可执行的渲染函数。

## 什么是自定义指令，怎么实现？

Vue自定义指令可以用来复用代码，封装常用的DOM操作或行为。常见的自定义指令有监听滚动事件、图片懒加载、设置 loading、权限管理等。

自定义指令可以全局注册或局部注册，注册后可以在模板中使用 v-前缀调用，如 v-mydirective。

自定义指令的实现需要定义一个对象，其中包含指令名称、生命周期钩子函数和更新函数等属性，具体如下：

- bind钩子函数：指令第一次绑定到元素时触发，可以用于初始化一些数据或添加事件监听器等操作。
- inserted钩子函数：指令所在元素插入到父节点后触发，常用于添加一些 UI 元素或获取焦点等操作。
- update钩子函数：指令所在元素更新时触发，可以获取新旧值并进行比较后更新UI。
- componentUpdated钩子函数：指令所在元素及其子节点全部更新后触发，常用于需要操作DOM的指令，如监听滚动事件。
- unbind钩子函数：指令与元素解绑时触发，可以清除绑定的事件监听器等操作。

举个例子：

```js
Vue.directive('focus', {
  inserted: function (el) {
    el.focus()
  }
})
```

该指令实现元素自动获取焦点功能，在模板中使用该指令：

```vue
<input v-focus>
```
