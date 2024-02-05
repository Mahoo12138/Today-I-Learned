## useTimeout()

Create a hook to easily use `setTimeout(callback, delay)`.

1. reset the timer if delay changes
2. DO NOT reset the timer if only callback changes

```react
import { useEffect, useRef } from 'react'

export function useTimeout(callback: () => void, delay: number) {

  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {

    const timeoutId = setTimeout(() => callbackRef.current(), delay)

    return () => clearTimeout(timeoutId)
  }, [delay])

}
```

难点在第二个要求，主要是隐形的需求，新的 callback 不会创建新的 setTimeout 实例（重置 delay），但是，也就是说 callback 不能加入 useEffect 的依赖数组中，但是这样的话，useEffect 内引用的 callback 就是旧的，不满足要求，所以需要使用 useRef 来每次保存新的 callback。

## useIsFirstRender()

```react
import { useRef } from 'react';

export function useIsFirstRender(): boolean {
  const isFirstRender = useRef(true);

  if (isFirstRender.current) {
    isFirstRender.current = false;
    return true
  }
    

  return false;
}
```

```react
import React from 'react';

export function useIsFirstRender(): boolean {
  const isFirst = React.useRef(true);

  React.useEffect(() => {
    isFirst.current = false
  }, []);

  return isFirst.current;
} 
```

## useSWR() I

Let's try to implement the basic usage by ourselves.

```tsx
import React from 'react'

function App() {
  const { data, error } = useSWR('/api', fetcher)
  if (error) return <div>failed</div>
  if (!data) return <div>loading</div>

  return <div>succeeded</div>
}
```

1. this is not to replicate the true implementation of `useSWR()`
2. The first argument `key` is for deduplication, we can safely ignore it for now

```react
import { useEffect, useMemo, useState } from "react";

export function useSWR<T = any, E = any>(
  _key: string,
  fetcher: () => T | Promise<T>
): {
  data?: T
  error?: E
} {
  // your code here
  const [data, setData] = useState<T>();
  const [error, setError] = useState<E>();
  const result = useMemo(fetcher, [_key]);

  useEffect(() => {
    if (result instanceof Promise) {
      result.then(setData, setError);
    }
  }, [])

  return {data: result instanceof Promise ? data : result, error}
}
```

主要是使用 useMemo 缓存 fetcher 的结果，然后一个比较容易犯错的地方的就是异步的结果才需要使用 setState 进行获取更新返回，而同步的结果，直接返回即可，所以需要判断一次是否是 Promise，如果所有结果都使用 setState 保存，那么会造成额外的渲染。

另一个就是 useEffect 注意只需要初次渲染时，对 promise 进行 获取结果，不然 promise 可以 一直 then，会造成无限循环。

## usePrevious()

Create a hook `usePrevious()` to return the previous value, with initial value of `undefined`.

 ```react
 import { useEffect, useRef } from "react";
 
 export function usePrevious<T>(value: T): T | undefined {
   const last = useRef<T>()
   useEffect(() => {
     last.current = value
   }, [value])
 
   return last.current
 }
 ```

## useHover()

It is common to see conditional rendering based on hover state of some element.

We can achieve it by CSS pseudo class `:hover`, but for more complex cases it might be better to have state controlled by script.

Now you are asked to create a `useHover()` hook.

```tsx
function App() {
  const [ref, isHovered] = useHover()
  return <div ref={ref}>{isHovered ? 'hovered' : 'not hovered'}</div>
}
```

```react
import { Ref, useRef, useState, useEffect } from 'react'

export function useHover<T extends HTMLElement>(): [Ref<T | undefined>, boolean] {
  const ref = useRef<T>()
  const [isHovering, setHovering] = useState(false)
  useEffect(() => {
    // false by default if ref.current changes
    setHovering(false)

    const element = ref.current
    if (!element)
      return

    const setYes = () => setHovering(true)
    const setNo = () => setHovering(false)
  
    element.addEventListener('mouseenter', setYes)
    element.addEventListener('mouseleave', setNo)

    return () => {
      element.removeEventListener('mouseenter', setYes)
      element.removeEventListener('mouseleave', setNo)
    }
  }, [ref.current]) // now we could pass a dependency array for better performances.
  return [ref, isHovering]
}
```



```react
import { Ref, useRef, useState, useCallback } from 'react'

export function useHover<T extends HTMLElement>(): [Ref<T>, boolean] {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const controllerRef = useRef(new AbortController());

  const ref = useRef<T>();

  const callbackRef = useCallback(node => {
    if (ref.current) {
      controllerRef.current.abort();
      controllerRef.current = new AbortController();
    }

    const { signal } = controllerRef.current

        ref.current = node;

      if (ref.current) {
        ref.current.addEventListener('mouseenter', () => setIsHovered(true), { signal });
        ref.current.addEventListener('mouseleave', () => setIsHovered(false), { signal });
      }
    }, []);
    return [callbackRef, isHovered];
}
```

