```dart
class Utils {
  // 1. 私有构造函数
  Utils._();

  // 2. 静态的单例实例
  static final Utils _instance = Utils._();

  // 3. 工厂构造函数返回单例
  factory Utils() => _instance;
}
```

#### 1. **私有构造函数 (`Utils._();`)**

```dart
Utils._();
```

- **作用**：将类的构造函数声明为私有（`_` 前缀表示私有）。
- **目的**：防止外部通过 `Utils()` 来直接创建新的实例。
- **结果**：类的实例只能通过类内部提供的方法创建。

------

#### 2. **静态的单例实例 (`_instance`)**

```dart
static final Utils _instance = Utils._();
```

- **静态成员**：使用 `static` 关键字，表示 `_instance` 是 `Utils` 类的一个静态属性，属于类本身，而不是某个对象。
- **单例实例**：`final` 确保 `_instance` 只能被赋值一次。在类加载时，`_instance` 被初始化为通过私有构造函数创建的唯一实例 `Utils._()`。
- **目的**：提供一个唯一的、全局可访问的 `Utils` 实例。

------

#### 3. **工厂构造函数 (`factory Utils`)**

```dart
factory Utils() => _instance;
```

- `factory` 关键字：Dart 中，`factory` 构造函数是用来控制对象实例化流程的，它可以返回一个现有实例，而不是创建一个新实例。
- **作用**：`Utils()` 工厂构造函数总是返回静态实例 `_instance`。
- **目的**：确保每次调用 `Utils()` 都返回同一个实例，而不会创建新的对象。
