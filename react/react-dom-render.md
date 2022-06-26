**React更新的方式有三种：** 

+ ReactDOM.render() || hydrate（ReactDOMServer渲染） 
+ setState 
+ forceUpdate

`ReactDOM.render(element, container[, callback])` 函数在提供的 Container 内渲染一个 React 元素，并返回对该组件的引用（或者针对无状态组件返回 null）：

```js
const ReactDOM: Object = {
    render(
    element: React$Element<any>,
     container: DOMContainer,
     callback: ?Function,
    ) {
        return legacyRenderSubtreeIntoContainer(
            null,
            element,
            container,
            false,
            callback,
        );
    }
      hydrate(element: React$Node, container: DOMContainer, callback: ?Function) {
    // TODO: throw or warn if we couldn't hydrate?
    return legacyRenderSubtreeIntoContainer(
      null,
      element,
      container,
      true,
      callback,
    );
  },
}
```

> 在 React 18 中，`render` 函数已被 `createRoot` 函数所取代。

`render()`方法本质是返回了函数 `legacyRenderSubtreeIntoContainer()`，而`hydrate`方法则是`forceHydrate`这个参数的区别：

+ `hydrate()`为`true`，表示在服务端尽可能复用节点，提高性能；
+ `render()`为`false`，表示在浏览器端不会去复用节点，而是全部替换掉；

`egacyRenderSubtreeIntoContainer()`函数

```js
// null, element, container, false, callback
function legacyRenderSubtreeIntoContainer(
  parentComponent: ?React$Component<any, any>,
  children: ReactNodeList,
  container: DOMContainer,
  forceHydrate: boolean,
  callback: ?Function,
) {
  let root: Root = (container._reactRootContainer: any);
  if (!root) {
    // Initial mount
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      forceHydrate,
    );
    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function() {
        const instance = DOMRenderer.getPublicRootInstance(root._internalRoot);
        originalCallback.call(instance);
      };
    }
    // Initial mount should not be batched.
    DOMRenderer.unbatchedUpdates(() => {
      if (parentComponent != null) {
        root.legacy_renderSubtreeIntoContainer(
          parentComponent,
          children,
          callback,
        );
      } else {
        root.render(children, callback);
      }
    });
  } else {
    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function() {
        const instance = DOMRenderer.getPublicRootInstance(root._internalRoot);
        originalCallback.call(instance);
      };
    }
    // Update
    if (parentComponent != null) {
      root.legacy_renderSubtreeIntoContainer(
        parentComponent,
        children,
        callback,
      );
    } else {
      root.render(children, callback);
    }
  }
  return DOMRenderer.getPublicRootInstance(root._internalRoot);
}
```

函数开始会初始化一个将`root`变量，赋值为``container._reactRootContainer``，而初始渲染时 container 是DOM 对象并没有该属性；

之后通过函数`legacyCreateRootFromDOMContainer()`创建了一个`ReactRoot(container, isConcurrent, shouldHydrate)`对象返回并赋值；

构造函数`ReactRoot()`内部调用了`createContainer()` => `createFiberRoot()`，将返回的值挂载到了`_internalRoot`属性上；

```js
function ReactRoot(
  container: Container,
  isConcurrent: boolean,
  hydrate: boolean,
) {
  const root = DOMRenderer.createContainer(container, isConcurrent, hydrate);
  this._internalRoot = root;
}

export function createContainer(
  containerInfo: Container,
  isConcurrent: boolean,
  hydrate: boolean,
): OpaqueRoot {
  return createFiberRoot(containerInfo, isConcurrent, hydrate);
}

export function createFiberRoot(
  containerInfo: any,
  isConcurrent: boolean,
  hydrate: boolean,
): FiberRoot {
  // Cyclic construction. This cheats the type system right now because
  // stateNode is any.
  const uninitializedFiber = createHostRootFiber(isConcurrent);

  let root;
  if (enableSchedulerTracing) {
    root = ({
      current: uninitializedFiber,
      containerInfo: containerInfo,
      pendingChildren: null,
	  // ...
    }: FiberRoot);
  } else {
    root = ({
      current: uninitializedFiber,
      containerInfo: containerInfo,
      pendingChildren: null,
	  // ...
    }: BaseFiberRootProperties);
  }

  uninitializedFiber.stateNode = root;

  // The reason for the way the Flow types are structured in this file,
  // Is to avoid needing :any casts everywhere interaction tracing fields are used.
  // Unfortunately that requires an :any cast for non-interaction tracing capable builds.
  // $FlowFixMe Remove this :any cast and replace it with something better.
  return ((root: any): FiberRoot);
}
```

在其中还会调用`shouldHydrateDueToLegacyHeuristic`函数，该函数对获取到的`rootElement`做一个判断（是否有子节点）即是否需要 **Hydrate**，以确定后面是否删除所有的子元素；

```js
function getReactRootElementInContainer(container: any) {
  if (!container) {
    return null;
  }

  if (container.nodeType === DOCUMENT_NODE) {
    return container.documentElement;
  } else {
    return container.firstChild;
  }
}

function shouldHydrateDueToLegacyHeuristic(container) {
  const rootElement = getReactRootElementInContainer(container);
  return !!(
    rootElement &&
    rootElement.nodeType === ELEMENT_NODE &&
    rootElement.hasAttribute(ROOT_ATTRIBUTE_NAME)
  );
}
```

再检测回调参数，再调用`getPublicRootInstance`函数，由于是 React 初始化，所以`container.current`是没有子节点的，所以该方法返回 null；

最后，在`unbatchedUpdates`参数中传入回调，因为`parentComponent == null`，调用`root.render()`。

```js
function unbatchedUpdates<A, R>(fn: (a: A) => R, a: A): R {
  if (isBatchingUpdates && !isUnbatchingUpdates) {
    isUnbatchingUpdates = true;
    try {
      return fn(a);
    } finally {
      isUnbatchingUpdates = false;
    }
  }
  return fn(a);
}

ReactRoot.prototype.render = function(
  children: ReactNodeList,
  callback: ?() => mixed,
): Work {
  const root = this._internalRoot;
  const work = new ReactWork();
  callback = callback === undefined ? null : callback;
  if (callback !== null) {
    work.then(callback);
  }
  DOMRenderer.updateContainer(children, root, null, work._onCommit);
  return work;
};
```

`render`函数内部调用了 `updateContainer`：

```js
export function updateContainer(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function,
): ExpirationTime {
  const current = container.current;
  const currentTime = requestCurrentTime();
  const expirationTime = computeExpirationForFiber(currentTime, current);
  return updateContainerAtExpirationTime(
    element,
    container,
    parentComponent,
    expirationTime,
    callback,
  );
}
```

