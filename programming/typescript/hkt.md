## 高阶类型是什么？

高阶类型（Higher-Kinded Types, HKTs）是类型系统中的高级概念，允许**类型本身参数化其他类型**。

简单来说：

1. **普通泛型**：像 `List<T>`，其中 `T` 是具体类型（如 `string`）
2. **高阶类型**：像 `Functor<F>`，其中 `F` 本身是一个类型构造器（如 `List`），需进一步参数化（如 `Functor<List>`）

**Kinds**：描述类型的"阶"

- `*`：具体类型（如 `string`）
- `* -> *`：接受一个类型参数的类型构造器（如 `Array`）
- `(* -> *) -> *`：接受类型构造器作为参数的高阶类型（如 `Monad`）

在支持 HKTs 的语言（如 Haskell）中：

```haskell
class Functor f where
  map :: (a -> b) -> f a -> f b

-- 这里 f 是类型构造器 (如 Maybe, List)
instance Functor Maybe where
  map f (Just x) = Just (f x)
  map _ Nothing  = Nothing
```

## TypeScript 的局限性

尽管 TypeScript 拥有强大的类型系统，但 HKTs 尚未被原生支持，原因如下：

#### 1. **类型参数限制**

- TypeScript 的泛型只能传递**具体类型**（`*`），不能传递**类型构造器**（`* -> *`）。

- 尝试定义高阶接口会失败：

  ```typescript
  interface Functor<F> {
    map<A, B>(fa: F<A>, f: (a: A) => B): F<B>; // 错误！F 不能带参数
  }
  ```

#### 2. **缺乏种类系统**

- TS 没有内建的机制区分 `*`（类型）和 `* -> *`（类型构造器）。
- 所有泛型参数都被视为同一种类，无法约束为类型构造器。