## React 如何实现类似 Vue 的 KeepAlive ？

Vue 的 `<KeepAlive>` 是一种 **内置抽象组件**，可以缓存子组件的实例，切换时不卸载组件，而是停留在原状态。

React 并没有类似 Vue 内置的 `<KeepAlive>`，但你可以通过 **手动控制组件挂载与卸载、状态缓存、DOM 保留** 等方式来实现类似的行为。

###Vue 的 KeepAlive 是什么

Vue 的 `<KeepAlive>` 是一个抽象组件，用来缓存其子组件的 vnode 和状态。在组件被移除时不会被真正卸载，而是保留实例和 DOM 节点，下一次激活时直接复用。

它的核心行为：

- 缓存组件的状态（data、computed、watch 等）
- 缓存组件的 DOM，不重新 render
- 触发生命周期 `activated` / `deactivated`

### React 中没有 KeepAlive 的原因

React 是**函数式组件优先的架构**，生命周期被抽象为 hook，所以没有像 Vue 那样的「激活/失活」机制。React 更推荐：

- 组件状态提升（hoist state）
- 组件缓存逻辑由开发者控制（通常通过条件渲染、memoization、状态持久化实现）



### React 实现 KeepAlive 的几种思路

方法 1：**组件不卸载 +状态持久化**

```jsx
{tab === 'a' && <ComponentA />}
{tab === 'b' && <ComponentB />}
```

这个写法在切换 tab 时，会卸载不活跃组件。解决方法是：保留组件实例，不卸载。

可以通过数组缓存组件节点：

```jsx
const cache = {
  a: <ComponentA />,
  b: <ComponentB />
}

return (
  <div>
    {cache[tab]}
  </div>
)
```

这样 React 会复用相同的 vnode，并且不会销毁组件状态。

方法 2：**手动缓存组件实例（借助 `react-activation`）**

社区有一个成熟方案：[`react-activation`](https://github.com/CJY0208/react-activation)，它提供了一个 `<KeepAlive>` 组件，使用方式类似 Vue：

```jsx
// app.jsx
import { KeepAlive } from 'react-activation'

<KeepAlive>
  <MyPage />
</KeepAlive>

// my-page.jsx
import { useActivation } from 'react-activation'

function MyPage() {
  useActivation(() => {
    console.log('activated')
    return () => console.log('deactivated')
  })
  // ...
}
```
