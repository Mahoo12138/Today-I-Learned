Component 是一个函数基类，设置 react 组件的props，content，refs，updater 等属性：

```js
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue;
}

Component.prototype.isReactComponent = {};
```

原型上添加属性`isReactComponent`，还有`setState `和`forceUpdate`两个方法：

+ **setState**：用于改变 Component 类内部的变量，内部使用`updater.enqueueSetState`这个方法实现更新机制，不同平台机制不同；
+ **forceUpdate**：强制 Component 更新一次，即便 state 表层没有更新；

其次还有`PureComponent`，使用寄生组合式继承自`Component`：

+ 减少一次原型链查找次数，节省内存消耗；

内部使用`shouldComponentUpdate(nextProps,nextState)`方法，通过浅比较（比较一层），来判断是否需要重新`render()`函数，如果外面传入的`props`或者是`state`没有变化，则不会重新渲染，省去了虚拟dom的生成和对比过程：

```js
function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype;

function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}

const pureComponentPrototype = (PureComponent.prototype = new ComponentDummy());
pureComponentPrototype.constructor = PureComponent;
// Avoid an extra prototype jump for these methods.
Object.assign(pureComponentPrototype, Component.prototype);

pureComponentPrototype.isPureReactComponent = true;  
```

> `React`中判断 `Component`是否需要更新：
>
> + 有没有`shouldComponentUpdate`方法
>
> + `ReactFiberClassComponent.js`中的`checkShouldComponentUpdate()`中对`PureComponent`的判断