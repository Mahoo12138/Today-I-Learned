# React 错误处理：最佳实践

作为一名开发者，我们都希望开发出来的应用程序能够稳定、完美的工作，并且能够满足所有可以想象得到的边缘场景。但是，作为一个人类，我们都会犯一些错误，根本写不出没有 Bug 的代码。无论我们多么小心，无论我们编写多少自动化测试，依然会不可避免地出现错误。但最重要的是，当错误影响到用户体验时，要能够防御这些错误，尽可能地减少影响范围，并以优雅的方式处理它，直到它能够被真正修复。

因此，本文主要讨论 React 中的错误处理：当发生错误时，我们可以做什么；不同的错误捕获方法有哪些限制，以及如何突破这些限制。

## **React 中错误处理的重要性**

首先，让我们来讨论一个至关重要的问题：为什么在 React 中做一些错误捕获处理？

答案很简单：**自 React 16 起，任何未被错误边界捕获的错误将会导致整个 React 组件树被卸载**。在这之前的版本中，即便组件的 UI 是残缺或错误的，组件也会显示在屏幕上。现在，即使是 UI 上的某个无关紧要的部分，甚至是某个无法控制的外部库中，出现了一个微不足道的错误，都有可能导致整个页面受到破坏，并为用户渲染出一个白屏。

前端开发人员从未有过如此强大的破坏力😅

## **JavaScript 中的 try/catch**

在常规的 JavaScript 代码中捕获那些令人讨厌的错误，处理方法通常非常简单。

我们有一个很好用的 try/catch 语句，它的用法不言自明：尝试做一些事情，如果失败了，就捕获到错误并采取措施处理它：

```js
try {
  // if we're doing something wrong, this might throw an error
  doSomething();
} catch (e) {
  // if error happened, catch it and do something with it without stopping the app
  // like sending this error to some logging service
}
```

同样的代码也适用于 async 函数中：

```js
try {
  await fetch('/bla-bla');
} catch (e) {
  // oh no, the fetch failed! We should do something about it!
}
```

如果我们使用 Promise，我们有专门针对他们的捕获方法。因此，如果我们使用 Promise 的 API 重新编写前面的 fetch 示例，它将如下所示：

```js
fetch('/bla-bla').then((result) => {
  // if a promise is successful, the result will be here
  // we can do something useful with it
}).catch((e) => {
  // oh no, the fetch failed! We should do something about it!
})
```

它们的概念相同，只是实现有点不同，所以在本文的其余部分，我将对所有错误使用 try/catch 语法。

## **React 中的 try/catch**

当捕获到错误时，我们需要对错误做一些处理。除了上报一条错误日志之外，我们还能做什么呢？更准确地说，我们可以为用户做什么呢？让用户看到一个白屏页面或残缺的页面，这样的用户体验极其不友好。

最直接的做法是，在等待我们修复的过程中，为用户渲染一些有用的内容。幸运的是，我们可以在 catch 语句中做任何想做的事情，包括设置状态。所以我们可以这样做：

```
const SomeComponent = () => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      // do something like fetching some data
    } catch(e) {
      // oh no! the fetch failed, we have no data to render!
      setHasError(true);
    }
  })

  // something happened during fetch, lets render some nice error screen
  if (hasError) return <SomeErrorScreen />

  // all's good, data is here, let's render it
  return <SomeComponentContent {...datasomething} />
}
```

如果我们请求数据失败了，就把错误状态被置为 true，然后为用户渲染出一个兜底页面，并带有一些附加信息，比如用于「联系我们」的电话号码。

这种处理错误的方式非常简单，适用于那些简单的、可预测的 以及特定的用户场景，例如处理失败的 fetch 请求。

但是，如果想要捕获到组件中所有可能发生的错误，我们将不得不面临一些挑战和限制。

### 限制1：useEffect 不能被 try/catch 包裹

如果我们用 `try/catch` 包裹 `useEffect`，它将无法工作：

```js
try {
  useEffect(() => {
    throw new Error('Hulk smash!');
  }, [])
} catch(e) {
  // useEffect throws, but this will never be called
}
```

这是因为 `useEffect` 在渲染后被异步调用，所以从 `try/catch` 的角度来看，诸事皆顺利。这点与 Promise 类似：如果我们不等待异步的执行结果，JavaScript 将继续进行其它业务，直到完成 Promise 后返回，并且只执行`useEffect`（或 Promise）的内部代码。`try/catch` 内的代码块将被执行，但在那时 `try/catch` 已经消失很久了。

为了捕获 useEffect 内部的错误，try/catch 也应放在内部：

```
useEffect(() => {
 try {
   throw new Error('Hulk smash!');
 } catch(e) {
   // this one will be caught
 }
}, [])
```

这种方案适用于任何使用 `useEffect` 或其它异步场景。因此，我们不得不将 `try/catch` 拆分为多个块：每个 Hook 中都要一个 `try/catch`。

### 限制2：try/catch 无法捕获子组件中的错误

try/catch 无法捕获子组件中发生的任何事情。很显然，我们不能这样做：

```
const Component = () => {
  let child;

  try {
    child = <Child />
  } catch(e) {
    // useless for catching errors inside Child component, won't be triggered
  }

  return child;
}
```

或者这样：

```
const Component = () => {
  try {
    return <Child />
  } catch(e) {
    // still useless for catching errors inside Child component, won't be triggered
  }
}
```

这是因为在我们写了 `<Child />` 这个代码时，并没有真正的渲染这个组件。我们只是创建了一个组件的 Element，这仅仅是对组件做的定义。它作为一个包含 type、props 等必要信息的对象，接下来 React 会使用这些信息，并触发组件渲染。组件渲染时，`try/catch` 已经执行完毕。这个过程与 Promise 和 `useEffect` 类似。

### 限制3：try/catch 无法在渲染期间设置 state

如果我们要捕获 useEffect 以及 callback 之外的错误（即，在组件渲染期间发生的错误），那么处理它们的方法就不再是那么简单了：因为渲染期间不允许状态更新。

例如，如果发生错误，像这样更新状态的代码只会导致无限循环的重新渲染：

```js
const Component = () => {
  const [hasError, setHasError] = useState(false);

  try {
    doSomethingComplicated();
  } catch(e) {
    // don't do that! will cause infinite loop in case of an error
    // see codesandbox below with live example
    setHasError(true);
  }
}
```

当然，我们可以在这里返回针对错误的兜底内容，而不是设置状态：

```js
const Component = () => {
  try {
    doSomethingComplicated();
  } catch(e) {
    // this allowed
    return <SomeErrorScreen />
  }
}
```

但是，正如您所看到的那样，这么处理有点麻烦，并迫使我们以不同的方式处理同一组件中的错误：状态为 `useEffect` 和回调设置 state，以及直接返回兜底内容。

```js
// while it will work, it's super cumbersome and hard to maitain, don't do that
const SomeComponent = () => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      // do something like fetching some data
    } catch(e) {
      // can't just return in case of errors in useEffect or callbacks
      // so have to use state
      setHasError(true);
    }
  })

  try {
    // do something during render
  } catch(e) {
    // but here we can't use state, so have to return directly in case of an error
    return <SomeErrorScreen />;
  }

  // and still have to return in case of error state here
  if (hasError) return <SomeErrorScreen />

  return <SomeComponentContent {...datasomething} />
}
```

总结本节：如果我们在 React 中仅仅使用 try/catch 来处理错误，要么会错过大部分错误，要么会将每个组件变成一堆无法理解的代码，而且这些代码本身也可能会导致错误。

幸运的是，还有另一种方法。

## 错误边界（Error Boundaries）的使用

为了突破上述限制，React 为我们提供了所谓的 “错误边界（Error Boundaries）”：错误边界是一种 React 组件，可以捕获发生在其子组件树任何位置的 JavaScript 错误，它以某种方式将常规组件转换为 try/catch 语句。错误边界可以捕获发生在整个子组件树的渲染期间、生命周期方法以及构造函数中的错误，但是它无法捕获其自身的错误。

错误边界的典型用法，如下所示：

```js
const Component = () => {
  return (
    <ErrorBoundary>
      <SomeChildComponent />
      <AnotherChildComponent />
    </ErrorBoundary>
  )
}
```

在渲染过程中，如果这些组件中的任何一个或其子组件出现问题，都将捕获并处理该错误。

但是 React 并未提供给我们组件本身，它只是给了我们一个实现它的工具。最简单的实现是这样的：

```
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    // initialize the error state
    this.state = { hasError: false };
  }

  // if an error happened, set the state to true
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    // if error happened, return a fallback component
    if (this.state.hasError) {
      return <>Oh no! Epic fail!</>
    }

    return this.props.children;
  }
}
```

我们创建了一个常规的类组件（这里只能用类组件，因为没有用于错误边界的 Hooks），并定义了getDerivedStateFromError 方法，该方法将组件转换为一个错误边界。

捕获到错误并将错误信息发送到某个地方，这样可以通知到 on-call（值班）的人，也是一件很重要的事情。为此，错误边界为我们提供了 componentDidCatch 方法：

```js
class ErrorBoundary extends React.Component {
  // everything else stays the same

  componentDidCatch(error, errorInfo) {
    // send error to somewhere here
    log(error, errorInfo);
  }
}
```

在设置了错误边界之后，我们可以对它做任何我们想做的事情，和其他组件没什么两样。例如，我们可以将 fallback 作为 props 来提高它的可复用性：

```js
render() {
  // if error happened, return a fallback component
  if (this.state.hasError) {
    return this.props.fallback;
  }

  return this.props.children;
}
```

然后这样使用它：

```jsx
const Component = () => {
  return (
    <ErrorBoundary fallback={<>Oh no! Do something!</>}>
      <SomeChildComponent />
      <AnotherChildComponent />
    </ErrorBoundary>
  )
}
```

或者我们可能需要其他东西，比如在单击按钮时重置 state，区分错误类型，或者将错误推到某个 context 中。

然而，错误边界也不是万能的，它并不能捕获到所有的错误。

## **错误边界的限制**

错误边界仅捕获到 React 生命周期中发生的错误。在生命周期之外发生的错误，比如 resolved promise、带有setTimeout 的异步代码、各种回调和事件处理程序，如果不额外做处理，就不会被捕获到。

```jsx
const Component = () => {
  useEffect(() => {
    // this one will be caught by ErrorBoundary component
    throw new Error('Destroy everything!');
  }, [])

  const onClick = () => {
    // this error will just disappear into the void
    throw new Error('Hulk smash!');
  }

  useEffect(() => {
    // if this one fails, the error will also disappear
    fetch('/bla')
  }, [])

  return <button onClick={onClick}>click me</button>
}

const ComponentWithBoundary = () => {
  return (
    <ErrorBoundary>
      <Component />
    </ErrorBoundary>
  )
}
```

通常，要使用常规 `try/catch` 来处理此类错误。至少在这个场景中我们可以安全地（或多或少地）使用 state：处理事件的回调函数通常也是设置 state 的地方。所以从技术上讲，我们可以将两种方法结合起来，于是可以这样做：

```jsx
const Component = () => {
  const [hasError, setHasError] = useState(false);

  // most of the errors in this component and in children will be caught by the ErrorBoundary

  const onClick = () => {
    try {
      // this error will be caught by catch
      throw new Error('Hulk smash!');
    } catch(e) {
      setHasError(true);
    }
  }

  if (hasError) return 'something went wrong';

  return <button onClick={onClick}>click me</button>
}

const ComponentWithBoundary = () => {
  return (
    <ErrorBoundary fallback={"Oh no! Something went wrong"}>
      <Component />
    </ErrorBoundary>
  )
}
```

但是我们又回到了原点：每个组件都需要维持 “错误” state，更重要的是还要决定如何去处理它。

当然，我们可以不在组件级别处理这些错误，而是通过 props 或 Context 将它们传播到具有错误边界的父组件。这样，我们只需要设置一个全局的 “fallback” 组件：

```js
const Component = ({ onError }) => {
  const onClick = () => {
    try {
      throw new Error('Hulk smash!');
    } catch(e) {
      // just call a prop instead of maintaining state here
      onError();
    }
  }

  return <button onClick={onClick}>click me</button>
}

const ComponentWithBoundary = () => {
  const [hasError, setHasError] = useState();
  const fallback = "Oh no! Something went wrong";

  if (hasError) return fallback;

  return (
    <ErrorBoundary fallback={fallback}>
      <Component onError={() => setHasError(true)} />
    </ErrorBoundary>
  )
}
```

但是，这要额外写很多代码！我们必须为渲染树中的每个子组件执行同样的操作。更不用说，我们现在基本上维护了两个错误状态：父组件和错误边界。错误边界已经有了将错误传播到父组件的所有机制，而我们在这里做了重复的工作。

难道我们不能用错误边界捕获到异步代码和事件处理函数中的错误吗？

## **错误边界捕获异步错误**

有趣的是，我们可以用错误边界捕获到所有的错误！深受大家喜欢的 Dan Abramov 给我们分享了一个很酷的方法来实现这一点： [Throwing Error from hook not caught in error boundary · Issue #14981 · facebook/react](https://github.com/facebook/react/issues/14981#issuecomment-468460187)。

这里的技巧是先用 try/catch 捕获这些错误，然后在 catch 语句内触发正常的 React 重新渲染，然后将这些错误重新抛出到重新渲染生命周期中。这样，错误边界可以像其它错误一样捕获它们。由于状态更新是触发重新渲染的方式，并且 `setState` 函数实际上可以接受函数 作为参数，因此该解决方案十分惊艳。

```js
const Component = () => {
  // create some random state that we'll use to throw errors
  const [state, setState] = useState();

  const onClick = () => {
    try {
      // something bad happened
    } catch (e) {
      // trigger state update, with updater function as an argument
      setState(() => {
        // re-throw this error within the updater function
        // it will be triggered during state update
        throw e;
      })
    }
  }
}
```

最后，我们对这个方案做一些抽象，这样我们就不必在每个组件中创建随机 state。我们可以在这里发挥创意，封装一个 Hook，为我们提供一个异步错误抛出方法：

```js
const useThrowAsyncError = () => {
  const [state, setState] = useState();

  return (error) => {
    setState(() => throw error)
  }
}
```

然后这样使用：

```js
const Component = () => {
  const throwAsyncError = useThrowAsyncError();

  useEffect(() => {
    fetch('/bla').then().catch((e) => {
      // throw async error here!
      throwAsyncError(e)
    })
  })
}
```

或者，我们可以为 callback 回调函数做一些额外处理，如下所示：

```js
const useCallbackWithErrorHandling = (callback) => {
  const [state, setState] = useState();

  return (...args) => {
    try {
      callback(...args);
    } catch(e) {
      setState(() => throw e);
    }
  }
}
```

然后这样使用：

```jsx
const Component = () => {
  const onClick = () => {
    // do something dangerous here
  }

  const onClickWithErrorHandler = useCallbackWithErrorHandling(onClick);

  return <button onClick={onClickWithErrorHandler}>click me!</button>
}
```

## 已有的工具 react-error-boundary

对于那些讨厌重新发明轮子或者喜欢使用已有的工具类库的人来说，可以使用这个开源类库：[GitHub - bvaughn/react-error-boundar](https://github.com/bvaughn/react-error-boundary)。

## **总结**

这就是本文的全部内容，希望从现在开始，如果你的应用程序发生了一些不好的事情，你将能够轻松优雅地处理这种情况。

本文重点：

- try/catch 不会捕获像 `useEffect` 这样的 Hooks 以及任何子组件内部的错误；
- `ErrorBoundary` 可以捕获生命周期中的错误，但它不会捕获异步代码和事件处理函数中的错误；
- 为了让 `ErrorBoundary` 捕获到这些错误，只需要先用 try/catch 捕获它们，然后将它们重新抛回到 React 生命周期；