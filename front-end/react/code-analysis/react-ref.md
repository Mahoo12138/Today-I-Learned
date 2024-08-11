---
title: React Ref
---
## ref 三种使用用法

### String

dom 节点或 class 组件上使用，获取真实的dom节点：

```react
<input ref="stringRef" />
<Comp ref="compStringRef" />
// this.refs.stringRef / compStringRef
```

### function

dom节点或class 组件上挂载回调函数，函数的入参为 dom节点：

```react
<input ref={(ref) => { this.callBackRef = ref }} />
<Comp ref={(comp) => { this.compCallbackRef = comp }} />
// this.callBackRef / compCallbackRef
```

### createRef object

`React.createRef()`创建一个 形如`{current: null}`的对象，赋值给一个变量，挂载到组件上，通过变量的`current`属性获取组件实例：

```react
// this.compCreateRef = React.createRef()
<Child ref={this.myCompCreateRef} />
// this.compCreateRef.current
```

## createRef() 源码解析

```js
function createRef() {
  var refObject = {
    current: null
  };
  return refObject;
}
```

## forwardRef() 源码解析

对于纯函数组件无法使用 ref，因为其没有实例；但可以通过`forwardRef`把 ref 传递进去

`forwardRef`常用于：

- 转发 `ref `到组件内部的`DOM `节点上；
- 在高阶组件中转发`ref`；

```js
export default function forwardRef<Props, ElementType: React$ElementType>(
  render: (props: Props, ref: React$Ref<ElementType>) => React$Node,
) {
  return {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render,
  };
}
```

调用`forwardRef`返回一个对象，该对象作为一个组件会在`render()`函数中使用，实质上该对象会作为参数传入`creactElement`函数，并返回一个`ReactElement`对象；

其中`forwardRef`返回的对象赋值给`ReactElement`对象的`type`属性，其`$$typeof`仍然是 **REACT_ELEMENT_TYPE**：

```js
const ReactElement = function(type, key, ref, self, source, owner, props) {
  const element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    // ...
  };
  return element;
};
```

