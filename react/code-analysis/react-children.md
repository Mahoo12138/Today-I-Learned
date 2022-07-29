## Children 简介

`React.Children` 提供了用于处理 `this.props.children` 不透明数据结构的实用方法

+ `map`：在 `children` 里的每个直接子节点上调用一个函数，返回该数组；每个节点的返回的如果是数组，还会递归继续展开；
+ `forEach`：类似，但它不会返回一个数组；
+ `count`：返回 `children` 中的组件总数量，等同于通过 `map` 或 `forEach` 调用回调函数的次数；
+ `only`：验证 `children` 是否只有一个子节点（一个 React 元素），如果有则返回它，否则此方法会抛出错误

### 源码解析

```js
const React = {
    Children: {
        map,
        forEach,
        count,
        toArray,
        only,
    }
}

function mapChildren(children, func, context) {
  if (children == null) {
    return children;
  }
  const result = [];
  mapIntoWithKeyPrefixInternal(children, result, null, func, context);
  return result;
}
```

 