## context的使用方式 (16.x)

```tsx
const { Provider, Consumer } = React.createContext({ theme: "green" })

class Parent extends React.Component {
  render() {
    //Procider组件遍历子组件，并且有一个属性value用来提供数据
    return (
      <Provider value={{ theme: "pink" }}>
        <Content />
      </Provider>
    )
  }
}

function Content() {
  return (
    <div>
      <Button />
    </div>
  )
}

function Button() {
  return (
    <Consumer>
      {({ theme }) => (
        <button style={{ backgroundColor: theme }}>
          Toggle Theme
        </button>
      )}
    </Consumer>
  )
}
```

## createContext() 源码解析

```js
export function createContext<T>(
    defaultValue: T,
    calculateChangedBits: ?(a: T, b: T) => number,
    ): ReactContext<T> {
        if (calculateChangedBits === undefined) {
            calculateChangedBits = null;
        } else {}

        const context: ReactContext<T> = {
            $$typeof: REACT_CONTEXT_TYPE,
            _calculateChangedBits: calculateChangedBits,
            // As a workaround to support multiple concurrent renderers, we categorize
            // some renderers as primary and others as secondary. We only expect
            // there to be two concurrent renderers at most: React Native (primary) and
            // Fabric (secondary); React DOM (primary) and React ART (secondary).
            // Secondary renderers store their context values on separate fields.
            _currentValue: defaultValue,
            _currentValue2: defaultValue,
            // These are circular
            Provider: (null: any),
            Consumer: (null: any),
        };

        context.Provider = {
            $$typeof: REACT_PROVIDER_TYPE,
            _context: context,
        };

        let hasWarnedAboutUsingNestedContextConsumers = false;
        let hasWarnedAboutUsingConsumerProvider = false;


        context.Consumer = context;

        return context;
	}
```

`_currentValue` 用来记录`Provider/Consumer`的 value 值，默认为参数 `defaultValue`；
