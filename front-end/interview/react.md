## setState 是同步还是异步？

**v18之前**

1. React是希望setState表现为异步的，因为批量更新可以优化性能。因此在React能够管控到的地方，比如生命周期钩子和合成事件回调函数内，表现为异步。

2. 在定时器和原生事件里，因为React管控不到，所以表现为同步。

3. 在某些情况下，我们需要立即获取更新后的状态，这时可以使用第二个可选参数callback，在状态更新后立即执行回调函数来获取更新后的状态。例如：

   ```js
   this.setState({ counter: this.state.counter + 1 }, () => {
     console.log(this.state.counter); // 输出更新后的值
   });
   ```

**v18之后**

1. React18之后，默认所有的操作都放到批处理中，因此setState不管在那儿调用都是异步的了。
2. 如果希望同步更新，可以使用 flushSync 这个API。

## React组件通信方式有哪些？

1. Props: 父组件可以通过 props 将数据传递给子组件。子组件可以通过 this.props 访问这些数据。
2. Callback: 父组件可以通过回调函数将函数传递给子组件。子组件可以在适当的时候调用这些回调函数，以便与父组件通信。
3. Context: 上下文是一种在组件树中共享数据的方法。通过 context，可以在组件树中传递数据，而不需要在每个级别显式地将 props 传递给所有组件。
4. Redux: 复杂应用全局状态管理可以使用Redux、Mobx等状态管理库，项目里一般使用React Redux或者RTK工具包。
5. Pub/Sub: 发布/订阅模式是一种通过事件来进行任意组件间通信的方法，和Vue里的事件总线原理一样。
6. Hooks里也可以通过useReducer和useContext来实现全局组件通信。

## useMemo 和 useCallback 有什么作用？

1. useMemo 类似于 Vue 的计算属性

   ```js
   import React, { useMemo } from 'react';
   
   function ExpensiveComponent({ data }) {
     const expensiveResult = useMemo(() => {
       // 计算昂贵的结果
       return data.filter(item => item > 10);
     }, [data]);
   
     return <div>{expensiveResult}</div>;
   }
   ```

2. useCallback：大多数人认为 useCallback 的作用是缓存函数的生成，但在实际应用中这种优化是微不足道的，useCallback 真正的作用是**在函数需要作为prop传递给子组件时，使用 useCallback 包裹可以避免子组件无谓的更新**。

## 什么是受控组件和非受控组件？

受控组件和非受控组件是针对表单的。

**1. 受控组件**：(类似于 Vue 的双向绑定)

+ React 默认不是双向绑定的，也就是说当我们在输入框输入的时候，输入框绑定的值并不会自动变化。

+ 通过给 input 绑定 onChange 事件，让 React 实现类似于 Vue 的双向绑定，这就叫受控组件。

**2. 非受控组件**

+ 非受控组件是让用户手动操作 Dom 来控制表单值。
+ 非受控组件的好处是更自由，可以更方便地自行选择三方库来处理表单 。

## JSX 和模板引擎有什么区别？

1. JSX：更加灵活，既可以写标签，也可以使用原生 js 语法和表达式，在做复杂渲染时更得心应手。
2. 模板引擎：更简单易上手，开发效率高，结合指令的可读性也比较好。
3. JSX 太灵活就导致没法给编译器提供太多的优化线索，不好做静态优化，模板引擎可以在编译时做静态标记，性能更好。
4. JSX只是个编译工具，Vue经过一定的配置也可以使用。


## render 函数中return如果没有使用 () 会有什么问题？

在使用 JSX 语法书写 react 代码时，为了便于阅读，我们会将 JSX 拆分为多行，babel 会将 JSX 语法编译成 js，同时会在每行自动添加**分号**`;`，如果`return`后换行了，那么就会变成 `return;` 

这就是常说的[自动插入分号](https://stackoverflow.com/questions/2846283/what-are-the-rules-for-javascripts-automatic-semicolon-insertion-asi)（automatic semicolon insertion (ASI)）陷阱。

> Automatic Semicolon Insertion (ASI) 是 JavaScript 中的一个特性，它会在某些情况下自动在代码中插入分号。

```js
function getValue() {
  return
  {
    status: true
  };
}

// ASI 后的结果：
function getValue() {
  return; // 函数会在这里返回 undefined
  {
    status: true
  };
}

// 正确写法：
function getValue() {
  return {
    status: true
  };
}
```

## React 开发时，什么时候使用状态管理器？

+ **离散的组件关系**：存在需要在多个不相关的组件之间共享状态

+ **复杂的状态逻辑**：状态提升不能够满足开发需求，状态树并不总是以一种线性的，单向的方式流动时；

## componentWillUpdate 可以直接修改 state 的值吗？

不建议在 `componentWillUpdate` 中直接修改 state 的值。

`componentWillUpdate` 是 React 组件在更新发生前被调用的生命周期方法。它接收 `nextProps` 和 `nextState` 作为参数。你可以在这个方法中执行一些准备更新的操作，例如读取 DOM 元素的状态或执行动画。

可以，直接修改 `this.state`，但是只是在 `componentWillUpdate` 的执行体以及后续的生命周期中有效。