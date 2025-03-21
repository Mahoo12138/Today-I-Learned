---
title: 型变 Variance
---
# 型变 Variance

对于简单类型 `Base` 和 `Child`，如果 `Child` 是 `Base` 的子类，那么 `Child` 的实例可以赋值给 `Base` 类型的变量。这就是多态的基本概念。

在由 `Base` 和 `Child` 组成的复杂类型中，其兼容性取决于 `Base` 和 `Child` 在类似场景中的位置，而这种行为由**型变**决定。

- **协变（Covariant）**：(`co`，即“共同”) —— 只能保持相同方向。
- **逆变（Contravariant）**：(`contra`，即“相反”) —— 只能保持相反方向。
- **双变（Bivariant）**：(`bi`，即“两者皆可”) —— 既可以协变也可以逆变。
- **不变（Invariant）**：如果类型不完全相同，则它们是不兼容的。

## 一个有趣的问题

我们以更为具体的例子来理解，假设有如下三种类型：

> `Greyhound ≼ Dog ≼ Animal`

`Greyhound` （灰狗）是 `Dog` （狗）的子类型，而 `Dog` 则是 `Animal` （动物）的子类型。由于子类型通常是可传递的，因此我们也称 `Greyhound` 是 `Animal` 的子类型。

**问题**：以下哪种类型是 `Dog → Dog` 的子类型呢？

1. `Greyhound → Greyhound`
2. `Greyhound → Animal`
3. `Animal → Animal`
4. `Animal → Greyhound`

让我们来思考一下如何解答这个问题。首先我们假设 `f` 是一个以 `Dog → Dog` 为参数的函数。它的返回值并不重要，为了具体描述问题，我们假设函数结构体是这样的： `f : (Dog → Dog) → String`。

现在我想给函数 `f` 传入某个函数 `g` 来调用。我们来瞧瞧当 `g` 为以上四种类型时，会发生什么情况。

**1. 我们假设 `g : Greyhound → Greyhound`， `f(g)` 的类型是否安全？**

不安全，因为在 f 内调用它的参数`(g)`函数时，使用的参数可能是一个不同于灰狗但又是狗的子类型，例如 `GermanShepherd` （牧羊犬）。

**2. 我们假设 `g : Greyhound → Animal`， `f(g)` 的类型是否安全？**

不安全。理由同(1)。

**3. 我们假设 `g : Animal → Animal`， `f(g)` 的类型是否安全？**

不安全。因为 `f` 有可能在调用完参数之后，让返回值，也就是 `Animal` （动物）狗叫。并非所有动物都会狗叫。

**4. 我们假设 `g : Animal → Greyhound`， `f(g)` 的类型是否安全？**

是的，它的类型是安全的。首先，`f` 可能会以任何狗的品种来作为参数调用，而所有的狗都是动物。其次，它可能会假设结果是一条狗，而所有的灰狗都是狗。

如上所述，我们得出结论：

> `(Animal → Greyhound) ≼ (Dog → Dog)`

返回值类型很容易理解：灰狗是狗的子类型。但参数类型则是相反的：动物是狗的**父类**！

类型安全意味着一个函数类型中，返回值类型是**协变**的，而参数类型是**逆变**的：

+ 返回值类型是协变的，意思是 `A ≼ B` 就意味着 `(T → A) ≼ (T → B)` 。
+ 参数类型是逆变的，意思是 `A ≼ B` 就意味着 `(B → T) ≼ (A → T)`


## 协变 Covariant

 **如果 `Child` 是 `Base` 的子类，那么 `Container<Child>` 也可以被视为 `Container<Base>`（子类型可以赋值给父类型的容器）**

✅ **示例（协变的泛型）：**

```typescript
class Base {}
class Child extends Base {}

class CovariantContainer<out T> {}  // out 代表 T 只能出现在输出位置（返回值）

let baseContainer: CovariantContainer<Base>;
let childContainer: CovariantContainer<Child>;

// 允许：子类的容器可以赋值给父类的容器
baseContainer = childContainer;
```

🔹 **适用场景：** **"读取数据" 的容器**（如 `List<T>` 在 Kotlin、C# 中是协变的）。  

**原因：** 只允许 `T` 出现在 **输出位置（返回值）**，不会涉及写入 `Base` 或 `Child` 的情况，因此不会破坏类型安全。

## 逆变 Contravariant

**如果 `Child` 是 `Base` 的子类，那么 `Processor<Base>` 也可以被视为 `Processor<Child>`（父类型的处理器可以用于子类型）。**

✅ **示例（逆变的泛型）：**

```typescript
class Processor<in T> {  // in 代表 T 只能出现在输入位置（参数）
  process(item: T) {
    console.log("Processing", item);
  }
}

let baseProcessor: Processor<Base> = new Processor<Base>();
let childProcessor: Processor<Child> = new Processor<Child>();

// 允许：父类的处理器可以赋值给子类的处理器
childProcessor = baseProcessor;
```

🔹 **适用场景：** **"处理输入" 的对象**（如 `Comparator<T>` 在 Java 中是逆变的）。  

**原因：** 只允许 `T` 出现在 **输入位置（参数）**，不会产生不兼容的返回值，因此不会破坏类型安全。

## 双变 Bivariant

**`Container<Child>` 既能赋值给 `Container<Base>`，也能反过来赋值（几乎所有方向的赋值都可以，但这通常是不安全的）。**

✅ **示例（TypeScript 里函数参数默认是双变的）：**

```typescript
class BivariantContainer<T> {}

let baseBivariant: BivariantContainer<Base>;
let childBivariant: BivariantContainer<Child>;

// 允许：任意方向的赋值
baseBivariant = childBivariant;
childBivariant = baseBivariant;
```

🔹 **适用场景：** **几乎没有真实需要用到双变的情况，通常是不安全的！**  
**原因：** 允许类型自由转换，可能会导致类型错误，因此大多数语言不会允许泛型参数是双变的。

## 不变 Invariant

**`Container<Base>` 和 `Container<Child>` 互不兼容，不能相互赋值。**

🚫 **示例（不变的泛型）：**

```typescript
class InvariantContainer<T> {}

let baseInvariant: InvariantContainer<Base> = new InvariantContainer<Base>();
let childInvariant: InvariantContainer<Child> = new InvariantContainer<Child>();

// ❌ 不允许：不能把子类的容器赋值给父类的容器
// baseInvariant = childInvariant;  // Type Error!

// ❌ 也不允许反向赋值
// childInvariant = baseInvariant;  // Type Error!
```

🔹 **适用场景：** **需要"既能读取也能写入"的容器**（如 Java 的 `ArrayList<T>` 是不变的）。  

**原因：** 允许 `T` 既出现在输入位置（写入）又出现在输出位置（读取），如果类型不严格匹配，就可能导致类型错误。