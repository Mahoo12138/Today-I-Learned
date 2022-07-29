## Hooks 简介

Hook 发布于 React v16.8.0，主要准对 React 开发中以下几个痛点：

+ 在组件之间复用状态逻辑很难；
+ 复杂组件变得难以理解；
+ 难以理解的 class 内部；

### 工作原理

对于`useState Hook`，简单使用如下：

```js
function App() {
  const [num, updateNum] = useState(0);

  return <p onClick={() => updateNum(num => num + 1)}>{num}</p>;
}
```

## 源码解析

```js
export function useState<S>(initialState: (() => S) | S) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}

function resolveDispatcher() {
  const dispatcher = ReactCurrentOwner.currentDispatcher;
  invariant(
    dispatcher !== null,
    'Hooks can only be called inside the body of a function component.',
  );
  return dispatcher;
}

const ReactCurrentOwner = {
  current: (null: null | Fiber),
  currentDispatcher: (null: null | Dispatcher),
};
```
