## React  API
```js
const React = {
  Children: {
    map,
    forEach,
    count,
    toArray,
    only,
  },

  createRef,
  Component,
  PureComponent,

  createContext,
  forwardRef,

  Fragment: REACT_FRAGMENT_TYPE,
  StrictMode: REACT_STRICT_MODE_TYPE,
  unstable_AsyncMode: REACT_ASYNC_MODE_TYPE,
  unstable_Profiler: REACT_PROFILER_TYPE,

  createElement: __DEV__ ? createElementWithValidation : createElement,
  cloneElement: __DEV__ ? cloneElementWithValidation : cloneElement,
  createFactory: __DEV__ ? createFactoryWithValidation : createFactory,
  isValidElement: isValidElement,

  version: ReactVersion,

  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: ReactSharedInternals,
};
```

## Children

该对象提供了一堆处理`props.children`的方法，因为`children`是一个**类似数组但是不是数组的数据结构**，如果要对其进行处理可以用`React.Children`外挂的方法；

## createRef

新的`ref`用法，React 已抛弃`<div ref="myDiv" />`这种`string ref`的用法，转而使用`createRef`，其返回一个对象；

## Component

类似的还有 **PureComponent**，唯一的区别是`PureComponent`的原型上多了一个标识：

```js
if (ctor.prototype && ctor.prototype.isPureReactComponent) {
  return (
    !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState)
  );
}
```

这是检查组件是否需要更新的一个判断，`ctor`是声明的继承自`Component / PureComponent`的组件类，会判断是否继承自`PureComponent`，如果是的话就使用`shallowEqual`比较`state`和`props`；

> **React中对比一个ClassComponent是否需要更新，只有两个地方：**
>
> + **一是看有没有`shouldComponentUpdate`方法**
> + **二就是此处的`PureComponent`判断**；

## createContext

新的 `context` API

## forwardRef

`forwardRef`是用来解决HOC(高阶组件)组件传递`ref`的问题

## 类型

即`Fragment`，`StrictMode`，`unstable_AsyncMode`等，其实都只是占位符，是一个`Symbol`；

在 React 实际检测到时会做一些特殊的处理，比如`StrictMode`和`AsyncMode`会让其子节点对应的 Fiber 的`mode`都变成和他们一样的`mode`；

## createElement ...

用来创建`ReactElement`，其余还有：

+ `cloneElement`，用来克隆一个`ReactElement`；
+ `createFactory`，用来创建专门用来创建某一类`ReactElement`的工厂函数；
+ `isValidElement`，用来验证是否是一个`ReactElement`；