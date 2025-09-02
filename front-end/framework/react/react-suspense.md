# React Suspense 的基本使用

> 译者：@飘飘
> 作者：@Kent C. Dodds
> 原文：https://www.epicreact.dev/how-react-suspense-works-under-the-hood-throwing-promises-and-declarative-async-ui-plbrh

## 引言：React 中的异步 UI 挑战

在 React 中获取数据本身不难 —— 难的是在等待数据时如何处理用户体验。加载动画、加载状态和错误信息常常让组件变得杂乱无章，也让代码难以维护。如果 React 能像处理其他内容那样，以声明式的方式来处理异步 UI，那该多好！

而这正是 React Suspense 的目的。本文将带你深入了解它的工作原理、为什么它如此巧妙，以及你如何利用它简化异步 UI 的开发。

## 什么是 React Suspense？

React Suspense 是一种机制，让你可以用声明式的方式为依赖异步数据的组件指定加载和错误状态。
你无需手动追踪加载和错误状态，只需用 `<Suspense>` 包裹你的组件树，其余的交给 React 来处理。

最神奇的地方来了：Suspense 是通过 “捕获被抛出的 Promise” 来实现的 😱。

当某个组件需要的数据还没准备好时，它会 “抛出” 一个 Promise。React 会捕获这个 Promise，暂停渲染，并展示你在 `<Suspense>` 中提供的备用 UI。等到 Promise 解决后，React 会重新尝试渲染。

这之所以可行，是因为在 JavaScript 中，你可以通过抛出异常来同步中断函数执行。React 正是利用这一点来 “暂停” 渲染，直到数据准备好为止。

## use Hook 与 Suspense 的配合使用

React 19 及以上版本中引入的 `use` hook 是这个模式的关键。你不再需要 `await`，而是直接把一个 Promise 传给 `use`。如果数据已经准备好，它就返回结果；如果还没准备好，它就抛出 Promise：

```js
function PhoneDetails() {
     const details = use(phoneDetailsPromise)
     // 此时 details 已经准备好了！
 }
```

那 `phoneDetailsPromise` 是从哪来的呢？你应该在渲染函数之外触发这个数据请求，避免每次渲染都重新发起请求。比如：

```js
 // 这段代码可以放在事件处理函数里，
 // 只要不是放在客户端组件的渲染体里就行（服务端组件不能用 `use`，可以直接用 `fetch`）
 const phoneDetailsPromise = fetch('/api/phone-details').then((res) =>
     res.json(),
 )
```

如果 Promise 还没解决，`use` 会抛出它，触发 Suspense 的备用 UI；如果已解决，就直接返回数据。

## 用 Suspense 和错误边界处理错误

如果 Promise 被 reject（请求失败），React 会寻找一个错误边界（Error Boundary）并渲染其备用 UI。这就像处理加载状态一样，也是声明式的：

```jsx
 import { Suspense } from 'react'
 import { ErrorBoundary } from 'react-error-boundary'

 function App() {
     return (
         <ErrorBoundary fallback={<div>出错了，请稍后再试</div>}>
             <Suspense fallback={<div>正在加载手机详情...</div>}>
                 <PhoneDetails />
             </Suspense>
         </ErrorBoundary>
     )
 }
```

#### 实战示例：构建一个简单的 Suspense 数据获取器

我们来从头构建一个简单的 Suspense 数据获取器：

```jsx
 let userPromise
 function fetchUser() {
     userPromise = userPromise ?? fetch('/api/user').then((res) => res.json())
     return userPromise
 }

 function UserInfo() {
     const user = use(fetchUser())
     return <div>Hello, {user.name}!</div>
 }

 function App() {
     return (
         <Suspense fallback={<div>正在加载用户信息...</div>}>
             <UserInfo />
         </Suspense>
     )
 }
```

你会注意到，在 `UserInfo` 组件中没有任何手动处理加载或错误的逻辑。Suspense 和错误边界已经帮你搞定了。

你可以想象如何扩展这个示例，使其支持参数、缓存等功能。

#### 总结

这种模式之所以强大，是因为它具备以下优势：

- 声明式：不再需要手动管理加载和错误状态
- 可组合：适用于任何异步资源 —— 数据、图片，甚至是代码
- 可扩展：可以嵌套多个 Suspense 边界，实现更细粒度的控制
- 面向未来：这是 React 官方推荐的处理客户端异步 UI 的方式

React Suspense 是构建异步 UI 的利器。通过 “抛出 Promise” 以及使用 `use` hook，你可以写出更清晰、更声明式的组件，自动处理加载和错误状态。