 ## 代码分割

一个项目使用打包工具进行打包，随着工程量增加和业务大量引入第三方包，打包后的文件会逐渐增大，页面首次打开时，会加载大量代码包，而有些内容可能是用户并不关心的，会造成页面加载较缓；

代码分割能够“懒加载”用户所需要的内容，引入代码分割的最佳方式是通过动态 `import()` 语法；

如在 Webpack 中，解析到该语法时，会自动进行代码分割；

在 React 16.6.0 中，也有新的特性是解决这个问题的；

## Suspense

Suspense 使得组件可以“等待”某些操作结束后，再进行渲染；目前，Suspense 仅支持的使用场景是配合 React.lazy() 实现组件懒加载；

`React.Suspense` 可以指定加载指示器（loading indicator），以防其组件树中的某些子组件尚未具备渲染条件。

## React.lazy()

在以往，我们通常使用第三方库 [jamiebuilds/react-loadable](https://github.com/jamiebuilds/react-loadable) 进行组件懒加载：

```jsx
import Loadable from 'react-loadable';

const LoadableBar = Loadable({
  loader: () => import('./components/Bar'),
  loading() {
    return <div>Loading...</div>
  }
});

class MyComponent extends React.Component {
  render() {
    return <LoadableBar/>;
  }
}
```

`React.lazy()` 允许你定义一个动态加载的组件。这有助于缩减 bundle 的体积，并延迟加载在初次渲染时未用到的组件；

依据 Suspense 和 React.lazy() 能像渲染常规组件一样处理动态引入组件：

```jsx
import React, { Suspense } from 'react';

const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <OtherComponent />
      </Suspense>
    </div>
  );
}
```

## 源码解析

Suspense 组件依旧是 一个 Symbol ，而 Lazy 函数则是返回了一个对象：

```js
export function lazy<T, R>(ctor: () => Thenable<T, R>): LazyComponent<T> {
  return {
    $$typeof: REACT_LAZY_TYPE,
    _ctor: ctor,
    // React uses these fields to store the result.
    _status: -1,
    _result: null,
  };
}
```



