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
