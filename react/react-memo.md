## memo

`React.memo`和`PureComponent`作用类似，可以用作性能优化，`React.memo` 是高阶组件，函数组件和类组件都可以使用， 区别于`PureComponent`， `React.memo`只能针对 `props` 的情况确定是否渲染，而`PureComponent`是针对`props`和`state`。

`React.memo` 接受两个参数，第一个参数原始组件本身，第二个参数，是一个函数，可以根据一次更新中`props`是否相同决定原始组件是否重新渲染。返回一个布尔值，`true` 表示组件无须重新渲染，`false`则需要重新渲染，这个和类组件中的`shouldComponentUpdate()`正好相反 。

`React.memo`参数的函数在一定程度上，可以等价于组件外部使用`shouldComponentUpdate` ，用于拦截新老`props`，确定组件是否更新；

### 源码解析

```javascript
export default function memo<Props>(
  type： React$ElementType,
  compare?： (oldProps： Props, newProps： Props) => boolean,
) {
  return {
    $$typeof： REACT_MEMO_TYPE,
    type,
    compare： compare === undefined ? null ： compare,
  };
}
```

## Fragment

`react`不允许一个组件返回多个节点元素，通常解决这个情况，很简单，只需要在外层套一个容器元素；

但是不期望增加额外的`dom`节点，所以`react`提供`Fragment`碎片概念，能够让一个组件返回多个元素；

和`Fragment`区别是，`Fragment`可以支持`key`属性。`<></>`不支持`key`属性；

>通过`map`遍历后的元素，`react`底层会处理，默认在外部嵌套一个`<Fragment>`；
>
>```jsx
>{
>   [1,2,3].map(item=><span key={item.id} >{ item.name }</span>)
>}
>```

###  源码解析

```javascript
export const REACT_FRAGMENT_TYPE = hasSymbol
  ? Symbol.for('react.fragment')
  ： 0xeacb;
```

## Profiler

`Profiler`这个`api`一般用于开发阶段，性能检测，检测一次`react`组件渲染用时，性能开销。

`Profiler` 需要两个参数：

第一个参数：是 `id`，用于表识唯一性的`Profiler`。

第二个参数：`onRender`回调函数，接受渲染参数，当被分析的渲染树中的组件提交更新时，就会调用它，。

filer 的 onRender 回调接收描述渲染内容和所花费时间的参数：

+ `id`： 生提交的 Profiler 树的 id。如果有多个 profiler，它能用来分辨树的哪一部分发生了“提交”。
+ `phase`： "mount" (首次挂载) 或 "update" (重新渲染)，判断是组件树的第一次装载引起的重渲染，还是由 props、state 或是 hooks 改变引起的重渲染。
+ `actualDuration`： 次更新在渲染Profiler 和它的子代上花费的时间。
+ `baseDuration`： 在Profiler 树中最近一次每一个组件render 的持续时间。这个值估计了最差的渲染时间。
+ `startTime`： 本次更新中 React 开始渲染的时间戳。
+ `commitTime`：  本次更新中 React commit 阶段结束的时间戳。在一次 commit 中这个值在所有的 profiler 之间是共享的，可以将它们按需分组。
+ `interactions`： 当更新被制定时，“interactions” 的集合会被追踪。

```jsx
const index = () => {
  const callback = (...arg) => console.log(arg)

  return  <Fragment>
      <Profiler id="root" onRender={ callback }  >
          <ComplexComponent/>
      </Profiler> 
    </Fragment>
}
```

> 尽管 Profiler 是一个轻量级组件，我们依然应该在需要时才去使用它。对一个应用来说，每添加一些都会给 CPU 和内存带来一些负担。

可以在控制台查看到打印输出的信息，还可以打开 React DevTools ，转到 Profiler 选项卡并可视化组件渲染时间；

### 源码解析

```javascript
export const REACT_PROFILER_TYPE = hasSymbol
  ? Symbol.for('react.profiler')
  : 0xead2;
```

## StrictMode

`StrictMode`见名知意，严格模式，用于检测`react`项目中的潜在的问题。

与 `Fragment` 一样， `StrictMode` 不会渲染任何可见的 `UI` 。它为其后代元素触发额外的检查和警告。

> 严格模式检查仅在开发模式下运行；它们不会影响生产构建。

`StrictMode`目前有助于：

- 识别不安全的生命周期；
- 关于使用过时字符串 `ref API` 的警告；
- 关于使用废弃的 `findDOMNode` 方法的警告；
- 检测意外的副作用；
- 检测过时的 `context API`；

### 源码解析

```javascript
export const REACT_STRICT_MODE_TYPE = hasSymbol
  ? Symbol.for('react.strict_mode')
  : 0xeacc;
```

