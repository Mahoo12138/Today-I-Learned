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

**1. 受控组件**：(类似于Vue的双向绑定)

+ React默认不是双向绑定的，也就是说当我们在输入框输入的时候，输入框绑定的值并不会自动变化。

+ 通过给input绑定onChange事件，让React实现类似于Vue的双向绑定，这就叫受控组件。

**2. 非受控组件**

+ 非受控组件是让用户手动操作Dom来控制表单值。
+ 非受控组件的好处是更自由，可以更方便地自行选择三方库来处理表单 。





## JSX和模板引擎有什么区别？

1. JSX：更加灵活，既可以写标签，也可以使用原生 js 语法和表达式，在做复杂渲染时更得心应手。
2. 模板引擎：更简单易上手，开发效率高，结合指令的可读性也比较好。
3. JSX 太灵活就导致没法给编译器提供太多的优化线索，不好做静态优化，模板引擎可以在编译时做静态标记，性能更好。
4. JSX只是个编译工具，Vue经过一定的配置也可以使用。