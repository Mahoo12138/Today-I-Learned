##使用 React.memo 的话，什么情况下会失效

在使用 `React.memo` 时，以下情况可能导致其性能优化失效（组件依然会被重新渲染）：

------

### **1. props 为引用类型且未正确缓存**

- **问题**：当传递的 props 是对象、数组或函数等**引用类型**，且父组件重新渲染时**重新创建**了这些引用（即使内容不变）。

- **原因**：`React.memo` 默认使用**浅比较**（shallow comparison），引用变化会触发渲染。

  ```jsx
  // ⚠️ 每次渲染时创建新的对象和函数
  function Parent() {
    const data = { id: 1 }; // 每次渲染时新对象
    const onClick = () => {}; // 每次渲染时新函数
    return <Child data={data} onClick={onClick} />;
  }
  
  const Child = React.memo(() => { ... });
  ```

- **解决方法**：缓存引用类型

  ```jsx
  function Parent() {
    const data = useMemo(() => ({ id: 1 }), []); // 缓存对象
    const onClick = useCallback(() => {}, []);   // 缓存函数
    return <Child data={data} onClick={onClick} />;
  }
  ```

------

### **2. props 包含频繁变化的属性**

- **问题**：即使使用了 `React.memo`，如果某个 `prop`（如父组件的 `state`）频繁变化，子组件仍会重新渲染。

- **原因**：`React.memo` 仅对 props 进行浅比较，属性值变化会被检测到。

  ```jsx
  function Parent() {
    const [count, setCount] = useState(0);
    return <Child count={count} />; // count 频繁变化，Child 每次重新渲染
  }
  
  const Child = React.memo(() => { ... });
  ```

- **解决方法**：

  - 确保只有必要的值传递给子组件。
  - 使用 `useMemo` 在子组件内部处理依赖。

------

### **3. 自定义比较函数逻辑错误**

- **问题**：如果为 `React.memo` 提供了**自定义比较函数**（第二个参数），但逻辑错误会导致无效更新。

- **原因**：比较函数返回 `true` 会跳过渲染，返回 `false` 会重新渲染。

  ```jsx
  const Child = React.memo(
    ({ data }) => { ... },
    (prev, next) => prev.data.id === next.data.id // ❌ 只比较了 id，其他属性变化被忽略
  );
  ```

- **解决方法**：确保比较函数覆盖所有关键属性。

------

### **4. 组件使用了 Context**

- **问题**：子组件通过 `useContext` 消费 Context，且 Context 值变化时，即使 `props` 未变也会重新渲染。

- **原因**：`React.memo` **不会阻止** Context 变化触发的更新。

  ```jsx
  const ThemeContext = createContext();
  
  function Parent() {
    const [theme, setTheme] = useState('light');
    return (
      <ThemeContext.Provider value={theme}>
        <Child /> {/* 当 theme 变化时，Child 重新渲染 */}
      </ThemeContext.Provider>
    );
  }
  
  const Child = React.memo(() => {
    const theme = useContext(ThemeContext); // Context 消费
    return <div>{theme}</div>;
  });
  ```

- **解决方法**：

  - 拆分 Context（将频繁变化的值独立成单独 Context）。
  - 将 Context 值通过 `props` 传递（结合 `React.memo` 控制更新）。

------

### **5. 组件内部使用了状态或 Hook**

- **问题**：子组件**自身状态**（`useState`/`useReducer`）变化或其依赖的 **Hook**（如 `useEffect`）导致内部更新。

- **原因**：`React.memo` 只优化来自父组件的渲染，不阻止组件自身状态变化。

  ```jsx
  const Child = React.memo(() => {
    const [state, setState] = useState(0); // 内部状态变化时仍触发渲染
    return ...;
  });
  ```

------

### **6. 父组件传递了 children**

- **问题**：如果父组件传递了 `children`，且父组件重新渲染时创建了**新的 React.Element**。

- **原因**：`children` 作为 `prop`，其引用变化会触发更新。

  ```jsx
  function Parent() {
    return (
      <Child>
        <div>Content</div> {/* 每次渲染时创建新的 React.Element */}
      </Child>
    );
  }
  
  const Child = React.memo(({ children }) => { ... });
  ```

- 解决方法：缓存 `children`

  ```jsx
  function Parent() {
    const content = useMemo(() => <div>Content</div>, []);
    return <Child>{content}</Child>;
  }
  ```

### **总结与最佳实践**

|         场景         |                解决方案                 |
| :------------------: | :-------------------------------------: |
|  **引用类型 props**  |    使用 `useMemo`/`useCallback` 缓存    |
| **频繁变化的 props** |  拆分组件或通过 `useMemo` 隔离变化逻辑  |
|  **自定义比较函数**  |     确保比较逻辑覆盖所有关键 props      |
|   **Context 更新**   |   拆分高频 Context 或通过 props 传递    |
|  **children 变化**   |          缓存 `children` 内容           |
|   **组件内部状态**   | `React.memo` 不阻断此类更新（符合预期） |